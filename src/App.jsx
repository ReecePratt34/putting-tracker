import { useState, useEffect } from "react";
import { C, T, today } from "./shared.jsx";
import PuttingTracker from "./PuttingTracker.jsx";
import Rounds from "./Rounds.jsx";
import Courses from "./Courses.jsx";
import Bag from "./Bag.jsx";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
if (!document.head.querySelector("link[href*='Bebas']")) document.head.appendChild(fontLink);

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

export default function App() {
  const [screen, setScreen] = useState("home");
  const [units, setUnits] = useState(() => { try { return localStorage.getItem("puttlog_units") || "ft"; } catch { return "ft"; } });
  const [courses, setCourses] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_courses_v1") || "[]"); } catch { return []; } });
  const [sessions] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_v4") || "{}"); } catch { return {}; } });
  const [rounds] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_rounds_v1") || "[]"); } catch { return []; } });
  const [discs] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_bag_v1") || "[]"); } catch { return []; } });

  useEffect(() => { try { localStorage.setItem("puttlog_courses_v1", JSON.stringify(courses)); } catch {} }, [courses]);
  useEffect(() => { try { localStorage.setItem("puttlog_units", units); } catch {} }, [units]);

  const streak = currentStreak(sessions);
  const totalSessions = Object.keys(sessions).length;
  const leagueRounds = rounds.filter(r => r.type === "league" && r.completed).length;
  const totalDiscs = discs.length;

  if (screen === "practice") return <PuttingTracker onBack={() => setScreen("home")} />;
  if (screen === "rounds") return <Rounds courses={courses} onBack={() => setScreen("home")} />;
  if (screen === "courses") return <Courses courses={courses} setCourses={setCourses} onBack={() => setScreen("home")} />;
  if (screen === "bag") return <Bag onBack={() => setScreen("home")} units={units} />;

  const navItems = [
    { key: "practice", label: "PRACTICE", sub: "Putting tracker & drills", color: C.aqua, stat: totalSessions + " sessions" },
    { key: "rounds", label: "ROUNDS", sub: "League & solo scorecards", color: C.orange, stat: leagueRounds + " league rounds" },
    { key: "bag", label: "MY BAG", sub: "Discs, metrics & caddie data", color: C.purple, stat: totalDiscs + " discs" },
    { key: "courses", label: "COURSES", sub: "Course library & layouts", color: C.green, stat: courses.length + " saved" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, #0D1B2A 0%, ${C.navy} 60%)`, padding: "40px 16px 24px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 52, color: C.white, letterSpacing: 4, lineHeight: 1 }}>DISC</div>
            <div style={{ fontFamily: T.display, fontSize: 52, color: C.aqua, letterSpacing: 4, lineHeight: 1 }}>LOG</div>
            <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 3, marginTop: 6 }}>YOUR DISC GOLF COMPANION</div>
          </div>
          {/* Units toggle */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: T.body, fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 4, textAlign: "center" }}>UNITS</div>
            <div style={{ display: "flex", background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {["ft", "m"].map(u => (
                <button key={u} onClick={() => setUnits(u)} style={{ padding: "6px 12px", background: units === u ? C.aqua : "transparent", color: units === u ? C.navy : C.muted, border: "none", cursor: "pointer", fontFamily: T.body, fontSize: 12, fontWeight: 700 }}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {streak > 0 && (
            <div style={{ background: C.orange + "20", border: `1px solid ${C.orange}40`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: T.display, fontSize: 26, color: C.orange, lineHeight: 1 }}>{streak}</span>
              <div>
                <div style={{ fontFamily: T.body, fontSize: 10, color: C.orange, fontWeight: 700 }}>DAY</div>
                <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted }}>STREAK</div>
              </div>
            </div>
          )}
          <div style={{ background: C.aqua + "20", border: `1px solid ${C.aqua}40`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontFamily: T.display, fontSize: 26, color: C.aqua, lineHeight: 1 }}>{totalSessions}</div>
            <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 2 }}>SESSIONS</div>
          </div>
          <div style={{ background: C.purple + "20", border: `1px solid ${C.purple}40`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontFamily: T.display, fontSize: 26, color: C.purple, lineHeight: 1 }}>{totalDiscs}</div>
            <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 2 }}>DISCS</div>
          </div>
          <div style={{ background: C.green + "20", border: `1px solid ${C.green}40`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontFamily: T.display, fontSize: 26, color: C.green, lineHeight: 1 }}>{leagueRounds}</div>
            <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 2 }}>ROUNDS</div>
          </div>
        </div>
      </div>

      {/* Nav cards */}
      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {navItems.map(item => (
          <div key={item.key} onClick={() => setScreen(item.key)} style={{
            background: C.card, borderRadius: 14,
            border: `1px solid ${item.color}30`,
            padding: "18px 16px", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontFamily: T.display, fontSize: 24, color: item.color, letterSpacing: 3, lineHeight: 1 }}>{item.label}</div>
              <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, marginTop: 4 }}>{item.sub}</div>
              <div style={{ fontFamily: T.body, fontSize: 11, color: item.color, marginTop: 6, fontWeight: 600 }}>{item.stat}</div>
            </div>
            <div style={{ fontFamily: T.display, fontSize: 40, color: item.color + "40" }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}