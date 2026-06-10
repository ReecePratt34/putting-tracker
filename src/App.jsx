import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_DRILLS = [
  { key: "Warm-Up", label: "Warm-Up", distance: "10ft", instruction: "10 putts from 10 feet. No scorekeeping — just groove a smooth release and follow-through. Focus on form, not results.", custom: false },
  { key: "Confidence Range", label: "Confidence Range", distance: "15–20ft", instruction: "20 putts from 15–20 feet. Track your makes. Aim for 15+/20. This is your money zone — build a repeatable stance and release here.", custom: false },
  { key: "Pressure Block", label: "Pressure Block", distance: "25–30ft", instruction: "10 putts from 25–30 feet. If you miss, restart the set (max 3 restarts). Simulates tournament pressure — trains composure under stress.", custom: false },
  { key: "Circle 2 - 35ft", label: "Circle 2", distance: "35ft", instruction: "5 putts from 35 feet. Goal: make at least 2/5. Builds distance feel — don't expect perfection, just stay aggressive.", custom: false },
  { key: "Circle 2 - 40ft", label: "Circle 2", distance: "40ft", instruction: "5 putts from 40 feet. Goal: make at least 2/5. Keep the same release as closer distances.", custom: false },
  { key: "Circle 2 - 45ft", label: "Circle 2", distance: "45ft", instruction: "5 putts from 45 feet. Goal: make at least 2/5. This is max range — focus on confident follow-through.", custom: false },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_FINISHER_ATTEMPTS = 6;
const CONDITIONS = ["Sunny", "Cloudy", "Windy", "Rainy", "Indoor", "Hot", "Cold"];
const SURFACES = ["Concrete", "Grass", "Carpet", "Turf", "Dirt"];
const DRILL_COLORS = ["#c8f56a", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa", "#34d399"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTodayKey = () => new Date().toISOString().split("T")[0];

function getWeekKey(date) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split("T")[0];
}

function getWeekDates(weekKey) {
  const dates = [];
  const start = new Date(weekKey + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getMonthDates(year, month) {
  const dates = [];
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    dates.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return dates;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

function calcPct(makes, attempts) {
  const m = parseFloat(makes), a = parseFloat(attempts);
  if (!a || isNaN(m) || isNaN(a)) return null;
  return Math.round((m / a) * 100);
}

function pctColor(pct) {
  if (pct === null) return "#555";
  if (pct >= 75) return "#4ade80";
  if (pct >= 50) return "#facc15";
  return "#f87171";
}

function emptySession(drills) {
  return {
    ...drills.reduce((acc, d) => { acc[d.key] = { attempts: "", makes: "" }; return acc; }, {}),
    finisherRounds: [{ makes: "" }],
    putter: "", notes: "", conditions: [], surface: "",
  };
}

function getCurrentStreak(sessions) {
  let streak = 0;
  const today = getTodayKey();
  let cur = new Date(today + "T00:00:00");
  while (true) {
    const key = cur.toISOString().split("T")[0];
    if (sessions[key]) streak++;
    else if (key !== today) break;
    cur.setDate(cur.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

function getLongestStreak(sessions) {
  const dates = Object.keys(sessions).sort();
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "T00:00:00");
    const curr = new Date(dates[i] + "T00:00:00");
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else cur = 1;
  }
  return best;
}

function getAllTimePRs(sessions, drills) {
  const prs = {};
  drills.forEach(d => { prs[d.key] = 0; });
  Object.values(sessions).forEach(s => {
    drills.forEach(d => {
      const p = calcPct(s[d.key]?.makes, s[d.key]?.attempts);
      if (p !== null && p > (prs[d.key] || 0)) prs[d.key] = p;
    });
  });
  return prs;
}

function exportCSV(sessions, drills) {
  const drillKeys = drills.map(d => d.key);
  const headers = [
    "Date", "Putter", "Conditions", "Surface",
    ...drillKeys.flatMap(k => [`${k} Makes`, `${k} Attempts`, `${k} %`]),
    "Finisher Attempts", "Finisher Completed On", "Notes"
  ];
  const rows = Object.entries(sessions).sort(([a], [b]) => a.localeCompare(b)).map(([date, s]) => {
    const finisherDone = (s.finisherRounds || []).findIndex(r => parseInt(r.makes) === 5);
    return [
      date,
      s.putter || "",
      (s.conditions || []).join("; "),
      s.surface || "",
      ...drillKeys.flatMap(k => {
        const p = calcPct(s[k]?.makes, s[k]?.attempts);
        return [s[k]?.makes || "", s[k]?.attempts || "", p !== null ? p + "%" : ""];
      }),
      (s.finisherRounds || []).length,
      finisherDone >= 0 ? finisherDone + 1 : "",
      (s.notes || "").replace(/,/g, ";"),
    ];
  });
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `putt-log-export-${getTodayKey()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DrillCard({ drill, formData, onUpdate, isExpanded, onToggle, pr, showPR }) {
  const pct = calcPct(formData?.makes, formData?.attempts);
  const isPR = showPR && pct !== null && pct > 0 && pct >= pr && pr > 0;
  return (
    <div style={{ background: "#16161f", borderRadius: 10, marginBottom: 8, border: `1px solid ${isPR ? "#c8f56a66" : "#1e1e2a"}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#ccc", fontWeight: 700 }}>{drill.label}</span>
            <span style={{ fontSize: 10, color: "#c8f56a", background: "#c8f56a18", padding: "2px 6px", borderRadius: 10 }}>{drill.distance}</span>
            {isPR && <span style={{ fontSize: 9, color: "#facc15", background: "#facc1522", padding: "2px 6px", borderRadius: 10, letterSpacing: 1 }}>★ PR</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {pct !== null && <span style={{ fontSize: 13, fontWeight: 700, color: pctColor(pct), background: pctColor(pct) + "22", padding: "2px 8px", borderRadius: 20 }}>{pct}%</span>}
            <button onClick={onToggle} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, padding: 0 }}>{isExpanded ? "▲" : "▼"}</button>
          </div>
        </div>
        {isExpanded && (
          <div style={{ background: "#0f0f13", borderRadius: 6, padding: "8px 10px", marginBottom: 10, fontSize: 11, color: "#888", lineHeight: 1.6, borderLeft: "2px solid #c8f56a55" }}>
            {drill.instruction}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <label style={inputLabel}>
            <span style={labelText}>Makes</span>
            <input type="number" min="0" value={formData?.makes || ""} onChange={e => onUpdate("makes", e.target.value)} style={inputStyle} placeholder="0" />
          </label>
          <label style={inputLabel}>
            <span style={labelText}>Attempts</span>
            <input type="number" min="0" value={formData?.attempts || ""} onChange={e => onUpdate("attempts", e.target.value)} style={inputStyle} placeholder="0" />
          </label>
        </div>
        {pr > 0 && <div style={{ fontSize: 10, color: "#444", marginTop: 6 }}>All-time best: {pr}%</div>}
      </div>
    </div>
  );
}

function GoalBadge({ pct, goal }) {
  if (!goal || pct === null) return null;
  const progress = Math.min(100, Math.round((pct / goal) * 100));
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 9, color: "#555" }}>GOAL: {goal}%</span>
        <span style={{ fontSize: 9, color: pct >= goal ? "#4ade80" : "#888" }}>{progress}%</span>
      </div>
      <div style={{ height: 3, background: "#1e1e2a", borderRadius: 2 }}>
        <div style={{ height: "100%", width: progress + "%", background: pct >= goal ? "#4ade80" : "#c8f56a", borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PuttingTracker() {
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("putting_sessions_v3") || "{}"); }
    catch { return {}; }
  });
  const [drills, setDrills] = useState(() => {
    try { return JSON.parse(localStorage.getItem("putting_drills_v3") || "null") || DEFAULT_DRILLS; }
    catch { return DEFAULT_DRILLS; }
  });
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("putting_goals_v3") || "{}"); }
    catch { return {}; }
  });
  const [view, setView] = useState("log");
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [form, setForm] = useState(() => emptySession(DEFAULT_DRILLS));
  const [saved, setSaved] = useState(false);
  const [expandedDrill, setExpandedDrill] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(() => getWeekKey(getTodayKey()));
  const [monthOffset, setMonthOffset] = useState(0);
  const [showAddDrill, setShowAddDrill] = useState(false);
  const [newDrill, setNewDrill] = useState({ label: "", distance: "", instruction: "" });
  const [showGoals, setShowGoals] = useState(false);
  const [exportFlash, setExportFlash] = useState(false);

  const prs = getAllTimePRs(sessions, drills);
  const currentStreak = getCurrentStreak(sessions);
  const longestStreak = getLongestStreak(sessions);

  useEffect(() => {
    const s = sessions[selectedDate];
    setForm(s ? { ...emptySession(drills), ...s } : emptySession(drills));
    setSaved(false);
  }, [selectedDate]);

  useEffect(() => {
    try { localStorage.setItem("putting_sessions_v3", JSON.stringify(sessions)); } catch {}
  }, [sessions]);

  useEffect(() => {
    try { localStorage.setItem("putting_drills_v3", JSON.stringify(drills)); } catch {}
  }, [drills]);

  useEffect(() => {
    try { localStorage.setItem("putting_goals_v3", JSON.stringify(goals)); } catch {}
  }, [goals]);

  function updateDrill(key, field, value) {
    setForm(f => ({ ...f, [key]: { ...f[key], [field]: value } }));
    setSaved(false);
  }

  function updateFinisherRound(idx, value) {
    setForm(f => {
      const rounds = [...(f.finisherRounds || [])];
      rounds[idx] = { makes: value };
      return { ...f, finisherRounds: rounds };
    });
    setSaved(false);
  }

  function addFinisherRound() {
    setForm(f => {
      const rounds = [...(f.finisherRounds || [])];
      if (rounds.length < MAX_FINISHER_ATTEMPTS) rounds.push({ makes: "" });
      return { ...f, finisherRounds: rounds };
    });
  }

  function removeFinisherRound(idx) {
    setForm(f => {
      const rounds = f.finisherRounds.filter((_, i) => i !== idx);
      return { ...f, finisherRounds: rounds.length ? rounds : [{ makes: "" }] };
    });
    setSaved(false);
  }

  function toggleCondition(c) {
    setForm(f => {
      const cur = f.conditions || [];
      return { ...f, conditions: cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c] };
    });
    setSaved(false);
  }

  function saveSession() {
    setSessions(s => ({ ...s, [selectedDate]: form }));
    setSaved(true);
  }

  function addCustomDrill() {
    if (!newDrill.label) return;
    const key = "custom_" + Date.now();
    setDrills(d => [...d, { ...newDrill, key, custom: true }]);
    setNewDrill({ label: "", distance: "", instruction: "" });
    setShowAddDrill(false);
  }

  function removeCustomDrill(key) {
    setDrills(d => d.filter(dr => dr.key !== key));
  }

  function handleExport() {
    exportCSV(sessions, drills);
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 2000);
  }

  function shiftDate(delta) {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  // ── Week stats ──
  function getWeekStats(weekKey) {
    const dates = getWeekDates(weekKey);
    const drillTotals = drills.reduce((a, d) => { a[d.key] = { makes: 0, attempts: 0 }; return a; }, {});
    let activeDays = 0;
    dates.forEach(date => {
      const s = sessions[date];
      if (!s) return;
      let hasData = false;
      drills.forEach(({ key }) => {
        const m = parseFloat(s[key]?.makes), a = parseFloat(s[key]?.attempts);
        if (!isNaN(m) && !isNaN(a) && a > 0) { drillTotals[key].makes += m; drillTotals[key].attempts += a; hasData = true; }
      });
      if (hasData) activeDays++;
    });
    return { drillTotals, activeDays, dates };
  }

  function getAvailableWeeks() {
    const weeks = new Set(Object.keys(sessions).map(d => getWeekKey(d)));
    weeks.add(getWeekKey(getTodayKey()));
    return [...weeks].sort().reverse();
  }

  // ── Month stats ──
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthYear = targetMonth.getFullYear();
  const monthIdx = targetMonth.getMonth();
  const monthDates = getMonthDates(monthYear, monthIdx);
  const monthLabel = targetMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function getMonthStats() {
    const drillTotals = drills.reduce((a, d) => { a[d.key] = { makes: 0, attempts: 0 }; return a; }, {});
    let activeDays = 0;
    const putterMap = {};
    const weeklyData = {};
    monthDates.forEach(date => {
      const s = sessions[date];
      if (!s) return;
      let hasData = false;
      drills.forEach(({ key }) => {
        const m = parseFloat(s[key]?.makes), a = parseFloat(s[key]?.attempts);
        if (!isNaN(m) && !isNaN(a) && a > 0) { drillTotals[key].makes += m; drillTotals[key].attempts += a; hasData = true; }
      });
      if (hasData) {
        activeDays++;
        if (s.putter) putterMap[s.putter] = (putterMap[s.putter] || 0) + 1;
        const wk = getWeekKey(date);
        if (!weeklyData[wk]) weeklyData[wk] = { ...drills.reduce((a, d) => { a[d.key] = { makes: 0, attempts: 0 }; return a; }, {}) };
        drills.forEach(({ key }) => {
          const m = parseFloat(s[key]?.makes), a = parseFloat(s[key]?.attempts);
          if (!isNaN(m) && !isNaN(a) && a > 0) { weeklyData[wk][key].makes += m; weeklyData[wk][key].attempts += a; }
        });
      }
    });
    return { drillTotals, activeDays, putterMap, weeklyData };
  }

  // ── Trend data for chart (last 8 weeks) ──
  function getTrendData() {
    const weeks = getAvailableWeeks().slice(0, 8).reverse();
    return weeks.map(wk => {
      const stats = getWeekStats(wk);
      const start = new Date(wk + "T00:00:00");
      const label = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const row = { week: label };
      drills.forEach(d => {
        const p = calcPct(stats.drillTotals[d.key].makes, stats.drillTotals[d.key].attempts);
        row[d.key] = p;
      });
      return row;
    });
  }

  // ── Putter comparison ──
  function getPutterComparison() {
    const putterDrills = {};
    Object.values(sessions).forEach(s => {
      if (!s.putter) return;
      if (!putterDrills[s.putter]) putterDrills[s.putter] = drills.reduce((a, d) => { a[d.key] = { makes: 0, attempts: 0 }; return a; }, {});
      drills.forEach(({ key }) => {
        const m = parseFloat(s[key]?.makes), a = parseFloat(s[key]?.attempts);
        if (!isNaN(m) && !isNaN(a) && a > 0) { putterDrills[s.putter][key].makes += m; putterDrills[s.putter][key].attempts += a; }
      });
    });
    return putterDrills;
  }

  const weekStats = getWeekStats(selectedWeek);
  const weekDates = weekStats.dates;
  const monthStats = getMonthStats();
  const trendData = getTrendData();
  const putterComparison = getPutterComparison();
  const putterNames = Object.keys(putterComparison);

  const tabs = [["log", "📋 Log"], ["week", "📅 Week"], ["month", "🗓 Month"], ["stats", "📈 Stats"]];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", color: "#e8e4dc", fontFamily: "'DM Mono','Courier New',monospace", maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#1a1a24 0%,#12121a 100%)", borderBottom: "1px solid #2a2a3a", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🥏</span>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#c8f56a", textTransform: "uppercase" }}>Putt Log</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {currentStreak > 0 && (
              <div style={{ background: "#c8f56a22", border: "1px solid #c8f56a44", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#c8f56a" }}>
                🔥 {currentStreak}d
              </div>
            )}
            <button onClick={handleExport} style={{
              background: exportFlash ? "#4ade8022" : "#16161f", border: `1px solid ${exportFlash ? "#4ade80" : "#2a2a3a"}`,
              color: exportFlash ? "#4ade80" : "#888", borderRadius: 6, padding: "4px 10px",
              fontSize: 10, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
            }}>{exportFlash ? "✓ EXPORTED" : "⬇ CSV"}</button>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={{
              flex: 1, padding: "9px 0",
              background: view === key ? "#c8f56a" : "transparent",
              color: view === key ? "#0f0f13" : "#666",
              border: "none", borderBottom: view === key ? "none" : "1px solid #2a2a3a",
              cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 700,
              borderRadius: view === key ? "6px 6px 0 0" : 0,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DAILY LOG
      ══════════════════════════════════════════ */}
      {view === "log" && (
        <div style={{ padding: "0 16px" }}>
          {/* Date nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 12px", borderBottom: "1px solid #1e1e2a" }}>
            <button onClick={() => shiftDate(-1)} style={navBtn}>‹</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e4dc", letterSpacing: 1 }}>{formatDate(selectedDate)}</div>
              {selectedDate === getTodayKey() && <div style={{ fontSize: 10, color: "#c8f56a", letterSpacing: 2, marginTop: 2 }}>TODAY</div>}
            </div>
            <button onClick={() => shiftDate(1)} style={navBtn} disabled={selectedDate >= getTodayKey()}>›</button>
          </div>

          <div style={{ marginTop: 12 }}>
            {/* Standard + custom drills */}
            {drills.map(drill => (
              <div key={drill.key}>
                <DrillCard
                  drill={drill}
                  formData={form[drill.key]}
                  onUpdate={(field, val) => updateDrill(drill.key, field, val)}
                  isExpanded={expandedDrill === drill.key}
                  onToggle={() => setExpandedDrill(expandedDrill === drill.key ? null : drill.key)}
                  pr={prs[drill.key] || 0}
                  showPR={true}
                />
                {showGoals && (
                  <div style={{ background: "#16161f", borderRadius: 8, padding: "8px 14px", marginTop: -6, marginBottom: 8, border: "1px solid #1e1e2a" }}>
                    <GoalBadge pct={calcPct(form[drill.key]?.makes, form[drill.key]?.attempts)} goal={goals[drill.key]} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <span style={labelText}>Goal %</span>
                      <input type="number" min="0" max="100"
                        value={goals[drill.key] || ""}
                        onChange={e => setGoals(g => ({ ...g, [drill.key]: parseInt(e.target.value) || "" }))}
                        style={{ ...inputStyle, width: 70, fontSize: 12 }} placeholder="e.g. 80" />
                    </div>
                  </div>
                )}
                {drill.custom && (
                  <button onClick={() => removeCustomDrill(drill.key)} style={{ fontSize: 10, color: "#f87171", background: "none", border: "none", cursor: "pointer", marginTop: -6, marginBottom: 6, padding: 0, fontFamily: "inherit" }}>
                    ✕ Remove drill
                  </button>
                )}
              </div>
            ))}

            {/* 5-in-a-Row */}
            {(() => {
              const rounds = form.finisherRounds || [{ makes: "" }];
              const completed = rounds.findIndex(r => parseInt(r.makes) === 5);
              const isOpen = expandedDrill === "finisher";
              return (
                <div style={{ background: "#16161f", borderRadius: 10, marginBottom: 8, border: "1px solid #c8f56a44" }}>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "#c8f56a", fontWeight: 700 }}>5-in-a-Row Finisher</span>
                        <span style={{ fontSize: 10, color: "#888", background: "#1e1e2a", padding: "2px 6px", borderRadius: 10 }}>20ft</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {completed >= 0 && <span style={{ fontSize: 11, color: "#4ade80", background: "#4ade8022", padding: "2px 8px", borderRadius: 20 }}>✓ Attempt {completed + 1}</span>}
                        <button onClick={() => setExpandedDrill(isOpen ? null : "finisher")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, padding: 0 }}>{isOpen ? "▲" : "▼"}</button>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ background: "#0f0f13", borderRadius: 6, padding: "8px 10px", marginBottom: 10, fontSize: 11, color: "#888", lineHeight: 1.6, borderLeft: "2px solid #c8f56a55" }}>
                        Stand at 20 feet. Make 5 consecutive putts to finish. Log how many you made each attempt. Can't leave until you get 5 in a row — up to 6 attempts.
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {rounds.map((r, idx) => {
                        const isDone = parseInt(r.makes) === 5;
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, color: "#555", minWidth: 60 }}>ATTEMPT {idx + 1}</span>
                            <input type="number" min="0" max="5" value={r.makes}
                              onChange={e => updateFinisherRound(idx, e.target.value)}
                              style={{ ...inputStyle, flex: 1, borderColor: isDone ? "#4ade8055" : "#2a2a3a", color: isDone ? "#4ade80" : "#e8e4dc" }}
                              placeholder="0–5" />
                            <span style={{ fontSize: 11, color: isDone ? "#4ade80" : "#444", minWidth: 14 }}>{isDone ? "✓" : "/5"}</span>
                            {rounds.length > 1 && <button onClick={() => removeFinisherRound(idx)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: "0 2px" }}>×</button>}
                          </div>
                        );
                      })}
                      {rounds.length < MAX_FINISHER_ATTEMPTS && completed < 0 && (
                        <button onClick={addFinisherRound} style={{ background: "#1e1e2a", border: "1px dashed #2a2a3a", color: "#666", borderRadius: 6, padding: 8, cursor: "pointer", fontSize: 11, fontFamily: "inherit", letterSpacing: 1 }}>
                          + ADD ATTEMPT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Add custom drill */}
            {!showAddDrill ? (
              <button onClick={() => setShowAddDrill(true)} style={{ width: "100%", background: "#16161f", border: "1px dashed #2a2a3a", color: "#555", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontSize: 11, fontFamily: "inherit", letterSpacing: 1, marginBottom: 8 }}>
                + ADD CUSTOM DRILL
              </button>
            ) : (
              <div style={{ background: "#16161f", borderRadius: 10, padding: 14, marginBottom: 8, border: "1px solid #2a2a3a" }}>
                <div style={{ fontSize: 11, color: "#c8f56a", marginBottom: 10 }}>NEW DRILL</div>
                {[["label", "Drill Name"], ["distance", "Distance (e.g. 25ft)"], ["instruction", "Instructions"]].map(([field, ph]) => (
                  <input key={field} type="text" placeholder={ph} value={newDrill[field]}
                    onChange={e => setNewDrill(n => ({ ...n, [field]: e.target.value }))}
                    style={{ ...inputStyle, fontSize: 12, fontWeight: 400, marginBottom: 6 }} />
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={addCustomDrill} style={{ flex: 1, background: "#c8f56a", border: "none", color: "#0f0f13", borderRadius: 6, padding: 8, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 700 }}>ADD</button>
                  <button onClick={() => setShowAddDrill(false)} style={{ flex: 1, background: "#1e1e2a", border: "1px solid #2a2a3a", color: "#666", borderRadius: 6, padding: 8, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>CANCEL</button>
                </div>
              </div>
            )}

            {/* Goals toggle */}
            <button onClick={() => setShowGoals(g => !g)} style={{ width: "100%", background: showGoals ? "#1e2e10" : "#16161f", border: `1px solid ${showGoals ? "#4ade8055" : "#2a2a3a"}`, color: showGoals ? "#4ade80" : "#555", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontSize: 11, fontFamily: "inherit", letterSpacing: 1, marginBottom: 8 }}>
              {showGoals ? "✓ GOALS ON" : "🎯 SET GOALS"}
            </button>

            {/* Conditions */}
            <div style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #1e1e2a" }}>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginBottom: 8 }}>CONDITIONS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {CONDITIONS.map(c => (
                  <button key={c} onClick={() => toggleCondition(c)} style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                    background: (form.conditions || []).includes(c) ? "#c8f56a22" : "#0f0f13",
                    border: `1px solid ${(form.conditions || []).includes(c) ? "#c8f56a" : "#2a2a3a"}`,
                    color: (form.conditions || []).includes(c) ? "#c8f56a" : "#555",
                  }}>{c}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, marginBottom: 6 }}>SURFACE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SURFACES.map(s => (
                  <button key={s} onClick={() => { setForm(f => ({ ...f, surface: f.surface === s ? "" : s })); setSaved(false); }} style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                    background: form.surface === s ? "#60a5fa22" : "#0f0f13",
                    border: `1px solid ${form.surface === s ? "#60a5fa" : "#2a2a3a"}`,
                    color: form.surface === s ? "#60a5fa" : "#555",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Session details */}
            <div style={{ background: "#16161f", borderRadius: 10, padding: "14px", marginBottom: 8, border: "1px solid #1e1e2a" }}>
              <div style={{ fontSize: 11, color: "#c8f56a", letterSpacing: 1, marginBottom: 12 }}>🥏 SESSION DETAILS</div>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                <span style={labelText}>Putter Used</span>
                <input type="text" value={form.putter || ""}
                  onChange={e => { setForm(f => ({ ...f, putter: e.target.value })); setSaved(false); }}
                  placeholder="e.g. Innova Aviar, Discraft Luna..."
                  style={{ ...inputStyle, fontSize: 13, fontWeight: 400 }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={labelText}>Notes</span>
                <textarea value={form.notes || ""}
                  onChange={e => { setForm(f => ({ ...f, notes: e.target.value })); setSaved(false); }}
                  placeholder="How did it feel? Any adjustments..."
                  rows={3}
                  style={{ width: "100%", background: "#0f0f13", border: "1px solid #2a2a3a", borderRadius: 6, color: "#e8e4dc", fontFamily: "inherit", fontSize: 12, padding: "8px 10px", resize: "none", boxSizing: "border-box" }} />
              </label>
            </div>

            <button onClick={saveSession} style={{
              width: "100%", padding: "14px 0",
              background: saved ? "#1e2e10" : "#c8f56a",
              color: saved ? "#4ade80" : "#0f0f13",
              border: saved ? "1px solid #4ade80" : "none",
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              fontFamily: "inherit", letterSpacing: 2, cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s",
            }}>{saved ? "✓ Saved" : "Save Session"}</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          WEEKLY RECAP
      ══════════════════════════════════════════ */}
      {view === "week" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ padding: "14px 0 10px", borderBottom: "1px solid #1e1e2a" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8 }}>SELECT WEEK</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {getAvailableWeeks().map(wk => {
                const s = new Date(wk + "T00:00:00"), e = new Date(wk + "T00:00:00");
                e.setDate(e.getDate() + 6);
                return (
                  <button key={wk} onClick={() => setSelectedWeek(wk)} style={{
                    whiteSpace: "nowrap", padding: "5px 10px",
                    background: selectedWeek === wk ? "#c8f56a" : "#16161f",
                    color: selectedWeek === wk ? "#0f0f13" : "#888",
                    border: "1px solid " + (selectedWeek === wk ? "#c8f56a" : "#2a2a3a"),
                    borderRadius: 20, fontSize: 10, fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
                  }}>{s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {e.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</button>
                );
              })}
            </div>
          </div>

          {/* Days */}
          <div style={{ padding: "12px 0 6px" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8 }}>DAYS PRACTICED</div>
            <div style={{ display: "flex", gap: 5 }}>
              {weekDates.map((date, i) => {
                const s = sessions[date];
                return (
                  <div key={date} style={{ flex: 1, textAlign: "center", padding: "8px 2px", background: s ? "#c8f56a22" : "#16161f", border: "1px solid " + (s ? "#c8f56a55" : "#1e1e2a"), borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: s ? "#c8f56a" : "#444" }}>{DAYS[i]}</div>
                    <div style={{ fontSize: 14, marginTop: 2 }}>{s ? "✓" : "·"}</div>
                    {s?.putter && <div style={{ fontSize: 7, color: "#555", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 2px" }}>{s.putter.split(" ")[0]}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#888" }}>
              <span style={{ color: "#c8f56a", fontWeight: 700 }}>{weekStats.activeDays}</span> / 7 days
            </div>
          </div>

          {/* Putter summary */}
          {(() => {
            const putters = weekDates.map(d => sessions[d]?.putter).filter(Boolean);
            if (!putters.length) return null;
            const counts = putters.reduce((a, p) => { a[p] = (a[p] || 0) + 1; return a; }, {});
            return (
              <div style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #c8f56a22" }}>
                <div style={{ fontSize: 11, color: "#c8f56a", letterSpacing: 1, marginBottom: 8 }}>🥏 PUTTERS THIS WEEK</div>
                {Object.entries(counts).map(([p, n]) => (
                  <div key={p} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#ccc" }}>{p}</span>
                    <span style={{ fontSize: 11, color: "#888" }}>{n} session{n > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Drill averages */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8 }}>DRILL AVERAGES</div>
            {drills.map(drill => {
              const { makes, attempts } = weekStats.drillTotals[drill.key] || { makes: 0, attempts: 0 };
              const pct = calcPct(makes, attempts);
              const goal = goals[drill.key];
              return (
                <div key={drill.key} style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #1e1e2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{drill.label} <span style={{ color: "#555" }}>{drill.distance}</span></span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pctColor(pct) }}>{pct !== null ? `${pct}%` : "—"}</span>
                  </div>
                  <div style={{ height: 4, background: "#1e1e2a", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: (pct || 0) + "%", background: pctColor(pct), borderRadius: 2, transition: "width 0.4s" }} />
                  </div>
                  {attempts > 0 && <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>{makes} makes / {attempts} attempts</div>}
                  {goal && pct !== null && <GoalBadge pct={pct} goal={goal} />}
                </div>
              );
            })}

            {/* Finisher */}
            {(() => {
              const completions = weekDates.map(d => {
                const idx = (sessions[d]?.finisherRounds || []).findIndex(r => parseInt(r.makes) === 5);
                return idx >= 0 ? idx + 1 : null;
              }).filter(Boolean);
              if (!completions.length) return null;
              const avg = (completions.reduce((a, b) => a + b, 0) / completions.length).toFixed(1);
              return (
                <div style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #c8f56a33" }}>
                  <div style={{ fontSize: 11, color: "#c8f56a", marginBottom: 8 }}>5-in-a-Row Finisher ⭐</div>
                  <div style={{ display: "flex", gap: 20 }}>
                    {[["AVG ATTEMPTS", avg], ["BEST", Math.min(...completions)], ["COMPLETIONS", completions.length]].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 10, color: "#555" }}>{l}</div><div style={{ fontSize: 18, fontWeight: 700, color: l === "BEST" ? "#c8f56a" : "#e8e4dc" }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Daily breakdown */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8 }}>DAILY BREAKDOWN</div>
            {weekDates.map((date, i) => {
              const s = sessions[date];
              if (!s) return (
                <div key={date} style={{ background: "#16161f", borderRadius: 10, padding: "10px 14px", marginBottom: 6, border: "1px solid #1e1e2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#444" }}>{DAYS[i]} · {formatDate(date)}</span>
                  <span style={{ fontSize: 10, color: "#333" }}>No session</span>
                </div>
              );
              const pcts = drills.map(d => calcPct(s[d.key]?.makes, s[d.key]?.attempts)).filter(p => p !== null);
              const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
              const finDone = (s.finisherRounds || []).findIndex(r => parseInt(r.makes) === 5);
              return (
                <div key={date} style={{ background: "#16161f", borderRadius: 10, padding: "10px 14px", marginBottom: 6, border: "1px solid #1e1e2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#ccc" }}>{DAYS[i]} · {formatDate(date)}</span>
                    {avg !== null && <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(avg), background: pctColor(avg) + "22", padding: "2px 8px", borderRadius: 20 }}>{avg}% avg</span>}
                  </div>
                  {s.putter && <div style={{ fontSize: 11, color: "#c8f56a88", marginTop: 3 }}>🥏 {s.putter}</div>}
                  {s.conditions?.length > 0 && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{s.conditions.join(" · ")}{s.surface ? ` · ${s.surface}` : ""}</div>}
                  {finDone >= 0 && <div style={{ fontSize: 11, color: "#4ade8088", marginTop: 2 }}>⭐ Finisher on attempt {finDone + 1}</div>}
                  {s.notes && <div style={{ fontSize: 11, color: "#555", marginTop: 3, fontStyle: "italic" }}>"{s.notes}"</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MONTHLY RECAP
      ══════════════════════════════════════════ */}
      {view === "month" && (
        <div style={{ padding: "0 16px" }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 12px", borderBottom: "1px solid #1e1e2a" }}>
            <button onClick={() => setMonthOffset(m => m - 1)} style={navBtn}>‹</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e4dc", letterSpacing: 1 }}>{monthLabel}</div>
            </div>
            <button onClick={() => setMonthOffset(m => Math.min(0, m + 1))} style={navBtn} disabled={monthOffset >= 0}>›</button>
          </div>

          {/* Month summary cards */}
          <div style={{ display: "flex", gap: 8, padding: "14px 0 6px" }}>
            {[
              ["DAYS", monthStats.activeDays, `/ ${monthDates.length}`, "#c8f56a"],
              ["STREAK", currentStreak + "d", "current", "#facc15"],
              ["BEST", longestStreak + "d", "all-time", "#60a5fa"],
            ].map(([l, v, sub, col]) => (
              <div key={l} style={{ flex: 1, background: "#16161f", borderRadius: 10, padding: "10px 8px", border: `1px solid ${col}22`, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: col, marginTop: 2 }}>{v}</div>
                <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Calendar heatmap */}
          <div style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #1e1e2a" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 10 }}>CALENDAR</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} style={{ fontSize: 9, color: "#444", textAlign: "center", paddingBottom: 2 }}>{d}</div>
              ))}
              {/* offset */}
              {Array.from({ length: (new Date(monthDates[0] + "T00:00:00").getDay() + 6) % 7 }).map((_, i) => <div key={"e" + i} />)}
              {monthDates.map(date => {
                const s = sessions[date];
                const pcts = s ? drills.map(d => calcPct(s[d.key]?.makes, s[d.key]?.attempts)).filter(p => p !== null) : [];
                const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
                const day = parseInt(date.split("-")[2]);
                return (
                  <div key={date} onClick={() => { setSelectedDate(date); setView("log"); }} style={{
                    aspectRatio: "1", borderRadius: 4, cursor: s ? "pointer" : "default",
                    background: avg !== null ? pctColor(avg) + "44" : "#0f0f13",
                    border: `1px solid ${avg !== null ? pctColor(avg) + "66" : "#1e1e2a"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: avg !== null ? pctColor(avg) : "#333",
                    fontWeight: avg !== null ? 700 : 400,
                  }}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 8 }}>Tap a day to view session</div>
          </div>

          {/* Monthly drill averages */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8 }}>MONTHLY DRILL AVERAGES</div>
            {drills.map(drill => {
              const { makes, attempts } = monthStats.drillTotals[drill.key] || { makes: 0, attempts: 0 };
              const pct = calcPct(makes, attempts);
              const goal = goals[drill.key];
              return (
                <div key={drill.key} style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #1e1e2a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{drill.label} <span style={{ color: "#555" }}>{drill.distance}</span></span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pctColor(pct) }}>{pct !== null ? `${pct}%` : "—"}</span>
                  </div>
                  <div style={{ height: 4, background: "#1e1e2a", borderRadius: 2, marginBottom: 4 }}>
                    <div style={{ height: "100%", width: (pct || 0) + "%", background: pctColor(pct), borderRadius: 2 }} />
                  </div>
                  {attempts > 0 && <div style={{ fontSize: 10, color: "#444" }}>{makes} makes / {attempts} attempts</div>}
                  {goal && pct !== null && <GoalBadge pct={pct} goal={goal} />}
                </div>
              );
            })}
          </div>

          {/* Putter breakdown */}
          {Object.keys(monthStats.putterMap).length > 0 && (
            <div style={{ background: "#16161f", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #c8f56a22" }}>
              <div style={{ fontSize: 11, color: "#c8f56a", letterSpacing: 1, marginBottom: 8 }}>🥏 PUTTERS THIS MONTH</div>
              {Object.entries(monthStats.putterMap).sort(([, a], [, b]) => b - a).map(([p, n]) => (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{p}</span>
                  <span style={{ fontSize: 11, color: "#888" }}>{n} session{n > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          STATS / TRENDS
      ══════════════════════════════════════════ */}
      {view === "stats" && (
        <div style={{ padding: "0 16px" }}>
          {/* All-time summary */}
          <div style={{ padding: "14px 0 10px", borderBottom: "1px solid #1e1e2a" }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 10 }}>ALL-TIME</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["SESSIONS", Object.keys(sessions).length, "#c8f56a"],
                ["CUR STREAK", currentStreak + "d", "#facc15"],
                ["BEST STREAK", longestStreak + "d", "#60a5fa"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ flex: 1, background: "#16161f", borderRadius: 10, padding: "10px 8px", border: `1px solid ${c}22`, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>{l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend chart */}
          {trendData.length > 1 && (
            <div style={{ background: "#16161f", borderRadius: 10, padding: "14px", marginTop: 14, marginBottom: 8, border: "1px solid #1e1e2a" }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12 }}>WEEKLY TREND (last 8 weeks)</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#555" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#555" }} />
                  <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid #2a2a3a", borderRadius: 6, fontSize: 11, color: "#e8e4dc" }} formatter={(v) => v !== null ? v + "%" : "—"} />
                  {drills.map((d, i) => (
                    <Line key={d.key} type="monotone" dataKey={d.key} name={d.label + " " + d.distance} stroke={DRILL_COLORS[i % DRILL_COLORS.length]} strokeWidth={2} dot={false} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {drills.map((d, i) => (
                  <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: DRILL_COLORS[i % DRILL_COLORS.length] }} />
                    <span style={{ fontSize: 9, color: "#666" }}>{d.label} {d.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-time PRs */}
          <div style={{ background: "#16161f", borderRadius: 10, padding: "14px", marginBottom: 8, border: "1px solid #facc1533" }}>
            <div style={{ fontSize: 11, color: "#facc15", letterSpacing: 2, marginBottom: 10 }}>★ ALL-TIME PRs</div>
            {drills.map(d => (
              <div key={d.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>{d.label} <span style={{ color: "#555" }}>{d.distance}</span></span>
                <span style={{ fontSize: 14, fontWeight: 700, color: prs[d.key] > 0 ? "#facc15" : "#333" }}>
                  {prs[d.key] > 0 ? prs[d.key] + "%" : "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Putter comparison */}
          {putterNames.length > 0 && (
            <div style={{ background: "#16161f", borderRadius: 10, padding: "14px", marginBottom: 8, border: "1px solid #60a5fa33" }}>
              <div style={{ fontSize: 11, color: "#60a5fa", letterSpacing: 2, marginBottom: 10 }}>🥏 PUTTER COMPARISON</div>
              {drills.map(drill => {
                const putterPcts = putterNames.map(p => ({
                  name: p,
                  pct: calcPct(putterComparison[p][drill.key]?.makes, putterComparison[p][drill.key]?.attempts),
                })).filter(x => x.pct !== null).sort((a, b) => b.pct - a.pct);
                if (!putterPcts.length) return null;
                return (
                  <div key={drill.key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#666", letterSpacing: 1, marginBottom: 6 }}>{drill.label} {drill.distance}</div>
                    {putterPcts.map((p, i) => (
                      <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: i === 0 ? "#60a5fa" : "#555", minWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <div style={{ flex: 1, height: 6, background: "#1e1e2a", borderRadius: 3 }}>
                          <div style={{ height: "100%", width: p.pct + "%", background: i === 0 ? "#60a5fa" : "#2a2a3a", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#60a5fa" : "#555", minWidth: 32 }}>{p.pct}%</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Goals overview */}
          {Object.keys(goals).some(k => goals[k]) && (
            <div style={{ background: "#16161f", borderRadius: 10, padding: "14px", marginBottom: 8, border: "1px solid #4ade8033" }}>
              <div style={{ fontSize: 11, color: "#4ade80", letterSpacing: 2, marginBottom: 10 }}>🎯 GOALS PROGRESS</div>
              {drills.filter(d => goals[d.key]).map(drill => {
                const allPcts = Object.values(sessions).map(s => calcPct(s[drill.key]?.makes, s[drill.key]?.attempts)).filter(p => p !== null);
                const best = allPcts.length ? Math.max(...allPcts) : null;
                return (
                  <div key={drill.key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{drill.label} {drill.distance}</span>
                      <span style={{ fontSize: 11, color: best !== null && best >= goals[drill.key] ? "#4ade80" : "#888" }}>
                        {best !== null ? best + "%" : "—"} / {goals[drill.key]}%
                      </span>
                    </div>
                    <GoalBadge pct={best} goal={goals[drill.key]} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const navBtn = { background: "#16161f", border: "1px solid #2a2a3a", color: "#888", borderRadius: 8, width: 36, height: 36, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const inputLabel = { flex: 1, display: "flex", flexDirection: "column", gap: 4 };
const labelText = { fontSize: 10, color: "#555", letterSpacing: 1, textTransform: "uppercase" };
const inputStyle = { background: "#0f0f13", border: "1px solid #2a2a3a", borderRadius: 6, color: "#e8e4dc", fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: "8px 10px", width: "100%", boxSizing: "border-box" };