/* =====================================================================
   beats.js  —  builds the "All beats" page from the BEATS list in config.js
   You normally DON'T need to edit this file.
   ===================================================================== */

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const list = $("#list"), chips = $("#tagChips"), audio = new Audio();
let current = -1, activeTag = "All";

const mmss = s => isFinite(s) && s > 0 ? String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "—";
const SHARE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';


/* ---------- 1. TAG FILTER ----------------------------------------------- */
const allTags = [...new Set(BEATS.flatMap(b => b.tags || []))];
if (allTags.length) {
  chips.innerHTML = ["All", ...allTags].map((t, i) => `<button class="chip${i ? "" : " on"}" data-t="${t}">${t}</button>`).join("");
} else chips.hidden = true;

function applyTag(t) {
  activeTag = t;
  $$("#tagChips .chip").forEach(c => c.classList.toggle("on", c.dataset.t === t));
  let n = 0;
  $$(".bl-row").forEach(r => {
    const ok = t === "All" || (BEATS[r.dataset.i].tags || []).includes(t);
    r.hidden = !ok; if (ok) n++;
  });
  $("#count").textContent = "(" + n + ")";
  $("#empty").hidden = n > 0;
}
chips.onclick = e => { const c = e.target.closest(".chip"); if (c) applyTag(c.dataset.t); };


/* ---------- 2. BUILD THE LIST ------------------------------------------- */
list.innerHTML = BEATS.map((b, i) => `
  <article class="bl-row" data-i="${i}">
    <button class="bl-cov" aria-label="${b.audio ? "Play preview" : "Listen"}: ${b.title}"
            style="background:linear-gradient(135deg,${b.colors[0]},${b.colors[1]})">
      ${b.cover ? `<img src="${b.cover}" alt="">` : ""}<span class="bl-play">▶</span>
    </button>
    <div class="bl-t"><h3>${b.title}</h3><small>${b.genre} Type Beat</small></div>
    <div class="bl-meta"><span class="bl-time">${b.time || "—"}</span><span>${b.bpm}</span><span>${b.key}</span></div>
    <div class="bl-tags">${(b.tags || []).map(t => `<button class="bl-tag" data-t="${t}">${t}</button>`).join("")}</div>
    <div class="bl-act">
      <button class="bl-share" aria-label="Share ${b.title}">${SHARE_ICON}</button>
      <a class="btn y" href="${b.youtube || YOUTUBE_CHANNEL}" target="_blank" rel="noopener">YouTube ↗</a>
      <a class="btn p" href="${b.beatstars || BEATSTARS_STORE}" target="_blank" rel="noopener">49.99€ ↗</a>
    </div>
    <div class="bl-prog"><i></i></div>
  </article>`).join("");
$("#count").textContent = "(" + BEATS.length + ")";

// duration: from "time" in config.js, or read from the audio file
BEATS.forEach((b, i) => {
  if (b.time || !b.audio) return;
  const a = new Audio(); a.preload = "metadata"; a.src = b.audio;
  a.onloadedmetadata = () => { const el = list.querySelector(`.bl-row[data-i="${i}"] .bl-time`); if (el) el.textContent = mmss(a.duration); };
});


/* ---------- 3. CLICKS: play, share, tags -------------------------------- */
list.addEventListener("click", async e => {
  const row = e.target.closest(".bl-row"); if (!row) return;
  const i = +row.dataset.i, b = BEATS[i];

  if (e.target.closest(".bl-cov")) {
    if (!b.audio) { window.open(b.youtube || YOUTUBE_CHANNEL, "_blank", "noopener"); return; }   // no preview file: open the video
    if (current === i) { audio.paused ? audio.play() : audio.pause(); return; }
    current = i; audio.src = b.audio; audio.play().catch(() => {});
  }
  const tag = e.target.closest(".bl-tag"); if (tag) applyTag(tag.dataset.t);

  const sh = e.target.closest(".bl-share");
  if (sh) {
    const url = b.beatstars || b.youtube || location.href;
    try {
      if (navigator.share) await navigator.share({ title: b.title, url });
      else { await navigator.clipboard.writeText(url); sh.classList.add("ok"); sh.title = "Link copied"; setTimeout(() => { sh.classList.remove("ok"); sh.title = ""; }, 1800); }
    } catch (_) {}
  }
});

function sync() {
  $$(".bl-row").forEach(r => {
    const live = +r.dataset.i === current && !audio.paused;
    r.classList.toggle("live", live);
    r.querySelector(".bl-play").textContent = live ? "❚❚" : "▶";
  });
}
audio.addEventListener("play", sync);
audio.addEventListener("pause", sync);
audio.addEventListener("ended", () => { sync(); const p = list.querySelector(`.bl-row[data-i="${current}"] .bl-prog i`); if (p) p.style.width = "0"; });
audio.addEventListener("timeupdate", () => {
  const p = list.querySelector(`.bl-row[data-i="${current}"] .bl-prog i`);
  if (p && audio.duration) p.style.width = audio.currentTime / audio.duration * 100 + "%";
});


/* ---------- 4. MOBILE MENU ---------------------------------------------- */
$("#bg").onclick = () => $("#nav").classList.toggle("open");
$$("#nav a").forEach(a => a.onclick = () => $("#nav").classList.remove("open"));

/* ---------- 5. BOTTOM PLAYER WITH WAVEFORM (opens when you play a beat) --
   Slides up from the bottom with the beat cover (blurred) as background,
   a SoundCloud-style waveform and free selection of the part to hear:
   click or drag on the waveform. Needs the beat to have "audio" in
   config.js. The waveform is read from the real audio file when the site
   is online; otherwise a decorative waveform is shown.                    */
(function () {
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";

  /* ----- build the player (no HTML edit needed) ----- */
  const el = document.createElement("div");
  el.className = "bpl";
  el.setAttribute("role", "region");
  el.setAttribute("aria-label", "Player");
  el.innerHTML = `
    <div class="bpl-bg"></div>
    <div class="bpl-in">
      <div class="bpl-cov"></div>
      <div class="bpl-mid">
        <div class="bpl-head"><strong class="bpl-t"></strong><small class="bpl-g"></small></div>
        <div class="bpl-wave" role="slider" tabindex="0" aria-label="Choose the part to listen to" aria-valuemin="0" aria-valuemax="100">
          <canvas></canvas><span class="bpl-tip"></span>
        </div>
        <div class="bpl-time"><span class="bpl-now">0:00</span><span class="bpl-tot">0:00</span></div>
      </div>
      <div class="bpl-ctl">
        <button class="bpl-play" aria-label="Play or pause">❚❚</button>
        <a class="btn p bpl-buy" target="_blank" rel="noopener">BeatStars ↗</a>
        <button class="bpl-x" aria-label="Close player">✕</button>
      </div>
    </div>`;
  document.body.appendChild(el);

  const q = s => el.querySelector(s);
  const bg = q(".bpl-bg"), cov = q(".bpl-cov"), wave = q(".bpl-wave"), cv = q("canvas"), g = cv.getContext("2d");
  const tip = q(".bpl-tip"), now = q(".bpl-now"), tot = q(".bpl-tot"), playBtn = q(".bpl-play");
  let peaks = null, dragP = null, hoverP = null, openIdx = -1, raf = 0;
  const cache = {};

  /* ----- waveform data ----- */
  function fakePeaks(seed, N) {                       // decorative waveform, always the same for the same title
    let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
    const rnd = () => { h |= 0; h = h + 0x6D2B79F5 | 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    let prev = .5;
    return Array.from({ length: N }, (_, k) => { prev = prev * .6 + rnd() * .4; return .25 + .75 * Math.pow(Math.min(1, prev * 1.6), 1.2) * (.7 + .3 * Math.sin(k / N * Math.PI)); });
  }
  async function loadPeaks(i) {
    if (cache[i]) return cache[i];
    const N = 480; let out;
    try {
      const buf = await (await fetch(BEATS[i].audio)).arrayBuffer();
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const ab = await ctx.decodeAudioData(buf); if (ctx.close) ctx.close();
      const ch = ab.getChannelData(0), step = Math.floor(ch.length / N) || 1, stride = Math.max(1, Math.floor(step / 60));
      out = [];
      for (let k = 0; k < N; k++) { let s = 0, c = 0; for (let j = k * step; j < (k + 1) * step && j < ch.length; j += stride) { s += Math.abs(ch[j]); c++; } out.push(c ? s / c : 0); }
      const m = Math.max(...out) || 1; out = out.map(v => Math.pow(v / m, .75));
    } catch (_) { out = fakePeaks(BEATS[i].title, N); }
    return cache[i] = out;
  }

  /* ----- drawing ----- */
  function size() { const r = cv.getBoundingClientRect(), d = devicePixelRatio || 1; cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); }
  function draw() {
    const W = cv.width, H = cv.height, d = devicePixelRatio || 1;
    g.clearRect(0, 0, W, H);
    if (!peaks) return;
    const bw = 3 * d, gap = 2 * d, n = Math.max(1, Math.floor(W / (bw + gap)));
    const p = dragP != null ? dragP : (audio.duration ? audio.currentTime / audio.duration : 0);
    const top = H * .68, ref = H - top;
    for (let k = 0; k < n; k++) {
      const a = Math.floor(k / n * peaks.length), b = Math.max(a + 1, Math.floor((k + 1) / n * peaks.length));
      let v = 0; for (let j = a; j < b; j++) v = Math.max(v, peaks[j]);
      const h = Math.max(2 * d, v * top), x = k * (bw + gap), mid = (k + .5) / n;
      const played = mid <= p, hov = hoverP != null && mid <= hoverP;
      g.fillStyle = played ? "#fff" : hov ? "rgba(255,255,255,.65)" : "rgba(255,255,255,.35)";
      g.fillRect(x, top - h, bw, h);                                          // bar
      g.fillStyle = played ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.15)";
      g.fillRect(x, top, bw, Math.min(h * .5, ref));                          // soft reflection
    }
  }
  function loop() {
    if (!el.classList.contains("show")) { raf = 0; return; }
    playBtn.textContent = audio.paused ? "▶" : "❚❚";
    now.textContent = fmt(dragP != null ? dragP * audio.duration : audio.currentTime);
    tot.textContent = fmt(audio.duration);
    wave.setAttribute("aria-valuenow", Math.round((audio.duration ? audio.currentTime / audio.duration : 0) * 100));
    draw(); raf = requestAnimationFrame(loop);
  }

  /* ----- open / close ----- */
  function open(i) {
    const b = BEATS[i]; openIdx = i; peaks = null;
    const art = b.cover ? `url("${b.cover}")` : `linear-gradient(135deg,${b.colors[0]},${b.colors[1]})`;
    bg.style.backgroundImage = art; cov.style.backgroundImage = art;           // blurred background + small cover
    q(".bpl-t").textContent = b.title; q(".bpl-g").textContent = b.genre + " Type Beat";
    q(".bpl-buy").href = b.beatstars || BEATSTARS_STORE;
    el.classList.add("show"); document.body.classList.add("has-player");
    size(); loadPeaks(i).then(p => { if (openIdx === i) peaks = p; });
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function close() {
    el.classList.remove("show"); document.body.classList.remove("has-player");
    audio.pause(); current = -1; openIdx = -1; sync();
    $$(".bl-prog i").forEach(i => i.style.width = "0");
  }
  q(".bpl-x").onclick = close;
  playBtn.onclick = () => audio.paused ? audio.play() : audio.pause();
  addEventListener("keydown", e => { if (e.key === "Escape" && el.classList.contains("show")) close(); });
  addEventListener("resize", size);

  /* ----- choose the part: click or drag on the waveform ----- */
  const posP = e => { const r = wave.getBoundingClientRect(); return Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1); };
  const showTip = e => { const p = posP(e); hoverP = p; tip.textContent = fmt(p * audio.duration); tip.style.left = p * 100 + "%"; };
  wave.addEventListener("pointerdown", e => { if (!isFinite(audio.duration)) return; dragP = posP(e); wave.setPointerCapture(e.pointerId); wave.classList.add("drag"); e.preventDefault(); });
  wave.addEventListener("pointermove", e => { if (dragP != null) dragP = posP(e); if (e.pointerType === "mouse" || dragP != null) showTip(e); });
  wave.addEventListener("pointerleave", () => { if (dragP == null) hoverP = null; });
  const end = () => { if (dragP == null) return; audio.currentTime = dragP * audio.duration; dragP = null; hoverP = null; wave.classList.remove("drag"); };
  wave.addEventListener("pointerup", end);
  wave.addEventListener("pointercancel", () => { dragP = null; hoverP = null; wave.classList.remove("drag"); });
  wave.addEventListener("keydown", e => {
    if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || !isFinite(audio.duration)) return;
    e.preventDefault(); audio.currentTime = Math.min(Math.max(audio.currentTime + (e.key === "ArrowRight" ? 1 : -1) * audio.duration * .05, 0), audio.duration);
  });

  /* ----- when a beat starts, open the player ----- */
  list.addEventListener("click", e => {
    if (!e.target.closest(".bl-cov")) return;
    if (current >= 0 && BEATS[current].audio && current !== openIdx) open(current);
  });
  // clicking anywhere on a row (not on its buttons or links) also plays it
  list.addEventListener("click", e => {
    const row = e.target.closest(".bl-row");
    if (row && !e.target.closest("a, button")) row.querySelector(".bl-cov").click();
  });
})();

/* ---------- 6. BANNER UNDER THE TITLE (beats page) ---------------------
   A slim, minimal banner. By default it promotes the Beat of the Week.
   To change the text or link, add BEATS_BANNER to config.js (see below),
   or set enabled: false to hide it.                                       */
(function () {
  const botw = typeof BEAT_OF_THE_WEEK !== "undefined" ? BEAT_OF_THE_WEEK : null;
  const cfg = Object.assign({
    enabled:  true,
    label:    "Beat of the Week",
    text:     "A new pick every week, discounted on BeatStars.",
    badge:    botw ? "−" + botw.discount + "%" : "",
    linkText: "See it",
    link:     botw ? botw.beatstars : BEATSTARS_STORE
  }, typeof BEATS_BANNER !== "undefined" ? BEATS_BANNER : {});
  if (!cfg.enabled) return;

  const a = document.createElement("a");
  a.className = "bn";
  a.href = cfg.link;
  if (/^https?:/.test(cfg.link)) { a.target = "_blank"; a.rel = "noopener"; }
  a.innerHTML =
    `<span class="bn-dot" aria-hidden="true"></span>` +
    `<span class="bn-lab">${cfg.label}</span>` +
    (cfg.badge ? `<span class="bn-badge">${cfg.badge}</span>` : "") +
    `<span class="bn-txt">${cfg.text}</span>` +
    `<span class="bn-go">${cfg.linkText} <b aria-hidden="true">→</b></span>`;
  $(".bp .sh").after(a);
})();

/* ---------- 7. BEATS LIST: CASCADE ENTRANCE + HOVER FLASH --------------
   Gives each row its position (for the cascade delay) and tells the CSS
   where the mouse entered the row (the white flash starts there).          */
$$(".bl-row").forEach((r, i) => r.style.setProperty("--i", i));
list.addEventListener("pointerover", e => {
  const r = e.target.closest(".bl-row");
  if (!r || r.contains(e.relatedTarget)) return;
  const b = r.getBoundingClientRect();
  r.style.setProperty("--mx", (e.clientX - b.left) / b.width * 100 + "%");
});