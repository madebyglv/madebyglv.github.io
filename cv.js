/* =====================================================================
   cv.js  —  unlocks the encrypted CV (cv.enc) with the password typed by
   the visitor. Everything happens in the browser: the password is never
   sent anywhere and it is NOT written in any file of the site.
   ===================================================================== */

const ENC_FILE = "cv.enc";                 // the encrypted CV made with encrypt-cv.html
const $ = s => document.querySelector(s);

const pw = $("#pw"), go = $("#go"), msg = $("#msg");
let blobUrl = null;

// file format: "GLV1" | iterations (4 bytes) | salt (16) | iv (12) | AES-GCM data
async function decrypt(buf, password) {
  const u = new Uint8Array(buf), dv = new DataView(buf);
  if (String.fromCharCode(...u.slice(0, 4)) !== "GLV1") throw new Error("format");
  const iterations = dv.getUint32(4), salt = u.slice(8, 24), iv = u.slice(24, 36), data = u.slice(36);
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data));   // wrong password -> error
  const n = new DataView(plain.buffer).getUint16(0);
  return { name: new TextDecoder().decode(plain.slice(2, 2 + n)), bytes: plain.slice(2 + n) };
}

async function unlock() {
  if (!pw.value) { msg.textContent = "Please enter the password."; pw.focus(); return; }
  go.disabled = true; msg.textContent = "Unlocking…"; msg.className = "cv-msg";
  let buf;
  try {
    const r = await fetch(ENC_FILE, { cache: "no-store" });
    if (!r.ok) throw new Error("missing");
    buf = await r.arrayBuffer();
  } catch (_) {
    msg.textContent = "The CV is not available right now. Please write to me by email."; msg.className = "cv-msg err"; go.disabled = false; return;
  }
  try {
    const { name, bytes } = await decrypt(buf, pw.value);
    const pdf = /\.pdf$/i.test(name);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = URL.createObjectURL(new Blob([bytes], { type: pdf ? "application/pdf" : "application/octet-stream" }));
    $("#dl").href = blobUrl; $("#dl").download = name;
    $("#view").href = blobUrl; $("#view").hidden = !pdf;
    pw.value = "";
    $("#lock").hidden = true; $("#done").hidden = false;
  } catch (_) {
    msg.textContent = "Wrong password."; msg.className = "cv-msg err";
    pw.classList.remove("shake"); void pw.offsetWidth; pw.classList.add("shake"); pw.select();
  }
  go.disabled = false;
}
go.onclick = unlock;
pw.addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });
addEventListener("pagehide", () => { if (blobUrl) URL.revokeObjectURL(blobUrl); });

/* mobile menu */
$("#bg").onclick = () => $("#nav").classList.toggle("open");
document.querySelectorAll("#nav a").forEach(a => a.onclick = () => $("#nav").classList.remove("open"));
