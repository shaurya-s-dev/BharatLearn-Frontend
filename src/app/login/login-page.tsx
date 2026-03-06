"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // TODO: connect to your backend auth
    setTimeout(() => { setLoading(false); router.push("/dashboard"); }, 1000);
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.blob, top: -160, left: -160, background: "#00bfff" }} />
      <div style={{ ...styles.blob, bottom: -120, right: -120, background: "#7c3aed", animationDelay: "-4s" }} />

      <div style={styles.card}>

        <div style={styles.socialRow}>
          <a href="/auth/google" style={styles.socialBtn}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.3 3 29.4 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.5 13.6 17.8 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
              <path fill="#FBBC05" d="M10.7 28.4A14.5 14.5 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7-5.4A23.9 23.9 0 0 0 .5 24c0 3.9.9 7.5 2.7 10.8l7.5-6.4z"/>
              <path fill="#34A853" d="M24 47c5.4 0 10-1.8 13.3-4.8l-7.4-5.7c-1.8 1.2-4.1 2-5.9 2-6.2 0-11.5-4.2-13.3-9.8l-7.5 6.4C7 41.3 14.8 47 24 47z"/>
            </svg>
            Continue with Google
          </a>
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or sign in with email</span>
          <span style={styles.dividerLine} />
        </div>

        <div style={styles.titleRow}>
          <span style={styles.dot} />
          <span style={styles.title}>Welcome back</span>
        </div>
        <p style={styles.message}>Sign in to continue your learning journey.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <input name="email" style={styles.input} type="email" placeholder="Email" required />
          </div>

          <div style={{ ...styles.field, position: "relative" }}>
            <input
              name="password"
              style={styles.input}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              required
            />
            <button type="button" style={styles.eyeBtn} onClick={() => setShowPw(p => !p)}>
              {showPw ? "🙈" : "👁"}
            </button>
          </div>

          <div style={{ textAlign: "right", marginTop: -4 }}>
            <Link href="/forgot-password" style={{ ...styles.link, fontSize: 12.5 }}>
              Forgot password?
            </Link>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" style={styles.submit} disabled={loading}>
            {loading ? <span className="spin" style={{ display: "inline-block" }}>⟳</span> : "Sign In"}
          </button>

          <p style={styles.signin}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={styles.link}>Register</Link>
          </p>
        </form>

        <div style={styles.trust}>
          {[["🔒","SSL Secured"],["✉️","No Spam"],["✅","Free Forever"]].map(([icon, label]) => (
            <div key={label} style={styles.trustItem}>
              <span>{icon}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#0d0d0d",
    padding: 20, position: "relative", overflow: "hidden",
  },
  blob: {
    position: "absolute", width: 450, height: 450, borderRadius: "50%",
    filter: "blur(80px)", opacity: 0.15, pointerEvents: "none",
  },
  card: {
    width: "100%", maxWidth: 400,
    background: "#161616", border: "1px solid #2a2a2a",
    borderRadius: 24, padding: "28px 26px",
    position: "relative", zIndex: 1,
    animation: "fadeUp .45s ease both",
  },
  socialRow: { marginBottom: 16 },
  socialBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, width: "100%", padding: "11px 16px",
    background: "#222", border: "1px solid #333",
    borderRadius: 10, color: "#fff", fontSize: 14,
    fontFamily: "inherit", cursor: "pointer",
    textDecoration: "none",
  },
  divider: { display: "flex", alignItems: "center", gap: 10, marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, background: "#2a2a2a" },
  dividerText: { fontSize: 11.5, color: "rgba(255,255,255,.3)", whiteSpace: "nowrap" },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  dot: {
    width: 14, height: 14, borderRadius: "50%", background: "#00bfff",
    display: "inline-block", animation: "pulse 1.2s ease-out infinite",
  },
  title: { fontSize: 26, fontWeight: 700, color: "#00bfff", letterSpacing: -0.5 },
  message: { fontSize: 13.5, color: "rgba(255,255,255,.45)", marginBottom: 20, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 11 },
  field: { flex: 1 },
  input: {
    width: "100%", background: "#222", color: "#fff",
    padding: "12px 38px 12px 12px",
    border: "1px solid #333", borderRadius: 10,
    outline: "none", fontSize: 14, fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute", right: 10, top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: 14,
  },
  errorBox: {
    background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.3)",
    borderRadius: 8, padding: "10px 12px", color: "#f87171", fontSize: 13,
  },
  submit: {
    width: "100%", padding: 13, border: "none",
    borderRadius: 12, background: "linear-gradient(135deg,#00bfff,#0080ff)",
    color: "#fff", fontSize: 15, fontWeight: 600,
    fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,191,255,.2)",
  },
  signin: { textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.4)" },
  link: { color: "#00bfff", textDecoration: "none", fontWeight: 500 },
  trust: {
    display: "flex", justifyContent: "center", gap: 18,
    marginTop: 18, paddingTop: 14, borderTop: "1px solid #1f1f1f",
  },
  trustItem: { display: "flex", alignItems: "center", gap: 5 },
};
