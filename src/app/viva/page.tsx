"use client";
import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

interface VQ { id: number; question: string; difficulty: string; category: string; hint: string; marks: number }
interface EC { criterion: string; weight: number; description: string }
interface Result { language: string; summary: string; overallDifficulty: string; evaluationCriteria: EC[]; questions: VQ[] }

const dClr: Record<string, string> = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#f87171" };
const cIco: Record<string, string> = { Concept: "\u{1F4A1}", Implementation: "\u2699\uFE0F", Logic: "\u{1F9E0}", Debugging: "\u{1F41B}", Optimization: "\u26A1", Theory: "\u{1F4DA}" };

function VCard({ q, open, onToggle }: { q: VQ; open: boolean; onToggle: () => void }) {
  return (
    <div className="card rounded-xl overflow-hidden" style={{ borderColor: open ? "rgba(251,191,36,0.22)" : undefined }}>
      <button onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left">
        <span className="mono w-[30px] h-[30px] rounded-lg bg-[var(--surface2)] flex items-center justify-center text-[10px] font-bold text-[var(--muted)] flex-shrink-0 mt-px">
          {String(q.id).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <p className="text-[13px] text-[var(--text)] leading-relaxed">{q.question}</p>
          <div className="flex gap-1.5 mt-[7px] flex-wrap">
            <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold"
              style={{ background: `${dClr[q.difficulty]}18`, color: dClr[q.difficulty] }}>{q.difficulty}</span>
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-[var(--surface2)] text-[var(--muted)]">
              {cIco[q.category] || "\u{1F4CC}"} {q.category}
            </span>
            <span className="text-[9px] text-[var(--muted)]">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
          </div>
        </div>
        <span className="text-[var(--muted)] text-[10px] flex-shrink-0 mt-[5px] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}>{"\u25BC"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--surface2)]">
              <p className="text-[9px] text-[#34d399] font-bold uppercase tracking-[1.5px] mb-1.5">What a good answer covers</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{q.hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VivaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoad] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (id: number) => setOpen((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const generate = async () => {
    if (!file) return;
    setErr(""); setResult(null); setLoad(true); setOpen(new Set());
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/viva", { method: "POST", body: fd, credentials: "include" });
      const d = await r.json();
      if (!d.success) throw new Error(d.error?.message || "Failed");
      setResult(d.data);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  const filtered = result?.questions.filter((q) => filter === "All" || q.difficulty === filter || q.category === filter) ?? [];
  const cats = result ? ["All", ...Array.from(new Set(result.questions.map((q) => q.category)))] : [];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="page p-7 min-h-full">
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Viva Question Predictor</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1.5">
          Upload your project code {"\u2192"} get <span className="text-[#fbbf24] font-bold">20 AI-predicted</span> viva questions
        </p>
      </motion.div>

      {!result ? (
        <motion.div variants={fadeUp} className="max-w-[580px]">
          {/* Drop zone */}
          <div
            onClick={() => !loading && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            className="rounded-2xl text-center mb-3.5 transition-all duration-200 py-12 px-6"
            style={{
              border: `2px dashed ${drag ? "rgba(251,191,36,0.5)" : file ? "rgba(52,211,153,0.37)" : "var(--border)"}`,
              cursor: loading ? "default" : "pointer",
              background: drag ? "rgba(251,191,36,0.03)" : file ? "rgba(52,211,153,0.05)" : "var(--surface)",
            }}>
            <input ref={fileRef} type="file" accept=".py,.js,.ts,.java,.cpp,.c,.cs,.go,.rb,.php,.txt" className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
            <div className="text-[44px] mb-3">{file ? "\u2705" : "\u{1F4C1}"}</div>
            {file ? (
              <div>
                <p className="text-sm font-bold text-[#34d399]">{file.name}</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">{(file.size / 1024).toFixed(1)} KB {"\u00B7"} Click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-[var(--text)]">Drop your code file here</p>
                <p className="text-xs text-[var(--muted)] mt-1">or click to browse</p>
                <p className="text-[10px] text-[var(--muted)] mt-2">.py {"\u00B7"} .js {"\u00B7"} .ts {"\u00B7"} .java {"\u00B7"} .cpp {"\u00B7"} .c {"\u00B7"} .go {"\u00B7"} .php</p>
              </div>
            )}
          </div>

          {err && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.19)] rounded-[10px] px-3.5 py-2.5 text-xs text-[#f87171] mb-3">
              {err}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={generate}
            disabled={!file || loading}
            className="w-full py-3.5 rounded-xl border-none cursor-pointer text-white text-[15px] font-bold flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f97316)" }}>
            {loading ? (
              <><span className="spinner w-4 h-4" /> Generating questions{"\u2026"}</>
            ) : (
              "\u26A1 Generate 20 Viva Questions"
            )}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          {/* Summary */}
          <div className="card rounded-[14px] p-5 mb-4">
            <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
              <div className="flex gap-2 flex-wrap">
                <span className="text-[11px] bg-[rgba(251,191,36,0.09)] text-[#fbbf24] border border-[rgba(251,191,36,0.19)] px-3 py-[3px] rounded-full font-bold">
                  {result.language.toUpperCase()}
                </span>
                <span className="text-[11px] bg-[var(--surface2)] text-[var(--muted)] border border-[var(--border)] px-3 py-[3px] rounded-full font-bold">
                  {result.overallDifficulty}
                </span>
              </div>
              <button onClick={() => { setResult(null); setFile(null); }}
                className="px-3.5 py-1.5 rounded-[9px] border border-[var(--border)] bg-[var(--surface2)] text-[var(--muted)] text-[11px] cursor-pointer hover:text-[var(--text)] transition-colors">
                {"\u21A9"} New File
              </button>
            </div>
            <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-4">{result.summary}</p>

            {/* Eval criteria */}
            <p className="label mb-2.5">{"\u{1F4CA}"} Evaluation Criteria</p>
            <div className="grid grid-cols-5 max-lg:grid-cols-3 max-sm:grid-cols-2 gap-2.5">
              {result.evaluationCriteria?.map((c, i) => {
                const colors = ["#4f8ef7", "#a78bfa", "#fbbf24", "#34d399", "#f87171"];
                return (
                  <div key={c.criterion}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-[var(--text)] font-semibold">{c.criterion}</span>
                      <span className="mono text-[10px] text-[var(--muted)]">{c.weight}/10</span>
                    </div>
                    <div className="h-1 bg-[var(--surface2)] rounded-full overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.weight * 10}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ background: colors[i % 5] }}
                      />
                    </div>
                    <p className="text-[9px] text-[var(--muted)] leading-snug">{c.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 mb-3 flex-wrap items-center">
            {["All", "Easy", "Medium", "Hard"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3.5 py-1 rounded-lg text-[11px] cursor-pointer border transition-all"
                style={{
                  borderColor: filter === f && f !== "All" ? `${dClr[f]}40` : "var(--border)",
                  background: filter === f && f !== "All" ? `${dClr[f]}15` : filter === f ? "var(--surface2)" : "var(--surface)",
                  color: filter === f && f !== "All" ? dClr[f] : "var(--muted)",
                  fontWeight: filter === f ? 700 : 400,
                }}>
                {f}
              </button>
            ))}
            <span className="text-[10px] text-[var(--muted)] mx-1">|</span>
            {cats.slice(0, 5).map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                className="px-3.5 py-1 rounded-lg text-[11px] cursor-pointer border transition-all"
                style={{
                  borderColor: filter === c ? "rgba(167,139,250,0.25)" : "var(--border)",
                  background: filter === c ? "rgba(167,139,250,0.09)" : "var(--surface)",
                  color: filter === c ? "#a78bfa" : "var(--muted)",
                  fontWeight: filter === c ? 700 : 400,
                }}>
                {c !== "All" && cIco[c]} {c}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-[var(--muted)]">{filtered.length} questions</span>
          </div>

          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-2">
            {filtered.map((q) => (
              <motion.div key={q.id} variants={fadeUp}>
                <VCard q={q} open={open.has(q.id)} onToggle={() => toggle(q.id)} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
