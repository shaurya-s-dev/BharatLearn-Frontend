"use client";
import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

interface Week { week: number; theme: string; topics: string[]; tasks: string[]; milestone: string; }
interface Plan { title: string; description: string; weeks: Week[]; }

const phaseOf = (w: number) =>
  w <= 6 ? { l: "Foundation", c: "#4f8ef7" } :
  w <= 12 ? { l: "Core", c: "#fbbf24" } :
  w <= 18 ? { l: "Advanced", c: "#a78bfa" } :
  { l: "Mastery", c: "#34d399" };

export default function LearningPage() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoad] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<Set<number>>(new Set([1, 2, 3]));
  const ref = useRef<HTMLInputElement>(null);

  const toggle = (n: number) => setOpen((p) => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s; });

  const generate = async () => {
    setErr(""); setLoad(true); setPlan(null);
    try {
      let res;
      if (mode === "file" && file) {
        const fd = new FormData(); fd.append("file", file);
        res = await fetch("/api/syllabus", { method: "POST", body: fd, credentials: "include" });
      } else {
        res = await fetch("/api/syllabus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), credentials: "include" });
      }
      const d = await res.json();
      if (!d.success) throw new Error(d.error?.message || "Failed");
      setPlan(d.data.plan);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="page p-7 min-h-full">
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Learning Plan Generator</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1.5">
          Paste a syllabus or upload a PDF {"\u2192"} get a <span className="grad-text font-bold">24-week structured roadmap</span>
        </p>
      </motion.div>

      {!plan ? (
        <motion.div variants={fadeUp} className="max-w-[680px]">
          {/* Toggle */}
          <div className="flex gap-1 mb-[18px] bg-[var(--surface)] p-1 rounded-[11px] border border-[var(--border)] w-fit">
            {(["text", "file"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="px-[18px] py-1.5 rounded-lg border-none cursor-pointer text-xs font-semibold transition-all"
                style={{
                  background: mode === m ? "rgba(79,142,247,0.12)" : "transparent",
                  color: mode === m ? "#4f8ef7" : "var(--muted)",
                }}>
                {m === "text" ? "\u270D\uFE0F Paste Text" : "\u{1F4C4} Upload PDF"}
              </button>
            ))}
          </div>

          {mode === "text" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={"Paste your syllabus content here\u2026\n\nExample:\nUnit 1: Variables & Data Types\nUnit 2: Control Flow\nUnit 3: Functions..."}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text)] text-[13px] leading-[1.7] resize-y outline-none mono focus:border-brand/40 transition-colors"
            />
          ) : (
            <motion.div
              whileHover={{ scale: 1.005 }}
              onClick={() => ref.current?.click()}
              className="rounded-[14px] py-11 px-6 text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${file ? "rgba(52,211,153,0.31)" : "var(--border)"}`,
                background: file ? "rgba(52,211,153,0.03)" : "var(--surface)",
              }}>
              <input ref={ref} type="file" accept=".pdf,.txt" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
              <div className="text-4xl mb-2.5">{file ? "\u2705" : "\u{1F4C4}"}</div>
              <p className="text-[13px] font-semibold" style={{ color: file ? "#34d399" : "var(--muted)" }}>
                {file ? file.name : "Click to upload PDF or TXT"}
              </p>
              {!file && <p className="text-[11px] text-[var(--muted)] mt-1">Max 10 MB</p>}
            </motion.div>
          )}

          {err && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.19)] rounded-[10px] px-3.5 py-2.5 text-xs text-[#f87171]">
              {err}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={generate}
            disabled={loading || (mode === "text" ? text.trim().length < 20 : !file)}
            className="btn-primary w-full mt-3.5 py-3 text-[15px] flex items-center justify-center gap-2">
            {loading ? (
              <><span className="spinner w-4 h-4" /> Generating{"\u2026"}</>
            ) : (
              "\u2728 Generate 24-Week Plan"
            )}
          </motion.button>
        </motion.div>
      ) : (
        <div>
          <motion.div variants={fadeUp} className="flex justify-between items-start mb-[18px] flex-wrap gap-2.5">
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text)]">{plan.title}</h2>
              <p className="text-[13px] text-[var(--muted)] mt-1 max-w-[500px]">{plan.description}</p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPlan(null)}
              className="px-5 py-[11px] rounded-[11px] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] cursor-pointer text-sm transition-colors hover:text-[var(--text)]">
              {"\u21A9"} New Plan
            </motion.button>
          </motion.div>

          {/* Progress bar */}
          <motion.div variants={fadeUp} className="mb-[18px]">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-[var(--muted)] font-semibold">Plan Progress</span>
              <span className="text-[11px] text-[var(--accent)] mono">{plan.weeks?.length || 0}/24 weeks</span>
            </div>
            <div className="h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((plan.weeks?.length || 0) / 24) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-brand via-purple-400 to-emerald-400"
              />
            </div>
          </motion.div>

          {/* Phase legend */}
          <motion.div variants={fadeUp} className="flex gap-2 mb-[18px] flex-wrap">
            {[["Foundation", "#4f8ef7", "1\u20136"], ["Core", "#fbbf24", "7\u201312"], ["Advanced", "#a78bfa", "13\u201318"], ["Mastery", "#34d399", "19\u201324"]].map(([l, c, w]) => (
              <div key={l} className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1">
                <div className="w-[7px] h-[7px] rounded-full" style={{ background: c }} />
                <span className="text-[11px] text-[var(--muted)] font-semibold">{l}</span>
                <span className="text-[10px] text-[var(--muted)]">Wk {w}</span>
              </div>
            ))}
          </motion.div>

          {/* Expand/collapse */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setOpen(new Set(plan.weeks?.map((w) => w.week) || []))}
              className="px-3.5 py-[5px] rounded-lg border border-[var(--border)] bg-[var(--surface2)] text-[var(--muted)] text-[11px] cursor-pointer transition-colors hover:text-[var(--text)]">
              Expand All
            </button>
            <button onClick={() => setOpen(new Set())}
              className="px-3.5 py-[5px] rounded-lg border border-[var(--border)] bg-[var(--surface2)] text-[var(--muted)] text-[11px] cursor-pointer transition-colors hover:text-[var(--text)]">
              Collapse All
            </button>
          </div>

          {/* Week cards */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-2">
            {plan.weeks?.map((w) => {
              const ph = phaseOf(w.week);
              const isOpen = open.has(w.week);
              return (
                <motion.div key={w.week} variants={fadeUp} className="card rounded-[14px] overflow-hidden">
                  <button onClick={() => toggle(w.week)} className="w-full flex items-center gap-3 px-4 py-[11px] bg-transparent border-none cursor-pointer text-left">
                    <div className="mono w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: `${ph.c}18`, border: `1px solid ${ph.c}35`, color: ph.c }}>
                      {String(w.week).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-[var(--text)]">{w.theme}</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">{w.topics?.length} topics {"\u00B7"} {w.tasks?.length} tasks</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ color: ph.c, background: `${ph.c}15` }}>{ph.l}</span>
                    <span className="text-[var(--muted)] text-[11px] transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>{"\u25BC"}</span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[var(--border)] overflow-hidden">
                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 p-4">
                          <div>
                            <p className="text-[9px] text-brand uppercase tracking-[2px] font-bold mb-2">Topics</p>
                            {w.topics?.map((t, i) => <div key={i} className="text-xs text-[var(--text)] mb-1">{"\u2192"} {t}</div>)}
                          </div>
                          <div>
                            <p className="text-[9px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-2">Tasks</p>
                            {w.tasks?.map((t, i) => <div key={i} className="text-xs text-[var(--text)] mb-1">{"\u2726"} {t}</div>)}
                          </div>
                          {w.milestone && (
                            <div className="col-span-full bg-[rgba(52,211,153,0.03)] border border-[rgba(52,211,153,0.19)] rounded-[9px] px-3.5 py-[9px] flex gap-[9px] items-start">
                              <span className="text-[#34d399] text-[15px]">{"\u{1F3C1}"}</span>
                              <div>
                                <p className="text-[9px] text-[#34d399] font-bold mb-0.5">MILESTONE</p>
                                <p className="text-xs text-[var(--text)]">{w.milestone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
