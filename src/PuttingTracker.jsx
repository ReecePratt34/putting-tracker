import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── Google Fonts injection ──────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink);

// ── Design tokens ───────────────────────────────────────────────────────────
const C = {
  navy:    "#0B1120",
  card:    "#111827",
  border:  "#1F2937",
  aqua:    "#00C2CB",
  aquaDim: "#00C2CB22",
  orange:  "#FF6B35",
  orangeDim:"#FF6B3522",
  white:   "#F0F4F8",
  muted:   "#6B7280",
  dim:     "#374151",
  green:   "#10B981",
  yellow:  "#FBBF24",
  red:     "#EF4444",
};

const T = {
  display: "'Bebas Neue', sans-serif",
  body:    "'DM Sans', sans-serif",
};

// ── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_DRILLS = [
  { key: "Warm-Up",        label: "Warm-Up",        distance: "10 FT",   instruction: "10 putts from 10 feet. No scorekeeping — just groove a smooth release and follow-through. Focus on form, not results.", custom: false },
  { key: "Confidence Range", label: "Confidence Range", distance: "15–20 FT", instruction: "20 putts from 15–20 feet. Track your makes. Aim for 15+/20. This is your money zone — build a repeatable stance and release here.", custom: false },
  { key: "Pressure Block", label: "Pressure Block", distance: "25–30 FT", instruction: "10 putts from 25–30 feet. If you miss, restart the set (max 3 restarts). Simulates tournament pressure — trains composure under stress.", custom: false },
  { key: "Circle 2 - 35ft", label: "Circle 2",     distance: "35 FT",   instruction: "5 putts from 35 feet. Goal: make at least 2/5. Builds distance feel — don't expect perfection, just stay aggressive.", custom: false },
  { key: "Circle 2 - 40ft", label: "Circle 2",     distance: "40 FT",   instruction: "5 putts from 40 feet. Goal: make at least 2/5. Keep the same release as closer distances.", custom: false },
  { key: "Circle 2 - 45ft", label: "Circle 2",     distance: "45 FT",   instruction: "5 putts from 45 feet. Goal: make at least 2/5. This is max range — focus on confident follow-through.", custom: false },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_FINISHER = 6;
const CONDITIONS = ["Sunny", "Cloudy", "Windy", "Rainy", "Indoor", "Hot", "Cold"];
const SURFACES = ["Concrete", "Grass", "Carpet", "Turf", "Dirt"];
const DRILL_COLORS = [C.aqua, C.orange, "#A78BFA", "#34D399", "#F472B6", "#60A5FA"];

// ── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

function weekKey(date) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split("T")[0];
}

function weekDates(wk) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(wk + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function monthDates(y, m) {
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
  );
}

function fmtDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function pct(makes, attempts) {
  const m = parseFloat(makes), a = parseFloat(attempts);
  if (!a || isNaN(m) || isNaN(a)) return null;
  return Math.round((m / a) * 100);
}

function pctCol(p) {
  if (p === null) return C.muted;
  if (p >= 75) return C.green;
  if (p >= 50) return C.yellow;
  return C.red;
}

function emptySession(drills) {
  return {
    ...drills.reduce((a, d) => { a[d.key] = { makes: "", attempts: "" }; return a; }, {}),
    finisherRounds: [{ makes: "" }],
    putter: "", notes: "", conditions: [], surface: "",
  };
}

function currentStreak(sessions) {
  let streak = 0;
  const t = today();
  let cur = new Date(t + "T00:00:00");
  while (true) {
    const k = cur.toISOString().split("T")[0];
    if (sessions[k]) streak++;
    else if (k !== t) break;
    cur.setDate(cur.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

function longestStreak(sessions) {
  const dates = Object.keys(sessions).sort();
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i] + "T00:00:00") - new Date(dates[i-1] + "T00:00:00")) / 86400000;
    if (diff === 1) { cur++; best = Math.max(best, cur); } else cur = 1;
  }
  return best;
}

function allPRs(sessions, drills) {
  const prs = drills.reduce((a, d) => { a[d.key] = 0; return a; }, {});
  Object.values(sessions).forEach(s => {
    drills.forEach(d => {
      const p = pct(s[d.key]?.makes, s[d.key]?.attempts);
      if (p !== null && p > prs[d.key]) prs[d.key] = p;
    });
  });
  return prs;
}

function exportCSV(sessions, drills) {
  const keys = drills.map(d => d.key);
  const headers = ["Date","Putter","Conditions","Surface",...keys.flatMap(k=>[`${k} Makes`,`${k} Att`,`${k} %`]),"Finisher Att","Finisher Done On","Notes"];
  const rows = Object.entries(sessions).sort(([a],[b])=>a.localeCompare(b)).map(([date,s])=>{
    const fd = (s.finisherRounds||[]).findIndex(r=>parseInt(r.makes)===5);
    return [date,s.putter||"",(s.conditions||[]).join(";"),s.surface||"",...keys.flatMap(k=>{const p=pct(s[k]?.makes,s[k]?.attempts);return[s[k]?.makes||"",s[k]?.attempts||"",p!==null?p+"%":""];}),(s.finisherRounds||[]).length,fd>=0?fd+1:"",( s.notes||"").replace(/,/g,";")];
  });
  const csv=[headers,...rows].map(r=>r.join(",")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download=`puttlog-${today()}.csv`;a.click();
}

// ── Shared UI pieces ─────────────────────────────────────────────────────────

function Tag({ children, color = C.aqua }) {
  return (
    <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color, background: color + "20", padding: "3px 8px", borderRadius: 4 }}>
      {children}
    </span>
  );
}

function StatBox({ label, value, sub, color = C.aqua }) {
  return (
    <div style={{ flex: 1, background: C.card, borderRadius: 12, padding: "14px 10px", border: `1px solid ${color}30`, textAlign: "center" }}>
      <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: T.display, fontSize: 28, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function PctBadge({ p }) {
  if (p === null) return null;
  return (
    <span style={{ fontFamily: T.display, fontSize: 20, color: pctCol(p), background: pctCol(p) + "18", padding: "2px 10px", borderRadius: 6, lineHeight: 1.2 }}>
      {p}%
    </span>
  );
}

function BarTrack({ value, color }) {
  return (
    <div style={{ height: 5, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: (value || 0) + "%", background: color, borderRadius: 3, transition: "width .4s ease" }} />
    </div>
  );
}

function GoalBar({ p, goal }) {
  if (!goal || p === null) return null;
  const prog = Math.min(100, Math.round((p / goal) * 100));
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>Goal: {goal}%</span>
        <span style={{ fontFamily: T.body, fontSize: 10, color: p >= goal ? C.green : C.muted }}>{prog}% there</span>
      </div>
      <BarTrack value={prog} color={p >= goal ? C.green : C.orange} />
    </div>
  );
}

function Card({ children, accent, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${accent || C.border}`, marginBottom: 10, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function NavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: C.card, border: `1px solid ${C.border}`, color: disabled ? C.dim : C.white, borderRadius: 10, width: 38, height: 38, fontSize: 20, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.body }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.body, fontSize: 15, fontWeight: 600, padding: "10px 12px", width: "100%", boxSizing: "border-box", ...style }} />
  );
}

function Pill({ active, color = C.aqua, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontFamily: T.body, fontWeight: 600, cursor: "pointer", background: active ? color + "20" : C.navy, border: `1px solid ${active ? color : C.border}`, color: active ? color : C.muted, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

// ── Drill Card ───────────────────────────────────────────────────────────────
function DrillCard({ drill, data, onUpdate, expanded, onToggle, pr, goals, setGoals, showGoals }) {
  const p = pct(data?.makes, data?.attempts);
  const isPR = p !== null && p > 0 && pr > 0 && p >= pr;
  return (
    <Card accent={isPR ? C.orange + "60" : C.border}>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.display, fontSize: 18, color: C.white, letterSpacing: 1 }}>{drill.label}</span>
            <Tag color={C.aqua}>{drill.distance}</Tag>
            {isPR && <Tag color={C.orange}>★ PR</Tag>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PctBadge p={p} />
            <button onClick={onToggle} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>{expanded ? "▲" : "▼"}</button>
          </div>
        </div>

        {expanded && (
          <div style={{ background: C.navy, borderRadius: 8, padding: "10px 12px", marginBottom: 12, borderLeft: `3px solid ${C.aqua}` }}>
            <p style={{ fontFamily: T.body, fontSize: 12, color: C.muted, lineHeight: 1.7, margin: 0 }}>{drill.instruction}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {[["Makes", "makes"], ["Attempts", "attempts"]].map(([label, field]) => (
            <label key={field} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              <Input type="number" value={data?.[field] || ""} onChange={e => onUpdate(field, e.target.value)} placeholder="0" />
            </label>
          ))}
        </div>

        {pr > 0 && <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 6 }}>All-time best: <span style={{ color: C.orange }}>{pr}%</span></div>}

        {showGoals && (
          <div style={{ marginTop: 10 }}>
            <GoalBar p={p} goal={goals[drill.key]} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: T.body, fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>Set goal %</span>
              <Input type="number" value={goals[drill.key] || ""} onChange={e => setGoals(g => ({ ...g, [drill.key]: parseInt(e.target.value) || "" }))} placeholder="e.g. 80" style={{ fontSize: 13, fontWeight: 500 }} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function PuttingTracker({ onBack }) {
  const [sessions, setSessions] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_v4") || "{}"); } catch { return {}; } });
  const [drills, setDrills] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_drills_v4") || "null") || DEFAULT_DRILLS; } catch { return DEFAULT_DRILLS; } });
  const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_goals_v4") || "{}"); } catch { return {}; } });
  const [view, setView] = useState("log");
  const [selDate, setSelDate] = useState(today());
  const [form, setForm] = useState(() => emptySession(DEFAULT_DRILLS));
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selWeek, setSelWeek] = useState(() => weekKey(today()));
  const [monthOff, setMonthOff] = useState(0);
  const [showAddDrill, setShowAddDrill] = useState(false);
  const [newDrill, setNewDrill] = useState({ label: "", distance: "", instruction: "" });
  const [showGoals, setShowGoals] = useState(false);
  const [csvFlash, setCsvFlash] = useState(false);

  const prs = allPRs(sessions, drills);
  const streak = currentStreak(sessions);
  const bestStreak = longestStreak(sessions);

  useEffect(() => {
    setForm(sessions[selDate] ? { ...emptySession(drills), ...sessions[selDate] } : emptySession(drills));
    setSaved(false);
  }, [selDate]);

  useEffect(() => { try { localStorage.setItem("puttlog_v4", JSON.stringify(sessions)); } catch {} }, [sessions]);
  useEffect(() => { try { localStorage.setItem("puttlog_drills_v4", JSON.stringify(drills)); } catch {} }, [drills]);
  useEffect(() => { try { localStorage.setItem("puttlog_goals_v4", JSON.stringify(goals)); } catch {} }, [goals]);

  const updateDrill = (key, field, val) => { setForm(f => ({ ...f, [key]: { ...f[key], [field]: val } })); setSaved(false); };
  const updateFinisher = (idx, val) => { setForm(f => { const r = [...(f.finisherRounds||[])]; r[idx] = { makes: val }; return { ...f, finisherRounds: r }; }); setSaved(false); };
  const addFinisher = () => { setForm(f => { const r = [...(f.finisherRounds||[])]; if (r.length < MAX_FINISHER) r.push({ makes: "" }); return { ...f, finisherRounds: r }; }); };
  const removeFinisher = idx => { setForm(f => { const r = f.finisherRounds.filter((_,i)=>i!==idx); return { ...f, finisherRounds: r.length ? r : [{ makes: "" }] }; }); setSaved(false); };
  const toggleCond = c => { setForm(f => { const cur = f.conditions||[]; return { ...f, conditions: cur.includes(c) ? cur.filter(x=>x!==c) : [...cur, c] }; }); setSaved(false); };
  const saveSession = () => { setSessions(s => ({ ...s, [selDate]: form })); setSaved(true); };
  const shiftDate = d => { const dt = new Date(selDate+"T00:00:00"); dt.setDate(dt.getDate()+d); setSelDate(dt.toISOString().split("T")[0]); };

  const addCustomDrill = () => {
    if (!newDrill.label) return;
    setDrills(d => [...d, { ...newDrill, key: "custom_"+Date.now(), custom: true }]);
    setNewDrill({ label: "", distance: "", instruction: "" });
    setShowAddDrill(false);
  };

  const handleExport = () => { exportCSV(sessions, drills); setCsvFlash(true); setTimeout(()=>setCsvFlash(false),2000); };

  // ── Stats helpers ──
  function weekStats(wk) {
    const dates = weekDates(wk);
    const totals = drills.reduce((a,d)=>{ a[d.key]={makes:0,attempts:0}; return a; }, {});
    let active = 0;
    dates.forEach(date => {
      const s = sessions[date]; if (!s) return;
      let has = false;
      drills.forEach(({key}) => { const m=parseFloat(s[key]?.makes),a=parseFloat(s[key]?.attempts); if (!isNaN(m)&&!isNaN(a)&&a>0){totals[key].makes+=m;totals[key].attempts+=a;has=true;} });
      if (has) active++;
    });
    return { totals, active, dates };
  }

  function monthStats() {
    const now = new Date(); const t = new Date(now.getFullYear(), now.getMonth()+monthOff, 1);
    const dates = monthDates(t.getFullYear(), t.getMonth());
    const totals = drills.reduce((a,d)=>{ a[d.key]={makes:0,attempts:0}; return a; },{});
    const putterMap = {};
    let active = 0;
    dates.forEach(date => {
      const s = sessions[date]; if (!s) return;
      let has = false;
      drills.forEach(({key})=>{ const m=parseFloat(s[key]?.makes),a=parseFloat(s[key]?.attempts); if(!isNaN(m)&&!isNaN(a)&&a>0){totals[key].makes+=m;totals[key].attempts+=a;has=true;} });
      if (has) { active++; if (s.putter) putterMap[s.putter]=(putterMap[s.putter]||0)+1; }
    });
    return { totals, active, putterMap, dates, label: t.toLocaleDateString("en-US",{month:"long",year:"numeric"}) };
  }

  function trendData() {
    const avail = [...new Set(Object.keys(sessions).map(d=>weekKey(d)))].sort().slice(-8);
    return avail.map(wk => {
      const s = weekStats(wk); const start = new Date(wk+"T00:00:00");
      const row = { week: start.toLocaleDateString("en-US",{month:"short",day:"numeric"}) };
      drills.forEach(d => { row[d.key] = pct(s.totals[d.key].makes, s.totals[d.key].attempts); });
      return row;
    });
  }

  function putterComp() {
    const map = {};
    Object.values(sessions).forEach(s => {
      if (!s.putter) return;
      if (!map[s.putter]) map[s.putter] = drills.reduce((a,d)=>{ a[d.key]={makes:0,attempts:0}; return a; },{});
      drills.forEach(({key})=>{ const m=parseFloat(s[key]?.makes),a=parseFloat(s[key]?.attempts); if(!isNaN(m)&&!isNaN(a)&&a>0){map[s.putter][key].makes+=m;map[s.putter][key].attempts+=a;} });
    });
    return map;
  }

  const availWeeks = () => { const s=new Set(Object.keys(sessions).map(d=>weekKey(d))); s.add(weekKey(today())); return [...s].sort().reverse(); };
  const ws = weekStats(selWeek);
  const ms = monthStats();
  const td = trendData();
  const pc = putterComp();
  const putterNames = Object.keys(pc);

  const tabs = [["log","LOG"],["week","WEEK"],["month","MONTH"],["stats","STATS"]];

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(160deg, #0D1B2A 0%, ${C.navy} 100%)`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            {onBack && <button onClick={onBack} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:12, fontWeight:700, cursor:"pointer", padding:0, marginBottom:4, letterSpacing:1 }}>← HOME</button>}
            <div style={{ fontFamily: T.display, fontSize: 32, color: C.white, letterSpacing: 3, lineHeight: 1 }}>PUTT LOG</div>
            <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 2, marginTop: 2 }}>DISC GOLF PRACTICE</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {streak > 0 && (
              <div style={{ background: C.orange + "20", border: `1px solid ${C.orange}50`, borderRadius: 20, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                
                <span style={{ fontFamily: T.display, fontSize: 18, color: C.orange, lineHeight: 1 }}>{streak}</span>
                <span style={{ fontFamily: T.body, fontSize: 10, color: C.orange }}>DAY</span>
              </div>
            )}
            <button onClick={handleExport} style={{ background: csvFlash ? C.green+"20" : C.card, border: `1px solid ${csvFlash ? C.green : C.border}`, color: csvFlash ? C.green : C.muted, borderRadius: 8, padding: "6px 12px", fontSize: 11, fontFamily: T.body, fontWeight: 600, cursor: "pointer", letterSpacing: 1 }}>
              {csvFlash ? "✓ SAVED" : "⬇ CSV"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={{
              flex: 1, padding: "10px 0", background: view === key ? C.aqua : "transparent",
              color: view === key ? C.navy : C.muted, border: "none",
              borderBottom: view === key ? "none" : `1px solid ${C.border}`,
              cursor: "pointer", fontFamily: T.display, fontSize: 15, letterSpacing: 2,
              borderRadius: view === key ? "8px 8px 0 0" : 0, transition: "all .15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          LOG
      ════════════════════════════════════════ */}
      {view === "log" && (
        <div style={{ padding: "0 10px" }}>
          {/* Date nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 14px", borderBottom: `1px solid ${C.border}` }}>
            <NavBtn onClick={() => shiftDate(-1)}>‹</NavBtn>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.display, fontSize: 22, color: C.white, letterSpacing: 2 }}>{fmtDate(selDate).toUpperCase()}</div>
              {selDate === today() && <div style={{ fontFamily: T.body, fontSize: 10, color: C.aqua, letterSpacing: 2, marginTop: 2, fontWeight: 700 }}>TODAY</div>}
            </div>
            <NavBtn onClick={() => shiftDate(1)} disabled={selDate >= today()}>›</NavBtn>
          </div>

          <div style={{ marginTop: 14 }}>
            {drills.map(drill => (
              <div key={drill.key}>
                <DrillCard
                  drill={drill} data={form[drill.key]}
                  onUpdate={(f, v) => updateDrill(drill.key, f, v)}
                  expanded={expanded === drill.key}
                  onToggle={() => setExpanded(expanded === drill.key ? null : drill.key)}
                  pr={prs[drill.key] || 0} goals={goals} setGoals={setGoals} showGoals={showGoals}
                />
                {drill.custom && (
                  <button onClick={() => setDrills(d => d.filter(x => x.key !== drill.key))}
                    style={{ fontFamily: T.body, fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer", marginTop: -6, marginBottom: 8, padding: 0 }}>
                    ✕ Remove drill
                  </button>
                )}
              </div>
            ))}

            {/* 5-in-a-Row */}
            {(() => {
              const rounds = form.finisherRounds || [{ makes: "" }];
              const done = rounds.findIndex(r => parseInt(r.makes) === 5);
              const isExp = expanded === "finisher";
              return (
                <Card accent={C.orange + "50"}>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: T.display, fontSize: 18, color: C.orange, letterSpacing: 1 }}>5-IN-A-ROW</span>
                        <Tag color={C.orange}>20 FT</Tag>
                        <Tag color={C.orange}>FINISHER</Tag>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {done >= 0 && <Tag color={C.green}>✓ ATT {done+1}</Tag>}
                        <button onClick={() => setExpanded(isExp ? null : "finisher")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: 0 }}>{isExp ? "▲" : "▼"}</button>
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ background: C.navy, borderRadius: 8, padding: "10px 12px", marginBottom: 12, borderLeft: `3px solid ${C.orange}` }}>
                        <p style={{ fontFamily: T.body, fontSize: 12, color: C.muted, lineHeight: 1.7, margin: 0 }}>Stand at 20 feet. Make 5 consecutive putts to finish. Log how many you made each attempt. Can't leave until you get 5 in a row — up to 6 attempts.</p>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {rounds.map((r, idx) => {
                        const isDone = parseInt(r.makes) === 5;
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 65, letterSpacing: 1 }}>ATT {idx+1}</span>
                            <Input type="number" value={r.makes} onChange={e => updateFinisher(idx, e.target.value)} placeholder="0–5"
                              style={{ flex: 1, borderColor: isDone ? C.green+"60" : C.border, color: isDone ? C.green : C.white }} />
                            <span style={{ fontSize: 13, color: isDone ? C.green : C.dim, minWidth: 16 }}>{isDone ? "✓" : "/5"}</span>
                            {rounds.length > 1 && <button onClick={() => removeFinisher(idx)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>}
                          </div>
                        );
                      })}
                      {rounds.length < MAX_FINISHER && done < 0 && (
                        <button onClick={addFinisher} style={{ background: C.navy, border: `1px dashed ${C.border}`, color: C.muted, borderRadius: 8, padding: 10, cursor: "pointer", fontFamily: T.body, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
                          + ADD ATTEMPT
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Add custom drill */}
            {!showAddDrill ? (
              <button onClick={() => setShowAddDrill(true)} style={{ width: "100%", background: C.card, border: `1px dashed ${C.border}`, color: C.muted, borderRadius: 12, padding: "12px 0", cursor: "pointer", fontFamily: T.body, fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>
                + ADD CUSTOM DRILL
              </button>
            ) : (
              <Card>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: T.display, fontSize: 18, color: C.aqua, letterSpacing: 2, marginBottom: 12 }}>NEW DRILL</div>
                  {[["label","Drill Name"],["distance","Distance (e.g. 25 FT)"],["instruction","Instructions"]].map(([f,ph])=>(
                    <Input key={f} value={newDrill[f]} onChange={e=>setNewDrill(n=>({...n,[f]:e.target.value}))} placeholder={ph} style={{fontSize:13,fontWeight:500,marginBottom:8}} />
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={addCustomDrill} style={{ flex:1, background:C.aqua, border:"none", color:C.navy, borderRadius:8, padding:10, cursor:"pointer", fontFamily:T.body, fontWeight:700, fontSize:13 }}>ADD</button>
                    <button onClick={()=>setShowAddDrill(false)} style={{ flex:1, background:C.navy, border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:10, cursor:"pointer", fontFamily:T.body, fontSize:13 }}>CANCEL</button>
                  </div>
                </div>
              </Card>
            )}

            {/* Goals toggle */}
            <button onClick={() => setShowGoals(g=>!g)} style={{ width:"100%", background:showGoals?C.green+"15":C.card, border:`1px solid ${showGoals?C.green:C.border}`, color:showGoals?C.green:C.muted, borderRadius:12, padding:"12px 0", cursor:"pointer", fontFamily:T.body, fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:10 }}>
              {showGoals ? "✓ GOALS ON" : "SET GOALS"}
            </button>

            {/* Conditions */}
            <Card>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontFamily: T.display, fontSize: 16, color: C.white, letterSpacing: 2, marginBottom: 12 }}>CONDITIONS</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                  {CONDITIONS.map(c=><Pill key={c} active={(form.conditions||[]).includes(c)} onClick={()=>toggleCond(c)}>{c}</Pill>)}
                </div>
                <div style={{ fontFamily:T.display, fontSize:14, color:C.white, letterSpacing:2, marginBottom:8 }}>SURFACE</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {SURFACES.map(s=><Pill key={s} color={C.orange} active={form.surface===s} onClick={()=>{setForm(f=>({...f,surface:f.surface===s?"":s}));setSaved(false);}}>{s}</Pill>)}
                </div>
              </div>
            </Card>

            {/* Session details */}
            <Card>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <div style={{ fontFamily:T.display, fontSize:16, color:C.aqua, letterSpacing:2 }}>SESSION DETAILS</div>
                  <div style={{ flex:1, height:1, background:C.border }} />
                </div>
                <label style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                  <span style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:"uppercase" }}>Putter Used</span>
                  <Input value={form.putter||""} onChange={e=>{setForm(f=>({...f,putter:e.target.value}));setSaved(false);}} placeholder="e.g. Innova Aviar, Discraft Luna..." style={{fontSize:13,fontWeight:500}} />
                </label>
                <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:"uppercase" }}>Notes</span>
                  <textarea value={form.notes||""} onChange={e=>{setForm(f=>({...f,notes:e.target.value}));setSaved(false);}} placeholder="How did it feel? Any adjustments..." rows={3}
                    style={{ width:"100%", background:C.navy, border:`1px solid ${C.border}`, borderRadius:8, color:C.white, fontFamily:T.body, fontSize:13, padding:"10px 12px", resize:"none", boxSizing:"border-box" }} />
                </label>
              </div>
            </Card>

            <button onClick={saveSession} style={{ width:"100%", padding:"16px 0", background:saved?C.green+"20":C.aqua, color:saved?C.green:C.navy, border:saved?`1px solid ${C.green}`:"none", borderRadius:12, fontFamily:T.display, fontSize:22, letterSpacing:3, cursor:"pointer", transition:"all .2s", marginBottom:10 }}>
              {saved ? "✓ SAVED" : "SAVE SESSION"}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          WEEK
      ════════════════════════════════════════ */}
      {view === "week" && (
        <div style={{ padding: "0 10px" }}>
          {/* Week selector */}
          <div style={{ padding:"14px 0 10px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:8 }}>SELECT WEEK</div>
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
              {availWeeks().map(wk=>{
                const s=new Date(wk+"T00:00:00"),e=new Date(wk+"T00:00:00"); e.setDate(e.getDate()+6);
                return <Pill key={wk} active={selWeek===wk} onClick={()=>setSelWeek(wk)}>{s.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – {e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</Pill>;
              })}
            </div>
          </div>

          {/* Days */}
          <div style={{ padding:"14px 0 6px" }}>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:10 }}>DAYS PRACTICED</div>
            <div style={{ display:"flex", gap:6 }}>
              {ws.dates.map((date,i)=>{
                const s=sessions[date];
                return (
                  <div key={date} style={{ flex:1, textAlign:"center", padding:"10px 4px", background:s?C.aqua+"20":C.card, border:`1px solid ${s?C.aqua+"50":C.border}`, borderRadius:10 }}>
                    <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:s?C.aqua:C.dim }}>{DAYS[i]}</div>
                    <div style={{ fontFamily:T.display, fontSize:18, color:s?C.aqua:C.dim, marginTop:2 }}>{s?"✓":"·"}</div>
                    {s?.putter && <div style={{ fontSize:7, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", padding:"0 2px" }}>{s.putter.split(" ")[0]}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily:T.body, fontSize:12, color:C.muted, marginTop:8 }}>
              <span style={{ color:C.aqua, fontWeight:700 }}>{ws.active}</span> / 7 days logged
            </div>
          </div>

          {/* Putter summary */}
          {(() => {
            const putters = ws.dates.map(d=>sessions[d]?.putter).filter(Boolean);
            if (!putters.length) return null;
            const counts = putters.reduce((a,p)=>{ a[p]=(a[p]||0)+1; return a; },{});
            return (
              <Card accent={C.aqua+"30"}>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontFamily:T.display, fontSize:16, color:C.aqua, letterSpacing:2, marginBottom:10 }}>PUTTERS THIS WEEK</div>
                  {Object.entries(counts).map(([p,n])=>(
                    <div key={p} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontFamily:T.body, fontSize:13, color:C.white }}>{p}</span>
                      <span style={{ fontFamily:T.body, fontSize:12, color:C.muted }}>{n} session{n>1?"s":""}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}

          {/* Drill averages */}
          <div style={{ marginTop:10 }}>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:10 }}>DRILL AVERAGES</div>
            {drills.map(drill=>{
              const {makes,attempts}=ws.totals[drill.key]||{makes:0,attempts:0};
              const p=pct(makes,attempts);
              return (
                <Card key={drill.key}>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div><span style={{ fontFamily:T.display, fontSize:16, color:C.white, letterSpacing:1 }}>{drill.label}</span> <Tag color={C.aqua}>{drill.distance}</Tag></div>
                      <PctBadge p={p} />
                    </div>
                    <BarTrack value={p} color={pctCol(p)} />
                    {attempts>0 && <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, marginTop:5 }}>{makes} makes / {attempts} attempts</div>}
                    <GoalBar p={p} goal={goals[drill.key]} />
                  </div>
                </Card>
              );
            })}

            {/* Finisher recap */}
            {(() => {
              const comps = ws.dates.map(d=>{const idx=(sessions[d]?.finisherRounds||[]).findIndex(r=>parseInt(r.makes)===5);return idx>=0?idx+1:null;}).filter(Boolean);
              if (!comps.length) return null;
              const avg=(comps.reduce((a,b)=>a+b,0)/comps.length).toFixed(1);
              return (
                <Card accent={C.orange+"40"}>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontFamily:T.display, fontSize:16, color:C.orange, letterSpacing:2, marginBottom:10 }}>5-IN-A-ROW</div>
                    <div style={{ display:"flex", gap:16 }}>
                      {[["AVG ATTEMPTS",avg,C.white],["BEST",Math.min(...comps),C.orange],["COMPLETIONS",comps.length,C.white]].map(([l,v,col])=>(
                        <div key={l}><div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:1 }}>{l}</div><div style={{ fontFamily:T.display, fontSize:26, color:col }}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>

          {/* Daily breakdown */}
          <div style={{ marginTop:14 }}>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:10 }}>DAILY BREAKDOWN</div>
            {ws.dates.map((date,i)=>{
              const s=sessions[date];
              if (!s) return (
                <Card key={date}>
                  <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:T.body, fontSize:13, color:C.dim }}>{DAYS[i]} · {fmtDate(date)}</span>
                    <span style={{ fontFamily:T.body, fontSize:11, color:C.dim }}>No session</span>
                  </div>
                </Card>
              );
              const pcts=drills.map(d=>pct(s[d.key]?.makes,s[d.key]?.attempts)).filter(p=>p!==null);
              const avg=pcts.length?Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length):null;
              const finDone=(s.finisherRounds||[]).findIndex(r=>parseInt(r.makes)===5);
              return (
                <Card key={date}>
                  <div style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontFamily:T.body, fontSize:13, fontWeight:600, color:C.white }}>{DAYS[i]} · {fmtDate(date)}</span>
                      {avg!==null && <PctBadge p={avg} />}
                    </div>
                    {s.putter && <div style={{ fontFamily:T.body, fontSize:12, color:C.aqua, marginTop:4 }}>{s.putter}</div>}
                    {s.conditions?.length>0 && <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, marginTop:2 }}>{s.conditions.join(" · ")}{s.surface?` · ${s.surface}`:""}</div>}
                    {finDone>=0 && <div style={{ fontFamily:T.body, fontSize:11, color:C.green, marginTop:2 }}>Finisher on attempt {finDone+1}</div>}
                    {s.notes && <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, marginTop:4, fontStyle:"italic" }}>"{s.notes}"</div>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MONTH
      ════════════════════════════════════════ */}
      {view === "month" && (
        <div style={{ padding:"0 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 14px", borderBottom:`1px solid ${C.border}` }}>
            <NavBtn onClick={()=>setMonthOff(m=>m-1)}>‹</NavBtn>
            <div style={{ fontFamily:T.display, fontSize:22, color:C.white, letterSpacing:2 }}>{ms.label.toUpperCase()}</div>
            <NavBtn onClick={()=>setMonthOff(m=>Math.min(0,m+1))} disabled={monthOff>=0}>›</NavBtn>
          </div>

          <div style={{ display:"flex", gap:8, padding:"14px 0 6px" }}>
            <StatBox label="Days" value={ms.active} sub={`/ ${ms.dates.length}`} color={C.aqua} />
            <StatBox label="Streak" value={streak+"d"} sub="current" color={C.orange} />
            <StatBox label="Best" value={bestStreak+"d"} sub="all-time" color="#A78BFA" />
          </div>

          {/* Calendar */}
          <Card>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ fontFamily:T.display, fontSize:16, color:C.white, letterSpacing:2, marginBottom:12 }}>CALENDAR</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{ fontFamily:T.body, fontSize:9, fontWeight:700, color:C.dim, textAlign:"center", paddingBottom:4 }}>{d}</div>)}
                {Array.from({length:(new Date(ms.dates[0]+"T00:00:00").getDay()+6)%7}).map((_,i)=><div key={"e"+i} />)}
                {ms.dates.map(date=>{
                  const s=sessions[date];
                  const pcts=s?drills.map(d=>pct(s[d.key]?.makes,s[d.key]?.attempts)).filter(p=>p!==null):[];
                  const avg=pcts.length?Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length):null;
                  const day=parseInt(date.split("-")[2]);
                  return (
                    <div key={date} onClick={()=>{setSelDate(date);setView("log");}} style={{ aspectRatio:"1", borderRadius:6, cursor:s?"pointer":"default", background:avg!==null?pctCol(avg)+"30":C.card, border:`1px solid ${avg!==null?pctCol(avg)+"60":C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.body, fontSize:10, fontWeight:avg!==null?700:400, color:avg!==null?pctCol(avg):C.dim }}>
                      {day}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontFamily:T.body, fontSize:10, color:C.muted, marginTop:8 }}>Tap a day to view that session</div>
            </div>
          </Card>

          {/* Monthly drill averages */}
          <div style={{ marginTop:4 }}>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:10 }}>MONTHLY AVERAGES</div>
            {drills.map(drill=>{
              const {makes,attempts}=ms.totals[drill.key]||{makes:0,attempts:0};
              const p=pct(makes,attempts);
              return (
                <Card key={drill.key}>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div><span style={{ fontFamily:T.display, fontSize:16, color:C.white, letterSpacing:1 }}>{drill.label}</span> <Tag color={C.aqua}>{drill.distance}</Tag></div>
                      <PctBadge p={p} />
                    </div>
                    <BarTrack value={p} color={pctCol(p)} />
                    {attempts>0 && <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, marginTop:5 }}>{makes} makes / {attempts} attempts</div>}
                    <GoalBar p={p} goal={goals[drill.key]} />
                  </div>
                </Card>
              );
            })}
          </div>

          {Object.keys(ms.putterMap).length>0 && (
            <Card accent={C.aqua+"30"}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontFamily:T.display, fontSize:16, color:C.aqua, letterSpacing:2, marginBottom:10 }}>PUTTERS THIS MONTH</div>
                {Object.entries(ms.putterMap).sort(([,a],[,b])=>b-a).map(([p,n])=>(
                  <div key={p} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:T.body, fontSize:13, color:C.white }}>{p}</span>
                    <span style={{ fontFamily:T.body, fontSize:12, color:C.muted }}>{n} session{n>1?"s":""}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          STATS
      ════════════════════════════════════════ */}
      {view === "stats" && (
        <div style={{ padding:"0 16px" }}>
          <div style={{ padding:"14px 0 10px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:10 }}>ALL-TIME</div>
            <div style={{ display:"flex", gap:8 }}>
              <StatBox label="Sessions" value={Object.keys(sessions).length} color={C.aqua} />
              <StatBox label="Streak" value={streak+"d"} color={C.orange} />
              <StatBox label="Best" value={bestStreak+"d"} color="#A78BFA" />
            </div>
          </div>

          {/* Trend chart */}
          {td.length > 1 && (
            <Card style={{ marginTop:14 }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontFamily:T.display, fontSize:16, color:C.white, letterSpacing:2, marginBottom:14 }}>WEEKLY TREND</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={td} margin={{top:5,right:5,bottom:5,left:-20}}>
                    <XAxis dataKey="week" tick={{fontSize:9,fill:C.muted}} />
                    <YAxis domain={[0,100]} tick={{fontSize:9,fill:C.muted}} />
                    <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11,color:C.white}} formatter={v=>v!==null?v+"%":"—"} />
                    {drills.map((d,i)=><Line key={d.key} type="monotone" dataKey={d.key} name={d.label+" "+d.distance} stroke={DRILL_COLORS[i%DRILL_COLORS.length]} strokeWidth={2} dot={false} connectNulls />)}
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
                  {drills.map((d,i)=>(
                    <div key={d.key} style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:DRILL_COLORS[i%DRILL_COLORS.length] }} />
                      <span style={{ fontFamily:T.body, fontSize:9, color:C.muted }}>{d.label} {d.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* PRs */}
          <Card accent={C.orange+"40"} style={{ marginTop:10 }}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ fontFamily:T.display, fontSize:16, color:C.orange, letterSpacing:2, marginBottom:12 }}>★ ALL-TIME PRs</div>
              {drills.map(d=>(
                <div key={d.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div><span style={{ fontFamily:T.body, fontSize:13, color:C.white }}>{d.label}</span> <Tag color={C.aqua}>{d.distance}</Tag></div>
                  <span style={{ fontFamily:T.display, fontSize:22, color:prs[d.key]>0?C.orange:C.dim }}>{prs[d.key]>0?prs[d.key]+"%":"—"}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Putter comparison */}
          {putterNames.length>0 && (
            <Card accent={C.aqua+"30"} style={{ marginTop:10 }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontFamily:T.display, fontSize:16, color:C.aqua, letterSpacing:2, marginBottom:12 }}>PUTTER COMPARISON</div>
                {drills.map(drill=>{
                  const rows=putterNames.map(p=>({name:p,p:pct(pc[p][drill.key]?.makes,pc[p][drill.key]?.attempts)})).filter(x=>x.p!==null).sort((a,b)=>b.p-a.p);
                  if (!rows.length) return null;
                  return (
                    <div key={drill.key} style={{ marginBottom:14 }}>
                      <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:1, marginBottom:6 }}>{drill.label} {drill.distance}</div>
                      {rows.map((r,i)=>(
                        <div key={r.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ fontFamily:T.body, fontSize:11, color:i===0?C.aqua:C.muted, minWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
                          <div style={{ flex:1, height:6, background:C.dim, borderRadius:3 }}>
                            <div style={{ height:"100%", width:r.p+"%", background:i===0?C.aqua:C.border, borderRadius:3 }} />
                          </div>
                          <span style={{ fontFamily:T.display, fontSize:16, color:i===0?C.aqua:C.muted, minWidth:36 }}>{r.p}%</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Goals */}
          {Object.keys(goals).some(k=>goals[k]) && (
            <Card accent={C.green+"30"} style={{ marginTop:10 }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontFamily:T.display, fontSize:16, color:C.green, letterSpacing:2, marginBottom:12 }}>GOALS</div>
                {drills.filter(d=>goals[d.key]).map(drill=>{
                  const best=Object.values(sessions).map(s=>pct(s[drill.key]?.makes,s[drill.key]?.attempts)).filter(p=>p!==null).reduce((a,b)=>Math.max(a,b),0)||null;
                  return (
                    <div key={drill.key} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontFamily:T.body, fontSize:13, color:C.white }}>{drill.label} {drill.distance}</span>
                        <span style={{ fontFamily:T.body, fontSize:12, color:best&&best>=goals[drill.key]?C.green:C.muted }}>{best?best+"%":"—"} / {goals[drill.key]}%</span>
                      </div>
                      <GoalBar p={best} goal={goals[drill.key]} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}