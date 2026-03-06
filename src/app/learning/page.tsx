"use client";
import { useState, useRef, ChangeEvent } from "react";

interface Week { week:number; theme:string; topics:string[]; tasks:string[]; milestone:string; }
interface Plan  { title:string; description:string; weeks:Week[]; }

const phaseOf = (w:number) =>
  w<=6  ? {l:"Foundation",c:"#4f8ef7"} :
  w<=12 ? {l:"Core",       c:"#fbbf24"} :
  w<=18 ? {l:"Advanced",   c:"#a78bfa"} :
          {l:"Mastery",    c:"#34d399"};

const card = { background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14 };
const btn = (primary?:boolean): React.CSSProperties => ({
  padding:"11px 20px",
  borderRadius:11,
  cursor:"pointer",

  background: primary
    ? "linear-gradient(135deg,#4f8ef7,#a78bfa)"
    : "var(--surface)",

  color: primary ? "#fff" : "var(--muted)",
  border: primary ? "none" : "1px solid var(--border)",
  transition:"all .15s"
});

export default function LearningPage() {
  const [mode, setMode]     = useState<"text"|"file">("text");
  const [text, setText]     = useState("");
  const [file, setFile]     = useState<File|null>(null);
  const [loading, setLoad]  = useState(false);
  const [plan, setPlan]     = useState<Plan|null>(null);
  const [err,  setErr]      = useState("");
  const [open, setOpen]     = useState<Set<number>>(new Set([1,2,3]));
  const ref = useRef<HTMLInputElement>(null);

  const toggle = (n:number) => setOpen(p => { const s=new Set(p); s.has(n)?s.delete(n):s.add(n); return s; });

  const generate = async () => {
    setErr(""); setLoad(true); setPlan(null);
    try {
      let res;
      if (mode==="file" && file) {
        const fd = new FormData(); fd.append("file", file);
        res = await fetch("/api/syllabus",{method:"POST",body:fd,credentials:"include"});
      } else {
        res = await fetch("/api/syllabus",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text}),credentials:"include"});
      }
      const d = await res.json();
      if (!d.success) throw new Error(d.error?.message || "Failed");
      setPlan(d.data.plan);
    } catch(e:unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  return (
    <div style={{padding:"28px 32px",background:"var(--bg)",minHeight:"100%"}}>
      <div className="fu" style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:"var(--text)",letterSpacing:"-.5px"}}>Learning Plan Generator</h1>
        <p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>Paste a syllabus or upload a PDF → get a 24-week structured roadmap</p>
      </div>

      {!plan ? (
        <div style={{maxWidth:680}}>
          {/* Toggle */}
          <div style={{display:"flex",gap:4,marginBottom:18,background:"var(--surface)",padding:4,borderRadius:11,border:"1px solid var(--border)",width:"fit-content"}}>
            {(["text","file"] as const).map(m => (
              <button key={m} onClick={()=>setMode(m)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:mode===m?"#4f8ef720":"transparent",color:mode===m?"#4f8ef7":"var(--muted)"}}>
                {m==="text"?"✍️ Paste Text":"📄 Upload PDF"}
              </button>
            ))}
          </div>

          {mode==="text" ? (
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={10}
              placeholder={"Paste your syllabus content here…\n\nExample:\nUnit 1: Variables & Data Types\nUnit 2: Control Flow\nUnit 3: Functions..."}
              style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",color:"var(--text)",fontSize:13,lineHeight:1.7,resize:"vertical",outline:"none",fontFamily:"var(--font-mono)"}}
            />
          ) : (
            <div onClick={()=>ref.current?.click()} style={{border:`2px dashed ${file?"#34d39950":"var(--border)"}`,borderRadius:14,padding:"44px 24px",textAlign:"center",cursor:"pointer",background:file?"#34d39908":"var(--surface)"}}>
              <input ref={ref} type="file" accept=".pdf,.txt" style={{display:"none"}} onChange={(e:ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0]||null)}/>
              <div style={{fontSize:36,marginBottom:10}}>{file?"✅":"📄"}</div>
              <p style={{fontSize:13,fontWeight:600,color:file?"#34d399":"var(--muted)"}}>{file?file.name:"Click to upload PDF or TXT"}</p>
              {!file && <p style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Max 10 MB</p>}
            </div>
          )}

          {err && <div style={{marginTop:12,background:"#f8717110",border:"1px solid #f8717130",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#f87171"}}>{err}</div>}

          <button onClick={generate} disabled={loading||(mode==="text"?text.trim().length<20:!file)} style={{...btn(true),marginTop:14,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.6:1}}>
            {loading ? <><span className="spin" style={{width:15,height:15,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/> Generating…</> : "✨ Generate 24-Week Plan"}
          </button>
        </div>
      ) : (
        <div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
            <div>
              <h2 style={{fontSize:18,fontWeight:800,color:"var(--text)"}}>{plan.title}</h2>
              <p style={{fontSize:13,color:"var(--muted)",marginTop:4,maxWidth:500}}>{plan.description}</p>
            </div>
            <button onClick={()=>setPlan(null)} style={btn()}>↩ New Plan</button>
          </div>

          {/* Phase legend */}
          <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
            {[["Foundation","#4f8ef7","1–6"],["Core","#fbbf24","7–12"],["Advanced","#a78bfa","13–18"],["Mastery","#34d399","19–24"]].map(([l,c,w])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 12px"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
                <span style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>{l}</span>
                <span style={{fontSize:10,color:"var(--muted)"}}>Wk {w}</span>
              </div>
            ))}
          </div>

          {/* Week cards */}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {plan.weeks?.map(w => {
              const ph = phaseOf(w.week);
              const isOpen = open.has(w.week);
              return (
                <div key={w.week} style={{...card,overflow:"hidden"}}>
                  <button onClick={()=>toggle(w.week)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                    <div className="mono" style={{width:32,height:32,borderRadius:8,background:`${ph.c}18`,border:`1px solid ${ph.c}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:ph.c,flexShrink:0}}>
                      {String(w.week).padStart(2,"0")}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{w.theme}</div>
                      <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{w.topics?.length} topics · {w.tasks?.length} tasks</div>
                    </div>
                    <span style={{fontSize:10,color:ph.c,background:`${ph.c}15`,padding:"2px 10px",borderRadius:20,fontWeight:600}}>{ph.l}</span>
                    <span style={{color:"var(--muted)",fontSize:11,transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
                  </button>
                  {isOpen && (
                    <div style={{borderTop:"1px solid var(--border)",padding:"14px 16px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div>
                        <p style={{fontSize:9,color:"#4f8ef7",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:8}}>Topics</p>
                        {w.topics?.map((t,i)=><div key={i} style={{fontSize:12,color:"var(--text)",marginBottom:4}}>→ {t}</div>)}
                      </div>
                      <div>
                        <p style={{fontSize:9,color:"#fbbf24",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:8}}>Tasks</p>
                        {w.tasks?.map((t,i)=><div key={i} style={{fontSize:12,color:"var(--text)",marginBottom:4}}>✦ {t}</div>)}
                      </div>
                      {w.milestone && (
                        <div style={{gridColumn:"1/-1",background:"#34d39908",border:"1px solid #34d39930",borderRadius:9,padding:"9px 13px",display:"flex",gap:9,alignItems:"flex-start"}}>
                          <span style={{color:"#34d399",fontSize:15}}>🏁</span>
                          <div>
                            <p style={{fontSize:9,color:"#34d399",fontWeight:700,marginBottom:3}}>MILESTONE</p>
                            <p style={{fontSize:12,color:"var(--text)"}}>{w.milestone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
