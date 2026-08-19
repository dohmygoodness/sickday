/* ── Sick Day Clinic ─────────────────────────────────────────────
   A dry doctor, a date, and a plan. Nothing here is real medicine. */

const DOCTORS = [
  { name: "Dr. Hugo Holm",       title: "M.D., family practice", sig: "H. Holm"     },
  { name: "Dr. Sy Kleave",       title: "M.D., reluctantly",     sig: "S. Kleave"   },
  { name: "Dr. Malin Gering",    title: "M.D., board-adjacent",  sig: "M. Gering"   },
  { name: "Dr. A. Foreal",       title: "M.D., allegedly",       sig: "A. Foreal"   },
  { name: "Dr. Vera Similitude", title: "M.D., diagnostics",     sig: "V. Similitude" },
];

const $  = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const shift = (d, n) => new Date(d.getTime() + n * DAY);
const iso   = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;
const toWorkday = (d, dir) => { let x = new Date(d); while (isWeekend(x)) x = shift(x, dir); return x; };
const addWorkdays = (d, n) => { let x = new Date(d); while (n > 0) { x = toWorkday(shift(x, 1), 1); n--; } return x; };
const fmtMD = d => d.toLocaleDateString(undefined, { month:"short", day:"numeric" });
const fmt   = d => d.toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" });
const dow   = d => d.toLocaleDateString(undefined, { weekday:"long" });

/* ── the catalogue ─────────────────────────────────────────── */
/* off: days relative to D-day (negative = before). */
const ILLNESSES = [
  {
    id:"food", name:"Suspected foodborne illness", ideal:0, min:0, max:2, risk:0.86, holds:2,
    blurb:"Arrives overnight. Leaves by Thursday. Nobody asks a second question.",
    dx:"Acute gastrointestinal upset, presumed foodborne", advice:"Fluids, bland diet, no solid commitments.",
    doc:"Food poisoning. The workhorse. It needs no build-up, it explains everything, and no manager on earth wants the details.",
    steps:[
      {off:-1, time:"evening", what:"Plant one seed. One.",
       script:"that chicken place near the office was... optimistic",
       note:"Say it in person or in a channel your manager isn't in. You want a witness, not an announcement."},
      {off:0, time:"05:40", what:"Message before they're awake",
       script:"Up half the night — something I ate. Not going to be any use today. Will keep you posted.",
       note:"Send it early. Early reads as suffering. 9:01 reads as deciding."},
      {off:0, time:"all day", what:"Go quiet, but not dark",
       script:"", note:"One short reply late morning, then nothing. Silence is symptom-consistent."},
      {off:1, time:"09:00", what:"Return visibly diminished",
       script:"Much better. Still on toast and regret.",
       note:"Skip lunch out. Drink water in front of people. Complain about nothing else."}
    ],
    dont:["Don't name a restaurant a coworker also ate at.","Don't post food photos for four days.","Don't say 'food poisoning' twice — say 'something I ate.'"]
  },
  {
    id:"migraine", name:"Migraine with aura", ideal:1, min:0, max:3, risk:0.8, holds:2,
    blurb:"Unfalsifiable, screen-hostile, and gets worse the more anyone emails you.",
    dx:"Migraine with visual aura", advice:"Dark room, screen avoidance, no driving.",
    doc:"Migraine. Invisible, unprovable, and it makes screens the enemy — which conveniently is where all your work lives.",
    steps:[
      {off:-1, time:"afternoon", what:"Squint at something. Mention it once.",
       script:"my eyes are doing that thing again",
       note:"Rub one temple. Turn your screen brightness down where someone can see."},
      {off:0, time:"06:30", what:"Short message, lowercase, no punctuation flourish",
       script:"Migraine came on overnight. Can't look at a screen today. Sorry for the short notice.",
       note:"Short sentences. A migraine wouldn't write you a paragraph."},
      {off:0, time:"14:00", what:"One reply, if you must",
       script:"lying down, will look tomorrow",
       note:"Never reply fast. Fast is a person with functioning eyes."},
      {off:1, time:"09:30", what:"Come back a little slow",
       script:"Mostly clear. Bit fragile.",
       note:"Sunglasses on the commute if you commute. Nobody questions a person in sunglasses in an elevator."}
    ],
    dont:["Don't be seen watching anything on a screen.","Don't drink that evening — someone will do the math.","Don't over-explain the aura. Two words: 'the zigzags.'"]
  },
  {
    id:"dental", name:"Dental emergency", ideal:1, min:0, max:6, risk:0.9, holds:2,
    blurb:"The only ailment with a built-in appointment nobody can verify or wants to picture.",
    dx:"Acute dental pain, urgent referral", advice:"Analgesia; attend dental appointment; soft foods.",
    doc:"Teeth. Nobody argues with teeth. There's a specialist involved, a chair involved, and a level of detail nobody wants.",
    steps:[
      {off:-2, time:"lunch", what:"Chew on one side. Say nothing.",
       script:"", note:"If asked: 'something back here is angry.' Then change the subject."},
      {off:-1, time:"16:00", what:"Book the imaginary appointment out loud",
       script:"Trying to get in with a dentist tomorrow — I'll know by tonight.",
       note:"This is the move. You've now pre-announced an absence instead of calling in sick."},
      {off:0, time:"07:30", what:"Confirm it",
       script:"Got an emergency slot this morning. They think it needs work. I'll message when I'm out.",
       note:"'They think it needs work' is the most powerful sentence in this document."},
      {off:0, time:"15:00", what:"Report back, briefly and numbly",
       script:"Done. Half my face is asleep. Back tomorrow.",
       note:"Nobody follows up on a numb face."},
      {off:1, time:"09:00", what:"Wince once before noon",
       script:"", note:"Once. Not a performance."}
    ],
    dont:["Don't specify which tooth — you will contradict yourself.","Don't eat anything crunchy in the office for two days.","Don't claim a root canal unless you're prepared to be asked about it for a year."]
  },
  {
    id:"pinkeye", name:"Viral conjunctivitis", ideal:1, min:1, max:4, risk:0.88, holds:3,
    blurb:"They will send you home. You won't have to ask.",
    dx:"Acute viral conjunctivitis; contagious", advice:"Exclude from workplace until discharge resolves.",
    doc:"Pink eye. The rare condition where the workplace begs you to leave. Highly contagious, highly visible, deeply unwelcome.",
    steps:[
      {off:-1, time:"afternoon", what:"Touch your eye. Look annoyed.",
       script:"something's in my eye and it will not leave",
       note:"Do it near someone who repeats things."},
      {off:0, time:"07:00", what:"Lead with contagion, not with you",
       script:"Woke up with my eye swollen shut and weeping. Pretty sure it's conjunctivitis — I shouldn't be around anyone until it clears.",
       note:"Frame it as protecting them. That flips the conversation entirely."},
      {off:0, time:"11:00", what:"Offer the thing you know they'll refuse",
       script:"Happy to come in if it's urgent.",
       note:"They will say no. Loudly. In writing."},
      {off:1, kind:"second", time:"morning", what:"Stay out one more beat if you took two days",
       script:"Still red. Not risking the whole floor.",
       note:"Rub your eye red for ten seconds before the first video call back."}
    ],
    dont:["Don't turn your camera on with two clear eyes.","Don't do it twice in one year — pink eye is memorable.","Don't shake anyone's hand for three days after; sell the whole bit."]
  },
  {
    id:"gastro", name:"Viral gastroenteritis", ideal:2, min:1, max:4, risk:0.84, holds:3,
    blurb:"Contagious, gross, and self-limiting. The polite version of two days off.",
    dx:"Viral gastroenteritis", advice:"Oral rehydration; exclude from workplace 48h after last symptom.",
    doc:"Stomach bug. Same energy as food poisoning but it comes with a rule: forty-eight hours. That rule is doing all the work for you.",
    steps:[
      {off:-2, time:"afternoon", what:"Mention it's going around",
       script:"half my partner's office has some stomach thing",
       note:"Attribute the outbreak to somewhere nobody can check."},
      {off:-1, time:"late", what:"Leave a little early, quietly",
       script:"Heading off a bit early — stomach's off.",
       note:"Quietly is the whole instruction. No drama."},
      {off:0, time:"06:15", what:"Call it in",
       script:"It's the stomach thing. I'm out today — the guidance is 48 hours clear before I'm back around people.",
       note:"Citing 'the guidance' makes it policy, not preference."},
      {off:1, kind:"second", time:"08:00", what:"Take the second day the guidance gave you",
       script:"Still inside the 48. Back tomorrow, I'll pick up everything then.",
       note:"Only if you asked for two days. Don't get greedy on the fly."},
      {off:1, time:"16:00", what:"Reappear in writing before you reappear in person",
       script:"Caught up on the thread — I'll take the Tuesday item.",
       note:"Coming back with one concrete commitment ends the conversation."}
    ],
    dont:["Don't be seen eating a large lunch on day one back.","Don't specify symptoms. Nobody wants that and it dates you as a liar.","Don't return early to look heroic — it undoes the 48-hour logic."]
  },
  {
    id:"flu", name:"Influenza-like illness", ideal:3, min:2, max:6, risk:0.82, holds:3,
    blurb:"Needs a runway. Give it three days of visible decline and it buys you two.",
    dx:"Influenza-like illness, febrile", advice:"Rest, fluids, exclude from workplace while febrile.",
    doc:"Flu. It's the classic because it's structural — it arrives slowly, so you have to start being sick before you're sick. Most people skip that part. Most people get caught.",
    steps:[
      {off:-3, time:"morning", what:"Be slightly worse than normal",
       script:"I'm knackered and I slept fine, which is annoying",
       note:"Fatigue first. Always fatigue first. It's the only symptom nobody can see."},
      {off:-2, time:"afternoon", what:"Add one physical detail",
       script:"my whole back aches — I think I'm coming down with something",
       note:"Aches, not a cough. Coughs invite people to listen for a cough."},
      {off:-1, time:"15:00", what:"Pre-announce the risk",
       script:"Heads up: I feel like I'm getting whatever's going round. If I'm worse tomorrow I'll have to call it.",
       note:"This single message converts tomorrow's absence from a surprise into a forecast you already filed."},
      {off:-1, time:"evening", what:"Clear your desk in public",
       script:"", note:"Hand off one small thing before you leave. Sick people tidy. Liars don't."},
      {off:0, time:"06:45", what:"Confirm the forecast",
       script:"It landed. Fever overnight, feeling wrecked. I'm out today — I'll reassess tonight.",
       note:"'I'll reassess tonight' quietly reserves tomorrow without asking for it."},
      {off:1, kind:"second", time:"07:30", what:"Take day two if you booked it",
       script:"Still running a temperature. Out again — everything's in the doc, I've flagged the two urgent ones.",
       note:"Do the flagging the night before, from bed, at 22:40. The timestamp is the alibi."},
      {off:1, time:"09:15", what:"Return at 80%",
       script:"Back but slow. Give me till this afternoon for anything big.",
       note:"Nobody comes back from flu at 100%. Returning fresh and cheerful is the classic mistake."}
    ],
    dont:["Don't be energetic in your first meeting back.","Don't be tagged anywhere in a photo for the whole window.","Don't cough theatrically. Under-act. Always under-act."]
  },
  {
    id:"sinus", name:"Acute sinusitis", ideal:3, min:2, max:6, risk:0.74, holds:1,
    blurb:"Mild, dull, and boring enough that no one interrogates it.",
    dx:"Acute sinusitis", advice:"Symptomatic relief; avoid air travel; rest.",
    doc:"Sinusitis. It's unglamorous, which is its strength. It won't get you a week, but nobody has ever doubted a blocked face.",
    steps:[
      {off:-2, time:"any time", what:"Sound slightly wrong",
       script:"", note:"Talk half a tone flatter. Say 'sorry, blocked up' once and never again."},
      {off:-1, time:"16:30", what:"Mention the pressure, not the mucus",
       script:"Got that pressure behind my face — sinus thing starting.",
       note:"Pressure sounds medical. The other word sounds like a cold, and colds don't get days."},
      {off:0, time:"07:15", what:"Call it in flatly",
       script:"Sinuses are fully blocked, head's pounding. I'm no good on calls today — I'll work through email if I can.",
       note:"Offering email costs you nothing and buys enormous goodwill."},
      {off:0, time:"13:00", what:"Send two emails and stop",
       script:"", note:"Two. From a phone. Short. Then done for the day."},
      {off:1, time:"09:00", what:"Return audibly congested",
       script:"Better. Still sound like this though.",
       note:"Keep the flat voice one extra day. It's free credibility."}
    ],
    dont:["Don't take a call with a clear voice.","Don't claim a fever — sinusitis doesn't need one and fevers get questioned.","Don't ask for two days. This one is worth exactly one."]
  },
  {
    id:"back", name:"Mechanical lower back strain", ideal:5, min:3, max:21, risk:0.79, holds:3,
    blurb:"Perfect for jobs with a commute. Invisible, believable, ages well.",
    dx:"Mechanical lower back strain", advice:"Avoid prolonged sitting and travel; mobilise gently.",
    doc:"Back. Nobody can see it, everybody has had it, and the moment you say the word 'commute' the conversation is over.",
    steps:[
      {off:-4, time:"any time", what:"Stand up wrong, once, in public",
       script:"ugh — did something to my back at the weekend",
       note:"Weekend injuries are unverifiable and blame nobody at work. That's the point."},
      {off:-2, time:"afternoon", what:"Adjust your chair. Loudly.",
       script:"this chair is not helping",
       note:"Now the office is a contributing factor. Nobody wants to pursue that thread."},
      {off:-1, time:"end of day", what:"Set the expectation",
       script:"Back's worse today. If I can't sit properly tomorrow I'll have to work flat or take the day.",
       note:"Two exits offered. They'll usually pick the generous one for you."},
      {off:0, time:"07:00", what:"Take it",
       script:"Seized up overnight — I can't sit or do the commute today. Taking it as sick, back tomorrow.",
       note:"'Can't do the commute' is the load-bearing clause. Keep it."},
      {off:1, time:"09:00", what:"Come back and stand up a lot",
       script:"Better. Going to stand for a bit of today.",
       note:"Standing for one meeting sells this for a month."}
    ],
    dont:["Don't lift anything heavy in front of anyone for a week.","Don't be seen at the gym. Ever. Not once.","Don't sit through a two-hour meeting without shifting at least twice."]
  },
  {
    id:"procedure", name:"Scheduled minor procedure", ideal:9, min:5, max:60, risk:0.94, holds:1,
    blurb:"The professional's choice. Book it in the calendar and never call in sick at all.",
    dx:"Attending scheduled outpatient appointment", advice:"Day of rest advised post-procedure.",
    doc:"This is the one I'd use. You don't call in sick — you book a medical appointment weeks ahead, in the shared calendar, titled nothing. It's not a lie you tell on the morning. It's an entry in a system.",
    steps:[
      {off:-14, time:"any time", what:"Put it in the calendar now",
       script:"", note:"Title it 'Appt — out' and mark it private. Fourteen days out, nobody looks. Two days out, everybody does."},
      {off:-7, time:"any time", what:"Say it out loud once, casually",
       script:"I've got an appointment on the {DDAY}, it's in the calendar.",
       note:"Once. In passing. Then never mention it again until the day."},
      {off:-1, time:"16:00", what:"Do the handover properly",
       script:"Reminder I'm out tomorrow for the appointment — {ONE} is covered, {TWO} can wait till Thursday.",
       note:"A real handover is the strongest possible signal that this is legitimate. Do it well."},
      {off:0, time:"08:00", what:"One line. No detail.",
       script:"At the appointment this morning — I'll be off the rest of the day.",
       note:"Never name the procedure. 'Appointment' is complete. Detail is what breaks people."},
      {off:1, time:"09:00", what:"Return and say nothing about it",
       script:"", note:"If asked: 'all fine, thanks.' Full stop. Anyone who pushes past that is being rude and knows it."}
    ],
    dont:["Don't invent a diagnosis. You will be asked about it in six months.","Don't move the date once it's in the calendar — moved appointments look invented.","Don't take a second one within the quarter."]
  },
  {
    id:"stone", name:"Renal colic", ideal:0, min:0, max:2, risk:0.87, holds:2,
    blurb:"Arrives at 4am, gone by tomorrow. You'll be telling this one for years.",
    dx:"Suspected renal colic", advice:"Analgesia, fluids; review if fever develops.",
    doc:"Kidney stone. Nothing to set up — it turns up at four in the morning and it's the worst pain of your life. It buys the day cleanly. The cost is that it's memorable: you're signing up to tell this story at every leaving do for the rest of your career.",
    steps:[
      {off:0, time:"04:50", what:"Message from the middle of the night",
       script:"Up since three with something in my side — worst pain I've ever had. Getting it looked at. Out today.",
       note:"The 04:50 timestamp does more work than any sentence you could write. Send it and put the phone down."},
      {off:0, time:"11:30", what:"One update, then nothing",
       script:"Been given something for the pain. Told to wait it out.",
       note:"'Given something for the pain' explains the next eight hours of silence and every typo in them."},
      {off:1, kind:"second", time:"08:00", what:"Blame the drugs, not the stone",
       script:"Still floored by whatever they gave me. Back tomorrow.",
       note:"Day two is the medication, never the pain. Nobody argues with the medication."},
      {off:1, time:"09:30", what:"Return quiet and mildly haunted",
       script:"Passed, apparently. Would not recommend.",
       note:"Carry a water bottle everywhere for a week. It's the only prop this one needs and it's free."}
    ],
    dont:["Don't offer to describe it. People ask. There is no good answer.","Don't say which side — you will get it wrong in six weeks.","Don't use this twice at the same company. Once is drama, twice is fiction."]
  },
  {
    id:"plumber", name:"Domestic emergency — water", ideal:0, min:0, max:2, risk:0.82, holds:2,
    blurb:"Not an illness. Doesn't need to be. There's a man coming and a four-hour window.",
    dx:"Non-medical absence; domestic emergency", advice:"None. Do not hand this note to anyone.",
    doc:"That isn't an illness and you know it. It's better than one. It's boring, it's somebody else's fault, and it comes with a stranger who gives you a four-hour window. In thirty years I have never once heard of anybody checking a leak.",
    steps:[
      {off:0, time:"06:20", what:"Report the water, not your feelings",
       script:"Woke up to water coming through the kitchen ceiling. Emergency plumber's coming between 8 and 12. I'm going to have to take today.",
       note:"Name the hours. A window is the most credible detail available to you — specific, external, and nobody's going to ring him."},
      {off:0, time:"12:40", what:"Give the window an outcome",
       script:"He's been. Needs a part, back tomorrow morning.",
       note:"Optional. Say it only if you want tomorrow — it costs nothing and quietly reserves the day."},
      {off:1, kind:"second", time:"08:00", what:"Cash the part",
       script:"Second visit this morning, I'll be online after.",
       note:"'After' means two o'clock. Do not appear at 09:15 having sent this."},
      {off:1, time:"09:00", what:"Come back annoyed, not stressed",
       script:"Sorted. Ceiling's a state but it's dry.",
       note:"Annoyed people had a boring problem. Stressed people are managing a story."}
    ],
    dont:["Don't mention insurance — that's a two-week storyline you'll have to maintain.","Don't post anything from anywhere that isn't your home that day.","Don't reuse this. Two floods is a housing situation, not an excuse."]
  },
  {
    id:"kid", name:"Dependant care — child sent home", ideal:0, min:0, max:4, risk:0.9, holds:3,
    blurb:"The only absence nobody in the building is allowed to look annoyed about.",
    dx:"Absence for dependant care", advice:"None required; statutory in most jurisdictions.",
    doc:"If you have a small one, this is the strongest card in the deck and it isn't close. Nursery rings, there's a temperature, the policy says forty-eight hours. It isn't even a lie about you — and nobody in your building is permitted to look annoyed about it.",
    steps:[
      {off:0, time:"07:10", what:"Lead with their policy, not your child",
       script:"Nursery's just called — the little one's got a temperature and they won't have them back for 48 hours. I'm out today, I'll pick things up tonight.",
       note:"The forty-eight hours is not your rule, it's theirs. Quote it once and let it do the arguing for you."},
      {off:0, time:"20:30", what:"Reappear at bedtime, briefly",
       script:"Catching up now — read the thread, nothing needs me tonight.",
       note:"A 20:30 message is the entire performance. It says you'd have worked if you could, which is the only thing anybody actually wants to hear."},
      {off:1, kind:"second", time:"07:15", what:"Day two was written yesterday",
       script:"Still inside the 48 — back Thursday.",
       note:"You pre-loaded this. Add no new information; just point at the clock."},
      {off:1, time:"09:00", what:"Return without apologising twice",
       script:"Back — thanks for covering.",
       note:"Once. Repeated apologies turn an ordinary absence into a favour you now owe."}
    ],
    dont:["Don't do this without a child. It ends badly and it ends fast.","Don't add an illness of your own on top. One absence, one cause.","Don't bring the child onto a video call to prove it. It reads as exactly what it is."]
  },
  {
    id:"vertigo", name:"Acute labyrinthitis", ideal:1, min:0, max:5, risk:0.85, holds:3,
    blurb:"Can't drive, can't read a screen, can't be disproved. Migraine's better-behaved cousin.",
    dx:"Acute labyrinthitis with vertigo", advice:"Avoid driving and heights; rest; may persist several days.",
    doc:"Vertigo. Invisible, unprovable, and it takes driving off the table without you ever saying the word 'commute'. It also lingers plausibly, which a migraine doesn't — a migraine that lasts three days is a migraine somebody starts asking about.",
    steps:[
      {off:-1, time:"afternoon", what:"Stand up too fast. Once. Near someone.",
       script:"whoa — head rush. that's the third one today",
       note:"Say 'head rush', not 'dizzy'. A head rush is a thing that happens to people. Dizzy is a thing people claim."},
      {off:0, time:"06:50", what:"Lead with the driving",
       script:"Room spins every time I move my head — came on overnight. Can't drive, can't really look at a screen. Out today.",
       note:"Driving ends the negotiation. If you don't drive, 'can't get down the stairs' does the same job."},
      {off:0, time:"15:00", what:"Reply badly, on purpose",
       script:"sorry - lying still, will read properly tmrw",
       note:"One lowercase line with a typo in it, then stop. Immaculate punctuation from a spinning room is the tell."},
      {off:1, kind:"second", time:"08:00", what:"Day two writes itself",
       script:"Fine lying down, goes as soon as I stand. Giving it one more day.",
       note:"Vertigo is expected to last. You're not asking a favour, you're reporting a timeline."},
      {off:1, time:"09:30", what:"Return moving carefully",
       script:"Mostly gone. Still turning my whole body instead of my head.",
       note:"Turn your whole body once, in one meeting. Nobody will consciously notice and everybody will believe you."}
    ],
    dont:["Don't drive to the office the next day if anyone knows your car.","Don't scroll your phone in public for two days — that's the one thing this illness forbids.","Don't call it 'vertigo' and then take the stairs at speed."]
  },
  {
    id:"sprain", name:"Ankle sprain", ideal:2, min:0, max:7, risk:0.76, holds:3,
    blurb:"Cheap to fake, expensive to maintain. You will still be limping on Friday.",
    dx:"Lateral ankle ligament sprain, grade I", advice:"Rest, ice, compression, elevation; limit weight-bearing.",
    doc:"An ankle. The most physical lie in the book — you have to walk wrong for a week while people watch. But it explains a commute, a stairwell and a very slow Monday, and it happened at the weekend where there were no witnesses.",
    steps:[
      {off:-2, time:"any time", what:"Do it at the weekend, in the retelling",
       script:"went over on my ankle on a kerb, of all the stupid things",
       note:"A kerb. Not sport, not a night out. Sport invites questions about your fitness; a night out invites the other kind."},
      {off:-1, time:"morning", what:"Be fine, but slower",
       script:"",
       note:"Take the lift once, where someone sees. Don't limp yet — the swelling comes first and everybody knows that."},
      {off:0, time:"07:20", what:"Call it on the swelling",
       script:"Ankle's ballooned overnight — I can't get a shoe on it, never mind the commute. Keeping it up today.",
       note:"'Can't get a shoe on' is the sentence. Concrete, faintly absurd, completely unanswerable."},
      {off:1, kind:"second", time:"08:00", what:"Day two, if you booked it",
       script:"Still can't put weight through it. I'll work off the sofa today and be in tomorrow.",
       note:"Offering the sofa costs you an hour and buys the whole second day."},
      {off:1, time:"09:00", what:"Come back limping. Keep limping.",
       script:"Much better. Just slow.",
       note:"Limp on the correct side. Write down which side. People remember the side."}
    ],
    dont:["Don't limp on Tuesday and not on Wednesday — the taper has to be gradual.","Don't take the stairs two at a time when you're late. That's how this one dies.","Don't accept a lift from anyone who'll watch you get out of the car."]
  },
  {
    id:"jab", name:"Post-vaccination reaction", ideal:2, min:1, max:60, risk:0.87, holds:2,
    blurb:"Go and actually have the jab. Then the only lie left is how bad it was.",
    dx:"Systemic reaction following immunisation", advice:"Rest, fluids, antipyretics as required.",
    doc:"My favourite kind: mostly true. Book a real vaccination — flu, travel, whatever's going — actually attend, and tell people beforehand. Next day you feel rotten. Maybe you do and maybe you don't; nobody alive can tell you otherwise, and half your office has the same story.",
    steps:[
      {off:-3, time:"any time", what:"Book something real",
       script:"I'm getting my flu jab Thursday, it's in the calendar.",
       note:"Actually book it. Actually go. From here you're not lying about anything except a temperature, and temperatures are private."},
      {off:-1, time:"16:00", what:"Report the jab, plant the possibility",
       script:"Had the jab. Arm's already sore — last one flattened me for a day, so fingers crossed.",
       note:"'Last one' does everything. You've forecast tomorrow without asking for it."},
      {off:0, time:"07:00", what:"Collect",
       script:"It's got me. Achy, feverish, arm like a rock. I'll be no use today.",
       note:"Fever and a sore arm is the published side-effect profile. You're not describing an illness, you're reciting a leaflet."},
      {off:1, kind:"second", time:"08:30", what:"Be careful with day two",
       script:"Still wiped out. One more and I'll be right.",
       note:"Two days off a jab is unusual. If your manager is the checking kind, don't take it — take the goodwill instead."},
      {off:1, time:"09:00", what:"Return and praise your own immune system",
       script:"Fine now. Apparently that means it worked.",
       note:"That line closes the topic and makes you sound like someone who gets vaccinated. Both useful."}
    ],
    dont:["Don't claim a jab you didn't have. Someone will ask which arm at the worst possible moment.","Don't book it the day before something you obviously want to miss.","Don't still be mentioning the arm on Friday. Nobody's arm hurts on Friday."]
  },
  {
    id:"stress", name:"Stress-related absence", ideal:2, min:0, max:7, risk:0.7, holds:3,
    blurb:"The one you're not faking. Handled badly it costs you; handled properly it costs nothing.",
    dx:"Stress-related illness", advice:"Rest; consider workload review; follow up if persistent.",
    doc:"(He puts the pen down.) This one I'll write for real. Understand what you're choosing: it's legitimate, it's protected, and in most places it is also remembered. So we say it in the language that travels — you're unwell today, you're back tomorrow, and any conversation about why happens later, on a day you pick.",
    steps:[
      {off:-1, time:"any time", what:"Change nothing",
       script:"",
       note:"No setup. Setup is for stories. This one doesn't need a runway, and building one only makes it look built."},
      {off:0, time:"07:00", what:"Say the small true thing",
       script:"Not well today — I've not been sleeping and I'm no use to anyone like this. Taking it as sick, back tomorrow.",
       note:"'Back tomorrow' is the whole move. It turns a worrying message into an ordinary one and keeps the bigger conversation on your calendar, not theirs."},
      {off:0, time:"all day", what:"Actually take the day",
       script:"",
       note:"Laptop shut, out of the flat, phone in a drawer. A day spent refreshing the thread you're absent from is a day you'll have to take again next week."},
      {off:1, kind:"second", time:"07:30", what:"If one wasn't enough, say so plainly",
       script:"One more day. Back Thursday properly.",
       note:"Plain and finite. No detail, no apology, no diagnosis you'd have to maintain afterwards."},
      {off:1, time:"09:30", what:"Return without a confession",
       script:"Back — much better for the day, thanks.",
       note:"You owe nobody an account. If you do want the workload conversation, book it separately, in a room, on a day you've slept."}
    ],
    dont:["Don't send the long honest message at 23:00. Write it, sleep, send three lines in the morning.","Don't give one colleague the real version and your manager the short one. Those two talk.","Don't stack this on top of a fake illness the same month — that's how a real thing starts to look like a habit."]
  },
  {
    id:"chest", name:"Lower respiratory tract infection", ideal:4, min:3, max:10, risk:0.79, holds:3,
    blurb:"A cold that got ambitious. People have to hear it coming for days.",
    dx:"Acute bronchitis / lower respiratory tract infection", advice:"Rest, fluids; review if fever persists beyond five days.",
    doc:"A chest infection is a cold with ambition. You need three or four days of runway because the whole trick is that people hear it arrive. Do the cough badly on Monday and nobody questions Thursday.",
    steps:[
      {off:-4, time:"morning", what:"Cough twice. Badly.",
       script:"",
       note:"Twice in a day, both times mid-sentence, and apologise for it. A performed cough is loud and frequent. A real one interrupts you."},
      {off:-3, time:"any time", what:"Blame the building",
       script:"everyone on this floor has the same cough",
       note:"Shared causes can't be falsified, and they recruit witnesses who'll say 'yeah, it's going round' on your behalf."},
      {off:-2, time:"afternoon", what:"Sound tired of it",
       script:"this thing's gone to my chest",
       note:"'Gone to my chest' is the escalation. Say it once, on a Tuesday, and never repeat it."},
      {off:-1, time:"16:30", what:"File the forecast",
       script:"Not shifting. If it's like this tomorrow I'll get it looked at rather than sit here coughing at everyone.",
       note:"You've now announced an absence and a doctor's appointment while committing to neither."},
      {off:0, time:"07:00", what:"Confirm, and cite the doctor",
       script:"Saw someone this morning — chest infection. Told to rest it properly or it drags on for a month. Out today.",
       note:"'Or it drags on' converts your day off into their risk management."},
      {off:1, kind:"second", time:"08:00", what:"Take the second day the doctor gave you",
       script:"Doing as I was told — one more day and I'll be back properly.",
       note:"The instruction came from a professional. You are merely being obedient."},
      {off:1, time:"09:15", what:"Return still coughing",
       script:"Better. Sorry about the cough, it'll be here a fortnight.",
       note:"One cough per meeting for a week. Cheapest maintenance in this document, and it retroactively proves everything."}
    ],
    dont:["Don't cough on video calls — a microphone makes every cough sound fake.","Don't be seen running, cycling or carrying anything upstairs for a week.","Don't mention antibiotics. Half your office knows they don't work on this and one of them will say so."]
  },
  {
    id:"shingles", name:"Shingles", ideal:5, min:3, max:30, risk:0.86, holds:3,
    blurb:"Hurts before it shows. Serious enough that people stop asking questions.",
    dx:"Herpes zoster (shingles)", advice:"Antivirals if within 72h; avoid contact with non-immune persons; rest.",
    doc:"Shingles. It hurts before it shows, which is exactly the shape you want — days of vague nerve pain, then a rash under your clothing that nobody is going to ask to see. It's also serious enough that a decent manager stops asking and a bad one gets nervous.",
    steps:[
      {off:-5, time:"any time", what:"Misdiagnose it yourself, out loud",
       script:"I've got a weird burning patch on my side — think I've pulled something",
       note:"Nobody inventing an illness gets it wrong on purpose. Getting it wrong first is the proof."},
      {off:-3, time:"afternoon", what:"Be tired with it",
       script:"still burning. and I'm shattered",
       note:"Two symptoms, one of them boring. The fatigue is what makes the rest credible."},
      {off:-1, time:"16:00", what:"Get it looked at, publicly",
       script:"Getting this rash checked in the morning — hopefully it's nothing.",
       note:"Book it out loud. This is the last message where you sound relaxed."},
      {off:0, time:"10:30", what:"Come back with the name",
       script:"It's shingles. On antivirals, and told to stay away from anyone who hasn't had chickenpox — that's half the floor. Out for a few days.",
       note:"The contagion clause does the work. You're not requesting time, you're reporting a restriction."},
      {off:1, kind:"second", time:"09:00", what:"The rest of it is already granted",
       script:"Still on the tablets, still sore. Everything's handed over.",
       note:"Nobody negotiates the length of shingles. Don't volunteer an early return date."},
      {off:1, time:"09:30", what:"Return tender and boring",
       script:"On the mend. Still can't have a bag strap on that side.",
       note:"One small physical concession, mentioned once, then never again."}
    ],
    dont:["Don't offer to show anyone. Obviously. People still do.","Don't claim it twice in five years — recurrence is unusual and somebody's aunt is a nurse.","Don't be seen in a gym, a pool, or anything sleeveless for a fortnight."]
  },
  {
    id:"optician", name:"Ophthalmology appointment", ideal:6, min:3, max:60, risk:0.91, holds:1,
    blurb:"A real appointment with a real side effect: an afternoon of useless eyes.",
    dx:"Ophthalmic examination; mydriatic drops administered", advice:"No driving or screen work for the remainder of the day.",
    doc:"Book a proper eye examination and ask for the retinal photographs. They put drops in, your pupils go wide, and for the rest of the day you can't drive and you can't focus on a screen. That's not a story, it's a side effect printed on a leaflet. You'll be telling the truth all day and getting the afternoon for it.",
    steps:[
      {off:-10, time:"any time", what:"Book it and put it in the shared calendar",
       script:"",
       note:"Title it 'Optician — drops, out from lunch'. Naming it makes it real; naming it early makes it furniture."},
      {off:-2, time:"any time", what:"Mention the drops once",
       script:"they're dilating my eyes on the {DDAY}, so I'll be useless after lunch",
       note:"Explain the mechanism, not the absence. You're describing a chemistry problem, not asking for anything."},
      {off:-1, time:"16:00", what:"Hand over the afternoon properly",
       script:"Reminder I'm out from midday tomorrow for the eye appointment — {ONE} is done, {TWO} can wait till Thursday.",
       note:"Handing over before you go is what separates this from calling in sick. Do it well and nobody thinks about it again."},
      {off:0, time:"13:30", what:"Report from behind sunglasses",
       script:"All done. Pupils are like dinner plates, everything's a blur — no use on a screen today. Back tomorrow.",
       note:"Send it from your phone, at arm's length, with two typos in it. Then stop."},
      {off:1, time:"09:00", what:"Return and mention nothing",
       script:"All fine — clean bill.",
       note:"If pressed: 'routine, they just do the photos now.' True, dull, finished."}
    ],
    dont:["Don't drive that afternoon. That part isn't a joke.","Don't book it for a Friday — a Friday afternoon looks chosen. A Wednesday looks medical.","Don't put it in the same quarter as any other appointment-shaped absence."]
  }
];

/* ── state ─────────────────────────────────────────────────── */
const S = { doc:DOCTORS[0], dday:null, lead:0, ill:null, days:null, work:null, boss:null };
let typing = null;

/* ── typewriter ───────────────────────────────────────────── */
function say(text, then) {
  const node = $("#say");
  if (typing) { clearInterval(typing); typing = null; }
  node.classList.remove("done");
  node.textContent = "";
  const ui = $("#ui"); ui.classList.remove("open"); ui.innerHTML = "";
  $("#calpop").hidden = true;
  const sc = $("#scene");
  if (sc.classList.contains("picking")) { sc.classList.remove("picking"); sc.classList.add("unpick"); }  // slide back to centre
  document.body.classList.add("talking");
  let i = 0;
  const tick = () => {
    node.textContent = text.slice(0, ++i);
    node.scrollTop = node.scrollHeight;        // portrait caps .say's height; keep the newest line visible
    if (i >= text.length) { clearInterval(typing); typing = null; node.textContent = text; node.classList.add("done"); document.body.classList.remove("talking"); then && then(); }
  };
  typing = setInterval(tick, 32);
  node.onclick = () => { if (typing) { clearInterval(typing); typing = null; node.textContent = text; node.classList.add("done"); node.scrollTop = node.scrollHeight; document.body.classList.remove("talking"); then && then(); } };
}

function mountUI(inner, twoCol = false) {
  const ui = $("#ui");
  ui.classList.remove("open");
  ui.classList.toggle("grid2", twoCol);
  ui.innerHTML = ""; ui.appendChild(inner);
  void ui.offsetHeight;                      // flush layout so the 0fr start applies
  setTimeout(() => ui.classList.add("open"), 20);
}

function options(list) {
  const inner = el("div", "ui-inner");
  list.forEach((o, i) => {
    const b = el("button", "opt", `<b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ""}`);
    b.style.setProperty("--i", i);
    b.onclick = o.go; inner.appendChild(b);
  });
  mountUI(inner, list.length >= 4);
}



/* ── flow ─────────────────────────────────────────────────── */
/* Side questions he'll tolerate before the consult starts. Each one burns
   a minute of the eleven and doesn't come back once asked. */
const SMALLTALK = [
  { label:"Is that monitor connected to anything?",
    sub:"The cable just runs off the edge of the desk.",
    reply:"No. It went dark in 2019 and IT have been collecting it 'next quarter' ever since. I kept up the typing — patients trust a doctor they can hear working, and the notes were always going in here anyway. (He taps his temple.)\n\nSix years, and you're the first person to ask. Keep the eye for detail — for the next few days it's going to be your entire immune system." },
  { label:"Is your name really Hugo Holmes?",
    sub:"It says Holm on the door.",
    reply:"Holm. No 'e', no 's', no deerstalker. Holmes worked out who was lying to him — I get told at the door and write it down anyway.\n\nHugo Holm. Say it fast and you'll hear the only prescription this clinic writes." },
];
let CHAT = 0;

function smalltalk(q) {
  q.asked = true; CHAT++;
  const clock = CHAT === 1 ? "\n\nTen minutes." : "\n\nNine minutes, and you still haven't told me when.";
  say(q.reply + clock, menu0);
}

function menu0() {
  options([
    { label:"I need a day off.", sub:"Straight to it. He respects that.", go:sceneDate },
    { label:"…how did you know?", sub:"Nobody healthy books a 4:40pm slot.", go:() =>
      say("Nobody who's actually ill books the last appointment of the day. They come in at nine, sweating, apologising.\n\nYou booked 4:40 and you're wearing shoes you can walk in. When's the day?", sceneDateUI) },
    ...SMALLTALK.filter(q => !q.asked).map(q => ({ label:q.label, sub:q.sub, go:() => smalltalk(q) })),
  ]);
}

function scene0() {
  $("#result").hidden = true; $("#scene").hidden = false; $("#back").hidden = true;
  say("Sit down. Door's closed, nobody's listening, and I've got eleven minutes.\n\nYou're not sick. Let's not do the part where you pretend.", menu0);
}

function sceneDate() {
  say("Good. Everyone else wastes four of the eleven minutes.\n\nWhen is it, and how long? A date on its own tells me nothing — three days in November and one day on Thursday are different illnesses.", sceneDateUI);
}

function sceneDateUI() {
  const start = today();
  let selA = S.dday && S.dday >= start ? S.dday : toWorkday(shift(start, 3), 1);   // first day off — kept if he sends you back
  let selB = S.days > 1 ? addWorkdays(selA, S.days - 1) : null;      // last day off
  let armed = false;                                                 // true = the next click may close the range
  let view = new Date(selA.getFullYear(), selA.getMonth(), 1);

  const inner = el("div", "ui-inner");
  const cal   = el("div", "cal");
  const head  = el("div", "cal-head");
  const prev  = el("button", "cal-nav", "‹");
  const title = el("span", "cal-title");
  const next  = el("button", "cal-nav", "›");
  head.append(prev, title, next);
  const grid  = el("div", "cal-grid");
  const foot  = el("div", "cal-foot");
  const lbl   = el("span", "cal-sel");
  const go    = el("button", "go", "That's the day");
  foot.append(lbl, go);
  cal.append(head, grid, foot);
  const durHint = el("p", "hint");
  inner.append(el("p", "hint", "First click is your first day off, second click is your last. Today counts as zero runway."), durHint);

  const monthEq = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  // Days off are working days. The weekend inside a Thursday-to-Monday range costs nothing.
  const workdaysIn = (a, b) => { let n = 0; for (let d = new Date(a); d <= b; d = shift(d, 1)) if (!isWeekend(d)) n++; return n; };
  const nDays = () => Math.max(1, workdaysIn(selA, selB || selA));

  function render() {
    title.textContent = view.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    prev.disabled = monthEq(view, start);
    grid.innerHTML = "";
    ["S","M","T","W","T","F","S"].forEach(d => grid.append(el("span", "cal-dow", d)));
    const first = view.getDay();                          // Sunday-first
    for (let i = 0; i < first; i++) grid.append(el("span"));
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const b = el("button", "cal-day", d);
      if (date < start) b.disabled = true;
      if (date.getTime() === start.getTime()) b.classList.add("today");
      if (date.getTime() === selA.getTime()) b.classList.add("sel");
      if (selB && date.getTime() === selB.getTime()) b.classList.add("sel");
      if (selB && date > selA && date < selB) b.classList.add("inrange");
      if (date.getDay() === 0 || date.getDay() === 6) b.classList.add("wkend");
      b.onclick = () => {
        if (armed && date > selA) { selB = date; armed = false; }   // second click closes the range
        else { selA = date; selB = null; armed = true; }           // any other click starts a new one
        render();
      };
      grid.append(b);
    }
    const n = nDays();
    const one = d => d.toLocaleDateString(undefined, { month:"short", day:"numeric" }).toUpperCase();
    lbl.innerHTML = `<b>${n} DAY${n > 1 ? "S" : ""}</b><span class="cal-range">` +
      (selB ? `${one(selA)} → ${one(selB)}`
            : selA.toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" }).toUpperCase()) + "</span>";
    go.textContent = selB ? "Those are the days" : "That's the day";
    durHint.textContent =
      n === 1 ? "One day. Cleanest, cheapest, hardest to catch." :
      n === 2 ? "Two days. Needs a story that survives a night." :
      n === 3 ? "Three days. He will look at you for a moment." :
                `${n} days. He has stopped writing.`;
    if (selB && workdaysIn(selA, selB) < Math.round((selB - selA) / DAY) + 1)
      durHint.textContent += " Weekends don't count — he's read your contract.";
  }
  prev.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); };
  next.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); };
  go.onclick = () => {
    S.dday = selA;
    S.lead = Math.round((selA - today()) / DAY);
    S.days = nDays();
    sceneIllness();
  };
  render();
  if (matchMedia("(min-width:761px)").matches) {
    const pop = $("#calpop");
    pop.innerHTML = ""; pop.appendChild(cal); pop.hidden = false;
    $("#scene").classList.remove("unpick");
    $("#scene").classList.add("picking");        // dialogue shoves left, calendar rises on the right
    mountUI(inner);                                  // tray keeps just the hint
  } else {
    inner.prepend(cal);                              // mobile: inline as before
    mountUI(inner);
  }
}

function dateVerdict() {
  const wd = S.dday.getDay(), L = S.lead;
  let a;
  if (L === 0) a = "Today. You've come to me *on the day*. That's not planning, that's a hostage negotiation. Your options are narrow and they all have to be fast-onset.";
  else if (L === 1) a = "Tomorrow. Of course it's tomorrow. One night of runway — enough to plant something, not enough to build it.";
  else if (L <= 4) a = `${L} days out. That's workable. That's an actual runway. You can be visibly unwell before you're absent, which is the whole trick.`;
  else if (L <= 10) a = `${L} days. Now you're being professional. At this range you don't have to call in sick at all — you can put something in a calendar and let a system do the lying for you.`;
  else a = `${L} days out. You're planning a sick day a fortnight ahead. I mean this kindly: you may not need a day off, you may need a different job.`;

  let b = "";
  if (wd === 1) b = " And it's a Monday. Everyone's grandmother dies on a Monday. It's survivable, but it costs you credibility you'll want later.";
  else if (wd === 5) b = " A Friday. You understand that everyone will assume it's a long weekend, including me, and I'm on your side.";
  else if (wd === 0 || wd === 6) b = " That's a weekend. I admire the ambition, but nobody needs a note for a Saturday. Pick a working day.";
  else if (wd === 3) b = " Midweek. Good. Wednesdays are invisible.";
  else b = " Midweek. Nobody suspects a Tuesday or a Thursday. Sensible.";
  return `${dow(S.dday)}, ${fmtMD(S.dday)}. ${a}${b}`;
}

// How far a condition is from the runway it wants. 0 = the date was made for it.
const fitOf = i => Math.abs(S.lead - i.ideal);

// The menu is drawn, not listed. One condition that genuinely suits the date anchors it;
// the other three are sampled at random, weighted towards a good fit, so the long shots
// surface occasionally and the same Tuesday never offers the same four options twice.
let lastPool = "";
function pickPool(n = 4) {
  const fits = ILLNESSES
    .filter(i => S.lead >= i.min && S.lead <= i.max)   // the runway the date allows
    .filter(i => S.days <= i.holds)                    // and the length the condition can carry
    .sort((a,b) => fitOf(a) - fitOf(b));
  if (fits.length <= n) return fits;

  const draw = () => {
    const best   = fits.filter(i => fitOf(i) === fitOf(fits[0]));
    const anchor = best[Math.floor(Math.random() * best.length)];
    const rest   = fits.filter(i => i !== anchor);
    const out    = [anchor];
    while (out.length < n) {
      const w = rest.map(i => 1 / (1 + fitOf(i)));       // near misses often, wild ones rarely
      let r = Math.random() * w.reduce((a,b) => a + b, 0), k = 0;
      while (k < w.length - 1 && (r -= w[k]) > 0) k++;
      out.push(rest.splice(k, 1)[0]);
    }
    return out.sort((a,b) => fitOf(a) - fitOf(b));
  };

  const key = p => p.map(i => i.id).sort().join();
  let pool = draw();
  if (key(pool) === lastPool) pool = draw();             // one re-roll, so back-to-back menus differ
  lastPool = key(pool);
  return pool;
}

function sceneIllness() {
  if (S.dday.getDay() === 0 || S.dday.getDay() === 6) {
    return say(dateVerdict(), sceneDateUI);
  }
  if (S.days > 3) return say(tooLong(), sceneDateUI);   // no date verdict first — he's not entertaining this one
  const pool = pickPool();
  if (!pool.length) return say(`${dateVerdict()}\n\n${nothingFits()}`, sceneDateUI);

  say(`${dateVerdict()}\n\n${daysVerdict()}`, () => {
    options(pool.map(i => ({
      label:i.name, sub:i.blurb,
      go:() => { S.ill = i; say(i.doc + "\n\nWhere do you work?", sceneWork); }
    })));
    $("#back").hidden = false;
    $("#back").onclick = sceneDateUI;
  });
}

function daysVerdict() {
  if (S.days === 1) return "One day. That's the cleanest thing you can ask me for — nothing to maintain, nothing for anyone to remember afterwards. Here's what that date supports.";
  if (S.days === 2) return "Two days. That needs a story that survives a night, which shuts about half the drawer. Here's what's left.";
  return "The rest of the week. (He stops writing for a moment.) That's not a sick day, that's a small holiday — it needs something that gets *worse* before it gets better, and there aren't many of those. Here's the short list.";
}

// Long absence, long runway: nothing in the catalogue arrives slowly enough to be scheduled
// and severely enough to keep you out for days. He says so rather than inventing one.
// Nothing in the catalogue holds more than three days, and he won't invent something that does.
function tooLong() {
  return `${S.days} days. (He caps the pen.) No. Three is my ceiling — past that it stops being a sick day and starts being a case. Cases mean follow-up notes, review dates, a form with my licence number on it, and I'm not getting struck off so you can miss a sprint.\n\nAnd honestly — if you need ${S.days} days away from that place, you're not ill, you're finished. That's not a sick note, it's a resignation letter, and you can write one of those yourself. Three days or fewer, or we're done here.`;
}

function nothingFits() {
  return `And ${S.days} days of it. (He shuts the drawer.) No. Anything that keeps you off that long arrives fast, and nothing that arrives fast can be booked in advance like a haircut. Shorten it, move it nearer, or take the holiday you've clearly earned — pick again.`;
}

function sceneWork() {
  options([
    { label:"In an office. People see me.", sub:"Physical performance required.", go:() => { S.work = "office"; sceneBoss(); } },
    { label:"Remote. Camera on, a lot.", sub:"Your face is the evidence.", go:() => { S.work = "camera"; sceneBoss(); } },
    { label:"Remote. Mostly messages.", sub:"Easy mode. Timestamps are your only tell.", go:() => { S.work = "async"; sceneBoss(); } },
  ]);
}

function sceneBoss() {
  say("Last one, and be honest, it changes the dose. Your manager.", () => options([
    { label:"Relaxed. Barely reads messages.", sub:"", go:() => { S.boss = "chill"; sceneWrite(); } },
    { label:"Watches everything. Notices timestamps.", sub:"", go:() => { S.boss = "hawk"; sceneWrite(); } },
    { label:"Does exactly this themselves.", sub:"", go:() => { S.boss = "peer"; sceneWrite(); } },
  ]));
}

// One breath before the paperwork — he reacts to the manager, then writes while he talks.
function sceneWrite() {
  const opener =
    S.boss === "hawk" ? "A timestamp-reader. Then we do this properly: everything you send goes out early, slow, and slightly broken. I've built that in." :
    S.boss === "peer" ? "A fellow practitioner. Then no performance — they can smell acting. Everything on this sheet is calibrated to *less*." :
    "Barely reads messages. Do you know how rare that is? Don't squander it by over-explaining. One line where two would do.";
  say(`${opener}

(He pulls the pad across and writes without looking up.) ${S.ill.name}. ${S.days} day${S.days > 1 ? "s" : ""}, starting ${dow(S.dday)}. The timings are on the sheet, the don'ts are at the bottom, and my name is on none of it.`, () => {
    const inner = el("div", "ui-inner");
    const b = el("button", "go", "Take the paperwork");
    b.onclick = finish;
    inner.appendChild(b);
    mountUI(inner);
  });
}

/* ── scoring ──────────────────────────────────────────────── */
function plausibility() {
  let p = S.ill.risk;
  const wd = S.dday.getDay();
  if (wd === 1) p -= .07;
  if (wd === 5) p -= .09;
  if (S.lead === 0) p -= .10;
  if (S.lead === 1) p -= .03;
  if (S.lead >= 5) p += .04;
  if (S.days === 2) p -= .04;
  if (S.days === 3) p -= .12;
  if (S.work === "camera") p -= .05;
  if (S.work === "async") p += .04;
  if (S.boss === "hawk") p -= .08;
  if (S.boss === "peer") p += .06;
  if (S.ill.id === "pinkeye" && S.work === "office") p += .05;
  if (S.ill.id === "back" && S.work === "office") p += .04;
  if (S.ill.id === "migraine" && S.work === "camera") p += .03;
  return Math.max(.28, Math.min(.97, p));
}

function extraSteps() {
  const out = [];
  if (S.work === "camera")
    out.push({ off:1, time:"first call back", what:"Camera on, lights down",
      script:"", note:"Sit further from the window and don't do your hair. One notch worse than usual is the entire performance." });
  if (S.work === "async")
    out.push({ off:0, time:"throughout", what:"Mind your timestamps",
      script:"", note:"Nothing from you between 09:00 and 16:00. Not a reaction emoji. Emoji have timestamps too." });
  if (S.work === "office")
    out.push({ off:1, time:"on arrival", what:"Be seen arriving slightly late",
      script:"", note:"Ten minutes. Not thirty. Thirty is a second story you'd have to maintain." });
  if (S.boss === "hawk")
    out.push({ off:-1, time:"22:30", what:"Leave a late-night trace",
      script:"Doing what I can from the sofa — the deck's updated.",
      note:"A 22:30 message from a person who feels rotten pre-empts the whole 'convenient timing' conversation." });
  if (S.boss === "peer")
    out.push({ off:0, time:"any time", what:"Say less, not more",
      script:"", note:"They know. They're not going to check. Over-explaining to a fellow practitioner is the only way to lose here." });
  return out;
}

/* ── output: one panel, three tabs, nothing scrolls ───────── */
// Nobody plants a symptom on a Saturday. Slide off-days onto working days.
// Setup beats count backwards in calendar days (rolled off weekends); everything from D-day
// onwards counts in *working* days, so a Friday sick day returns on Tuesday, not Sunday.
const dateFor = s =>
  s._d         ? s._d :
  s.off === 0  ? S.dday :
  s.off < 0    ? toWorkday(shift(S.dday, s.off), -1) :
  addWorkdays(S.dday, s.kind === "second" ? s.off : S.days + s.off - 1);
const relLabel = d => { const n = Math.round((d - S.dday) / DAY); return n === 0 ? "D-DAY" : n < 0 ? `D${n}` : `D+${n}`; };

let PLAN = [];

const fillIn = t => t
  .replace("{DDAY}", fmtMD(S.dday))
  .replace("{ONE}", "the Thursday review")
  .replace("{TWO}", "the invoice thing");


const clinic = () => S.doc.name.split(" ").pop().toUpperCase() + " FAMILY PRACTICE";

// Roll two setup beats off the same day. D-5 and D-3 both land on Friday when D-day is a
// Wednesday, which flattens a week of building up into one suspiciously busy afternoon.
// Walk the run-up backwards and give each beat its own working day, as far as the runway allows.
function spreadSetup(plan) {
  const setup = plan.filter(s => s.off < 0);
  const earliest = toWorkday(today(), 1);            // you can't plant a symptom before now
  let taken = null;
  for (let i = setup.length - 1; i >= 0; i--) {
    let d = dateFor(setup[i]);
    while (taken && d >= taken && d > earliest) d = toWorkday(shift(d, -1), -1);
    setup[i]._d = d;
    taken = d;
  }
}

function finish() {
  const ill = S.ill, p = plausibility();
  const restEnd = addWorkdays(S.dday, S.days - 1);

  // before D-day needs runway; "second day" beats exist only if more than one day is booked;
  // everything after D-day is authored relative to the first day back.
  const beatsIn = [...ill.steps, ...extraSteps()]
    .filter(s => s.off >= -S.lead)
    .filter(s => s.kind !== "second" || S.days > 1);
  beatsIn.forEach(s => s._d = null);                 // drop any dates cached by an earlier run
  PLAN = beatsIn.sort((a, b) => dateFor(a) - dateFor(b) || a.off - b.off);
  spreadSetup(PLAN);

  const beats = PLAN.map(s => {
    const d = dateFor(s);
    return `<li class="${s.off === 0 ? "dday" : ""}">
      <span class="node" aria-hidden="true"></span>
      <div class="card">
        <div class="when">${relLabel(d)} · ${fmt(d)} · ${s.time}</div>
        <div class="what">${s.what}</div>
        ${s.script ? `<div class="script">${fillIn(s.script)}</div>` : ""}
        ${s.note ? `<p class="why">${s.note}</p>` : ""}
      </div>
    </li>`;
  }).join("");

  $("#ptitle").textContent = `${ill.name} · ${dow(S.dday)} ${fmtMD(S.dday)}`;
  $("#sheet").innerHTML = `
    <div class="note">
      <div class="hd">
        <div>
          <h2>${clinic()}</h2>
          <div class="sub">General Practice · Occupational Absence · Suite 0</div>
        </div>
        <div class="meta">NOTE NO. ${String(Math.floor(Math.random()*9000)+1000)}<br>ISSUED ${fmt(today())}<br>LIC. 000-000-01</div>
      </div>
      <dl>
        <dt>PATIENT</dt><dd>The bearer of this page</dd>
        <dt>ASSESSMENT</dt><dd>${ill.dx}</dd>
        <dt>UNFIT FOR WORK</dt><dd>${fmt(S.dday)}${S.days > 1 ? ` — ${fmt(restEnd)}` : ""} <span class="dim">(${S.days} day${S.days>1?"s":""})</span></dd>
        <dt>ADVICE</dt><dd>${ill.advice}</dd>
        <dt>REVIEW</dt><dd>Not required. Do not come back to me about this.</dd>
      </dl>
      <div class="sig">
        <div><div class="scrawl">${S.doc.sig}</div><small>${S.doc.name}, ${S.doc.title}</small></div>
        <div class="sig-fine"><small>This is a joke document from a browser game.<br>It is not signed by anyone and proves nothing.</small></div>
      </div>
    </div>

    <div class="secttl">The plan</div>
    <p class="planline">${ill.name} · ${S.days} day${S.days>1?"s":""} off · ${S.lead} day${S.lead===1?"":"s"} of runway before it</p>
    <ol class="tl">${beats}</ol>

    <div class="secttl">The odds</div>
    <div class="odds">
      <div>
        <h3>Plausibility</h3>
        <div class="bigpct">${Math.round(p*100)}%</div>
        <div class="meter"><i style="width:${Math.round(p*100)}%"></i></div>
        <p>${verdictLine(p)}</p>
      </div>
      <div>
        <h3>Don't</h3>
        <ul class="dont">${ill.dont.map(d => `<li>${d}</li>`).join("")}</ul>
      </div>
    </div>
    <p class="endnote">${S.doc.name} · ${clinic()} · that's your eleven minutes</p>`;

  $("#scene").hidden = true; $("#result").hidden = false;
  $("#sheet").scrollTop = 0;
}

function verdictLine(p) {
  if (p >= .88) return "Solid. Follow the timings and this doesn't get questioned — and nobody remembers it in a month.";
  if (p >= .75) return "Fine. The weak point is timing, not the story. Send things early and reply slowly.";
  if (p >= .6)  return "Thin, but survivable. Do the day-before step properly — that's the one everybody skips and it's the one that carries it.";
  return "Honestly? This is where people get caught. Move the date, shorten it, or accept that someone will privately decide you were lying.";
}

function planText() {
  return [
    `SICK DAY PLAN — ${S.ill.name}`,
    `Target: ${dow(S.dday)} ${fmtMD(S.dday)} (${S.days} day${S.days>1?"s":""})`,
    `Plausibility: ${Math.round(plausibility()*100)}%`, ""
  ].concat(PLAN.map(s => {
    const d = dateFor(s);
    return `${relLabel(d)}  ${fmt(d)} ${s.time}\n  ${s.what}` +
      (s.script ? `\n  "${fillIn(s.script)}"` : "") + (s.note ? `\n  (${s.note})` : "");
  })).concat(["", "DON'T:", ...S.ill.dont.map(d => "- " + d)]).join("\n");
}

/* ── panel wiring ─────────────────────────────────────────── */
$("#print").onclick = () => window.print();
$("#again").onclick = () => {
  $("#result").hidden = true; $("#scene").hidden = false;
  say("Again? Ambitious. When, and for how long?", sceneDateUI);
};
$("#copy").onclick = e => navigator.clipboard.writeText(planText()).then(() => {
  e.target.textContent = "Copied."; setTimeout(() => e.target.textContent = "Copy plan", 1600);
});
addEventListener("keydown", e => {
  if (!$("#result").hidden) { if (e.key === "Escape") $("#again").click(); return; }
  if (e.target.tagName === "INPUT") return;
  if (typing) { $("#say").click(); return; }                  // any key fast-forwards
  if (e.key === "Enter") { const g = document.querySelector("#calpop:not([hidden]) .go, #ui .go"); if (g) g.click(); return; }
  const n = +e.key;
  if (n >= 1 && n <= 9) {
    const opts = document.querySelectorAll("#ui .opt");
    if (opts[n - 1]) opts[n - 1].click();
  }
});

scene0();
