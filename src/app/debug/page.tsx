"use client";
import { useState } from "react";

interface Result {
  hasError: boolean;
  errorType: string; errorSummary: string; conceptExplanation: string;
  hints: string[]; affectedLines: number[]; difficulty: string;
  commonMistake: string; furtherReading: string;
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
const dStyle: Record<string,string> = { Easy:"#34d399", Medium:"#fbbf24", Hard:"#f87171" };

export default function DebugPage() {
  const [lang,     setLang]     = useState("python");
  const [code,     setCode]     = useState("");
  const [errMsg,   setErrMsg]   = useState("");
  const [loading,  setLoad]     = useState(false);
  const [result,   setResult]   = useState<Result|null>(null);
  const [apiErr,   setApiErr]   = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [tab,      setTab]      = useState<"exp"|"hints"|"info">("exp");

  const loadSample = () => {
    const s = SAMPLES[lang] ?? SAMPLES.python;
    setCode(s.code); setErrMsg(s.err);
    setResult(null); setRevealed(new Set());
  };

  const analyse = async () => {
    setApiErr(""); setResult(null); setLoad(true); setRevealed(new Set()); setTab("exp");
    try {
      const res = await fetch("/api/debug", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ code, language:lang, error:errMsg }),
        credentials:"include"
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error?.message || "Analysis failed");
      setResult(d.data);
    } catch(e:unknown) { setApiErr(e instanceof Error ? e.message : "Error"); }
    finally { setLoad(false); }
  };

  const reveal = (i:number) => setRevealed(p => new Set([...p,i]));
  const lines = result?.affectedLines ?? [];
  const lineCount = code.split("\n").length;

  return (
    <div style={{padding:"28px 32px", background:"var(--bg)", minHeight:"100%"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22, fontWeight:800, color:"var(--text)", letterSpacing:"-.5px"}}>Code Debugging Assistant</h1>
        <p style={{fontSize:13, color:"var(--muted)", marginTop:4}}>
          Paste your code → get Socratic hints & explanations. <span style={{color:"#f87171"}}>No solutions — you fix it.</span>
        </p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20}}>

        {/* ── Left: Editor ── */}
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
            {LANGS.map(l=>(
              <button key={l} onClick={()=>{ setLang(l); setResult(null); setRevealed(new Set()); }}
                style={{padding:"5px 14px", borderRadius:8, fontFamily:"inherit",
                  border:`1px solid ${lang===l ? "rgba(248,113,113,0.4)" : "var(--border)"}`,
                  background:lang===l ? "rgba(248,113,113,0.1)" : "var(--surface)",
                  color:lang===l ? "#f87171" : "var(--muted)", fontSize:11, fontWeight:600, cursor:"pointer"}}>
                {l}
              </button>
            ))}
            <button onClick={loadSample}
              style={{marginLeft:"auto", padding:"5px 14px", borderRadius:8, border:"1px solid var(--border)", background:"var(--surface2)", color:"var(--muted)", fontSize:11, cursor:"pointer", fontFamily:"inherit"}}>
              🐛 Sample
            </button>
          </div>

          <div style={{display:"flex", borderRadius:12, overflow:"hidden", border:"1px solid var(--border)", background:"#0d1117"}}>
            <div style={{width:38, background:"#0d1117", borderRight:"1px solid var(--border)", padding:"14px 0", flexShrink:0, userSelect:"none"}}>
              {Array.from({length:Math.max(lineCount,20)},(_,i)=>i+1).map(n=>(
                <div key={n} style={{height:22, paddingRight:8, textAlign:"right", fontSize:11, fontFamily:"monospace",
                  color:lines.includes(n) ? "#f87171" : "#2a3a55",
                  background:lines.includes(n) ? "rgba(248,113,113,0.07)" : "transparent",
                  lineHeight:"22px"}}>{n}</div>
              ))}
            </div>
            <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false}
              style={{flex:1, background:"transparent", border:"none", outline:"none", padding:"14px", color:"#c9d8f0", fontSize:13, lineHeight:"22px", resize:"none", minHeight:320, fontFamily:"monospace"}}
              placeholder={`// Paste your ${lang} code here…`}
            />
          </div>

          <textarea value={errMsg} onChange={e=>setErrMsg(e.target.value)} rows={3} spellCheck={false}
            placeholder="Error message / traceback (optional)…"
            style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", color:"#f87171", fontSize:12, lineHeight:1.6, resize:"none", outline:"none", fontFamily:"monospace"}}
          />

          {apiErr && <div style={{background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#f87171"}}>{apiErr}</div>}

          <button onClick={analyse} disabled={!code.trim()||loading}
            style={{padding:"13px", borderRadius:12, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#f87171,#fbbf24)", color:"#fff",
              fontSize:14, fontWeight:700, fontFamily:"inherit",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              opacity:!code.trim()||loading ? 0.5 : 1}}>
            {loading
              ? <><span style={{width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite"}}/>Analysing…</>
              : "🔍 Analyse Code"}
          </button>

          <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px"}}>
            <p style={{fontSize:11, color:"var(--muted)"}}>
              <span style={{color:"#f87171", fontWeight:700}}>Socratic rule:</span> This tool explains concepts and guides you — it never writes the fix for you.
            </p>
          </div>
        </div>

        {/* ── Right: Result ── */}
        <div>
          {!result && !loading && (
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:480, gap:14, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16}}>
              <div style={{fontSize:40}}>🔍</div>
              <p style={{fontSize:14, fontWeight:700, color:"var(--text)"}}>Debug output appears here</p>
              <p style={{fontSize:12, color:"var(--muted)"}}>Paste code on the left and click Analyse</p>
            </div>
          )}

          {loading && (
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:480, gap:12, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16}}>
              <span style={{width:36, height:36, border:"3px solid rgba(248,113,113,0.2)", borderTopColor:"#f87171", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite"}}/>
              <p style={{fontSize:13, fontWeight:700, color:"var(--text)"}}>Analysing your code…</p>
              {["Detecting error type","Building explanation","Crafting hints"].map((s,i)=>(
                <span key={s} style={{fontSize:11, color:"var(--muted)", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:20, padding:"4px 14px", animationDelay:`${i*.4}s`}}>{s}</span>
              ))}
            </div>
          )}

          {/* ✅ Code is CORRECT */}
          {result && !result.hasError && (
            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              <div style={{background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:14, padding:"20px"}}>
                <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:12}}>
                  <div style={{width:42, height:42, borderRadius:12, background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20}}>✅</div>
                  <div>
                    <p style={{fontSize:9, color:"#34d399", textTransform:"uppercase", letterSpacing:2, fontWeight:700}}>No Bugs Found</p>
                    <p style={{fontSize:15, fontWeight:800, color:"#34d399", marginTop:3}}>Code looks correct!</p>
                  </div>
                </div>
                <p style={{fontSize:13, color:"var(--text)", lineHeight:1.7}}>{result.errorSummary}</p>
              </div>

              {result.conceptExplanation && (
                <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", display:"flex", flexDirection:"column", gap:12}}>
                  <div>
                    <p style={{fontSize:9, color:"#a78bfa", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:8}}>💡 Concept</p>
                    <p style={{fontSize:13, color:"var(--text)", lineHeight:1.7}}>{result.conceptExplanation}</p>
                  </div>
                  {result.hints.length > 0 && (
                    <div style={{borderTop:"1px solid var(--border)", paddingTop:12}}>
                      <p style={{fontSize:9, color:"#4f8ef7", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:8}}>🚀 Ways to improve</p>
                      {result.hints.map((h,i)=>(
                        <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:8}}>
                          <span style={{width:20, height:20, borderRadius:6, background:"rgba(79,142,247,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#4f8ef7", flexShrink:0, fontFamily:"monospace"}}>{i+1}</span>
                          <p style={{fontSize:12, color:"var(--muted)", lineHeight:1.6}}>{h}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.furtherReading && (
                    <div style={{background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:10, padding:"10px 14px", display:"flex", gap:8}}>
                      <span>📖</span>
                      <div>
                        <p style={{fontSize:9, color:"#a78bfa", fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>Review This Topic</p>
                        <p style={{fontSize:12, color:"var(--text)", marginTop:3}}>{result.furtherReading}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 🐛 Bugs found */}
          {result && result.hasError && (
            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px"}}>
                <div style={{display:"flex", alignItems:"flex-start", gap:12, marginBottom:10}}>
                  <div style={{width:38, height:38, borderRadius:10, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0}}>🐛</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:9, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700}}>Error Detected</p>
                    <p style={{fontSize:15, fontWeight:800, color:"#f87171", marginTop:3, fontFamily:"monospace"}}>{result.errorType}</p>
                  </div>
                  <span style={{fontSize:10, padding:"3px 10px", borderRadius:20,
                    background:`${dStyle[result.difficulty] ?? "#888"}18`,
                    color:dStyle[result.difficulty] ?? "#888",
                    border:`1px solid ${dStyle[result.difficulty] ?? "#888"}35`, fontWeight:700}}>
                    {result.difficulty}
                  </span>
                </div>
                <p style={{fontSize:12, color:"var(--text)", lineHeight:1.6}}>{result.errorSummary}</p>
                {lines.length > 0 && (
                  <div style={{marginTop:10, display:"flex", gap:6, flexWrap:"wrap"}}>
                    {lines.map(l=><span key={l} style={{fontSize:10, color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", padding:"2px 10px", borderRadius:6, fontFamily:"monospace"}}>Line {l}</span>)}
                  </div>
                )}
              </div>

              <div style={{display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:11, padding:4, gap:4}}>
                {([["exp","💡 Explanation"],["hints","🗝 Hints"],["info","📋 Details"]] as const).map(([k,l])=>(
                  <button key={k} onClick={()=>setTab(k)} style={{flex:1, padding:"7px", borderRadius:8, fontFamily:"inherit",
                    border:`1px solid ${tab===k ? "rgba(248,113,113,0.3)" : "transparent"}`,
                    background:tab===k ? "rgba(248,113,113,0.08)" : "transparent",
                    color:tab===k ? "#f87171" : "var(--muted)", fontSize:12, fontWeight:tab===k?700:400, cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>

              {tab==="exp" && (
                <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", display:"flex", flexDirection:"column", gap:14}}>
                  <div>
                    <p style={{fontSize:9, color:"#a78bfa", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:8}}>Concept</p>
                    <p style={{fontSize:13, color:"var(--text)", lineHeight:1.7}}>{result.conceptExplanation}</p>
                  </div>
                  <div style={{borderTop:"1px solid var(--border)", paddingTop:14}}>
                    <p style={{fontSize:9, color:"#fbbf24", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:8}}>Why beginners make this mistake</p>
                    <p style={{fontSize:12, color:"var(--muted)", lineHeight:1.6}}>{result.commonMistake}</p>
                  </div>
                  <div style={{background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:10, padding:"10px 14px", display:"flex", gap:8}}>
                    <span>📖</span>
                    <div>
                      <p style={{fontSize:9, color:"#a78bfa", fontWeight:700, textTransform:"uppercase", letterSpacing:1}}>Review This Topic</p>
                      <p style={{fontSize:12, color:"var(--text)", marginTop:3}}>{result.furtherReading}</p>
                    </div>
                  </div>
                </div>
              )}

              {tab==="hints" && (
                <div style={{display:"flex", flexDirection:"column", gap:8}}>
                  <p style={{fontSize:11, color:"var(--muted)", paddingLeft:2}}>Reveal hints one at a time. Try to fix the bug before opening the next.</p>
                  {result.hints.map((h,i)=>(
                    <div key={i} style={{background:"var(--surface)",
                      border:`1px solid ${revealed.has(i) ? "rgba(251,191,36,0.35)" : "var(--border)"}`,
                      borderRadius:12, overflow:"hidden"}}>
                      <div style={{display:"flex", alignItems:"center", gap:12, padding:"12px 16px"}}>
                        <div style={{width:28, height:28, borderRadius:8, fontFamily:"monospace",
                          background:revealed.has(i) ? "rgba(251,191,36,0.15)" : "var(--surface2)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:700, color:revealed.has(i) ? "#fbbf24" : "var(--muted)", flexShrink:0}}>
                          {i+1}
                        </div>
                        {revealed.has(i)
                          ? <p style={{flex:1, fontSize:13, color:"var(--text)", lineHeight:1.6}}>{h}</p>
                          : <p style={{flex:1, fontSize:13, color:"var(--muted)", fontStyle:"italic"}}>Hint {i+1} hidden…</p>}
                        {!revealed.has(i) && (
                          <button onClick={()=>reveal(i)} disabled={i>0 && !revealed.has(i-1)}
                            style={{padding:"5px 14px", borderRadius:8, fontFamily:"inherit",
                              border:"1px solid rgba(251,191,36,0.3)", background:"rgba(251,191,36,0.1)",
                              color:"#fbbf24", fontSize:11, fontWeight:700, cursor:"pointer",
                              opacity:i>0 && !revealed.has(i-1) ? 0.35 : 1}}>
                            {i>0 && !revealed.has(i-1) ? "🔒" : "Reveal"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p style={{fontSize:10, color:"var(--muted)", textAlign:"center", paddingTop:4}}>Hints unlock in order — work through each one before moving on</p>
                </div>
              )}

              {tab==="info" && (
                <div style={{background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", display:"flex", flexDirection:"column", gap:14}}>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
                    {[["Language",lang],["Error Type",result.errorType],["Difficulty",result.difficulty],["Hints",`${result.hints.length} available`]].map(([l,v])=>(
                      <div key={l} style={{background:"var(--surface2)", borderRadius:10, padding:"10px 14px", border:"1px solid var(--border)"}}>
                        <p style={{fontSize:9, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1.5}}>{l}</p>
                        <p style={{fontSize:13, fontWeight:700, color:"var(--text)", marginTop:4}}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {lines.length > 0 && (
                    <div style={{background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:10, padding:"10px 14px"}}>
                      <p style={{fontSize:9, color:"#f87171", fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8}}>Flagged Lines</p>
                      <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                        {lines.map(l=><span key={l} style={{fontSize:11, color:"#f87171", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", padding:"3px 12px", borderRadius:8, fontFamily:"monospace"}}>Line {l}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
