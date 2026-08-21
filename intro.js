/* ── the corridor ──────────────────────────────────────────
   Scroll-driven opening: a five-screen-tall track with the video
   pinned; three screens of scroll scrub the door open, the rest is
   slack. The clip is encoded all-intra (every frame a keyframe) so
   seeks land exactly, and it's fetched as a blob so scrubbing never
   waits on a range request.
   The last frame is the composition the background gif starts on;
   app.js holds the doctor's first line until `intro:done`. */
(() => {
  const intro = document.getElementById("intro");
  if (!intro) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) { intro.remove(); return; }

  document.body.classList.add("pre-intro");

  const scroller = document.getElementById("introScroll");
  const vid = document.getElementById("introVid");
  const SRC = "assets/door-open.mp4";
  let len = 0, shown = 0, done = false;

  vid.addEventListener("loadedmetadata", () => { len = vid.duration; }, { once: true });
  vid.addEventListener("error", () => finish(), { once: true });
  fetch(SRC)                                       /* file:// or a failed fetch falls back to streaming */
    .then(r => r.ok ? r.blob() : Promise.reject(r.status))
    .then(b => { vid.src = URL.createObjectURL(b); })
    .catch(() => { vid.src = SRC; });

  /* iOS won't decode frames for a video that has never "played" */
  const unlock = () => { const p = vid.play(); if (p) p.then(() => vid.pause()).catch(() => {}); };
  scroller.addEventListener("touchstart", unlock, { once: true, passive: true });

  /* The door opens over the first three quarters of the track; the last
     quarter is slack for momentum to die in (styles.css .intro-track). */
  const DOOR = 0.75;
  const progress = () => {
    const max = (scroller.scrollHeight - scroller.clientHeight) * DOOR;
    return max > 0 ? Math.min(1, scroller.scrollTop / max) : 0;
  };

  const onKey = e => { if (e.key === "Escape") { e.stopPropagation(); finish(); } };

  function finish() {
    if (done) return;
    done = true;
    /* Momentum and follow-up flicks from the gesture that opened the door must
       not scroll the page underneath. Wheel momentum streams events — cancel
       them until they stop. Touch flicks arrive as fresh gestures with silent
       gaps between them, so the faded overlay's scroller stays hit-testable
       (styles.css) and eats them until input has been quiet for a while. */
    let last = performance.now();
    const swallow = e => { if (e.cancelable) e.preventDefault(); last = performance.now(); };
    const note = () => { last = performance.now(); };
    addEventListener("wheel", swallow, { passive: false });
    addEventListener("touchmove", note, { passive: true });
    document.body.classList.add("intro-done");     /* overlay fades (styles.css) */
    document.body.classList.remove("pre-intro");   /* consult room comes up behind it */
    dispatchEvent(new Event("intro:done"));        /* app.js: the doctor starts talking */
    removeEventListener("keydown", onKey, true);
    const born = performance.now();
    (function reap() {
      const now = performance.now();
      if (now - born < 1500 || now - last < 900) return setTimeout(reap, 200);
      removeEventListener("wheel", swallow);
      removeEventListener("touchmove", note);
      intro.remove();
    })();
  }

  (function tick() {
    if (done) return;
    const p = progress();
    intro.classList.toggle("engaged", p > 0.015);
    if (p >= 0.995) return finish();
    if (len && !vid.seeking) {
      shown += (p * len - shown) * 0.35;           /* soften discrete wheel steps */
      if (Math.abs(shown - vid.currentTime) > 1 / 48) {
        if (vid.fastSeek) vid.fastSeek(shown); else vid.currentTime = shown;
      }
    }
    requestAnimationFrame(tick);
  })();

  addEventListener("keydown", onKey, true);
  document.getElementById("introSkip").onclick = finish;
  scroller.focus({ preventScroll: true });         /* space / arrow keys scroll the corridor */
})();
