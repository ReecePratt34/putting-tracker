// ── Google Fonts ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
if (!document.head.querySelector("link[href*='Bebas']")) document.head.appendChild(fontLink);

// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  navy:    "#0B1120",
  card:    "#111827",
  border:  "#1F2937",
  aqua:    "#00C2CB",
  orange:  "#FF6B35",
  white:   "#F0F4F8",
  muted:   "#6B7280",
  dim:     "#374151",
  green:   "#10B981",
  yellow:  "#FBBF24",
  red:     "#EF4444",
  purple:  "#A78BFA",
};

export const T = {
  display: "'Bebas Neue', sans-serif",
  body:    "'DM Sans', sans-serif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().split("T")[0];

export function fmtDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function fmtMonth(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function weekKey(date) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split("T")[0];
}

export function weekDates(wk) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(wk + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function monthDates(y, m) {
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
  );
}

export function scoreToPar(score, par) {
  if (score === null || score === undefined || par === null) return null;
  return score - par;
}

export function scoreLabel(diff) {
  if (diff === null) return "—";
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export function scoreColor(diff) {
  if (diff === null) return C.muted;
  if (diff < -2) return C.purple;
  if (diff === -2) return C.aqua;
  if (diff === -1) return C.green;
  if (diff === 0) return C.white;
  if (diff === 1) return C.yellow;
  return C.red;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
export function Tag({ children, color }) {
  color = color || C.aqua;
  return (
    <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color, background: color + "20", padding: "3px 8px", borderRadius: 4 }}>
      {children}
    </span>
  );
}

export function Card({ children, accent, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 12, border: `1px solid ${accent || C.border}`, marginBottom: 10, overflow: "hidden", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

export function NavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: C.card, border: `1px solid ${C.border}`, color: disabled ? C.dim : C.white, borderRadius: 10, width: 38, height: 38, fontSize: 20, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.body }}>
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.body, fontSize: 14, fontWeight: 500, padding: "10px 12px", width: "100%", boxSizing: "border-box", ...style }} />
  );
}

export function Pill({ active, color, onClick, children }) {
  color = color || C.aqua;
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontFamily: T.body, fontWeight: 600, cursor: "pointer", background: active ? color + "20" : C.navy, border: `1px solid ${active ? color : C.border}`, color: active ? color : C.muted, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

export function SectionHeader({ title, color }) {
  color = color || C.white;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ fontFamily: T.display, fontSize: 18, color, letterSpacing: 2 }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

export function StatBox({ label, value, sub, color }) {
  color = color || C.aqua;
  return (
    <div style={{ flex: 1, background: C.card, borderRadius: 12, padding: "14px 10px", border: `1px solid ${color}30`, textAlign: "center" }}>
      <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.display, fontSize: 26, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}