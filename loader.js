/* =====================================================================
   loader.js  —  loading screen: your horse logo "charges" with a white
   glow and fades out when the page is ready.
   Add this line in the <head> of the page, right AFTER the style.css line:
       <script src="loader.js"></script>
   Everything (look and settings) is in this file.
   ===================================================================== */
(function () {
  /* ---------- SETTINGS ---------- */
  const LOADER_LOGO   = "images/imglogoglv.png";   // the logo (white, transparent background)
  const ONLY_ON_ENTRY = true;                // true: only when someone arrives on the site (not when moving between your pages)
  const MIN_TIME      = 1600;                // shortest time the screen stays visible (milliseconds)
  const MAX_TIME      = 7000;                // never wait longer than this (milliseconds)
  const BACKGROUND    = "#000";              // colour behind the logo
  const LOGO_SIZE     = "min(34vw, 160px)";  // size of the logo

  /* ---------- should it show? ---------- */
  const root = document.documentElement;
  let internal = false;
  try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (_) {}
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || (ONLY_ON_ENTRY && internal)) return;

  /* ---------- look ---------- */
  const css = document.createElement("style");
  css.textContent = `
    html.loading { overflow: hidden; }
    html.loading h1 span i { animation-play-state: paused; }              /* the title appears after the loader */
    #loader { position: fixed; inset: 0; z-index: 99999; display: grid; place-items: center; background: ${BACKGROUND}; transition: opacity .9s ease; }
    #loader.out { opacity: 0; pointer-events: none; }
    .ld-glow { width: ${LOGO_SIZE}; aspect-ratio: 1; transition: transform .9s ease;
      filter: drop-shadow(0 0 calc(4px + 26px * var(--glow, 0)) rgba(255, 255, 255, calc(.2 + .7 * var(--glow, 0)))); }
    #loader.out .ld-glow { transform: scale(1.08); }
    .ld-logo { width: 100%; height: 100%;
      -webkit-mask: var(--loader-logo) center / contain no-repeat; mask: var(--loader-logo) center / contain no-repeat;
      background: linear-gradient(to top, #fff 0%, #fff var(--load, 0%), rgba(255, 255, 255, .12) var(--load, 0%), rgba(255, 255, 255, .12) 100%); }
  `;
  document.head.appendChild(css);

  const el = document.createElement("div");
  el.id = "loader"; el.setAttribute("aria-hidden", "true");
  el.style.setProperty("--loader-logo", `url("${LOADER_LOGO}")`);
  el.innerHTML = '<div class="ld-glow"><div class="ld-logo"></div></div>';
  root.appendChild(el);                      // shown before the page is even drawn
  root.classList.add("loading");

  /* ---------- progress ---------- */
  const t0 = performance.now(), glow = el.querySelector(".ld-glow");
  let ready = false, finishing = false, p = 0, last = t0;
  Promise.all([
    new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })),
    document.fonts ? document.fonts.ready : null
  ]).then(() => { ready = true; });

  function frame(now) {
    const t = now - t0, dt = now - last; last = now;
    if (!finishing && ((ready && t >= MIN_TIME) || t >= MAX_TIME)) finishing = true;
    const target = finishing ? 100 : 88 * (1 - Math.exp(-t / 650));          // fills slowly towards 88% while the page loads
    p += (target - p) * (1 - Math.exp(-dt / (finishing ? 90 : 160)));
    el.style.setProperty("--load", p.toFixed(1) + "%");
    el.style.setProperty("--glow", (p / 100 * (.88 + .12 * Math.sin(t / 220))).toFixed(3));
    if (finishing && p > 99.3) return done();
    requestAnimationFrame(frame);
  }
  function done() {
    el.classList.add("out");                                                   // fade out
    setTimeout(() => { el.remove(); css.remove(); root.classList.remove("loading"); }, 1000);
  }
  requestAnimationFrame(frame);
})();
