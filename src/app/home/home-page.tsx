"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

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

const LANGS = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "\u0939\u093F\u0902\u0926\u0940" },
  { code: "ta", label: "Tamil", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
  { code: "te", label: "Telugu", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
  { code: "bn", label: "Bengali", native: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  { code: "mr", label: "Marathi", native: "\u092E\u0930\u093E\u0920\u0940" },
  { code: "gu", label: "Gujarati", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0" },
  { code: "kn", label: "Kannada", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1" },
  { code: "ml", label: "Malayalam", native: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02" },
  { code: "pa", label: "Punjabi", native: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

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
    if ((window as any).__gtLoaded) return;
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "hi,ta,te,bn,mr,gu,kn,ml,pa,en", autoDisplay: false },
        "gt_widget",
      );
      (window as any).__gtLoaded = true;
    };
    const s = document.createElement("script");
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const switchLang = useCallback((code: string) => {
    setActiveLang(code);
    setLangOpen(false);
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
  }, []);

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

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (res.status === 401) {
        setReply("\u26A0\uFE0F API key invalid. Check your backend .env configuration.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setReply(`\u26A0\uFE0F Server error ${res.status}: ${err?.error?.message || "Unknown error"}`);
        return;
      }
      const data = await res.json();
      setReply(data.data?.reply || "No reply received.");
    } catch {
      setReply("\u26A0\uFE0F Cannot connect to backend. Make sure it's running.");
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const currentLang = LANGS.find(l => l.code === activeLang) || LANGS[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050912] relative overflow-hidden px-5 py-10">
      {/* Hidden Google Translate */}
      <div id="gt_widget" className="absolute -top-[9999px] -left-[9999px] invisible" />

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full -top-[200px] -left-[200px] animate-drift-1 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,142,247,0.25) 0%, transparent 70%)" }} />
      <div className="absolute w-[500px] h-[500px] rounded-full -bottom-[150px] -right-[100px] animate-drift-2 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.19) 0%, transparent 70%)" }} />
      <div className="absolute w-[350px] h-[350px] rounded-full top-1/2 left-[60%] animate-drift-3 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Language Picker */}
      <div ref={langRef} className="fixed top-4 right-4 z-[500]">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setLangOpen((o) => !o)}
          className="flex items-center gap-[7px] px-3.5 py-2 bg-white/[0.08] border border-white/[0.14] rounded-[10px] cursor-pointer text-white text-[13px] font-sans backdrop-blur-xl transition-all hover:bg-white/[0.12]"
        >
          <span className="text-[15px]">{"\u{1F310}"}</span>
          <span className="text-[13px] font-medium text-white">{currentLang.native}</span>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className="opacity-40 ml-0.5 transition-transform duration-200"
            style={{ transform: langOpen ? "rotate(180deg)" : "none" }}
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {langOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%+8px)] right-0 w-[200px] bg-[rgba(10,16,32,0.97)] border border-white/10 rounded-[14px] overflow-hidden backdrop-blur-3xl shadow-[0_16px_50px_rgba(0,0,0,0.6)] z-[600]"
            >
              <div className="px-3.5 py-2.5 pb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-white/30 border-b border-white/[0.06]">
                {"\u{1F30F}"} Select Language
              </div>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLang(l.code)}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 border-none cursor-pointer text-[13px] font-sans transition-colors hover:bg-white/5"
                  style={{
                    background: activeLang === l.code ? "rgba(79,142,247,0.15)" : "transparent",
                    color: activeLang === l.code ? "#4f8ef7" : "rgba(255,255,255,0.75)",
                  }}
                >
                  <span className="flex-1 text-left">{l.native}</span>
                  <span className="text-[11px] opacity-50">{l.label}</span>
                  {activeLang === l.code && <span className="text-brand text-xs">{"\u2713"}</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 w-full max-w-[680px] flex flex-col items-center gap-6"
      >
        {/* Brand */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            className="w-[42px] h-[42px] rounded-[13px] flex-shrink-0 bg-gradient-brand flex items-center justify-center font-black text-xl text-white shadow-[0_0_30px_rgba(79,142,247,0.25)]"
          >
            B
          </motion.div>
          <div>
            <div className="text-base font-extrabold text-white tracking-tight">BharatLearn</div>
            <div className="text-[11px] text-white/[0.35] mt-px">Dev Coach {"\u00B7"} AI-Powered</div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={fadeUp} className="text-center">
          <h1 className="text-[clamp(52px,8vw,80px)] font-black leading-[1.05] text-white tracking-[-3px]">
            Your AI<br />
            <span className="grad-text">Dev Coach.</span>
          </h1>
          <p className="text-base text-white/[0.45] mt-3 tracking-wide">
            Learn faster. Debug smarter. Ace your viva.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          variants={fadeUp}
          className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 pb-3 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,box-shadow] duration-300 focus-within:border-brand/30 focus-within:shadow-glow-lg"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={input ? "" : displayed + "\u258E"}
            rows={1}
            className="w-full bg-transparent border-none outline-none text-white text-base font-sans resize-none leading-relaxed min-h-[28px] placeholder:text-white/20"
            style={{ caretColor: "#4f8ef7" }}
          />
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[11px] text-white/[0.22]">{"\u23CE"} Enter to send {"\u00B7"} Shift+{"\u23CE"} new line</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-[10px] bg-gradient-brand border-none text-white text-lg font-bold flex items-center justify-center shadow-glow transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <span className="spinner w-4 h-4" /> : "\u2191"}
            </motion.button>
          </div>
        </motion.div>

        {/* Reply */}
        <AnimatePresence mode="wait">
          {reply && (
            <motion.div
              key="reply"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full bg-brand/[0.07] border border-brand/[0.18] rounded-2xl px-[18px] py-4"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-brand inline-block shadow-[0_0_8px_#4f8ef7]" />
                <span className="text-[11px] font-bold text-brand tracking-wider uppercase">ASTRA</span>
              </div>
              <p className="text-sm text-white/[0.85] leading-7 whitespace-pre-wrap">{reply}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestion chips */}
        <AnimatePresence mode="wait">
          {!reply && (
            <motion.div
              key="chips"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.div key={s.href} variants={fadeUp} custom={i}>
                  <Link
                    href={s.href}
                    className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-[14px] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-white/[0.06] group"
                  >
                    <span
                      className="text-[22px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: s.color }}
                    >
                      {s.icon}
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-white mb-0.5">{s.label}</div>
                      <div className="text-[11px] text-white/[0.35]">{s.sub}</div>
                    </div>
                    <span
                      className="ml-auto text-base flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      style={{ color: s.color }}
                    >
                      {"\u2192"}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {reply && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => { setReply(""); setInput(""); }}
            className="bg-transparent border border-white/[0.12] text-white/40 text-[13px] px-[22px] py-2.5 rounded-xl cursor-pointer font-sans transition-all font-medium hover:border-white/25 hover:text-white/60"
          >
            {"\u2190"} New conversation
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
