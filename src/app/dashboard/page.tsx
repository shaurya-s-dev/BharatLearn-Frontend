"use client";
import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getActivity, getWeeklyActivity, getTopicMastery, get30DayStreak, getTotalMinsThisWeek, getAvgMastery } from "@/lib/activity";
import { AuthHandler } from "@/components/AuthHandler";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

const QUOTES = [
  "The expert in anything was once a beginner. \u{1F331}",
  "Code is like humour. When you have to explain it, it\u2019s bad. \u{1F604}",
  "First, solve the problem. Then, write the code. \u{1F4A1}",
  "Learning never exhausts the mind. \u2014 Leonardo da Vinci \u{1F3A8}",
  "The best time to start was yesterday. The next best time is now. \u26A1",
];

const TT = ({ active, payload, label }: any) =>
  !active ? null : (
    <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[11px]">
      <b className="text-[var(--text)]">{label}</b>
      {payload?.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="mt-0.5">
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );

function StatCard({ label, val, sub, clr, icon, pct, flash, delay }: any) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-2xl p-[22px] border transition-all duration-400 group"
      style={{
        background: flash ? `${clr}10` : "var(--surface)",
        borderColor: flash ? `${clr}40` : "var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[9px] text-[var(--muted)] uppercase tracking-[2px] font-bold">{label}</p>
        <span className="text-xl transition-transform duration-300 group-hover:scale-125">{icon}</span>
      </div>
      <p className="text-[32px] font-black leading-none mono transition-all duration-300" style={{ color: clr }}>
        {val}
      </p>
      <p className="text-[11px] text-[var(--muted)] mt-2">{sub}</p>
      <div className="h-1 bg-[var(--surface2)] rounded-full mt-3.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay || 0 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${clr}, ${clr}aa)` }}
        />
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [quote, setQuote] = useState("");
  const [activity, setActivity] = useState<any>(null);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [mastery, setMastery] = useState<any[]>([]);
  const [streak30, setStreak30] = useState<number[]>([]);
  const [totalMins, setTotalMins] = useState(0);
  const [avgMastery, setAvgMastery] = useState(0);
  const [flashStats, setFlashStats] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const loadActivity = useCallback((flash = false) => {
    setActivity(getActivity());
    setWeekData(getWeeklyActivity());
    setMastery(getTopicMastery());
    setStreak30(get30DayStreak());
    setTotalMins(getTotalMinsThisWeek());
    setAvgMastery(getAvgMastery());
    if (flash) {
      setFlashStats(true);
      setLastUpdate(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      setTimeout(() => setFlashStats(false), 1500);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setQuote(QUOTES[new Date().getDay() % QUOTES.length]);
    const token = localStorage.getItem("bl_token");
    if (token) {
      fetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { if (d.user) setUser(d.user); })
        .catch(() => {});
    }
    loadActivity();
    const onStorage = (e: StorageEvent) => { if (e.key === "bl_activity") loadActivity(true); };
    window.addEventListener("storage", onStorage);
    const onActivity = () => loadActivity(true);
    window.addEventListener("bl_activity_updated", onActivity);
    const t = setInterval(() => loadActivity(), 10_000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bl_activity_updated", onActivity);
      clearInterval(t);
    };
  }, [loadActivity]);

  const topicsDone = activity ? Object.keys(activity.topicScores ?? {}).length : 0;

  const stats = [
    { label: "Study Streak", val: `${activity?.streak ?? 0}d`, sub: activity?.streak > 0 ? "Keep it up! \u{1F525}" : "Start your streak today!", clr: "#fbbf24", icon: "\u{1F525}", pct: Math.min((activity?.streak ?? 0) * 10, 100) },
    { label: "Topics Done", val: `${topicsDone}/20`, sub: topicsDone > 0 ? `${topicsDone} topic${topicsDone > 1 ? "s" : ""} mastered` : "Pick a topic to begin", clr: "#4f8ef7", icon: "\u{1F4DA}", pct: (topicsDone / 20) * 100 },
    { label: "This Week", val: `${totalMins}m`, sub: totalMins >= 30 ? "Great work this week! \u{1F4AA}" : "Study 30+ min daily", clr: "#a78bfa", icon: "\u23F1", pct: Math.min((totalMins / 210) * 100, 100) },
    { label: "Mastery", val: `${avgMastery}%`, sub: avgMastery > 0 ? `Avg across ${topicsDone} topics` : "Complete quizzes to track", clr: "#34d399", icon: "\u{1F3AF}", pct: avgMastery },
  ];

  const weakTopics = mastery.filter((m) => m.pct > 0 && m.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, 3);
  const getStartedItems = [
    { icon: "\u25C8", label: "Take your first quiz", href: "/quiz", clr: "#34d399", done: topicsDone > 0 },
    { icon: "\u229E", label: "Build your learning plan", href: "/learning", clr: "#a78bfa", done: false },
    { icon: "\u2299", label: "Debug some code", href: "/debug", clr: "#f87171", done: false },
    { icon: "\u25C9", label: "Try a viva session", href: "/viva", clr: "#fbbf24", done: false },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="page p-7 min-h-full"
    >
      <AuthHandler />

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">
            {user ? `Hey, ${user.name.split(" ")[0]} \u{1F44B}` : "Dashboard"}
          </h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34d39915] border border-[#34d39930]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] inline-block" />
              <span className="text-[10px] text-[#34d399] font-semibold">Updated {lastUpdate}</span>
            </div>
          )}
          {user && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" width={42} height={42}
              className="rounded-full border-2 border-brand/40 shadow-[0_0_16px_rgba(79,142,247,0.19)]" />
          )}
        </div>
      </motion.div>

      {/* Quote */}
      {quote && (
        <motion.div variants={fadeUp} className="mb-5 px-4 py-3 bg-gradient-to-r from-brand/[0.08] to-purple-500/[0.08] border border-brand/[0.15] rounded-xl flex items-center gap-2.5">
          <span className="text-lg">{"\u2728"}</span>
          <p className="text-[13px] text-[var(--muted)] italic">{quote}</p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-3.5 mb-[22px]">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} flash={flashStats} delay={i * 0.06} />
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 max-lg:grid-cols-1 gap-4 mb-[18px]">
        <div className="card rounded-[14px] p-5">
          <p className="label mb-3.5">{"\u{1F4C8}"} Weekly Activity (minutes)</p>
          {mounted && (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--muted)" as any, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted)" as any, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} />
                <Area type="monotone" dataKey="mins" name="mins" stroke="#4f8ef7" strokeWidth={2} fill="url(#ga)" dot={{ fill: "#4f8ef7", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {totalMins === 0 && <p className="text-center text-[11px] text-[var(--muted)] mt-2">Complete quizzes to track activity here</p>}
        </div>

        <div className="card rounded-[14px] p-5">
          <p className="label mb-3.5">{"\u{1F3AF}"} Topic Mastery (%)</p>
          {mounted && (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={mastery} layout="vertical" margin={{ left: 0, right: 24 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted)" as any, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--text)" as any, fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<TT />} cursor={{ fill: "rgba(255,255,255,.03)" }} />
                <Bar dataKey="pct" name="mastery %" fill="#a78bfa" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {avgMastery === 0 && <p className="text-center text-[11px] text-[var(--muted)] mt-2">Take quizzes to build mastery</p>}
        </div>
      </motion.div>

      {/* Streak + Weak/Get Started */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 max-lg:grid-cols-1 gap-4 mb-[18px]">
        <div className="card rounded-[14px] p-5">
          <p className="label mb-3.5">{"\u{1F525}"} 30-Day Streak</p>
          <div className="grid grid-cols-10 gap-[5px] mb-3.5">
            {streak30.map((active, i) => (
              <div
                key={i}
                className="h-6 rounded-md transition-all duration-300"
                style={{
                  background: active ? "#fbbf24" : "var(--surface2)",
                  border: `1px solid ${active ? "rgba(251,191,36,0.25)" : "var(--border)"}`,
                  boxShadow: active ? "0 0 8px rgba(251,191,36,0.19)" : "none",
                }}
              />
            ))}
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            {activity?.streak > 0 ? `\u{1F525} ${activity.streak}-day streak! Keep going!` : "\u2728 Study today to start your streak!"}
          </p>
        </div>

        <div className="card rounded-[14px] p-5">
          {weakTopics.length > 0 ? (
            <>
              <p className="label mb-3.5">{"\u26A0\uFE0F"} Topics to Improve</p>
              <div className="flex flex-col gap-2.5">
                {weakTopics.map((t) => (
                  <a
                    key={t.name}
                    href="/quiz"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] no-underline bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.15)] hover:bg-[rgba(248,113,113,0.1)] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold text-[var(--text)]">{t.name}</span>
                        <span className="text-[11px] text-[#f87171] mono">{t.pct}%</span>
                      </div>
                      <div className="h-1 bg-[var(--surface2)] rounded-full">
                        <div className="h-full bg-[#f87171] rounded-full transition-[width] duration-600" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                    <span className="text-[#f87171] text-xs">{"\u2192"}</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="label mb-3.5">{"\u{1F680}"} Get Started</p>
              <div className="flex flex-col gap-2.5">
                {getStartedItems.map((a) => (
                  <a
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] no-underline transition-colors hover:brightness-110"
                    style={{
                      background: `${a.clr}10`,
                      border: `1px solid ${a.clr}20`,
                      opacity: a.done ? 0.5 : 1,
                    }}
                  >
                    <span style={{ color: a.clr }} className="text-base">{a.icon}</span>
                    <span className="text-xs font-semibold text-[var(--text)] flex-1">
                      {a.done ? "\u2713 " : ""}{a.label}
                    </span>
                    <span style={{ color: a.clr }} className="text-xs">{"\u2192"}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="card rounded-[14px] p-5">
        <p className="label mb-3.5">{"\u26A1"} Quick Actions</p>
        <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-2.5">
          {[
            { label: "Generate Quiz", href: "/quiz", clr: "#34d399", icon: "\u25C8" },
            { label: "Debug Code", href: "/debug", clr: "#f87171", icon: "\u2299" },
            { label: "Learning Plan", href: "/learning", clr: "#a78bfa", icon: "\u229E" },
            { label: "Viva Practice", href: "/viva", clr: "#fbbf24", icon: "\u25C9" },
          ].map((a) => (
            <motion.a
              key={a.href}
              href={a.href}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 py-[18px] px-3 rounded-[14px] no-underline transition-all"
              style={{ background: `${a.clr}10`, border: `1px solid ${a.clr}25` }}
            >
              <span className="text-2xl" style={{ color: a.clr }}>{a.icon}</span>
              <span className="text-xs font-semibold text-[var(--text)] text-center">{a.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
