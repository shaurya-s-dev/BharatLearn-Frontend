import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#4f8ef7",
          light: "#7eabfa",
          dark: "#3670d4",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface2)",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fadeIn 0.3s ease both",
        "slide-in": "slideIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
        "float": "float 3s ease-in-out infinite",
        "gradient": "gradMove 4s ease infinite",
        "shimmer": "shimmer 1.4s ease-in-out infinite",
        "drift-1": "drift1 12s ease-in-out infinite",
        "drift-2": "drift2 15s ease-in-out infinite",
        "drift-3": "drift3 10s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gradMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        drift1: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(60px,-40px) scale(1.15)" },
        },
        drift2: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-50px,50px) scale(1.1)" },
        },
        drift3: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(30px,60px) scale(1.08)" },
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #4f8ef7, #a78bfa)",
        "gradient-warm": "linear-gradient(135deg, #f87171, #fbbf24)",
        "gradient-success": "linear-gradient(135deg, #34d399, #22c55e)",
        "gradient-mesh": "radial-gradient(ellipse 80% 60% at 50% 0%, #0d1f4a 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, #1a0a2e 0%, transparent 60%), #050912",
      },
      boxShadow: {
        glow: "0 4px 20px rgba(79,142,247,0.25)",
        "glow-lg": "0 8px 40px rgba(79,142,247,0.3)",
        card: "0 8px 30px rgba(79,142,247,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
