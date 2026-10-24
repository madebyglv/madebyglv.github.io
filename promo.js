/* =====================================================================
   promo.js  —  discount pop-up: a square with your image and a message
   appears when someone enters the site. When it is closed, it slides to
   the side of the screen as a small tab with the code; clicking the tab
   opens it again.
   Add this line before </body> of index.html and beats.html, AFTER the
   lines that load config.js / script.js:
       <script src="promo.js"></script>
   The texts, image and code are in PROMO inside config.js.
   ===================================================================== */
(function () {
  const cfg = Object.assign({
    enabled:    true,
    code:       "10PGLV",
    title:      "",                                       // small label above the text, "" = none
    text:       "10% off on Premium & Stems licenses.",
    image:      "images/promoimg.jpg",                       // your image (a square one works best)
    link:       "https://www.beatstars.com/prodglv",      // optional button, "" = no button
    linkText:   "Go to BeatStars",
    side:       "right",                                  // where the tab goes: "right" or "left"
    onlyOnEntry: true,                                    // true: the square opens only when someone arrives on the site
    delay:      700,                                      // wait (ms) after the page is ready
    until:      ""                                        // optional end date, e.g. "2026-12-31T23:59:00+01:00"
  }, typeof PROMO !== "undefined" ? PROMO : {});
  if (!cfg.enabled || (cfg.until && Date.now() > Date.parse(cfg.until))) return;

  let internal = false;
  try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (_) {}
  const showSquare = !(cfg.onlyOnEntry && internal);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const left = cfg.side === "left";

  /* ---------- look ---------- */
  const css = document.createElement("style");
  css.textContent = `
    .pm { position: fixed; inset: 0; z-index: 58; display: none; place-items: center; padding: 16px; }
    .pm.open { display: grid; }
    .pm-bg { position: absolute; inset: 0; background: rgba(4, 4, 8, .55); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); opacity: 0; transition: opacity .5s ease; }
    .pm.show .pm-bg { opacity: 1; }
    .pm-card { position: relative; width: min(84vw, 360px); aspect-ratio: 1; overflow: hidden; border-radius: 18px; background: #0b0b10; color: #fff;
      box-shadow: 0 30px 90px rgba(0, 0, 0, .7); }                                   /* no outline around the card */
    .pm-card:focus { outline: none; }
    .pm-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .pm-shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,.8) 100%); }
    .pm-x { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,.35);
      background: rgba(0,0,0,.4); color: #fff; font-size: 12px; cursor: pointer; transition: background .3s; z-index: 2; }
    .pm-x:hover { background: rgba(255,255,255,.25); }
    .pm-body { position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 16px; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; z-index: 1; }
    .pm-txt { min-width: 0; }
    .pm-t { display: block; margin-bottom: 3px; font-family: var(--h, system-ui); font-weight: 700; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; opacity: .8; }
    .pm-p { margin: 0; font-size: 13px; line-height: 1.35; font-weight: 500; }
    .pm-p b { font-weight: 700; }
    .pm-link { display: inline-block; margin-top: 5px; font-size: 11px; color: rgba(255,255,255,.8); text-decoration: underline; text-underline-offset: 3px; }
    .pm-link:hover { color: #fff; }
    .pm-code { flex: none; display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border: 0; border-radius: 99px; background: #fff; color: #0b0b10;
      font-family: var(--h, system-ui); font-weight: 700; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; transition: background .3s; }
    .pm-code span { font-weight: 500; opacity: .55; letter-spacing: .08em; }
    .pm-code:hover { background: #e9e9ee; }

    .pm-tab { position: fixed; top: 50%; ${left ? "left" : "right"}: 0; z-index: 45; transform: translateY(-50%); padding: 18px 10px; border: 0; cursor: pointer;
      background: #fff; color: #0b0b10; border-radius: ${left ? "0 14px 14px 0" : "14px 0 0 14px"};      /* the flat side touches the edge of the screen */
      box-shadow: 0 8px 30px rgba(0,0,0,.45); opacity: 0; visibility: hidden; transition: opacity .4s, visibility 0s .4s, padding .3s; }
    .pm-tab span { display: block; writing-mode: vertical-rl; ${left ? "" : "transform: rotate(180deg);"} font-family: var(--h, system-ui); font-weight: 700; font-size: 12px; letter-spacing: .24em; }
    .pm-tab.show { opacity: 1; visibility: visible; transition: opacity .4s, padding .3s; }
    .pm-tab:hover, .pm-tab:focus-visible { padding-${left ? "right" : "left"}: 18px; }
    .pm-tab.pop { animation: pm-pop .7s cubic-bezier(.2,.8,.2,1); }
    @keyframes pm-pop { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.8); } 100% { box-shadow: 0 0 0 22px rgba(255,255,255,0); } }
    @media (max-width: 420px) { .pm-body { flex-direction: column; align-items: flex-start; gap: 10px; } .pm-tab { padding: 14px 8px; } }
  `;
  document.head.appendChild(css);

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wrap = document.createElement("div");
  wrap.className = "pm"; wrap.setAttribute("role", "dialog"); wrap.setAttribute("aria-modal", "true"); wrap.setAttribute("aria-label", "Discount code");
  wrap.innerHTML = `
    <div class="pm-bg"></div>
    <div class="pm-card">
      ${cfg.image ? `<img class="pm-img" src="${esc(cfg.image)}" alt="" onerror="this.remove()">` : ""}
      <div class="pm-shade"></div>
      <button class="pm-x" aria-label="Close">✕</button>
      <div class="pm-body">
        <div class="pm-txt">
          ${cfg.title ? `<span class="pm-t">${esc(cfg.title)}</span>` : ""}
          <p class="pm-p">${esc(cfg.text).replace(/\{code\}/g, `<b>${esc(cfg.code)}</b>`)}</p>
          ${cfg.link ? `<a class="pm-link" href="${esc(cfg.link)}" target="_blank" rel="noopener">${esc(cfg.linkText)} ↗</a>` : ""}
        </div>
        <button class="pm-code">${esc(cfg.code)} <span>Copy</span></button>
      </div>
    </div>`;
  const tab = document.createElement("button");
  tab.className = "pm-tab"; tab.innerHTML = `<span>${esc(cfg.code)}</span>`; tab.setAttribute("aria-label", "Show the discount code " + cfg.code);
  document.body.append(wrap, tab);

  const card = wrap.querySelector(".pm-card"), closeBtn = wrap.querySelector(".pm-x"), codeBtn = wrap.querySelector(".pm-code");
  card.tabIndex = -1;
  let isOpen = false, busy = false;

  /* ---------- open / close (the square flies to the tab and back) ---------- */
  function flyVector() {
    const c = card.getBoundingClientRect(), t = tab.getBoundingClientRect(), s = Math.max(.08, Math.min(t.width / c.width, t.height / c.height));
    return `translate(${t.left + t.width / 2 - (c.left + c.width / 2)}px, ${t.top + t.height / 2 - (c.top + c.height / 2)}px) scale(${s})`;
  }
  const move = (frames, ms) => card.animate(frames, { duration: reduce ? 0 : ms, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" }).finished;

  async function open(fromTab) {
    if (isOpen || busy) return; busy = true; isOpen = true;
    wrap.classList.add("open"); void wrap.offsetWidth; wrap.classList.add("show");
    if (fromTab && tab.classList.contains("show")) {
      const v = flyVector(); tab.classList.remove("show");
      await move([{ transform: v, opacity: 0 }, { opacity: 1, offset: .35 }, { transform: "none", opacity: 1 }], 650);
    } else {
      await move([{ transform: "scale(.9) translateY(16px)", opacity: 0 }, { transform: "none", opacity: 1 }], 600);
    }
    card.focus({ preventScroll: true }); busy = false;           // focus moves into the pop-up without drawing a ring
  }
  async function close() {
    if (!isOpen || busy) return; busy = true;
    wrap.classList.remove("show");
    tab.classList.add("show");                                         // the tab appears while the square flies into it
    const v = flyVector();
    await move([{ transform: "none", opacity: 1 }, { opacity: 1, offset: .6 }, { transform: v, opacity: 0 }], 600);
    wrap.classList.remove("open"); isOpen = false; busy = false;
    tab.classList.remove("pop"); void tab.offsetWidth; tab.classList.add("pop");
  }
  closeBtn.onclick = close;
  wrap.querySelector(".pm-bg").onclick = close;
  tab.onclick = () => open(true);
  addEventListener("keydown", e => { if (e.key === "Escape" && isOpen) close(); });
  codeBtn.onclick = async () => {
    const label = codeBtn.querySelector("span");
    try { await navigator.clipboard.writeText(cfg.code); label.textContent = "Copied ✓"; } catch (_) { label.textContent = "Select & copy"; }
    setTimeout(() => label.textContent = "Copy", 1800);
  };

  /* ---------- when to show ---------- */
  if (!showSquare) { tab.classList.add("show"); return; }            // moving between your pages: only the tab
  const start = () => setTimeout(() => open(false), cfg.delay);
  const wait = () => document.documentElement.classList.contains("loading") ? setTimeout(wait, 150) : start();   // waits for the loading screen
  document.readyState === "complete" ? wait() : addEventListener("load", wait, { once: true });
})();