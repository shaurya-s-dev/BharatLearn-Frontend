"use client";
import { useState } from "react";
import { recordQuizResult, recordStudySession } from "@/lib/activity";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

interface Q { id: number; type: "MCQ" | "ShortAnswer" | "Coding"; question: string; difficulty: string; marks: number; options: string[] | null; correctAnswer: string; explanation: string; hint: string; }
interface Quiz { topic: string; language: string; difficulty: string; totalMarks: number; questions: Q[]; }

const TOPICS = ["Loops", "Functions", "Arrays", "Recursion", "OOP", "Sorting", "Linked Lists", "Trees", "SQL", "REST APIs", "Error Handling", "File I/O"];
const LANGS = ["Python", "JavaScript", "Java", "C++", "TypeScript", "Go", "C"];
const DIFFS = [["Beginner", "\u{1F7E2}"], ["Intermediate", "\u{1F7E1}"], ["Advanced", "\u{1F534}"]] as const;

const dClr: Record<string, string> = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#f87171" };
const tBg: Record<string, string> = { MCQ: "#a78bfa", ShortAnswer: "#4f8ef7", Coding: "#f87171" };

function QCard({ q, revealed, selected, onPick, onReveal }: { q: Q; revealed: boolean; selected: string | null; onPick: (l: string) => void; onReveal: () => void }) {
  const [hint, setHint] = useState(false);
  return (
    <motion.div variants={fadeUp} className="card rounded-[14px] overflow-hidden" style={{ borderColor: revealed ? "rgba(52,211,153,0.19)" : undefined }}>
      <div className="p-3.5 px-4">
        <div className="flex items-start gap-3">
          <span className="mono w-8 h-8 rounded-[9px] bg-[var(--surface2)] flex items-center justify-center text-[11px] font-bold text-[var(--muted)] flex-shrink-0">
            {String(q.id).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <div className="flex gap-1.5 flex-wrap mb-2">
              <span className="tag" style={{ background: `${tBg[q.type]}18`, color: tBg[q.type] }}>{q.type}</span>
              <span className="tag" style={{ background: `${dClr[q.difficulty]}18`, color: dClr[q.difficulty] }}>{q.difficulty}</span>
              <span className="text-[9px] text-[var(--muted)]">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
            </div>
            <p className="text-[13px] text-[var(--text)] leading-relaxed whitespace-pre-wrap">{q.question}</p>

            {q.type === "MCQ" && q.options && (
              <div className="mt-3 flex flex-col gap-1.5">
                {q.options.map((opt, i) => {
                  const letter = opt[0];
                  const isSel = selected === letter;
                  const isCorr = q.correctAnswer === letter;
                  let bg = "var(--surface2)", clr = "var(--text)", bdr = "var(--border)";
                  if (revealed) {
                    if (isCorr) { bg = "rgba(52,211,153,0.08)"; clr = "#34d399"; bdr = "rgba(52,211,153,0.21)"; }
                    else if (isSel) { bg = "rgba(248,113,113,0.08)"; clr = "#f87171"; bdr = "rgba(248,113,113,0.19)"; }
                    else { bg = "transparent"; clr = "var(--muted)"; bdr = "var(--border)"; }
                  } else if (isSel) { bg = "rgba(79,142,247,0.08)"; clr = "#4f8ef7"; bdr = "rgba(79,142,247,0.21)"; }
                  return (
                    <button key={i} disabled={revealed} onClick={() => onPick(letter)}
                      className="flex items-center gap-2.5 px-3.5 py-[9px] rounded-[10px] text-left text-xs transition-all duration-150"
                      style={{ border: `1px solid ${bdr}`, background: bg, color: clr, cursor: revealed ? "default" : "pointer" }}>
                      <span className="mono w-[22px] h-[22px] rounded-md border border-current flex items-center justify-center text-[10px] font-bold opacity-70 flex-shrink-0">{letter}</span>
                      <span className="flex-1">{opt.slice(3)}</span>
                      {revealed && isCorr && <span>{"\u2713"}</span>}
                      {revealed && isSel && !isCorr && <span>{"\u2717"}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 mt-3 flex-wrap">
              {!revealed && (
                <button onClick={() => setHint(!hint)}
                  className="px-3.5 py-[5px] rounded-lg border border-[rgba(251,191,36,0.19)] bg-[rgba(251,191,36,0.06)] text-[#fbbf24] text-[11px] cursor-pointer transition-colors hover:bg-[rgba(251,191,36,0.12)]">
                  {"\u{1F4A1}"} {hint ? "Hide" : "Hint"}
                </button>
              )}
              <button onClick={onReveal} disabled={revealed}
                className="px-3.5 py-[5px] rounded-lg border border-[var(--border)] bg-[var(--surface2)] text-[11px] cursor-pointer disabled:cursor-default transition-colors"
                style={{ color: revealed ? "var(--muted)" : "var(--text)" }}>
                {revealed ? "\u2713 Revealed" : "\u{1F441} Reveal"}
              </button>
            </div>

            <AnimatePresence>
              {hint && !revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2.5 bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] rounded-[9px] px-3.5 py-[9px] text-xs text-[#fbbf24] leading-relaxed overflow-hidden">
                  {"\u{1F4A1}"} {q.hint}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex flex-col gap-2">
                  <div className="bg-[var(--surface2)] rounded-[10px] px-3.5 py-2.5 border border-[var(--border)]">
                    <p className="text-[9px] text-[#34d399] font-bold uppercase tracking-[1.5px] mb-1.5">{"\u2713"} Correct Answer</p>
                    <p className="mono text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                      {q.type === "MCQ" ? (q.options?.find((o) => o.startsWith(q.correctAnswer)) ?? q.correctAnswer) : q.correctAnswer}
                    </p>
                  </div>
                  <div className="bg-[var(--surface2)] rounded-[10px] px-3.5 py-2.5 border border-[var(--border)]">
                    <p className="text-[9px] text-brand font-bold uppercase tracking-[1.5px] mb-1.5">{"\u{1F4D6}"} Explanation</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{q.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("Python");
  const [diff, setDiff] = useState("Intermediate");
  const [loading, setLoad] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [err, setErr] = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState("All");
  const [scored, setScored] = useState(false);

  const gen = async () => {
    setErr(""); setLoad(true); setQuiz(null); setRevealed(new Set()); setAnswers({}); setScored(false); setFilter("All");
    try {
      const r = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, language: lang, difficulty: diff }), credentials: "include" });
      const d = await r.json();
      if (!d.success) throw new Error(d.error?.message || "Failed");
      setQuiz(d.data.quiz);
      recordStudySession();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  const mcqs = quiz?.questions.filter((q) => q.type === "MCQ") ?? [];
  const correct = mcqs.filter((q) => answers[q.id] === q.correctAnswer).length;
  const allDone = mcqs.length > 0 && mcqs.every((q) => answers[q.id]);
  const filtered = quiz?.questions.filter((q) => filter === "All" || q.type === filter) ?? [];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="page p-7 min-h-full">
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Quiz Generator</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1.5">
          Pick a topic {"\u2192"} get 10 AI questions: <span className="text-[#a78bfa]">MCQ</span> {"\u00B7"} <span className="text-brand">Short Answer</span> {"\u00B7"} <span className="text-[#f87171]">Coding</span>
        </p>
      </motion.div>

      {!quiz ? (
        <motion.div variants={fadeUp} className="max-w-[660px]">
          <label className="label block mb-2">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gen()}
            placeholder="e.g. Loops, Recursion, Binary Trees\u2026"
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[11px] px-4 py-[11px] text-[var(--text)] text-[13px] outline-none mb-3.5 focus:border-brand/40 transition-colors"
          />

          <div className="flex flex-wrap gap-1.5 mb-5">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => setTopic(t)}
                className="px-3.5 py-[5px] rounded-lg text-[11px] cursor-pointer border transition-all"
                style={{
                  borderColor: topic === t ? "rgba(167,139,250,0.25)" : "var(--border)",
                  background: topic === t ? "rgba(167,139,250,0.09)" : "var(--surface)",
                  color: topic === t ? "#a78bfa" : "var(--muted)",
                  fontWeight: topic === t ? 700 : 400,
                }}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[18px] mb-[18px]">
            <div>
              <label className="label block mb-2">Language</label>
              <div className="grid grid-cols-2 gap-[5px]">
                {LANGS.map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className="py-[7px] rounded-[9px] text-xs cursor-pointer border transition-all"
                    style={{
                      borderColor: lang === l ? "rgba(52,211,153,0.25)" : "var(--border)",
                      background: lang === l ? "rgba(52,211,153,0.08)" : "var(--surface)",
                      color: lang === l ? "#34d399" : "var(--muted)",
                      fontWeight: lang === l ? 700 : 400,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label block mb-2">Difficulty</label>
              <div className="flex flex-col gap-[5px]">
                {DIFFS.map(([d, e]) => (
                  <button key={d} onClick={() => setDiff(d)}
                    className="py-2 px-3.5 rounded-[9px] text-xs cursor-pointer border text-left flex items-center gap-2 transition-all"
                    style={{
                      borderColor: diff === d ? "rgba(79,142,247,0.25)" : "var(--border)",
                      background: diff === d ? "rgba(79,142,247,0.08)" : "var(--surface)",
                      color: diff === d ? "#4f8ef7" : "var(--muted)",
                      fontWeight: diff === d ? 700 : 400,
                    }}>
                    {e} {d}
                  </button>
                ))}
              </div>
            </div>
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
            onClick={gen}
            disabled={!topic.trim() || loading}
            className="btn-primary w-full py-3.5 text-[15px] flex items-center justify-center gap-2">
            {loading ? (
              <><span className="spinner w-4 h-4" />Generating{"\u2026"}</>
            ) : (
              "\u{1F9E0} Generate 10 Questions"
            )}
          </motion.button>
        </motion.div>
      ) : (
        <div>
          <motion.div variants={fadeUp} className="card rounded-[14px] p-4 px-5 mb-4">
            <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
              <div>
                <h2 className="text-[17px] font-extrabold text-[var(--text)]">{quiz.topic}</h2>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="tag">{quiz.language}</span>
                  <span className="tag">{quiz.difficulty}</span>
                  <span className="tag mono">{quiz.totalMarks} marks</span>
                </div>
              </div>
              <div className="flex gap-2">
                {[["MCQ", mcqs.length], ["Q", quiz.questions.length]].map(([l, v]) => (
                  <div key={l as string} className="text-center bg-[var(--surface2)] rounded-[10px] px-3.5 py-2">
                    <div className="mono text-lg font-extrabold text-[var(--text)]">{v}</div>
                    <div className="text-[9px] text-[var(--muted)]">{l}</div>
                  </div>
                ))}
                <button onClick={() => { setQuiz(null); setTopic(""); }}
                  className="px-3.5 py-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface2)] text-[var(--muted)] text-[11px] cursor-pointer hover:text-[var(--text)] transition-colors">
                  {"\u21A9"} New
                </button>
              </div>
            </div>

            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-[10px] px-3.5 py-2.5 flex items-center gap-3 overflow-hidden"
                  style={{
                    background: scored ? "rgba(167,139,250,0.06)" : "var(--surface2)",
                    border: `1px solid ${scored ? "rgba(167,139,250,0.19)" : "var(--border)"}`,
                  }}>
                  <span className="text-[15px]">{"\u{1F3AF}"}</span>
                  {scored ? (
                    <div>
                      <p className="text-[13px] font-bold text-[var(--text)]">
                        MCQ Score: <span className="mono text-[#a78bfa]">{correct}/{mcqs.length}</span>{" "}
                        <span className="text-[11px] text-[var(--muted)]">({Math.round((correct / mcqs.length) * 100)}%)</span>
                      </p>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        {correct === mcqs.length ? "\u{1F3C6} Perfect!" : correct >= mcqs.length * 0.7 ? "\u{1F44D} Great job!" : "\u{1F4D6} Keep practising"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-[var(--muted)]">All MCQs answered {"\u2014"} ready to see your score?</p>
                  )}
                  {!scored && (
                    <button onClick={() => { setScored(true); recordQuizResult(topic, correct, mcqs.length); }}
                      className="ml-auto px-4 py-1.5 rounded-[9px] border border-[rgba(167,139,250,0.22)] bg-[rgba(167,139,250,0.09)] text-[#a78bfa] text-xs font-bold cursor-pointer hover:bg-[rgba(167,139,250,0.15)] transition-colors">
                      Show Score
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex gap-[7px] mb-3.5 flex-wrap items-center">
            {["All", "MCQ", "ShortAnswer", "Coding"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3.5 py-[5px] rounded-[9px] text-[11px] cursor-pointer border transition-all"
                style={{
                  borderColor: filter === f ? "rgba(167,139,250,0.25)" : "var(--border)",
                  background: filter === f ? "rgba(167,139,250,0.09)" : "var(--surface)",
                  color: filter === f ? "#a78bfa" : "var(--muted)",
                  fontWeight: filter === f ? 700 : 400,
                }}>
                {f === "ShortAnswer" ? "Short Answer" : f}
              </button>
            ))}
            <button onClick={() => setRevealed(new Set(quiz.questions.map((q) => q.id)))}
              className="ml-auto px-3.5 py-[5px] rounded-[9px] border border-[var(--border)] bg-[var(--surface2)] text-[var(--muted)] text-[11px] cursor-pointer hover:text-[var(--text)] transition-colors">
              {"\u{1F441}"} Reveal All
            </button>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {filtered.map((q) => (
              <QCard
                key={q.id}
                q={q}
                revealed={revealed.has(q.id)}
                selected={answers[q.id] ?? null}
                onPick={(l) => { if (!revealed.has(q.id)) setAnswers((p) => ({ ...p, [q.id]: l })); }}
                onReveal={() => setRevealed((p) => new Set([...p, q.id]))}
              />
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
