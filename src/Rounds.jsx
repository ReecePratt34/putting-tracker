import { useState } from "react";
import { C, T, Card, Input, SectionHeader, Tag, Pill, StatBox, NavBtn, today, fmtDate, weekKey, weekDates, monthDates, scoreLabel, scoreColor, scoreToPar } from "./shared.jsx";

const FORMATS = ["Best Shot Doubles", "Stroke Play", "Singles"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function emptyTeam(id, isMyTeam = false) {
  return { id, isMyTeam, players: isMyTeam ? ["", ""] : ["", ""], mulligan: false, scores: [] };
}

function emptyRound(holes = 18) {
  return {
    id: Date.now(),
    date: today(),
    courseId: null,
    courseName: "",
    layoutName: "",
    format: "Best Shot Doubles",
    type: "league", // league | solo
    holes,
    pars: Array(holes).fill(3),
    myTeam: emptyTeam("my", true),
    otherTeams: [],
    completed: false,
    totalScore: null,
    scoreToPar: null,
  };
}

// ── Scorecard ─────────────────────────────────────────────────────────────────
function Scorecard({ round, setRound }) {
  const [activeHole, setActiveHole] = useState(0);
  const hole = activeHole;
  const par = round.pars[hole];

  function setScore(teamId, val) {
    const score = parseInt(val) || null;
    setRound(r => {
      if (teamId === "my") {
        const scores = [...(r.myTeam.scores || [])];
        scores[hole] = score;
        return { ...r, myTeam: { ...r.myTeam, scores } };
      }
      return {
        ...r,
        otherTeams: r.otherTeams.map(t => {
          if (t.id !== teamId) return t;
          const scores = [...(t.scores || [])];
          scores[hole] = score;
          return { ...t, scores };
        }),
      };
    });
  }

  function teamTotal(team) {
    return (team.scores || []).reduce((a, b) => a + (b || 0), 0);
  }

  function teamPar(team) {
    const total = teamTotal(team);
    const holesPlayed = (team.scores || []).filter(s => s !== null && s !== undefined).length;
    const parSoFar = round.pars.slice(0, holesPlayed).reduce((a, b) => a + b, 0);
    return total - parSoFar;
  }

  const allTeams = [round.myTeam, ...round.otherTeams];

  return (
    <div>
      {/* Hole nav */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "10px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <NavBtn onClick={() => setActiveHole(h => Math.max(0, h - 1))} disabled={activeHole === 0}>‹</NavBtn>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, letterSpacing: 2 }}>HOLE {hole + 1}</div>
            <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted }}>Par {par}</div>
          </div>
          <NavBtn onClick={() => setActiveHole(h => Math.min(round.holes - 1, h + 1))} disabled={activeHole === round.holes - 1}>›</NavBtn>
        </div>

        {/* Hole dots */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
          {Array.from({ length: round.holes }).map((_, i) => {
            const myScore = round.myTeam.scores?.[i];
            const diff = myScore !== null && myScore !== undefined ? myScore - round.pars[i] : null;
            return (
              <div key={i} onClick={() => setActiveHole(i)} style={{
                width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
                background: diff !== null ? scoreColor(diff) + "30" : C.navy,
                border: `2px solid ${i === hole ? C.aqua : diff !== null ? scoreColor(diff) : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.body, fontSize: 9, fontWeight: 700,
                color: i === hole ? C.aqua : diff !== null ? scoreColor(diff) : C.dim,
              }}>{i + 1}</div>
            );
          })}
        </div>
      </div>

      {/* Score entry */}
      <div style={{ padding: "10px 10px" }}>
        {/* My team */}
        <Card accent={C.aqua + "50"}>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: T.display, fontSize: 16, color: C.aqua, letterSpacing: 1 }}>MY TEAM</div>
                <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted }}>{round.myTeam.players.filter(Boolean).join(" & ") || "My Team"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.display, fontSize: 22, color: scoreColor(teamPar(round.myTeam)) }}>{scoreLabel(teamPar(round.myTeam))}</div>
                <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>total</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>SCORE</div>
                <input type="number" min="1" value={round.myTeam.scores?.[hole] || ""}
                  onChange={e => setScore("my", e.target.value)}
                  style={{ width: "100%", background: C.navy, border: `2px solid ${C.aqua}40`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 32, textAlign: "center", padding: "8px", boxSizing: "border-box" }} />
              </div>
              {round.myTeam.scores?.[hole] && (
                <div style={{ textAlign: "center", minWidth: 50 }}>
                  <div style={{ fontFamily: T.display, fontSize: 28, color: scoreColor(scoreToPar(round.myTeam.scores[hole], par)) }}>
                    {scoreLabel(scoreToPar(round.myTeam.scores[hole], par))}
                  </div>
                  <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>vs par</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Other teams */}
        {round.otherTeams.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>OTHER TEAMS</div>
            {round.otherTeams.map((team, ti) => (
              <Card key={team.id}>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: T.display, fontSize: 14, color: C.white, letterSpacing: 1 }}>TEAM {ti + 2}</div>
                      <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>{team.players.filter(Boolean).join(" & ") || `Team ${ti + 2}`}</div>
                      {team.mulligan && <Tag color={C.orange}>MULLIGAN</Tag>}
                    </div>
                    <div style={{ fontFamily: T.display, fontSize: 18, color: scoreColor(teamPar(team)) }}>{scoreLabel(teamPar(team))}</div>
                  </div>
                  <input type="number" min="1" value={team.scores?.[hole] || ""}
                    onChange={e => setScore(team.id, e.target.value)}
                    style={{ width: "100%", background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.display, fontSize: 24, textAlign: "center", padding: "6px", boxSizing: "border-box" }} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Horizontal score summary */}
        <Card style={{ marginTop: 8, overflowX: "auto" }}>
          <div style={{ padding: "10px 14px", minWidth: round.holes * 36 + 80 }}>
            <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>SCORECARD</div>
            {/* Header row */}
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 70, fontFamily: T.body, fontSize: 10, color: C.muted, flexShrink: 0 }}>HOLE</div>
              {Array.from({ length: round.holes }).map((_, i) => (
                <div key={i} onClick={() => setActiveHole(i)} style={{ width: 32, textAlign: "center", fontFamily: T.body, fontSize: 10, fontWeight: i === hole ? 700 : 400, color: i === hole ? C.aqua : C.muted, cursor: "pointer", flexShrink: 0 }}>{i + 1}</div>
              ))}
              <div style={{ width: 36, textAlign: "center", fontFamily: T.body, fontSize: 10, color: C.muted, flexShrink: 0 }}>TOT</div>
            </div>
            {/* Par row */}
            <div style={{ display: "flex", marginBottom: 6, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 70, fontFamily: T.body, fontSize: 10, color: C.muted, flexShrink: 0 }}>PAR</div>
              {round.pars.map((p, i) => (
                <div key={i} style={{ width: 32, textAlign: "center", fontFamily: T.body, fontSize: 10, color: C.muted, flexShrink: 0 }}>{p}</div>
              ))}
              <div style={{ width: 36, textAlign: "center", fontFamily: T.body, fontSize: 10, color: C.muted, flexShrink: 0 }}>{round.pars.reduce((a,b)=>a+b,0)}</div>
            </div>
            {/* Team rows */}
            {allTeams.map((team, ti) => (
              <div key={team.id} style={{ display: "flex", marginBottom: 4 }}>
                <div style={{ width: 70, fontFamily: T.body, fontSize: 10, color: ti === 0 ? C.aqua : C.muted, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ti === 0 ? "MY TEAM" : team.players.filter(Boolean)[0] || `T${ti+1}`}
                </div>
                {Array.from({ length: round.holes }).map((_, i) => {
                  const s = team.scores?.[i];
                  const diff = s !== null && s !== undefined ? s - round.pars[i] : null;
                  return (
                    <div key={i} style={{ width: 32, textAlign: "center", fontFamily: T.body, fontSize: 11, fontWeight: 700, color: diff !== null ? scoreColor(diff) : C.dim, flexShrink: 0, background: i === hole ? C.border + "50" : "transparent" }}>
                      {s || "·"}
                    </div>
                  );
                })}
                <div style={{ width: 36, textAlign: "center", fontFamily: T.display, fontSize: 14, color: ti === 0 ? C.aqua : C.white, flexShrink: 0 }}>
                  {teamTotal(team) || "—"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Setup screen ──────────────────────────────────────────────────────────────
function RoundSetup({ courses, onStart, onBack }) {
  const [type, setType] = useState("league");
  const [format, setFormat] = useState("Best Shot Doubles");
  const [courseMode, setCourseMode] = useState("saved"); // saved | new
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [manualName, setManualName] = useState("");
  const [holes, setHoles] = useState(18);
  const [pars, setPars] = useState(Array(18).fill(3));
  const [myPlayers, setMyPlayers] = useState(["", ""]);
  const [isMulligan, setIsMulligan] = useState(false);
  const [otherTeams, setOtherTeams] = useState([]);

  function selectCourse(course) {
    setSelectedCourse(course);
    const layout = course.layouts[0];
    setSelectedLayout(layout);
    setHoles(layout.holes);
    setPars([...layout.pars]);
  }

  function selectLayout(layout) {
    setSelectedLayout(layout);
    setHoles(layout.holes);
    setPars([...layout.pars]);
  }

  function updateHoles(n) {
    n = Math.max(1, Math.min(27, n));
    setHoles(n);
    setPars(prev => { const p = [...prev]; while (p.length < n) p.push(3); return p.slice(0, n); });
  }

  function addTeam() {
    if (otherTeams.length >= 4) return;
    setOtherTeams(t => [...t, emptyTeam(Date.now())]);
  }

  function start() {
    const round = {
      ...emptyRound(holes),
      type,
      format,
      courseId: selectedCourse?.id || null,
      courseName: selectedCourse?.name || manualName || "",
      layoutName: selectedLayout?.name || "",
      holes,
      pars: pars.slice(0, holes),
      myTeam: { ...emptyTeam("my", true), players: isMulligan ? [myPlayers[0]] : myPlayers, mulligan: isMulligan },
      otherTeams: otherTeams.map(t => ({ ...t, scores: [] })),
    };
    onStart(round);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 80 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, letterSpacing: 3 }}>NEW ROUND</div>
      </div>

      <div style={{ padding: "14px 10px" }}>
        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Round Type</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["league","solo"].map(t => (
              <Pill key={t} active={type===t} onClick={()=>setType(t)}>{t.toUpperCase()}</Pill>
            ))}
          </div>
        </div>

        {/* Format */}
        {type === "league" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Format</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FORMATS.map(f => <Pill key={f} active={format===f} onClick={()=>setFormat(f)}>{f}</Pill>)}
            </div>
          </div>
        )}

        {/* Course */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Course</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Pill active={courseMode==="saved"} onClick={()=>setCourseMode("saved")}>Saved Course</Pill>
            <Pill active={courseMode==="new"} onClick={()=>setCourseMode("new")}>Manual</Pill>
          </div>

          {courseMode === "saved" && (
            courses.length === 0 ? (
              <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted }}>No saved courses yet. Add one in the Courses section or use Manual.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {courses.map(c => (
                  <div key={c.id} onClick={() => selectCourse(c)} style={{ background: selectedCourse?.id === c.id ? C.aqua + "15" : C.card, border: `1px solid ${selectedCourse?.id === c.id ? C.aqua : C.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                    <div style={{ fontFamily: T.display, fontSize: 16, color: selectedCourse?.id === c.id ? C.aqua : C.white, letterSpacing: 1 }}>{c.name}</div>
                    {selectedCourse?.id === c.id && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {c.layouts.map(l => (
                          <Pill key={l.id} active={selectedLayout?.id === l.id} onClick={e => { e.stopPropagation(); selectLayout(l); }}>{l.name} · {l.holes}H</Pill>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {courseMode === "new" && (
            <div>
              <Input value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Course name (fill in after round)" style={{marginBottom:10}} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>Holes:</div>
                <Input type="number" value={holes} onChange={e=>updateHoles(parseInt(e.target.value)||18)} style={{ maxWidth: 80 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                {Array.from({ length: holes }).map((_, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: T.body, fontSize: 9, color: C.muted, marginBottom: 3 }}>H{i+1}</div>
                    <input type="number" min="3" max="5" value={pars[i]||3} onChange={e=>setPars(p=>{const n=[...p];n[i]=parseInt(e.target.value)||3;return n;})}
                      style={{ width:"100%", background:C.navy, border:`1px solid ${C.border}`, borderRadius:6, color:C.white, fontFamily:T.body, fontSize:13, fontWeight:700, padding:"6px 4px", textAlign:"center", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My team */}
        <Card accent={C.aqua + "40"}>
          <div style={{ padding: "12px 14px" }}>
            <SectionHeader title="MY TEAM" color={C.aqua} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Pill active={!isMulligan} onClick={()=>setIsMulligan(false)}>With Partner</Pill>
              <Pill active={isMulligan} color={C.orange} onClick={()=>setIsMulligan(true)}>Mulligan (Solo)</Pill>
            </div>
            <Input value={myPlayers[0]} onChange={e=>setMyPlayers(p=>[e.target.value,p[1]])} placeholder="Your name" style={{marginBottom:8}} />
            {!isMulligan && (
              <Input value={myPlayers[1]} onChange={e=>setMyPlayers(p=>[p[0],e.target.value])} placeholder="Partner name" />
            )}
          </div>
        </Card>

        {/* Other teams */}
        {type === "league" && (
          <div style={{ marginTop: 4 }}>
            <SectionHeader title="OTHER TEAMS" color={C.muted} />
            {otherTeams.map((team, ti) => (
              <Card key={team.id}>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontFamily: T.display, fontSize: 14, color: C.white, letterSpacing: 1 }}>TEAM {ti + 2}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Pill active={team.mulligan} color={C.orange} onClick={() => setOtherTeams(t => t.map((x,i)=>i===ti?{...x,mulligan:!x.mulligan}:x))}>Mulligan</Pill>
                      <button onClick={() => setOtherTeams(t => t.filter((_,i)=>i!==ti))} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:18, padding:0 }}>×</button>
                    </div>
                  </div>
                  <Input value={team.players[0]||""} onChange={e=>setOtherTeams(t=>t.map((x,i)=>i===ti?{...x,players:[e.target.value,x.players[1]||""]}:x))} placeholder="Player 1" style={{marginBottom:6}} />
                  {!team.mulligan && <Input value={team.players[1]||""} onChange={e=>setOtherTeams(t=>t.map((x,i)=>i===ti?{...x,players:[x.players[0]||"",e.target.value]}:x))} placeholder="Player 2" />}
                </div>
              </Card>
            ))}
            {otherTeams.length < 4 && (
              <button onClick={addTeam} style={{ width:"100%", background:C.card, border:`1px dashed ${C.border}`, color:C.muted, borderRadius:12, padding:"12px 0", cursor:"pointer", fontFamily:T.body, fontSize:12, fontWeight:600, letterSpacing:1, marginBottom:10 }}>
                + ADD TEAM
              </button>
            )}
          </div>
        )}

        <button onClick={start} style={{ width:"100%", padding:"16px 0", background:C.aqua, color:C.navy, border:"none", borderRadius:12, fontFamily:T.display, fontSize:22, letterSpacing:3, cursor:"pointer", marginTop:8 }}>
          START ROUND
        </button>
      </div>
    </div>
  );
}

// ── Active round wrapper ───────────────────────────────────────────────────────
function ActiveRound({ round, setRound, onFinish, onBack }) {
  const [showFinish, setShowFinish] = useState(false);
  const [courseName, setCourseName] = useState(round.courseName || "");

  function teamTotal(team) { return (team.scores||[]).reduce((a,b)=>a+(b||0),0); }
  function teamPar(team) {
    const total = teamTotal(team);
    const played = (team.scores||[]).filter(s=>s!==null&&s!==undefined).length;
    return total - round.pars.slice(0,played).reduce((a,b)=>a+b,0);
  }

  function finish() {
    const total = teamTotal(round.myTeam);
    const par = round.pars.reduce((a,b)=>a+b,0);
    const completed = { ...round, courseName, completed: true, totalScore: total, scoreToPar: total - par };
    onFinish(completed);
  }

  if (showFinish) return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:80 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"16px 12px" }}>
        <button onClick={()=>setShowFinish(false)} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:8 }}>← BACK</button>
        <div style={{ fontFamily:T.display, fontSize:28, color:C.white, letterSpacing:3 }}>FINISH ROUND</div>
      </div>
      <div style={{ padding:"14px 10px" }}>
        <Card accent={C.aqua+"40"}>
          <div style={{ padding:"12px 14px" }}>
            <SectionHeader title="ROUND SUMMARY" color={C.aqua} />
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <StatBox label="My Score" value={teamTotal(round.myTeam)||"—"} color={C.aqua} />
              <StatBox label="vs Par" value={scoreLabel(teamPar(round.myTeam))} color={scoreColor(teamPar(round.myTeam))} />
            </div>
            {[round.myTeam,...round.otherTeams].map((t,i)=>(
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontFamily:T.body, fontSize:13, color:i===0?C.aqua:C.white }}>{i===0?"My Team":t.players.filter(Boolean).join(" & ")||`Team ${i+1}`}</div>
                <div style={{ fontFamily:T.display, fontSize:18, color:scoreColor(i===0?teamPar(round.myTeam):teamPar(t)) }}>{scoreLabel(i===0?teamPar(round.myTeam):teamPar(t))}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:T.body, fontSize:11, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Course Name</div>
          <Input value={courseName} onChange={e=>setCourseName(e.target.value)} placeholder="e.g. Creekwood Park" />
        </div>

        <button onClick={finish} style={{ width:"100%", padding:"16px 0", background:C.green, color:C.navy, border:"none", borderRadius:12, fontFamily:T.display, fontSize:22, letterSpacing:3, cursor:"pointer" }}>
          SAVE ROUND
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:80 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"12px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontFamily:T.body, fontSize:13, fontWeight:700, cursor:"pointer", padding:0 }}>← EXIT</button>
          <div style={{ fontFamily:T.display, fontSize:20, color:C.white, letterSpacing:2 }}>{round.courseName||"ROUND IN PROGRESS"}</div>
          <button onClick={()=>setShowFinish(true)} style={{ background:C.green, border:"none", color:C.navy, borderRadius:8, padding:"6px 12px", fontFamily:T.body, fontSize:12, fontWeight:700, cursor:"pointer" }}>FINISH</button>
        </div>
        <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, textAlign:"center", marginTop:4 }}>{round.format} · {round.holes} holes</div>
      </div>
      <Scorecard round={round} setRound={setRound} />
    </div>
  );
}

// ── History view ──────────────────────────────────────────────────────────────
function RoundHistory({ rounds, type }) {
  const [monthOff, setMonthOff] = useState(0);
  const [histView, setHistView] = useState("list"); // list | month | prs | teammates

  const filtered = rounds.filter(r => r.type === type && r.completed);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOff, 1);
  const mDates = monthDates(target.getFullYear(), target.getMonth());
  const mLabel = target.toLocaleDateString("en-US",{month:"long",year:"numeric"});

  const monthRounds = filtered.filter(r => r.date && r.date.startsWith(`${target.getFullYear()}-${String(target.getMonth()+1).padStart(2,"0")}`));

  // PRs
  const bestScore = filtered.reduce((best,r) => r.scoreToPar !== null && (best === null || r.scoreToPar < best) ? r.scoreToPar : best, null);
  const bestByCount = {};
  filtered.forEach(r => {
    if (!r.courseName) return;
    if (bestByCount[r.courseName] === undefined || r.scoreToPar < bestByCount[r.courseName]) bestByCount[r.courseName] = r.scoreToPar;
  });

  // Teammate leaderboard
  const teammateMap = {};
  filtered.forEach(r => {
    const partner = r.myTeam?.players?.filter(Boolean)[1];
    if (!partner) return;
    if (!teammateMap[partner]) teammateMap[partner] = { rounds: 0, totalScore: 0, best: null };
    teammateMap[partner].rounds++;
    teammateMap[partner].totalScore += r.scoreToPar || 0;
    if (r.scoreToPar !== null && (teammateMap[partner].best === null || r.scoreToPar < teammateMap[partner].best)) {
      teammateMap[partner].best = r.scoreToPar;
    }
  });
  const teammates = Object.entries(teammateMap).sort(([,a],[,b]) => (a.totalScore/a.rounds) - (b.totalScore/b.rounds));

  const subTabs = type === "league"
    ? [["list","ROUNDS"],["month","MONTH"],["prs","PRs"],["teammates","PARTNERS"]]
    : [["list","ROUNDS"],["month","MONTH"],["prs","PRs"]];

  return (
    <div>
      <div style={{ display:"flex", gap:4, padding:"10px 10px 0", borderBottom:`1px solid ${C.border}` }}>
        {subTabs.map(([k,l])=>(
          <button key={k} onClick={()=>setHistView(k)} style={{ flex:1, padding:"8px 0", background:histView===k?C.aqua:"transparent", color:histView===k?C.navy:C.muted, border:"none", borderBottom:histView===k?"none":`1px solid ${C.border}`, cursor:"pointer", fontFamily:T.display, fontSize:13, letterSpacing:2, borderRadius:histView===k?"6px 6px 0 0":0 }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:"12px 10px" }}>
        {/* Rounds list */}
        {histView === "list" && (
          filtered.length === 0 ? (
            <div style={{ textAlign:"center", color:C.muted, fontFamily:T.body, fontSize:13, marginTop:40 }}>No {type} rounds saved yet.</div>
          ) : (
            filtered.slice().reverse().map(r => (
              <Card key={r.id} accent={r.scoreToPar < 0 ? C.green+"30" : C.border}>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontFamily:T.display, fontSize:18, color:C.white, letterSpacing:1 }}>{r.courseName||"Unknown Course"}</div>
                      <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, marginTop:2 }}>{fmtDate(r.date)} · {r.holes} holes · {r.format}</div>
                      {r.myTeam?.players?.filter(Boolean)[1] && (
                        <div style={{ fontFamily:T.body, fontSize:12, color:C.aqua, marginTop:3 }}>w/ {r.myTeam.players.filter(Boolean)[1]}</div>
                      )}
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:T.display, fontSize:28, color:scoreColor(r.scoreToPar) }}>{scoreLabel(r.scoreToPar)}</div>
                      <div style={{ fontFamily:T.body, fontSize:10, color:C.muted }}>{r.totalScore} strokes</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )
        )}

        {/* Month view */}
        {histView === "month" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <NavBtn onClick={()=>setMonthOff(m=>m-1)}>‹</NavBtn>
              <div style={{ fontFamily:T.display, fontSize:20, color:C.white, letterSpacing:2 }}>{mLabel.toUpperCase()}</div>
              <NavBtn onClick={()=>setMonthOff(m=>Math.min(0,m+1))} disabled={monthOff>=0}>›</NavBtn>
            </div>
            <div style={{ background:C.card, borderRadius:12, padding:"12px 14px", marginBottom:10, border:`1px solid ${C.border}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{ fontFamily:T.body, fontSize:9, fontWeight:700, color:C.dim, textAlign:"center", paddingBottom:4 }}>{d}</div>)}
                {Array.from({length:(new Date(mDates[0]+"T00:00:00").getDay()+6)%7}).map((_,i)=><div key={"e"+i}/>)}
                {mDates.map(date=>{
                  const r=filtered.find(x=>x.date===date);
                  const day=parseInt(date.split("-")[2]);
                  return (
                    <div key={date} style={{ aspectRatio:"1", borderRadius:6, background:r?scoreColor(r.scoreToPar)+"30":C.navy, border:`1px solid ${r?scoreColor(r.scoreToPar)+"60":C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.body, fontSize:10, fontWeight:r?700:400, color:r?scoreColor(r.scoreToPar):C.dim }}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
            {monthRounds.length > 0 && (
              <div>
                <div style={{ fontFamily:T.body, fontSize:10, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:8 }}>THIS MONTH</div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <StatBox label="Rounds" value={monthRounds.length} color={C.aqua} />
                  <StatBox label="Avg Score" value={scoreLabel(Math.round(monthRounds.reduce((a,r)=>a+(r.scoreToPar||0),0)/monthRounds.length))} color={scoreColor(Math.round(monthRounds.reduce((a,r)=>a+(r.scoreToPar||0),0)/monthRounds.length))} />
                  <StatBox label="Best" value={scoreLabel(Math.min(...monthRounds.map(r=>r.scoreToPar||0)))} color={C.green} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRs */}
        {histView === "prs" && (
          <div>
            <Card accent={C.orange+"40"}>
              <div style={{ padding:"12px 14px" }}>
                <SectionHeader title="ALL-TIME BEST" color={C.orange} />
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  <StatBox label="Best Round" value={bestScore!==null?scoreLabel(bestScore):"—"} color={C.orange} />
                  <StatBox label="Rounds" value={filtered.length} color={C.aqua} />
                </div>
                <div style={{ fontFamily:T.body, fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, marginBottom:8 }}>BEST BY COURSE</div>
                {Object.entries(bestByCount).sort(([,a],[,b])=>a-b).map(([course,score])=>(
                  <div key={course} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontFamily:T.body, fontSize:13, color:C.white }}>{course}</span>
                    <span style={{ fontFamily:T.display, fontSize:22, color:scoreColor(score) }}>{scoreLabel(score)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Teammates */}
        {histView === "teammates" && type === "league" && (
          <div>
            <Card accent={C.purple+"40"}>
              <div style={{ padding:"12px 14px" }}>
                <SectionHeader title="PARTNER BOARD" color={C.purple} />
                {teammates.length === 0 ? (
                  <div style={{ fontFamily:T.body, fontSize:13, color:C.muted }}>No partner data yet.</div>
                ) : (
                  teammates.map(([name, data], i) => (
                    <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, paddingBottom:10, borderBottom:i<teammates.length-1?`1px solid ${C.border}`:"none" }}>
                      <div>
                        <div style={{ fontFamily:T.body, fontSize:14, fontWeight:700, color:i===0?C.purple:C.white }}>{name}</div>
                        <div style={{ fontFamily:T.body, fontSize:11, color:C.muted }}>{data.rounds} round{data.rounds>1?"s":""} · Best: {scoreLabel(data.best)}</div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:T.display, fontSize:22, color:scoreColor(Math.round(data.totalScore/data.rounds)) }}>{scoreLabel(Math.round(data.totalScore/data.rounds))}</div>
                        <div style={{ fontFamily:T.body, fontSize:10, color:C.muted }}>avg</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Rounds component ─────────────────────────────────────────────────────
export default function Rounds({ courses, onBack }) {
  const [rounds, setRounds] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_rounds_v1")||"[]"); } catch { return []; } });
  const [view, setView] = useState("home"); // home | setup | active | league | solo
  const [activeRound, setActiveRound] = useState(null);

  function saveRounds(r) { setRounds(r); try { localStorage.setItem("puttlog_rounds_v1", JSON.stringify(r)); } catch {} }

  function startRound(round) { setActiveRound(round); setView("active"); }

  function finishRound(round) {
    saveRounds([...rounds, round]);
    setActiveRound(null);
    setView("home");
  }

  if (view === "setup") return <RoundSetup courses={courses} onStart={startRound} onBack={()=>setView("home")} />;
  if (view === "active" && activeRound) return <ActiveRound round={activeRound} setRound={setActiveRound} onFinish={finishRound} onBack={()=>setView("home")} />;

  if (view === "league") return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:60 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"16px 12px" }}>
        <button onClick={()=>setView("home")} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:8 }}>← BACK</button>
        <div style={{ fontFamily:T.display, fontSize:28, color:C.white, letterSpacing:3 }}>LEAGUE</div>
      </div>
      <RoundHistory rounds={rounds} type="league" />
    </div>
  );

  if (view === "solo") return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:60 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"16px 12px" }}>
        <button onClick={()=>setView("home")} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:8 }}>← BACK</button>
        <div style={{ fontFamily:T.display, fontSize:28, color:C.white, letterSpacing:3 }}>SOLO ROUNDS</div>
      </div>
      <RoundHistory rounds={rounds} type="solo" />
    </div>
  );

  // Home
  const leagueRounds = rounds.filter(r=>r.type==="league"&&r.completed);
  const soloRounds = rounds.filter(r=>r.type==="solo"&&r.completed);
  const bestLeague = leagueRounds.reduce((b,r)=>r.scoreToPar!==null&&(b===null||r.scoreToPar<b)?r.scoreToPar:b,null);

  return (
    <div style={{ minHeight:"100vh", background:C.navy, color:C.white, fontFamily:T.body, width:"100%", boxSizing:"border-box", paddingBottom:60 }}>
      <div style={{ background:`linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom:`1px solid ${C.border}`, padding:"16px 12px" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.aqua, fontFamily:T.body, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:8 }}>← BACK</button>
        <div style={{ fontFamily:T.display, fontSize:30, color:C.white, letterSpacing:3 }}>ROUNDS</div>
        <div style={{ fontFamily:T.body, fontSize:11, color:C.muted, letterSpacing:2 }}>DISC GOLF SCORECARD</div>
      </div>

      <div style={{ padding:"14px 10px" }}>
        <button onClick={()=>setView("setup")} style={{ width:"100%", background:C.aqua, border:"none", color:C.navy, borderRadius:12, padding:"16px 0", fontFamily:T.display, fontSize:22, letterSpacing:3, cursor:"pointer", marginBottom:16 }}>
          + NEW ROUND
        </button>

        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <StatBox label="League" value={leagueRounds.length} sub="rounds" color={C.aqua} />
          <StatBox label="Solo" value={soloRounds.length} sub="rounds" color={C.orange} />
          <StatBox label="Best" value={bestLeague!==null?scoreLabel(bestLeague):"—"} sub="league" color={C.green} />
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div onClick={()=>setView("league")} style={{ background:C.card, borderRadius:12, border:`1px solid ${C.aqua}30`, padding:"16px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:T.display, fontSize:20, color:C.aqua, letterSpacing:2 }}>LEAGUE</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.muted, marginTop:2 }}>Scores, partners, PRs</div>
            </div>
            <div style={{ fontFamily:T.display, fontSize:28, color:C.aqua }}>›</div>
          </div>

          <div onClick={()=>setView("solo")} style={{ background:C.card, borderRadius:12, border:`1px solid ${C.orange}30`, padding:"16px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:T.display, fontSize:20, color:C.orange, letterSpacing:2 }}>SOLO</div>
              <div style={{ fontFamily:T.body, fontSize:12, color:C.muted, marginTop:2 }}>Personal rounds</div>
            </div>
            <div style={{ fontFamily:T.display, fontSize:28, color:C.orange }}>›</div>
          </div>
        </div>
      </div>
    </div>
  );
}