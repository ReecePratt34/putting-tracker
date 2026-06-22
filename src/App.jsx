import { useState, useEffect } from "react";
import { C, T, Card, Input, SectionHeader, Tag, Pill, StatBox, NavBtn } from "./shared.jsx";
import { DISC_DATABASE, BRANDS, CATEGORIES, WEAR_LEVELS, SHOT_SHAPES, PLASTIC_TIERS } from "./discDatabase.js";

const BAG_NAMES = ["Main Bag", "Practice Bag", "Travel Bag"];
const RESULT_QUALITY = ["Pure", "Off", "Mis-throw"];

// ── Disc metrics session ──────────────────────────────────────────────────────
function DiscMetricsSession({ disc, onSave, onBack, units }) {
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [phase, setPhase] = useState("select"); // select | log | summary
  const [currentShapeIdx, setCurrentShapeIdx] = useState(0);
  const [throws, setThrows] = useState({});
  const [currentThrow, setCurrentThrow] = useState({ distance: "", quality: "Pure" });

  const groups = [...new Set(SHOT_SHAPES.map(s => s.group))];
  const currentShape = selectedShapes[currentShapeIdx];
  const currentThrows = throws[currentShape?.key] || [];

  function toggleShape(key) {
    setSelectedShapes(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]);
  }

  function addThrow() {
    if (!currentThrow.distance) return;
    setThrows(t => ({
      ...t,
      [currentShape.key]: [...(t[currentShape.key] || []), { ...currentThrow, distance: parseFloat(currentThrow.distance) }]
    }));
    setCurrentThrow({ distance: "", quality: "Pure" });
  }

  function removeThrow(idx) {
    setThrows(t => ({ ...t, [currentShape.key]: t[currentShape.key].filter((_, i) => i !== idx) }));
  }

  function calcAvg(throws) {
    const valid = throws.filter(t => t.quality !== "Mis-throw");
    if (!valid.length) return null;
    return Math.round(valid.reduce((a, b) => a + b.distance, 0) / valid.length);
  }

  function calcMax(throws) {
    const valid = throws.filter(t => t.quality !== "Mis-throw");
    if (!valid.length) return null;
    return Math.max(...valid.map(t => t.distance));
  }

  function calcConsistency(throws) {
    const valid = throws.filter(t => t.quality !== "Mis-throw").map(t => t.distance);
    if (valid.length < 2) return null;
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    const variance = valid.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / valid.length;
    const sd = Math.sqrt(variance);
    return Math.max(0, Math.round(100 - (sd / avg * 100)));
  }

  function finishSession() {
    const metrics = {};
    selectedShapes.forEach(shape => {
      const t = throws[shape.key] || [];
      metrics[shape.key] = {
        throws: t,
        avg: calcAvg(t),
        max: calcMax(t),
        consistency: calcConsistency(t),
        label: shape.label,
      };
    });
    onSave(metrics);
  }

  // Select shot shapes
  if (phase === "select") return (
    <div style={{ padding: "14px 10px" }}>
      <div style={{ fontFamily: T.display, fontSize: 22, color: C.aqua, letterSpacing: 2, marginBottom: 4 }}>
        {disc.brand} {disc.mold}
      </div>
      <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, marginBottom: 16 }}>
        Select shot shapes to test today
      </div>
      {groups.map(group => (
        <div key={group} style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>{group.toUpperCase()}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SHOT_SHAPES.filter(s => s.group === group).map(shape => (
              <Pill key={shape.key} active={!!selectedShapes.find(s => s.key === shape.key)} onClick={() => {
                setSelectedShapes(prev => {
                  const exists = prev.find(s => s.key === shape.key);
                  return exists ? prev.filter(s => s.key !== shape.key) : [...prev, shape];
                });
              }}>
                {shape.label}
              </Pill>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => selectedShapes.length > 0 && setPhase("log")} style={{ width: "100%", padding: "14px 0", background: selectedShapes.length > 0 ? C.aqua : C.dim, color: C.navy, border: "none", borderRadius: 12, fontFamily: T.display, fontSize: 20, letterSpacing: 3, cursor: selectedShapes.length > 0 ? "pointer" : "default", marginTop: 8 }}>
        START SESSION ({selectedShapes.length} shapes)
      </button>
    </div>
  );

  // Log throws
  if (phase === "log") return (
    <div style={{ padding: "14px 10px" }}>
      {/* Shape progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {selectedShapes.map((shape, i) => (
          <Pill key={shape.key} active={i === currentShapeIdx} color={i < currentShapeIdx ? C.green : C.aqua} onClick={() => setCurrentShapeIdx(i)}>
            {i < currentShapeIdx ? "✓ " : ""}{shape.label}
          </Pill>
        ))}
      </div>

      <Card accent={C.aqua + "40"}>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontFamily: T.display, fontSize: 20, color: C.aqua, letterSpacing: 2, marginBottom: 2 }}>{currentShape?.label}</div>
          <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginBottom: 14 }}>{currentThrows.length} throws logged</div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Distance ({units})</span>
              <Input type="number" value={currentThrow.distance} onChange={e => setCurrentThrow(t => ({ ...t, distance: e.target.value }))} placeholder={units === "ft" ? "e.g. 285" : "e.g. 87"} />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Throw Quality</div>
            <div style={{ display: "flex", gap: 6 }}>
              {RESULT_QUALITY.map(q => (
                <Pill key={q} active={currentThrow.quality === q} color={q === "Pure" ? C.green : q === "Off" ? C.yellow : C.red} onClick={() => setCurrentThrow(t => ({ ...t, quality: q }))}>{q}</Pill>
              ))}
            </div>
          </div>

          <button onClick={addThrow} style={{ width: "100%", background: C.aqua, border: "none", color: C.navy, borderRadius: 8, padding: "10px 0", fontFamily: T.display, fontSize: 18, letterSpacing: 2, cursor: "pointer", marginBottom: 10 }}>
            LOG THROW
          </button>

          {/* Throw log */}
          {currentThrows.length > 0 && (
            <div style={{ maxHeight: 160, overflowY: "auto" }}>
              {currentThrows.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>#{i + 1}</span>
                    <span style={{ fontFamily: T.display, fontSize: 18, color: t.quality === "Mis-throw" ? C.red : C.white }}>{t.distance}{units}</span>
                    <Tag color={t.quality === "Pure" ? C.green : t.quality === "Off" ? C.yellow : C.red}>{t.quality}</Tag>
                  </div>
                  <button onClick={() => removeThrow(i)} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
              {currentThrows.length >= 2 && (
                <div style={{ display: "flex", gap: 12, padding: "8px 0", marginTop: 4 }}>
                  <div><div style={{ fontFamily: T.body, fontSize: 9, color: C.muted }}>AVG</div><div style={{ fontFamily: T.display, fontSize: 18, color: C.aqua }}>{calcAvg(currentThrows)}{units}</div></div>
                  <div><div style={{ fontFamily: T.body, fontSize: 9, color: C.muted }}>MAX</div><div style={{ fontFamily: T.display, fontSize: 18, color: C.green }}>{calcMax(currentThrows)}{units}</div></div>
                  <div><div style={{ fontFamily: T.body, fontSize: 9, color: C.muted }}>CONSISTENCY</div><div style={{ fontFamily: T.display, fontSize: 18, color: C.orange }}>{calcConsistency(currentThrows)}%</div></div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {currentShapeIdx < selectedShapes.length - 1 ? (
          <button onClick={() => setCurrentShapeIdx(i => i + 1)} style={{ flex: 1, padding: "12px 0", background: C.orange, border: "none", color: C.navy, borderRadius: 10, fontFamily: T.display, fontSize: 16, letterSpacing: 2, cursor: "pointer" }}>
            NEXT SHAPE →
          </button>
        ) : (
          <button onClick={() => setPhase("summary")} style={{ flex: 1, padding: "12px 0", background: C.green, border: "none", color: C.navy, borderRadius: 10, fontFamily: T.display, fontSize: 16, letterSpacing: 2, cursor: "pointer" }}>
            VIEW SUMMARY
          </button>
        )}
      </div>
    </div>
  );

  // Summary
  return (
    <div style={{ padding: "14px 10px" }}>
      <SectionHeader title="SESSION SUMMARY" color={C.aqua} />
      <div style={{ fontFamily: T.display, fontSize: 20, color: C.white, letterSpacing: 1, marginBottom: 14 }}>{disc.brand} {disc.mold}</div>
      {selectedShapes.map(shape => {
        const t = throws[shape.key] || [];
        const avg = calcAvg(t), max = calcMax(t), cons = calcConsistency(t);
        return (
          <Card key={shape.key}>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ fontFamily: T.display, fontSize: 16, color: C.aqua, letterSpacing: 1, marginBottom: 8 }}>{shape.label}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <StatBox label="Avg" value={avg ? `${avg}${units}` : "—"} color={C.aqua} />
                <StatBox label="Max" value={max ? `${max}${units}` : "—"} color={C.green} />
                <StatBox label="Consistency" value={cons ? `${cons}%` : "—"} color={C.orange} />
              </div>
              <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 6 }}>{t.length} throws · {t.filter(x => x.quality === "Pure").length} pure</div>
            </div>
          </Card>
        );
      })}
      <button onClick={finishSession} style={{ width: "100%", padding: "14px 0", background: C.aqua, color: C.navy, border: "none", borderRadius: 12, fontFamily: T.display, fontSize: 20, letterSpacing: 3, cursor: "pointer", marginTop: 8 }}>
        SAVE TO DISC
      </button>
    </div>
  );
}

// ── Add disc form ─────────────────────────────────────────────────────────────
function AddDiscForm({ onAdd, onBack }) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [selectedDisc, setSelectedDisc] = useState(null);
  const [plastic, setPlastic] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [wear, setWear] = useState("New");
  const [bagIdx, setBagIdx] = useState(0);
  const [notes, setNotes] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [customFields, setCustomFields] = useState({ mold: "", category: "Distance Driver", speed: "", glide: "", turn: "", fade: "" });

  const filtered = DISC_DATABASE.filter(d =>
    (!brand || d.brand === brand) &&
    (d.mold.toLowerCase().includes(search.toLowerCase()) || d.brand.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 30);

  function submit() {
    const base = isCustom ? { ...customFields, brand: brand || "Custom", plastics: [] } : selectedDisc;
    if (!base) return;
    onAdd({
      id: Date.now(),
      brand: base.brand,
      mold: base.mold,
      category: base.category,
      speed: base.speed,
      glide: base.glide,
      turn: base.turn,
      fade: base.fade,
      plastic: plastic || (base.plastics?.[0] || ""),
      weight: parseFloat(weight) || null,
      color,
      wear,
      bagIdx,
      notes,
      metrics: {},
      timesUsed: 0,
      dateAdded: new Date().toISOString().split("T")[0],
      lastUsed: null,
    });
  }

  return (
    <div style={{ padding: "14px 10px", paddingBottom: 80 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Pill active={!isCustom} onClick={() => setIsCustom(false)}>Search Database</Pill>
        <Pill active={isCustom} color={C.orange} onClick={() => setIsCustom(true)}>Custom Entry</Pill>
      </div>

      {!isCustom ? (
        <>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Filter by Brand</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              <Pill active={!brand} onClick={() => setBrand("")}>All</Pill>
              {BRANDS.map(b => <Pill key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</Pill>)}
            </div>
          </div>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search mold name..." style={{ marginBottom: 10 }} />
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 14 }}>
            {filtered.map((d, i) => (
              <div key={i} onClick={() => { setSelectedDisc(d); setPlastic(d.plastics[0] || ""); }} style={{ padding: "10px 12px", background: selectedDisc?.mold === d.mold && selectedDisc?.brand === d.brand ? C.aqua + "20" : C.card, border: `1px solid ${selectedDisc?.mold === d.mold && selectedDisc?.brand === d.brand ? C.aqua : C.border}`, borderRadius: 8, marginBottom: 6, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: 700, color: C.white }}>{d.mold}</span>
                    <span style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginLeft: 8 }}>{d.brand}</span>
                  </div>
                  <Tag color={C.aqua}>{d.category.split(" ")[0]}</Tag>
                </div>
                <div style={{ fontFamily: T.body, fontSize: 10, color: C.muted, marginTop: 3 }}>
                  {d.speed} / {d.glide} / {d.turn} / {d.fade}
                </div>
              </div>
            ))}
          </div>

          {selectedDisc && (
            <>
              <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Plastic</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {selectedDisc.plastics.map(p => <Pill key={p} active={plastic === p} onClick={() => setPlastic(p)}>{p}</Pill>)}
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ marginBottom: 14 }}>
          {[["Brand", "brand"], ["Mold", "mold"]].map(([label, key]) => (
            <label key={key} style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              <Input value={customFields[key]} onChange={e => setCustomFields(f => ({ ...f, [key]: e.target.value }))} placeholder={label} />
            </label>
          ))}
          <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Category</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {CATEGORIES.map(c => <Pill key={c} active={customFields.category === c} onClick={() => setCustomFields(f => ({ ...f, category: c }))}>{c}</Pill>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {["speed", "glide", "turn", "fade"].map(f => (
              <label key={f} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: T.body, fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{f}</span>
                <Input type="number" value={customFields[f]} onChange={e => setCustomFields(cf => ({ ...cf, [f]: e.target.value }))} placeholder="0" style={{ fontSize: 13 }} />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Common fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Weight (g)</span>
          <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="175" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Color</span>
          <Input value={color} onChange={e => setColor(e.target.value)} placeholder="Red" />
        </label>
      </div>

      <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Wear Level</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {WEAR_LEVELS.map(w => <Pill key={w} active={wear === w} onClick={() => setWear(w)}>{w}</Pill>)}
      </div>

      <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Add to Bag</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {BAG_NAMES.map((name, i) => <Pill key={i} active={bagIdx === i} onClick={() => setBagIdx(i)}>{name}</Pill>)}
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
        <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Notes</span>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. My go-to hyzer bomber..." rows={2} style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.body, fontSize: 13, padding: "8px 12px", resize: "none", width: "100%", boxSizing: "border-box" }} />
      </label>

      <button onClick={submit} disabled={!selectedDisc && !isCustom} style={{ width: "100%", padding: "14px 0", background: (selectedDisc || isCustom) ? C.aqua : C.dim, color: C.navy, border: "none", borderRadius: 12, fontFamily: T.display, fontSize: 20, letterSpacing: 3, cursor: (selectedDisc || isCustom) ? "pointer" : "default" }}>
        ADD TO BAG
      </button>
    </div>
  );
}

// ── Disc detail view ──────────────────────────────────────────────────────────
function DiscDetail({ disc, onBack, onStartMetrics, onDelete, onUpdate, units }) {
  const [editWear, setEditWear] = useState(disc.wear);
  const [editNotes, setEditNotes] = useState(disc.notes || "");
  const hasMetrics = disc.metrics && Object.keys(disc.metrics).length > 0;

  const metricShapes = hasMetrics ? Object.entries(disc.metrics).filter(([, m]) => m.avg !== null) : [];

  return (
    <div style={{ padding: "14px 10px", paddingBottom: 80 }}>
      {/* Header */}
      <Card accent={C.aqua + "40"}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, letterSpacing: 2, lineHeight: 1 }}>{disc.mold}</div>
              <div style={{ fontFamily: T.body, fontSize: 13, color: C.muted, marginTop: 2 }}>{disc.brand} · {disc.plastic}</div>
              {disc.color && <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, marginTop: 2 }}>{disc.color}{disc.weight ? ` · ${disc.weight}g` : ""}</div>}
            </div>
            <Tag color={C.aqua}>{disc.category}</Tag>
          </div>

          {/* Flight numbers */}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {[["SPD", disc.speed], ["GLI", disc.glide], ["TRN", disc.turn], ["FAD", disc.fade]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.body, fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{l}</div>
                <div style={{ fontFamily: T.display, fontSize: 22, color: C.aqua }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>Used {disc.timesUsed || 0}x</div>
            {disc.lastUsed && <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>· Last: {disc.lastUsed}</div>}
          </div>
        </div>
      </Card>

      {/* Wear */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Wear Level</div>
        <div style={{ display: "flex", gap: 6 }}>
          {WEAR_LEVELS.map(w => <Pill key={w} active={editWear === w} onClick={() => { setEditWear(w); onUpdate({ ...disc, wear: w }); }}>{w}</Pill>)}
        </div>
      </div>

      {/* Metrics */}
      <Card accent={C.orange + "30"}>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasMetrics ? 10 : 0 }}>
            <div style={{ fontFamily: T.display, fontSize: 16, color: C.orange, letterSpacing: 2 }}>THROWING METRICS</div>
            <button onClick={onStartMetrics} style={{ background: C.orange + "20", border: `1px solid ${C.orange}`, color: C.orange, borderRadius: 8, padding: "5px 12px", fontFamily: T.body, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {hasMetrics ? "ADD DATA" : "LOG NOW"}
            </button>
          </div>
          {hasMetrics ? (
            metricShapes.map(([key, m]) => (
              <div key={key} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: T.body, fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 6 }}>{m.label}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div><div style={{ fontFamily: T.body, fontSize: 9, color: C.muted }}>AVG</div><div style={{ fontFamily: T.display, fontSize: 18, color: C.aqua }}>{m.avg}{units}</div></div>
                  <div><div style={{ fontFamily: T.body, fontSize: 9, color: C.muted }}>MAX</div><div style={{ fontFamily: T.display, fontSize: 18, color: C.green }}>{m.max}{units}</div></div>
                  <div><div style={{ fontFamily: T.body, fontSize: 9, color: C.muted }}>CONSISTENCY</div><div style={{ fontFamily: T.display, fontSize: 18, color: C.orange }}>{m.consistency}%</div></div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted, marginTop: 8 }}>No throwing data yet. Log a metrics session to build your disc profile.</div>
          )}
        </div>
      </Card>

      {/* Notes */}
      <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        <span style={{ fontFamily: T.body, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Notes</span>
        <textarea value={editNotes} onChange={e => { setEditNotes(e.target.value); onUpdate({ ...disc, notes: e.target.value }); }} rows={3} style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontFamily: T.body, fontSize: 13, padding: "8px 12px", resize: "none", width: "100%", boxSizing: "border-box" }} />
      </label>

      <button onClick={() => onDelete(disc.id)} style={{ width: "100%", padding: "12px 0", background: "none", border: `1px solid ${C.red}`, color: C.red, borderRadius: 10, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        REMOVE FROM BAG
      </button>
    </div>
  );
}

// ── Main Bag component ────────────────────────────────────────────────────────
export default function Bag({ onBack, units = "ft" }) {
  const [discs, setDiscs] = useState(() => { try { return JSON.parse(localStorage.getItem("puttlog_bag_v1") || "[]"); } catch { return []; } });
  const [view, setView] = useState("bag"); // bag | add | detail | metrics
  const [activeBag, setActiveBag] = useState(0);
  const [selectedDisc, setSelectedDisc] = useState(null);
  const [metricsPrompt, setMetricsPrompt] = useState(null);

  useEffect(() => { try { localStorage.setItem("puttlog_bag_v1", JSON.stringify(discs)); } catch {} }, [discs]);

  function addDisc(disc) {
    const newDisc = disc;
    setDiscs(d => [...d, newDisc]);
    setView("bag");
    // Prompt for metrics on new disc
    setMetricsPrompt(newDisc);
  }

  function deleteDisc(id) {
    setDiscs(d => d.filter(x => x.id !== id));
    setView("bag");
    setSelectedDisc(null);
  }

  function updateDisc(updated) {
    setDiscs(d => d.map(x => x.id === updated.id ? updated : x));
    if (selectedDisc?.id === updated.id) setSelectedDisc(updated);
  }

  function saveMetrics(metrics) {
    const disc = selectedDisc || metricsPrompt;
    const updated = { ...disc, metrics: { ...disc.metrics, ...metrics }, timesUsed: (disc.timesUsed || 0) + 1, lastUsed: new Date().toISOString().split("T")[0] };
    updateDisc(updated);
    setMetricsPrompt(null);
    setView("bag");
  }

  const bagDiscs = discs.filter(d => d.bagIdx === activeBag);
  const byCategory = CATEGORIES.reduce((a, cat) => { a[cat] = bagDiscs.filter(d => d.category === cat); return a; }, {});

  // Metrics prompt modal
  if (metricsPrompt) return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box" }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <div style={{ fontFamily: T.display, fontSize: 24, color: C.white, letterSpacing: 2 }}>NEW DISC ADDED</div>
      </div>
      <div style={{ padding: "20px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: T.display, fontSize: 28, color: C.aqua, letterSpacing: 2, marginBottom: 8 }}>{metricsPrompt.brand} {metricsPrompt.mold}</div>
        <div style={{ fontFamily: T.body, fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
          Want to log throwing metrics for this disc? This will help build your caddie profile and track how it performs across shot shapes.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => { setSelectedDisc(metricsPrompt); setMetricsPrompt(null); setView("metrics"); }} style={{ width: "100%", padding: "14px 0", background: C.aqua, color: C.navy, border: "none", borderRadius: 12, fontFamily: T.display, fontSize: 20, letterSpacing: 3, cursor: "pointer" }}>
            YES, LOG METRICS
          </button>
          <button onClick={() => setMetricsPrompt(null)} style={{ width: "100%", padding: "14px 0", background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 12, fontFamily: T.body, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );

  if (view === "add") return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={() => setView("bag")} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 28, color: C.white, letterSpacing: 3 }}>ADD DISC</div>
      </div>
      <AddDiscForm onAdd={addDisc} onBack={() => setView("bag")} />
    </div>
  );

  if (view === "detail" && selectedDisc) return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={() => setView("bag")} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 26, color: C.white, letterSpacing: 2 }}>{selectedDisc.mold}</div>
        <div style={{ fontFamily: T.body, fontSize: 12, color: C.muted }}>{selectedDisc.brand}</div>
      </div>
      <DiscDetail disc={selectedDisc} onBack={() => setView("bag")} onStartMetrics={() => setView("metrics")} onDelete={deleteDisc} onUpdate={updateDisc} units={units} />
    </div>
  );

  if (view === "metrics" && selectedDisc) return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px" }}>
        <button onClick={() => setView("detail")} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8 }}>← BACK</button>
        <div style={{ fontFamily: T.display, fontSize: 22, color: C.white, letterSpacing: 2 }}>DISC METRICS</div>
        <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 1 }}>LOG THROWING DATA</div>
      </div>
      <DiscMetricsSession disc={selectedDisc} onSave={saveMetrics} onBack={() => setView("detail")} units={units} />
    </div>
  );

  // Main bag view
  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.white, fontFamily: T.body, width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
      <div style={{ background: `linear-gradient(160deg,#0D1B2A,${C.navy})`, borderBottom: `1px solid ${C.border}`, padding: "16px 12px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: C.aqua, fontFamily: T.body, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 4, display: "block" }}>← HOME</button>}
            <div style={{ fontFamily: T.display, fontSize: 30, color: C.white, letterSpacing: 3, lineHeight: 1 }}>MY BAG</div>
            <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, letterSpacing: 2, marginTop: 2 }}>DISC MANAGEMENT</div>
          </div>
          <button onClick={() => setView("add")} style={{ background: C.aqua, border: "none", color: C.navy, borderRadius: 10, padding: "8px 16px", fontFamily: T.display, fontSize: 16, letterSpacing: 2, cursor: "pointer", marginTop: 20 }}>+ ADD</button>
        </div>

        {/* Bag tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {BAG_NAMES.map((name, i) => (
            <button key={i} onClick={() => setActiveBag(i)} style={{ flex: 1, padding: "8px 0", background: activeBag === i ? C.aqua : "transparent", color: activeBag === i ? C.navy : C.muted, border: "none", borderBottom: activeBag === i ? "none" : `1px solid ${C.border}`, cursor: "pointer", fontFamily: T.display, fontSize: 13, letterSpacing: 1, borderRadius: activeBag === i ? "6px 6px 0 0" : 0 }}>
              {name.split(" ")[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 10px" }}>
        {bagDiscs.length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, fontFamily: T.body, fontSize: 13, marginTop: 40 }}>
            No discs in this bag yet.<br />Tap + ADD to build your bag.
          </div>
        ) : (
          CATEGORIES.map(cat => {
            const catDiscs = byCategory[cat];
            if (!catDiscs.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontFamily: T.display, fontSize: 14, color: C.muted, letterSpacing: 2 }}>{cat.toUpperCase()}</div>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <div style={{ fontFamily: T.body, fontSize: 11, color: C.dim }}>{catDiscs.length}</div>
                </div>
                {catDiscs.map(disc => (
                  <div key={disc.id} onClick={() => { setSelectedDisc(disc); setView("detail"); }} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: "10px 14px", marginBottom: 6, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: T.body, fontSize: 14, fontWeight: 700, color: C.white }}>{disc.mold}</span>
                        {disc.color && <span style={{ fontFamily: T.body, fontSize: 11, color: C.muted }}>{disc.color}</span>}
                      </div>
                      <div style={{ fontFamily: T.body, fontSize: 11, color: C.muted, marginTop: 2 }}>
                        {disc.brand} · {disc.plastic}{disc.weight ? ` · ${disc.weight}g` : ""}
                      </div>
                      <div style={{ fontFamily: T.body, fontSize: 10, color: C.dim, marginTop: 2 }}>
                        {disc.speed} / {disc.glide} / {disc.turn} / {disc.fade}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {Object.keys(disc.metrics || {}).length > 0 ? (
                        <Tag color={C.green}>DATA</Tag>
                      ) : (
                        <Tag color={C.dim}>NO DATA</Tag>
                      )}
                      <div style={{ fontFamily: T.body, fontSize: 10, color: C.dim, marginTop: 4 }}>{disc.wear}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}