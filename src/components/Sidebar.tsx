"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_TOP = [
  { href: "/home",      label: "Home",           icon: "home",     clr: "#4f8ef7" },
  { href: "/dashboard", label: "Dashboard",      icon: "grid",     clr: "#4f8ef7" },
  { href: "/quiz",      label: "Quiz Generator", icon: "quiz",     clr: "#34d399" },
  { href: "/learning",  label: "Learning Plan",  icon: "book",     clr: "#a78bfa" },
  { href: "/debug",     label: "Debug Code",     icon: "debug",    clr: "#f87171" },
  { href: "/viva",      label: "Viva Predictor", icon: "chat",     clr: "#fbbf24" },
];

const NAV_BOTTOM = [
  { href: "/settings",  label: "Settings",  icon: "settings", clr: "#64748b" },
];

type User = { name: string; email: string; avatar: string } | null;

const ICONS: Record<string, React.ReactNode> = {
  home:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  grid:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
  quiz:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  book:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  debug:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  chat:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  settings: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

function NavItem({ item, active, collapsed }: { item: typeof NAV_TOP[0]; active: boolean; collapsed: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Link href={item.href} title={item.label}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "11px" : "10px 12px",
          borderRadius: 11, textDecoration: "none",
          background: active ? `${item.clr}15` : hovered ? "rgba(255,255,255,.04)" : "transparent",
          border: `1px solid ${active ? item.clr + "28" : "transparent"}`,
          transition: "all .2s cubic-bezier(.22,1,.36,1)",
          position: "relative",
          transform: hovered && !active ? "translateX(2px)" : "none",
        }}>
        <span style={{
          color: active ? item.clr : hovered ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.35)",
          flexShrink: 0, display: "flex",
          transition: "color .2s, transform .2s",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}>{ICONS[item.icon]}</span>
        {!collapsed && <span style={{
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? "#fff" : hovered ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.5)",
          whiteSpace: "nowrap", transition: "color .2s",
        }}>{item.label}</span>}
        {active && !collapsed && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: item.clr, flexShrink: 0, boxShadow: `0 0 8px ${item.clr}60` }} />}
        {active && collapsed && <span style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "3px 0 0 3px", background: item.clr, boxShadow: `0 0 8px ${item.clr}40` }} />}
      </Link>
      {/* Tooltip for collapsed */}
      {collapsed && hovered && (
        <div style={{
          position: "absolute", left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)",
          background: "rgba(10,16,32,.95)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,.12)", borderRadius: 8,
          padding: "6px 12px", whiteSpace: "nowrap", zIndex: 100,
          fontSize: 12, fontWeight: 600, color: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,.4)",
          animation: "fadeIn .15s ease",
        }}>
          {item.label}
          <div style={{
            position: "absolute", left: -4, top: "50%", transform: "translateY(-50%) rotate(45deg)",
            width: 8, height: 8, background: "rgba(10,16,32,.95)",
            borderLeft: "1px solid rgba(255,255,255,.12)", borderBottom: "1px solid rgba(255,255,255,.12)",
          }} />
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const [user, setUser] = useState<User>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("bl_token");
    if (!token) return;
    fetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => d.user && setUser(d.user)).catch(() => {});
  }, []);

  const w = collapsed ? 68 : 230;

  return (
    <aside style={{
      width: w, flexShrink: 0,
      background: "rgba(8,13,26,.97)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255,255,255,.06)",
      display: "flex", flexDirection: "column",
      transition: "width .3s cubic-bezier(.22,1,.36,1)",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(180deg,rgba(79,142,247,.06) 0%,transparent 100%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", minHeight: 68 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, overflow: "hidden" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "linear-gradient(135deg,#4f8ef7,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff", boxShadow: "0 0 24px #4f8ef740", transition: "transform .2s", cursor: "pointer" }}>B</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-.3px", whiteSpace: "nowrap" }}>BharatLearn</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2, whiteSpace: "nowrap" }}>Dev Coach · AI</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button aria-label="Collapse sidebar" onClick={() => setCollapsed(true)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer", color: "rgba(255,255,255,.3)", padding: 6, borderRadius: 8, display: "flex", transition: "all .15s" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
      </div>

      {collapsed && (
        <button aria-label="Expand sidebar" onClick={() => setCollapsed(false)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", cursor: "pointer", color: "rgba(255,255,255,.3)", padding: 6, margin: "10px auto", display: "flex", borderRadius: 8, transition: "all .15s" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {!collapsed && <div style={{ fontSize: 9, color: "rgba(255,255,255,.2)", letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", padding: "6px 8px 10px" }}>Navigation</div>}

        {NAV_TOP.map(item => (
          <NavItem key={item.href} item={item} active={path === item.href || path.startsWith(item.href + "/")} collapsed={collapsed} />
        ))}

        <div style={{ height: 1, background: "rgba(255,255,255,.05)", margin: "10px 4px" }} />
        {!collapsed && <div style={{ fontSize: 9, color: "rgba(255,255,255,.2)", letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", padding: "6px 8px 10px" }}>More</div>}

        {NAV_BOTTOM.map(item => (
          <NavItem key={item.href} item={item} active={path === item.href} collapsed={collapsed} />
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 10px 16px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 9, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px" : "10px 12px", borderRadius: 11, background: "rgba(255,255,255,.04)", transition: "background .15s" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar} alt="" width={30} height={30} style={{ borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(79,142,247,.3)" }} />
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <a href="#" onClick={e => { e.preventDefault(); localStorage.removeItem("bl_token"); setUser(null); }} style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>Sign out</a>
              </div>
            )}
          </div>
        ) : (
          <a href="/auth/google" style={{
            display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 8, padding: collapsed ? "10px" : "10px 14px",
            borderRadius: 11, textDecoration: "none",
            background: "rgba(79,142,247,.12)", border: "1px solid rgba(79,142,247,.2)",
            fontSize: 12, fontWeight: 600, color: "#fff", transition: "all .2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {!collapsed && <span>Sign in with Google</span>}
          </a>
        )}
      </div>
    </aside>
  );
}
