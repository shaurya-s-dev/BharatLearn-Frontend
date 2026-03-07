"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const SUGGESTIONS = [
  { icon: "◈", label: "Generate a Quiz", sub: "on Arrays in Python",  href: "/quiz",     color: "#34d399" },
  { icon: "⊙", label: "Debug my Code",   sub: "paste code, get hints", href: "/debug",    color: "#f87171" },
  { icon: "⊞", label: "Build a Plan",    sub: "24-week learning path", href: "/learning", color: "#a78bfa" },
  { icon: "◉", label: "Viva Predictor",  sub: "upload code for Q&A",  href: "/viva",     color: "#fbbf24" },
];

const PHRASES = [
  "What do you want to learn today?",
  "Ask me to debug your code...",
  "Generate a quiz on any topic...",
  "Build your 24-week study plan...",
  "Prepare for your viva exam...",
];

// All Indian languages with their Google Translate codes
const LANGS = [
  { code: "en",    label: "English",    native: "English"   },
  { code: "hi",    label: "Hindi",      native: "हिंदी"      },
  { code: "ta",    label: "Tamil",      native: "தமிழ்"      },
  { code: "te",    label: "Telugu",     native: "తెలుగు"     },
  { code: "bn",    label: "Bengali",    native: "বাংলা"      },
  { code: "mr",    label: "Marathi",    native: "मराठी"      },
  { code: "gu",    label: "Gujarati",   native: "ગુજરાતી"    },
  { code: "kn",    label: "Kannada",    native: "ಕನ್ನಡ"      },
  { code: "ml",    label: "Malayalam",  native: "മലയാളം"     },
  { code: "pa",    label: "Punjabi",    native: "ਪੰਜਾਬੀ"     },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function HomePage() {
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [reply, setReply]           = useState("");
  const [phraseIdx, setPhraseIdx]   = useState(0);
  const [displayed, setDisplayed]   = useState("");
  const [deleting, setDeleting]     = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [langOpen, setLangOpen]     = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [gtReady, setGtReady]       = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Google Translate — load once
  useEffect(() => {
    if ((window as any).__gtLoaded) { setGtReady(true); return; }
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "hi,ta,te,bn,mr,gu,kn,ml,pa,en", autoDisplay: false },
        "gt_widget"
      );
      (window as any).__gtLoaded = true;
      setGtReady(true);
    };
    const s = document.createElement("script");
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  function switchLang(code: string) {
    setActiveLang(code);
    setLangOpen(false);
    // Trigger the hidden Google Translate select
    const trySwitch = (attempts = 0) => {
      const sel = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (sel) {
        sel.value = code;
        sel.dispatchEvent(new Event("change"));
      } else if (attempts < 10) {
        setTimeout(() => trySwitch(attempts + 1), 300);
      }
    };
    trySwitch();
  }

  // Typewriter
  useEffect(() => {
    const target = PHRASES[phraseIdx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < target.length)
      t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 55);
    else if (!deleting && displayed.length === target.length)
      t = setTimeout(() => setDeleting(true), 2400);
    else if (deleting && displayed.length > 0)
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 26);
    else { setDeleting(false); setPhraseIdx(i => (i + 1) % PHRASES.length); }
    return () => clearTimeout(t);
  }, [displayed, deleting, phraseIdx]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + "px";
    }
  }, [input]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (res.status === 401) {
        setReply("⚠️ API key invalid (401). Open backend/.env and check your GROQ_API_KEY or HF_API_KEY is correct, then restart the backend.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setReply(`⚠️ Server error ${res.status}: ${err?.error?.message || "Unknown error"}`);
        return;
      }
      const data = await res.json();
      setReply(data.data?.reply || "No reply received.");
    } catch {
      setReply("⚠️ Cannot connect to backend. Make sure it's running:\n\ncd backend\nnpm run dev");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const currentLang = LANGS.find(l => l.code === activeLang) || LANGS[0];

  return (
    <div style={S.page}>
      {/* Hidden Google Translate widget */}
      <div id="gt_widget" style={{ position:"absolute", top:-9999, left:-9999, visibility:"hidden" }} />

      {/* BG */}
      <div style={S.meshBg} />
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />
      <div style={S.grid} />

      {/* ── Language Picker ── */}
      <div ref={langRef} style={S.langWrap}>
        <button onClick={() => setLangOpen(o => !o)} style={S.langBtn}>
          <span style={{ fontSize:15 }}>🌐</span>
          <span style={{ fontSize:13, fontWeight:500, color:"#fff" }}>{currentLang.native}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity:.4, marginLeft:2, transform: langOpen ? "rotate(180deg)" : "none", transition:"transform .2s" }}>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {langOpen && (
          <div style={S.dropdown}>
            <div style={S.dropHeader}>🌏 Select Language</div>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => switchLang(l.code)} style={{
                ...S.dropOption,
                background: activeLang === l.code ? "rgba(79,142,247,.15)" : "transparent",
                color: activeLang === l.code ? "#4f8ef7" : "rgba(255,255,255,.75)",
              }}>
                <span style={{ flex:1, textAlign:"left" }}>{l.native}</span>
                <span style={{ fontSize:11, opacity:.5 }}>{l.label}</span>
                {activeLang === l.code && <span style={{ color:"#4f8ef7", fontSize:12 }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{
        ...S.content,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: "all .65s cubic-bezier(.22,1,.36,1)",
      }}>
        {/* Brand */}
        <div style={S.brand}>
          <div style={S.brandIcon}>B</div>
          <div>
            <div style={S.brandName}>BharatLearn</div>
            <div style={S.brandSub}>Dev Coach · AI-Powered</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign:"center" }}>
          <h1 style={S.h1}>
            Your AI<br />
            <span style={S.h1Accent}>Dev Coach.</span>
          </h1>
          <p style={S.sub}>Learn faster. Debug smarter. Ace your viva.</p>
        </div>

        {/* Input */}
        <div style={S.inputCard}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={input ? "" : displayed + "▎"}
            rows={1}
            style={S.textarea}
          />
          <div style={S.inputFooter}>
            <span style={S.hint}>⏎ Enter to send  ·  Shift+⏎ new line</span>
            <button onClick={handleSend} disabled={!input.trim() || loading} style={{
              ...S.sendBtn,
              opacity: input.trim() && !loading ? 1 : 0.4,
              cursor: input.trim() && !loading ? "pointer" : "default",
            }}>
              {loading
                ? <span style={{ display:"inline-block", animation:"spin .7s linear infinite" }}>⟳</span>
                : "↑"}
            </button>
          </div>
        </div>

        {/* Reply */}
        {reply && (
          <div style={S.replyCard}>
            <div style={S.replyHead}>
              <span style={S.dot} /><span style={S.astra}>ASTRA</span>
            </div>
            <p style={S.replyText}>{reply}</p>
          </div>
        )}

        {/* Chips */}
        {!reply && (
          <div style={S.chips}>
            {SUGGESTIONS.map(s => (
              <Link key={s.href} href={s.href} style={S.chip}>
                <span style={{ fontSize:20, color:s.color, flexShrink:0 }}>{s.icon}</span>
                <div>
                  <div style={S.chipLabel}>{s.label}</div>
                  <div style={S.chipSub}>{s.sub}</div>
                </div>
                <span style={{ marginLeft:"auto", color:s.color, fontSize:16, flexShrink:0 }}>→</span>
              </Link>
            ))}
          </div>
        )}

        {reply && (
          <button onClick={() => { setReply(""); setInput(""); }} style={S.clearBtn}>
            ← New conversation
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes drift1 { 0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(60px,-40px)scale(1.15)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(-50px,50px)scale(1.1)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(30px,60px)scale(1.08)} }
        .goog-te-banner-frame,.skiptranslate{display:none!important}
        body{top:0!important}
        #gt_widget{display:none}
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page:   { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#050912", position:"relative", overflow:"hidden", padding:"40px 20px" },
  meshBg: { position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 0%,#0d1f4a 0%,transparent 70%),radial-gradient(ellipse 60% 50% at 80% 80%,#1a0a2e 0%,transparent 60%),#050912", pointerEvents:"none" },
  orb1:   { position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,#4f8ef740 0%,transparent 70%)", top:-200, left:-200, animation:"drift1 12s ease-in-out infinite", pointerEvents:"none" },
  orb2:   { position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,#a78bfa30 0%,transparent 70%)", bottom:-150, right:-100, animation:"drift2 15s ease-in-out infinite", pointerEvents:"none" },
  orb3:   { position:"absolute", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,#34d39920 0%,transparent 70%)", top:"50%", left:"60%", animation:"drift3 10s ease-in-out infinite", pointerEvents:"none" },
  grid:   { position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(79,142,247,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.04) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" },

  langWrap:   { position:"fixed", top:16, right:16, zIndex:500 },
  langBtn:    { display:"flex", alignItems:"center", gap:7, padding:"8px 14px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.14)", borderRadius:10, cursor:"pointer", color:"#fff", fontSize:13, fontFamily:"inherit", backdropFilter:"blur(16px)", transition:"all .15s" },
  dropdown:   { position:"absolute", top:"calc(100% + 8px)", right:0, width:200, background:"rgba(10,16,32,.97)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, overflow:"hidden", backdropFilter:"blur(24px)", boxShadow:"0 16px 50px rgba(0,0,0,.6)", zIndex:600 },
  dropHeader: { padding:"10px 14px 8px", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:1.5, color:"rgba(255,255,255,.3)", borderBottom:"1px solid rgba(255,255,255,.06)" },
  dropOption: { display:"flex", alignItems:"center", gap:8, width:"100%", padding:"10px 14px", border:"none", cursor:"pointer", fontSize:13, fontFamily:"inherit", transition:"background .12s" },

  content:   { position:"relative", zIndex:10, width:"100%", maxWidth:680, display:"flex", flexDirection:"column", alignItems:"center", gap:24 },
  brand:     { display:"flex", alignItems:"center", gap:12, marginBottom:8 },
  brandIcon: { width:42, height:42, borderRadius:13, flexShrink:0, background:"linear-gradient(135deg,#4f8ef7,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:20, color:"#fff", boxShadow:"0 0 30px #4f8ef740" },
  brandName: { fontSize:16, fontWeight:800, color:"#fff", letterSpacing:"-.3px" },
  brandSub:  { fontSize:11, color:"rgba(255,255,255,.35)", marginTop:1 },

  h1:       { fontSize:"clamp(52px,8vw,80px)", fontWeight:900, lineHeight:1.05, color:"#fff", letterSpacing:"-3px", margin:0 },
  h1Accent: { background:"linear-gradient(135deg,#4f8ef7,#a78bfa,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  sub:      { fontSize:16, color:"rgba(255,255,255,.45)", marginTop:12, letterSpacing:".2px" },

  inputCard:   { width:"100%", background:"rgba(255,255,255,.05)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,.10)", borderRadius:20, padding:"16px 16px 12px", boxShadow:"0 8px 40px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06)" },
  textarea:    { width:"100%", background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:16, fontFamily:"inherit", resize:"none", lineHeight:1.6, minHeight:28, caretColor:"#4f8ef7" },
  inputFooter: { display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 },
  hint:        { fontSize:11, color:"rgba(255,255,255,.22)" },
  sendBtn:     { width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#4f8ef7,#a78bfa)", border:"none", color:"#fff", fontSize:18, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px #4f8ef740", transition:"opacity .2s" },

  replyCard: { width:"100%", background:"rgba(79,142,247,.07)", border:"1px solid rgba(79,142,247,.18)", borderRadius:16, padding:"16px 18px" },
  replyHead: { display:"flex", alignItems:"center", gap:8, marginBottom:10 },
  dot:       { width:8, height:8, borderRadius:"50%", background:"#4f8ef7", boxShadow:"0 0 8px #4f8ef7", display:"inline-block" },
  astra:     { fontSize:11, fontWeight:700, color:"#4f8ef7", letterSpacing:1, textTransform:"uppercase" as const },
  replyText: { fontSize:14, color:"rgba(255,255,255,.85)", lineHeight:1.75, whiteSpace:"pre-wrap" as const },

  chips:     { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, width:"100%" },
  chip:      { display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, textDecoration:"none", transition:"all .2s" },
  chipLabel: { fontSize:13, fontWeight:600, color:"#fff", marginBottom:2 },
  chipSub:   { fontSize:11, color:"rgba(255,255,255,.35)" },
  clearBtn:  { background:"none", border:"1px solid rgba(255,255,255,.12)", color:"rgba(255,255,255,.4)", fontSize:13, padding:"8px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" },
};
