import { useState, useEffect } from "react";
import { C, T, Card, Input, SectionHeader, Tag, Pill, StatBox, NavBtn, today, fmtDate, weekKey, weekDates, monthDates } from "./shared.jsx";
import { DRILL_LIBRARY, PRACTICE_TYPES, PRACTICE_TYPE_LABELS, STRUCTURE, DIFFICULTY_COLORS, RPE_LABELS, EFFORT_LABELS, CONDITIONS, SURFACES, MISS_DIRECTIONS, THROW_TYPES, THROW_TYPE_LABELS } from "./drillLibrary.js";

const TYPE_COLORS = { putting: C.aqua, field: C.orange, net: C.purple };

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcPct(makes, attempts) {
  const m = parseFloat(makes), a = parseFloat(attempts);
  if (!a || isNaN(m) || isNaN(a)) return null;
  return Math.round((m / a) * 100);
}
function pctColor(p) {
  if (p === null) return C.muted;
  if (p >= 75) return C.green;
  if (p >= 50) return C.yellow;
  return C.red;
}
function emptyDrillLog(drill) {
  return { drillId: drill.id, sets: Array.from({ length: drill.sets || 1 }, () => emptySet(drill)), notes: "", disc: "", completed: false };
}
function emptySet(drill) {
  if (drill.metric === "makes_attempts") return { makes: "", attempts: "" };
  if (drill.metric === "distance_reps") return { distances: [] };
  if (drill.metric === "ctp") return { throws: [] };
  if (drill.metric === "gap") return { hits: 0, misses: 0, total: 0 };
  return { reps: "" };
}

// ── Two-level Session Builder ─────────────────────────────────────────────────
function SessionBuilder({ onStart, onBack, bagDiscs, templates, onSaveTemplate }) {
  const [step, setStep] = useState("type"); // type | section | drills
  const [practiceType, setPracticeType] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [sessionDrills, setSessionDrills] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [surface, setSurface] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const structure = practiceType ? STRUCTURE[practiceType] : null;

  // Get all sections including grouped ones
  function getSections() {
    if (!structure) return [];
    const sections = [];
    const groups = structure.groups || {};
    const groupedChildren = Object.values(groups).flatMap(g => g.children);

    // Add groups first
    Object.entries(groups).forEach(([gKey, group]) => {
      sections.push({ key: gKey, label: group.label, isGroup: true, children: group.children });
    });

    // Add ungrouped sections
    Object.entries(structure.sections).forEach(([key, sec]) => {
      if (!groupedChildren.includes(key)) {
        sections.push({ key, label: sec.label, icon: sec.icon, isGroup: false });
      }
    });

    return sections;
  }

  function getDrillsForSection(sectionKey) {
    if (!practiceType) return [];
    const structure = STRUCTURE[practiceType];
    const groups = structure?.groups || {};
    const group = groups[sectionKey];
    if (group) {
      return DRILL_LIBRARY.filter(d => d.type === practiceType && group.children.includes(d.section));
    }
    return DRILL_LIBRARY.filter(d => d.type === practiceType && d.section === sectionKey);
  }

  function toggleDrill(drill) {
    setSessionDrills(s =>
      s.find(d => d.drillId === drill.id)
        ? s.filter(d => d.drillId !== drill.id)
        : [...s, emptyDrillLog(drill)]
    );
  }

  function saveTemplate() {
    if (!templateName) return;
    onSaveTemplate({ id: Date.now(), name: templateName, type: practiceType, drills: sessionDrills });
    setTemplateName("");
    setSavingTemplate(false);
  }

  const col = practiceType ? TYPE_COLORS[practiceType] : C.aqua;

  // Step 1 — Pick type
  if (step === "type") return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, letterSpacing: 3 }}>BUILD SESSION</div>
        <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 2 }}>WHAT ARE YOU WORKING ON?</div>
      </div>
      <div style={{ padding: "16px 12px" }}>
        {templates.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowTemplates(t => !t)} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "10px 0", fontFamily: T.body, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 1 }}>
              {showTemplates ? "▲ HIDE TEMPLATES" : "⚡ LOAD SAVED TEMPLATE"}
            </button>
            {showTemplates && templates.map(t => (
              <div key={t.id} onClick={() => { setSessionDrills(t.drills.map(d => ({ ...d, sets: [], completed: false }))); setPracticeType(t.type); setStep("drills"); setActiveSection("all"); setShowTemplates(false); }} style={{ background: C.card, borderRadius: 8, padding: "10px 14px", marginTop: 6, cursor: "pointer", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.body, fontSize: 13, color: C.white }}>{t.name}</span>
                <span style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>{t.drills.length} drills</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PRACTICE_TYPES.map(t => (
            <button key={t} onClick={() => { setPracticeType(t); setStep("section"); }} style={{ padding: "18px 16px", background: TYPE_COLORS[t] + "15", border: `1px solid ${TYPE_COLORS[t]}40`, color: TYPE_COLORS[t], borderRadius: 12, fontFamily: T.display, fontSize: 22, letterSpacing: 3, cursor: "pointer", textAlign: "left" }}>
              {PRACTICE_TYPE_LABELS[t].toUpperCase()}
              <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                {t === "putting" ? "Basket work · circle 1 & 2 · pressure" : t === "field" ? "Distance · accuracy · shot shaping · forehand" : "Form · grip · release · hip drive"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2 — Pick section
  if (step === "section") return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={() => setStep("type")} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 28, color: col, letterSpacing: 3 }}>{PRACTICE_TYPE_LABELS[practiceType].toUpperCase()}</div>
        <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 2 }}>SELECT A FOCUS AREA</div>
      </div>
      <div style={{ padding: "14px 12px" }}>
        <div onClick={() => { setActiveSection("all"); setStep("drills"); }} style={{ background: col + "15", border: `1px solid ${col}40`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: T.display, fontSize: 18, color: col, letterSpacing: 2 }}>ALL DRILLS</div>
          <div style={{ fontFamily: T.display, fontSize: 24, color: col + "60" }}>›</div>
        </div>
        {getSections().map(sec => {
          const drillCount = getDrillsForSection(sec.key).length;
          return (
            <div key={sec.key} onClick={() => { setActiveSection(sec.key); setStep("drills"); }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: T.display, fontSize: 16, color: C.white, letterSpacing: 1 }}>{sec.label}</div>
                {sec.isGroup && <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 2 }}>Multiple drill types</div>}
                <div style={{ fontFamily: T.body, fontSize: 11, color: C.dim, marginTop: 2 }}>{drillCount} drills</div>
              </div>
              <div style={{ fontFamily: T.display, fontSize: 24, color: C.dim }}>›</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Step 3 — Pick drills
  const sectionDrills = activeSection === "all"
    ? DRILL_LIBRARY.filter(d => d.type === practiceType)
    : getDrillsForSection(activeSection);

  // Group by section within the drill list
  const drillsBySection = {};
  sectionDrills.forEach(d => {
    const secLabel = structure?.sections[d.section]?.label || d.section;
    if (!drillsBySection[secLabel]) drillsBySection[secLabel] = [];
    drillsBySection[secLabel].push(d);
  });

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 120 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={() => setStep("section")} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 24, color: col, letterSpacing: 2 }}>{activeSection === "all" ? "ALL DRILLS" : (structure?.sections[activeSection]?.label || structure?.groups?.[activeSection]?.label || "").toUpperCase()}</div>
            <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 1, marginTop: 2 }}>{sectionDrills.length} drills available</div>
          </div>
          {sessionDrills.length > 0 && (
            <div style={{ background: col + "20", border: `1px solid ${col}50`, borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ fontFamily: T.display, fontSize: 16, color: col }}>{sessionDrills.length}</span>
              <span style={{ fontFamily: T.body, fontSize: 11, color: col, marginLeft: 4 }}>selected</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "12px 12px" }}>
        {/* Conditions */}
        <Card style={{ marginBottom: 12 }}>
          <div style={{ padding: "10px 14px" }}>
            <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>CONDITIONS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {CONDITIONS.map(c => <Pill key={c} active={conditions.includes(c)} onClick={() => setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}>{c}</Pill>)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SURFACES.map(s => <Pill key={s} color={C.orange} active={surface === s} onClick={() => setSurface(p => p === s ? "" : s)}>{s}</Pill>)}
            </div>
          </div>
        </Card>

        {/* Drills grouped by section */}
        {Object.entries(drillsBySection).map(([secLabel, drills]) => (
          <div key={secLabel} style={{ marginBottom: 16 }}>
            {activeSection === "all" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontFamily: T.display, fontSize: 14, color: C.muted, letterSpacing: 2 }}>{secLabel.toUpperCase()}</div>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            )}
            {drills.map(drill => {
              const added = !!sessionDrills.find(d => d.drillId === drill.id);
              return (
                <Card key={drill.id} accent={added ? col + "60" : C.border} style={{ marginBottom: 8 }}>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ flex: 1, paddingRight: 8 }}>
                        <div style={{ fontFamily: T.display, fontSize: 16, color: C.white, letterSpacing: 1 }}>{drill.name}</div>
                        <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                          <Tag color={DIFFICULTY_COLORS[drill.difficulty]}>{drill.difficulty}</Tag>
                          {drill.throwType !== "both" && <Tag color={C.purple}>{drill.throwType === "backhand" ? "BH" : "FH"}</Tag>}
                          <Tag color={col}>{drill.metric === "ctp" ? "CTP" : drill.metric === "gap" ? "GAP" : drill.metric === "distance_reps" ? "DISTANCE" : drill.metric === "reps" ? "REPS" : "%"}</Tag>
                        </div>
                      </div>
                      <button onClick={() => toggleDrill(drill)} style={{ background: added ? col + "20" : col, border: `1px solid ${col}`, color: added ? col : C.navy, borderRadius: 8, padding: "6px 12px", fontFamily: T.body, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {added ? "✓ ADDED" : "+ ADD"}
                      </button>
                    </div>
                    <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{drill.description}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

        {/* Save template */}
        {savingTemplate && (
          <Card style={{ marginBottom: 10 }}>
            <div style={{ padding: "10px 14px" }}>
              <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name..." style={{ marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveTemplate} style={{ flex: 1, background: col, border: "none", color: C.navy, borderRadius: 8, padding: "8px 0", fontFamily: T.body, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>SAVE</button>
                <button onClick={() => setSavingTemplate(false)} style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 0", fontFamily: T.body, fontSize: 12, cursor: "pointer" }}>CANCEL</button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {sessionDrills.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 12px 16px", background: C.navy, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setSavingTemplate(true)} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "10px 14px", fontFamily: T.body, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>SAVE TEMPLATE</button>
            <button onClick={() => onStart({ drills: sessionDrills, type: practiceType, conditions, surface })} style={{ flex: 1, padding: "12px 0", background: col, color: C.navy, border: "none", borderRadius: 10, fontFamily: T.display, fontSize: 20, letterSpacing: 2, cursor: "pointer" }}>
              START ({sessionDrills.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Active Session ────────────────────────────────────────────────────────────
function ActiveSession({ sessionPlan, onFinish, onBack, bagDiscs }) {
  const [drillIdx, setDrillIdx] = useState(0);
  const [logs, setLogs] = useState(sessionPlan.drills.map(d => {
    const drill = DRILL_LIBRARY.find(x => x.id === d.drillId);
    return { ...d, drillData: drill, sets: Array.from({ length: drill?.sets || 1 }, () => emptySet(drill)), notes: "", disc: "", completed: false };
  }));
  const [showFinish, setShowFinish] = useState(false);
  const [rpe, setRpe] = useState(5);
  const [effort, setEffort] = useState(5);
  const [sessionNotes, setSessionNotes] = useState("");
  const [currentSet, setCurrentSet] = useState(0);
  const [distInput, setDistInput] = useState("");
  const [ctpInput, setCtpInput] = useState({ distance: "", direction: "" });
  const [gapResult, setGapResult] = useState(null);

  const current = logs[drillIdx];
  const drill = current?.drillData;
  const col = drill ? TYPE_COLORS[drill.type] : C.aqua;

  function updateSet(field, val) {
    setLogs(l => l.map((log, i) => {
      if (i !== drillIdx) return log;
      const sets = [...log.sets];
      sets[currentSet] = { ...sets[currentSet], [field]: val };
      return { ...log, sets };
    }));
  }

  function addDistance() {
    if (!distInput) return;
    setLogs(l => l.map((log, i) => {
      if (i !== drillIdx) return log;
      const sets = [...log.sets];
      const dists = [...(sets[currentSet].distances || []), parseFloat(distInput)];
      sets[currentSet] = { ...sets[currentSet], distances: dists };
      return { ...log, sets };
    }));
    setDistInput("");
  }

  function addCTP() {
    if (!ctpInput.distance) return;
    setLogs(l => l.map((log, i) => {
      if (i !== drillIdx) return log;
      const sets = [...log.sets];
      const throws = [...(sets[currentSet].throws || []), { distance: parseFloat(ctpInput.distance), direction: ctpInput.direction }];
      sets[currentSet] = { ...sets[currentSet], throws };
      return { ...log, sets };
    }));
    setCtpInput({ distance: "", direction: "" });
  }

  function addGap(hit) {
    setLogs(l => l.map((log, i) => {
      if (i !== drillIdx) return log;
      const sets = [...log.sets];
      const s = sets[currentSet];
      sets[currentSet] = { ...s, hits: (s.hits || 0) + (hit ? 1 : 0), misses: (s.misses || 0) + (hit ? 0 : 1), total: (s.total || 0) + 1 };
      return { ...log, sets };
    }));
    setGapResult(hit ? "HIT" : "MISS");
    setTimeout(() => setGapResult(null), 1200);
  }

  function markComplete() {
    setLogs(l => l.map((log, i) => i === drillIdx ? { ...log, completed: true } : log));
    if (drillIdx < logs.length - 1) { setDrillIdx(i => i + 1); setCurrentSet(0); }
    else setShowFinish(true);
  }

  function getSummary(log) {
    const drill = log.drillData;
    if (!drill) return {};
    if (drill.metric === "makes_attempts") {
      const m = log.sets.reduce((a, s) => a + (parseFloat(s.makes) || 0), 0);
      const att = log.sets.reduce((a, s) => a + (parseFloat(s.attempts) || 0), 0);
      return { makes: m, attempts: att, pct: calcPct(m, att) };
    }
    if (drill.metric === "distance_reps") {
      const all = log.sets.flatMap(s => s.distances || []);
      return { totalThrows: all.length, avgDist: all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null, maxDist: all.length ? Math.max(...all) : null };
    }
    if (drill.metric === "ctp") {
      const all = log.sets.flatMap(s => s.throws || []).map(t => t.distance);
      return { totalThrows: all.length, avgProx: all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null, bestProx: all.length ? Math.min(...all) : null };
    }
    if (drill.metric === "gap") {
      const hits = log.sets.reduce((a, s) => a + (s.hits || 0), 0);
      const total = log.sets.reduce((a, s) => a + (s.total || 0), 0);
      return { hits, total, pct: calcPct(hits, total) };
    }
    return { totalReps: log.sets.reduce((a, s) => a + (parseFloat(s.reps) || 0), 0) };
  }

  function finish() {
    onFinish({
      id: Date.now(), date: today(), type: sessionPlan.type,
      conditions: sessionPlan.conditions || [], surface: sessionPlan.surface || "",
      rpe, effort, notes: sessionNotes,
      drills: logs.map(log => ({
        drillId: log.drillId, drillName: log.drillData?.name || "",
        category: log.drillData?.section || "", type: log.drillData?.type || "",
        metric: log.drillData?.metric || "", sets: log.sets,
        notes: log.notes, disc: log.disc, completed: log.completed,
        summary: getSummary(log),
      })),
    });
  }

  // Finish screen
  if (showFinish) return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 80 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, letterSpacing: 3 }}>SESSION COMPLETE</div>
        <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 2, marginTop: 2 }}>RATE YOUR SESSION</div>
      </div>
      <div style={{ padding: "14px 12px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <StatBox label="Drills Done" value={`${logs.filter(l => l.completed).length}/${logs.length}`} color={col} />
        </div>
        {logs.map((log, i) => {
          const s = getSummary(log);
          return (
            <Card key={i}>
              <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: 15, color: log.completed ? C.white : C.dim, letterSpacing: 1 }}>{log.drillData?.name}</div>
                  {log.drillData?.metric === "ctp" && s.avgProx !== null && <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>Avg {s.avgProx}ft · Best {s.bestProx}ft</div>}
                </div>
                {log.completed ? (
                  s.pct !== undefined ? <span style={{ fontFamily: T.display, fontSize: 20, color: pctColor(s.pct) }}>{s.pct}%</span>
                  : s.avgDist ? <span style={{ fontFamily: T.display, fontSize: 18, color: C.orange }}>{s.avgDist}ft avg</span>
                  : s.avgProx !== undefined ? <span style={{ fontFamily: T.display, fontSize: 18, color: C.aqua }}>{s.avgProx}ft avg</span>
                  : s.totalReps ? <span style={{ fontFamily: T.display, fontSize: 18, color: C.aqua }}>{s.totalReps} reps</span>
                  : null
                ) : <Tag color={C.dim}>SKIPPED</Tag>}
              </div>
            </Card>
          );
        })}

        <Card style={{ marginTop: 8 }}>
          <div style={{ padding: "12px 14px" }}>
            <SectionHeader title="SESSION RATING" color={C.aqua} />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>PHYSICAL EFFORT (RPE)</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setRpe(n)} style={{ width: 34, height: 34, borderRadius: 8, background: rpe === n ? C.orange : C.navy, border: `1px solid ${rpe === n ? C.orange : C.border}`, color: rpe === n ? C.navy : C.muted, fontFamily: T.body, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>SESSION QUALITY</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setEffort(n)} style={{ width: 34, height: 34, borderRadius: 8, background: effort === n ? C.aqua : C.navy, border: `1px solid ${effort === n ? C.aqua : C.border}`, color: effort === n ? C.navy : C.muted, fontFamily: T.body, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            </div>
            <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="Session notes..." rows={3} style={{ width: "100%", background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.body, fontSize: 13, padding: "8px 12px", resize: "none", boxSizing: "border-box" }} />
          </div>
        </Card>
        <button onClick={finish} style={{ width: "100%", padding: "16px 0", background: C.green, color: C.navy, border: "none", borderRadius: 12, fontFamily: T.display, fontSize: 22, letterSpacing: 3, cursor: "pointer", marginTop: 10 }}>SAVE SESSION</button>
      </div>
    </div>
  );

  if (!drill) return null;

  const currentSetData = current.sets[currentSet] || {};

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "12px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, fontFamily: T.body, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>← EXIT</button>
          <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>Drill {drillIdx + 1} of {logs.length}</div>
          <button onClick={() => setShowFinish(true)} style={{ background: C.green, border: "none", color: C.navy, borderRadius: 8, padding: "5px 12px", fontFamily: T.body, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>FINISH</button>
        </div>
        <div style={{ height: 4, background: C.dim, borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${(drillIdx / logs.length) * 100}%`, background: col, borderRadius: 2, transition: "width .3s" }} />
        </div>
      </div>

      <div style={{ padding: "14px 12px" }}>
        <Card accent={col + "50"}>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <Tag color={col}>{PRACTICE_TYPE_LABELS[drill.type]}</Tag>
              <Tag color={DIFFICULTY_COLORS[drill.difficulty]}>{drill.difficulty}</Tag>
              {drill.throwType !== "both" && <Tag color={C.purple}>{drill.throwType === "backhand" ? "BACKHAND" : "FOREHAND"}</Tag>}
            </div>
            <div style={{ fontFamily: T.display, fontSize: 22, color: C.white, letterSpacing: 1, marginBottom: 6 }}>{drill.name}</div>
            <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>{drill.description}</div>
            <div style={{ background: C.navy, borderRadius: 8, padding: "8px 10px", borderLeft: `3px solid ${col}` }}>
              <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{drill.coachTip}</div>
            </div>
          </div>
        </Card>

        {/* Disc selector */}
        {bagDiscs.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>DISC</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              <Pill active={!current.disc} color={C.muted} onClick={() => setLogs(l => l.map((x, i) => i === drillIdx ? { ...x, disc: "" } : x))}>None</Pill>
              {bagDiscs.map(d => (
                <Pill key={d.id} active={current.disc === d.id} color={col} onClick={() => setLogs(l => l.map((x, i) => i === drillIdx ? { ...x, disc: d.id } : x))}>{d.mold}</Pill>
              ))}
            </div>
          </div>
        )}

        {/* Set tabs */}
        {drill.sets > 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {Array.from({ length: drill.sets }).map((_, i) => {
              const s = current.sets[i];
              const done = s?.distances?.length > 0 || s?.throws?.length > 0 || s?.total > 0 || s?.makes > 0 || s?.reps > 0;
              return (
                <button key={i} onClick={() => setCurrentSet(i)} style={{ flex: 1, padding: "8px 0", background: currentSet === i ? col : done ? col + "20" : C.card, color: currentSet === i ? C.navy : done ? col : C.muted, border: `1px solid ${currentSet === i ? col : done ? col + "40" : C.border}`, borderRadius: 8, fontFamily: T.body, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  SET {i + 1}
                </button>
              );
            })}
          </div>
        )}

        {/* Input by metric type */}
        <Card>
          <div style={{ padding: "12px 14px" }}>
            {/* Makes/Attempts */}
            {drill.metric === "makes_attempts" && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Makes</span>
                  <input type="number" min="0" value={currentSetData.makes || ""} onChange={e => updateSet("makes", e.target.value)}
                    style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 32, textAlign: "center", padding: "10px", boxSizing: "border-box", width: "100%" }} />
                </label>
                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Attempts</span>
                  <input type="number" min="0" value={currentSetData.attempts || ""} onChange={e => updateSet("attempts", e.target.value)}
                    style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 32, textAlign: "center", padding: "10px", boxSizing: "border-box", width: "100%" }} />
                </label>
                {currentSetData.makes && currentSetData.attempts && (
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontFamily: T.display, fontSize: 28, color: pctColor(calcPct(currentSetData.makes, currentSetData.attempts)) }}>
                      {calcPct(currentSetData.makes, currentSetData.attempts)}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Distance */}
            {drill.metric === "distance_reps" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input type="number" value={distInput} onChange={e => setDistInput(e.target.value)} placeholder="Distance (ft)"
                    style={{ flex: 1, background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 24, textAlign: "center", padding: "10px", boxSizing: "border-box" }} />
                  <button onClick={addDistance} style={{ background: col, border: "none", color: C.navy, borderRadius: 8, padding: "0 16px", fontFamily: T.display, fontSize: 16, cursor: "pointer" }}>LOG</button>
                </div>
                {(currentSetData.distances || []).length > 0 && (
                  <div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      {currentSetData.distances.map((d, i) => <span key={i} style={{ fontFamily: T.body, fontSize: 12, color: C.white, background: C.dim, padding: "3px 8px", borderRadius: 6 }}>{d}ft</span>)}
                    </div>
                    <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>
                      Avg: <span style={{ color: C.orange, fontWeight: 700 }}>{Math.round(currentSetData.distances.reduce((a,b)=>a+b,0)/currentSetData.distances.length)}ft</span>
                      {" · "}Max: <span style={{ color: C.green, fontWeight: 700 }}>{Math.max(...currentSetData.distances)}ft</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTP */}
            {drill.metric === "ctp" && (
              <div>
                {drill.targetDist && <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginBottom: 10 }}>Target distance: <span style={{ color: col, fontWeight: 700 }}>{drill.targetDist}ft</span></div>}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input type="number" value={ctpInput.distance} onChange={e => setCtpInput(p => ({ ...p, distance: e.target.value }))} placeholder="Dist from target (ft)"
                    style={{ flex: 1, background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 22, textAlign: "center", padding: "10px", boxSizing: "border-box" }} />
                </div>
                <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6 }}>MISS DIRECTION</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {MISS_DIRECTIONS.map(d => <Pill key={d} active={ctpInput.direction === d} color={col} onClick={() => setCtpInput(p => ({ ...p, direction: p.direction === d ? "" : d }))}>{d}</Pill>)}
                </div>
                <button onClick={addCTP} style={{ width: "100%", background: col, border: "none", color: C.navy, borderRadius: 8, padding: "10px 0", fontFamily: T.display, fontSize: 18, letterSpacing: 2, cursor: "pointer", marginBottom: 10 }}>LOG THROW</button>
                {(currentSetData.throws || []).length > 0 && (
                  <div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      {currentSetData.throws.map((t, i) => (
                        <span key={i} style={{ fontFamily: T.body, fontSize: 11, color: C.white, background: C.dim, padding: "3px 8px", borderRadius: 6 }}>
                          {t.distance}ft{t.direction ? ` (${t.direction})` : ""}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>
                      Avg: <span style={{ color: C.orange, fontWeight: 700 }}>{Math.round(currentSetData.throws.reduce((a,b)=>a+b.distance,0)/currentSetData.throws.length)}ft</span>
                      {" · "}Best: <span style={{ color: C.green, fontWeight: 700 }}>{Math.min(...currentSetData.throws.map(t=>t.distance))}ft</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gap */}
            {drill.metric === "gap" && (
              <div style={{ textAlign: "center" }}>
                {gapResult && (
                  <div style={{ fontFamily: T.display, fontSize: 40, color: gapResult === "HIT" ? C.green : C.red, marginBottom: 10, transition: "all .3s" }}>{gapResult}</div>
                )}
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <button onClick={() => addGap(true)} style={{ flex: 1, padding: "20px 0", background: C.green + "20", border: `2px solid ${C.green}`, color: C.green, borderRadius: 12, fontFamily: T.display, fontSize: 28, letterSpacing: 2, cursor: "pointer" }}>HIT</button>
                  <button onClick={() => addGap(false)} style={{ flex: 1, padding: "20px 0", background: C.red + "20", border: `2px solid ${C.red}`, color: C.red, borderRadius: 12, fontFamily: T.display, fontSize: 28, letterSpacing: 2, cursor: "pointer" }}>MISS</button>
                </div>
                {currentSetData.total > 0 && (
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <div><div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>HITS</div><div style={{ fontFamily: T.display, fontSize: 26, color: C.green }}>{currentSetData.hits}</div></div>
                    <div><div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>MISSES</div><div style={{ fontFamily: T.display, fontSize: 26, color: C.red }}>{currentSetData.misses}</div></div>
                    <div><div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>PCT</div><div style={{ fontFamily: T.display, fontSize: 26, color: pctColor(calcPct(currentSetData.hits, currentSetData.total)) }}>{calcPct(currentSetData.hits, currentSetData.total)}%</div></div>
                  </div>
                )}
              </div>
            )}

            {/* Reps */}
            {drill.metric === "reps" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Reps Completed</span>
                <input type="number" min="0" value={currentSetData.reps || ""} onChange={e => updateSet("reps", e.target.value)}
                  style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 32, textAlign: "center", padding: "10px", boxSizing: "border-box", width: "100%" }} />
              </label>
            )}
          </div>
        </Card>

        {/* Drill notes */}
        <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
          <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Drill Notes</span>
          <textarea value={current.notes} onChange={e => setLogs(l => l.map((x, i) => i === drillIdx ? { ...x, notes: e.target.value } : x))} placeholder="What were you working on..." rows={2}
            style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.body, fontSize: 13, padding: "8px 12px", resize: "none", width: "100%", boxSizing: "border-box" }} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          {drillIdx > 0 && <button onClick={() => { setDrillIdx(i => i - 1); setCurrentSet(0); }} style={{ flex: 1, padding: "12px 0", background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>← PREV</button>}
          <button onClick={markComplete} style={{ flex: 2, padding: "12px 0", background: col, border: "none", color: C.navy, borderRadius: 10, fontFamily: T.display, fontSize: 18, letterSpacing: 2, cursor: "pointer" }}>
            {drillIdx === logs.length - 1 ? "FINISH SESSION" : "NEXT DRILL →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Start ───────────────────────────────────────────────────────────────
function QuickStart({ onStart }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [practiceType, setPracticeType] = useState(null);
  const [throwType, setThrowType] = useState(null);
  const [focus, setFocus] = useState(null);
  const [level, setLevel] = useState(null);

  const focusByType = {
    putting: { all: ["Confidence & consistency", "Circle 2 distance", "Pressure situations", "Putting games"] },
    field: {
      backhand: ["Power & distance", "Approach & CTP", "Gap shots", "Shot shaping"],
      forehand: ["Forehand development", "FH approach & CTP", "FH gap shots", "FH distance"],
      both: ["Power & distance", "Approach & CTP", "Gap shots", "Shot shaping"],
    },
    net: {
      backhand: ["Form & mechanics", "Grip", "Hip drive", "Follow-through"],
      forehand: ["FH form & mechanics", "FH grip", "FH hip drive", "FH follow-through"],
      both: ["Form & mechanics", "Grip", "Hip drive", "Follow-through"],
    },
  };

  const sectionMap = {
    "Confidence & consistency": "confidence",
    "Circle 2 distance": "circle2",
    "Pressure situations": "pressure",
    "Putting games": "games",
    "Power & distance": "power",
    "Approach & CTP": "approach",
    "Gap shots": "gap",
    "Shot shaping": "shaping",
    "Forehand development": "forehand",
    "FH approach & CTP": "approach",
    "FH gap shots": "gap",
    "FH distance": "power",
    "Form & mechanics": "form",
    "FH form & mechanics": "form",
    "Grip": "grip",
    "FH grip": "grip",
    "Hip drive": "hips",
    "FH hip drive": "hips",
    "Follow-through": "followthrough",
    "FH follow-through": "followthrough",
  };

  const needsThrowType = practiceType === "field" || practiceType === "net";
  const focusOptions = practiceType ? (needsThrowType && throwType ? (focusByType[practiceType][throwType] || []) : (focusByType[practiceType]?.all || [])) : [];

  function generate(selectedLevel) {
    const sectionKey = sectionMap[focus];
    let drills = DRILL_LIBRARY.filter(d => {
      if (d.type !== practiceType) return false;
      if (sectionKey && d.section !== sectionKey) return false;
      if (throwType && throwType !== "both" && d.throwType !== "both" && d.throwType !== throwType) return false;
      if (selectedLevel === "beginner") return d.difficulty === "beginner" || d.difficulty === "intermediate";
      if (selectedLevel === "intermediate") return d.difficulty === "intermediate" || d.difficulty === "advanced";
      if (selectedLevel === "advanced") return d.difficulty === "advanced";
      return true;
    }).slice(0, 4);

    if (drills.length < 2) {
      drills = DRILL_LIBRARY.filter(d => d.type === practiceType && d.difficulty === (selectedLevel || "intermediate")).slice(0, 4);
    }

    onStart({ drills: drills.map(d => emptyDrillLog(d)), type: practiceType, conditions: [], surface: "" });
    setOpen(false); setStep(1); setPracticeType(null); setThrowType(null); setFocus(null); setLevel(null);
  }

  if (!open) return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>QUICK START</div>
      <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "14px 0", background: C.card, border: `1px solid ${C.border}`, color: C.white, borderRadius: 12, fontFamily: T.display, fontSize: 18, letterSpacing: 2, cursor: "pointer" }}>
        QUICK START →
      </button>
    </div>
  );

  const totalSteps = needsThrowType ? 4 : 3;

  return (
    <Card accent={C.aqua + "40"} style={{ marginBottom: 16 }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: T.display, fontSize: 16, color: C.aqua, letterSpacing: 2 }}>QUICK START</div>
          <button onClick={() => { setOpen(false); setStep(1); setPracticeType(null); setThrowType(null); setFocus(null); setLevel(null); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
        </div>

        {/* Step 1 — Type */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: T.body, fontSize: 13, color: C.white, marginBottom: 12 }}>What are you working on today?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PRACTICE_TYPES.map(t => (
                <button key={t} onClick={() => { setPracticeType(t); setStep(needsThrowType && (t === "field" || t === "net") ? 2 : 2); setPracticeType(t); }} style={{ padding: "12px 16px", background: TYPE_COLORS[t] + "15", border: `1px solid ${TYPE_COLORS[t]}40`, color: TYPE_COLORS[t], borderRadius: 10, fontFamily: T.display, fontSize: 16, letterSpacing: 2, cursor: "pointer", textAlign: "left" }}
                  onClick={() => { setPracticeType(t); setStep(2); }}>
                  {PRACTICE_TYPE_LABELS[t].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Throw type (field/net only) or focus (putting) */}
        {step === 2 && practiceType && (practiceType === "field" || practiceType === "net") && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: C.muted, fontFamily: T.body, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 10 }}>← back</button>
            <div style={{ fontFamily: T.body, fontSize: 13, color: C.white, marginBottom: 12 }}>Backhand or forehand?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[{ key: "backhand", label: "Backhand", sub: "BH distance, accuracy, shaping" }, { key: "forehand", label: "Forehand", sub: "FH development and technique" }, { key: "both", label: "Both", sub: "Mix of BH and FH drills" }].map(t => (
                <button key={t.key} onClick={() => { setThrowType(t.key); setStep(3); }} style={{ padding: "10px 14px", background: C.navy, border: `1px solid ${C.border}`, color: C.white, borderRadius: 10, fontFamily: T.body, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  {t.label}
                  <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 2, fontWeight: 400 }}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 for putting / Step 3 for field+net — Focus */}
        {((step === 2 && practiceType === "putting") || (step === 3 && (practiceType === "field" || practiceType === "net"))) && (
          <div>
            <button onClick={() => setStep(practiceType === "putting" ? 1 : 2)} style={{ background: "none", border: "none", color: C.muted, fontFamily: T.body, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 10 }}>← back</button>
            <div style={{ fontFamily: T.body, fontSize: 13, color: C.white, marginBottom: 12 }}>What's your focus?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(practiceType === "putting" ? focusByType.putting.all : (focusByType[practiceType][throwType] || [])).map(f => (
                <button key={f} onClick={() => { setFocus(f); setStep(practiceType === "putting" ? 3 : 4); }} style={{ padding: "10px 14px", background: C.navy, border: `1px solid ${C.border}`, color: C.white, borderRadius: 10, fontFamily: T.body, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Final step — Level */}
        {((step === 3 && practiceType === "putting") || (step === 4 && (practiceType === "field" || practiceType === "net"))) && (
          <div>
            <button onClick={() => setStep(practiceType === "putting" ? 2 : 3)} style={{ background: "none", border: "none", color: C.muted, fontFamily: T.body, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 10 }}>← back</button>
            <div style={{ fontFamily: T.body, fontSize: 13, color: C.white, marginBottom: 12 }}>What's your level?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "beginner", label: "Beginner", sub: "New to this practice type" },
                { key: "intermediate", label: "Intermediate", sub: "Comfortable with basics, 1-3 years playing" },
                { key: "advanced", label: "Advanced", sub: "Competitive player, strong fundamentals" },
              ].map(l => (
                <button key={l.key} onClick={() => { setLevel(l.key); generate(l.key); }} style={{ padding: "12px 14px", background: DIFFICULTY_COLORS[l.key] + "15", border: `1px solid ${DIFFICULTY_COLORS[l.key]}40`, color: DIFFICULTY_COLORS[l.key], borderRadius: 10, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                  {l.label}
                  <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 400 }}>{l.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, justifyContent: "center" }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ width: i + 1 === step ? 20 : 6, height: 6, borderRadius: 3, background: i + 1 === step ? C.aqua : i + 1 < step ? C.aqua + "60" : C.dim, transition: "width .2s" }} />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function PracticeHistory({ sessions }) {
  const [view, setView] = useState("list");
  const [monthOff, setMonthOff] = useState(0);

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOff, 1);
  const mDates = monthDates(target.getFullYear(), target.getMonth());
  const mLabel = target.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const avgEffort = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.effort || 5), 0) / sessions.length) : 0;
  const avgRpe = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.rpe || 5), 0) / sessions.length) : 0;

  const drillHistory = {};
  sessions.forEach(s => {
    s.drills?.forEach(d => {
      if (!drillHistory[d.drillId]) drillHistory[d.drillId] = { name: d.drillName, sessions: [], type: d.type, metric: d.metric };
      drillHistory[d.drillId].sessions.push({ date: s.date, summary: d.summary });
    });
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 4, padding: "10px 10px 0", borderBottom: `1px solid ${C.border}` }}>
        {[["list","SESSIONS"],["month","MONTH"],["drills","BY DRILL"]].map(([k,l]) => (
          <button key={k} onClick={() => setView(k)} style={{ flex: 1, padding: "8px 0", background: view === k ? C.aqua : "transparent", color: view === k ? C.navy : C.muted, border: "none", borderBottom: view === k ? "none" : `1px solid ${C.border}`, cursor: "pointer", fontFamily: T.display, fontSize: 12, letterSpacing: 2, borderRadius: view === k ? "6px 6px 0 0" : 0 }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "12px 10px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <StatBox label="Sessions" value={sessions.length} color={C.aqua} />
          <StatBox label="Avg RPE" value={avgRpe || "—"} color={C.orange} />
          <StatBox label="Avg Quality" value={avgEffort || "—"} color={C.purple} />
        </div>

        {view === "list" && (sessions.length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, fontFamily: T.body, fontSize: 13, marginTop: 40 }}>No sessions logged yet.</div>
        ) : sessions.slice().reverse().map(s => {
          const col = TYPE_COLORS[s.type] || C.aqua;
          return (
            <Card key={s.id} accent={col + "30"}>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: T.display, fontSize: 18, color: C.white, letterSpacing: 1 }}>{PRACTICE_TYPE_LABELS[s.type] || s.type}</div>
                    <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 2 }}>{fmtDate(s.date)} · {s.drills?.length || 0} drills</div>
                    {s.conditions?.length > 0 && <div style={{ fontFamily: T.body, fontSize: 10, color: C.dim, marginTop: 2 }}>{s.conditions.join(" · ")}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: T.display, fontSize: 20, color: col }}>{s.effort}/10</div>
                    <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>quality</div>
                  </div>
                </div>
                {s.notes && <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 6, fontStyle: "italic" }}>"{s.notes}"</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {s.drills?.map((d, i) => (
                    <div key={i} style={{ fontFamily: T.body, fontSize: 10, color: C.dim, background: C.navy, padding: "2px 8px", borderRadius: 4 }}>
                      {d.drillName}{d.summary?.pct !== undefined ? ` · ${d.summary.pct}%` : d.summary?.avgDist ? ` · ${d.summary.avgDist}ft` : d.summary?.avgProx ? ` · ${d.summary.avgProx}ft avg` : d.summary?.totalReps ? ` · ${d.summary.totalReps}r` : ""}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        }))}

        {view === "month" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <NavBtn onClick={() => setMonthOff(m => m - 1)}>‹</NavBtn>
              <div style={{ fontFamily: T.display, fontSize: 18, color: C.white, letterSpacing: 2 }}>{mLabel.toUpperCase()}</div>
              <NavBtn onClick={() => setMonthOff(m => Math.min(0, m + 1))} disabled={monthOff >= 0}>›</NavBtn>
            </div>
            <Card>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                  {["M","T","W","T","F","S","S"].map((d,i) => <div key={i} style={{ fontFamily: T.body, fontSize: 9, fontWeight: 700, color: C.dim, textAlign: "center", paddingBottom: 4 }}>{d}</div>)}
                  {Array.from({ length: (new Date(mDates[0]+"T00:00:00").getDay()+6)%7 }).map((_,i) => <div key={"e"+i} />)}
                  {mDates.map(date => {
                    const s = sessions.find(x => x.date === date);
                    const col = s ? TYPE_COLORS[s.type] || C.aqua : null;
                    const day = parseInt(date.split("-")[2]);
                    return <div key={date} style={{ aspectRatio:"1", borderRadius:6, background: s ? col+"30" : C.card, border:`1px solid ${s ? col+"60" : C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.body, fontSize:10, fontWeight: s?700:400, color: s?col:C.dim }}>{day}</div>;
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {view === "drills" && (Object.entries(drillHistory).length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, fontFamily: T.body, fontSize: 13, marginTop: 40 }}>No drill data yet.</div>
        ) : Object.entries(drillHistory).map(([id, data]) => {
          const col = TYPE_COLORS[data.type] || C.aqua;
          const pctSessions = data.sessions.filter(s => s.summary?.pct !== undefined);
          const avgPct = pctSessions.length ? Math.round(pctSessions.reduce((a,s)=>a+s.summary.pct,0)/pctSessions.length) : null;
          const distSessions = data.sessions.filter(s => s.summary?.avgDist);
          const avgDist = distSessions.length ? Math.round(distSessions.reduce((a,s)=>a+s.summary.avgDist,0)/distSessions.length) : null;
          const ctpSessions = data.sessions.filter(s => s.summary?.avgProx !== undefined && s.summary.avgProx !== null);
          const avgProx = ctpSessions.length ? Math.round(ctpSessions.reduce((a,s)=>a+s.summary.avgProx,0)/ctpSessions.length) : null;
          return (
            <Card key={id} accent={col+"30"}>
              <div style={{ padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:T.display, fontSize:15, color:C.white, letterSpacing:1 }}>{data.name}</div>
                  <div style={{ fontFamily:T.body, fontSize:11, color:C.muted }}>{data.sessions.length} session{data.sessions.length>1?"s":""}</div>
                </div>
                {avgPct!==null ? <span style={{ fontFamily:T.display, fontSize:22, color:pctColor(avgPct) }}>{avgPct}%</span>
                : avgDist ? <span style={{ fontFamily:T.display, fontSize:22, color:C.orange }}>{avgDist}ft avg</span>
                : avgProx !== null ? <span style={{ fontFamily:T.display, fontSize:22, color:C.aqua }}>{avgProx}ft avg</span>
                : null}
              </div>
            </Card>
          );
        }))}
      </div>
    </div>
  );
}

// ── Main Practice ─────────────────────────────────────────────────────────────
export default function Practice({ onBack, bagDiscs = [] }) {
  const [sessions, setSessions] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_practice_v1")||"[]"); } catch { return []; } });
  const [templates, setTemplates] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_templates_v1")||"[]"); } catch { return []; } });
  const [view, setView] = useState("home");
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => { try { localStorage.setItem("puttlog_practice_v1", JSON.stringify(sessions)); } catch {} }, [sessions]);
  useEffect(() => { try { localStorage.setItem("puttlog_templates_v1", JSON.stringify(templates)); } catch {} }, [templates]);

  function startSession(plan) { setActiveSession(plan); setView("active"); }
  function finishSession(session) { setSessions(s => [...s, session]); setActiveSession(null); setView("home"); }
  function saveTemplate(t) { setTemplates(prev => [...prev, t]); }

  if (view === "build") return <SessionBuilder onStart={startSession} onBack={() => setView("home")} bagDiscs={bagDiscs} templates={templates} onSaveTemplate={saveTemplate} />;
  if (view === "active" && activeSession) return <ActiveSession sessionPlan={activeSession} onFinish={finishSession} onBack={() => setView("home")} bagDiscs={bagDiscs} />;
  if (view === "history") return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:60 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"16px 12px" }}>
        <button onClick={() => setView("home")} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:8 }}>← BACK</button>
        <div style={{ fontFamily:T.display, fontSize:28, color:C.white, letterSpacing:3 }}>HISTORY</div>
      </div>
      <PracticeHistory sessions={sessions} />
    </div>
  );

  const todaySession = sessions.find(s => s.date === today());
  const streak = (() => {
    let count = 0, cur = new Date(today()+"T00:00:00");
    while (true) {
      const k = cur.toISOString().split("T")[0];
      if (sessions.find(s => s.date === k)) count++;
      else if (k !== today()) break;
      cur.setDate(cur.getDate()-1);
      if (count > 365) break;
    }
    return count;
  })();

  return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:60 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"16px 12px" }}>
        {onBack && <button onClick={onBack} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:12, fontWeight:700, cursor:"pointer", padding:0, marginBottom:4, display:"block" }}>← HOME</button>}
        <div style={{ fontFamily:T.display, fontSize:30, color:C.white, letterSpacing:3, lineHeight:1 }}>PRACTICE</div>
        <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, letterSpacing:2, marginTop:2 }}>TRAINING HUB</div>
      </div>

      <div style={{ padding:"14px 12px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <StatBox label="Sessions" value={sessions.length} color={C.aqua} />
          <StatBox label="Streak" value={streak+"d"} color={C.orange} />
          <StatBox label="Templates" value={templates.length} color={C.purple} />
        </div>

        {todaySession && (
          <Card accent={C.green+"40"} style={{ marginBottom:16 }}>
            <div style={{ padding:"10px 14px" }}>
              <div style={{ fontFamily:T.display, fontSize:14, color:C.green, letterSpacing:2 }}>TODAY'S SESSION LOGGED</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.muted, marginTop:2 }}>{todaySession.drills?.length} drills · Quality {todaySession.effort}/10</div>
            </div>
          </Card>
        )}

        <button onClick={() => setView("build")} style={{ width:"100%", padding:"18px 0", background:C.aqua, border:"none", color:C.navy, borderRadius:12, fontFamily:T.display, fontSize:24, letterSpacing:3, cursor:"pointer", marginBottom:12 }}>
          + BUILD SESSION
        </button>

        <QuickStart onStart={startSession} />

        <div onClick={() => setView("history")} style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:"16px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:T.display, fontSize:18, color:C.white, letterSpacing:2 }}>HISTORY</div>
            <div style={{ fontFamily:T.body, fontSize:12, color:C.muted, marginTop:2 }}>Sessions, trends, drill breakdown</div>
          </div>
          <div style={{ fontFamily:T.display, fontSize:30, color:C.dim }}>›</div>
        </div>

        {sessions.length > 0 && (
          <div>
            <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:8 }}>RECENT</div>
            {sessions.slice(-3).reverse().map(s => {
              const col = TYPE_COLORS[s.type] || C.aqua;
              return (
                <Card key={s.id} accent={col+"20"}>
                  <div style={{ padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontFamily:T.display, fontSize:15, color:col, letterSpacing:1 }}>{PRACTICE_TYPE_LABELS[s.type]}</div>
                      <div style={{ fontFamily:T.body, fontSize:11, color:C.muted }}>{fmtDate(s.date)} · {s.drills?.length} drills</div>
                    </div>
                    <div style={{ fontFamily:T.display, fontSize:20, color:col }}>{s.effort}/10</div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}