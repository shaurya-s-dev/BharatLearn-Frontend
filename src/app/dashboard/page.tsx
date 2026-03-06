"use client";
import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Empty starting state — will fill as user studies
const emptyActivity = [
  {day:"Mon",mins:0},{day:"Tue",mins:0},{day:"Wed",mins:0},
  {day:"Thu",mins:0},{day:"Fri",mins:0},{day:"Sat",mins:0},{day:"Sun",mins:0},
];
const emptyMastery = [
  {name:"Variables",pct:0},{name:"Loops",pct:0},{name:"Functions",pct:0},
  {name:"OOP",pct:0},{name:"Recursion",pct:0},{name:"DS&A",pct:0},
];
const emptyStreak = Array(30).fill(0);

const QUOTES = [
  "The expert in anything was once a beginner. 🌱",
  "Code is like humour. When you have to explain it, it's bad. 😄",
  "First, solve the problem. Then, write the code. 💡",
  "Learning never exhausts the mind. — Leonardo da Vinci 🎨",
  "The best time to start was yesterday. The next best time is now. ⚡",
];

const TT = ({active,payload,label}:any) => !active ? null : (
  <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",fontSize:11}}>
    <b style={{color:"var(--text)"}}>{label}</b>
    {payload?.map((p:any)=><div key={p.name} style={{color:p.color,marginTop:3}}>{p.name}: {p.value}</div>)}
  </div>
);

export default function Dashboard() {
  const [m, setM]       = useState(false);
  const [user, setUser] = useState<any>(null);
  const [quote, setQuote] = useState("");
  const today = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  useEffect(() => {
    setM(true);
    setQuote(QUOTES[new Date().getDay() % QUOTES.length]);
    fetch("/auth/me",{credentials:"include"})
      .then(r=>r.json()).then(d=>{ if(d.user) setUser(d.user); }).catch(()=>{});
  }, []);

  const card: React.CSSProperties = {
    borderRadius:14, padding:"20px 22px",
    background:"var(--surface)", border:"1px solid var(--border)",
  };

  const stats = [
    {label:"Study Streak", val:"0d",   sub:"Start your streak today!", clr:"#fbbf24", icon:"🔥", pct:0},
    {label:"Topics Done",  val:"0/20", sub:"Pick a topic to begin",    clr:"#4f8ef7", icon:"📚", pct:0},
    {label:"This Week",    val:"0m",   sub:"Study 30+ min daily",      clr:"#a78bfa", icon:"⏱",  pct:0},
    {label:"Mastery",      val:"0%",   sub:"Complete quizzes to track",clr:"#34d399", icon:"🎯", pct:0},
  ];

  return (
    <div style={{padding:"28px 32px",background:"var(--bg)",minHeight:"100%"}}>

      {/* Header */}
      <div className="fu" style={{marginBottom:20,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:900,color:"var(--text)",letterSpacing:"-.5px"}}>
            {user ? `Hey, ${user.name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{today}</p>
        </div>
        {user && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" width={42} height={42}
            style={{borderRadius:"50%",border:"2px solid rgba(79,142,247,.4)",boxShadow:"0 0 16px #4f8ef730"}} />
        )}
      </div>

      {/* Daily quote */}
      {quote && (
        <div className="fu" style={{
          marginBottom:20, padding:"12px 16px",
          background:"linear-gradient(135deg,rgba(79,142,247,.08),rgba(167,139,250,.08))",
          border:"1px solid rgba(79,142,247,.15)", borderRadius:12,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{fontSize:18}}>✨</span>
          <p style={{fontSize:13,color:"var(--muted)",fontStyle:"italic"}}>{quote}</p>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        {stats.map((s,i)=>(
          <div key={s.label} className={`fu${i}`} style={{...card,padding:"20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <p style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700}}>{s.label}</p>
              <span style={{fontSize:18}}>{s.icon}</span>
            </div>
            <p className="mono" style={{fontSize:30,fontWeight:900,color:s.clr,lineHeight:1}}>{s.val}</p>
            <p style={{fontSize:11,color:"var(--muted)",marginTop:6}}>{s.sub}</p>
            <div style={{height:3,background:"var(--surface2)",borderRadius:99,marginTop:12,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${s.pct}%`,background:s.clr,borderRadius:99}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
        <div className="fu1" style={card}>
          <p style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:14}}>📈 Weekly Activity (minutes)</p>
          {m && <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={emptyActivity}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f8ef7" stopOpacity={.35}/>
                  <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="day" tick={{fill:"var(--muted)" as any,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--muted)" as any,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="mins" name="mins" stroke="#4f8ef7" strokeWidth={2} fill="url(#ga)" dot={{fill:"#4f8ef7",r:3}}/>
            </AreaChart>
          </ResponsiveContainer>}
          <p style={{textAlign:"center",fontSize:11,color:"var(--muted)",marginTop:8}}>Complete quizzes to track activity here</p>
        </div>

        <div className="fu1" style={card}>
          <p style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:14}}>🎯 Topic Mastery (%)</p>
          {m && <ResponsiveContainer width="100%" height={180}>
            <BarChart data={emptyMastery} layout="vertical" margin={{left:0,right:24}}>
              <XAxis type="number" domain={[0,100]} tick={{fill:"var(--muted)" as any,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{fill:"var(--text)" as any,fontSize:10}} axisLine={false} tickLine={false} width={70}/>
              <Tooltip content={<TT/>} cursor={{fill:"rgba(255,255,255,.03)"}}/>
              <Bar dataKey="pct" name="mastery" fill="#a78bfa" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>}
          <p style={{textAlign:"center",fontSize:11,color:"var(--muted)",marginTop:8}}>Take quizzes to build mastery</p>
        </div>
      </div>

      {/* Streak + Getting Started */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
        <div className="fu2" style={card}>
          <p style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:14}}>🔥 30-Day Streak</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:5,marginBottom:14}}>
            {emptyStreak.map((_,i)=>(
              <div key={i} style={{height:24,borderRadius:6,background:"var(--surface2)",border:"1px solid var(--border)"}}/>
            ))}
          </div>
          <p style={{fontSize:11,color:"var(--muted)"}}>✨ Study today to start your streak!</p>
        </div>

        {/* Getting Started card instead of weak areas (since user is new) */}
        <div className="fu2" style={card}>
          <p style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:14}}>🚀 Get Started</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {icon:"◈",label:"Take your first quiz",     href:"/quiz",     clr:"#34d399",done:false},
              {icon:"⊞",label:"Build your learning plan", href:"/learning", clr:"#a78bfa",done:false},
              {icon:"⊙",label:"Debug some code",          href:"/debug",    clr:"#f87171",done:false},
              {icon:"◉",label:"Try a viva session",       href:"/viva",     clr:"#fbbf24",done:false},
            ].map(a=>(
              <a key={a.href} href={a.href} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                borderRadius:10,textDecoration:"none",
                background:`${a.clr}10`,border:`1px solid ${a.clr}20`,
                transition:"all .15s",
              }}>
                <span style={{color:a.clr,fontSize:16}}>{a.icon}</span>
                <span style={{fontSize:12,fontWeight:600,color:"var(--text)",flex:1}}>{a.label}</span>
                <span style={{color:a.clr,fontSize:12}}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fu3" style={card}>
        <p style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:14}}>⚡ Quick Actions</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[
            {label:"Generate Quiz",  href:"/quiz",     clr:"#34d399",icon:"◈"},
            {label:"Debug Code",     href:"/debug",    clr:"#f87171",icon:"⊙"},
            {label:"Learning Plan",  href:"/learning", clr:"#a78bfa",icon:"⊞"},
            {label:"Viva Practice",  href:"/viva",     clr:"#fbbf24",icon:"◉"},
          ].map(a=>(
            <a key={a.href} href={a.href} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:8,
              padding:"16px 12px",borderRadius:12,textDecoration:"none",
              background:`${a.clr}10`,border:`1px solid ${a.clr}25`,
              transition:"all .15s",
            }}>
              <span style={{fontSize:22,color:a.clr}}>{a.icon}</span>
              <span style={{fontSize:11,fontWeight:600,color:"var(--text)",textAlign:"center"}}>{a.label}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
