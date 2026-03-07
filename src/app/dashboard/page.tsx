"use client";
import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getActivity, getWeeklyActivity, getTopicMastery, get30DayStreak, getTotalMinsThisWeek, getAvgMastery } from "@/lib/activity";
import { AuthHandler } from "@/components/AuthHandler";

const QUOTES = [
  "The expert in anything was once a beginner. 🌱",
  "Code is like humour. When you have to explain it, it's bad. 😄",
  "First, solve the problem. Then, write the code. 💡",
  "Learning never exhausts the mind. — Leonardo da Vinci 🎨",
  "The best time to start was yesterday. The next best time is now. ⚡",
];

const TT = ({ active, payload, label }: any) => !active ? null : (
  <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:11 }}>
    <b style={{ color:"var(--text)" }}>{label}</b>
    {payload?.map((p: any) => <div key={p.name} style={{ color:p.color, marginTop:3 }}>{p.name}: {p.value}</div>)}
  </div>
);

export default function Dashboard() {
  const [mounted,    setMounted]    = useState(false);
  const [user,       setUser]       = useState<any>(null);
  const [quote,      setQuote]      = useState("");
  const [activity,   setActivity]   = useState<any>(null);
  const [weekData,   setWeekData]   = useState<any[]>([]);
  const [mastery,    setMastery]    = useState<any[]>([]);
  const [streak30,   setStreak30]   = useState<number[]>([]);
  const [totalMins,  setTotalMins]  = useState(0);
  const [avgMastery, setAvgMastery] = useState(0);

  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[new Date().getDay() % QUOTES.length]);

    // Load user
    const token = localStorage.getItem("bl_token");
    if (token) {
      fetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    }

    // Load local activity
    const data = getActivity();
    setActivity(data);
    setWeekData(getWeeklyActivity());
    setMastery(getTopicMastery());
    setStreak30(get30DayStreak());
    setTotalMins(getTotalMinsThisWeek());
    setAvgMastery(getAvgMastery());
  }, []);

  // Refresh every 30s in case user does something in another tab
  useEffect(() => {
    const t = setInterval(() => {
      setActivity(getActivity());
      setWeekData(getWeeklyActivity());
      setMastery(getTopicMastery());
      setStreak30(get30DayStreak());
      setTotalMins(getTotalMinsThisWeek());
      setAvgMastery(getAvgMastery());
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const card: React.CSSProperties = {
    borderRadius:14, padding:"20px 22px",
    background:"var(--surface)", border:"1px solid var(--border)",
  };

  const topicsDone = activity ? Object.keys(activity.topicScores).length : 0;

  const stats = [
    { label:"Study Streak", val:`${activity?.streak ?? 0}d`,   sub: activity?.streak > 0 ? "Keep it up! 🔥" : "Start your streak today!", clr:"#fbbf24", icon:"🔥", pct: Math.min((activity?.streak ?? 0) * 10, 100) },
    { label:"Topics Done",  val:`${topicsDone}/20`,            sub: topicsDone > 0 ? `${topicsDone} topic${topicsDone > 1 ? "s" : ""} mastered` : "Pick a topic to begin", clr:"#4f8ef7", icon:"📚", pct: (topicsDone / 20) * 100 },
    { label:"This Week",    val:`${totalMins}m`,                sub: totalMins >= 30 ? "Great work this week! 💪" : "Study 30+ min daily",      clr:"#a78bfa", icon:"⏱",  pct: Math.min((totalMins / 210) * 100, 100) },
    { label:"Mastery",      val:`${avgMastery}%`,               sub: avgMastery > 0 ? `Avg across ${topicsDone} topics` : "Complete quizzes to track", clr:"#34d399", icon:"🎯", pct: avgMastery },
  ];

  // Get top 3 weakest topics for suggestions
  const weakTopics = mastery.filter(m => m.pct > 0 && m.pct < 70).sort((a,b) => a.pct - b.pct).slice(0, 3);

  const getStartedItems = [
    { icon:"◈", label:"Take your first quiz",     href:"/quiz",     clr:"#34d399", done: topicsDone > 0 },
    { icon:"⊞", label:"Build your learning plan", href:"/learning", clr:"#a78bfa", done: false },
    { icon:"⊙", label:"Debug some code",           href:"/debug",    clr:"#f87171", done: false },
    { icon:"◉", label:"Try a viva session",        href:"/viva",     clr:"#fbbf24", done: false },
  ];

  return (
    <div style={{ padding:"28px 32px", background:"var(--bg)", minHeight:"100%" }}>
      <AuthHandler />

      {/* Header */}
      <div style={{ marginBottom:20, display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:"var(--text)", letterSpacing:"-.5px" }}>
            {user ? `Hey, ${user.name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>{today}</p>
        </div>
        {user && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" width={42} height={42}
            style={{ borderRadius:"50%", border:"2px solid rgba(79,142,247,.4)", boxShadow:"0 0 16px #4f8ef730" }} />
        )}
      </div>

      {/* Quote */}
      {quote && (
        <div style={{
          marginBottom:20, padding:"12px 16px",
          background:"linear-gradient(135deg,rgba(79,142,247,.08),rgba(167,139,250,.08))",
          border:"1px solid rgba(79,142,247,.15)", borderRadius:12,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:18 }}>✨</span>
          <p style={{ fontSize:13, color:"var(--muted)", fontStyle:"italic" }}>{quote}</p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <p style={{ fontSize:9, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700 }}>{s.label}</p>
              <span style={{ fontSize:18 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize:30, fontWeight:900, color:s.clr, lineHeight:1, fontFamily:"monospace" }}>{s.val}</p>
            <p style={{ fontSize:11, color:"var(--muted)", marginTop:6 }}>{s.sub}</p>
            <div style={{ height:3, background:"var(--surface2)", borderRadius:99, marginTop:12, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${s.pct}%`, background:s.clr, borderRadius:99, transition:"width 0.5s ease" }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
        <div style={card}>
          <p style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:14 }}>📈 Weekly Activity (minutes)</p>
          {mounted && <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f8ef7" stopOpacity={.35}/>
                  <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="day" tick={{ fill:"var(--muted)" as any, fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"var(--muted)" as any, fontSize:10 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="mins" name="mins" stroke="#4f8ef7" strokeWidth={2} fill="url(#ga)" dot={{ fill:"#4f8ef7", r:3 }}/>
            </AreaChart>
          </ResponsiveContainer>}
          {totalMins === 0 && <p style={{ textAlign:"center", fontSize:11, color:"var(--muted)", marginTop:8 }}>Complete quizzes to track activity here</p>}
        </div>

        <div style={card}>
          <p style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:14 }}>🎯 Topic Mastery (%)</p>
          {mounted && <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mastery} layout="vertical" margin={{ left:0, right:24 }}>
              <XAxis type="number" domain={[0,100]} tick={{ fill:"var(--muted)" as any, fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fill:"var(--text)" as any, fontSize:10 }} axisLine={false} tickLine={false} width={70}/>
              <Tooltip content={<TT/>} cursor={{ fill:"rgba(255,255,255,.03)" }}/>
              <Bar dataKey="pct" name="mastery %" fill="#a78bfa" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>}
          {avgMastery === 0 && <p style={{ textAlign:"center", fontSize:11, color:"var(--muted)", marginTop:8 }}>Take quizzes to build mastery</p>}
        </div>
      </div>

      {/* Streak + Weak Areas / Get Started */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
        <div style={card}>
          <p style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:14 }}>🔥 30-Day Streak</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:5, marginBottom:14 }}>
            {streak30.map((active, i) => (
              <div key={i} style={{
                height:24, borderRadius:6,
                background: active ? "#fbbf24" : "var(--surface2)",
                border:`1px solid ${active ? "#fbbf2440" : "var(--border)"}`,
                boxShadow: active ? "0 0 8px #fbbf2430" : "none",
                transition:"all .2s"
              }}/>
            ))}
          </div>
          <p style={{ fontSize:11, color:"var(--muted)" }}>
            {activity?.streak > 0
              ? `🔥 ${activity.streak}-day streak! Keep going!`
              : "✨ Study today to start your streak!"}
          </p>
        </div>

        <div style={card}>
          {weakTopics.length > 0 ? (
            <>
              <p style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:14 }}>⚠️ Topics to Improve</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {weakTopics.map(t => (
                  <a key={t.name} href="/quiz" style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    borderRadius:10, textDecoration:"none",
                    background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.15)",
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{t.name}</span>
                        <span style={{ fontSize:11, color:"#f87171", fontFamily:"monospace" }}>{t.pct}%</span>
                      </div>
                      <div style={{ height:4, background:"var(--surface2)", borderRadius:99 }}>
                        <div style={{ height:"100%", width:`${t.pct}%`, background:"#f87171", borderRadius:99 }}/>
                      </div>
                    </div>
                    <span style={{ color:"#f87171", fontSize:12 }}>→</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:14 }}>🚀 Get Started</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {getStartedItems.map(a => (
                  <a key={a.href} href={a.href} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    borderRadius:10, textDecoration:"none",
                    background:`${a.clr}10`, border:`1px solid ${a.clr}20`,
                    opacity: a.done ? 0.5 : 1,
                  }}>
                    <span style={{ color:a.clr, fontSize:16 }}>{a.icon}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", flex:1 }}>
                      {a.done ? "✓ " : ""}{a.label}
                    </span>
                    <span style={{ color:a.clr, fontSize:12 }}>→</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={card}>
        <p style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:14 }}>⚡ Quick Actions</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Generate Quiz",  href:"/quiz",     clr:"#34d399", icon:"◈" },
            { label:"Debug Code",     href:"/debug",    clr:"#f87171", icon:"⊙" },
            { label:"Learning Plan",  href:"/learning", clr:"#a78bfa", icon:"⊞" },
            { label:"Viva Practice",  href:"/viva",     clr:"#fbbf24", icon:"◉" },
          ].map(a => (
            <a key={a.href} href={a.href} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              padding:"16px 12px", borderRadius:12, textDecoration:"none",
              background:`${a.clr}10`, border:`1px solid ${a.clr}25`,
              transition:"all .15s",
            }}>
              <span style={{ fontSize:22, color:a.clr }}>{a.icon}</span>
              <span style={{ fontSize:11, fontWeight:600, color:"var(--text)", textAlign:"center" }}>{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
