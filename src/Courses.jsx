import { useState } from "react";
import { C, T, Card, Input, SectionHeader, Tag, Pill } from "./shared.jsx";

function emptyLayout(name = "") {
  return { id: Date.now(), name: name || "Main Layout", holes: 18, pars: Array(18).fill(3) };
}

export default function Courses({ courses, setCourses, onBack }) {
  const [view, setView] = useState("list"); // list | edit | new
  const [editCourse, setEditCourse] = useState(null);
  const [editLayout, setEditLayout] = useState(null);
  const [newCourseName, setNewCourseName] = useState("");

  function startNew() {
    const course = { id: Date.now(), name: "", layouts: [emptyLayout("Main Layout")] };
    setEditCourse(course);
    setEditLayout(course.layouts[0]);
    setView("new");
  }

  function startEdit(course) {
    setEditCourse({ ...course, layouts: course.layouts.map(l => ({ ...l, pars: [...l.pars] })) });
    setEditLayout({ ...course.layouts[0], pars: [...course.layouts[0].pars] });
    setView("edit");
  }

  function selectLayout(layout) {
    setEditLayout({ ...layout, pars: [...layout.pars] });
  }

  function updateLayoutName(val) {
    setEditLayout(l => ({ ...l, name: val }));
  }

  function updateHoles(val) {
    const n = Math.max(1, Math.min(27, parseInt(val) || 1));
    setEditLayout(l => {
      const pars = [...l.pars];
      while (pars.length < n) pars.push(3);
      return { ...l, holes: n, pars: pars.slice(0, n) };
    });
  }

  function updatePar(idx, val) {
    setEditLayout(l => {
      const pars = [...l.pars];
      pars[idx] = parseInt(val) || 3;
      return { ...l, pars };
    });
  }

  function addLayout() {
    const layout = emptyLayout(`Layout ${(editCourse.layouts.length + 1)}`);
    const updated = { ...editCourse, layouts: [...editCourse.layouts, layout] };
    setEditCourse(updated);
    setEditLayout({ ...layout });
  }

  function removeLayout(id) {
    if (editCourse.layouts.length <= 1) return;
    const layouts = editCourse.layouts.filter(l => l.id !== id);
    setEditCourse(c => ({ ...c, layouts }));
    setEditLayout({ ...layouts[0], pars: [...layouts[0].pars] });
  }

  function saveLayout() {
    setEditCourse(c => ({
      ...c,
      layouts: c.layouts.map(l => l.id === editLayout.id ? { ...editLayout } : l),
    }));
  }

  function saveCourse() {
    saveLayout();
    const course = {
      ...editCourse,
      name: editCourse.name || newCourseName || "Unnamed Course",
      layouts: editCourse.layouts.map(l => l.id === editLayout.id ? { ...editLayout } : l),
    };
    setCourses(prev => {
      const exists = prev.find(c => c.id === course.id);
      return exists ? prev.map(c => c.id === course.id ? course : c) : [...prev, course];
    });
    setView("list");
  }

  function deleteCourse(id) {
    setCourses(prev => prev.filter(c => c.id !== id));
  }

  // ── List view ──
  if (view === "list") return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>← BACK</button>
        </div>
        <div style={{ fontFamily: T.display, fontSize: 30, color: C.white, letterSpacing: 3 }}>COURSES</div>
        <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 2 }}>COURSE LIBRARY</div>
      </div>

      <div style={{ padding: "14px 10px" }}>
        <button onClick={startNew} style={{ width: "100%", background: C.aqua, border: "none", color: C.navy, borderRadius: 12, padding: "14px 0", fontFamily: T.display, fontSize: 20, letterSpacing: 3, cursor: "pointer", marginBottom: 16 }}>
          + ADD COURSE
        </button>

        {courses.length === 0 && (
          <div style={{ textAlign: "center", color: C.muted, fontFamily: T.body, fontSize: 13, marginTop: 40 }}>
            No courses saved yet. Add your first course above.
          </div>
        )}

        {courses.map(course => (
          <Card key={course.id} accent={C.aqua + "30"}>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: 20, color: C.white, letterSpacing: 1 }}>{course.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                    {course.layouts.map(l => (
                      <Tag key={l.id} color={C.aqua}>{l.name} · {l.holes} holes</Tag>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => startEdit(course)} style={{ background: C.navy, border: `1px solid ${C.border}`, color: C.aqua, borderRadius: 8, padding: "6px 12px", fontFamily: T.body, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>EDIT</button>
                  <button onClick={() => deleteCourse(course.id)} style={{ background: C.navy, border: `1px solid ${C.border}`, color: C.red, borderRadius: 8, padding: "6px 12px", fontFamily: T.body, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>DEL</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── Edit / New view ──
  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 80 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, letterSpacing: 3 }}>{view === "new" ? "NEW COURSE" : "EDIT COURSE"}</div>
      </div>

      <div style={{ padding: "14px 10px" }}>
        {/* Course name */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Course Name</div>
          <Input value={editCourse?.name || ""} onChange={e => setEditCourse(c => ({ ...c, name: e.target.value }))} placeholder="e.g. Creekwood Park" />
        </div>

        {/* Layout selector */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Layouts</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {editCourse?.layouts.map(l => (
              <div key={l.id} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <Pill active={editLayout?.id === l.id} onClick={() => { saveLayout(); selectLayout(l); }}>{l.name}</Pill>
                {editCourse.layouts.length > 1 && (
                  <button onClick={() => removeLayout(l.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                )}
              </div>
            ))}
            <button onClick={addLayout} style={{ background: C.navy, border: `1px dashed ${C.border}`, color: C.muted, borderRadius: 20, padding: "5px 12px", fontSize: 11, fontFamily: T.body, fontWeight: 600, cursor: "pointer" }}>+ Layout</button>
          </div>
        </div>

        {editLayout && (
          <Card accent={C.border}>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Layout Name</div>
                <Input value={editLayout.name} onChange={e => updateLayoutName(e.target.value)} placeholder="e.g. Main Layout" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Number of Holes</div>
                <Input type="number" value={editLayout.holes} onChange={e => updateHoles(e.target.value)} placeholder="18" style={{ maxWidth: 100 }} />
              </div>

              <div>
                <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Par Per Hole</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                  {Array.from({ length: editLayout.holes }).map((_, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: T.body, fontSize: 9, color: C.muted, marginBottom: 3 }}>H{i + 1}</div>
                      <input type="number" min="3" max="5" value={editLayout.pars[i] || 3}
                        onChange={e => updatePar(i, e.target.value)}
                        style={{ width: "100%", background: C.navy, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontFamily: T.body, fontSize: 13, fontWeight: 700, padding: "6px 4px", textAlign: "center", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 10 }}>
                  Total par: <span style={{ color: C.aqua, fontWeight: 700 }}>{editLayout.pars.slice(0, editLayout.holes).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <button onClick={saveCourse} style={{ width: "100%", padding: "16px 0", background: C.aqua, color: C.navy, border: "none", borderRadius: 12, fontFamily: T.display, fontSize: 22, letterSpacing: 3, cursor: "pointer", marginTop: 8 }}>
          SAVE COURSE
        </button>
      </div>
    </div>
  );
}