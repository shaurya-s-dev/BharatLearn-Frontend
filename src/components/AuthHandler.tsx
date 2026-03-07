"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Add this component to your /dashboard/page.tsx
// It reads ?token= from the URL, saves it, then cleans the URL
export function AuthHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("bl_token", token);
      // Clean the token from the URL without a page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
  }, [params]);

  return null;
}
