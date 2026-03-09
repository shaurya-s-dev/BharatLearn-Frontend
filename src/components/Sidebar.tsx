"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

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

function NavItem({
  item,
  active,
  collapsed,
}: {
  item: (typeof NAV_TOP)[0];
  active: boolean;
  collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <Link
        href={item.href}
        title={item.label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          "flex items-center rounded-xl no-underline transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5",
          active && "border",
          !active && "border border-transparent",
        )}
        style={{
          background: active
            ? `${item.clr}15`
            : hovered
              ? "rgba(255,255,255,0.04)"
              : "transparent",
          borderColor: active ? `${item.clr}28` : "transparent",
          transform: hovered && !active ? "translateX(2px)" : "none",
        }}
      >
        <motion.span
          className="flex-shrink-0 flex transition-colors duration-200"
          style={{
            color: active
              ? item.clr
              : hovered
                ? "rgba(255,255,255,0.6)"
                : "rgba(255,255,255,0.35)",
          }}
          whileHover={{ scale: 1.1 }}
        >
          {ICONS[item.icon]}
        </motion.span>

        {!collapsed && (
          <span
            className={clsx(
              "text-[13px] whitespace-nowrap transition-colors duration-200",
              active ? "font-semibold text-white" : "font-normal",
            )}
            style={{
              color: active
                ? "#fff"
                : hovered
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(255,255,255,0.5)",
            }}
          >
            {item.label}
          </span>
        )}

        {active && !collapsed && (
          <motion.span
            layoutId="active-dot"
            className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: item.clr,
              boxShadow: `0 0 8px ${item.clr}60`,
            }}
          />
        )}

        {active && collapsed && (
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l"
            style={{
              background: item.clr,
              boxShadow: `0 0 8px ${item.clr}40`,
            }}
          />
        )}
      </Link>

      {/* Tooltip for collapsed */}
      <AnimatePresence>
        {collapsed && hovered && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[100]
              bg-[rgba(10,16,32,0.95)] backdrop-blur-xl border border-white/[0.12] rounded-lg
              px-3 py-1.5 whitespace-nowrap text-xs font-semibold text-white shadow-xl"
          >
            {item.label}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-[rgba(10,16,32,0.95)] border-l border-b border-white/[0.12]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const [user, setUser] = useState<User>(null);
  const [collapsed, setCollapsed] = useState(false);

  const fetchUser = useCallback(() => {
    const token = localStorage.getItem("bl_token");
    if (!token) return;
    fetch("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 230 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 flex flex-col overflow-hidden relative
        bg-[rgba(8,13,26,0.97)] backdrop-blur-2xl border-r border-white/[0.06]"
    >
      {/* Top gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-gradient-to-b from-[rgba(79,142,247,0.06)] to-transparent pointer-events-none" />

      {/* Logo */}
      <div
        className={clsx(
          "px-4 pt-[18px] pb-3.5 border-b border-white/5 flex items-center min-h-[68px]",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex items-center gap-[11px] overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-[38px] h-[38px] rounded-xl flex-shrink-0 bg-gradient-brand flex items-center justify-center font-black text-lg text-white shadow-[0_0_24px_rgba(79,142,247,0.25)] cursor-pointer"
          >
            B
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-sm font-extrabold text-white tracking-tight whitespace-nowrap">
                BharatLearn
              </div>
              <div className="text-[10px] text-white/30 mt-0.5 whitespace-nowrap">
                Dev Coach · AI
              </div>
            </motion.div>
          )}
        </div>
        {!collapsed && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Collapse sidebar"
            onClick={() => setCollapsed(true)}
            className="bg-white/5 border border-white/[0.08] cursor-pointer text-white/30 p-1.5 rounded-lg flex transition-colors hover:bg-white/10"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
        )}
      </div>

      {collapsed && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Expand sidebar"
          onClick={() => setCollapsed(false)}
          className="bg-white/5 border border-white/[0.08] cursor-pointer text-white/30 p-1.5 mx-auto my-2.5 flex rounded-lg transition-colors hover:bg-white/10"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {!collapsed && (
          <div className="text-[9px] text-white/20 tracking-[2px] font-bold uppercase px-2 py-1.5 pb-2.5">
            Navigation
          </div>
        )}

        {NAV_TOP.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={path === item.href || path.startsWith(item.href + "/")}
            collapsed={collapsed}
          />
        ))}

        <div className="h-px bg-white/5 mx-1 my-2.5" />

        {!collapsed && (
          <div className="text-[9px] text-white/20 tracking-[2px] font-bold uppercase px-2 py-1.5 pb-2.5">
            More
          </div>
        )}

        {NAV_BOTTOM.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={path === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User */}
      <div className="px-2.5 py-3 pb-4 border-t border-white/5">
        {user ? (
          <div
            className={clsx(
              "flex items-center rounded-xl bg-white/[0.04] transition-colors",
              collapsed ? "justify-center p-2" : "gap-2 px-3 py-2.5",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar}
              alt=""
              width={30}
              height={30}
              className="rounded-full flex-shrink-0 border-2 border-brand/30"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {user.name}
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem("bl_token");
                    setUser(null);
                  }}
                  className="text-[10px] text-white/30 no-underline hover:text-white/50 transition-colors"
                >
                  Sign out
                </a>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/auth/google"
            className={clsx(
              "flex items-center rounded-xl no-underline bg-brand/[0.12] border border-brand/20 text-xs font-semibold text-white transition-all hover:bg-brand/20",
              collapsed ? "justify-center p-2.5" : "gap-2 px-3.5 py-2.5",
            )}
          >
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
    </motion.aside>
  );
}
