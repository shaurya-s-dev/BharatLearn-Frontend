"use client";
import { useState, useRef, ChangeEvent } from "react";

interface VQ { id:number; question:string; difficulty:string; category:string; hint:string; marks:number; }
interface EC  { criterion:string; weight:number; description:string; }
interface Result { language:string; summary:string; overallDifficulty:string; evaluationCriteria:EC[]; questions:VQ[]; }

const dClr:Record<string,string> = { Easy:"#34d399",Medium:"#fbbf24",Hard:"#f87171" };
const cIco:Record<string,string> = { Concept:"💡",Implementation:"⚙️",Logic:"🧠",Debugging:"🐛",Optimization:"⚡",Theory:"📚" };

function VCard({q,open,onToggle}:{q:VQ;open:boolean;onToggle:()=>void;}) {
  return (
    <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
      <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"flex-start",gap:12,padding:"12px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <span className="mono" style={{width:30,height:30,borderRadius:8,background:"var(--surface2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--muted)",flexShrink:0,marginTop:1}}>{String(q.id).padStart(2,"0")}</span>
        <div style={{flex:1}}>
          <p style={{fontSize:13,color:"var(--text)",lineHeight:1.5}}>{q.question}</p>
          <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}>
            <span style={{fontSize:9,padding:"2px 9px",borderRadius:20,background:`${dClr[q.difficulty]}18`,color:dClr[q.difficulty],fontWeight:700}}>{q.difficulty}</span>
            <span style={{fontSize:9,padding:"2px 9px",borderRadius:20,background:"var(--surface2)",color:"var(--muted)"}}>{cIco[q.category]||"📌"} {q.category}</span>
            <span style={{fontSize:9,color:"var(--muted)"}}>{q.marks} mark{q.marks>1?"s":""}</span>
          </div>
        </div>
        <span style={{color:"var(--muted)",fontSize:10,transform:open?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0,marginTop:5}}>▼</span>
      </button>
      {open && (
        <div style={{borderTop:"1px solid var(--border)",padding:"12px 16px",background:"var(--surface2)"}}>
          <p style={{fontSize:9,color:"#34d399",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>What a good answer covers</p>
          <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{q.hint}</p>
        </div>
      )}
    </div>
  );
}

export default function VivaPage() {
  const [file,    setFile]    = useState<File|null>(null);
  const [drag,    setDrag]    = useState(false);
  const [loading, setLoad]    = useState(false);
  const [result,  setResult]  = useState<Result|null>(null);
  const [err,     setErr]     = useState("");
  const [open,    setOpen]    = useState<Set<number>>(new Set());
  const [filter,  setFilter]  = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (id:number) => setOpen(p=>{const s=new Set(p);s.has(id)?s.delete(id):s.add(id);return s;});

  const generate = async () => {
    if (!file) return;
    setErr(""); setResult(null); setLoad(true); setOpen(new Set());
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/viva",{method:"POST",body:fd,credentials:"include"});
      const d = await r.json();
      if (!d.success) throw new Error(d.error?.message||"Failed");
      setResult(d.data);
    } catch(e:unknown) { setErr(e instanceof Error?e.message:"Error"); }
    finally { setLoad(false); }
  };

  const filtered = result?.questions.filter(q=>filter==="All"||q.difficulty===filter||q.category===filter) ?? [];
  const cats     = result ? ["All",...Array.from(new Set(result.questions.map(q=>q.category)))] : [];

  return (
    <div style={{padding:"28px 32px",background:"var(--bg)",minHeight:"100%"}}>
      <div className="fu" style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:"var(--text)",letterSpacing:"-.5px"}}>Viva Question Predictor</h1>
        <p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>Upload your project code → get 20 AI-predicted viva questions</p>
      </div>

      {!result ? (
        <div style={{maxWidth:580}}>
          {/* Drop zone */}
          <div
            onClick={()=>!loading&&fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)setFile(f);}}
            style={{border:`2px dashed ${drag?"#fbbf24 80":file?"#34d39960":"var(--border)"}`,borderRadius:16,padding:"48px 24px",textAlign:"center",cursor:loading?"default":"pointer",background:drag?"#fbbf24 05":file?"#34d39908":"var(--surface)",transition:"all .2s",marginBottom:14}}
          >
            <input ref={fileRef} type="file" accept=".py,.js,.ts,.java,.cpp,.c,.cs,.go,.rb,.php,.txt" style={{display:"none"}} onChange={(e:ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0]||null)}/>
            <div style={{fontSize:44,marginBottom:12}}>{file?"✅":"📁"}</div>
            {file ? (
              <div>
                <p style={{fontSize:14,fontWeight:700,color:"#34d399"}}>{file.name}</p>
                <p style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{(file.size/1024).toFixed(1)} KB · Click to change</p>
              </div>
            ) : (
              <div>
                <p style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>Drop your code file here</p>
                <p style={{fontSize:12,color:"var(--muted)",marginTop:4}}>or click to browse</p>
                <p style={{fontSize:10,color:"var(--muted)",marginTop:8}}>.py · .js · .ts · .java · .cpp · .c · .go · .php</p>
              </div>
            )}
          </div>

          {err && <div style={{background:"#f8717110",border:"1px solid #f8717130",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#f87171",marginBottom:12}}>{err}</div>}

          <button onClick={generate} disabled={!file||loading}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#fbbf24,#f97316)",color:"#fff",fontSize:14,fontWeight:700,opacity:!file||loading?.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><span className="spin" style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>Generating questions…</>:"⚡ Generate 20 Viva Questions"}
          </button>
        </div>
      ) : (
        <div>
          {/* Summary */}
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"18px 22px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,background:"#fbbf24 15",color:"#fbbf24",border:"1px solid #fbbf24 30",padding:"3px 12px",borderRadius:20,fontWeight:700}}>{result.language.toUpperCase()}</span>
                <span style={{fontSize:11,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)",padding:"3px 12px",borderRadius:20,fontWeight:700}}>{result.overallDifficulty}</span>
              </div>
              <button onClick={()=>{setResult(null);setFile(null);}} style={{padding:"6px 14px",borderRadius:9,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--muted)",fontSize:11,cursor:"pointer"}}>↩ New File</button>
            </div>
            <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:16}}>{result.summary}</p>

            {/* Eval criteria */}
            <p style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:10}}>Evaluation Criteria</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
              {result.evaluationCriteria?.map((c,i)=>{
                const colors=["#4f8ef7","#a78bfa","#fbbf24","#34d399","#f87171"];
                return (
                  <div key={c.criterion}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:10,color:"var(--text)",fontWeight:600}}>{c.criterion}</span>
                      <span className="mono" style={{fontSize:10,color:"var(--muted)"}}>{c.weight}/10</span>
                    </div>
                    <div style={{height:4,background:"var(--surface2)",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                      <div style={{height:"100%",width:`${c.weight*10}%`,background:colors[i%5],borderRadius:99}}/>
                    </div>
                    <p style={{fontSize:9,color:"var(--muted)",lineHeight:1.4}}>{c.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            {["All","Easy","Medium","Hard"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:"4px 13px",borderRadius:8,border:`1px solid ${filter===f&&f!=="All"?`${dClr[f]}40`:"var(--border)"}`,background:filter===f&&f!=="All"?`${dClr[f]}15`:filter===f?"var(--surface2)":"var(--surface)",color:filter===f&&f!=="All"?dClr[f]:"var(--muted)",fontSize:11,fontWeight:filter===f?700:400,cursor:"pointer"}}>
                {f}
              </button>
            ))}
            <span style={{fontSize:10,color:"var(--muted)",margin:"0 4px"}}>|</span>
            {cats.slice(0,5).map(c=>(
              <button key={c} onClick={()=>setFilter(c)}
                style={{padding:"4px 13px",borderRadius:8,border:`1px solid ${filter===c?"#a78bfa 40":"var(--border)"}`,background:filter===c?"#a78bfa 15":"var(--surface)",color:filter===c?"#a78bfa":"var(--muted)",fontSize:11,fontWeight:filter===c?700:400,cursor:"pointer"}}>
                {c!=="All"&&cIco[c]} {c}
              </button>
            ))}
            <span style={{marginLeft:"auto",fontSize:11,color:"var(--muted)"}}>{filtered.length} questions</span>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {filtered.map(q=><VCard key={q.id} q={q} open={open.has(q.id)} onToggle={()=>toggle(q.id)}/>)}
          </div>
        </div>
      )}
    </div>
  );
}
