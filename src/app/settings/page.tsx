"use client";
import { useEffect, useState } from "react";

interface User { name: string; email: string; avatar: string; }

function HamsterLoader({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(5,9,18,.95)",backdropFilter:"blur(12px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24}}>
      <div className="wheel-and-hamster" aria-label="Loading" role="img">
        <div className="wheel"/><div className="hamster"><div className="hamster__body"><div className="hamster__head"><div className="hamster__ear"/><div className="hamster__eye"/><div className="hamster__nose"/></div><div className="hamster__limb hamster__limb--fr"/><div className="hamster__limb hamster__limb--fl"/><div className="hamster__limb hamster__limb--br"/><div className="hamster__limb hamster__limb--bl"/><div className="hamster__tail"/></div></div><div className="spoke"/>
      </div>
      <p style={{color:"rgba(255,255,255,.5)",fontSize:13,letterSpacing:".5px"}}>Saving preferences…</p>
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser]       = useState<User|null>(null);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme]     = useState("dark");

  useEffect(() => {
    fetch("/auth/me",{credentials:"include"})
      .then(r=>r.json()).then(d=>d.user&&setUser(d.user)).catch(()=>{});
    const raw = localStorage.getItem("bl_prefs");
    if (raw) {
      const p = JSON.parse(raw);
      if (p.theme) { setTheme(p.theme); applyTheme(p.theme); }
    }
  }, []);

  function applyTheme(t: string) {
    document.documentElement.setAttribute("data-theme",
      t === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : t
    );
  }

  useEffect(() => { applyTheme(theme); }, [theme]);

  const save = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("bl_prefs", JSON.stringify({ theme }));
      setLoading(false); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1600);
  };

  const card: React.CSSProperties = { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16, padding:"22px 24px", marginBottom:16 };
  const lbl: React.CSSProperties  = { fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:16 };

  return (
    <>
      <HamsterLoader show={loading}/>
      <div style={{padding:"28px 32px",background:"var(--bg)",minHeight:"100%",maxWidth:660,margin:"0 auto"}}>

        <div className="fu" style={{marginBottom:28,textAlign:"center"}}>
          <h1 style={{fontSize:26,fontWeight:900,color:"var(--text)",letterSpacing:"-.5px"}}>⚙️ Settings</h1>
          <p style={{fontSize:13,color:"var(--muted)",marginTop:5}}>Manage your account and preferences</p>
        </div>

        {/* Account */}
        <div className="fu" style={card}>
          <p style={lbl}>Account</p>
          {user ? (
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt="" width={56} height={56} style={{borderRadius:"50%",border:"2px solid rgba(79,142,247,.4)",boxShadow:"0 0 16px #4f8ef730"}}/>
              <div>
                <p style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>{user.name}</p>
                <p style={{fontSize:12,color:"var(--muted)",marginTop:3}}>{user.email}</p>
                <p style={{fontSize:11,color:"#34d399",marginTop:5}}>✓ Google account connected</p>
              </div>
            </div>
          ) : (
            <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 18px",marginBottom:14}}>
              <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Sign in to save your progress and sync across devices.</p>
              <a href="/auth/google" style={{display:"inline-flex",alignItems:"center",gap:9,padding:"10px 20px",borderRadius:10,background:"#fff",color:"#1a1a1a",fontSize:13,fontWeight:700,textDecoration:"none",boxShadow:"0 2px 12px rgba(0,0,0,.2)"}}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </a>
            </div>
          )}
          {user && <a href="/auth/logout" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:9,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--muted)",fontSize:12,textDecoration:"none",fontWeight:600}}>Sign out</a>}
        </div>

        {/* Appearance — theme only */}
        <div className="fu1" style={card}>
          <p style={lbl}>Appearance</p>
          <p style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>Theme <span style={{fontSize:10,opacity:.5}}>(changes instantly)</span></p>
          <div style={{display:"flex",gap:8}}>
            {[["dark","🌙 Dark"],["light","☀️ Light"],["system","💻 System"]].map(([val,label])=>(
              <button key={val} onClick={()=>setTheme(val)} style={{
                padding:"10px 20px",borderRadius:10,cursor:"pointer",fontSize:13,
                fontWeight:theme===val?700:400,
                border:`1px solid ${theme===val?"#4f8ef740":"var(--border)"}`,
                background:theme===val?"#4f8ef715":"var(--surface2)",
                color:theme===val?"#4f8ef7":"var(--muted)",
                transition:"all .15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div style={{textAlign:"center",marginBottom:16}}>
          <button onClick={save} style={{padding:"12px 40px",borderRadius:12,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,background:saved?"linear-gradient(135deg,#34d399,#22c55e)":"linear-gradient(135deg,#4f8ef7,#a78bfa)",color:"#fff",boxShadow:"0 4px 20px #4f8ef730",transition:"all .2s"}}>
            {saved?"✓ Saved!":"Save Preferences"}
          </button>
        </div>

        {/* About */}
        <div className="fu2" style={card}>
          <p style={lbl}>About</p>
          <div style={{display:"flex",flexDirection:"column"}}>
            {[
              ["Platform",   "BharatLearn Dev Coach v2.0"],
              ["AI Model",   "Groq · Llama 3.1 · Mixtral 8x7B"],
              ["Backend",    "Node.js · Express · Passport · Helmet"],
              ["Features",   "Home · Dashboard · Syllabus · Debug · Quiz · Viva"],
              ["Security",   "Helmet · CORS · Rate Limiting · OWASP"],
              ["Built with", "Next.js 14 · TypeScript · Tailwind CSS"],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{k}</span>
                <span style={{fontSize:12,color:"var(--text)",textAlign:"right",flex:1,marginLeft:24}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:18,gap:8,flexWrap:"wrap"}}>
            {["Next.js 14","TypeScript","Groq AI","Tailwind","Express"].map(t=>(
              <span key={t} style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:"var(--surface2)",border:"1px solid var(--border)",color:"var(--muted)",fontWeight:600}}>{t}</span>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .wheel-and-hamster{--dur:1s;position:relative;width:10em;height:10em;font-size:14px}
        .wheel,.hamster,.hamster div,.spoke{position:absolute}
        .wheel,.spoke{border-radius:50%;top:0;left:0;width:100%;height:100%}
        .wheel{background:radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);z-index:2}
        .hamster{animation:hamster var(--dur) ease-in-out infinite;top:50%;left:calc(50% - 3.5em);width:7em;height:3.75em;transform:rotate(4deg) translate(-0.8em,1.85em);transform-origin:50% 0;z-index:1}
        .hamster__head{animation:hamsterHead var(--dur) ease-in-out infinite;background:hsl(30,90%,55%);border-radius:70% 30% 0 100%/40% 25% 25% 60%;box-shadow:0 -0.25em 0 hsl(30,90%,80%) inset,.75em -1.55em 0 hsl(30,90%,90%) inset;top:0;left:-2em;width:2.75em;height:2.5em;transform-origin:100% 50%}
        .hamster__ear{animation:hamsterEar var(--dur) ease-in-out infinite;background:hsl(0,90%,85%);border-radius:50%;box-shadow:-0.25em 0 hsl(30,90%,55%) inset;top:-0.25em;right:-0.25em;width:0.75em;height:0.75em;transform-origin:50% 75%}
        .hamster__eye{animation:hamsterEye var(--dur) linear infinite;background-color:hsl(0,0%,0%);border-radius:50%;top:0.375em;left:1.25em;width:0.5em;height:0.5em}
        .hamster__nose{background:hsl(0,90%,75%);border-radius:35% 65% 85% 15%/70% 50% 50% 30%;top:0.75em;left:0;width:0.2em;height:0.25em}
        .hamster__body{animation:hamsterBody var(--dur) ease-in-out infinite;background:hsl(30,90%,90%);border-radius:50% 30% 50% 30%/15% 60% 40% 40%;box-shadow:0.1em 0.75em 0 hsl(30,90%,55%) inset,.15em -0.5em 0 hsl(30,90%,80%) inset;top:0.25em;left:2em;width:4.5em;height:3em;transform-origin:17% 50%;transform-style:preserve-3d}
        .hamster__limb--fr,.hamster__limb--fl{clip-path:polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);top:2em;left:0.5em;width:1em;height:1.5em;transform-origin:50% 0}
        .hamster__limb--fr{animation:hamsterFRLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);transform:rotate(15deg) translateZ(-1px)}
        .hamster__limb--fl{animation:hamsterFLLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);transform:rotate(15deg)}
        .hamster__limb--br,.hamster__limb--bl{border-radius:0.75em 0.75em 0 0;clip-path:polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);top:1em;left:2.8em;width:1.5em;height:2.5em;transform-origin:50% 30%}
        .hamster__limb--br{animation:hamsterBRLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);transform:rotate(-25deg) translateZ(-1px)}
        .hamster__limb--bl{animation:hamsterBLLimb var(--dur) linear infinite;background:linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);transform:rotate(-25deg)}
        .hamster__tail{animation:hamsterTail var(--dur) linear infinite;background:hsl(0,90%,85%);border-radius:0.25em 50% 50% 0.25em;box-shadow:0 -0.2em 0 hsl(0,90%,75%) inset;top:1.5em;right:-0.5em;width:1em;height:0.5em;transform:rotate(30deg) translateZ(-1px);transform-origin:0.25em 0.25em}
        .spoke{animation:spoke var(--dur) linear infinite;background:radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50%/99% 99% no-repeat}
        @keyframes hamster{from,to{transform:rotate(4deg) translate(-0.8em,1.85em)}50%{transform:rotate(0) translate(-0.8em,1.85em)}}
        @keyframes hamsterHead{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(8deg)}}
        @keyframes hamsterEye{from,90%,to{transform:scaleY(1)}95%{transform:scaleY(0)}}
        @keyframes hamsterEar{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(12deg)}}
        @keyframes hamsterBody{from,25%,50%,75%,to{transform:rotate(0)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-2deg)}}
        @keyframes hamsterFRLimb{from,25%,50%,75%,to{transform:rotate(50deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-30deg) translateZ(-1px)}}
        @keyframes hamsterFLLimb{from,25%,50%,75%,to{transform:rotate(-30deg)}12.5%,37.5%,62.5%,87.5%{transform:rotate(50deg)}}
        @keyframes hamsterBRLimb{from,25%,50%,75%,to{transform:rotate(-60deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(20deg) translateZ(-1px)}}
        @keyframes hamsterBLLimb{from,25%,50%,75%,to{transform:rotate(20deg)}12.5%,37.5%,62.5%,87.5%{transform:rotate(-60deg)}}
        @keyframes hamsterTail{from,25%,50%,75%,to{transform:rotate(30deg) translateZ(-1px)}12.5%,37.5%,62.5%,87.5%{transform:rotate(10deg) translateZ(-1px)}}
        @keyframes spoke{from{transform:rotate(0)}to{transform:rotate(-1turn)}}
      `}</style>
    </>
  );
}
