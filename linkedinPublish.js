// ---------------------------------------------------------------------------
// linkedinPublish.js — actually publishes posts from linkedin-post-composer.html
// to LinkedIn, using LinkedIn's Posts API ("Share on LinkedIn" product,
// scope w_member_social).
//
// A post is only ever published when its owner asked for it:
//   - "Publish automatically" was on when they scheduled it. The composer
//     then sets `autoPublishAt` on the post (equal to its scheduled time);
//     publishScheduledLinkedInPosts picks it up once that time has passed.
//   - Or they clicked "Publish now" (publishLinkedInPostNow).
//
// Supports: text (bold/italic Unicode styling and emojis pass straight
// through, #hashtags become real LinkedIn hashtags), 1 photo, 2–20 photos
// (multi-image post), or 1 video. Photos/videos are read from Firebase
// Storage (where the composer uploads them) and uploaded to LinkedIn.
//
// Post fields this reads/writes (on /linkedinPosts/{postId}):
//   autoPost        true when "Publish automatically" is on
//   autoPublishAt   Timestamp; only present while waiting to publish. A single-
//                   field range query on it needs no composite index.
//   publishState    'queued' | 'publishing' | 'published' | 'failed'
//   publishError    human-readable reason when it failed
//   publishAttempts retry counter for temporary LinkedIn errors
//   linkedinPostUrn / linkedinPostUrl   set once published
//   status          becomes 'posted' (with postedAt) once published
//
// ADD TO index.js:
//   exports.publishScheduledLinkedInPosts = require("./linkedinPublish").publishScheduledLinkedInPosts;
//   exports.publishLinkedInPostNow = require("./linkedinPublish").publishLinkedInPostNow;
//
// Deploy with:
//   firebase deploy --only functions:publishScheduledLinkedInPosts,functions:publishLinkedInPostNow
// No new secrets: the access token comes from linkedinAuth.js's stored connection.
// ---------------------------------------------------------------------------

const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// admin.initializeApp() already runs once from index.js — not repeated here.

const MAX_PER_RUN = 10;          // posts per scheduled run (videos can be slow)
const MAX_ATTEMPTS = 12;         // for temporary LinkedIn errors (429 / 5xx), 2 minutes apart, within the 30-minute window
const RETRY_DELAY_MS = 2 * 60 * 1000;
const MAX_LATE_MS = 30 * 60 * 1000; // a post is never published more than 30 minutes after its time
const VIDEO_READY_TIMEOUT_MS = 3 * 60 * 1000;

// ---------- LinkedIn API helpers ----------

// LinkedIn's versioned REST API needs a "LinkedIn-Version: YYYYMM" header, and
// each version is only kept for about a year. Instead of hard-coding one that
// will eventually be switched off, try recent months (newest first) and
// remember the first one LinkedIn accepts.
let workingVersion = null;
function candidateVersions() {
  const out = [];
  const d = new Date();
  for (let i = 1; i <= 12; i++) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push(`${m.getUTCFullYear()}${String(m.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}
function isVersionError(status, bodyText) {
  return status === 426 || /NONEXISTENT_VERSION|VERSION_MISSING|version.*(not|no longer).*(active|supported)/i.test(bodyText || "");
}
async function linkedinRest(token, path, {method = "GET", body} = {}) {
  const versions = workingVersion ? [workingVersion, ...candidateVersions().filter((v) => v !== workingVersion)] : candidateVersions();
  let last = null;
  for (const version of versions) {
    const res = await fetch(`https://api.linkedin.com/rest/${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "LinkedIn-Version": version,
        "X-Restli-Protocol-Version": "2.0.0",
        ...(body ? {"Content-Type": "application/json"} : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (isVersionError(res.status, text)) { last = {res, text}; continue; }
    workingVersion = version;
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
    return {res, json, text};
  }
  return {res: last.res, json: null, text: last.text};
}

class PublishError extends Error {
  constructor(message, {temporary = false} = {}) {
    super(message);
    this.temporary = temporary;
  }
}
function failFrom(what, res, text) {
  const temporary = res.status === 429 || res.status >= 500;
  if (res.status === 401) return new PublishError("Your LinkedIn connection has expired. Reconnect LinkedIn on the composer page, then try again.");
  if (res.status === 403) return new PublishError("LinkedIn didn't allow this. Reconnect LinkedIn on the composer page so PalaTrack has posting permission.");
  let detail = "";
  try { detail = JSON.parse(text).message || ""; } catch (e) { detail = (text || "").slice(0, 200); }
  return new PublishError(`LinkedIn couldn't ${what}${detail ? `: ${detail}` : ""} (error ${res.status}).`, {temporary});
}

// LinkedIn's post text format treats these characters as markup, so they must
// be escaped to show up literally. #hashtags are turned into real hashtags.
function toLinkedInCommentary(text) {
  const escape = (s) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (ch) => "\\" + ch);
  let out = "";
  let last = 0;
  const re = /(^|[\s(])#([\p{L}\p{N}_]+)/gu;
  let m;
  while ((m = re.exec(text))) {
    const hashStart = m.index + m[1].length;
    out += escape(text.slice(last, hashStart)) + `{hashtag|\\#|${m[2]}}`;
    last = hashStart + 1 + m[2].length;
  }
  return out + escape(text.slice(last));
}

async function downloadFromStorage(path) {
  const [buf] = await admin.storage().bucket().file(path).download();
  return buf;
}

async function uploadImage(token, owner, buffer) {
  const init = await linkedinRest(token, "images?action=initializeUpload", {
    method: "POST",
    body: {initializeUploadRequest: {owner}},
  });
  if (!init.res.ok || !init.json || !init.json.value) throw failFrom("prepare a photo upload", init.res, init.text);
  const {uploadUrl, image} = init.json.value;
  const put = await fetch(uploadUrl, {method: "PUT", headers: {"Authorization": `Bearer ${token}`}, body: buffer});
  if (!put.ok) throw failFrom("upload a photo", put, await put.text());
  return image;
}

// ---------- Carousels (LinkedIn "document" posts) ----------
// A post with {carousel: {on: true, title}} and 2+ photos is published as one PDF: one page per photo, in the
// post's order, every page the size of the first photo (others are fitted inside it, centred on white).
// Needs the pdf-lib package in this functions folder: npm install pdf-lib
async function buildCarouselPdf(buffers) {
  const {PDFDocument, rgb} = require("pdf-lib");
  const pdf = await PDFDocument.create();
  let W = 0, H = 0;
  for (const buf of buffers) {
    const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    const isJpg = buf.length > 3 && buf[0] === 0xFF && buf[1] === 0xD8;
    if (!isPng && !isJpg) continue;                                    // carousels take JPG and PNG
    const img = isPng ? await pdf.embedPng(buf) : await pdf.embedJpg(buf);
    if (!W) { W = img.width; H = img.height; const max = 2400; if (W > max || H > max) { const k = max / Math.max(W, H); W = Math.round(W * k); H = Math.round(H * k); } }
    const page = pdf.addPage([W, H]);
    page.drawRectangle({x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1)});
    const k = Math.min(W / img.width, H / img.height), w = img.width * k, h = img.height * k;
    page.drawImage(img, {x: (W - w) / 2, y: (H - h) / 2, width: w, height: h});
  }
  if (!pdf.getPageCount()) throw new PublishError("This carousel has no JPG or PNG photos. Add JPG or PNG photos, or turn the carousel off.");
  return Buffer.from(await pdf.save());
}

async function uploadDocument(token, owner, buffer) {
  const init = await linkedinRest(token, "documents?action=initializeUpload", {
    method: "POST",
    body: {initializeUploadRequest: {owner}},
  });
  if (!init.res.ok || !init.json || !init.json.value) throw failFrom("prepare the carousel upload", init.res, init.text);
  const {uploadUrl, document} = init.json.value;
  const put = await fetch(uploadUrl, {method: "PUT", headers: {"Authorization": `Bearer ${token}`}, body: buffer});
  if (!put.ok) throw failFrom("upload the carousel", put, await put.text());
  // wait until LinkedIn has processed it (max ~2 minutes), so the post shows the slides right away
  const started = Date.now();
  while (Date.now() - started < 120000) {
    const st = await linkedinRest(token, `documents/${encodeURIComponent(document)}`);
    const status = st.json && st.json.status;
    if (status === "AVAILABLE") break;
    if (status === "PROCESSING_FAILED") throw new PublishError("LinkedIn couldn't process this carousel. Try JPG or PNG slides of the same size.");
    if (!st.res.ok && st.res.status !== 404) break;                      // can't check: try anyway
    await new Promise((r) => setTimeout(r, 4000));
  }
  return document;
}

async function uploadVideo(token, owner, buffer) {
  const init = await linkedinRest(token, "videos?action=initializeUpload", {
    method: "POST",
    body: {initializeUploadRequest: {owner, fileSizeBytes: buffer.length, uploadCaptions: false, uploadThumbnail: false}},
  });
  if (!init.res.ok || !init.json || !init.json.value) throw failFrom("prepare the video upload", init.res, init.text);
  const {video, uploadInstructions, uploadToken} = init.json.value;
  const partIds = [];
  for (const part of uploadInstructions || []) {
    const chunk = buffer.subarray(part.firstByte, part.lastByte + 1);
    const put = await fetch(part.uploadUrl, {method: "PUT", headers: {"Authorization": `Bearer ${token}`}, body: chunk});
    if (!put.ok) throw failFrom("upload the video", put, await put.text());
    partIds.push(put.headers.get("etag"));
  }
  const fin = await linkedinRest(token, "videos?action=finalizeUpload", {
    method: "POST",
    body: {finalizeUploadRequest: {video, uploadToken: uploadToken || "", uploadedPartIds: partIds}},
  });
  if (!fin.res.ok) throw failFrom("finish the video upload", fin.res, fin.text);

  // Wait until LinkedIn has processed the video, so the post shows it right away.
  const started = Date.now();
  while (Date.now() - started < VIDEO_READY_TIMEOUT_MS) {
    const st = await linkedinRest(token, `videos/${encodeURIComponent(video)}`);
    const status = st.json && st.json.status;
    if (status === "AVAILABLE") break;
    if (status === "PROCESSING_FAILED") throw new PublishError("LinkedIn couldn't process this video. Try a different file (MP4 works best).");
    await new Promise((r) => setTimeout(r, 5000));
  }
  return video;
}

// A photo is only usable in a comment once LinkedIn has processed it: wait for "AVAILABLE" (max ~60 s).
async function waitForImage(token, image) {
  const started = Date.now();
  while (Date.now() - started < 60000) {
    const st = await linkedinRest(token, `images/${encodeURIComponent(image)}`);
    const status = st.json && st.json.status;
    if (status === "AVAILABLE") return;
    if (status === "PROCESSING_FAILED") throw new PublishError("LinkedIn couldn't process this photo. Try a JPG or PNG.");
    if (!st.res.ok && st.res.status !== 404) return;                       // can't check: try anyway
    await new Promise((r) => setTimeout(r, 3000));
  }
}

// ---------- Publishing one post ----------

async function publishPost(postRef, post) {
  const db = admin.firestore();
  const uid = post.createdBy;
  const conn = await db.doc(`linkedinConnections/${uid}`).get();
  const tokenDoc = await db.doc(`linkedinConnections/${uid}/private/token`).get();
  if (!conn.exists || !conn.data().linkedinSub || !tokenDoc.exists) {
    throw new PublishError("LinkedIn isn't connected with posting permission. Connect LinkedIn on the composer page, then try again.");
  }
  const {accessToken, expiresAt} = tokenDoc.data();
  if (!accessToken || (expiresAt && expiresAt.toMillis() < Date.now())) {
    throw new PublishError("Your LinkedIn connection has expired (it lasts about 60 days). Reconnect LinkedIn on the composer page, then try again.");
  }
  const owner = `urn:li:person:${conn.data().linkedinSub}`;
  const text = String(post.content || "").replace(/\s+$/, "");
  const media = Array.isArray(post.media) ? post.media.filter((m) => m && m.path) : [];
  if (!text && !media.length) throw new PublishError("This post is empty.");

  let content;
  const video = media.find((m) => m.type === "video");
  const photos = media.filter((m) => m.type === "image");
  const carousel = post.carousel && post.carousel.on && !video && photos.length >= 2;
  if (carousel) {
    const buffers = [];
    for (const m of photos.slice(0, 20)) buffers.push(await downloadFromStorage(m.path));
    const urn = await uploadDocument(accessToken, owner, await buildCarouselPdf(buffers));
    const title = String(post.carousel.title || "").trim() || (text.split("\n").map((x) => x.trim()).find(Boolean) || "Carousel").slice(0, 100);
    content = {media: {title: title.slice(0, 100), id: urn}};
  } else if (video) {
    const urn = await uploadVideo(accessToken, owner, await downloadFromStorage(video.path));
    content = {media: {id: urn}};
  } else if (media.length === 1) {
    const urn = await uploadImage(accessToken, owner, await downloadFromStorage(media[0].path));
    content = {media: {id: urn}};
  } else if (media.length > 1) {
    const images = [];
    for (const m of media.slice(0, 20)) {
      images.push({id: await uploadImage(accessToken, owner, await downloadFromStorage(m.path))});
    }
    content = {multiImage: {images}};
  }

  const body = {
    author: owner,
    commentary: toLinkedInCommentary(text),
    visibility: "PUBLIC",
    distribution: {feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: []},
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
    ...(content ? {content} : {}),
  };
  const created = await linkedinRest(accessToken, "posts", {method: "POST", body});
  if (!created.res.ok) throw failFrom("publish the post", created.res, created.text);
  const urn = created.res.headers.get("x-restli-id") || created.res.headers.get("x-linkedin-id") || "";

  await postRef.update({
    status: "posted",
    postedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishState: "published",
    publishError: admin.firestore.FieldValue.delete(),
    autoPublishAt: admin.firestore.FieldValue.delete(),
    linkedinPostUrn: urn,
    linkedinPostUrl: urn ? `https://www.linkedin.com/feed/update/${urn}/` : "https://www.linkedin.com/in/me/recent-activity/all/",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // The comments under the post (up to 5, each with an optional photo), added in order right after the
  // post goes live. A failure never undoes the publish, and never stops the other comments: the post stays
  // published and the composer shows which comment needs to be added by hand.
  const comments = postComments(post);
  if (comments.length && urn) {
    const states = [];
    for (let i = 0; i < comments.length; i++) {
      const c = comments[i];
      try {
        let image = null, photoError = "";
        if (c.media && c.media.path) {
          try { image = await uploadImage(accessToken, owner, await downloadFromStorage(c.media.path)); await waitForImage(accessToken, image); }
          catch (e) { image = null; photoError = e instanceof PublishError ? e.message : "LinkedIn didn't accept the photo."; console.error("linkedinPublish: comment photo upload failed", e); }
        }
        try { await addFirstComment(accessToken, owner, urn, c.text, image); }
        catch (e) {
          if (!image || !c.text) throw e;
          // the photo was refused in every format: post the text anyway, and keep LinkedIn's own reason
          image = null; photoError = (e instanceof PublishError ? e.message : "LinkedIn didn't accept the photo in this comment.");
          await addFirstComment(accessToken, owner, urn, c.text, null);
        }
        // the text is there; if only the photo is missing, say so (add it by hand)
        states.push(photoError ? {state: "added", photo: "failed", error: photoError + " The text was added; add the photo by hand."} : {state: "added"});
      } catch (err) {
        console.error("linkedinPublish: comment " + (i + 1) + " failed", postRef.path, err);
        states.push({state: "failed", error: err instanceof PublishError ? err.message : "LinkedIn didn't accept the comment."});
      }
      if (i < comments.length - 1) await new Promise((r) => setTimeout(r, 1500));   // in order, one after another
    }
    const up = {commentsState: states, firstCommentState: states[0].state};
    up.firstCommentError = states[0].error ? states[0].error : admin.firestore.FieldValue.delete();
    await postRef.update(up);
  }
  return urn;
}

// The comments to add: post.comments (up to 5: {text, media: {path}}), or the older single post.firstComment.
function postComments(post) {
  let list = Array.isArray(post.comments) && post.comments.length ? post.comments.slice() : (String(post.firstComment || "").trim() ? [{text: post.firstComment}] : []);
  // the tracker's LinkedIn Post page only edits post.firstComment: that text wins for the first comment
  if (list.length && typeof post.firstComment === "string" && String(list[0].text || "").trim() !== post.firstComment.trim()) list[0] = Object.assign({}, list[0], {text: post.firstComment});
  return list.slice(0, 5).map((c) => ({text: String((c && c.text) || "").trim(), media: c && c.media && c.media.path && c.media.type === "image" ? {path: String(c.media.path)} : null}))
    .filter((c) => c.text || c.media);
}

// Comments on a post as its author, with an optional photo (an uploaded image's urn). Tries LinkedIn's
// current (versioned) API first, then the older v2 endpoint (text only), since both are in use.
async function addFirstComment(token, actor, postUrn, text, image) {
  const base = {actor, object: postUrn, message: {text: String(text || "").slice(0, 1250)}};
  const path = `socialActions/${encodeURIComponent(postUrn)}/comments`;
  // a photo can be given in two formats (LinkedIn uses both): the image urn, or the same id as a "digital media asset"
  const asset = image ? String(image).replace(/^urn:li:image:/, "urn:li:digitalmediaAsset:") : "";
  const shapes = image ? [{content: [{entity: {image}}]}, {content: [{entity: {digitalmediaAsset: asset}, type: "IMAGE"}]}] : [{}];
  let firstFail = null;
  for (const shape of shapes) {
    const body = Object.assign({}, base, shape);
    const rest = await linkedinRest(token, path, {method: "POST", body});
    if (rest.res.ok) return;
    if (!firstFail) firstFail = {res: rest.res, text: rest.text};
    const v2 = await fetch(`https://api.linkedin.com/v2/${path}`, {
      method: "POST",
      headers: {"Authorization": `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0"},
      body: JSON.stringify(image && shape.content && shape.content[0].entity.image ? Object.assign({}, base, {content: [{entity: {digitalmediaAsset: asset}, type: "IMAGE"}]}) : body),
    });
    if (v2.ok) return;
    console.error("linkedinPublish: comment refused", JSON.stringify(shape), rest.res.status, (rest.text || "").slice(0, 300), v2.status);
  }
  throw failFrom(image ? "add the photo to this comment" : "add the comment", firstFail.res, firstFail.text);
}

// Claims a post so two runs (or a run and "Publish now") can never publish it twice.
async function claim(postRef, {requireDue}) {
  return admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(postRef);
    if (!snap.exists) return null;
    const post = snap.data();
    if (post.status === "posted" || post.publishState === "publishing" || post.publishState === "published") return null;
    if (requireDue && !(post.autoPublishAt && post.autoPublishAt.toMillis() <= Date.now())) return null;
    tx.update(postRef, {
      publishState: "publishing",
      publishStartedAt: admin.firestore.Timestamp.now(),
      autoPublishAt: admin.firestore.FieldValue.delete(),
      publishError: admin.firestore.FieldValue.delete(),
    });
    return post;
  });
}

// A notification in PalaTrack's bell, also sent by email (the notification emails in taskAutomations.js).
async function notifyAuthor(post, postId, title, body) {
  if (!post || !post.createdBy || !post.workspaceId) return;
  try {
    await admin.firestore().collection("userNotifications").add({
      workspaceId: post.workspaceId, uid: post.createdBy, type: "linkedin_post", read: false, emailPending: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      title, body: body || "", link: `linkedin-post-composer.html?post=${encodeURIComponent(postId)}`,
    });
  } catch (e) { console.error("linkedinPublish: could not send the notification", postId, e); }
}
const snippet = (post) => { const t = String((post && post.content) || "").replace(/\s+/g, " ").trim(); return t.length > 70 ? t.slice(0, 70) + "…" : t; };

async function recordFailure(postRef, post, err) {
  const attempts = (post.publishAttempts || 0) + 1;
  const retry = err instanceof PublishError && err.temporary && attempts < MAX_ATTEMPTS;
  const message = err instanceof PublishError ? err.message : "Something went wrong while publishing. Please try again.";
  if (!(err instanceof PublishError)) console.error("linkedinPublish: unexpected error", postRef.path, err);
  await postRef.update(retry ? {
    publishState: "queued",
    publishAttempts: attempts,
    autoPublishAt: admin.firestore.Timestamp.fromMillis(Date.now() + RETRY_DELAY_MS),
  } : {
    publishState: "failed",
    publishAttempts: attempts,
    publishError: message,
  });
  if (!retry) await notifyAuthor(post, postRef.id, "Your scheduled LinkedIn post didn't go out", `${message}\n\n"${snippet(post)}"\n\nOpen the post to publish it now.`);
  return {retry, message};
}

// ---------- Keeping the queue healthy ----------

// An attempt that got cut off (the server stopped mid-way) would leave a post "publishing" forever:
// after 20 minutes it goes back in the queue and is tried again in the next run.
async function unstick(db) {
  const snap = await db.collection("linkedinPosts").where("publishState", "==", "publishing").limit(20).get();
  const limit = Date.now() - 10 * 60 * 1000;
  for (const d of snap.docs) {
    const p = d.data(), started = p.publishStartedAt || p.updatedAt;
    if (p.status === "posted" || (started && started.toMillis && started.toMillis() > limit)) continue;
    await d.ref.update({publishState: "queued", autoPublishAt: admin.firestore.Timestamp.now()});
    console.warn("linkedinPublish: a cut-off attempt was put back in the queue", d.id);
  }
}

// Once an hour: posts scheduled to publish after the author's LinkedIn connection ends can't go out.
// Warn the author once per post, ahead of time, so they can reconnect.
async function warnBeforeConnectionEnds(db) {
  const snap = await db.collection("linkedinPosts").where("publishState", "==", "queued").limit(200).get();
  const ends = {};
  for (const d of snap.docs) {
    const p = d.data();
    if (!p.autoPublishAt || p.expiryWarnedAt || !p.createdBy) continue;
    if (p.autoPublishAt.toMillis() <= Date.now() + 10 * 60 * 1000) continue;   // due now: publishing it (or the failure message) covers it
    if (!(p.createdBy in ends)) {
      const tok = await db.doc(`linkedinConnections/${p.createdBy}/private/token`).get();
      ends[p.createdBy] = tok.exists && tok.data().expiresAt ? tok.data().expiresAt.toMillis() : 0;
    }
    const end = ends[p.createdBy];
    if (end && end >= p.autoPublishAt.toMillis()) continue;      // still connected when it's due: fine
    const endTxt = end ? new Date(end).toLocaleDateString("en-GB", {day: "numeric", month: "long"}) : "";
    await notifyAuthor(p, d.id, "Reconnect LinkedIn so your scheduled post can go out",
        `${end ? `Your LinkedIn connection ends on ${endTxt}` : "LinkedIn isn't connected"}, before this post is due. Reconnect LinkedIn on the LinkedIn Post page (it then lasts about 60 days).\n\n"${snippet(p)}"`);
    await d.ref.update({expiryWarnedAt: admin.firestore.Timestamp.now()});
  }
}

// Every scheduled post publishes automatically. A scheduled post that isn't in the queue (saved as a reminder, or
// without a publishing time for any reason) is put in it: at its own time, or right away if that has passed.
async function queueEveryDuePost(db) {
  const snap = await db.collection("linkedinPosts").where("status", "==", "scheduled").limit(500).get();
  const now = Date.now();
  for (const d of snap.docs) {
    const p = d.data();
    const at = p.scheduledAt && p.scheduledAt.toMillis ? p.scheduledAt.toMillis() : 0;
    if (!at || at < now - MAX_LATE_MS) continue;                                // too late: never published late
    if (p.autoPublishAt) continue;                                              // already in the queue
    if (["publishing", "published", "failed"].includes(p.publishState)) continue; // being published, done, or already reported
    // in the queue at its own time (or right now, if that has passed)
    await d.ref.update({autoPost: true, autoPublishAt: admin.firestore.Timestamp.fromMillis(Math.max(at, now)), publishState: "queued",
      remindByEmail: false, reminderAt: admin.firestore.FieldValue.delete()});
    console.log("linkedinPublish: a scheduled post that wasn't queued was queued", d.id);
  }
}

// ---------- Scheduled run: publish everything that's due ----------

// Shared with linkedinAnalytics.js.
exports.linkedinRest = linkedinRest;

exports.publishScheduledLinkedInPosts = onSchedule(
    {schedule: "every 1 minutes", timeoutSeconds: 540, memory: "1GiB"},
    async () => {
      const db = admin.firestore();
      await unstick(db);
      await queueEveryDuePost(db);
      try { if (new Date().getUTCMinutes() < 5) await warnBeforeConnectionEnds(db); } catch (e) { console.error("linkedinPublish: connection check failed", e); }
      const due = await db.collection("linkedinPosts")
          .where("autoPublishAt", "<=", admin.firestore.Timestamp.now())
          .limit(MAX_PER_RUN)
          .get();
      for (const doc of due.docs) {
        const d = doc.data(), at = d.scheduledAt && d.scheduledAt.toMillis ? d.scheduledAt.toMillis() : 0;
        if (at && at < Date.now() - MAX_LATE_MS && d.status !== "posted") {
          await doc.ref.update({publishState: "failed", autoPublishAt: admin.firestore.FieldValue.delete(),
            publishError: "It couldn't be published within 30 minutes of its scheduled time, so it wasn't posted late."});
          await notifyAuthor(d, doc.id, "Your scheduled LinkedIn post didn't go out",
              `It couldn't be published within 30 minutes of its time, so it wasn't posted late.${d.publishError ? " LinkedIn said: " + d.publishError : ""}\n\n"${snippet(d)}"\n\nOpen the post to publish it now.`);
          continue;
        }
        const post = await claim(doc.ref, {requireDue: true});
        if (!post) continue;
        try {
          await publishPost(doc.ref, post);
        } catch (err) {
          await recordFailure(doc.ref, post, err);
        }
      }
    },
);

// ---------- "Publish now" / "Try again" from the composer ----------

exports.publishLinkedInPostNow = onCall(
    {timeoutSeconds: 540, memory: "1GiB"},
    async (request) => {
      if (!request.auth) throw new HttpsError("unauthenticated", "You must be signed in.");
      const postId = request.data && request.data.postId;
      if (!postId || typeof postId !== "string") throw new HttpsError("invalid-argument", "Missing post.");
      const postRef = admin.firestore().doc(`linkedinPosts/${postId}`);
      const snap = await postRef.get();
      if (!snap.exists) throw new HttpsError("not-found", "That post no longer exists.");
      if (snap.data().createdBy !== request.auth.uid) throw new HttpsError("permission-denied", "That isn't your post.");
      if (snap.data().status === "posted") throw new HttpsError("failed-precondition", "This post has already been published.");

      const post = await claim(postRef, {requireDue: false});
      if (!post) throw new HttpsError("failed-precondition", "This post is already being published.");
      try {
        await publishPost(postRef, post);
        const fresh = (await postRef.get()).data();
        return {success: true, url: fresh.linkedinPostUrl || null};
      } catch (err) {
        // "Publish now" doesn't retry in the background — the user sees the reason right away.
        const message = err instanceof PublishError ? err.message : "Something went wrong while publishing. Please try again.";
        if (!(err instanceof PublishError)) console.error("publishLinkedInPostNow: unexpected error", postRef.path, err);
        await postRef.update({publishState: "failed", publishError: message});
        throw new HttpsError("aborted", message);
      }
    },
);
