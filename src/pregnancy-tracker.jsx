import { useState, useEffect } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const PREG_STORAGE_KEY = "crystal_pregnancy_tracker_v1";
const PREG_SESSION_KEY = "crystal_pregnancy_session_v1";
const PREG_SETTINGS_KEY = "crystal_pregnancy_settings_v1";
const PREG_RECS_KEY = "crystal_pregnancy_recs_v1";

// ─── TRIMESTER LOGIC ─────────────────────────────────────────────────────────
const getTrimester = (weeks) => {
  if (weeks <= 13) return 1;
  if (weeks <= 27) return 2;
  return 3;
};

// ─── EXERCISE LIBRARY ────────────────────────────────────────────────────────
// Each exercise can have t1/t2/t3 variants. If a variant exists for current trimester,
// it overrides the base. "home" variant overrides when location=home.

const DAYS = [
  { id: "MON", label: "Monday", short: "MON", subtitle: "Upper Pull + Row", emoji: "🚣", color: "#7AAE8E" },
  { id: "TUE", label: "Tuesday", short: "TUE", subtitle: "Lower Hinge + Single Leg", emoji: "🦵", color: "#9B8EC4" },
  { id: "WED", label: "Wednesday", short: "WED", subtitle: "Upper Push + Cardio", emoji: "💪", color: "#E8A87C" },
  { id: "THU", label: "Thursday", short: "THU", subtitle: "Lower Squat + Glute", emoji: "🏋️", color: "#C4788A" },
  { id: "FRI", label: "Friday", short: "FRI", subtitle: "Core + Light Cardio", emoji: "🌿", color: "#7AAEAE" },
  { id: "SAT", label: "Saturday", short: "SAT", subtitle: "Paddleboard · Optional", emoji: "🏄", color: "#7AAEC4", isOptional: true },
];

// ── MONDAY: Upper Pull + Row ──────────────────────────────────────────────────
const MON_WARMUP = {
  gym: "🚶 Walk from home → College Club (~0.6 mi, 10-12 min) counts as warm-up · Gentle incline heading north on Minor Ave E · Arm circles on arrival · Band pull-aparts ×15",
  home: "3 min march in place · Arm circles · Band pull-aparts ×15",
};

const MON_COOLDOWN = {
  gym: "🚶 Walk home → 0.6 mi easy cool-down · Let heart rate drop naturally · Nasal breathing the whole way",
  home: "5 min easy march or gentle stretch",
};

const MON_BLOCKS = [
  {
    id: "mon_A", label: "Block 1", accent: "#7AAE8E",
    duration: "8 min · E2MOM × 4 rounds",
    note: "Every 2 min — same split each round",
    rest: "30 sec between moves · 60 sec between rounds",
    exercises: [
      {
        id: "mon_row", label: "1A", name: "Row Erg", reps: "200m", sets: 4,
        muscles: "Full Body Cardio",
        tip: "Legs drive first, lean back, arms last. Same split every round — consistency over speed.",
        isCardio: true, noWeight: true,
        home: { name: "March in Place", reps: "40 sec", tip: "High knees, arms pumping. As fast as comfortable. Or jump rope ×40 sec (T1 only)." },
        t3: { name: "Row Erg (easy pace)", reps: "150m", tip: "Reduce distance and intensity. Focus on breathing — you should be able to talk throughout." },
      },
      {
        id: "mon_renegade", label: "1B", name: "Renegade Row", reps: "6/side", sets: 4,
        muscles: "Back + Biceps + Core",
        tip: "Wide feet for stability. No hip rotation. Drive elbow straight up. Core stays braced.",
        t2: { name: "Renegade Row", reps: "6/side", tip: "Widen feet further as belly grows for better base. Reduce weight if core feels strained." },
        t3: { name: "Seated Cable Row", reps: "12", tip: "Swap to seated to remove core compression demand. Sit tall, elbows drive back, squeeze shoulder blades." },
      },
    ],
  },
  {
    id: "mon_B", label: "Block 2", accent: "#5A9478",
    duration: "3 rounds",
    rest: "30 sec between moves · 60 sec between rounds",
    exercises: [
      {
        id: "mon_lat", label: "2A", name: "Lat Pulldown", reps: "10", sets: 3,
        muscles: "Lats + Biceps",
        tip: "Pull to upper chest, elbows drive down and back. Slight lean. The vertical pull that builds the V-taper.",
        t2: { name: "Lat Pulldown", reps: "10", tip: "Same movement. Sit tall — use the thigh pad. Reduce weight if seated position feels uncomfortable." },
        t3: { name: "Seated Band Pull-Down", reps: "12", tip: "Anchor band overhead, sit tall, pull to chest. Same motion, zero compression." },
        home: { name: "DB Bent-Over Row", reps: "12", tip: "Hinge at hips 45°, DBs hang down, elbows drive straight back. Best DB sub for the lat pulldown pattern — hits the same back muscles." },
      },
      {
        id: "mon_hammer", label: "2B", name: "DB Hammer Curl", reps: "12", sets: 3,
        muscles: "Brachialis + Biceps",
        tip: "Palms facing each other throughout. Controlled — no swinging. Hits the outer arm for thickness.",
        home: { name: "DB Hammer Curl", reps: "12", tip: "Palms facing each other throughout. Same as gym version — you have the DBs at home." },
      },
      {
        id: "mon_facepull", label: "2C", name: "Face Pull", reps: "15", sets: 3,
        muscles: "Rear Delt + External Rotators",
        tip: "Pull toward face, elbows flare high. Finish with hands by ears. Critical for shoulder health — never skip this.",
        home: { name: "DB Rear Delt Fly (on ball)", reps: "15", tip: "Lie face down over your pregnancy ball, arms hang down, raise them out to sides with elbows slightly bent. Hits rear delt perfectly and the ball is pregnancy-friendly." },
      },
    ],
  },
];

const MON_FINISHER = {
  id: "mon_finisher", accent: "#7AAE8E", duration: "4 min",
  circuit: [
    { label: "F1", name: "Row Erg", reps: "150m", tip: "Moderate pace — not a sprint. Smooth strokes.",
      home: { name: "Stair Climb or Jump Rope", reps: "40 sec", tip: "Up and down stairs × 40 sec, or jump rope (T1). March in place T2/T3." } },
    { label: "F2", name: "Band Pull-Apart", reps: "15", tip: "Arms straight, pull band to chest. Squeeze shoulder blades. Great postural reset." },
  ],
};

// ── TUESDAY: Lower Hinge + Single Leg ────────────────────────────────────────
const TUE_WARMUP = "🚶 Walk from home → College Club (~0.6 mi, 10-12 min) counts as warm-up · Hip prep on arrival: 90/90 stretch 60 sec/side · Banded clamshells ×15 · Glute bridge ×12 · World's greatest stretch ×5/side";
const TUE_COOLDOWN = "🚶 Walk home → easy cool-down · Focus on hip flexor stretch mid-walk — pause and lunge stretch if hips feel tight";

const TUE_SUPERSETS = [
  {
    id: "tue_A", label: "Superset A", accent: "#9B8EC4",
    rest: "60 sec between moves · 90 sec between rounds",
    note: "Posterior chain — hinge dominant",
    timing: { workMin: 2.5, restBetweenMoves: 1, restBetweenRounds: 1.5, rounds: 3, totalMin: 12 },
    exercises: [
      {
        id: "tue_rdl", label: "A1", name: "Romanian Deadlift", reps: "8", sets: 3,
        muscles: "Hamstrings + Glutes",
        tip: "Soft knee bend, push hips back, bar close to legs. Stop before lower back rounds.",
        isBB: true,
        t2: { name: "DB Romanian Deadlift", reps: "8", tip: "Switch to dumbbells at sides to give belly clearance. Same hinge pattern." },
        t3: { name: "Cable Pull-Through", reps: "12", tip: "Stand facing cable, rope at low setting. Hinge and drive hips through to standing. Safe all the way to birth." },
        home: { name: "DB Romanian Deadlift", reps: "10", tip: "DBs at sides, hinge at hips. Slow and controlled." },
      },
      {
        id: "tue_slbridge", label: "A2", name: "Single-Leg Glute Bridge", reps: "12/side", sets: 3,
        muscles: "Glutes (unilateral)",
        tip: "Pre-activate: 5 slow glute squeezes before right side. Drive through heel, squeeze at top. Closes left/right gap.",
        noWeight: true,
        t2: { name: "Single-Leg Glute Bridge", reps: "12/side", tip: "Add a light DB on hip if still comfortable lying supine. Stop if dizzy or uncomfortable lying flat." },
        t3: { name: "Standing Cable Kickback", reps: "15/side", tip: "Ankle cuff on cable. Stand facing machine, extend leg back and up. Fully upright — no lying down needed." },
      },
    ],
  },
  {
    id: "tue_B", label: "Superset B", accent: "#7B6EA4",
    rest: "60 sec between moves · 90 sec between rounds",
    note: "Single leg stability + lateral core",
    timing: { workMin: 2.5, restBetweenMoves: 1, restBetweenRounds: 1.5, rounds: 3, totalMin: 12 },
    exercises: [
      {
        id: "tue_lunge", label: "B1", name: "DB Reverse Lunge", reps: "10/side", sets: 3,
        muscles: "Quads + Glutes + Hip Stability",
        tip: "Step back — easier on knees than forward. Front knee over ankle. Torso upright.",
        t3: { name: "Step-Up with Hip Extension", reps: "10/side", tip: "Step onto box, drive trailing knee up, extend hip back at top. Hold one DB. Better balance than lunge in T3." },
        home: { name: "Reverse Lunge", reps: "10/side", tip: "Bodyweight or hold household items for light load. Same movement." },
      },
      {
        id: "tue_copenhagen", label: "B2", name: "Copenhagen Plank", reps: "25 sec/side", sets: 3,
        muscles: "Adductors + Lateral Core",
        tip: "Top foot on bench, bottom leg free. Stays every week — pelvic stability non-negotiable. Log L and R separately.",
        isCore: true, isTimed: true, noWeight: true,
        t3: { name: "Side-Lying Hip Abduction", reps: "15/side", tip: "Lie on side, lift top leg to 45°. Add ankle weight if available. Safer than plank in late pregnancy." },
        home: { name: "Copenhagen Plank", reps: "25 sec/side", tip: "Use couch or chair instead of bench. Same movement." },
      },
    ],
  },
];

const TUE_CORE = [
  {
    id: "tue_deadbug", label: "★1", name: "Dead Bug with DB Reach", reps: "10", sets: 2,
    muscles: "TVA + Deep Core",
    tip: "Lower back flat — no gap. Opposite arm + leg extend. Exhale on every extension. Stop if doming appears.",
    isCore: true,
    t3: { name: "Bird Dog", reps: "10/side", tip: "On hands and knees — no lying down. Opposite arm + leg. Same deep core activation, pregnancy safe." },
  },
  {
    id: "tue_birddog", label: "★2", name: "Bird Dog", reps: "10/side", sets: 2,
    muscles: "TVA + Anti-Rotation Core",
    tip: "Hands and knees. Opposite arm + leg, hold 2 sec. Back stays flat. Diastasis-safe all trimesters.",
    isCore: true, noWeight: true,
  },
];

// ── WEDNESDAY: Upper Push + Cardio ───────────────────────────────────────────
const WED_WARMUP = {
  gym: "🚶 Walk from home → College Club (~0.6 mi, 10-12 min) counts as warm-up · Chest opener stretch on arrival · Shoulder circles",
  home: "3 min march or stair climb · Chest opener stretch · Shoulder circles",
};

const WED_COOLDOWN = {
  gym: "🚶 Walk home → easy cool-down · Great time to do shoulder rolls and neck stretches as you go",
  home: "5 min gentle stretch",
};

const WED_BLOCKS = [
  {
    id: "wed_A", label: "Block 1", accent: "#E8A87C",
    duration: "3 rounds",
    rest: "30 sec between moves · 60 sec between rounds",
    timing: { workMin: 2, restBetweenMoves: 0.5, restBetweenRounds: 1, rounds: 3, totalMin: 10 },
    exercises: [
      {
        id: "wed_chest", label: "A1", name: "DB Chest Press", reps: "10", sets: 3,
        muscles: "Chest + Anterior Delt + Triceps",
        tip: "3-second lower. Feet flat, lower back neutral. The horizontal push that complements all the pulling.",
        t2: { name: "Incline DB Chest Press", reps: "10", tip: "Elevate bench to 30-45°. Reduces supine time as belly grows. Same slow eccentric." },
        t3: { name: "Standing Cable Chest Press", reps: "12", tip: "Cable at chest height, press forward. Fully upright — no lying down. Same chest activation." },
        home: { name: "Push-Ups (elevated if needed)", reps: "10", tip: "T1: full push-up. T2: hands elevated on couch. T3: standing wall push-up. Adjust as needed." },
      },
      {
        id: "wed_lateral", label: "A2", name: "DB Lateral Raise", reps: "15", sets: 3,
        muscles: "Lateral Deltoid",
        tip: "Lead with elbows, stop at shoulder height. Light weight — isolation. Builds the full shoulder cap look.",
        home: { name: "DB Lateral Raise", reps: "15", tip: "Same as gym version — you have the DBs at home. Lead with elbows, stop at shoulder height." },
      },
      {
        id: "wed_pushpress", label: "A3", name: "DB Push Press", reps: "8", sets: 3,
        muscles: "Shoulders + Triceps + Core",
        tip: "Slight knee dip, drive overhead. More stability demand than barbell. Core braced throughout.",
        t3: { name: "Seated DB Shoulder Press", reps: "10", tip: "Seated for stability. Strict press — no leg drive. Reduces balance demand in T3." },
        home: { name: "DB Push Press", reps: "8", tip: "Same movement at home with DBs." },
      },
    ],
  },
  {
    id: "wed_B", label: "Block 2", accent: "#D4925E",
    duration: "3 rounds",
    rest: "30 sec between moves · 60 sec between rounds",
    timing: { workMin: 1.5, restBetweenMoves: 0.5, restBetweenRounds: 1, rounds: 3, totalMin: 8 },
    exercises: [
      {
        id: "wed_cablerow", label: "B1", name: "Seated Cable Row", reps: "12", sets: 3,
        muscles: "Mid Back + Biceps",
        tip: "Drive elbows back, squeeze shoulder blades. Torso upright — don't lean back excessively.",
        home: { name: "DB Bent-Over Row", reps: "12", tip: "Hinge at hips, row DBs toward lower ribs, elbows drive back. Same pulling pattern as cable row." },
      },
      {
        id: "wed_kickback", label: "B2", name: "Tricep Kickback", reps: "10/side", sets: 3,
        muscles: "Triceps",
        tip: "Upper arm parallel to floor, extend fully at elbow. Squeeze at top for 1 sec. Keep weight lighter than your row.",
        home: { name: "DB Tricep Kickback", reps: "10/side", tip: "Same as gym version with your adjustable DBs. Upper arm parallel to floor, extend fully at elbow." },
      },
    ],
  },
];

const WED_FINISHER = {
  id: "wed_finisher", accent: "#E8A87C", duration: "5 min",
  note: "Row erg easy pace — or stair master if feeling it",
  isCardio: true,
  gym: "Row Erg × 5 min easy — conversational pace, nasal breathing if possible",
  home: "Stair climb × 5 min — mix forwards, backwards, lateral steps. Or incline walk outside.",
  gymOptional: "Stair Master × 5 min — try backwards steps (glutes) and lateral steps (hip abductors)",
};

// ── THURSDAY: Lower Squat + Glute ────────────────────────────────────────────
const THU_WARMUP = "🚶 Walk from home → College Club (~0.6 mi, 10-12 min) counts as warm-up · Hip prep on arrival: 90/90 stretch 60 sec/side · Banded clamshells ×15 · Glute bridge ×12 · Lateral band walk ×10 each way";
const THU_COOLDOWN = "🚶 Walk home → easy cool-down · Great time for glute squeezes with each step to reinforce the pattern";

const THU_SUPERSETS = [
  {
    id: "thu_A", label: "Superset A", accent: "#C4788A",
    rest: "60 sec between moves · 90 sec between rounds",
    note: "Squat dominant — quads + glutes",
    timing: { workMin: 2.5, restBetweenMoves: 1, restBetweenRounds: 1.5, rounds: 3, totalMin: 12 },
    exercises: [
      {
        id: "thu_goblet", label: "A1", name: "Goblet Squat", reps: "12", sets: 3,
        muscles: "Quads + Glutes + Core",
        tip: "KB or DB at chest. Squat deep, elbows track inside knees. 2-sec pause at bottom for hip mobility. Safer than barbell all trimesters.",
        home: { name: "Goblet Squat", reps: "12", tip: "Use any weighted object at home — heavy backpack, water jug. Same movement." },
      },
      {
        id: "thu_pallof", label: "A2", name: "Pallof Press (Standing)", reps: "12/side", sets: 3,
        muscles: "Anti-Rotation Core",
        tip: "Feet shoulder-width, soft knees. Press and hold 2 sec. Resist the cable pulling you. Standing version works all trimesters.",
        isCore: true,
        home: { name: "DB Suitcase Hold + Resist", reps: "30 sec/side", tip: "Hold a heavy DB in one hand at your side, stand tall, resist leaning toward it. Same anti-rotation core demand as Pallof. Alternatively use your physio ball: hold it at chest and resist twisting.", isTimed: true },
      },
    ],
  },
  {
    id: "thu_B", label: "Superset B", accent: "#A45870",
    rest: "60 sec between moves · 90 sec between rounds",
    note: "Glute loading — hip thrust progression",
    timing: { workMin: 2.5, restBetweenMoves: 1, restBetweenRounds: 1.5, rounds: 3, totalMin: 12 },
    exercises: [
      {
        id: "thu_bss", label: "B1", name: "Bulgarian Split Squat", reps: "8/side", sets: 3,
        muscles: "Quads + Glutes + Hip Stability",
        tip: "Rear foot elevated. Front knee tracks over 2nd toe. Strong base — monitor right knee as load increases.",
        t2: { name: "Reverse Lunge", reps: "10/side", tip: "Drop the rear elevation as balance shifts. Step back, front knee over ankle. Easier to control." },
        t3: { name: "Step-Up", reps: "10/side", tip: "Step onto box, full hip extension at top. Hold wall for balance if needed. Safe and effective T3." },
        home: { name: "Bulgarian Split Squat", reps: "8/side", tip: "Use couch for rear foot elevation. Same movement." },
      },
      {
        id: "thu_pullthr", label: "B2", name: "Cable Pull-Through", reps: "12", sets: 3,
        muscles: "Glutes + Hamstrings",
        tip: "Stand facing cable, rope attachment at lowest point. Hinge forward, then drive hips through to standing. Squeezes glutes at top. Safe all trimesters — replaces hip thrust.",
        home: { name: "DB Romanian Deadlift", reps: "12", tip: "Same hinge pattern as cable pull-through. DBs at sides, push hips back, feel the hamstring stretch. Same glute loading." },
      },
    ],
  },
];

const THU_CORE = [
  {
    id: "thu_bear", label: "★1", name: "Bear Plank Hold", reps: "20 sec", sets: 3,
    muscles: "TVA + Deep Core",
    tip: "Hands under shoulders, knees 1 inch off floor. Back flat. The best deep core move for pregnancy.",
    isCore: true, isTimed: true, noWeight: true,
    t3: { name: "Standing Wall Plank", reps: "30 sec", tip: "Hands on wall at chest height, walk feet back. Same TVA activation, fully upright." },
  },
  {
    id: "thu_carry", label: "★2", name: "Suitcase Carry", reps: "30 steps/side", sets: 3,
    muscles: "Lateral Core + Glutes",
    tip: "Heavy KB or DB, walk tall. Don't lean toward or away from the weight — pure resistance. Non-negotiable for pelvic stability.",
    isCore: true,
    t3: { name: "Suitcase Carry (lighter)", reps: "30 steps/side", tip: "Reduce weight as belly grows. Movement is more important than load here." },
  },
];

// ── FRIDAY: Core + Light Cardio ───────────────────────────────────────────────
const FRI_WARMUP = {
  gym: "🚶 Walk from home → College Club (~0.6 mi, 10-12 min) replaces treadmill warm-up · The incline heading north is your elevation work · Arrive ready to go",
  home: "5 min brisk walk outside — find a hill if possible. The walk IS the warm-up.",
};

const FRI_COOLDOWN = {
  gym: "🚶 Walk home → this IS your cardio finisher on Fridays · Keep a brisk pace · Optional: pause at the lake view for a moment 🌊",
  home: "Extend your walk by 5-10 min if feeling good",
};

const FRI_CIRCUIT = {
  id: "fri_circuit", label: "Circuit", accent: "#7AAEAE",
  duration: "3 rounds · ~15 min",
  note: "The most important session of the week. Never skip.",
  exercises: [
    {
      id: "fri_birddog", label: "1", name: "Bird Dog", reps: "10/side · 2 sec hold", sets: 3,
      muscles: "TVA + Anti-Rotation Core",
      tip: "On hands and knees. Opposite arm + leg, hold 2 sec at extension. Back flat, hips don't rotate. Safe all 40 weeks.",
      isCore: true, noWeight: true,
    },
    {
      id: "fri_deadbug", label: "2", name: "Dead Bug", reps: "10", sets: 3,
      muscles: "Deep Core + TVA",
      tip: "Lower back flat, exhale on extension. Stop immediately if you see doming (belly pressing up in a ridge). Switch to Bird Dog if that happens.",
      isCore: true, noWeight: true,
      t3: { name: "Bird Dog (extra set)", reps: "10/side", tip: "Replace Dead Bug with a third Bird Dog set in T3. No lying movements." },
    },
    {
      id: "fri_cablekick", label: "3", name: "Cable Kickback", reps: "15/side", sets: 3,
      muscles: "Glutes",
      tip: "Ankle cuff on low cable, stand facing machine. Extend leg back and up. Squeeze at top. Fully upright — safe all trimesters.",
      home: { name: "DB Kickback (on all fours)", reps: "15/side", tip: "On hands and knees, hold DB behind knee, extend leg back and up. Squeeze glute at top. Pregnancy-friendly position all trimesters." },
    },
    {
      id: "fri_bearplank", label: "4", name: "Bear Plank Hold", reps: "20 sec", sets: 3,
      muscles: "TVA + Deep Core",
      tip: "Knees 1 inch off floor. Back flat. Breathe steadily — don't hold your breath.",
      isCore: true, isTimed: true, noWeight: true,
      t3: { name: "Standing Wall Plank", reps: "30 sec", tip: "Hands on wall, walk feet back. Same deep core activation. Fully upright." },
    },
  ],
};

const FRI_FINISHER = {
  id: "fri_finisher", accent: "#5A9E9E", duration: "8 min",
  gym: "Incline treadmill walk — 3.0 speed, 8-10% grade. Conversational pace. Or easy row.",
  home: "Brisk outdoor walk — find a hill. Best pregnancy cardio option. Enjoy the fresh air.",
  note: "Conversational effort only — you should be able to hold a full sentence throughout",
};

// ─── EXERCISE ID LOOKUP FOR PASTE IMPORT ─────────────────────────────────────
const PREG_EX_NAME_TO_ID = {
  "row erg": "mon_row", "rowing": "mon_row",
  "renegade row": "mon_renegade",
  "lat pulldown": "mon_lat", "pull-down": "mon_lat",
  "hammer curl": "mon_hammer",
  "face pull": "mon_facepull",
  "romanian deadlift": "tue_rdl", "rdl": "tue_rdl",
  "single-leg glute bridge": "tue_slbridge", "single leg glute bridge": "tue_slbridge",
  "reverse lunge": "tue_lunge", "db reverse lunge": "tue_lunge",
  "copenhagen plank": "tue_copenhagen", "copenhagen": "tue_copenhagen",
  "dead bug": "tue_deadbug",
  "bird dog": "tue_birddog",
  "chest press": "wed_chest", "db chest press": "wed_chest",
  "lateral raise": "wed_lateral", "db lateral raise": "wed_lateral",
  "push press": "wed_pushpress", "db push press": "wed_pushpress",
  "seated cable row": "wed_cablerow", "cable row": "wed_cablerow",
  "tricep kickback": "wed_kickback", "kickback": "wed_kickback",
  "goblet squat": "thu_goblet",
  "pallof press": "thu_pallof",
  "bulgarian split squat": "thu_bss", "split squat": "thu_bss",
  "cable pull-through": "thu_pullthr", "pull-through": "thu_pullthr",
  "bear plank": "thu_bear", "bear plank hold": "thu_bear",
  "suitcase carry": "thu_carry",
  "cable kickback": "fri_cablekick",
};

function parseRecsFromText(text) {
  const results = {};
  for (const line of text.split("\n")) {
    const tableMatch = line.match(/\|\s*([^|]+?)\s*\|\s*[^|]*\s*\|\s*\*?\*?([^|*]+?)\*?\*?\s*\|/);
    if (tableMatch) {
      const name = tableMatch[1].trim().toLowerCase();
      const rec = parseRecValue(tableMatch[2].trim());
      if (rec) { const id = resolveExId(name); if (id) results[id] = rec; }
    }
  }
  return results;
}

function parseRecValue(raw) {
  const cleaned = raw.replace(/\*\*/g, "").trim();
  if (/^(hold|same|skip|—|n\/a|bodyweight|bw)/i.test(cleaned)) return { weight: "", reps: "", note: cleaned };
  const timed = cleaned.match(/(\d+)\s*sec/i);
  if (timed && !cleaned.match(/\d+\s*lbs?/i)) return { weight: "", reps: timed[1], note: "" };
  const full = cleaned.match(/(\d+\.?\d*)\s*lbs?\s*[x×]\s*(\d+)/i);
  if (full) return { weight: full[1], reps: full[2], note: "" };
  const lbsOnly = cleaned.match(/(\d+\.?\d*)\s*lbs?/i);
  if (lbsOnly) return { weight: lbsOnly[1], reps: "", note: "" };
  if (cleaned.length > 1 && cleaned.length < 80) return { weight: "", reps: "", note: cleaned };
  return null;
}

function resolveExId(nameLower) {
  if (PREG_EX_NAME_TO_ID[nameLower]) return PREG_EX_NAME_TO_ID[nameLower];
  for (const [key, id] of Object.entries(PREG_EX_NAME_TO_ID)) {
    if (nameLower.includes(key) || key.includes(nameLower.replace(/db |barbell |kb |cable /g, ""))) return id;
  }
  return null;
}

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === PREG_STORAGE_KEY) {
      Object.keys(parsed).forEach(day => {
        parsed[day] = parsed[day].map(s => ({ ...s, date: new Date(s.date) }));
      });
    }
    if (key === PREG_SESSION_KEY && parsed) parsed.date = new Date(parsed.date);
    return parsed;
  } catch { return fallback; }
}

function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── TRIMESTER ARC COMPONENT ─────────────────────────────────────────────────
function TrimesterArc({ weeks }) {
  const pct = Math.min(weeks / 40, 1);
  const r = 54;
  const cx = 70; const cy = 70;
  const startAngle = -200; const endAngle = 20;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + totalAngle * pct;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcX = (deg) => cx + r * Math.cos(toRad(deg));
  const arcY = (deg) => cy + r * Math.sin(toRad(deg));
  const largeArc = totalAngle * pct > 180 ? 1 : 0;
  const trimester = getTrimester(weeks);
  const trimColors = ["#7AAE8E", "#E8A87C", "#C4788A"];
  const color = trimColors[trimester - 1];

  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      <path
        d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 1 1 ${arcX(endAngle)} ${arcY(endAngle)}`}
        fill="none" stroke="#E8E4DE" strokeWidth="6" strokeLinecap="round"
      />
      {weeks > 0 && (
        <path
          d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 ${largeArc} 1 ${arcX(currentAngle)} ${arcY(currentAngle)}`}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#2C3440" fontSize="20" fontFamily="'Playfair Display', serif" fontWeight="700">{weeks}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9A9490" fontSize="9" fontFamily="'DM Sans', sans-serif" letterSpacing="1">WEEKS</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill={color} fontSize="9" fontFamily="'DM Sans', sans-serif" fontWeight="700" letterSpacing="1">T{trimester}</text>
    </svg>
  );
}

// ─── SET ROW ─────────────────────────────────────────────────────────────────
function SetRow({ setNum, data, onChange, accent, isTimed, noWeight }) {
  return (
    <div className="p-set-row">
      <span className="p-set-label">Set {setNum}</span>
      <div className="p-set-inputs">
        {!noWeight && (
          <div className="p-input-group">
            <label>lbs</label>
            <input type="number" placeholder="—" value={data.weight || ""} onChange={e => onChange({ ...data, weight: e.target.value })} style={{ "--fc": accent }} className="p-input" />
          </div>
        )}
        <div className="p-input-group">
          <label>{isTimed ? "secs" : "reps"}</label>
          <input type="number" placeholder="—" value={data.reps || ""} onChange={e => onChange({ ...data, reps: e.target.value })} style={{ "--fc": accent }} className="p-input" />
        </div>
        <button className={`p-done-btn ${data.done ? "done" : ""}`} style={data.done ? { background: accent, borderColor: accent, color: "#fff" } : { borderColor: accent + "66" }} onClick={() => onChange({ ...data, done: !data.done })}>
          {data.done ? "✓" : "○"}
        </button>
      </div>
    </div>
  );
}

// ─── EXERCISE CARD ────────────────────────────────────────────────────────────
function ExCard({ exercise, sessionData, onUpdate, accent, trimester, location, rec }) {
  const [expanded, setExpanded] = useState(false);
  const raw = sessionData || {};
  const setsData = Array.isArray(raw) ? raw : (raw.sets || Array(exercise.sets).fill({}));
  const notes = Array.isArray(raw) ? "" : (raw.notes || "");
  const doneCount = setsData.filter(s => s.done).length;

  // Resolve trimester/location variant
  const tKey = `t${trimester}`;
  const variant = (location === "home" && exercise.home) ? exercise.home
    : (exercise[tKey]) ? exercise[tKey]
    : exercise;
  const isSubbed = variant !== exercise;

  const emitUpdate = (sets, newNotes) => onUpdate({ sets, notes: newNotes !== undefined ? newNotes : notes });
  const updateSet = (i, val) => { const u = [...setsData]; u[i] = val; emitUpdate(u); };
  const autoFillAll = () => {
    const s1 = setsData[0] || {};
    if (!s1.weight && !s1.reps) return;
    emitUpdate(setsData.map((s, i) => i === 0 ? s : { ...s, weight: s1.weight, reps: s1.reps }));
  };
  const set1HasData = !!(setsData[0]?.weight || setsData[0]?.reps);

  return (
    <div className={`p-ex-card ${doneCount >= exercise.sets ? "p-ex-done" : ""}`}>
      <div className="p-ex-header" onClick={() => setExpanded(!expanded)}>
        <div className="p-ex-label-wrap">
          <span className="p-ex-label" style={{ background: accent, color: "#fff" }}>{exercise.label}</span>
          <div className="p-ex-name-block">
            <span className="p-ex-name">{variant.name || exercise.name}</span>
            {isSubbed && <span className="p-sub-badge">{location === "home" ? "🏠 home" : `T${trimester} mod`}</span>}
            <span className="p-muscles">{exercise.muscles}</span>
          </div>
        </div>
        <div className="p-ex-meta">
          {rec && <span className="p-rec-dot" style={{ color: accent }}>🎯</span>}
          <span className="p-ex-prescribed" style={{ color: "#B0ABA8" }}>{exercise.sets}×{variant.reps || exercise.reps}</span>
          <span className="p-ex-sets" style={{ color: accent }}>{doneCount}/{exercise.sets}</span>
          <span className="p-expand">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {rec && (
        <div className="p-rec-badge" style={{ borderColor: accent + "33", background: accent + "0d" }}>
          <span style={{ color: accent, fontSize: 11, fontWeight: 700 }}>🎯 Target: </span>
          {rec.weight && <span style={{ color: accent, fontSize: 11 }}>{rec.weight} lbs</span>}
          {rec.weight && rec.reps && <span style={{ color: "#B0ABA8", fontSize: 11 }}> × </span>}
          {rec.reps && <span style={{ color: accent, fontSize: 11 }}>{rec.reps} reps</span>}
          {!rec.weight && !rec.reps && rec.note && <span style={{ color: accent, fontSize: 11 }}>{rec.note}</span>}
          {rec.note && (rec.weight || rec.reps) && <span style={{ color: "#9A9490", fontSize: 11, fontStyle: "italic" }}> — {rec.note}</span>}
        </div>
      )}
      {expanded && (
        <div className="p-ex-body">
          <p className="p-tip">💡 {variant.tip || exercise.tip}</p>
          {set1HasData && exercise.sets > 1 && (
            <button className="p-autofill-btn" onClick={autoFillAll} style={{ borderColor: accent, color: accent }}>↓ Fill sets 2–{exercise.sets} from Set 1</button>
          )}
          {setsData.map((s, i) => (
            <SetRow key={i} setNum={i + 1} data={s} accent={accent} isTimed={exercise.isTimed} noWeight={exercise.noWeight || variant.noWeight} onChange={v => updateSet(i, v)} />
          ))}
          <div style={{ marginTop: 10 }}>
            <textarea className="p-notes-input" placeholder="Notes — weight feel, form, adjustments..." value={notes} onChange={e => emitUpdate(setsData, e.target.value)} rows={2} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLOCK CARD ───────────────────────────────────────────────────────────────
function BlockCard({ block, sessionData, onUpdate, trimester, location, recs }) {
  const exList = block.exercises || [];
  const totalDone = exList.reduce((acc, ex) => {
    const d = sessionData[ex.id];
    const sets = Array.isArray(d) ? d : (d?.sets || []);
    return acc + sets.filter(s => s.done).length;
  }, 0);
  const totalSets = exList.reduce((a, e) => a + e.sets, 0);
  const blockNotes = sessionData[`${block.id}_notes`] || "";

  return (
    <div className="p-block" style={{ borderTopColor: block.accent }}>
      <div className="p-block-header">
        <div className="p-block-title-row">
          <span className="p-block-pill" style={{ background: block.accent }}>{block.label}</span>
          <div>
            <div className="p-block-duration">{block.duration}</div>
            {block.rest && <div className="p-block-rest">{block.rest}</div>}
            {block.note && <div className="p-block-note">{block.note}</div>}
          </div>
        </div>
        <span className="p-block-progress" style={{ color: block.accent }}>{totalDone}/{totalSets}</span>
      </div>
      {block.timing && (
        <div className="p-timing-strip">
          <div className="p-timing-item"><span className="p-timing-label">Work</span><span className="p-timing-val" style={{ color: block.accent }}>~{block.timing.workMin}m</span></div>
          <div className="p-timing-div" />
          <div className="p-timing-item"><span className="p-timing-label">Between moves</span><span className="p-timing-val">{block.timing.restBetweenMoves * 60}s</span></div>
          <div className="p-timing-div" />
          <div className="p-timing-item"><span className="p-timing-label">Between rounds</span><span className="p-timing-val">{block.timing.restBetweenRounds * 60}s</span></div>
          <div className="p-timing-div" />
          <div className="p-timing-item"><span className="p-timing-label">Total</span><span className="p-timing-val" style={{ color: block.accent }}>~{block.timing.totalMin}m</span></div>
        </div>
      )}
      <div className="p-block-body">
        {exList.map((ex, i) => (
          <div key={ex.id}>
            <ExCard exercise={ex} sessionData={sessionData[ex.id]} onUpdate={v => onUpdate(ex.id, v)} accent={block.accent} trimester={trimester} location={location} rec={recs?.[ex.id]} />
            {i < exList.length - 1 && (
              <div className="p-connector">
                <div className="p-connector-line" style={{ borderColor: block.accent + "44" }} />
                <span className="p-connector-tag" style={{ color: block.accent, borderColor: block.accent + "44" }}>then</span>
                <div className="p-connector-line" style={{ borderColor: block.accent + "44" }} />
              </div>
            )}
          </div>
        ))}
        <textarea className="p-notes-input p-block-notes" placeholder={`${block.label} notes — rest times, effort, how it felt...`} value={blockNotes} onChange={e => onUpdate(`${block.id}_notes`, e.target.value)} rows={2} />
      </div>
    </div>
  );
}

// ─── CARDIO FINISHER CARD ─────────────────────────────────────────────────────
function CardioCard({ finisher, sessionData, onUpdate, location, trimester }) {
  const data = sessionData[finisher.id] || { notes: "", done: false };
  const update = patch => onUpdate(finisher.id, { ...data, ...patch });
  const description = location === "home" ? finisher.home : (finisher.gym || finisher.note);
  const optional = finisher.gymOptional;

  return (
    <div className="p-block" style={{ borderTopColor: finisher.accent }}>
      <div className="p-block-header">
        <div className="p-block-title-row">
          <span className="p-block-pill" style={{ background: finisher.accent }}>Cardio</span>
          <div>
            <div className="p-block-duration">{finisher.duration}</div>
            {finisher.note && <div className="p-block-note">{finisher.note}</div>}
          </div>
        </div>
        <button className={`p-done-btn ${data.done ? "done" : ""}`} style={data.done ? { background: finisher.accent, borderColor: finisher.accent, color: "#fff" } : { borderColor: finisher.accent + "66" }} onClick={() => update({ done: !data.done })}>
          {data.done ? "✓" : "○"}
        </button>
      </div>
      <div className="p-block-body">
        <p className="p-tip">🏃 {description}</p>
        {optional && location !== "home" && <p className="p-tip" style={{ marginTop: 6 }}>⭐ Optional: {optional}</p>}
        <textarea className="p-notes-input" placeholder="Notes — distance, pace, how it felt..." value={data.notes || ""} onChange={e => update({ notes: e.target.value })} rows={2} style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}

// ─── DAY WORKOUT VIEWS ────────────────────────────────────────────────────────
function CooldownCard({ cooldown, sessionData, onUpdate, color }) {
  const text = typeof cooldown === "string" ? cooldown : cooldown?.gym || cooldown;
  const data = sessionData["cooldown"] || { done: false };
  return (
    <div className="p-block" style={{ borderTopColor: color }}>
      <div className="p-block-header">
        <div className="p-block-title-row">
          <span className="p-block-pill" style={{ background: color }}>Cool-Down</span>
          <div className="p-block-duration">Walk home · ~10-12 min</div>
        </div>
        <button className={`p-done-btn ${data.done ? "done" : ""}`} style={data.done ? { background: color, borderColor: color, color: "#fff" } : { borderColor: color + "66" }} onClick={() => onUpdate("cooldown", { done: !data.done })}>
          {data.done ? "✓" : "○"}
        </button>
      </div>
      <div className="p-block-body">
        <p className="p-tip">{text}</p>
      </div>
    </div>
  );
}

function SaturdayView({ sessionData, onUpdate, trimester, location }) {
  const data = sessionData["sat_paddle"] || { duration: "", notes: "", done: false };
  const update = patch => onUpdate("sat_paddle", { ...data, ...patch });

  return (
    <div>
      <div className="p-warmup-card" style={{ borderColor: "#7AAEC444" }}>
        <div className="p-warmup-title" style={{ color: "#7AAEC4" }}>🏄 Paddleboard Day · Optional</div>
        <div className="p-warmup-text">Skip without guilt any week. When you go, this IS the workout — no gym needed.</div>
      </div>

      <div className="p-block" style={{ borderTopColor: "#7AAEC4" }}>
        <div className="p-block-header">
          <div className="p-block-title-row">
            <span className="p-block-pill" style={{ background: "#7AAEC4" }}>Session</span>
            <div>
              <div className="p-block-duration">Lake Union · College Club dock or home</div>
              <div className="p-block-note">Both locations available — your call</div>
            </div>
          </div>
          <button className={`p-done-btn ${data.done ? "done" : ""}`} style={data.done ? { background: "#7AAEC4", borderColor: "#7AAEC4", color: "#fff" } : { borderColor: "#7AAEC444" }} onClick={() => update({ done: !data.done })}>
            {data.done ? "✓" : "○"}
          </button>
        </div>
        <div className="p-block-body">
          <div style={{ marginBottom: 14 }}>
            <p className="p-tip" style={{ marginBottom: 10 }}>🌊 <strong style={{ color: "#2C3440" }}>Why paddleboarding is great pregnancy cardio:</strong> Low impact, zero joint stress, natural core engagement (especially the obliques and TVA that we work on all week), balance training that improves proprioception, and fresh air on Lake Union. It's also genuinely fun — which matters.</p>
            <p className="p-tip">⚠️ <strong style={{ color: "#2C3440" }}>Pregnancy notes:</strong> T1 — full SUP paddling, any duration. T2 — stay seated or kneeling if balance shifts, wear a leash and life jacket. T3 — seated paddle only, calm water, never alone. Always check with your OB if unsure.</p>
          </div>
          <div style={{ marginBottom: 10 }}>
            {[
              { icon: "🏄", title: "Steady paddle", desc: "20-30 min easy paddling. No racing. Conversational pace — you should be able to talk throughout." },
              { icon: "🔄", title: "Technique focus", desc: "Practice your stroke on both sides equally. Rotate from the torso, not the arms — this is oblique work." },
              { icon: "🧘", title: "With Miles", desc: "Miles on the board with you is a whole workout on its own. Embrace the chaos — it's balance training." },
            ].map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid #EDE9E3" : "none" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3440", marginBottom: 2 }}>{opt.title}</div>
                  <div style={{ fontSize: 11, color: "#9A9490", lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-input-group" style={{ alignItems: "stretch", marginBottom: 8 }}>
            <label style={{ textAlign: "left", marginBottom: 4 }}>Duration (min)</label>
            <input type="number" className="p-input" placeholder="e.g. 30" value={data.duration || ""} onChange={e => update({ duration: e.target.value })} style={{ textAlign: "left", "--fc": "#7AAEC4" }} />
          </div>
          <textarea className="p-notes-input" placeholder="Notes — conditions, distance, how it felt, Miles's reaction..." value={data.notes || ""} onChange={e => update({ notes: e.target.value })} rows={2} />
        </div>
      </div>
    </div>
  );
}

function MondayView({ sessionData, onUpdate, trimester, location, recs }) {
  const warmup = location === "home" ? MON_WARMUP.home : MON_WARMUP.gym;
  const cooldown = location === "home" ? MON_COOLDOWN.home : MON_COOLDOWN.gym;
  const t = trimester;
  const totalMin = location === "gym" ? "40-45" : "25-30";
  return (
    <div>
      <div className="p-warmup-card" style={{ borderColor: "#7AAE8E44" }}>
        <div className="p-warmup-title" style={{ color: "#7AAE8E" }}>{location === "gym" ? "🚶 Walk In · ~10-12 min" : "🔥 Warm-Up · 3 min"}</div>
        <div className="p-warmup-text">{warmup}</div>
      </div>
      <div className="p-time-banner" style={{ borderColor: "#7AAE8E33" }}>
        <span style={{ color: "#7AAE8E", fontWeight: 700 }}>⏱ ~{totalMin} min total</span>
        <span className="p-time-breakdown">{location === "gym" ? "12 walk · 18 blocks · 4 finisher · 12 walk home" : "3 warmup · 18 blocks · 4 finisher"}</span>
      </div>
      <div className="p-section-header">Blocks</div>
      {MON_BLOCKS.map(block => (
        <BlockCard key={block.id} block={block} sessionData={sessionData} onUpdate={onUpdate} trimester={t} location={location} recs={recs} />
      ))}
      <div className="p-section-header">Finisher</div>
      <div className="p-block" style={{ borderTopColor: MON_FINISHER.accent }}>
        <div className="p-block-header">
          <div className="p-block-title-row">
            <span className="p-block-pill" style={{ background: MON_FINISHER.accent }}>Finisher</span>
            <div className="p-block-duration">{MON_FINISHER.duration} · 2 rounds</div>
          </div>
          <span className="p-block-progress" style={{ color: MON_FINISHER.accent }}>
            {(sessionData[MON_FINISHER.id]?.done ? 1 : 0)}/1
          </span>
        </div>
        <div className="p-block-body">
          {MON_FINISHER.circuit.map((item, i) => {
            const desc = location === "home" && item.home ? item.home : item;
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <span className="p-ex-label" style={{ background: MON_FINISHER.accent, color: "#fff", marginRight: 6 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2C3440" }}>{desc.name}</span>
                <span style={{ fontSize: 11, color: "#9A9490", marginLeft: 8 }}>{item.reps}</span>
                <p className="p-tip" style={{ marginTop: 4, paddingLeft: 4 }}>{desc.tip}</p>
              </div>
            );
          })}
          <button
            className={`p-done-full-btn ${sessionData[MON_FINISHER.id]?.done ? "done" : ""}`}
            style={sessionData[MON_FINISHER.id]?.done ? { background: MON_FINISHER.accent, borderColor: MON_FINISHER.accent } : { borderColor: MON_FINISHER.accent }}
            onClick={() => onUpdate(MON_FINISHER.id, { ...sessionData[MON_FINISHER.id], done: !sessionData[MON_FINISHER.id]?.done })}
          >{sessionData[MON_FINISHER.id]?.done ? "✓ Finisher done" : "Mark finisher done"}</button>
        </div>
      </div>
      {location === "gym" && (<><div className="p-section-header">Cool-Down</div><CooldownCard cooldown={cooldown} sessionData={sessionData} onUpdate={onUpdate} color="#7AAE8E" /></>)}
    </div>
  );
}

function TuesdayView({ sessionData, onUpdate, trimester, location, recs }) {
  const totalMin = location === "gym" ? "40-45" : "29";
  return (
    <div>
      <div className="p-warmup-card" style={{ borderColor: "#9B8EC444" }}>
        <div className="p-warmup-title" style={{ color: "#9B8EC4" }}>{location === "gym" ? "🚶 Walk In + Hip Prep · ~15 min" : "🦋 Hip Prep · 5 min"}</div>
        <div className="p-warmup-text">{TUE_WARMUP}</div>
      </div>
      <div className="p-time-banner" style={{ borderColor: "#9B8EC433" }}>
        <span style={{ color: "#9B8EC4", fontWeight: 700 }}>⏱ ~{totalMin} min total</span>
        <span className="p-time-breakdown">{location === "gym" ? "12 walk · 5 hip prep · 24 supersets · 5 core · 12 walk home" : "5 hip prep · 24 supersets · 5 core"}</span>
      </div>
      <div className="p-section-header">Supersets</div>
      {TUE_SUPERSETS.map(ss => (
        <BlockCard key={ss.id} block={ss} sessionData={sessionData} onUpdate={onUpdate} trimester={trimester} location={location} recs={recs} />
      ))}
      <div className="p-section-header">Core</div>
      {TUE_CORE.map(ex => (
        <ExCard key={ex.id} exercise={ex} sessionData={sessionData[ex.id]} onUpdate={v => onUpdate(ex.id, v)} accent="#9B8EC4" trimester={trimester} location={location} rec={recs?.[ex.id]} />
      ))}
      {location === "gym" && (<><div className="p-section-header">Cool-Down</div><CooldownCard cooldown={TUE_COOLDOWN} sessionData={sessionData} onUpdate={onUpdate} color="#9B8EC4" /></>)}
    </div>
  );
}

function WednesdayView({ sessionData, onUpdate, trimester, location, recs }) {
  const warmup = location === "home" ? WED_WARMUP.home : WED_WARMUP.gym;
  const cooldown = location === "home" ? WED_COOLDOWN.home : WED_COOLDOWN.gym;
  const totalMin = location === "gym" ? "40-45" : "26";
  return (
    <div>
      <div className="p-warmup-card" style={{ borderColor: "#E8A87C44" }}>
        <div className="p-warmup-title" style={{ color: "#E8A87C" }}>{location === "gym" ? "🚶 Walk In · ~10-12 min" : "🔥 Warm-Up · 3 min"}</div>
        <div className="p-warmup-text">{warmup}</div>
      </div>
      <div className="p-time-banner" style={{ borderColor: "#E8A87C33" }}>
        <span style={{ color: "#E8A87C", fontWeight: 700 }}>⏱ ~{totalMin} min total</span>
        <span className="p-time-breakdown">{location === "gym" ? "12 walk · 18 blocks · 5 cardio · 12 walk home" : "3 warmup · 18 blocks · 5 cardio"}</span>
      </div>
      <div className="p-section-header">Blocks</div>
      {WED_BLOCKS.map(block => (
        <BlockCard key={block.id} block={block} sessionData={sessionData} onUpdate={onUpdate} trimester={trimester} location={location} recs={recs} />
      ))}
      <div className="p-section-header">Cardio Finisher</div>
      <CardioCard finisher={WED_FINISHER} sessionData={sessionData} onUpdate={onUpdate} location={location} trimester={trimester} />
      {location === "gym" && (<><div className="p-section-header">Cool-Down</div><CooldownCard cooldown={cooldown} sessionData={sessionData} onUpdate={onUpdate} color="#E8A87C" /></>)}
    </div>
  );
}

function ThursdayView({ sessionData, onUpdate, trimester, location, recs }) {
  const totalMin = location === "gym" ? "40-45" : "29";
  return (
    <div>
      <div className="p-warmup-card" style={{ borderColor: "#C4788A44" }}>
        <div className="p-warmup-title" style={{ color: "#C4788A" }}>{location === "gym" ? "🚶 Walk In + Hip Prep · ~15 min" : "🦋 Hip Prep · 5 min"}</div>
        <div className="p-warmup-text">{THU_WARMUP}</div>
      </div>
      <div className="p-time-banner" style={{ borderColor: "#C4788A33" }}>
        <span style={{ color: "#C4788A", fontWeight: 700 }}>⏱ ~{totalMin} min total</span>
        <span className="p-time-breakdown">{location === "gym" ? "12 walk · 5 hip prep · 24 supersets · 5 core · 12 walk home" : "5 hip prep · 24 supersets · 5 core"}</span>
      </div>
      <div className="p-section-header">Supersets</div>
      {THU_SUPERSETS.map(ss => (
        <BlockCard key={ss.id} block={ss} sessionData={sessionData} onUpdate={onUpdate} trimester={trimester} location={location} recs={recs} />
      ))}
      <div className="p-section-header">Core Finisher</div>
      {THU_CORE.map(ex => (
        <ExCard key={ex.id} exercise={ex} sessionData={sessionData[ex.id]} onUpdate={v => onUpdate(ex.id, v)} accent="#C4788A" trimester={trimester} location={location} rec={recs?.[ex.id]} />
      ))}
      {location === "gym" && (<><div className="p-section-header">Cool-Down</div><CooldownCard cooldown={THU_COOLDOWN} sessionData={sessionData} onUpdate={onUpdate} color="#C4788A" /></>)}
    </div>
  );
}

function FridayView({ sessionData, onUpdate, trimester, location, recs }) {
  const warmup = location === "home" ? FRI_WARMUP.home : FRI_WARMUP.gym;
  const cooldown = location === "home" ? FRI_COOLDOWN.home : FRI_COOLDOWN.gym;
  const totalMin = location === "gym" ? "40-45" : "28";
  return (
    <div>
      <div className="p-warmup-card" style={{ borderColor: "#7AAEAE44" }}>
        <div className="p-warmup-title" style={{ color: "#7AAEAE" }}>{location === "gym" ? "🚶 Walk In · replaces treadmill warm-up" : "🌿 Warm-Up · 5 min"}</div>
        <div className="p-warmup-text">{warmup}</div>
      </div>
      <div className="p-time-banner" style={{ borderColor: "#7AAEAE33" }}>
        <span style={{ color: "#7AAEAE", fontWeight: 700 }}>⏱ ~{totalMin} min total</span>
        <span className="p-time-breakdown">{location === "gym" ? "12 walk · 15 circuit · 8 cardio · 12 walk home (= cardio finisher)" : "5 warmup · 15 circuit · 8 cardio"}</span>
      </div>
      <div className="p-section-header">Core Circuit · 3 rounds</div>
      <BlockCard block={FRI_CIRCUIT} sessionData={sessionData} onUpdate={onUpdate} trimester={trimester} location={location} recs={recs} />
      <div className="p-section-header">Cardio Finisher</div>
      <CardioCard finisher={FRI_FINISHER} sessionData={sessionData} onUpdate={onUpdate} location={location} trimester={trimester} />
      {location === "gym" && (<><div className="p-section-header">Cool-Down / Cardio Finisher</div><CooldownCard cooldown={cooldown} sessionData={sessionData} onUpdate={onUpdate} color="#7AAEAE" /></>)}
    </div>
  );
}

// ─── PASTE RECS PANEL ─────────────────────────────────────────────────────────
function PasteRecsPanel({ recs, onUpdateRec, onClearRec }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [applied, setApplied] = useState(false);
  const recCount = Object.keys(recs).length;

  const handleParse = () => { setPreview(Object.entries(parseRecsFromText(text)).map(([id, rec]) => ({ id, rec }))); setApplied(false); };
  const handleApply = () => { if (!preview) return; preview.forEach(({ id, rec }) => onUpdateRec(id, rec)); setApplied(true); setTimeout(() => { setOpen(false); setText(""); setPreview(null); setApplied(false); }, 1800); };

  return (
    <div className="p-paste-panel">
      <button className="p-paste-toggle" onClick={() => { setOpen(o => !o); setPreview(null); }}>
        <span>📋 Paste Recommendations from Claude</span>
        {recCount > 0 && <span className="p-paste-count">{recCount} active</span>}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#9A9490" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="p-paste-body">
          <p className="p-paste-hint">Copy Claude's "Summary for next session" table and paste it below.</p>
          <textarea className="p-paste-textarea" placeholder="Paste Claude's summary table here..." value={text} onChange={e => { setText(e.target.value); setPreview(null); }} rows={5} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleParse} disabled={!text.trim()} className="p-paste-btn-sec">Preview</button>
            {preview?.length > 0 && (
              <button onClick={handleApply} className="p-paste-btn-pri" style={{ background: applied ? "#5A9478" : "#7AAE8E" }}>
                {applied ? "✓ Applied!" : `Apply ${preview.length} targets`}
              </button>
            )}
          </div>
          {preview !== null && (
            <div style={{ marginTop: 12 }}>
              {preview.length === 0
                ? <p style={{ fontSize: 12, color: "#C4788A", textAlign: "center" }}>No exercises recognised — try copying the full table.</p>
                : preview.map(({ id, rec }) => (
                  <div key={id} className="p-paste-preview-row">
                    <span style={{ fontSize: 12, color: "#5A6470", flex: 1 }}>{id.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: 12, color: "#7AAE8E", fontWeight: 700 }}>
                      {rec.weight ? `${rec.weight}lbs` : ""}{rec.reps ? ` × ${rec.reps}` : ""}{rec.note ? ` ${rec.note}` : ""}
                    </span>
                    <button onClick={() => setPreview(p => p.filter(x => x.id !== id))} style={{ background: "none", border: "none", color: "#C4B8B0", cursor: "pointer", fontSize: 14 }}>×</button>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HISTORY VIEW ─────────────────────────────────────────────────────────────
function HistoryView({ sessions, onCopy, copyMsg, onClear, recs, onUpdateRec, onClearRec }) {
  const [filter, setFilter] = useState("ALL");
  const allSessions = Object.entries(sessions)
    .flatMap(([day, list]) => list.map(s => ({ ...s, day })))
    .filter(s => filter === "ALL" || s.day === filter)
    .sort((a, b) => b.date - a.date);
  const dayMeta = id => DAYS.find(d => d.id === id) || {};

  return (
    <div>
      <PasteRecsPanel recs={recs} onUpdateRec={onUpdateRec} onClearRec={onClearRec} />
      <div className="p-filter-row">
        {["ALL", ...DAYS.map(d => d.id)].map(f => (
          <button key={f} className={`p-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f === "ALL" ? "All" : f}</button>
        ))}
      </div>
      {allSessions.length === 0
        ? <div className="p-empty">No sessions yet.<br />Complete a workout to build your history.</div>
        : allSessions.map(s => {
          const meta = dayMeta(s.day);
          return (
            <div key={s.id} className="p-session-card">
              <div className="p-session-header">
                <div>
                  <span className="p-session-tag" style={{ background: meta.color + "22", color: meta.color }}>{meta.label}</span>
                  <div className="p-session-date">{formatDate(s.date)}</div>
                </div>
                <span style={{ fontSize: 11, color: "#B0ABA8" }}>W{s.weeks || "?"}</span>
              </div>
              <div className="p-copy-section">
                <button className="p-copy-btn" onClick={() => onCopy(s.day, s)}>📋 Copy for Claude</button>
                {copyMsg === s.id && <span style={{ fontSize: 12, color: "#7AAE8E", fontWeight: 700 }}>Copied!</span>}
              </div>
            </div>
          );
        })
      }
      {allSessions.length > 0 && (
        <div style={{ textAlign: "center", padding: "20px 0 8px", borderTop: "1px solid #EDE9E3", marginTop: 8 }}>
          <p style={{ fontSize: 11, color: "#C4B8B0", marginBottom: 10 }}>💾 Saved to this browser</p>
          <button onClick={onClear} style={{ background: "none", border: "1px solid #DDD8D0", color: "#C4B8B0", borderRadius: 6, padding: "6px 14px", fontSize: 11, cursor: "pointer" }}>Clear All Data</button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PregnancyTracker() {
  const [settings, setSettings] = useState(() => loadStorage(PREG_SETTINGS_KEY, { weeks: 4, location: "gym" }));
  const [sessions, setSessions] = useState(() => loadStorage(PREG_STORAGE_KEY, { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [] }));
  const [currentSession, setCurrentSession] = useState(() => loadStorage(PREG_SESSION_KEY, null));
  const [recs, setRecs] = useState(() => { try { const r = localStorage.getItem(PREG_RECS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } });
  const [activeDay, setActiveDay] = useState("MON");
  const [mainTab, setMainTab] = useState("home");
  const [copyMsg, setCopyMsg] = useState("");
  const [saveFlash, setSaveFlash] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const trimester = getTrimester(settings.weeks);

  const updateSettings = (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    saveStorage(PREG_SETTINGS_KEY, updated);
  };

  const updateRec = (exId, rec) => {
    setRecs(prev => { const u = { ...prev, [exId]: rec }; saveStorage(PREG_RECS_KEY, u); return u; });
  };
  const clearRec = (exId) => {
    setRecs(prev => { const u = { ...prev }; delete u[exId]; saveStorage(PREG_RECS_KEY, u); return u; });
  };

  const startSession = (day) => {
    const s = { day, id: Date.now(), date: new Date(), weeks: settings.weeks, location: settings.location, data: {} };
    setCurrentSession(s);
    saveStorage(PREG_SESSION_KEY, s);
    setActiveDay(day);
    setMainTab("workout");
  };

  const updateExercise = (exId, val) => {
    setCurrentSession(prev => {
      const updated = { ...prev, data: { ...prev.data, [exId]: val } };
      saveStorage(PREG_SESSION_KEY, updated);
      return updated;
    });
  };

  const saveSession = () => {
    if (!currentSession) return;
    const { day } = currentSession;
    setSessions(prev => {
      const list = prev[day] || [];
      const idx = list.findIndex(s => s.id === currentSession.id);
      let updated;
      if (idx >= 0) { const u = [...list]; u[idx] = currentSession; updated = { ...prev, [day]: u }; }
      else updated = { ...prev, [day]: [currentSession, ...list] };
      saveStorage(PREG_STORAGE_KEY, updated);
      return updated;
    });
    saveStorage(PREG_SESSION_KEY, null);
    setCurrentSession(null);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
    setMainTab("home");
  };

  const discardSession = () => {
    if (window.confirm("Discard this session? All logged sets and notes will be lost.")) {
      saveStorage(PREG_SESSION_KEY, null);
      setCurrentSession(null);
      setMainTab("home");
    }
  };

  const copySession = (day, session) => {
    const lines = [`${day} PREGNANCY WORKOUT — Week ${session.weeks} (T${getTrimester(session.weeks)}) — ${formatDate(session.date)}`, ""];
    lines.push("", "---", "Share with Claude for weight recommendations.");
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopyMsg(session.id); setTimeout(() => setCopyMsg(""), 2000);
    });
  };

  const clearAll = () => {
    if (window.confirm("Delete all saved workout history? This cannot be undone.")) {
      [PREG_STORAGE_KEY, PREG_SESSION_KEY].forEach(k => { try { localStorage.removeItem(k); } catch {} });
      setSessions({ MON: [], TUE: [], WED: [], THU: [], FRI: [] });
      setCurrentSession(null);
    }
  };

  const dayColor = DAYS.find(d => d.id === activeDay)?.color || "#7AAE8E";
  const totalSessions = Object.values(sessions).reduce((a, l) => a + l.length, 0);
  const trimColors = ["#7AAE8E", "#E8A87C", "#C4788A"];
  const trimColor = trimColors[trimester - 1];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F1EB; color: #2C3440; font-family: 'DM Sans', sans-serif; }
        .p-app { max-width: 480px; margin: 0 auto; min-height: 100vh; background: #FAF7F2; }

        /* Header */
        .p-header { padding: 24px 20px 0; background: #FAF7F2; border-bottom: 1px solid #EDE9E3; }
        .p-header-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .p-title { font-family: 'Playfair Display', serif; font-size: 26px; color: #2C3440; line-height: 1.1; }
        .p-title span { color: #7AAE8E; }
        .p-subtitle { font-size: 11px; color: #9A9490; margin-top: 3px; text-transform: uppercase; letter-spacing: 1.5px; }
        .p-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .p-settings-btn { background: none; border: 1px solid #DDD8D0; border-radius: 6px; padding: 5px 10px; font-size: 11px; color: #9A9490; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .p-session-badge { font-size: 10px; color: #B0ABA8; }
        .p-session-badge strong { color: #7AAE8E; }

        /* Settings panel */
        .p-settings-panel { background: #F0EDE7; border-bottom: 1px solid #EDE9E3; padding: 16px 20px; }
        .p-settings-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .p-settings-row:last-child { margin-bottom: 0; }
        .p-settings-label { font-size: 12px; color: #5A6470; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .p-settings-val { font-size: 14px; color: #2C3440; font-weight: 700; }
        .p-weeks-ctrl { display: flex; align-items: center; gap: 12px; }
        .p-weeks-btn { background: #FAF7F2; border: 1px solid #DDD8D0; border-radius: 20px; width: 30px; height: 30px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #5A6470; }
        .p-loc-toggle { display: flex; background: #FAF7F2; border-radius: 8px; padding: 3px; border: 1px solid #DDD8D0; }
        .p-loc-btn { padding: 6px 14px; background: none; border: none; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #9A9490; cursor: pointer; transition: all 0.2s; }
        .p-loc-btn.active { background: #7AAE8E; color: #fff; }

        /* Tabs */
        .p-tabs { display: flex; border-bottom: 1px solid #EDE9E3; background: #FAF7F2; position: sticky; top: 0; z-index: 10; }
        .p-tab { flex: 1; padding: 12px 0; background: none; border: none; color: #B0ABA8; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; border-bottom: 2px solid transparent; }
        .p-tab.active { color: #7AAE8E; border-bottom-color: #7AAE8E; }

        .p-content { padding: 16px 16px 90px; }

        /* Home screen */
        .p-arc-section { display: flex; align-items: center; justify-content: space-between; background: #F0EDE7; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; border: 1px solid #EDE9E3; }
        .p-arc-info { flex: 1; }
        .p-arc-label { font-size: 11px; color: #9A9490; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
        .p-trim-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .p-arc-note { font-size: 12px; color: #7A8490; line-height: 1.5; }

        /* Day cards */
        .p-day-card { background: #fff; border: 1px solid #EDE9E3; border-radius: 14px; margin-bottom: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(44,52,64,0.04); }
        .p-day-card-header { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
        .p-day-card-left { display: flex; align-items: center; gap: 12px; }
        .p-day-emoji { font-size: 22px; }
        .p-day-label { font-family: 'Playfair Display', serif; font-size: 18px; color: #2C3440; }
        .p-day-sub { font-size: 11px; color: #9A9490; margin-top: 2px; }
        .p-day-start-btn { padding: 8px 18px; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.1s; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
        .p-day-start-btn:hover { transform: translateY(-1px); }
        .p-day-progress { height: 3px; }
        .p-day-continue-bar { padding: 8px 16px 10px; display: flex; align-items: center; justify-content: space-between; background: #FAFAF8; border-top: 1px solid #EDE9E3; }
        .p-continue-text { font-size: 11px; color: #9A9490; }
        .p-continue-btn { font-size: 11px; font-weight: 700; color: #7AAE8E; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        /* Workout view */
        .p-day-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; margin-bottom: 16px; }
        .p-day-tab { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 7px 14px; border-radius: 8px; border: 1.5px solid #DDD8D0; background: none; color: #9A9490; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.15s; }
        .p-day-tab.active { color: #fff; border-color: transparent; }

        .p-loc-indicator { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #9A9490; margin-bottom: 14px; }
        .p-loc-dot { width: 7px; height: 7px; border-radius: 50%; background: #7AAE8E; }

        /* Shared card styles */
        .p-warmup-card { border: 1px solid #EDE9E3; border-left-width: 3px; border-radius: 10px; padding: 13px 15px; margin-bottom: 14px; background: #fff; }
        .p-warmup-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .p-warmup-text { font-size: 12px; color: #7A8490; line-height: 1.6; }
        .p-time-banner { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid; border-radius: 8px; padding: 9px 13px; margin-bottom: 14px; }
        .p-time-breakdown { font-size: 11px; color: #B0ABA8; }
        .p-section-header { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #B0ABA8; text-transform: uppercase; margin: 18px 0 9px; }

        .p-block { background: #fff; border: 1px solid #EDE9E3; border-top-width: 2.5px; border-radius: 12px; margin-bottom: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(44,52,64,0.04); }
        .p-block-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #EDE9E3; background: #FAFAF8; }
        .p-block-title-row { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .p-block-pill { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; padding: 3px 9px; border-radius: 4px; color: #fff; flex-shrink: 0; text-transform: uppercase; }
        .p-block-duration { font-size: 12px; color: #5A6470; font-weight: 600; }
        .p-block-rest { font-size: 10px; color: #9A9490; margin-top: 1px; }
        .p-block-note { font-size: 10px; color: #B0ABA8; font-style: italic; margin-top: 1px; }
        .p-block-progress { font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .p-block-body { padding: 10px 10px 8px; }

        .p-timing-strip { display: flex; align-items: center; padding: 7px 14px; background: #F8F5F0; border-bottom: 1px solid #EDE9E3; }
        .p-timing-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .p-timing-label { font-size: 9px; color: #B0ABA8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; text-align: center; }
        .p-timing-val { font-size: 12px; font-weight: 700; color: #7A8490; }
        .p-timing-div { width: 1px; height: 24px; background: #EDE9E3; flex-shrink: 0; margin: 0 4px; }

        .p-connector { display: flex; align-items: center; gap: 8px; padding: 3px 5px; }
        .p-connector-line { flex: 1; border-top: 1.5px dashed; }
        .p-connector-tag { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 2px 7px; border: 1px solid; border-radius: 20px; white-space: nowrap; }

        .p-ex-card { background: #FAF7F2; border: 1px solid #EDE9E3; border-radius: 8px; margin-bottom: 2px; overflow: hidden; }
        .p-ex-done { background: #F0F5F1; border-color: #C4DDD0; }
        .p-ex-header { padding: 11px 12px; cursor: pointer; user-select: none; }
        .p-ex-label-wrap { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .p-ex-label { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; text-transform: uppercase; }
        .p-ex-name-block { flex: 1; min-width: 0; }
        .p-ex-name { display: block; font-size: 13px; font-weight: 600; color: #2C3440; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .p-sub-badge { display: inline-block; font-size: 9px; background: #E8F4EE; color: #5A9478; border-radius: 3px; padding: 1px 5px; margin-left: 4px; font-weight: 700; }
        .p-muscles { display: block; font-size: 10px; color: #9A9490; margin-top: 1px; }
        .p-ex-meta { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .p-rec-dot { font-size: 12px; }
        .p-ex-prescribed { font-size: 11px; font-weight: 500; }
        .p-ex-sets { font-size: 12px; font-weight: 700; }
        .p-expand { font-size: 9px; color: #B0ABA8; }

        .p-rec-badge { margin: 0 12px 8px; padding: 5px 9px; border: 1px solid; border-radius: 5px; font-size: 11px; }

        .p-ex-body { padding: 0 12px 12px; border-top: 1px solid #EDE9E3; }
        .p-tip { font-size: 11px; color: #9A9490; margin: 10px 0 11px; line-height: 1.5; font-style: italic; }

        .p-set-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
        .p-set-label { font-size: 10px; color: #B0ABA8; width: 36px; text-transform: uppercase; letter-spacing: 0.5px; }
        .p-set-inputs { display: flex; align-items: center; gap: 8px; flex: 1; }
        .p-input-group { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
        .p-input-group label { font-size: 8px; color: #B0ABA8; text-transform: uppercase; letter-spacing: 1px; }
        .p-input { width: 100%; background: #fff; border: 1px solid #DDD8D0; border-radius: 5px; padding: 7px 6px; color: #2C3440; font-family: 'DM Sans', sans-serif; font-size: 13px; text-align: center; outline: none; transition: border-color 0.15s; }
        .p-input:focus { border-color: var(--fc, #7AAE8E); }
        .p-done-btn { background: none; border: 1.5px solid; border-radius: 50%; width: 28px; height: 28px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; color: #B0ABA8; }
        .p-done-btn.done { color: #fff; }

        .p-autofill-btn { display: block; width: 100%; margin-bottom: 8px; background: none; border: 1px dashed; border-radius: 5px; padding: 5px 10px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; opacity: 0.6; }
        .p-autofill-btn:hover { opacity: 1; }

        .p-notes-input { width: 100%; background: #fff; border: 1px solid #EDE9E3; border-radius: 5px; padding: 7px 9px; color: #5A6470; font-family: 'DM Sans', sans-serif; font-size: 11px; outline: none; resize: none; line-height: 1.5; }
        .p-notes-input:focus { border-color: #7AAE8E; }
        .p-notes-input::placeholder { color: #C4B8B0; }
        .p-block-notes { margin-top: 8px; }

        .p-done-full-btn { width: 100%; margin-top: 10px; padding: 10px; background: none; border: 1.5px solid; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; color: #9A9490; }
        .p-done-full-btn.done { color: #fff; }

        /* Save bar */
        .p-save-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: rgba(250,247,242,0.97); backdrop-filter: blur(12px); border-top: 1px solid #EDE9E3; padding: 12px 16px; display: flex; gap: 8px; z-index: 20; }
        .p-btn-primary { background: #7AAE8E; color: #fff; border: none; padding: 12px 24px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 8px; cursor: pointer; flex: 1; }
        .p-btn-secondary { background: #FAF7F2; color: #9A9490; border: 1px solid #DDD8D0; padding: 12px 24px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 8px; cursor: pointer; flex: 1; }

        /* History */
        .p-paste-panel { background: #fff; border: 1px solid #C4DDD0; border-left: 3px solid #7AAE8E; border-radius: 10px; margin-bottom: 14px; overflow: hidden; }
        .p-paste-toggle { width: 100%; display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: none; border: none; color: #5A9478; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }
        .p-paste-count { background: #E8F4EE; color: #5A9478; border: 1px solid #C4DDD0; border-radius: 20px; padding: 2px 8px; font-size: 10px; font-weight: 700; }
        .p-paste-body { padding: 0 14px 14px; border-top: 1px solid #EDE9E3; }
        .p-paste-hint { font-size: 11px; color: #9A9490; margin: 10px 0; line-height: 1.6; }
        .p-paste-textarea { width: 100%; background: #FAF7F2; border: 1px solid #DDD8D0; border-radius: 5px; padding: 9px 10px; color: #5A6470; font-family: 'DM Sans', sans-serif; font-size: 11px; outline: none; resize: none; line-height: 1.6; }
        .p-paste-btn-sec { flex: 1; background: #FAF7F2; color: #7AAE8E; border: 1px solid #C4DDD0; border-radius: 6px; padding: 9px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
        .p-paste-btn-pri { flex: 1; color: #fff; border: none; border-radius: 6px; padding: 9px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; text-transform: uppercase; }
        .p-paste-preview-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #EDE9E3; }
        .p-paste-preview-row:last-child { border-bottom: none; }

        .p-filter-row { display: flex; gap: 6px; margin-bottom: 14px; overflow-x: auto; }
        .p-filter-btn { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; border-radius: 20px; border: 1px solid #DDD8D0; background: none; color: #9A9490; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
        .p-filter-btn.active { background: #EDE9E3; color: #2C3440; }
        .p-session-card { background: #fff; border: 1px solid #EDE9E3; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
        .p-session-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .p-session-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 2px 8px; border-radius: 3px; }
        .p-session-date { font-family: 'Playfair Display', serif; font-size: 18px; margin-top: 3px; }
        .p-copy-section { display: flex; align-items: center; gap: 8px; }
        .p-copy-btn { background: #FAF7F2; border: 1px solid #DDD8D0; color: #7A8490; border-radius: 6px; padding: 7px 12px; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer; text-transform: uppercase; }
        .p-empty { text-align: center; padding: 50px 20px; color: #B0ABA8; font-size: 13px; line-height: 1.8; }

        /* IVF notice */
        .p-ivf-notice { background: #FEF9F5; border: 1px solid #F0D8C4; border-left: 3px solid #E8A87C; border-radius: 10px; padding: 11px 14px; margin-bottom: 14px; }
        .p-ivf-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #E8A87C; margin-bottom: 3px; }
        .p-ivf-text { font-size: 11px; color: #A08060; line-height: 1.5; }
      `}</style>

      <div className="p-app">
        {/* Header */}
        <div className="p-header">
          <div className="p-header-top">
            <div>
              <div className="p-title">Crystal's <span>Prego</span> Conditioning</div>
              <div className="p-subtitle">College Club · {settings.location === "home" ? "Home Mode 🏠" : "Gym Mode 🏋️"}</div>
            </div>
            <div className="p-header-right">
              <button className="p-settings-btn" onClick={() => setShowSettings(s => !s)}>⚙ Settings</button>
              <div className="p-session-badge"><strong>{totalSessions}</strong> sessions</div>
            </div>
          </div>

          {showSettings && (
            <div className="p-settings-panel">
              <div className="p-settings-row">
                <span className="p-settings-label">Pregnancy Week</span>
                <div className="p-weeks-ctrl">
                  <button className="p-weeks-btn" onClick={() => updateSettings({ weeks: Math.max(1, settings.weeks - 1) })}>−</button>
                  <span className="p-settings-val">Week {settings.weeks}</span>
                  <button className="p-weeks-btn" onClick={() => updateSettings({ weeks: Math.min(40, settings.weeks + 1) })}>+</button>
                </div>
              </div>
              <div className="p-settings-row">
                <span className="p-settings-label">Today's Location</span>
                <div className="p-loc-toggle">
                  <button className={`p-loc-btn ${settings.location === "gym" ? "active" : ""}`} onClick={() => updateSettings({ location: "gym" })}>🏋️ Gym</button>
                  <button className={`p-loc-btn ${settings.location === "home" ? "active" : ""}`} onClick={() => updateSettings({ location: "home" })}>🏠 Home</button>
                </div>
              </div>
            </div>
          )}

          <div className="p-tabs">
            <button className={`p-tab ${mainTab === "home" ? "active" : ""}`} onClick={() => setMainTab("home")}>Home</button>
            <button className={`p-tab ${mainTab === "workout" ? "active" : ""}`} onClick={() => setMainTab("workout")}>Workout</button>
            <button className={`p-tab ${mainTab === "history" ? "active" : ""}`} onClick={() => setMainTab("history")}>History</button>
          </div>
        </div>

        <div className="p-content">

          {/* HOME TAB */}
          {mainTab === "home" && (
            <>
              {/* Trimester arc */}
              <div className="p-arc-section">
                <div className="p-arc-info">
                  <div className="p-arc-label">Your journey</div>
                  <span className="p-trim-badge" style={{ background: trimColor + "22", color: trimColor }}>
                    Trimester {trimester}
                  </span>
                  <div className="p-arc-note">
                    {trimester === 1 && "Building your foundation. Full program, full intensity."}
                    {trimester === 2 && "Adapting movements as your body changes. Still strong."}
                    {trimester === 3 && "Staying active and supported. Every session counts."}
                  </div>
                  {saveFlash && <div style={{ fontSize: 12, color: "#7AAE8E", fontWeight: 700, marginTop: 6 }}>✓ Session saved</div>}
                </div>
                <TrimesterArc weeks={settings.weeks} />
              </div>

              <div className="p-ivf-notice">
                <div className="p-ivf-title">⚠️ TWW / Early Pregnancy</div>
                <div className="p-ivf-text">Moderate intensity only. Avoid heavy loading and high-impact. Check with your RE if unsure. Listen to your body above all.</div>
              </div>

              {/* Day cards */}
              {DAYS.map(day => {
                const isActive = currentSession?.day === day.id;
                return (
                  <div key={day.id} className="p-day-card">
                    <div className="p-day-card-header" style={{ background: `linear-gradient(135deg, ${day.color}0d 0%, transparent 60%)` }}>
                      <div className="p-day-card-left">
                        <span className="p-day-emoji">{day.emoji}</span>
                        <div>
                          <div className="p-day-label" style={{ color: day.color }}>{day.label}</div>
                          <div className="p-day-sub">{day.subtitle}</div>
                          {day.isOptional && <div style={{ fontSize: 10, color: "#B0ABA8", marginTop: 1, fontStyle: "italic" }}>skip without guilt any week</div>}
                        </div>
                      </div>
                      {!isActive && (
                        <button className="p-day-start-btn" style={{ background: day.color }} onClick={() => startSession(day.id)}>{day.isOptional ? "Log" : "Start"}</button>
                      )}
                    </div>
                    {isActive && (
                      <div className="p-day-continue-bar">
                        <span className="p-continue-text">Session in progress</span>
                        <button className="p-continue-btn" onClick={() => { setActiveDay(day.id); setMainTab("workout"); }}>Continue →</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* WORKOUT TAB */}
          {mainTab === "workout" && (
            <>
              <div className="p-day-tabs">
                {DAYS.map(day => (
                  <button key={day.id} className={`p-day-tab ${activeDay === day.id ? "active" : ""}`} style={activeDay === day.id ? { background: day.color } : {}} onClick={() => setActiveDay(day.id)}>
                    {day.short}
                  </button>
                ))}
              </div>

              <div className="p-loc-indicator">
                <div className="p-loc-dot" style={{ background: settings.location === "home" ? "#E8A87C" : "#7AAE8E" }} />
                {settings.location === "home" ? "🏠 Home mode — exercises adapted" : "🏋️ College Club"}
                {" · "}Week {settings.weeks} · T{trimester}
              </div>

              {currentSession?.day === activeDay ? (
                <>
                  {activeDay === "MON" && <MondayView sessionData={currentSession.data} onUpdate={updateExercise} trimester={trimester} location={settings.location} recs={recs} />}
                  {activeDay === "TUE" && <TuesdayView sessionData={currentSession.data} onUpdate={updateExercise} trimester={trimester} location={settings.location} recs={recs} />}
                  {activeDay === "WED" && <WednesdayView sessionData={currentSession.data} onUpdate={updateExercise} trimester={trimester} location={settings.location} recs={recs} />}
                  {activeDay === "THU" && <ThursdayView sessionData={currentSession.data} onUpdate={updateExercise} trimester={trimester} location={settings.location} recs={recs} />}
                  {activeDay === "FRI" && <FridayView sessionData={currentSession.data} onUpdate={updateExercise} trimester={trimester} location={settings.location} recs={recs} />}
                  {activeDay === "SAT" && <SaturdayView sessionData={currentSession.data} onUpdate={updateExercise} trimester={trimester} location={settings.location} />}
                  <div style={{ height: 80 }} />
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "50px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{DAYS.find(d => d.id === activeDay)?.emoji}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 6, color: DAYS.find(d => d.id === activeDay)?.color }}>{DAYS.find(d => d.id === activeDay)?.label}</div>
                  <div style={{ fontSize: 13, color: "#9A9490", marginBottom: 24 }}>{DAYS.find(d => d.id === activeDay)?.subtitle}</div>
                  <button className="p-btn-primary" style={{ background: dayColor, maxWidth: 200, margin: "0 auto", display: "block" }} onClick={() => startSession(activeDay)}>Start Session</button>
                </div>
              )}
            </>
          )}

          {/* HISTORY TAB */}
          {mainTab === "history" && (
            <HistoryView sessions={sessions} onCopy={copySession} copyMsg={copyMsg} onClear={clearAll} recs={recs} onUpdateRec={updateRec} onClearRec={clearRec} />
          )}
        </div>

        {/* Save bar */}
        {currentSession && mainTab === "workout" && currentSession.day === activeDay && (
          <div className="p-save-bar">
            <button className="p-btn-secondary" onClick={discardSession}>Discard</button>
            <button className="p-btn-primary" style={{ background: dayColor }} onClick={saveSession}>Save Session ✓</button>
          </div>
        )}
      </div>
    </>
  );
}
