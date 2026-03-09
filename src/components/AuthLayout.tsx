"use client";
import { usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/components/Sidebar";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAuth = AUTH_ROUTES.some((r) => path === r || path.startsWith(r + "/"));

  const restorePrefs = useCallback(() => {
    const raw = localStorage.getItem("bl_prefs");
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.fontSize) {
      const map: Record<string, string> = { small: "13px", medium: "15px", large: "17px" };
      document.documentElement.style.fontSize = map[p.fontSize] || "15px";
    }
  }, []);

  useEffect(() => { restorePrefs(); }, [restorePrefs]);

  if (isAuth) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" themes={["dark", "light"]} enableSystem>
      <Shell>{children}</Shell>
    </ThemeProvider>
  );
}
