// ── Drill Library ─────────────────────────────────────────────────────────────

export const PRACTICE_TYPES = ["putting", "field", "net"];

export const PRACTICE_TYPE_LABELS = {
  putting: "Putting",
  field: "Field Work",
  net: "Net Work",
};

// Two-level hierarchy
export const STRUCTURE = {
  putting: {
    label: "Putting",
    sections: {
      confidence: { label: "Confidence Range", icon: "🎯" },
      pressure: { label: "Pressure Block", icon: "💪" },
      circle2: { label: "Circle 2", icon: "📏" },
      games: { label: "Putting Games", icon: "🏆" },
    },
  },
  field: {
    label: "Field Work",
    sections: {
      power: { label: "Power & Distance", icon: "💨" },
      approach: { label: "Approach & CTP", icon: "🎯", parent: "accuracy" },
      gap: { label: "Gap Shots", icon: "🌲", parent: "accuracy" },
      shaping: { label: "Shot Shaping", icon: "↩️" },
      forehand: { label: "Forehand Development", icon: "🤙" },
      course: { label: "Course Simulation", icon: "⛳" },
    },
    groups: {
      accuracy: { label: "Accuracy", children: ["approach", "gap"] },
    },
  },
  net: {
    label: "Net Work",
    sections: {
      form: { label: "Form & Mechanics", icon: "🔧" },
      grip: { label: "Grip", icon: "✊" },
      release: { label: "Release Point", icon: "📐" },
      hips: { label: "Hip Drive", icon: "🔄" },
      followthrough: { label: "Follow Through", icon: "➡️" },
    },
  },
};

export const DIFFICULTY_COLORS = {
  beginner: "#10B981",
  intermediate: "#FBBF24",
  advanced: "#EF4444",
};

export const THROW_TYPES = ["backhand", "forehand", "both"];
export const THROW_TYPE_LABELS = { backhand: "Backhand", forehand: "Forehand", both: "Both" };

// metric types:
// makes_attempts — log makes and attempts, calculates %
// distance_reps — log individual throw distances
// ctp — log individual distances from target + miss direction
// gap — log hit/miss per throw
// reps — simple rep counter

export const MISS_DIRECTIONS = ["Short", "Long", "Left", "Right"];

export const DRILL_LIBRARY = [

  // ══════════════════════════════════════════
  // PUTTING
  // ══════════════════════════════════════════

  { id: "p001", type: "putting", section: "confidence", throwType: "both", name: "Clock Drill", difficulty: "beginner",
    description: "Place discs at 10ft in a circle around the basket like a clock face. Putt from each position clockwise.",
    coachTip: "BlitzDG: The basket looks different from every angle. Clock drill trains you for every lie on the course.",
    sets: 1, reps: 12, metric: "makes_attempts" },

  { id: "p002", type: "putting", section: "confidence", throwType: "both", name: "10ft Make 10", difficulty: "beginner",
    description: "Stand at 10ft. Make 10 consecutive putts. Miss = start over. Can't leave until complete.",
    coachTip: "Eagle McMahon: Build confidence here before pushing distance. If this feels easy you're ready to move back.",
    sets: 1, reps: 10, metric: "makes_attempts" },

  { id: "p003", type: "putting", section: "confidence", throwType: "both", name: "15ft Confidence Block", difficulty: "beginner",
    description: "20 putts from 15-20ft. Track your make percentage. Aim for 80%+ before progressing.",
    coachTip: "This is your money zone. Build a repeatable stance and release here.",
    sets: 2, reps: 10, metric: "makes_attempts" },

  { id: "p004", type: "putting", section: "confidence", throwType: "both", name: "3-2-1 Drill", difficulty: "intermediate",
    description: "Make 3 from 10ft, then 2 from 15ft, then 1 from 20ft. One miss = restart the whole sequence.",
    coachTip: "Wysocki: This builds mental toughness. The pressure resets train your focus under fatigue.",
    sets: 3, reps: 6, metric: "makes_attempts" },

  { id: "p005", type: "putting", section: "pressure", throwType: "both", name: "Miss and Restart", difficulty: "intermediate",
    description: "10 putts from 25-30ft. Miss = restart the set. Max 3 restarts. Simulates tournament pressure.",
    coachTip: "BlitzDG: The restart penalty is the whole point. Train your breathing before each putt.",
    sets: 1, reps: 10, metric: "makes_attempts" },

  { id: "p006", type: "putting", section: "pressure", throwType: "both", name: "Cash It In", difficulty: "intermediate",
    description: "Putt from 20ft. Make 5 in a row to finish. Log each attempt separately.",
    coachTip: "Treat every putt like it's for the win. Full pre-shot routine every time.",
    sets: 1, reps: 5, metric: "makes_attempts" },

  { id: "p007", type: "putting", section: "pressure", throwType: "both", name: "Pressure Ladder", difficulty: "advanced",
    description: "Make 1 from 10ft, 15ft, 20ft, 25ft, 30ft in sequence. Miss = restart from 10ft.",
    coachTip: "Eagle McMahon: The ladder teaches you to stay present on each putt rather than thinking ahead.",
    sets: 1, reps: 5, metric: "makes_attempts" },

  { id: "p008", type: "putting", section: "circle2", throwType: "both", name: "35ft Block", difficulty: "intermediate",
    description: "5 putts from 35ft. Goal: make at least 2/5. Builds distance feel without expecting perfection.",
    coachTip: "Stay aggressive. Same release you use at 20ft — don't baby it.",
    sets: 2, reps: 5, metric: "makes_attempts" },

  { id: "p009", type: "putting", section: "circle2", throwType: "both", name: "40ft Block", difficulty: "intermediate",
    description: "5 putts from 40ft. Goal: make at least 2/5. Keep the same release as closer distances.",
    coachTip: "BlitzDG: At this distance your follow-through matters more than anything else.",
    sets: 2, reps: 5, metric: "makes_attempts" },

  { id: "p010", type: "putting", section: "circle2", throwType: "both", name: "45ft Block", difficulty: "advanced",
    description: "5 putts from 45ft. Goal: make at least 2/5. Max range — focus on confident follow-through.",
    coachTip: "Wysocki: Never decelerate at C2. Commit fully or don't attempt it.",
    sets: 2, reps: 5, metric: "makes_attempts" },

  { id: "p011", type: "putting", section: "circle2", throwType: "both", name: "C2 Walk Back", difficulty: "advanced",
    description: "Start at 33ft. Make a putt, step back 3ft. Miss = stay. See how far back you can get in 15 putts.",
    coachTip: "This tells you exactly where your confident C2 range ends. Track it weekly.",
    sets: 1, reps: 15, metric: "makes_attempts" },

  { id: "p012", type: "putting", section: "games", throwType: "both", name: "Around the World", difficulty: "beginner",
    description: "6 discs at 15ft evenly spaced around the basket. Make all 6 to complete one lap. Go 3 laps.",
    coachTip: "Each position tests a slightly different angle. Great for identifying your weak side.",
    sets: 3, reps: 6, metric: "makes_attempts" },

  { id: "p013", type: "putting", section: "games", throwType: "both", name: "Par 18", difficulty: "intermediate",
    description: "Putt from 6 positions (10, 15, 20, 25, 30, 35ft). 3 putts each = 18 total. Par is 15/18.",
    coachTip: "BlitzDG: This gives you a scorecard for putting practice. Chase your personal best.",
    sets: 1, reps: 18, metric: "makes_attempts" },

  // ══════════════════════════════════════════
  // FIELD — POWER & DISTANCE
  // ══════════════════════════════════════════

  { id: "f001", type: "field", section: "power", throwType: "backhand", name: "BH Max Distance", difficulty: "intermediate",
    description: "10 full effort BH throws for max distance. Mark your best 3. Rest 60 seconds between throws.",
    coachTip: "BlitzDG: Don't sacrifice form for distance. A clean release at 80% beats a sloppy 100% every time.",
    sets: 2, reps: 10, metric: "distance_reps" },

  { id: "f002", type: "field", section: "power", throwType: "backhand", name: "X-Step Timing", difficulty: "intermediate",
    description: "10 BH throws focusing purely on x-step timing. Record distance and note if timing felt connected.",
    coachTip: "Slow the x-step down first then gradually speed it up. Feel the hip lead the arm.",
    sets: 3, reps: 10, metric: "distance_reps" },

  { id: "f003", type: "field", section: "power", throwType: "backhand", name: "Speed Build Sets", difficulty: "advanced",
    description: "3 throws at 60%, 3 at 80%, 3 at 100%. Compare distances across effort levels.",
    coachTip: "Wysocki: Find your maximum efficient speed — where distance stops increasing.",
    sets: 3, reps: 3, metric: "distance_reps" },

  { id: "f004", type: "field", section: "power", throwType: "forehand", name: "FH Max Distance", difficulty: "intermediate",
    description: "10 full effort FH throws for max distance. Compare to your BH distance. Note the gap.",
    coachTip: "Most players are 50-80ft shorter FH than BH. Track this gap closing over time.",
    sets: 2, reps: 10, metric: "distance_reps" },

  { id: "f005", type: "field", section: "power", throwType: "backhand", name: "Hyzer Bomb Distance", difficulty: "intermediate",
    description: "10 full hyzer angle BH throws. Focus on generating power while maintaining release angle.",
    coachTip: "A hyzer bomb needs the same power as a flat throw — the angle is in the wrist at release.",
    sets: 2, reps: 10, metric: "distance_reps" },

  // ══════════════════════════════════════════
  // FIELD — APPROACH & CTP
  // ══════════════════════════════════════════

  { id: "f006", type: "field", section: "approach", throwType: "both", name: "CTP from 50ft", difficulty: "beginner",
    description: "10 throws from 50ft aiming at a target (bag, cone, or disc). Log your distance from target after each throw and which direction you missed.",
    coachTip: "BlitzDG: At 50ft you should be within 10ft consistently. If not, work on release angle first.",
    sets: 2, reps: 10, metric: "ctp", targetDist: 50 },

  { id: "f007", type: "field", section: "approach", throwType: "both", name: "CTP from 100ft", difficulty: "beginner",
    description: "10 throws from 100ft at a target. Log distance from target and miss direction per throw.",
    coachTip: "100ft is a standard upshot distance. Your average proximity here directly affects your scoring.",
    sets: 2, reps: 10, metric: "ctp", targetDist: 100 },

  { id: "f008", type: "field", section: "approach", throwType: "both", name: "CTP from 150ft", difficulty: "intermediate",
    description: "10 throws from 150ft at a target. Log distance from target and miss direction per throw.",
    coachTip: "Wysocki: At 150ft disc selection matters as much as technique. Know your approach discs.",
    sets: 2, reps: 10, metric: "ctp", targetDist: 150 },

  { id: "f009", type: "field", section: "approach", throwType: "both", name: "CTP from 200ft", difficulty: "intermediate",
    description: "10 throws from 200ft at a target. Log distance from target and miss direction.",
    coachTip: "200ft approaches require good disc selection and understanding of fade. Know your disc's finish.",
    sets: 2, reps: 10, metric: "ctp", targetDist: 200 },

  { id: "f010", type: "field", section: "approach", throwType: "both", name: "CTP Walk Back", difficulty: "intermediate",
    description: "Start at 50ft. If your closest throw lands within 15ft of target, step back 25ft. Keep going until you miss the threshold. Track your max distance.",
    coachTip: "This tells you your reliable approach range. Most amateurs max out around 100-125ft.",
    sets: 1, reps: 10, metric: "ctp", targetDist: 50 },

  { id: "f011", type: "field", section: "approach", throwType: "both", name: "CTP Under Pressure", difficulty: "advanced",
    description: "From 100ft, land 3 throws within 20ft of target in a row or restart. Max 5 restart attempts.",
    coachTip: "Pressure approach practice. Treat each throw like it's for par on hole 18.",
    sets: 1, reps: 10, metric: "ctp", targetDist: 100 },

  { id: "f012", type: "field", section: "approach", throwType: "both", name: "Blind CTP", difficulty: "advanced",
    description: "Set a target but don't step off the distance. Throw 10 times and log proximity. Tests your distance feel.",
    coachTip: "On the course you rarely know exact yardage. This trains your eyes to estimate distance.",
    sets: 1, reps: 10, metric: "ctp", targetDist: null },

  // ══════════════════════════════════════════
  // FIELD — GAP SHOTS
  // ══════════════════════════════════════════

  { id: "f013", type: "field", section: "gap", throwType: "both", name: "Gap Shot 10ft Opening", difficulty: "beginner",
    description: "Set two cones or bags 10ft apart at 100ft. Throw 10 shots through the gap. Count successful passes.",
    coachTip: "Visualize the flight path not just the gap. See the disc flying through before you throw.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f014", type: "field", section: "gap", throwType: "both", name: "Gap Shot 6ft Opening", difficulty: "intermediate",
    description: "Set a 6ft gap at 80ft. Throw 10 shots through. Log each as hit or miss.",
    coachTip: "BlitzDG: A 6ft gap simulates a tight tunnel. This is where hyzer accuracy really matters.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f015", type: "field", section: "gap", throwType: "backhand", name: "BH Hyzer Gap", difficulty: "intermediate",
    description: "Set a 8ft gap at 100ft. Throw 10 BH hyzer shots through the gap. The hyzer angle must be maintained through.",
    coachTip: "Hyzer gap shots are the most common wooded shot in disc golf. Master this and tree avoidance improves dramatically.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f016", type: "field", section: "gap", throwType: "forehand", name: "FH Line Drive", difficulty: "intermediate",
    description: "Set a 8ft gap at 80ft. Throw 10 FH flat shots through. Log each as hit or miss.",
    coachTip: "Wysocki: FH accuracy through gaps is one of the most underrated skills. Practice it like your scoring depends on it — it does.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f017", type: "field", section: "gap", throwType: "both", name: "Moving Gap", difficulty: "advanced",
    description: "Set gaps at 60ft, 100ft, and 150ft. Throw each distance 5 times. Total 15 throws. Log hit/miss at each distance.",
    coachTip: "Changing gap distances trains you to adjust your release and disc selection on the fly.",
    sets: 1, reps: 15, metric: "gap" },

  // ══════════════════════════════════════════
  // FIELD — SHOT SHAPING
  // ══════════════════════════════════════════

  { id: "f018", type: "field", section: "shaping", throwType: "backhand", name: "Hyzer to Flat Progression", difficulty: "beginner",
    description: "5 full hyzer throws, 5 moderate hyzer, 5 flat. Feel how release angle changes the flight.",
    coachTip: "BlitzDG: Most beginners only throw one angle. Deliberately training each shape builds real versatility.",
    sets: 1, reps: 15, metric: "distance_reps" },

  { id: "f019", type: "field", section: "shaping", throwType: "backhand", name: "BH Anhyzer Control", difficulty: "intermediate",
    description: "10 BH anhyzer throws targeting a specific landing zone. Keep the nose down.",
    coachTip: "Nose up on anhyzer = flip and roll. Wrist angle controls everything.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f020", type: "field", section: "shaping", throwType: "backhand", name: "Flex Shot", difficulty: "advanced",
    description: "10 flex shots — release on anhyzer then let the disc fade back. Hit a specific landing zone.",
    coachTip: "Wysocki: The flex shot is the most versatile shot in disc golf. Master it and you can attack any hole.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f021", type: "field", section: "shaping", throwType: "backhand", name: "Hyzer Flip", difficulty: "intermediate",
    description: "10 BH hyzer flip throws with an understable disc. Release on hyzer and let it flip to flat or anhyzer.",
    coachTip: "The hyzer flip is the highest percentage S-curve shot. Great for distance with control.",
    sets: 2, reps: 10, metric: "distance_reps" },

  { id: "f022", type: "field", section: "shaping", throwType: "both", name: "Roller Technique", difficulty: "advanced",
    description: "5 BH rollers and 5 FH rollers. Focus on clean release angle and consistent roll direction.",
    coachTip: "A roller needs a very sharp anhyzer angle. If it's not rolling cleanly, steepen the release.",
    sets: 1, reps: 10, metric: "distance_reps" },

  // ══════════════════════════════════════════
  // FIELD — FOREHAND DEVELOPMENT
  // ══════════════════════════════════════════

  { id: "f023", type: "field", section: "power", throwType: "backhand", name: "Ultimate Drill", difficulty: "beginner",
    description: "Lock your throwing arm out completely straight — no bending at the elbow. Throw BH into the field with a fully stiff arm using only hip and shoulder rotation. As you gradually increase rotation intensity your arm will naturally begin to bend, creating the whip effect of a powerful throw. Start slow and let the arm bend happen on its own. 20 reps.",
    coachTip: "BlitzDG: The ultimate drill teaches you that arm bend is a result of rotation speed, not something you force. Lock it out, spin harder, and feel the whip develop naturally. This is one of the most important drills for understanding where distance actually comes from.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "f024", type: "field", section: "forehand", throwType: "forehand", name: "FH Grip & Snap Drill", difficulty: "beginner",
    description: "10 short FH throws (30ft) focusing only on grip pressure and wrist snap. Release should feel like flicking a frisbee.",
    coachTip: "Two-finger power grip, middle finger on the rim. The snap comes from the wrist not the elbow.",
    sets: 3, reps: 10, metric: "reps" },

  { id: "f025", type: "field", section: "forehand", throwType: "forehand", name: "FH Hip Rotation", difficulty: "intermediate",
    description: "10 FH throws focusing on hip drive. Hips should clear before the arm releases. Record distance.",
    coachTip: "Most forehand players are arm-dominant. Adding hip drive adds 30-50ft without changing anything else.",
    sets: 3, reps: 10, metric: "distance_reps" },

  { id: "f026", type: "field", section: "forehand", throwType: "forehand", name: "FH Hyzer Accuracy", difficulty: "intermediate",
    description: "10 FH hyzer throws at a target 100ft away. Log hit or miss. FH hyzer is one of the most reliable approach shots.",
    coachTip: "Wysocki: FH hyzer is money. It's predictable, controllable, and works in wind. Own it.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f027", type: "field", section: "forehand", throwType: "forehand", name: "FH Flex Shot", difficulty: "advanced",
    description: "10 FH flex shots — release anhyzer, let the disc fade back right (RHFH). Hit a target landing zone.",
    coachTip: "FH flex is rare but devastating when mastered. Most players never develop it.",
    sets: 2, reps: 10, metric: "gap" },

  { id: "f028", type: "field", section: "forehand", throwType: "forehand", name: "FH CTP Approach", difficulty: "intermediate",
    description: "10 FH throws from 100ft at a target. Log distance from target and miss direction per throw.",
    coachTip: "Your FH approach game is often more reliable than BH at mid-range distances. Develop both.",
    sets: 2, reps: 10, metric: "ctp", targetDist: 100 },

  // ══════════════════════════════════════════
  // FIELD — COURSE SIMULATION
  // ══════════════════════════════════════════

  { id: "f029", type: "field", section: "course", throwType: "both", name: "Par 3 Simulation", difficulty: "intermediate",
    description: "Pick a spot 200ft away as the basket. Drive, approach, putt. Play 9 simulated holes and track score vs par.",
    coachTip: "This is the closest field work gets to a real round. Every shot matters.",
    sets: 1, reps: 9, metric: "makes_attempts" },

  { id: "f030", type: "field", section: "course", throwType: "both", name: "Scramble Practice", difficulty: "intermediate",
    description: "Throw a drive into a bad lie intentionally. Then scramble — upshot and putt for par. 10 holes.",
    coachTip: "BlitzDG: Most strokes are lost when things go wrong. Train the recovery not just the perfect drive.",
    sets: 1, reps: 10, metric: "makes_attempts" },

  { id: "f031", type: "field", section: "course", throwType: "both", name: "OB Pressure Tee Shot", difficulty: "advanced",
    description: "Imagine tight OB on both sides. 10 tee shots, any miss is OB. Track fairway hits.",
    coachTip: "Visualize the OB before throwing. The mental pressure of OB is what this drill trains.",
    sets: 2, reps: 10, metric: "gap" },

  // ══════════════════════════════════════════
  // NET WORK — FORM & MECHANICS
  // ══════════════════════════════════════════

  { id: "n001", type: "net", section: "form", throwType: "backhand", name: "Spaghetti Arm Drill", difficulty: "beginner",
    description: "Let your throwing arm go completely loose and limp like cooked spaghetti on the reach back. Then snap through naturally. 20 reps. The contrast between tension and relaxation is the lesson.",
    coachTip: "BlitzDG: Arm tension is the #1 distance killer. This drill teaches you what a relaxed arm feels like so you can replicate it every throw.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n002", type: "net", section: "form", throwType: "backhand", name: "Towel Drill", difficulty: "beginner",
    description: "Hold a towel in your throwing hand like a disc. Snap it into the net with a full throwing motion. The towel should crack like a whip at the release point. 20 reps.",
    coachTip: "BlitzDG: The towel drill isolates the whip and snap at release. If it doesn't crack you're slowing down too early. This is one of the most referenced drills in disc golf coaching.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n003", type: "net", section: "form", throwType: "backhand", name: "Swirly Bird", difficulty: "beginner",
    description: "Balance the disc on your index finger and spin it. Feel the gyroscopic stability. Now throw into the net focusing on replicating that spin rate and axis tilt from your finger feel.",
    coachTip: "The swirly bird connects your hands-on understanding of disc physics to your actual throw. High spin = more stable flight and more distance.",
    sets: 2, reps: 15, metric: "reps" },

  { id: "n004", type: "net", section: "form", throwType: "backhand", name: "Slow Motion BH", difficulty: "beginner",
    description: "Throw into the net at 10% speed. Feel each phase — grip, reach back, pull through, release. 20 reps. No rushing.",
    coachTip: "Slow motion practice builds muscle memory without reinforcing bad habits from speed.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n005", type: "net", section: "form", throwType: "backhand", name: "One Knee Drill", difficulty: "beginner",
    description: "Kneel on your back knee. Throw BH into the net from this position. Isolates upper body mechanics by removing the lower body entirely. 20 reps.",
    coachTip: "Wysocki: If your upper body form is off, kneeling makes it obvious. No lower body to compensate.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n006", type: "net", section: "form", throwType: "backhand", name: "Wall Reach Back", difficulty: "intermediate",
    description: "Stand 2ft from a wall on your throwing side. Practice the reach back motion without hitting the wall. This forces a compact, on-plane reach back. 20 reps.",
    coachTip: "BlitzDG: Reaching too wide or too high is a common power leak. The wall teaches you the correct plane.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n007", type: "net", section: "form", throwType: "backhand", name: "Figure 8 Footwork", difficulty: "intermediate",
    description: "Walk through the x-step in a figure 8 pattern without throwing. 20 reps focusing on weight transfer and hip timing. Then add the throw into the net.",
    coachTip: "Footwork is the foundation of power. Get the figure 8 locked in and everything else becomes easier.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n008", type: "net", section: "form", throwType: "forehand", name: "FH Elbow Drill", difficulty: "beginner",
    description: "Throw FH into the net with your elbow pinned to your hip. 20 reps. Forces proper elbow position and prevents arm-only throws.",
    coachTip: "BlitzDG: Elbow flaring is the most common FH flaw. Pin it to your side and you'll feel the hip drive naturally take over.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n009", type: "net", section: "form", throwType: "forehand", name: "FH Slow Motion", difficulty: "beginner",
    description: "Throw FH into the net at 10% speed. Feel the grip, the elbow position, the wrist snap, the follow through. 20 reps.",
    coachTip: "FH slow motion is even more important than BH because forehand mechanics are less intuitive for most players.",
    sets: 3, reps: 20, metric: "reps" },

  // ══════════════════════════════════════════
  // NET WORK — GRIP
  // ══════════════════════════════════════════

  { id: "n011", type: "net", section: "grip", throwType: "backhand", name: "Power Grip Pressure Check", difficulty: "beginner",
    description: "20 BH throws at 50% effort focusing only on grip pressure. Should feel firm but not white-knuckle tight. Rate your grip pressure 1-10 after each throw.",
    coachTip: "BlitzDG: Grip too tight kills disc speed. Think 7/10 pressure — firm enough to control, loose enough to release clean.",
    sets: 2, reps: 20, metric: "reps" },

  { id: "n012", type: "net", section: "grip", throwType: "both", name: "Fan vs Power Grip", difficulty: "beginner",
    description: "10 throws with fan grip, 10 with power grip. Note the difference in feel, spin, and disc behavior at the net.",
    coachTip: "Fan grip for mid-range control, power grip for drivers. Know when to use each.",
    sets: 1, reps: 20, metric: "reps" },

  { id: "n013", type: "net", section: "grip", throwType: "forehand", name: "FH Two-Finger Grip", difficulty: "beginner",
    description: "20 FH throws focusing on the two-finger power grip. Middle finger on the rim, index finger braced. Feel how grip affects spin rate.",
    coachTip: "The FH grip is simpler than BH but often overlooked. A solid grip = consistent spin = consistent flight.",
    sets: 2, reps: 20, metric: "reps" },

  // ══════════════════════════════════════════
  // NET WORK — RELEASE POINT
  // ══════════════════════════════════════════

  { id: "n014", type: "net", section: "release", throwType: "backhand", name: "Release Point Isolation", difficulty: "intermediate",
    description: "Mark your release point with tape on the net. 25 throws trying to release at the exact same point every time.",
    coachTip: "Consistency in release point = consistency in disc flight. This is the single most important variable.",
    sets: 3, reps: 25, metric: "reps" },

  { id: "n015", type: "net", section: "release", throwType: "backhand", name: "High vs Low Release", difficulty: "intermediate",
    description: "10 high release throws, 10 low release throws. Feel how height affects hyzer/anhyzer tendency.",
    coachTip: "Wysocki: High release tends toward hyzer, low toward anhyzer. Know your natural default.",
    sets: 1, reps: 20, metric: "reps" },

  { id: "n016", type: "net", section: "release", throwType: "backhand", name: "Nose Angle Control", difficulty: "intermediate",
    description: "20 throws alternating between nose up and nose down release. Feel how nose angle affects the disc at the net.",
    coachTip: "Nose up = less distance and more fade. Nose down = more distance and flatter flight. Control this consciously.",
    sets: 2, reps: 20, metric: "reps" },

  // ══════════════════════════════════════════
  // NET WORK — HIP DRIVE
  // ══════════════════════════════════════════

  { id: "n017", type: "net", section: "hips", throwType: "backhand", name: "Hip Isolation Drill", difficulty: "intermediate",
    description: "Stand with feet planted. Throw using only hip rotation — no arm swing. Feel the hip generating power. 15 reps.",
    coachTip: "BlitzDG: If you can't feel your hips working with no arm, you're an arm thrower. This drill fixes that.",
    sets: 3, reps: 15, metric: "reps" },

  { id: "n018", type: "net", section: "hips", throwType: "backhand", name: "Hip Lead Timing", difficulty: "advanced",
    description: "Full throws with a pause at the hip-lead position before the arm pulls. 30 reps. Hips face the target before the arm fires.",
    coachTip: "The hip should face the target before the disc arm starts pulling. Sequence is everything.",
    sets: 3, reps: 30, metric: "reps" },

  { id: "n019", type: "net", section: "hips", throwType: "forehand", name: "FH Hip Drive", difficulty: "intermediate",
    description: "10 FH throws focusing on hip clearing before arm release. Place hand on hip to feel rotation. Record if hip led or arm led each throw.",
    coachTip: "Most forehand players are arm-dominant. Adding hip drive is the single biggest FH upgrade.",
    sets: 3, reps: 10, metric: "reps" },

  // ══════════════════════════════════════════
  // NET WORK — FOLLOW THROUGH
  // ══════════════════════════════════════════

  { id: "n020", type: "net", section: "followthrough", throwType: "backhand", name: "Full Extension Hold", difficulty: "beginner",
    description: "20 throws focusing on full arm extension after release. Hold the follow-through for 2 full seconds each throw.",
    coachTip: "A full follow-through is proof of a complete throw. If you stop short you decelerated before release.",
    sets: 3, reps: 20, metric: "reps" },

  { id: "n021", type: "net", section: "followthrough", throwType: "backhand", name: "Mirror Drill", difficulty: "beginner",
    description: "Throw in front of a mirror or record yourself. 20 reps watching your follow-through position.",
    coachTip: "BlitzDG: Video yourself monthly. Progress is hard to feel but easy to see.",
    sets: 2, reps: 20, metric: "reps" },

  { id: "n022", type: "net", section: "followthrough", throwType: "forehand", name: "FH Follow Through Check", difficulty: "beginner",
    description: "20 FH throws holding the follow-through for 2 seconds. Your arm should finish pointing at the target.",
    coachTip: "FH follow-through is often cut short. Hold it and feel where your arm naturally wants to finish.",
    sets: 2, reps: 20, metric: "reps" },
];

export const RPE_LABELS = ["1 - Very Easy","2","3","4","5 - Moderate","6","7","8","9","10 - Max Effort"];
export const EFFORT_LABELS = ["1 - Poor","2","3","4","5 - Average","6","7","8","9","10 - Best Ever"];
export const CONDITIONS = ["Sunny","Cloudy","Windy","Rainy","Indoor","Hot","Cold","Night"];
export const SURFACES = ["Concrete","Grass","Carpet","Turf","Dirt"];