/* =====================================================================
   script.js  —  how the site behaves. You normally DON'T need to edit it.
   Your content lives in config.js.
   ===================================================================== */

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;


/* ---------- 1. BUILD CONTENT FROM config.js --------------------------- */

// Email links
$$("[data-email]").forEach(a => {
  a.href = "mailto:" + EMAIL;
  if (a.dataset.email === "text") a.innerHTML = EMAIL.replace("@", "<wbr>@");
});

// Beat of the Week
const bc = $("#bwc");
bc.style.background = `linear-gradient(135deg,${BEAT_OF_THE_WEEK.colors[0]},${BEAT_OF_THE_WEEK.colors[1]})`;
bc.innerHTML = BEAT_OF_THE_WEEK.cover ? `<img src="${BEAT_OF_THE_WEEK.cover}" alt="">` : "✦";
$("#bwt").textContent = BEAT_OF_THE_WEEK.title;
$("#bwm").textContent = BEAT_OF_THE_WEEK.text;
$("#bwd").innerHTML = `<span class="n">−${BEAT_OF_THE_WEEK.discount}%</span><span class="o" aria-hidden="true">OFF</span>`;
$("#bwb").href = BEAT_OF_THE_WEEK.beatstars;
$("#bwy").href = BEAT_OF_THE_WEEK.youtube;

// Beats
$("#beatGrid").innerHTML = BEATS.map((b, i) => `
  <article class="card rv" data-i="${i}">
    <div class="wt"><span>track_0${i + 1}</span><b><i></i><i></i></b></div>
    <div class="cover" role="button" tabindex="0" aria-label="Play preview: ${b.title}" data-cur="PLAY"
         style="background:linear-gradient(135deg,${b.colors[0]},${b.colors[1]})">
      ${b.cover ? `<img src="${b.cover}" alt="${b.title}">` : `<em>0${i + 1}</em>`}
      <span class="num">${b.bpm} BPM · ${b.key}</span>
      <button class="play" aria-label="Preview">▶</button>
      <div class="eq"><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="info">
      <h3>${b.title}</h3>
      <div class="meta">${b.genre} Type Beat</div>
      <div class="links">
        <a class="btn p" href="${b.youtube}" target="_blank" rel="noopener">YouTube ↗</a>
        <a class="btn" href="${b.beatstars}" target="_blank" rel="noopener">BeatStars ↗</a>
      </div>
    </div>
  </article>`).join("");

$("#beatGrid").insertAdjacentHTML("beforeend", `
  <article class="card rv more"><div><small>More beats</small><div class="links">
    <a class="btn p" href="${YOUTUBE_CHANNEL}" target="_blank" rel="noopener">YouTube ↗</a>
    <a class="btn" href="${BEATSTARS_STORE}" target="_blank" rel="noopener">BeatStars ↗</a>
  </div></div></article>`);

// Artwork (spread over 3 columns)
const artCard = (a, i) => `
  <div class="pc" data-cur="VIEW">
    <div class="ph" style="background:linear-gradient(${135 + i * 25}deg,${a.colors[0]},${a.colors[1]})">
      ${a.img ? `<img src="${a.img}" alt="">` : ""}<span>Cover 0${i + 1}</span>
    </div>
  </div>`;
$("#artGrid").insertAdjacentHTML("afterbegin", [0, 1, 2].map(c =>
  `<div class="col">${ARTWORK.map((a, i) => i % 3 === c ? artCard(a, i) : "").join("")}</div>`).join(""));

// News
$("#newsList").innerHTML = NEWS.map(n => `
  <a class="row rv" href="#news" data-cur="READ">
    <time>${n.date}</time><div><h3>${n.title}</h3><p>${n.text}</p></div><b>→</b>
  </a>`).join("");

// Scrolling words
$("#mq").innerHTML = MARQUEE.map(w => `${w}<b>✦</b>`).join("").repeat(6);


/* ---------- 2. HERO BACKGROUND VIDEO (your own .mp4) ------------------ */
const video = $("#bgv");
if (VIDEO_SRC) {
  if (reduceMotion) video.removeAttribute("autoplay");   // respect "reduce motion"
  video.src = VIDEO_SRC;
  video.classList.add("on");
}


/* ---------- 3. MUSIC PLAYER (mini bar at the bottom) ------------------- */
const audio = new Audio(), bar = $("#mp");
let current = -1, playing = false, progress = 0, timer;

function setPlaying(on) {
  playing = on;
  $("#mpb").textContent = on ? "❚❚" : "▶";
  $$(".card[data-i]").forEach(k => {
    const live = on && +k.dataset.i === current;
    k.classList.toggle("live", live);
    k.querySelector(".play").textContent = live ? "❚❚" : "▶";
  });
  clearInterval(timer);
  if (!on) { audio.pause(); return; }
  const b = BEATS[current];
  if (b.audio) {
    if (!audio.src.endsWith(b.audio)) audio.src = b.audio;
    audio.play().catch(() => {});
    timer = setInterval(() => { $("#mpi").style.width = audio.currentTime / (audio.duration || 1) * 100 + "%"; }, 200);
  } else {   // no audio file: animated bar only
    timer = setInterval(() => { progress = (progress + .35) % 100; $("#mpi").style.width = progress + "%"; }, 100);
  }
}
function pick(i) {
  if (i === current) { setPlaying(!playing); return; }
  current = i; progress = 0;
  $("#mpt").textContent = BEATS[i].title + " — " + BEATS[i].genre + " Type Beat";
  $("#mpl").href = BEATS[i].beatstars;
  bar.classList.add("show");
  setPlaying(true);
}
$("#beatGrid").onclick   = e => { const c = e.target.closest(".cover"); if (c) pick(+c.parentElement.dataset.i); };
$("#beatGrid").onkeydown = e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("cover")) { e.preventDefault(); pick(+e.target.parentElement.dataset.i); }
};
$("#mpb").onclick = () => current >= 0 && setPlaying(!playing);


/* ---------- 4. SCROLL EFFECTS ----------------------------------------- */

// Fade-in of sections
const reveal = new IntersectionObserver(entries => entries.forEach(x => {
  if (x.isIntersecting) {
    x.target.classList.add("in");
    x.target.addEventListener("transitionend", () => x.target.style.transitionDelay = "", { once: true });
    reveal.unobserve(x.target);
  }
}), { threshold: .1 });
$$(".rv").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + "ms"; reveal.observe(el); });

// Hero: video fades out and title moves while scrolling
const shade = $("#shade"), title = $("h1"), heroText = $("#hw");
function onScroll() {
  const y = scrollY, p = Math.min(y / (innerHeight * .85), 1);
  $(".vid").style.opacity = 1 - p;
  shade.style.opacity = .55 + p * .45;
  if (!reduceMotion) {
    title.style.transform = `translateY(${y * .22}px) scale(${1 - p * .08})`;
    heroText.style.opacity = 1 - p * 1.1;
  }
}
addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
onScroll();

// Artwork: covers "drop" down with the mouse wheel (smooth), then stop
const artSection = $("#artwork"), columns = $$(".col"), artBar = $("#pg");
let shown = 0, running = false;
function drop() {
  const r = artSection.getBoundingClientRect(), total = artSection.offsetHeight - innerHeight;
  const goal = reduceMotion ? 1 : Math.min(Math.max(-r.top / total, 0) / .78, 1);
  shown += (goal - shown) * (reduceMotion ? 1 : .075);
  const h = columns[0].parentElement.clientHeight, speeds = [1.15, 1.7, 2.3];
  columns.forEach((c, i) => c.style.transform = `translateY(${(1 - shown) * h * speeds[i]}px)`);
  artBar.style.height = shown * 100 + "%";
  if (Math.abs(goal - shown) > .0005) requestAnimationFrame(drop); else running = false;
}
addEventListener("scroll", () => { if (!running) { running = true; requestAnimationFrame(drop); } }, { passive: true });
running = true; drop();


/* ---------- 5. CURSOR LABEL + COVER TILT (mouse only) ------------------ */
const cursor = $("#cur");
addEventListener("pointermove", e => {
  cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  const t = e.target.closest("[data-cur]");
  if (t) {
    cursor.classList.add("big2");
    cursor.textContent = t.classList.contains("cover") && playing && t.parentElement.classList.contains("live") ? "PAUSE" : t.dataset.cur;
  } else { cursor.classList.remove("big2"); cursor.textContent = ""; }

  if (e.pointerType !== "mouse" || reduceMotion) return;
  $$(".cover").forEach(x => x.style.transform = "");
  const c = e.target.closest(".cover");
  if (c) {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
  }
});


/* ---------- 6. CONTACT PANEL IN THE FOOTER ---------------------------- */
let topic = "Beat license";
const msg = $("#fm"), send = $("#fs");
const updateMail = () => { send.href = `mailto:${EMAIL}?subject=${encodeURIComponent("[prodGLV] " + topic)}&body=${encodeURIComponent(msg.value)}`; };
$("#fb").onclick = () => {
  const open = $("#fp").classList.toggle("open");
  $("#fb").setAttribute("aria-expanded", open);
  if (open) setTimeout(() => scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 300);
};
$("#fch").onclick = e => {
  const c = e.target.closest(".chip"); if (!c) return;
  $$("#fch .chip").forEach(x => x.classList.toggle("on", x === c));
  topic = c.textContent; updateMail();
};
msg.oninput = updateMail; updateMail();
$("#fc2").onclick = async e => {
  try { await navigator.clipboard.writeText(EMAIL); e.target.textContent = "Copied ✓"; } catch (_) { e.target.textContent = EMAIL; }
  setTimeout(() => e.target.textContent = "Copy email", 2000);
};


/* ---------- 7. PRIVACY / COOKIE PAGES  (#privacy, #cookies) ------------ */
const pages = $$(".v");
function route() {
  let open = false;
  pages.forEach(p => { const on = "#" + p.id.slice(2) === location.hash; p.classList.toggle("open", on); open = open || on; if (on) p.scrollTop = 0; });
  document.body.style.overflow = open ? "hidden" : "";
}
addEventListener("hashchange", route); route();
$$("[data-close]").forEach(a => a.onclick = e => { e.preventDefault(); history.replaceState(null, "", location.pathname + location.search); route(); });
addEventListener("keydown", e => { if (e.key === "Escape" && document.body.style.overflow === "hidden") $("[data-close]").click(); });


/* ---------- 8. MOBILE MENU -------------------------------------------- */
$("#bg").onclick = () => $("#nav").classList.toggle("open");
$$("#nav a").forEach(a => a.onclick = () => $("#nav").classList.remove("open"));

/* ---------- 9. AUDIO-REACTIVE EQUALIZER (v2) ---------------------------
   The bars on the beat cover follow the real music.
   Needs real audio files in config.js ("audio: ...") and the site ONLINE
   (or on a local server, e.g. VS Code "Live Server"). If the effect is
   off, the browser console (F12) says why.                                 */
const REACTIVE = {
  enabled:   true,
  bars:      10,        // number of bars on the cover
  maxHeight: 40,        // tallest bar in px
  bassBins:  [2, 5],    // frequencies that drive the glow (kick, 808)
  topBin:    180,       // highest frequency used by the bars
  punch:     1.1,       // higher = only strong hits make the glow pulse
  gain:      1.1        // bar sensitivity: lower if bars stay maxed out, higher if too small
};

let actx, analyser, freq, rafId = 0;
const sameOrigin = BEATS.every(b => !b.audio || new URL(b.audio, location.href).origin === location.origin);
const offReason =
  !REACTIVE.enabled                      ? "disabled in REACTIVE" :
  reduceMotion                           ? "'reduce motion' is on in your system" :
  !/^https?:$/.test(location.protocol)   ? "open the site online or with Live Server, not by double-click" :
  !sameOrigin                            ? "audio files must be inside your site folder" :
  !BEATS.some(b => b.audio)              ? "no audio file set in config.js" : "";
const canReact = !offReason;
if (offReason) console.info("[prodGLV] bars are not reactive:", offReason);

// build the bars (log-spaced frequency ranges: bass on the left, highs on the right)
$$(".eq").forEach(e => {
  e.innerHTML = "<i></i>".repeat(REACTIVE.bars);
  e.style.height = REACTIVE.maxHeight + "px";
  [...e.children].forEach((b, i) => b.style.animationDelay = (i * .07) % .6 + "s");
});
const edges  = Array.from({ length: REACTIVE.bars + 1 }, (_, i) => Math.round(Math.pow(REACTIVE.topBin, i / REACTIVE.bars)));
const ranges = edges.slice(0, -1).map((a, i) => [a, Math.max(a, edges[i + 1])]);

// starts the analyser on the first click (browsers require a click)
function unlockAudio() {
  if (!canReact) return;
  if (actx) { if (actx.state === "suspended") actx.resume(); return; }
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const source = actx.createMediaElementSource(audio);
    analyser = actx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = .75;
    source.connect(analyser);
    analyser.connect(actx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
  } catch (_) { actx = null; }
}
["#beatGrid", "#mpb"].forEach(s => $(s).addEventListener("click", unlockAudio, true));

const band = ([a, b]) => { let t = 0; for (let i = a; i <= b; i++) t += freq[i]; return t / ((b - a + 1) * 255); };

function react() {
  if (!analyser || audio.paused) return stopReact();
  analyser.getByteFrequencyData(freq);
  const bass = Math.min(Math.pow(band(REACTIVE.bassBins), REACTIVE.punch) * 1.4, 1);
  [$(".card.live"), bar].forEach(el => el && el.style.setProperty("--bass", bass.toFixed(3)));
  const bars = $$(".card.live .eq i");
  ranges.forEach((r, i) => {
    if (bars[i]) bars[i].style.height = 4 + Math.min(Math.pow(band(r), 1.1) * REACTIVE.gain, 1) * (REACTIVE.maxHeight - 4) + "px";
  });
  rafId = requestAnimationFrame(react);
}
function startReact() {
  if (!analyser) return;
  $$(".eq").forEach(e => e.classList.add("real"));
  if (!rafId) rafId = requestAnimationFrame(react);
}
function stopReact() {
  cancelAnimationFrame(rafId); rafId = 0;
  $$(".eq").forEach(e => e.classList.remove("real"));
  $$(".eq i").forEach(i => i.style.height = "");
  $$(".card").forEach(c => c.style.removeProperty("--bass"));
  bar.style.removeProperty("--bass");
}
audio.addEventListener("play",  startReact);
audio.addEventListener("pause", stopReact);
audio.addEventListener("ended", () => setPlaying(false));

/* ---------- 10. CARD PROGRESS RING + GLASS PLAYER STATE -----------------
   A light line "charges" clockwise around the beat card until the end of
   the track. Works with real audio (uses its duration) and also without
   audio (then it loops with the animated bars).                          */
const RING = { radius: 5, width: 2 };     // corner radius should match the card (6px) minus its border

const rings = {};
$$(".card[data-i]").forEach(card => {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "ring");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = '<path class="rt"></path><path class="rp"></path><circle class="rh" r="3.2"></circle>';
  card.appendChild(svg);
  rings[card.dataset.i] = { card, svg, track: svg.children[0], line: svg.children[1], head: svg.children[2], len: 0 };
});

// draws the rounded rectangle path, starting at top-center and going clockwise
function layoutRing(r) {
  const w = r.svg.clientWidth, h = r.svg.clientHeight, k = RING.radius, a = 1, cx = w / 2;
  const d = `M${cx},${a} H${w - a - k} A${k},${k} 0 0 1 ${w - a},${a + k} V${h - a - k} A${k},${k} 0 0 1 ${w - a - k},${h - a} `
          + `H${a + k} A${k},${k} 0 0 1 ${a},${h - a - k} V${a + k} A${k},${k} 0 0 1 ${a + k},${a} H${cx}`;
  r.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  r.track.setAttribute("d", d); r.line.setAttribute("d", d);
  r.line.style.strokeWidth = r.track.style.strokeWidth = RING.width;
  r.len = r.line.getTotalLength();
}
const ro = new ResizeObserver(es => es.forEach(e => { const r = Object.values(rings).find(x => x.card === e.target); if (r) layoutRing(r); }));
Object.values(rings).forEach(r => ro.observe(r.card));

function ringFrame() {
  Object.entries(rings).forEach(([i, r]) => {
    const on = +i === current;
    r.card.classList.toggle("has-ring", on);
    if (!on || !r.len) return;
    const real = BEATS[i].audio && isFinite(audio.duration) && audio.duration > 0;
    const p = Math.min(Math.max(real ? audio.currentTime / audio.duration : progress / 100, 0), 1);
    const pt = r.line.getPointAtLength(p * r.len);
    r.line.style.strokeDasharray = `${p * r.len} ${r.len}`;
    r.head.setAttribute("cx", pt.x); r.head.setAttribute("cy", pt.y);
    r.head.style.opacity = p > 0 && p < 1 ? 1 : 0;
  });
  bar.classList.toggle("on-air", playing);       // lets the glass player glow while music plays
  requestAnimationFrame(ringFrame);
}
ringFrame();

/* ---------- 11. LIGHT HALO TRAVELLING WITH THE PROGRESS LINE ------------
   A soft light follows the tip of the charging line around the card.
   (It stays inside the card; to remove it, delete this whole section.)    */
Object.values(rings).forEach(r => {
  const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  halo.setAttribute("class", "rg");
  halo.setAttribute("r", 16);                 // size of the halo
  r.svg.insertBefore(halo, r.line);           // drawn under the line
  r.halo = halo;
});

function haloFrame() {
  Object.values(rings).forEach(r => {
    if (!r.halo) return;
    const on = r.card.classList.contains("has-ring");
    r.halo.setAttribute("cx", r.head.getAttribute("cx") || 0);
    r.halo.setAttribute("cy", r.head.getAttribute("cy") || 0);
    r.halo.style.opacity = on ? r.head.style.opacity || 0 : 0;
  });
  requestAnimationFrame(haloFrame);
}
haloFrame();

/* ---------- 12. HERO LOGOS (they flip like a coin next to "GLV") -------
   The two images come from HERO_LOGOS in config.js.                       */
const LOGOS = typeof HERO_LOGOS !== "undefined" ? HERO_LOGOS : ["img/logo.png"];
[$("#logoA"), $("#logoB")].forEach((img, i) => {
  if (!img) return;
  img.src = LOGOS[i] || LOGOS[0];
  img.onerror = () => { if (!img.src.endsWith(LOGOS[0])) img.src = LOGOS[0]; };   // missing file -> use the first logo
});


/* ---------- 13. SEEK BAR: click or drag the line of the sticky player --- */
const seekBar = $(".pb"), seekFill = document.createElement("i"), seekDot = document.createElement("span");
seekFill.id = "mpf";                       // our own fill (the old one is hidden)
seekDot.className = "th";
seekBar.append(seekFill, seekDot);
$("#mpi").style.display = "none";
seekBar.setAttribute("role", "slider");
seekBar.setAttribute("tabindex", "0");
seekBar.setAttribute("aria-label", "Seek");

let dragging = false, dragP = 0;
const hasAudio = () => { const b = BEATS[current]; return b && b.audio && isFinite(audio.duration) && audio.duration > 0; };
const nowP = () => hasAudio() ? audio.currentTime / audio.duration : progress / 100;
const clamp01 = x => Math.min(Math.max(x, 0), 1);
function seekTo(p) { p = clamp01(p); if (hasAudio()) audio.currentTime = p * audio.duration; else progress = p * 100; }
const pointerP = e => { const r = seekBar.getBoundingClientRect(); return clamp01((e.clientX - r.left) / r.width); };

seekBar.addEventListener("pointerdown", e => {
  if (current < 0) return;
  dragging = true; dragP = pointerP(e);
  seekBar.setPointerCapture(e.pointerId); seekBar.classList.add("drag"); e.preventDefault();
});
seekBar.addEventListener("pointermove", e => { if (dragging) dragP = pointerP(e); });
const endDrag = () => { if (!dragging) return; dragging = false; seekBar.classList.remove("drag"); seekTo(dragP); };
seekBar.addEventListener("pointerup", endDrag);
seekBar.addEventListener("pointercancel", () => { dragging = false; seekBar.classList.remove("drag"); });
seekBar.addEventListener("keydown", e => {            // keyboard: left / right arrows
  if (current < 0 || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
  e.preventDefault(); seekTo(nowP() + (e.key === "ArrowRight" ? .05 : -.05));
});

(function seekFrame() {
  const pc = clamp01(dragging ? dragP : nowP()) * 100;
  seekFill.style.width = pc + "%"; seekDot.style.left = pc + "%";
  seekBar.setAttribute("aria-valuenow", Math.round(pc));
  requestAnimationFrame(seekFrame);
})();

/* ---------- 14. ARTWORK TITLE: letters swap one by one (ARTWORK ↔ BLANKOS)
   Each letter slides down and is replaced by the letter of the other word,
   left to right, then it swaps back, forever.
   Words come from ARTWORK_WORDS in config.js (best with the same length). */
(function () {
  const h2 = $("#artwork h2");
  if (!h2) return;
  const words = typeof ARTWORK_WORDS !== "undefined" ? ARTWORK_WORDS : ["Artwork", "Blankos"];
  const sup = h2.querySelector("sup");                       // keeps the "(02)" label
  const n = Math.max(words[0].length, words[1].length);
  const ch = (w, i) => w[i] && w[i] !== " " ? w[i] : "&nbsp;";

  h2.setAttribute("aria-label", words[0]);
  h2.innerHTML = Array.from({ length: n }, (_, i) =>
    `<span class="sl" aria-hidden="true" style="--i:${i}"><b class="l1">${ch(words[0], i)}</b><b class="l2">${ch(words[1], i)}</b></span>`
  ).join("");
  if (sup) h2.appendChild(sup);
})();

/* ---------- 15. "VIEW MORE" ROW UNDER THE ARTWORK (links to Behance) ----
   The link comes from BEHANCE_URL in config.js.                           */
(function () {
  const grid = $("#artGrid");
  if (!grid) return;
  const a = document.createElement("a");
  a.className = "vm";
  a.href = typeof BEHANCE_URL !== "undefined" ? BEHANCE_URL : "https://www.behance.net/blankitos";
  a.target = "_blank";
  a.rel = "noopener";
  a.dataset.cur = "OPEN";                                   // label shown by the custom cursor
  a.setAttribute("aria-label", "View more on Behance (opens in a new tab)");
  a.innerHTML = '<span>View more</span><b aria-hidden="true">→</b>';
  grid.after(a);
})();

/* ---------- 16. BEATS CAROUSEL (home page) ------------------------------
   Shows up to HOME_MAX_BEATS beats, 4 at a time (2 on tablets, 1 on
   phones), moved with the arrows. A "View all beats" row links to
   beats.html. HOME_MAX_BEATS comes from config.js (default 8).           */
(function () {
  const grid = $("#beatGrid");
  if (!grid) return;
  const MAX = typeof HOME_MAX_BEATS !== "undefined" ? HOME_MAX_BEATS : 8;
  const shown = $$("#beatGrid .card[data-i]").filter((c, i) => { if (i >= MAX) c.style.display = "none"; return i < MAX; });

  // wrap the grid in a window that hides the cards outside the current page
  const car = document.createElement("div");
  car.className = "car";
  grid.before(car);
  car.appendChild(grid);

  // "View all beats" row
  const all = document.createElement("a");
  all.className = "va";
  all.href = "beats.html";
  all.dataset.cur = "OPEN";
  all.innerHTML = '<span>View all beats</span><b aria-hidden="true">→</b>';
  car.after(all);

  // arrows, placed next to "Tap to preview"
  const ctl = document.createElement("div");
  ctl.className = "cc";
  ctl.innerHTML = '<button type="button" aria-label="Previous beats">←</button><span></span><button type="button" aria-label="Next beats">→</button>';
  const [prev, label, next] = ctl.children;
  const head = $("#beats .sh"), small = head.querySelector("small");
  const tools = document.createElement("div");
  tools.className = "tools";
  small.replaceWith(tools);
  tools.append(small, ctl);

  let page = 0;
  const per   = () => Math.max(1, parseInt(getComputedStyle(grid).getPropertyValue("--per")) || 4);
  const pages = () => Math.max(1, Math.ceil(shown.length / per()));

  function go(p) {
    page = Math.min(Math.max(p, 0), pages() - 1);
    grid.style.transform = `translateX(calc(${-page} * (100% + var(--gap))))`;
    shown.forEach((c, i) => {                       // cards on other pages can't be focused
      const on = i >= page * per() && i < (page + 1) * per();
      c.toggleAttribute("inert", !on);
      c.setAttribute("aria-hidden", on ? "false" : "true");
    });
    label.textContent = (page + 1) + " / " + pages();
    prev.disabled = page === 0;
    next.disabled = page >= pages() - 1;
    ctl.style.visibility = pages() > 1 ? "visible" : "hidden";
  }
  prev.onclick = () => go(page - 1);
  next.onclick = () => go(page + 1);
  addEventListener("resize", () => go(page));
  go(0);
})();

/* ---------- 17. ARTWORK VIEWER (click a cover) --------------------------
   The cover grows from where it is into a small framed viewer, showing the
   whole image. Close with ✕, Esc or a click outside; ← → browse covers.
   Optional fields in ARTWORK (config.js):
     full:  "img/art1-full.jpg"   high-quality version shown in the viewer
     title: "My cover name"                                                 */
(function () {
  const VIEWER_MAX_WIDTH = 880;                       // widest the viewer can be, in pixels (make it smaller for a smaller viewer)
  const N = ARTWORK.length, thumbs = [];
  $$(".col").forEach((col, c) => [...col.querySelectorAll(".pc")].forEach((pc, k) => { thumbs[c + 3 * k] = pc; }));
  if (!thumbs.length) return;

  /* ----- build the viewer ----- */
  const lb = document.createElement("div");
  lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Artwork viewer");
  lb.innerHTML = `
    <div class="lb-bg" data-cur="CLOSE"></div>
    <div class="lb-card"></div>
    <div class="lb-ui">
      <button class="lb-x" aria-label="Close">✕</button>
      <div class="lb-bar"><span class="lb-t"></span>
        <span class="lb-nav"><button class="lb-p" aria-label="Previous cover">←</button><span class="lb-c"></span><button class="lb-nx" aria-label="Next cover">→</button></span>
      </div>
    </div>`;
  document.body.appendChild(lb);
  const card = lb.querySelector(".lb-card"), ui = lb.querySelector(".lb-ui");
  let idx = -1, ar = .8, busy = false, rect = null;

  const setBox = (el, r) => { el.style.left = r.left + "px"; el.style.top = r.top + "px"; el.style.width = r.width + "px"; el.style.height = r.height + "px"; };
  const px = r => ({ left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
  const ms = t => reduceMotion ? 0 : t;

  // size of the viewer: the whole image, never bigger than the screen minus some room
  function fit(ratio) {
    let w = Math.min(innerWidth - 32, VIEWER_MAX_WIDTH), h = w / ratio; const maxH = innerHeight - 180;
    if (h > maxH) { h = maxH; w = h * ratio; }
    return { left: (innerWidth - w) / 2, top: 56 + (innerHeight - 112 - h) / 2, width: w, height: h };
  }
  const ratioOf = src => new Promise(res => {
    if (!src) return res(.8);
    const im = new Image(); im.onload = () => res(im.naturalWidth / im.naturalHeight); im.onerror = () => res(.8); im.src = src;
  });
  function fill(i) {
    const a = ARTWORK[i], src = a.full || a.img || "", title = a.title || "Cover 0" + (i + 1);
    card.innerHTML = src ? `<img src="${src}" alt="${title}">` : `<div class="lb-ph" style="background:linear-gradient(${135 + i * 25}deg,${a.colors[0]},${a.colors[1]})"></div>`;
    lb.querySelector(".lb-t").textContent = title;
    lb.querySelector(".lb-c").textContent = (i + 1) + " / " + N;
    return src;
  }
  const grow = (from, to, t, r0, r1) => {
    setBox(card, to); card.style.borderRadius = r1 + "px";
    return card.animate([{ ...px(from), borderRadius: r0 + "px" }, { ...px(to), borderRadius: r1 + "px" }],
      { duration: ms(t), easing: "cubic-bezier(.2,.8,.2,1)" }).finished;
  };

  /* ----- open / browse / close ----- */
  async function open(i) {
    if (busy || idx >= 0) return; busy = true; idx = i;
    const from = thumbs[i].getBoundingClientRect();
    ar = await ratioOf(ARTWORK[i].full || ARTWORK[i].img || "");
    fill(i); rect = fit(ar); setBox(ui, rect);
    thumbs[i].style.visibility = "hidden";
    lb.classList.add("open");
    await grow(from, rect, 650, 4, 12);
    ui.classList.add("show"); lb.querySelector(".lb-x").focus(); busy = false;
  }
  async function go(d) {
    if (busy || idx < 0) return; busy = true;
    const n = (idx + d + N) % N, old = card.getBoundingClientRect();
    ui.classList.remove("show");
    thumbs[idx].style.visibility = ""; thumbs[n].style.visibility = "hidden"; idx = n;
    ar = await ratioOf(ARTWORK[n].full || ARTWORK[n].img || "");
    fill(n); rect = fit(ar); setBox(ui, rect);
    card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms(450) });
    await grow(old, rect, 550, 12, 12);
    ui.classList.add("show"); busy = false;
  }
  async function close() {
    if (busy || idx < 0) return; busy = true;
    const pc = thumbs[idx], to = pc.getBoundingClientRect(), now = card.getBoundingClientRect();
    ui.classList.remove("show"); lb.classList.remove("open"); lb.classList.add("closing");
    const visible = to.bottom > 0 && to.top < innerHeight && to.right > 0 && to.left < innerWidth;
    if (visible) await grow(now, to, 550, 12, 4);
    else await card.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms(300) }).finished;
    pc.style.visibility = ""; lb.classList.remove("closing"); pc.focus({ preventScroll: true });
    idx = -1; busy = false;
  }

  /* ----- events ----- */
  thumbs.forEach((pc, i) => {
    pc.tabIndex = 0; pc.setAttribute("role", "button"); pc.setAttribute("aria-label", "View cover " + (i + 1));
    pc.addEventListener("click", () => open(i));
    pc.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });
  lb.querySelector(".lb-bg").onclick = close;
  lb.querySelector(".lb-x").onclick = close;
  lb.querySelector(".lb-p").onclick = () => go(-1);
  lb.querySelector(".lb-nx").onclick = () => go(1);
  addEventListener("keydown", e => {
    if (idx < 0) return;
    if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "ArrowRight") go(1);
  });
  addEventListener("resize", () => { if (idx >= 0 && !busy) { rect = fit(ar); setBox(card, rect); setBox(ui, rect); } });
  ["wheel", "touchmove"].forEach(t => lb.addEventListener(t, e => e.preventDefault(), { passive: false }));   // page stays still behind the viewer
})();

/* ---------- 18. "NEW" TAG + RANK-STYLE REVEAL ON ONE BEAT ---------------
   The chosen beat gets a metallic NEW tag and, when it scrolls into view,
   it is revealed by a diagonal metallic flash (like a rank reveal).
   NEW_BEAT is the position in BEATS (config.js): 0 = the first beat.
   Set it to -1 to turn the effect off.                                     */
const NEW_BEAT = 0;
(function () {
  const card = $(`#beatGrid .card[data-i="${NEW_BEAT}"]`);
  if (!card) return;
  card.classList.add("first");
  card.querySelector(".cover").insertAdjacentHTML("beforeend", '<span class="new-tag">NEW</span>');
})();

/* ---------- 19. LIGHT FLASH RISING FROM BELOW (outside the card too) ----
   When the NEW beat is revealed, a band of white/purple light rises from
   under the card to above it, wider than the card, so it glows outside it.
   Works together with section 18 (NEW tag + reveal). To turn it off,
   delete this section.                                                      */
(function () {
  const card = $(`#beatGrid .card[data-i="${NEW_BEAT}"]`);
  if (!card || reduceMotion) return;

  function fire() {
    const r = card.getBoundingClientRect(), sx = scrollX, sy = scrollY;
    const SIDE = 90, H = 340, PAD = 300;                 // SIDE = how far the light spreads beside the card; H = thickness of the band
    const wrap = document.createElement("div");
    wrap.className = "rise-wrap";
    wrap.style.top = (r.top + sy - PAD) + "px";
    wrap.style.height = (r.height + PAD * 2) + "px";
    const beam = document.createElement("div");
    beam.className = "rise-beam";
    beam.style.left = (r.left + sx - SIDE) + "px";
    beam.style.width = (r.width + SIDE * 2) + "px";
    beam.style.height = H + "px";
    wrap.appendChild(beam);
    document.body.appendChild(wrap);

    const startY = PAD + r.height + 40 - H / 2;          // under the card
    const endY   = PAD - 90 - H / 2;                     // above the card
    beam.style.top = "0px";
    beam.animate([
      { transform: `translateY(${startY}px)`, opacity: 0 },
      { transform: `translateY(${startY - (startY - endY) * .18}px)`, opacity: 1, offset: .18 },
      { transform: `translateY(${startY - (startY - endY) * .82}px)`, opacity: 1, offset: .82 },
      { transform: `translateY(${endY}px)`, opacity: 0 }
    ], { duration: 1300, easing: "cubic-bezier(.45,0,.55,1)" }).finished.then(() => wrap.remove());
  }

  if (card.classList.contains("in")) { setTimeout(fire, 250); return; }
  const mo = new MutationObserver(() => {
    if (card.classList.contains("in")) { mo.disconnect(); setTimeout(fire, 250); }
  });
  mo.observe(card, { attributes: true, attributeFilter: ["class"] });
})();

/* ---------- 20. SWIPE THE BEATS CAROUSEL (phones and tablets) -----------
   Drag the beats sideways with a finger: they follow your finger and snap
   to the next / previous page. The arrows still work. Vertical scrolling
   of the page is not affected. Mouse users keep using the arrows.          */
(function () {
  const grid = $("#beatGrid"), car = grid && grid.parentElement, ctl = $(".cc");
  if (!car || !ctl) return;
  const prev = ctl.children[0], next = ctl.children[2];
  car.style.touchAction = "pan-y";                         // the browser keeps vertical scroll, we take horizontal

  let sx = 0, sy = 0, dx = 0, t0 = 0, active = false, drag = false, base = "", lastDrag = 0;
  const THRESHOLD = 70;                                    // pixels to drag before the page changes (a quick flick is enough too)

  car.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") return;
    active = true; drag = false; sx = e.clientX; sy = e.clientY; dx = 0; t0 = performance.now();
  });
  car.addEventListener("pointermove", e => {
    if (!active) return;
    dx = e.clientX - sx;
    if (!drag) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - sy)) return;
      drag = true; base = grid.style.transform; grid.style.transition = "none";
      $$("#beatGrid .card:not(.first)").forEach(c => c.classList.add("in"));          // neighbours are already visible while dragging
      car.setPointerCapture(e.pointerId);
    }
    const atEdge = (dx > 0 && prev.disabled) || (dx < 0 && next.disabled);
    grid.style.transform = `${base} translateX(${atEdge ? dx * .3 : dx}px)`;           // the edge feels "heavier"
  });
  function end(cancel) {
    if (!active) return; active = false;
    if (!drag) return;
    drag = false; lastDrag = performance.now(); grid.style.transition = "";
    const fast = Math.abs(dx) / Math.max(1, performance.now() - t0) > .45 && Math.abs(dx) > 30;
    if (!cancel && (Math.abs(dx) > THRESHOLD || fast)) {
      const btn = dx < 0 ? next : prev;
      if (!btn.disabled) { btn.click(); return; }
    }
    grid.style.transform = base;                           // not enough: slide back
  }
  car.addEventListener("pointerup", () => end(false));
  car.addEventListener("pointercancel", () => end(true));
  car.addEventListener("click", e => { if (performance.now() - lastDrag < 400) { e.stopPropagation(); e.preventDefault(); } }, true);   // a swipe is not a tap
})();