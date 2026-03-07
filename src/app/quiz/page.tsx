"use client";
import { useState } from "react";

interface Q {
  id: number;
  type: "MCQ" | "ShortAnswer" | "Coding";
  question: string;
  difficulty: string;
  marks: number;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  hint: string;
}
interface Quiz {
  topic: string;
  language: string;
  difficulty: string;
  totalMarks: number;
  questions: Q[];
}

const TOPICS = ["Loops","Functions","Arrays","Recursion","OOP","Sorting","Linked Lists","Trees","SQL","REST APIs","Error Handling","File I/O"];
const LANGS  = ["Python","JavaScript","Java","C++","TypeScript","Go","C"];
const DIFFS  = [["Beginner","🟢"],["Intermediate","🟡"],["Advanced","🔴"]] as const;

const TYPE_COLOR: Record<string,string> = { MCQ:"#a78bfa", ShortAnswer:"#4f8ef7", Coding:"#f87171" };
const DIFF_COLOR: Record<string,string> = { Easy:"#34d399", Medium:"#fbbf24", Hard:"#f87171" };

// Always assign A/B/C/D by index — never trust opt[0]
function getLetter(index: number) { return String.fromCharCode(65 + index); }

// Normalize AI correctAnswer to single uppercase letter
function normalizeAnswer(ca: string) { return ca?.trim().replace(/[).:\s].*/,"").toUpperCase().charAt(0); }

function QCard({ q, revealed, selected, onPick, onReveal }: {
  q: Q; revealed: boolean; selected: string | null;
  onPick: (l: string) => void; onReveal: () => void;
}) {
  const [hint, setHint] = useState(false);
  const correctLetter = normalizeAnswer(q.correctAnswer);

  return (
    <div style={{
      background:"var(--surface)",
      border:`1px solid ${revealed ? "rgba(52,211,153,0.2)" : "var(--border)"}`,
      borderRadius:14, overflow:"hidden"
    }}>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex", alignItems:"flex-start", gap:12}}>

          {/* Question number */}
          <span style={{
            width:32, height:32, borderRadius:9, background:"var(--surface2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:700, color:"var(--muted)", flexShrink:0, fontFamily:"monospace"
          }}>{String(q.id).padStart(2,"0")}</span>

          <div style={{flex:1}}>
            {/* Badges */}
            <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:8}}>
              <span style={{
                fontSize:9, padding:"2px 9px", borderRadius:20,
                background:`${TYPE_COLOR[q.type]}20`, color:TYPE_COLOR[q.type],
                fontWeight:700, textTransform:"uppercase", letterSpacing:1
              }}>{q.type}</span>
              <span style={{
                fontSize:9, padding:"2px 9px", borderRadius:20,
                background:`${DIFF_COLOR[q.difficulty] ?? "#888"}20`,
                color:DIFF_COLOR[q.difficulty] ?? "#888",
                fontWeight:700, textTransform:"uppercase", letterSpacing:1
              }}>{q.difficulty}</span>
              <span style={{fontSize:9, color:"var(--muted)"}}>{q.marks} mark{q.marks>1?"s":""}</span>
            </div>

            {/* Question text */}
            <p style={{fontSize:13, color:"var(--text)", lineHeight:1.6, whiteSpace:"pre-wrap", marginBottom:0}}>
              {q.question}
            </p>

            {/* MCQ Options */}
            {q.type === "MCQ" && Array.isArray(q.options) && q.options.length > 0 && (
              <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:6}}>
                {q.options.map((opt, i) => {
                  // Always use index-based letter A/B/C/D
                  const letter = getLetter(i);
                  const isSel  = selected === letter;
                  const isCorr = correctLetter === letter;

                  // Strip existing prefix like "A) " or "A. " from display text
                  const displayText = opt.replace(/^[A-Da-d][).:\s]+/, "").trim() || opt;

                  let bg  = "var(--surface2)";
                  let clr = "var(--text)";
                  let bdr = "var(--border)";

                  if (revealed) {
                    if (isCorr)          { bg="rgba(52,211,153,0.1)";  clr="#34d399"; bdr="rgba(52,211,153,0.3)"; }
                    else if (isSel)      { bg="rgba(248,113,113,0.1)"; clr="#f87171"; bdr="rgba(248,113,113,0.3)"; }
                    else                 { bg="transparent"; clr="var(--muted)"; bdr="var(--border)"; }
                  } else if (isSel)      { bg="rgba(79,142,247,0.1)";  clr="#4f8ef7"; bdr="rgba(79,142,247,0.3)"; }

                  return (
                    <button
                      key={i}
                      disabled={revealed}
                      onClick={() => onPick(letter)}
                      style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"9px 14px", borderRadius:10,
                        border:`1px solid ${bdr}`, background:bg, color:clr,
                        cursor:revealed ? "default" : "pointer",
                        textAlign:"left", fontSize:12, transition:"all .12s",
                        width:"100%", fontFamily:"inherit"
                      }}
                    >
                      <span style={{
                        width:22, height:22, borderRadius:6,
                        border:"1px solid currentColor",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:700, flexShrink:0, fontFamily:"monospace"
                      }}>{letter}</span>
                      <span style={{flex:1}}>{displayText}</span>
                      {revealed && isCorr && <span style={{fontWeight:700, color:"#34d399"}}>✓</span>}
                      {revealed && isSel && !isCorr && <span style={{fontWeight:700, color:"#f87171"}}>✗</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
              {!revealed && (
                <button
                  onClick={() => setHint(!hint)}
                  style={{
                    padding:"5px 13px", borderRadius:8,
                    border:"1px solid rgba(251,191,36,0.3)",
                    background:"rgba(251,191,36,0.08)",
                    color:"#fbbf24", fontSize:11, cursor:"pointer", fontFamily:"inherit"
                  }}
                >💡 {hint ? "Hide" : "Hint"}</button>
              )}
              <button
                onClick={onReveal}
                disabled={revealed}
                style={{
                  padding:"5px 13px", borderRadius:8,
                  border:"1px solid var(--border)", background:"var(--surface2)",
                  color:revealed ? "var(--muted)" : "var(--text)",
                  fontSize:11, cursor:revealed ? "default" : "pointer", fontFamily:"inherit"
                }}
              >{revealed ? "✓ Revealed" : "👁 Reveal"}</button>
            </div>

            {/* Hint box */}
            {hint && !revealed && (
              <div style={{
                marginTop:10, background:"rgba(251,191,36,0.06)",
                border:"1px solid rgba(251,191,36,0.2)",
                borderRadius:9, padding:"9px 13px", fontSize:12, color:"#fbbf24", lineHeight:1.6
              }}>💡 {q.hint}</div>
            )}

            {/* Revealed answer + explanation */}
            {revealed && (
              <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8}}>
                <div style={{background:"var(--surface2)", borderRadius:10, padding:"10px 14px", border:"1px solid var(--border)"}}>
                  <p style={{fontSize:9, color:"#34d399", fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:6}}>✓ Correct Answer</p>
                  <p style={{fontSize:12, color:"var(--text)", whiteSpace:"pre-wrap", lineHeight:1.6, fontFamily:"monospace"}}>
                    {q.type === "MCQ"
                      ? (q.options?.find((_,i) => getLetter(i) === correctLetter) ?? q.correctAnswer)
                      : q.correctAnswer}
                  </p>
                </div>
                <div style={{background:"var(--surface2)", borderRadius:10, padding:"10px 14px", border:"1px solid var(--border)"}}>
                  <p style={{fontSize:9, color:"#4f8ef7", fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:6}}>📖 Explanation</p>
                  <p style={{fontSize:12, color:"var(--muted)", lineHeight:1.6}}>{q.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const [topic,    setTopic]    = useState("");
  const [lang,     setLang]     = useState("Python");
  const [diff,     setDiff]     = useState("Intermediate");
  const [loading,  setLoading]  = useState(false);
  const [quiz,     setQuiz]     = useState<Quiz | null>(null);
  const [err,      setErr]      = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [answers,  setAnswers]  = useState<Record<number,string>>({});
  const [filter,   setFilter]   = useState("All");
  const [scored,   setScored]   = useState(false);

  const generate = async () => {
    setErr(""); setLoading(true); setQuiz(null);
    setRevealed(new Set()); setAnswers({}); setScored(false); setFilter("All");
    try {
      const res  = await fetch("/api/quiz", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ topic, language:lang, difficulty:diff }),
        credentials:"include"
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || "Failed to generate quiz");
      setQuiz(data.data.quiz);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const mcqs     = quiz?.questions.filter(q => q.type === "MCQ") ?? [];
  const answered = mcqs.filter(q => answers[q.id] !== undefined);
  const correct  = mcqs.filter(q => answers[q.id] === normalizeAnswer(q.correctAnswer)).length;
  const wrong    = answered.length - correct;
  const allDone  = mcqs.length > 0 && mcqs.every(q => answers[q.id] !== undefined);
  const filtered = quiz?.questions.filter(q => filter === "All" || q.type === filter) ?? [];

  return (
    <div style={{padding:"28px 32px", background:"var(--bg)", minHeight:"100%"}}>

      {/* Page title */}
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22, fontWeight:800, color:"var(--text)", letterSpacing:"-0.5px"}}>Quiz Generator</h1>
        <p style={{fontSize:13, color:"var(--muted)", marginTop:4}}>Pick a topic → get 10 AI questions: MCQ · Short Answer · Coding</p>
      </div>

      {!quiz ? (
        /* ── Setup form ── */
        <div style={{maxWidth:660}}>
          <label style={{fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, display:"block", marginBottom:8}}>Topic</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && topic.trim() && generate()}
            placeholder="e.g. Loops, Recursion, Binary Trees…"
            style={{
              width:"100%", background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:11, padding:"11px 16px", color:"var(--text)", fontSize:13,
              outline:"none", marginBottom:14, fontFamily:"inherit"
            }}
          />

          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:20}}>
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)} style={{
                padding:"5px 14px", borderRadius:8, fontSize:11, cursor:"pointer", fontFamily:"inherit",
                border:`1px solid ${topic===t ? "rgba(167,139,250,0.5)" : "var(--border)"}`,
                background:topic===t ? "rgba(167,139,250,0.15)" : "var(--surface)",
                color:topic===t ? "#a78bfa" : "var(--muted)", fontWeight:topic===t ? 700 : 400
              }}>{t}</button>
            ))}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18}}>
            <div>
              <label style={{fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, display:"block", marginBottom:8}}>Language</label>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:5}}>
                {LANGS.map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    padding:"7px", borderRadius:9, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                    border:`1px solid ${lang===l ? "rgba(52,211,153,0.4)" : "var(--border)"}`,
                    background:lang===l ? "rgba(52,211,153,0.12)" : "var(--surface)",
                    color:lang===l ? "#34d399" : "var(--muted)", fontWeight:lang===l ? 700 : 400
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, display:"block", marginBottom:8}}>Difficulty</label>
              <div style={{display:"flex", flexDirection:"column", gap:5}}>
                {DIFFS.map(([d, e]) => (
                  <button key={d} onClick={() => setDiff(d)} style={{
                    padding:"8px 14px", borderRadius:9, fontSize:12, cursor:"pointer",
                    fontFamily:"inherit", textAlign:"left", display:"flex", alignItems:"center", gap:8,
                    border:`1px solid ${diff===d ? "rgba(79,142,247,0.4)" : "var(--border)"}`,
                    background:diff===d ? "rgba(79,142,247,0.12)" : "var(--surface)",
                    color:diff===d ? "#4f8ef7" : "var(--muted)", fontWeight:diff===d ? 700 : 400
                  }}>{e} {d}</button>
                ))}
              </div>
            </div>
          </div>

          {err && (
            <div style={{background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#f87171", marginBottom:12}}>
              {err}
            </div>
          )}

          <button
            onClick={generate}
            disabled={!topic.trim() || loading}
            style={{
              width:"100%", padding:"13px", borderRadius:12, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#a78bfa,#4f8ef7)", color:"#fff",
              fontSize:14, fontWeight:700, fontFamily:"inherit",
              opacity:!topic.trim() || loading ? 0.5 : 1,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8
            }}
          >
            {loading ? (
              <>
                <span style={{width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite"}}/>
                Generating…
              </>
            ) : "🧠 Generate 10 Questions"}
          </button>
        </div>

      ) : (
        /* ── Quiz view ── */
        <div>

          {/* Header with LIVE score */}
          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", marginBottom:16}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:12}}>
              <div>
                <h2 style={{fontSize:17, fontWeight:800, color:"var(--text)"}}>{quiz.topic}</h2>
                <div style={{display:"flex", gap:8, marginTop:6, flexWrap:"wrap"}}>
                  <span style={{fontSize:10, background:"var(--surface2)", padding:"2px 10px", borderRadius:20, color:"var(--muted)"}}>{quiz.language}</span>
                  <span style={{fontSize:10, background:"var(--surface2)", padding:"2px 10px", borderRadius:20, color:"var(--muted)"}}>{quiz.difficulty}</span>
                  <span style={{fontSize:10, background:"var(--surface2)", padding:"2px 10px", borderRadius:20, color:"var(--muted)", fontFamily:"monospace"}}>{quiz.totalMarks} marks</span>
                </div>
              </div>

              {/* Score counters */}
              <div style={{display:"flex", gap:8, alignItems:"center"}}>
                <div style={{textAlign:"center", background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:10, padding:"8px 16px"}}>
                  <div style={{fontSize:20, fontWeight:800, color:"#34d399", fontFamily:"monospace"}}>{correct}</div>
                  <div style={{fontSize:9, color:"#34d399", fontWeight:700}}>✓ RIGHT</div>
                </div>
                <div style={{textAlign:"center", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"8px 16px"}}>
                  <div style={{fontSize:20, fontWeight:800, color:"#f87171", fontFamily:"monospace"}}>{wrong}</div>
                  <div style={{fontSize:9, color:"#f87171", fontWeight:700}}>✗ WRONG</div>
                </div>
                <div style={{textAlign:"center", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 16px"}}>
                  <div style={{fontSize:20, fontWeight:800, color:"var(--text)", fontFamily:"monospace"}}>{quiz.questions.length}</div>
                  <div style={{fontSize:9, color:"var(--muted)"}}>TOTAL</div>
                </div>
                <button
                  onClick={() => { setQuiz(null); setTopic(""); }}
                  style={{padding:"6px 14px", borderRadius:10, border:"1px solid var(--border)", background:"var(--surface2)", color:"var(--muted)", fontSize:11, cursor:"pointer", fontFamily:"inherit"}}
                >↩ New</button>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{background:"var(--surface2)", borderRadius:99, height:5, overflow:"hidden", marginBottom: allDone ? 12 : 0}}>
              <div style={{
                height:"100%", borderRadius:99,
                background:"linear-gradient(90deg,#34d399,#4f8ef7)",
                width:`${mcqs.length > 0 ? (answered.length / mcqs.length) * 100 : 0}%`,
                transition:"width 0.3s ease"
              }}/>
            </div>

            {/* Final score banner */}
            {allDone && (
              <div style={{
                background:scored ? "rgba(167,139,250,0.1)" : "var(--surface2)",
                border:`1px solid ${scored ? "rgba(167,139,250,0.3)" : "var(--border)"}`,
                borderRadius:10, padding:"10px 14px",
                display:"flex", alignItems:"center", gap:12, marginTop:12
              }}>
                <span style={{fontSize:15}}>🎯</span>
                {scored ? (
                  <div>
                    <p style={{fontSize:13, fontWeight:700, color:"var(--text)"}}>
                      Final Score: <span style={{color:"#a78bfa", fontFamily:"monospace"}}>{correct}/{mcqs.length}</span>
                      <span style={{fontSize:11, color:"var(--muted)", marginLeft:8}}>({Math.round(correct/mcqs.length*100)}%)</span>
                    </p>
                    <p style={{fontSize:11, color:"var(--muted)", marginTop:2}}>
                      {correct===mcqs.length ? "🏆 Perfect!" : correct>=mcqs.length*0.7 ? "👍 Great job!" : "📖 Keep practising"}
                    </p>
                  </div>
                ) : (
                  <p style={{fontSize:13, color:"var(--muted)"}}>All MCQs answered — ready to see your score?</p>
                )}
                {!scored && (
                  <button
                    onClick={() => setScored(true)}
                    style={{
                      marginLeft:"auto", padding:"6px 16px", borderRadius:9,
                      border:"1px solid rgba(167,139,250,0.35)",
                      background:"rgba(167,139,250,0.15)",
                      color:"#a78bfa", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit"
                    }}
                  >Show Score</button>
                )}
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{display:"flex", gap:7, marginBottom:14, flexWrap:"wrap", alignItems:"center"}}>
            {["All","MCQ","ShortAnswer","Coding"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"5px 14px", borderRadius:9, fontFamily:"inherit",
                border:`1px solid ${filter===f ? "rgba(167,139,250,0.4)" : "var(--border)"}`,
                background:filter===f ? "rgba(167,139,250,0.15)" : "var(--surface)",
                color:filter===f ? "#a78bfa" : "var(--muted)",
                fontSize:11, fontWeight:filter===f ? 700 : 400, cursor:"pointer"
              }}>{f==="ShortAnswer" ? "Short Answer" : f}</button>
            ))}
            <button
              onClick={() => setRevealed(new Set(quiz.questions.map(q => q.id)))}
              style={{marginLeft:"auto", padding:"5px 14px", borderRadius:9, border:"1px solid var(--border)", background:"var(--surface2)", color:"var(--muted)", fontSize:11, cursor:"pointer", fontFamily:"inherit"}}
            >👁 Reveal All</button>
          </div>

          {/* Question cards */}
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {filtered.map(q => (
              <QCard
                key={q.id}
                q={q}
                revealed={revealed.has(q.id)}
                selected={answers[q.id] ?? null}
                onPick={l => { if (!revealed.has(q.id)) setAnswers(prev => ({...prev, [q.id]: l})); }}
                onReveal={() => setRevealed(prev => new Set([...prev, q.id]))}
              />
            ))}
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
