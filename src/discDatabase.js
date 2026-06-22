// Pre-loaded disc database with flight numbers
// Format: { brand, mold, category, speed, glide, turn, fade, plastics[] }

export const DISC_DATABASE = [
  // ── INNOVA ──────────────────────────────────────────────────────────────────
  // Distance Drivers
  { brand: "Innova", mold: "Destroyer", category: "Distance Driver", speed: 12, glide: 5, turn: -1, fade: 3, plastics: ["DX", "Pro", "Star", "Champion", "Halo Star", "Echo Star"] },
  { brand: "Innova", mold: "Wraith", category: "Distance Driver", speed: 11, glide: 5, turn: -1, fade: 3, plastics: ["DX", "Pro", "Star", "Champion", "Halo Star"] },
  { brand: "Innova", mold: "Boss", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 3, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Shryke", category: "Distance Driver", speed: 13, glide: 6, turn: -2, fade: 2, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Tern", category: "Distance Driver", speed: 12, glide: 6, turn: -2, fade: 2, plastics: ["Star", "Champion", "Echo Star"] },
  { brand: "Innova", mold: "Katana", category: "Distance Driver", speed: 13, glide: 5, turn: -3, fade: 3, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Firebird", category: "Distance Driver", speed: 9, glide: 3, turn: 0, fade: 4, plastics: ["DX", "Pro", "Star", "Champion"] },
  { brand: "Innova", mold: "Thunderbird", category: "Distance Driver", speed: 11, glide: 5, turn: 0, fade: 2, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Valkyrie", category: "Distance Driver", speed: 9, glide: 4, turn: -2, fade: 2, plastics: ["DX", "Pro", "Star", "Champion"] },
  // Fairway Drivers
  { brand: "Innova", mold: "Teebird", category: "Fairway Driver", speed: 7, glide: 5, turn: 0, fade: 2, plastics: ["DX", "Pro", "Star", "Champion"] },
  { brand: "Innova", mold: "Teebird3", category: "Fairway Driver", speed: 7, glide: 5, turn: -1, fade: 2, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Leopard", category: "Fairway Driver", speed: 6, glide: 5, turn: -2, fade: 1, plastics: ["DX", "Pro", "Star", "Champion"] },
  { brand: "Innova", mold: "Leopard3", category: "Fairway Driver", speed: 7, glide: 5, turn: -2, fade: 1, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Sidewinder", category: "Fairway Driver", speed: 9, glide: 5, turn: -3, fade: 1, plastics: ["DX", "Star", "Champion"] },
  { brand: "Innova", mold: "Kite", category: "Fairway Driver", speed: 7, glide: 6, turn: -2, fade: 1, plastics: ["Star", "Champion"] },
  // Midranges
  { brand: "Innova", mold: "Roc3", category: "Midrange", speed: 5, glide: 4, turn: 0, fade: 3, plastics: ["DX", "Pro", "Star", "Champion"] },
  { brand: "Innova", mold: "Mako3", category: "Midrange", speed: 5, glide: 5, turn: 0, fade: 0, plastics: ["Star", "Champion"] },
  { brand: "Innova", mold: "Cobra", category: "Midrange", speed: 5, glide: 5, turn: -3, fade: 0, plastics: ["DX", "Pro"] },
  { brand: "Innova", mold: "Atlas", category: "Midrange", speed: 5, glide: 3, turn: 0, fade: 3, plastics: ["Star", "Champion"] },
  // Putters
  { brand: "Innova", mold: "Aviar", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 1, plastics: ["DX", "Pro", "Star", "Champion", "XT"] },
  { brand: "Innova", mold: "Aviar3", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 1, plastics: ["DX", "Pro", "Star", "Champion"] },
  { brand: "Innova", mold: "KC Aviar", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 1, plastics: ["Pro", "Star"] },
  { brand: "Innova", mold: "Whale", category: "Putter", speed: 1, glide: 3, turn: 0, fade: 1, plastics: ["DX"] },
  { brand: "Innova", mold: "Birdie", category: "Putter", speed: 2, glide: 4, turn: 0, fade: 1, plastics: ["DX"] },

  // ── DISCRAFT ─────────────────────────────────────────────────────────────────
  { brand: "Discraft", mold: "Zeus", category: "Distance Driver", speed: 12, glide: 5, turn: -1, fade: 3, plastics: ["ESP", "Big Z", "Cryztal", "Putter Line", "Tour Series"] },
  { brand: "Discraft", mold: "Nuke", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 3, plastics: ["ESP", "Big Z", "Z Line", "Cryztal"] },
  { brand: "Discraft", mold: "Undertaker", category: "Distance Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["ESP", "Big Z", "Z Line", "Cryztal"] },
  { brand: "Discraft", mold: "Force", category: "Distance Driver", speed: 12, glide: 5, turn: 0, fade: 3, plastics: ["ESP", "Big Z", "Z Line"] },
  { brand: "Discraft", mold: "Surge SS", category: "Distance Driver", speed: 11, glide: 5, turn: -2, fade: 2, plastics: ["ESP", "Z Line"] },
  { brand: "Discraft", mold: "Predator", category: "Fairway Driver", speed: 9, glide: 4, turn: 0, fade: 3, plastics: ["ESP", "Z Line", "Big Z"] },
  { brand: "Discraft", mold: "Heat", category: "Fairway Driver", speed: 9, glide: 6, turn: -3, fade: 1, plastics: ["ESP", "Z Line", "Big Z"] },
  { brand: "Discraft", mold: "Buzzz", category: "Midrange", speed: 5, glide: 4, turn: -1, fade: 1, plastics: ["ESP", "Z Line", "Big Z", "Cryztal", "Jawbreaker"] },
  { brand: "Discraft", mold: "Buzzz SS", category: "Midrange", speed: 5, glide: 5, turn: -2, fade: 1, plastics: ["ESP", "Z Line"] },
  { brand: "Discraft", mold: "Comet", category: "Midrange", speed: 4, glide: 5, turn: -2, fade: 1, plastics: ["ESP", "Z Line", "Big Z"] },
  { brand: "Discraft", mold: "Wasp", category: "Midrange", speed: 5, glide: 4, turn: 0, fade: 2, plastics: ["ESP", "Z Line"] },
  { brand: "Discraft", mold: "Luna", category: "Putter", speed: 3, glide: 3, turn: 0, fade: 3, plastics: ["ESP", "Z Line", "Jawbreaker", "Cryztal", "Tour Series"] },
  { brand: "Discraft", mold: "Banger GT", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 2, plastics: ["ESP", "Z Line", "Jawbreaker"] },
  { brand: "Discraft", mold: "Zone", category: "Putter", speed: 4, glide: 3, turn: 0, fade: 3, plastics: ["ESP", "Z Line", "Big Z", "Jawbreaker"] },
  { brand: "Discraft", mold: "Nuke OS", category: "Distance Driver", speed: 12, glide: 5, turn: 1, fade: 5, plastics: ["ESP", "Z Line"] },

  // ── DISCMANIA ────────────────────────────────────────────────────────────────
  { brand: "Discmania", mold: "PD", category: "Distance Driver", speed: 10, glide: 4, turn: 0, fade: 3, plastics: ["S-Line", "C-Line", "P-Line", "Lux"] },
  { brand: "Discmania", mold: "DD3", category: "Distance Driver", speed: 12, glide: 6, turn: -1, fade: 2, plastics: ["S-Line", "C-Line", "Lux"] },
  { brand: "Discmania", mold: "Tilt", category: "Distance Driver", speed: 14, glide: 2, turn: 0, fade: 5, plastics: ["S-Line", "C-Line"] },
  { brand: "Discmania", mold: "FD", category: "Fairway Driver", speed: 7, glide: 6, turn: -1, fade: 1, plastics: ["S-Line", "C-Line", "P-Line"] },
  { brand: "Discmania", mold: "FD3", category: "Fairway Driver", speed: 9, glide: 5, turn: 0, fade: 2, plastics: ["S-Line", "C-Line"] },
  { brand: "Discmania", mold: "MD3", category: "Midrange", speed: 5, glide: 5, turn: -1, fade: 1, plastics: ["S-Line", "C-Line", "P-Line"] },
  { brand: "Discmania", mold: "MD5", category: "Midrange", speed: 5, glide: 4, turn: 0, fade: 3, plastics: ["S-Line", "C-Line"] },
  { brand: "Discmania", mold: "P2", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 1, plastics: ["S-Line", "C-Line", "P-Line"] },
  { brand: "Discmania", mold: "Link", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 1, plastics: ["S-Line", "C-Line", "P-Line"] },

  // ── MVP / AXIOM ──────────────────────────────────────────────────────────────
  { brand: "MVP", mold: "Octane", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 3, plastics: ["Neutron", "Plasma", "Proton", "Cosmic Neutron"] },
  { brand: "MVP", mold: "Catalyst", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 2, plastics: ["Neutron", "Plasma", "Proton"] },
  { brand: "MVP", mold: "Servo", category: "Fairway Driver", speed: 9, glide: 4, turn: 0, fade: 3, plastics: ["Neutron", "Plasma"] },
  { brand: "MVP", mold: "Signal", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["Neutron", "Plasma"] },
  { brand: "MVP", mold: "Disc Wizard", category: "Midrange", speed: 5, glide: 5, turn: -2, fade: 1, plastics: ["Neutron", "Plasma"] },
  { brand: "MVP", mold: "Proxy", category: "Putter", speed: 3, glide: 4, turn: 0, fade: 1, plastics: ["Neutron", "Eclipse", "Plasma"] },
  { brand: "Axiom", mold: "Envy", category: "Putter", speed: 3, glide: 4, turn: -1, fade: 1, plastics: ["Neutron", "Eclipse", "Plasma", "Cosmic Neutron"] },
  { brand: "Axiom", mold: "Hex", category: "Midrange", speed: 5, glide: 5, turn: -1, fade: 1, plastics: ["Neutron", "Plasma"] },
  { brand: "Axiom", mold: "Crave", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 1, plastics: ["Neutron", "Plasma"] },
  { brand: "Axiom", mold: "Insanity", category: "Distance Driver", speed: 12, glide: 5, turn: -2, fade: 2, plastics: ["Neutron", "Plasma"] },

  // ── KASTAPLAST ───────────────────────────────────────────────────────────────
  { brand: "Kastaplast", mold: "Rask", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 3, plastics: ["K1", "K1 Soft", "K3"] },
  { brand: "Kastaplast", mold: "Falk", category: "Distance Driver", speed: 10, glide: 5, turn: -2, fade: 2, plastics: ["K1", "K1 Soft", "K3"] },
  { brand: "Kastaplast", mold: "Lots", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["K1", "K1 Soft"] },
  { brand: "Kastaplast", mold: "Gote", category: "Midrange", speed: 6, glide: 5, turn: -2, fade: 1, plastics: ["K1", "K1 Soft"] },
  { brand: "Kastaplast", mold: "Berg", category: "Putter", speed: 1, glide: 1, turn: 0, fade: 2, plastics: ["K1", "K1 Soft", "K3"] },
  { brand: "Kastaplast", mold: "Grym", category: "Distance Driver", speed: 12, glide: 5, turn: 0, fade: 3, plastics: ["K1", "K3"] },
  { brand: "Kastaplast", mold: "Grym X", category: "Distance Driver", speed: 12, glide: 5, turn: 1, fade: 4, plastics: ["K1", "K3"] },

  // ── DYNAMIC DISCS ────────────────────────────────────────────────────────────
  { brand: "Dynamic Discs", mold: "Raider", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 3, plastics: ["Lucid", "Lucid Air", "Fuzion", "Classic"] },
  { brand: "Dynamic Discs", mold: "Felon", category: "Distance Driver", speed: 9, glide: 4, turn: 0, fade: 4, plastics: ["Lucid", "Fuzion", "Classic"] },
  { brand: "Dynamic Discs", mold: "Maverick", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["Lucid", "Lucid Air", "Fuzion"] },
  { brand: "Dynamic Discs", mold: "Escape", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["Lucid", "Fuzion", "Classic"] },
  { brand: "Dynamic Discs", mold: "Truth", category: "Midrange", speed: 5, glide: 5, turn: -1, fade: 1, plastics: ["Lucid", "Fuzion", "Classic"] },
  { brand: "Dynamic Discs", mold: "Verdict", category: "Midrange", speed: 5, glide: 5, turn: 0, fade: 2, plastics: ["Lucid", "Fuzion"] },
  { brand: "Dynamic Discs", mold: "Judge", category: "Putter", speed: 2, glide: 4, turn: 0, fade: 1, plastics: ["Lucid", "Fuzion", "Classic", "Prime"] },
  { brand: "Dynamic Discs", mold: "Warden", category: "Putter", speed: 2, glide: 4, turn: 0, fade: 1, plastics: ["Lucid", "Fuzion", "Classic"] },

  // ── LATITUDE 64 ──────────────────────────────────────────────────────────────
  { brand: "Latitude 64", mold: "Ballista Pro", category: "Distance Driver", speed: 14, glide: 5, turn: -1, fade: 3, plastics: ["Gold", "Opto", "Royal"] },
  { brand: "Latitude 64", mold: "Saint", category: "Fairway Driver", speed: 8, glide: 6, turn: -2, fade: 2, plastics: ["Gold", "Opto", "Royal"] },
  { brand: "Latitude 64", mold: "Jade", category: "Fairway Driver", speed: 9, glide: 6, turn: -2, fade: 2, plastics: ["Gold", "Opto"] },
  { brand: "Latitude 64", mold: "Flow", category: "Fairway Driver", speed: 11, glide: 6, turn: -2, fade: 2, plastics: ["Gold", "Opto"] },
  { brand: "Latitude 64", mold: "River", category: "Fairway Driver", speed: 7, glide: 7, turn: -2, fade: 1, plastics: ["Gold", "Opto", "Royal"] },
  { brand: "Latitude 64", mold: "Pure", category: "Putter", speed: 3, glide: 4, turn: 0, fade: 1, plastics: ["Gold", "Opto", "Royal"] },
  { brand: "Latitude 64", mold: "Mercy", category: "Putter", speed: 2, glide: 3, turn: 0, fade: 1, plastics: ["Gold", "Opto"] },

  // ── THOUGHT SPACE ATHLETICS ──────────────────────────────────────────────────
  { brand: "Thought Space Athletics", mold: "Omen", category: "Distance Driver", speed: 12, glide: 5, turn: -1, fade: 3, plastics: ["Ethos", "Aura", "Nerve"] },
  { brand: "Thought Space Athletics", mold: "Animus", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["Ethos", "Aura"] },
  { brand: "Thought Space Athletics", mold: "Mantra", category: "Midrange", speed: 5, glide: 5, turn: -1, fade: 2, plastics: ["Ethos", "Aura"] },
  { brand: "Thought Space Athletics", mold: "Construct", category: "Putter", speed: 3, glide: 3, turn: 0, fade: 1, plastics: ["Ethos", "Aura", "Nerve"] },

  // ── PRODIGY ──────────────────────────────────────────────────────────────────
  { brand: "Prodigy", mold: "D1", category: "Distance Driver", speed: 13, glide: 5, turn: -1, fade: 3, plastics: ["400", "400G", "500", "750"] },
  { brand: "Prodigy", mold: "D2", category: "Distance Driver", speed: 12, glide: 5, turn: -2, fade: 2, plastics: ["400", "500", "750"] },
  { brand: "Prodigy", mold: "F1", category: "Fairway Driver", speed: 9, glide: 5, turn: -2, fade: 2, plastics: ["400", "400G", "500"] },
  { brand: "Prodigy", mold: "M3", category: "Midrange", speed: 5, glide: 5, turn: -1, fade: 2, plastics: ["400", "400G", "500"] },
  { brand: "Prodigy", mold: "PA-3", category: "Putter", speed: 3, glide: 3, turn: 0, fade: 1, plastics: ["300", "400", "750"] },
  { brand: "Prodigy", mold: "PA-5", category: "Putter", speed: 3, glide: 4, turn: -2, fade: 0, plastics: ["300", "400"] },
];

export const BRANDS = [...new Set(DISC_DATABASE.map(d => d.brand))].sort();
export const CATEGORIES = ["Distance Driver", "Fairway Driver", "Midrange", "Putter", "Utility"];
export const WEAR_LEVELS = ["New", "Broken In", "Seasoned", "Beat"];

export const SHOT_SHAPES = [
  { key: "bh_hyzer", label: "BH Hyzer", group: "Backhand" },
  { key: "bh_flat", label: "BH Flat", group: "Backhand" },
  { key: "bh_anhyzer", label: "BH Anhyzer", group: "Backhand" },
  { key: "bh_hyzer_flip", label: "BH Hyzer Flip", group: "Backhand" },
  { key: "bh_flex", label: "BH Flex", group: "Backhand" },
  { key: "fh_hyzer", label: "FH Hyzer", group: "Forehand" },
  { key: "fh_flat", label: "FH Flat", group: "Forehand" },
  { key: "fh_anhyzer", label: "FH Anhyzer", group: "Forehand" },
  { key: "tomahawk", label: "Tomahawk", group: "Utility" },
  { key: "thumber", label: "Thumber", group: "Utility" },
  { key: "grenade", label: "Grenade", group: "Utility" },
  { key: "roller", label: "Roller", group: "Utility" },
  { key: "skip", label: "Skip Shot", group: "Utility" },
];

export const PLASTIC_TIERS = {
  base: { label: "Base Plastic", color: "#9CA3AF", description: "DX, Pro, P-Line, 300, Classic" },
  mid: { label: "Mid-Grade", color: "#60A5FA", description: "Star, ESP, S-Line, 400, Gold" },
  premium: { label: "Premium", color: "#A78BFA", description: "Champion, Big Z, C-Line, Neutron, Opto" },
  elite: { label: "Tour Series", color: "#FBBF24", description: "Halo Star, Cryztal, Lux, Plasma, Royal" },
  glow: { label: "Glow", color: "#34D399", description: "Special edition — earned under special circumstances" },
};