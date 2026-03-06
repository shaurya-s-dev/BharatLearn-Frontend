"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAuth = AUTH_ROUTES.some(r => path === r || path.startsWith(r + "/"));

  // Restore theme + font on every page load
  useEffect(() => {
    const raw = localStorage.getItem("bl_prefs");
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.theme) {
      document.documentElement.setAttribute("data-theme",
        p.theme === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : p.theme
      );
    }
    if (p.fontSize) {
      const map: Record<string,string> = { small:"13px", medium:"15px", large:"17px" };
      document.documentElement.style.fontSize = map[p.fontSize] || "15px";
    }
  }, []);

  if (isAuth) return <>{children}</>;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:"auto", minWidth:0 }}>{children}</main>
    </div>
  );
}
