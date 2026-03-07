"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TokenReader() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("bl_token", token);
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
  }, [params]);

  return null;
}

export function AuthHandler() {
  return (
    <Suspense fallback={null}>
      <TokenReader />
    </Suspense>
  );
}
