"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

interface Result {
  hasError: boolean;
  errorType: string; errorSummary: string; conceptExplanation: string;
  hints: string[]; affectedLines: number[]; difficulty: string;
  commonMistake: string; furtherReading: string;
}

const SAMPLES: Record<string, { code: string; err: string }> = {
  python: {
    code: "def calculate_average(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i]\n    return total / len(numbers)\n\nscores = [85, 92, 78, 95, 88]\nprint(f\"Average: {calculate_avarage(scores)}\")",
    err: "NameError: name 'calculate_avarage' is not defined",
  },
  javascript: {
    code: "function findMax(arr) {\n  let max = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}\nconsole.log(findMax([3, 7, 2, 9, 1]));",
    err: "TypeError: Cannot read properties of undefined",
  },
  java: {
    code: "public class Main {\n  public static void main(String[] args) {\n    int[] nums = {10, 20, 30, 40, 50};\n    int sum = 0;\n    for (int i = 0; i <= nums.length; i++) {\n      sum += nums[i];\n    }\n    System.out.println(\"Sum: \" + sum);\n  }\n}",
    err: "ArrayIndexOutOfBoundsException: Index 5 out of bounds",
  },
};

const LANGS = ["python", "javascript", "typescript", "java", "cpp", "c", "go"];
const dStyle: Record<string, string> = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#f87171" };

export default function DebugPage() {
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoad] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [apiErr, setApiErr] = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<"exp" | "hints" | "info">("exp");

  const loadSample = () => {
    const s = SAMPLES[lang] ?? SAMPLES.python;
    setCode(s.code); setErrMsg(s.err);
    setResult(null); setRevealed(new Set());
  };

  const analyse = async () => {
    setApiErr(""); setResult(null); setLoad(true); setRevealed(new Set()); setTab("exp");
    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: lang, error: errMsg }),
        credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error?.message || "Analysis failed");
      setResult(d.data);
    } catch (e: unknown) { setApiErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  const reveal = (i: number) => setRevealed((p) => new Set([...p, i]));
  const lines = result?.affectedLines ?? [];
  const lineCount = code.split("\n").length;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="page p-7 min-h-full">
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Code Debugging Assistant</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1.5">
          Paste your code {"\u2192"} get Socratic hints & explanations. <span className="text-[#f87171] font-semibold">No solutions {"\u2014"} you fix it.</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-5">
        {/* Left: Editor */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex gap-[5px] flex-wrap">
            {LANGS.map((l) => (
              <button key={l} onClick={() => { setLang(l); setResult(null); setRevealed(new Set()); }}
                className="px-3.5 py-[5px] rounded-lg text-[11px] font-semibold cursor-pointer border transition-all"
                style={{
                  borderColor: lang === l ? "rgba(248,113,113,0.25)" : "var(--border)",
                  background: lang === l ? "rgba(248,113,113,0.06)" : "var(--surface)",
                  color: lang === l ? "#f87171" : "var(--muted)",
                }}>
                {l}
              </button>
            ))}
            <button onClick={loadSample}
              className="ml-auto px-3.5 py-[5px] rounded-lg border border-[var(--border)] bg-[var(--surface2)] text-[var(--muted)] text-[11px] cursor-pointer hover:text-[var(--text)] transition-colors">
              {"\u{1F41B}"} Sample
            </button>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d1117]">
            <div className="w-[38px] bg-[#0d1117] border-r border-[var(--border)] py-3.5 flex-shrink-0 select-none">
              {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1).map((n) => (
                <div key={n} className="h-[22px] pr-2 text-right text-[11px] mono leading-[22px]"
                  style={{
                    color: lines.includes(n) ? "#f87171" : "#2a3a55",
                    background: lines.includes(n) ? "rgba(248,113,113,0.07)" : "transparent",
                  }}>
                  {n}
                </div>
              ))}
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false}
              className="flex-1 bg-transparent border-none outline-none p-3.5 text-[#c9d8f0] text-[13px] leading-[22px] resize-none min-h-[320px] mono"
              placeholder={`// Paste your ${lang} code here\u2026`}
            />
          </div>

          <textarea value={errMsg} onChange={(e) => setErrMsg(e.target.value)} rows={3} spellCheck={false}
            placeholder="Error message / traceback (optional)\u2026"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 text-[#f87171] text-xs leading-relaxed resize-none outline-none mono focus:border-[rgba(248,113,113,0.3)] transition-colors"
          />

          {apiErr && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.19)] rounded-[10px] px-3.5 py-2.5 text-xs text-[#f87171]">
              {apiErr}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={analyse}
            disabled={!code.trim() || loading}
            className="py-3.5 rounded-xl border-none cursor-pointer text-white text-[15px] font-bold flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #f87171, #fbbf24)" }}>
            {loading ? (
              <><span className="spinner w-4 h-4" /> Analysing{"\u2026"}</>
            ) : (
              "\u{1F50D} Analyse Code"
            )}
          </motion.button>

          <div className="card rounded-[10px] px-3.5 py-2.5">
            <p className="text-[11px] text-[var(--muted)]">
              <span className="text-[#f87171] font-bold">Socratic rule:</span> This tool explains concepts and guides you {"\u2014"} it never writes the fix for you.
            </p>
          </div>
        </motion.div>

        {/* Right: Result */}
        <motion.div variants={fadeUp}>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[480px] gap-3.5 card rounded-2xl">
              <div className="text-[40px]">{"\u{1F50D}"}</div>
              <p className="text-sm font-bold text-[var(--text)]">Debug output appears here</p>
              <p className="text-xs text-[var(--muted)]">Paste code on the left and click Analyse</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[480px] gap-3 card rounded-2xl">
              <span className="spinner w-9 h-9" />
              <p className="text-[13px] font-bold text-[var(--text)]">Analysing your code{"\u2026"}</p>
              {["Detecting error type", "Building explanation", "Crafting hints"].map((s, i) => (
                <motion.span key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
                  className="text-[11px] text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] rounded-full px-3.5 py-1">
                  {s}
                </motion.span>
              ))}
            </div>
          )}

          {/* Code is CORRECT */}
          <AnimatePresence>
            {result && !result.hasError && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <div className="bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.19)] rounded-[14px] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[42px] h-[42px] rounded-xl bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.19)] flex items-center justify-center text-xl">{"\u2705"}</div>
                    <div>
                      <p className="text-[9px] text-[#34d399] uppercase tracking-[2px] font-bold">No Bugs Found</p>
                      <p className="text-[15px] font-extrabold text-[#34d399] mt-0.5">Code looks correct!</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-[var(--text)] leading-[1.7]">{result.errorSummary}</p>
                </div>

                {result.conceptExplanation && (
                  <div className="card rounded-[14px] p-5 flex flex-col gap-3">
                    <div>
                      <p className="label mb-2">{"\u{1F4A1}"} Concept</p>
                      <p className="text-[13px] text-[var(--text)] leading-[1.7]">{result.conceptExplanation}</p>
                    </div>
                    {result.hints.length > 0 && (
                      <div className="border-t border-[var(--border)] pt-3">
                        <p className="text-[9px] text-brand uppercase tracking-[2px] font-bold mb-2">{"\u{1F680}"} Ways to improve</p>
                        {result.hints.map((h, i) => (
                          <div key={i} className="flex gap-2.5 items-start mb-2">
                            <span className="w-5 h-5 rounded-md bg-brand/[0.1] flex items-center justify-center text-[10px] font-bold text-brand flex-shrink-0 mono">{i + 1}</span>
                            <p className="text-xs text-[var(--muted)] leading-relaxed">{h}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.furtherReading && (
                      <div className="bg-[rgba(167,139,250,0.04)] border border-[rgba(167,139,250,0.12)] rounded-[10px] px-3.5 py-2.5 flex gap-2">
                        <span>{"\u{1F4D6}"}</span>
                        <div>
                          <p className="text-[9px] text-[#a78bfa] font-bold uppercase tracking-[1px]">Review This Topic</p>
                          <p className="text-xs text-[var(--text)] mt-0.5">{result.furtherReading}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bugs found */}
          <AnimatePresence>
            {result && result.hasError && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <div className="card rounded-[14px] p-5">
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.19)] flex items-center justify-center text-lg flex-shrink-0">{"\u{1F41B}"}</div>
                    <div className="flex-1">
                      <p className="text-[9px] text-[var(--muted)] uppercase tracking-[2px] font-bold">Error Detected</p>
                      <p className="text-[15px] font-extrabold text-[#f87171] mt-0.5 mono">{result.errorType}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: `${dStyle[result.difficulty] ?? "#888"}18`,
                        color: dStyle[result.difficulty] ?? "#888",
                        border: `1px solid ${dStyle[result.difficulty] ?? "#888"}35`,
                      }}>
                      {result.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed">{result.errorSummary}</p>
                  {lines.length > 0 && (
                    <div className="mt-2.5 flex gap-1.5 flex-wrap">
                      {lines.map((l) => (
                        <span key={l} className="text-[10px] text-[#f87171] bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.19)] px-2.5 py-0.5 rounded-md mono">Line {l}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-[11px] p-1 gap-1">
                  {([["exp", "\u{1F4A1} Explanation"], ["hints", "\u{1F5DD} Hints"], ["info", "\u{1F4CB} Details"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)}
                      className="flex-1 py-[7px] rounded-lg text-xs cursor-pointer border transition-all"
                      style={{
                        borderColor: tab === k ? "rgba(248,113,113,0.19)" : "transparent",
                        background: tab === k ? "rgba(248,113,113,0.05)" : "transparent",
                        color: tab === k ? "#f87171" : "var(--muted)",
                        fontWeight: tab === k ? 700 : 400,
                      }}>
                      {l}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "exp" && (
                    <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="card rounded-[14px] p-5 flex flex-col gap-3.5">
                      <div>
                        <p className="label mb-2">Concept</p>
                        <p className="text-[13px] text-[var(--text)] leading-[1.7]">{result.conceptExplanation}</p>
                      </div>
                      <div className="border-t border-[var(--border)] pt-3.5">
                        <p className="text-[9px] text-[#fbbf24] uppercase tracking-[2px] font-bold mb-2">Why beginners make this mistake</p>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">{result.commonMistake}</p>
                      </div>
                      <div className="bg-[rgba(167,139,250,0.04)] border border-[rgba(167,139,250,0.12)] rounded-[10px] px-3.5 py-2.5 flex gap-2">
                        <span>{"\u{1F4D6}"}</span>
                        <div>
                          <p className="text-[9px] text-[#a78bfa] font-bold uppercase tracking-[1px]">Review This Topic</p>
                          <p className="text-xs text-[var(--text)] mt-0.5">{result.furtherReading}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "hints" && (
                    <motion.div key="hints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col gap-2">
                      <p className="text-[11px] text-[var(--muted)] pl-0.5">Reveal hints one at a time. Try to fix the bug before opening the next.</p>
                      {result.hints.map((h, i) => (
                        <div key={i} className="card rounded-xl overflow-hidden"
                          style={{ borderColor: revealed.has(i) ? "rgba(251,191,36,0.22)" : undefined }}>
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-7 h-7 rounded-lg mono flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{
                                background: revealed.has(i) ? "rgba(251,191,36,0.1)" : "var(--surface2)",
                                color: revealed.has(i) ? "#fbbf24" : "var(--muted)",
                              }}>
                              {i + 1}
                            </div>
                            {revealed.has(i)
                              ? <p className="flex-1 text-[13px] text-[var(--text)] leading-relaxed">{h}</p>
                              : <p className="flex-1 text-[13px] text-[var(--muted)] italic">Hint {i + 1} hidden{"\u2026"}</p>}
                            {!revealed.has(i) && (
                              <button onClick={() => reveal(i)} disabled={i > 0 && !revealed.has(i - 1)}
                                className="px-3.5 py-[5px] rounded-lg border border-[rgba(251,191,36,0.19)] bg-[rgba(251,191,36,0.06)] text-[#fbbf24] text-[11px] font-bold cursor-pointer disabled:opacity-35 transition-colors hover:bg-[rgba(251,191,36,0.12)]">
                                {i > 0 && !revealed.has(i - 1) ? "\u{1F512}" : "Reveal"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-[var(--muted)] text-center pt-1">Hints unlock in order {"\u2014"} work through each one before moving on</p>
                    </motion.div>
                  )}

                  {tab === "info" && (
                    <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="card rounded-[14px] p-5 flex flex-col gap-3.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        {[["Language", lang], ["Error Type", result.errorType], ["Difficulty", result.difficulty], ["Hints", `${result.hints.length} available`]].map(([l, v]) => (
                          <div key={l} className="bg-[var(--surface2)] rounded-[10px] px-3.5 py-2.5 border border-[var(--border)]">
                            <p className="text-[9px] text-[var(--muted)] uppercase tracking-[1.5px]">{l}</p>
                            <p className="text-[13px] font-bold text-[var(--text)] mt-1">{v}</p>
                          </div>
                        ))}
                      </div>
                      {lines.length > 0 && (
                        <div className="bg-[rgba(248,113,113,0.03)] border border-[rgba(248,113,113,0.12)] rounded-[10px] px-3.5 py-2.5">
                          <p className="text-[9px] text-[#f87171] font-bold uppercase tracking-[1.5px] mb-2">Flagged Lines</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {lines.map((l) => (
                              <span key={l} className="text-[11px] text-[#f87171] bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.19)] px-3 py-0.5 rounded-lg mono">Line {l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
