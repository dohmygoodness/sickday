/* ── FX lab ────────────────────────────────────────────────────────
   A corner chip cycles experimental button-animation sets. "classic"
   is the shipped behaviour: no data-anim attribute on <body>, no
   selection delay — app.js and styles.css run exactly as before.
   The other sets add a short "picked" beat: the click is intercepted
   in the capture phase (so the button's own onclick never fires
   early), the pick animation plays, then the real handler runs.
   To retire the lab, delete this file and anim-lab.css. */
(() => {
  const SETS  = ["classic", "arcade", "stamp", "jelly"];
  const DELAY = { arcade: 400, stamp: 260, jelly: 320 };   // ms of selection theatre
  const KEY   = "sickday-fx";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  let mode = localStorage.getItem(KEY);
  if (!SETS.includes(mode)) mode = "classic";

  const chip = document.createElement("button");
  chip.className = "fxchip";
  chip.type = "button";
  chip.title = "Cycle button animation set (experiment)";
  document.body.appendChild(chip);

  function apply() {
    if (mode === "classic") document.body.removeAttribute("data-anim");
    else document.body.dataset.anim = mode;
    chip.textContent = "fx · " + mode;
    localStorage.setItem(KEY, mode);
  }
  chip.onclick = () => { mode = SETS[(SETS.indexOf(mode) + 1) % SETS.length]; apply(); };
  apply();

  let busy = false;
  document.addEventListener("click", e => {
    if (mode === "classic" || reduced.matches) return;
    const b = e.target.closest(".opt, .go");
    if (!b || typeof b.onclick !== "function") return;
    e.stopPropagation();                       // keeps the button's onclick from firing now
    if (busy) return;                          // double-clicks die here, not in app.js
    busy = true;
    b.classList.add("is-picked");
    if (b.classList.contains("opt"))
      for (const s of b.parentNode.children) if (s !== b) s.classList.add("is-dropped");
    const go = b.onclick;
    setTimeout(() => { busy = false; go.call(b, e); }, DELAY[mode] || 300);
  }, true);
})();
