# Sick Day Clinic

A one-room conversation game, visual-novel style — the consult fits one screen; the
resulting paperwork is a single scrolling sheet inside its own panel. You sit across from a tired GP, tell him when you
need to be ill and for how long, and he hands you a timeline: what to say three days
out, what to send at 06:45, and what not to do afterwards.

It opens in the corridor: scrolling scrubs a five-second clip of his door swinging
open (every frame is a keyframe, so the scroll position *is* the playhead), which ends
on the same drawing the background gif starts on — the overlay crossfades out and he
starts talking. Escape or "skip the corridor" jumps straight in; `prefers-reduced-motion`
skips it entirely.

Static site, no build step. Fonts (Space Grotesk / IBM Plex Mono / Instrument Serif)
load from Google Fonts; everything else is local.

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321 (or just open `index.html`).

## Files
- `index.html` — markup: full-bleed background, dialogue box, result panel
- `styles.css` — green/white paper theme; fixed full-viewport layout, nothing scrolls
- `app.js` — dialogue flow, illness catalogue, plan generator, plausibility scoring
- `intro.js` — scroll-scrubbed opening; holds the first line until `intro:done`
- `assets/door-open.mp4` — the door opening, re-encoded all-intra for exact seeks
- `assets/door-open-poster.jpg` — first frame, shown while the clip buffers
- `assets/doc-type.gif` — background: the doctor typing (shown while he talks)
- `assets/doc-blinking.gif` — background: the doctor blinking (shown while he waits for you)
- `assets/doctor-still.jpg` — still fallback for `prefers-reduced-motion`

On portrait phones the layout switches: the illustration becomes a top band on its own
white paper, and the dialogue box sits on a speckled green "floor" that continues the
desk-front texture out of the drawing.

## The doctors
Pick one on the title screen ("Which doctor am I seeing?"):
- **Dr. Hugo Holm** — you go home. Default.
- **Dr. Sy Kleave** — sick leave.
- **Dr. Malin Gering** — malingering.
- **Dr. A. Foreal** — the user's, kept out of respect.
- **Dr. Vera Similitude** — verisimilitude.

## The catalogue
Nineteen conditions, from four-in-the-morning kidney stones to an eye appointment
booked a month out. Dates are picked flight-booking style: **first click is your first
day off, second click is your last**, and the tally under the grid ("1 DAY", "3 DAYS")
updates as you click. Weekends inside the range don't count — a Thursday-to-Monday
booking is three days off. He can't shortlist anything until he knows both the date
and the length: sinusitis is worth exactly one day and shingles needs three, so the
answer changes the drawer he opens.

Four are offered at a time and the menu is **drawn, not listed**: one condition that
genuinely suits your runway anchors it, the other three are sampled at random and
weighted towards a good fit, so long shots surface occasionally and the same date never
serves the same four options twice in a row. Go `← back` and pick again to re-roll.
Three days is his ceiling — ask for more and he caps the pen: past that it's a case,
not a sick day, and if you need ten days off you need a resignation letter, not him.
Ask for three days a month out and nothing qualifies either — he says so and sends
you back.

Not everything in there is an illness — a burst pipe, a nursery phone call and a booked
eye examination are in the deck too, and one entry (`stress`) is the doctor writing an
honest note rather than a story.

## Adding an illness
Push an object into `ILLNESSES` in `app.js`:

```js
{ id, name, ideal, min, max, risk, holds, blurb, dx, advice, doc,
  steps: [{ off, time, what, script, note, kind }], dont: [] }
```

`min`/`max` are days of runway the date must allow; `ideal` is the runway it wants and
decides how often it gets drawn; `holds` is the most days off it can carry (1–3) and
keeps it out of the menu when you ask for longer.
`off` is days relative to D-day — negative is setup, `0` is the day itself,
positive is authored relative to the first day back. `kind:"second"` marks a
step that only exists when more than one day is booked. Weekend dates slide to
the nearest working day automatically, and two setup beats that land on the same
Friday get pushed apart so a week of build-up doesn't collapse into one afternoon.

The note is deliberately stamped NOVELTY and says it proves nothing — it's a
game prop, not a document.
