"use client";
import { useState } from "react";

interface Result {
  errorType:string; errorSummary:string; conceptExplanation:string;
  hints:string[]; affectedLines:number[]; difficulty:string;
  commonMistake:string; furtherReading:string;
}

const SAMPLES: Record<string,{code:string;err:string}> = {
  python: {
    code: `def calculate_average(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total / len(numbers)

scores = [85, 92, 78, 95, 88]
print(f"Average: {calculate_avarage(scores)}")`,
    err: "NameError: name 'calculate_avarage' is not defined",
  },
  javascript: {
    code: `function findMax(arr) {
  let max = 0;
  for (let i = 0; i <= arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}
console.log(findMax([3, 7, 2, 9, 1]));`,
    err: "TypeError: Cannot read properties of undefined",
  },
  java: {
    code: `public class Main {
  public static void main(String[] args) {
    int[] nums = {10, 20, 30, 40, 50};
    int sum = 0;
    for (int i = 0; i <= nums.length; i++) {
      sum += nums[i];
    }
    System.out.println("Sum: " + sum);
  }
}`,
    err: "ArrayIndexOutOfBoundsException: Index 5 out of bounds",
  },
};

const LANGS = ["python","javascript","typescript","java","cpp","c","go"];
const dStyle: Record<string,string> = {
  Easy:  "#34d399", Medium: "#fbbf24", Hard: "#f87171",
};

export default function DebugPage() {
  const [lang,    setLang]    = useState("python");
  const [code,    setCode]    = useState("");
  const [errMsg,  setErrMsg]  = useState("");
  const [loading, setLoad]    = useState(false);
  const [result,  setResult]  = useState<Result|null>(null);
  const [apiErr,  setApiErr]  = useState("");
  const [revealed,setRevealed]= useState<Set<number>>(new Set());
  const [tab,     setTab]     = useState<"exp"|"hints"|"info">("exp");

  const loadSample = () => {
    const s = SAMPLES[lang] ?? SAMPLES.python;
    setCode(s.code); setErrMsg(s.err);
    setResult(null); setRevealed(new Set());
  };

  const analyse = async () => {
    setApiErr(""); setResult(null); setLoad(true); setRevealed(new Set()); setTab("exp");
    try {
      const res = await fetch("https://bharatlearn-backend.onrender.com/api/debug",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,language:lang,error:errMsg}) });
      const d = await res.json();
      if (!d.success) throw new Error(d.error?.message||"Analysis failed");
      setResult(d.data);
    } catch(e:unknown) { setApiErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  const reveal = (i:number) => setRevealed(p => new Set([...p,i]));
  const lines = result?.affectedLines ?? [];
  const lineCount = code.split("\n").length;

  return (
    <div style={{padding:"28px 32px",background:"var(--bg)",minHeight:"100%"}}>
      <div className="fu" style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800,color:"var(--text)",letterSpacing:"-.5px"}}>Code Debugging Assistant</h1>
        <p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>
          Paste buggy code → get conceptual hints. <span style={{color:"#f87171"}}>No solutions — you fix it.</span>
        </p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

        {/* ── Left: Editor ── */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Lang tabs */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {LANGS.map(l=>(
              <button key={l} onClick={()=>{setLang(l);setResult(null);setRevealed(new Set());}}
                style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${lang===l?"#f8717140":"var(--border)"}`,background:lang===l?"#f8717115":"var(--surface)",color:lang===l?"#f87171":"var(--muted)",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                {l}
              </button>
            ))}
            <button onClick={loadSample} style={{marginLeft:"auto",padding:"5px 14px",borderRadius:8,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--muted)",fontSize:11,cursor:"pointer"}}>
              🐛 Sample
            </button>
          </div>

          {/* Code area with line numbers */}
          <div style={{display:"flex",borderRadius:12,overflow:"hidden",border:"1px solid var(--border)",background:"#0d1117"}}>
            <div style={{width:38,background:"#0d1117",borderRight:"1px solid var(--border)",padding:"14px 0",flexShrink:0,userSelect:"none"}}>
              {Array.from({length:Math.max(lineCount,20)},(_,i)=>i+1).map(n=>(
                <div key={n} className="mono" style={{height:22,paddingRight:8,textAlign:"right",fontSize:11,color:lines.includes(n)?"#f87171":"#2a3a55",background:lines.includes(n)?"#f8717112":"transparent",lineHeight:"22px"}}>
                  {n}
                </div>
              ))}
            </div>
            <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false}
              style={{flex:1,background:"transparent",border:"none",outline:"none",padding:"14px 14px",color:"#c9d8f0",fontSize:13,lineHeight:"22px",resize:"none",minHeight:320,fontFamily:"var(--font-mono)"}}
              placeholder={`// Paste your ${lang} code here…`}
            />
          </div>

          {/* Error input */}
          <textarea value={errMsg} onChange={e=>setErrMsg(e.target.value)} rows={3} spellCheck={false}
            placeholder="Error message / traceback (optional)…"
            style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",color:"#f87171",fontSize:12,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"var(--font-mono)"}}
          />

          {apiErr && <div style={{background:"#f8717110",border:"1px solid #f8717130",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#f87171"}}>{apiErr}</div>}

          <button onClick={analyse} disabled={!code.trim()||loading} style={{padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f87171,#fbbf24)",color:"#fff",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:!code.trim()||loading?.5:1}}>
            {loading ? <><span className="spin" style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>Analysing…</> : "🔍 Analyse Code"}
          </button>

          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px"}}>
            <p style={{fontSize:11,color:"var(--muted)"}}>
              <span style={{color:"#f87171",fontWeight:700}}>Socratic rule:</span> This tool never gives you the fixed code. It teaches you to find the bug yourself.
            </p>
          </div>
        </div>

        {/* ── Right: Result ── */}
        <div>
          {!result && !loading && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:480,gap:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16}}>
              <div style={{fontSize:40}}>🔍</div>
              <p style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>Debug output appears here</p>
              <p style={{fontSize:12,color:"var(--muted)"}}>Paste code on the left and click Analyse</p>
            </div>
          )}

          {loading && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:480,gap:12,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16}}>
              <span className="spin" style={{width:36,height:36,border:"3px solid #f8717130",borderTopColor:"#f87171",borderRadius:"50%",display:"inline-block"}}/>
              <p style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>Analysing your code…</p>
              {["Detecting error type","Building explanation","Crafting hints"].map((s,i)=>(
                <span key={s} className="pulse-a" style={{fontSize:11,color:"var(--muted)",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 14px",animationDelay:`${i*.4}s`}}>{s}</span>
              ))}
            </div>
          )}

          {result && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Summary */}
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 20px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                  <div style={{width:38,height:38,borderRadius:10,background:"#f8717115",border:"1px solid #f8717130",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🐛</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700}}>Error Detected</p>
                    <p className="mono" style={{fontSize:15,fontWeight:800,color:"#f87171",marginTop:3}}>{result.errorType}</p>
                  </div>
                  <span style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:`${dStyle[result.difficulty]}18`,color:dStyle[result.difficulty],border:`1px solid ${dStyle[result.difficulty]}35`,fontWeight:700}}>
                    {result.difficulty}
                  </span>
                </div>
                <p style={{fontSize:12,color:"var(--text)",lineHeight:1.6}}>{result.errorSummary}</p>
                {lines.length>0 && (
                  <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {lines.map(l=><span key={l} className="mono" style={{fontSize:10,color:"#f87171",background:"#f8717115",border:"1px solid #f8717130",padding:"2px 10px",borderRadius:6}}>Line {l}</span>)}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div style={{display:"flex",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:11,padding:4,gap:4}}>
                {([["exp","💡 Explanation"],["hints","🗝 Hints"],["info","📋 Details"]] as const).map(([k,l])=>(
                  <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${tab===k?"#f8717130":"transparent"}`,background:tab===k?"#f8717112":"transparent",color:tab===k?"#f87171":"var(--muted)",fontSize:12,fontWeight:tab===k?700:400,cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {tab==="exp" && (
                <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                  <div>
                    <p style={{fontSize:9,color:"#a78bfa",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:8}}>Concept</p>
                    <p style={{fontSize:13,color:"var(--text)",lineHeight:1.7}}>{result.conceptExplanation}</p>
                  </div>
                  <div style={{borderTop:"1px solid var(--border)",paddingTop:14}}>
                    <p style={{fontSize:9,color:"#fbbf24",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:8}}>Why beginners make this mistake</p>
                    <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6}}>{result.commonMistake}</p>
                  </div>
                  <div style={{background:"#a78bfa0d",border:"1px solid #a78bfa25",borderRadius:10,padding:"10px 14px",display:"flex",gap:8}}>
                    <span>📖</span>
                    <div>
                      <p style={{fontSize:9,color:"#a78bfa",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Review This Topic</p>
                      <p style={{fontSize:12,color:"var(--text)",marginTop:3}}>{result.furtherReading}</p>
                    </div>
                  </div>
                </div>
              )}

              {tab==="hints" && (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <p style={{fontSize:11,color:"var(--muted)",paddingLeft:2}}>Reveal hints one at a time. Try to fix the bug before opening the next.</p>
                  {result.hints.map((h,i)=>(
                    <div key={i} style={{background:"var(--surface)",border:`1px solid ${revealed.has(i)?"#fbbf24 35":"var(--border)"}`,borderRadius:12,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px"}}>
                        <div className="mono" style={{width:28,height:28,borderRadius:8,background:revealed.has(i)?"#fbbf24 20":"var(--surface2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:revealed.has(i)?"#fbbf24":"var(--muted)",flexShrink:0}}>
                          {i+1}
                        </div>
                        {revealed.has(i)
                          ? <p style={{flex:1,fontSize:13,color:"var(--text)",lineHeight:1.6}}>{h}</p>
                          : <p style={{flex:1,fontSize:13,color:"var(--muted)",fontStyle:"italic"}}>Hint {i+1} hidden…</p>
                        }
                        {!revealed.has(i) && (
                          <button onClick={()=>reveal(i)} disabled={i>0&&!revealed.has(i-1)}
                            style={{padding:"5px 14px",borderRadius:8,border:"1px solid #fbbf24 30",background:"#fbbf24 12",color:"#fbbf24",fontSize:11,fontWeight:700,cursor:"pointer",opacity:i>0&&!revealed.has(i-1)?.35:1}}>
                            {i>0&&!revealed.has(i-1)?"🔒":"Reveal"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p style={{fontSize:10,color:"var(--muted)",textAlign:"center",paddingTop:4}}>Hints unlock in order — work through each one before moving on</p>
                </div>
              )}

              {tab==="info" && (
                <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[["Language",result.errorType.split(":")[0]||"—"],["Error Type",result.errorType],["Difficulty",result.difficulty],["Hints",`${result.hints.length} available`]].map(([l,v])=>(
                      <div key={l} style={{background:"var(--surface2)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--border)"}}>
                        <p style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1.5}}>{l}</p>
                        <p style={{fontSize:13,fontWeight:700,color:"var(--text)",marginTop:4}}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {lines.length>0 && (
                    <div style={{background:"#f8717108",border:"1px solid #f8717125",borderRadius:10,padding:"10px 14px"}}>
                      <p style={{fontSize:9,color:"#f87171",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Flagged Lines</p>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {lines.map(l=><span key={l} className="mono" style={{fontSize:11,color:"#f87171",background:"#f8717115",border:"1px solid #f8717130",padding:"3px 12px",borderRadius:8}}>Line {l}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
