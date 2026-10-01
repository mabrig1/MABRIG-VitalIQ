"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "mabrig-vitaliq-readings-v1";

const demoReadings = [
  { id: "d1", type: "glucose", value: 102, unit: "mg/dL", source: "Glucose meter", time: "2026-09-30T07:12:00.000Z" },
  { id: "d2", type: "bp", systolic: 118, diastolic: 76, unit: "mmHg", source: "BP cuff", time: "2026-09-30T07:15:00.000Z" },
  { id: "d3", type: "pulse", value: 72, unit: "bpm", source: "Wearable", time: "2026-09-30T07:15:00.000Z" },
  { id: "d4", type: "spo2", value: 98, unit: "%", source: "Pulse oximeter", time: "2026-09-30T07:15:00.000Z" },
  { id: "d5", type: "glucose", value: 108, unit: "mg/dL", source: "Glucose meter", time: "2026-09-29T07:08:00.000Z" },
  { id: "d6", type: "glucose", value: 99, unit: "mg/dL", source: "Glucose meter", time: "2026-09-28T07:03:00.000Z" },
  { id: "d7", type: "glucose", value: 105, unit: "mg/dL", source: "Glucose meter", time: "2026-09-27T07:10:00.000Z" }
];

const labels = { glucose: "Blood glucose", bp: "Blood pressure", pulse: "Pulse", spo2: "Blood oxygen" };
const units = { glucose: "mg/dL", bp: "mmHg", pulse: "bpm", spo2: "%" };

function latestOf(readings, type) {
  return readings.filter((r) => r.type === type).sort((a, b) => new Date(b.time) - new Date(a.time))[0];
}

function displayValue(reading) {
  if (!reading) return "—";
  return reading.type === "bp" ? reading.systolic + "/" + reading.diastolic : String(reading.value);
}

function formatTime(iso) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function Sparkline({ values }) {
  if (!values.length) return <div className="spark-empty">No trend yet</div>;
  const width = 240;
  const height = 74;
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const span = Math.max(max - min, 1);
  const points = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - 8 - ((v - min) / span) * (height - 20);
    return x + "," + y;
  }).join(" ");

  return (
    <svg className="spark" viewBox={"0 0 " + width + " " + height} role="img" aria-label="Recent glucose trend">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VitalIQApp() {
  const [tab, setTab] = useState("Dashboard");
  const [readings, setReadings] = useState(demoReadings);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "glucose", value: "", systolic: "", diastolic: "", source: "Manual entry" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try { setReadings(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  }, [readings]);

  const latest = useMemo(() => ({
    glucose: latestOf(readings, "glucose"),
    bp: latestOf(readings, "bp"),
    pulse: latestOf(readings, "pulse"),
    spo2: latestOf(readings, "spo2")
  }), [readings]);

  const glucoseTrend = useMemo(() => readings
    .filter((r) => r.type === "glucose" && Number.isFinite(Number(r.value)))
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .slice(-7)
    .map((r) => Number(r.value)), [readings]);

  const glucoseAverage = glucoseTrend.length
    ? Math.round(glucoseTrend.reduce((a, b) => a + b, 0) / glucoseTrend.length)
    : null;

  function addReading(event) {
    event.preventDefault();
    const base = {
      id: crypto.randomUUID(),
      type: form.type,
      unit: units[form.type],
      source: form.source,
      time: new Date().toISOString()
    };
    let next;

    if (form.type === "bp") {
      const systolic = Number(form.systolic);
      const diastolic = Number(form.diastolic);
      if (!systolic || !diastolic) {
        setNotice("Enter both systolic and diastolic values.");
        return;
      }
      next = { ...base, systolic, diastolic };
    } else {
      const value = Number(form.value);
      if (!value) {
        setNotice("Enter a reading value.");
        return;
      }
      next = { ...base, value };
    }

    setReadings((current) => [next, ...current]);
    setForm({ type: "glucose", value: "", systolic: "", diastolic: "", source: "Manual entry" });
    setNotice("Reading saved on this device.");
    setShowForm(false);
  }

  function exportReport() {
    const rows = [...readings].sort((a, b) => new Date(b.time) - new Date(a.time));
    const report =
      "MABRIG VitalIQ Health Summary\n\nGenerated: " + new Date().toLocaleString() + "\n\n" +
      rows.map((r) => formatTime(r.time) + " | " + labels[r.type] + " | " + displayValue(r) + " " + r.unit + " | Source: " + r.source).join("\n") +
      "\n\nThis report is informational and does not replace professional medical advice or diagnosis.";

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MABRIG-VitalIQ-health-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const cards = [
    ["glucose", "Blood glucose", "Glucose meter / CGM"],
    ["bp", "Blood pressure", "Validated BP cuff"],
    ["pulse", "Pulse", "Wearable / oximeter"],
    ["spo2", "Blood oxygen", "Pulse oximeter"]
  ];

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="MABRIG VitalIQ home">
          <span className="brandmark">V</span>
          <span><strong>MABRIG</strong> VitalIQ</span>
        </a>
        <button className="ghost" onClick={() => setShowForm(true)}>+ Add reading</button>
      </header>

      <section id="top" className="hero">
        <div>
          <span className="eyebrow">PERSONAL HEALTH INTELLIGENCE</span>
          <h1>Your health data,<br />finally understandable.</h1>
          <p>Bring verified readings into one calm dashboard, see trends, and create a clear summary you can share with a clinician.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setShowForm(true)}>Add your first reading</button>
            <button className="secondary" onClick={exportReport}>Export health summary</button>
          </div>
        </div>

        <div className="hero-card">
          <span className="status-dot" /> Trusted-data approach
          <strong>VitalIQ does not claim to measure glucose or blood pressure using a phone camera.</strong>
          <p>It organizes readings from health devices or manual entry and helps you understand patterns.</p>
        </div>
      </section>

      <nav className="tabs" aria-label="VitalIQ sections">
        {["Dashboard", "Readings", "Insights", "Reports"].map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>
        ))}
      </nav>

      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

      {tab === "Dashboard" && (
        <>
          <section className="metric-grid">
            {cards.map(([key, title, sourceHint]) => (
              <article className="metric-card" key={key}>
                <div className="metric-head"><span>{title}</span><span className="verified">SOURCE</span></div>
                <div className="metric-value">{displayValue(latest[key])}<small>{latest[key]?.unit || units[key]}</small></div>
                <div className="metric-source">{latest[key]?.source || sourceHint}</div>
                <div className="metric-time">{latest[key] ? formatTime(latest[key].time) : "No reading yet"}</div>
              </article>
            ))}
          </section>

          <section className="split">
            <article className="panel trend-panel">
              <div className="panel-title">
                <div><span className="eyebrow">7-DAY VIEW</span><h2>Glucose trend</h2></div>
                <strong>{glucoseAverage ?? "—"}<small> avg mg/dL</small></strong>
              </div>
              <Sparkline values={glucoseTrend} />
              <p className="muted">Patterns become more useful when readings are taken consistently and the measurement source is reliable.</p>
            </article>

            <article className="panel insight-panel">
              <span className="eyebrow">VITALIQ INSIGHT</span>
              <h2>Consistency beats isolated numbers.</h2>
              <p>Your recent glucose entries are available as a trend rather than a single reading. Future connected profiles can add fasting, after-meal, exercise, symptom and medication context.</p>
              <button className="text-button" onClick={() => setTab("Insights")}>See interpretation principles →</button>
            </article>
          </section>
        </>
      )}

      {tab === "Readings" && (
        <section className="panel">
          <div className="panel-title">
            <div><span className="eyebrow">HISTORY</span><h2>Recent readings</h2></div>
            <button className="primary small" onClick={() => setShowForm(true)}>Add reading</button>
          </div>
          <div className="reading-list">
            {[...readings].sort((a, b) => new Date(b.time) - new Date(a.time)).map((r) => (
              <div className="reading-row" key={r.id}>
                <div><strong>{labels[r.type]}</strong><span>{formatTime(r.time)}</span></div>
                <div className="reading-result">
                  <strong>{displayValue(r)} <small>{r.unit}</small></strong>
                  <span>{r.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Insights" && (
        <section className="insight-grid">
          <article className="panel"><span className="number">01</span><h2>Use verified sources</h2><p>VitalIQ records where each number came from. Device provenance matters because interpretation is only as dependable as the underlying measurement.</p></article>
          <article className="panel"><span className="number">02</span><h2>Look for trends</h2><p>Repeated measurements collected under similar conditions are generally more informative than reacting to one isolated value.</p></article>
          <article className="panel"><span className="number">03</span><h2>Escalate, don’t diagnose</h2><p>The app should flag unusual patterns for appropriate follow-up, while clinical diagnosis and treatment decisions remain with qualified professionals.</p></article>
        </section>
      )}

      {tab === "Reports" && (
        <section className="panel report-panel">
          <span className="eyebrow">SHAREABLE SUMMARY</span>
          <h2>Turn scattered readings into a useful consultation brief.</h2>
          <p>The MVP exports a local text summary. The production version can generate branded PDFs with configurable date ranges, notes, medication context and clinician-sharing permissions.</p>
          <button className="primary" onClick={exportReport}>Download current summary</button>
        </section>
      )}

      <section className="safety">
        <strong>Important safety note</strong>
        <p>VitalIQ is an informational tracking application in this MVP. It does not independently measure glucose, blood pressure, oxygen saturation or diagnose medical conditions. Use appropriate validated devices and seek qualified medical care for health concerns or urgent symptoms.</p>
      </section>

      <footer><span>MABRIG VitalIQ</span><span>Built by MABRIG Technologies</span></footer>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <form className="modal" onSubmit={addReading} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div><span className="eyebrow">NEW READING</span><h2>Add health data</h2></div>
              <button type="button" className="close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <label>Measurement
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="glucose">Blood glucose</option>
                <option value="bp">Blood pressure</option>
                <option value="pulse">Pulse</option>
                <option value="spo2">Blood oxygen</option>
              </select>
            </label>

            {form.type === "bp" ? (
              <div className="field-pair">
                <label>Systolic<input inputMode="numeric" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: e.target.value })} placeholder="120" /></label>
                <label>Diastolic<input inputMode="numeric" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: e.target.value })} placeholder="80" /></label>
              </div>
            ) : (
              <label>Value<input inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "glucose" ? "105" : form.type === "pulse" ? "72" : "98"} /></label>
            )}

            <label>Source
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option>Manual entry</option>
                <option>Glucose meter</option>
                <option>CGM</option>
                <option>BP cuff</option>
                <option>Wearable</option>
                <option>Pulse oximeter</option>
              </select>
            </label>

            <div className="form-note">Record a value only after obtaining it from an appropriate measurement source.</div>
            <button className="primary full" type="submit">Save reading</button>
          </form>
        </div>
      )}
    </main>
  );
}
