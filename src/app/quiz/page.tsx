"use client";
import { useState } from "react";

interface Q { id:number; type:"MCQ"|"ShortAnswer"|"Coding"; question:string; difficulty:string; marks:number; options:string[]|null; correctAnswer:string; explanation:string; hint:string; }
interface Quiz { topic:string; language:string; difficulty:string; totalMarks:number; questions:Q[]; }

const TOPICS   = ["Loops","Functions","Arrays","Recursion","OOP","Sorting","Linked Lists","Trees","SQL","REST APIs","Error Handling","File I/O"];
const LANGS    = ["Python","JavaScript","Java","C++","TypeScript","Go","C"];
const DIFFS    = [["Beginner","🟢"],["Intermediate","🟡"],["Advanced","🔴"]] as const;

const dClr:Record<string,string> = { Easy:"#34d399",Medium:"#fbbf24",Hard:"#f87171" };
const tBg: Record<string,string> = { MCQ:"#a78bfa",ShortAnswer:"#4f8ef7",Coding:"#f87171" };

function QCard({q,revealed,selected,onPick,onReveal}:{q:Q;revealed:boolean;selected:string|null;onPick:(l:string)=>void;onReveal:()=>void;}) {
  const [hint, setHint] = useState(false);
  return (
    <div style={{background:"var(--surface)",border:`1px solid ${revealed?"#34d39930":"var(--border)"}`,borderRadius:14,overflow:"hidden"}}>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <span className="mono" style={{width:32,height:32,borderRadius:9,background:"var(--surface2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--muted)",flexShrink:0}}>{String(q.id).padStart(2,"0")}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:9,padding:"2px 9px",borderRadius:20,background:`${tBg[q.type]}18`,color:tBg[q.type],fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{q.type}</span>
              <span style={{fontSize:9,padding:"2px 9px",borderRadius:20,background:`${dClr[q.difficulty]}18`,color:dClr[q.difficulty],fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{q.difficulty}</span>
              <span style={{fontSize:9,color:"var(--muted)"}}>{q.marks} mark{q.marks>1?"s":""}</span>
            </div>
            <p style={{fontSize:13,color:"var(--text)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{q.question}</p>

            {/* MCQ options */}
            {q.type==="MCQ" && q.options && (
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
                {q.options.map((opt,i)=>{
                  const letter=opt[0];
                  const isSel   = selected===letter;
                  const isCorr  = q.correctAnswer===letter;
                  let bg="var(--surface2)"; let clr="var(--text)"; let bdr="var(--border)";
                  if (revealed) {
                    if (isCorr) { bg="#34d39915";clr="#34d399";bdr="#34d39935"; }
                    else if (isSel) { bg="#f8717115";clr="#f87171";bdr="#f8717130"; }
                    else { bg="transparent";clr="var(--muted)";bdr="var(--border)"; }
                  } else if (isSel) { bg="#4f8ef715";clr="#4f8ef7";bdr="#4f8ef735"; }
                  return (
                    <button key={i} disabled={revealed} onClick={()=>onPick(letter)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:10,border:`1px solid ${bdr}`,background:bg,color:clr,cursor:revealed?"default":"pointer",textAlign:"left",fontSize:12,transition:"all .12s"}}>
                      <span className="mono" style={{width:22,height:22,borderRadius:6,border:`1px solid currentColor`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,opacity:.7,flexShrink:0}}>{letter}</span>
                      <span style={{flex:1}}>{opt.slice(3)}</span>
                      {revealed && isCorr && <span>✓</span>}
                      {revealed && isSel && !isCorr && <span>✗</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
              {!revealed && <button onClick={()=>setHint(!hint)} style={{padding:"5px 13px",borderRadius:8,border:"1px solid #fbbf24 30",background:"#fbbf24 10",color:"#fbbf24",fontSize:11,cursor:"pointer"}}>💡 {hint?"Hide":"Hint"}</button>}
              <button onClick={onReveal} disabled={revealed} style={{padding:"5px 13px",borderRadius:8,border:"1px solid var(--border)",background:"var(--surface2)",color:revealed?"var(--muted)":"var(--text)",fontSize:11,cursor:revealed?"default":"pointer"}}>
                {revealed?"✓ Revealed":"👁 Reveal"}
              </button>
            </div>

            {hint && !revealed && (
              <div style={{marginTop:10,background:"#fbbf24 08",border:"1px solid #fbbf24 25",borderRadius:9,padding:"9px 13px",fontSize:12,color:"#fbbf24",lineHeight:1.6}}>
                💡 {q.hint}
              </div>
            )}

            {revealed && (
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{background:"var(--surface2)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--border)"}}>
                  <p style={{fontSize:9,color:"#34d399",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>✓ Correct Answer</p>
                  <p className="mono" style={{fontSize:12,color:"var(--text)",whiteSpace:"pre-wrap",lineHeight:1.6}}>
                    {q.type==="MCQ" ? (q.options?.find(o=>o.startsWith(q.correctAnswer))??q.correctAnswer) : q.correctAnswer}
                  </p>
                </div>
                <div style={{background:"var(--surface2)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--border)"}}>
                  <p style={{fontSize:9,color:"#4f8ef7",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>📖 Explanation</p>
                  <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{q.explanation}</p>
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
  const [topic,   setTopic]   = useState("");
  const [lang,    setLang]    = useState("Python");
  const [diff,    setDiff]    = useState("Intermediate");
  const [loading, setLoad]    = useState(false);
  const [quiz,    setQuiz]    = useState<Quiz|null>(null);
  const [err,     setErr]     = useState("");
  const [revealed,setRevealed]= useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<number,string>>({});
  const [filter,  setFilter]  = useState("All");
  const [scored,  setScored]  = useState(false);

  const gen = async () => {
    setErr(""); setLoad(true); setQuiz(null); setRevealed(new Set()); setAnswers({}); setScored(false); setFilter("All");
    try {
      const r = await fetch("/api/quiz",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic,language:lang,difficulty:diff}),credentials:"include"});
      const d = await r.json();
      if (!d.success) throw new Error(d.error?.message||"Failed");
      setQuiz(d.data.quiz);
    } catch(e:unknown) { setErr(e instanceof Error?e.message:"Error"); }
    finally { setLoad(false); }
  };

  const mcqs   = quiz?.questions.filter(q=>q.type==="MCQ") ?? [];
  const correct= mcqs.filter(q=>answers[q.id]===q.correctAnswer).length;
  const allDone= mcqs.length>0 && mcqs.every(q=>answers[q.id]);
  const filtered= quiz?.questions.filter(q=>filter==="All"||q.type===filter) ?? [];

  return (
    <div style={{padding:"28px 32px",background:"var(--bg)",minHeight:"100%"}}>
      <div className="fu" style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:"var(--text)",letterSpacing:"-.5px"}}>Quiz Generator</h1>
        <p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>Pick a topic → get 10 AI questions: MCQ · Short Answer · Coding</p>
      </div>

      {!quiz ? (
        <div style={{maxWidth:660}}>
          {/* Topic input */}
          <label style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,display:"block",marginBottom:8}}>Topic</label>
          <input value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==="Enter"&&gen()}
            placeholder="e.g. Loops, Recursion, Binary Trees…"
            style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:11,padding:"11px 16px",color:"var(--text)",fontSize:13,outline:"none",marginBottom:14}}
          />

          {/* Quick topics */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:20}}>
            {TOPICS.map(t=>(
              <button key={t} onClick={()=>setTopic(t)}
                style={{padding:"5px 14px",borderRadius:8,fontSize:11,cursor:"pointer",border:`1px solid ${topic===t?"#a78bfa 40":"var(--border)"}`,background:topic===t?"#a78bfa 15":"var(--surface)",color:topic===t?"#a78bfa":"var(--muted)",fontWeight:topic===t?700:400}}>
                {t}
              </button>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
            <div>
              <label style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,display:"block",marginBottom:8}}>Language</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {LANGS.map(l=>(
                  <button key={l} onClick={()=>setLang(l)}
                    style={{padding:"7px",borderRadius:9,fontSize:12,cursor:"pointer",border:`1px solid ${lang===l?"#34d39940":"var(--border)"}`,background:lang===l?"#34d39915":"var(--surface)",color:lang===l?"#34d399":"var(--muted)",fontWeight:lang===l?700:400}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,display:"block",marginBottom:8}}>Difficulty</label>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {DIFFS.map(([d,e])=>(
                  <button key={d} onClick={()=>setDiff(d)}
                    style={{padding:"8px 14px",borderRadius:9,fontSize:12,cursor:"pointer",border:`1px solid ${diff===d?"#4f8ef740":"var(--border)"}`,background:diff===d?"#4f8ef715":"var(--surface)",color:diff===d?"#4f8ef7":"var(--muted)",fontWeight:diff===d?700:400,textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                    {e} {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {err && <div style={{background:"#f8717110",border:"1px solid #f8717130",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#f87171",marginBottom:12}}>{err}</div>}

          <button onClick={gen} disabled={!topic.trim()||loading}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#a78bfa,#4f8ef7)",color:"#fff",fontSize:14,fontWeight:700,opacity:!topic.trim()||loading?.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><span className="spin" style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>Generating…</>:"🧠 Generate 10 Questions"}
          </button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 20px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:allDone&&!scored?12:0}}>
              <div>
                <h2 style={{fontSize:17,fontWeight:800,color:"var(--text)"}}>{quiz.topic}</h2>
                <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,background:"var(--surface2)",padding:"2px 10px",borderRadius:20,color:"var(--muted)"}}>{quiz.language}</span>
                  <span style={{fontSize:10,background:"var(--surface2)",padding:"2px 10px",borderRadius:20,color:"var(--muted)"}}>{quiz.difficulty}</span>
                  <span className="mono" style={{fontSize:10,background:"var(--surface2)",padding:"2px 10px",borderRadius:20,color:"var(--muted)"}}>{quiz.totalMarks} marks</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[["MCQ",mcqs.length],["Q",quiz.questions.length]].map(([l,v])=>(
                  <div key={l} style={{textAlign:"center",background:"var(--surface2)",borderRadius:10,padding:"8px 14px"}}>
                    <div className="mono" style={{fontSize:18,fontWeight:800,color:"var(--text)"}}>{v}</div>
                    <div style={{fontSize:9,color:"var(--muted)"}}>{l}</div>
                  </div>
                ))}
                <button onClick={()=>{setQuiz(null);setTopic("");}} style={{padding:"6px 14px",borderRadius:10,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--muted)",fontSize:11,cursor:"pointer"}}>↩ New</button>
              </div>
            </div>
            {allDone && (
              <div style={{background:scored?"#a78bfa 10":"var(--surface2)",border:`1px solid ${scored?"#a78bfa 30":"var(--border)"}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:15}}>🎯</span>
                {scored ? (
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>MCQ Score: <span className="mono" style={{color:"#a78bfa"}}>{correct}/{mcqs.length}</span> <span style={{fontSize:11,color:"var(--muted)"}}>({Math.round(correct/mcqs.length*100)}%)</span></p>
                    <p style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{correct===mcqs.length?"🏆 Perfect!":correct>=mcqs.length*.7?"👍 Great job!":"📖 Keep practising"}</p>
                  </div>
                ) : <p style={{fontSize:13,color:"var(--muted)"}}>All MCQs answered — ready to see your score?</p>}
                {!scored && <button onClick={()=>setScored(true)} style={{marginLeft:"auto",padding:"6px 16px",borderRadius:9,border:"1px solid #a78bfa 35",background:"#a78bfa 15",color:"#a78bfa",fontSize:12,fontWeight:700,cursor:"pointer"}}>Show Score</button>}
              </div>
            )}
          </div>

          {/* Filters */}
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            {["All","MCQ","ShortAnswer","Coding"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:"5px 14px",borderRadius:9,border:`1px solid ${filter===f?"#a78bfa 40":"var(--border)"}`,background:filter===f?"#a78bfa 15":"var(--surface)",color:filter===f?"#a78bfa":"var(--muted)",fontSize:11,fontWeight:filter===f?700:400,cursor:"pointer"}}>
                {f==="ShortAnswer"?"Short Answer":f}
              </button>
            ))}
            <button onClick={()=>setRevealed(new Set(quiz.questions.map(q=>q.id)))} style={{marginLeft:"auto",padding:"5px 14px",borderRadius:9,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--muted)",fontSize:11,cursor:"pointer"}}>
              👁 Reveal All
            </button>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(q=>(
              <QCard key={q.id} q={q}
                revealed={revealed.has(q.id)}
                selected={answers[q.id]??null}
                onPick={l=>{ if(!revealed.has(q.id)) setAnswers(p=>({...p,[q.id]:l})); }}
                onReveal={()=>setRevealed(p=>new Set([...p,q.id]))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
