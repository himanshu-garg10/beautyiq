import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          card: "var(--background-card)",
          elevated: "var(--background-elevated)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
          faint: "var(--foreground-faint)",
        },
        ivory: {
          DEFAULT: "#FAF7F2",
          deep: "#F1EBE0",
        },
        ink: {
          DEFAULT: "var(--foreground)",
          soft: "var(--foreground-muted)",
          faint: "var(--foreground-faint)",
        },
        sage: {
          DEFAULT: "var(--sage)",
          soft: "var(--sage-soft)",
          deep: "var(--sage-deep)",
          tint: "var(--sage-tint)",
        },
        clay: {
          DEFAULT: "var(--clay)",
          tint: "var(--clay-tint)",
        },
        champagne: {
          DEFAULT: "var(--champagne)",
          tint: "var(--champagne-tint)",
          deep: "var(--champagne-deep)",
        },
        blush: {
          DEFAULT: "var(--blush)",
          tint: "var(--blush-tint)",
          deep: "var(--blush-deep)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        status: {
          success: "var(--success)",
          "success-bg": "var(--success-bg)",
          warning: "var(--warning)",
          "warning-bg": "var(--warning-bg)",
          error: "var(--error)",
          "error-bg": "var(--error-bg)",
          info: "var(--info)",
          "info-bg": "var(--info-bg)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        content: "1240px",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(26, 21, 16, 0.04)",
        subtle: "var(--shadow-subtle)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)",
        elevated: "0 8px 24px rgba(0,0,0,0.08), 0 24px 56px rgba(0,0,0,0.12)",
        glass: "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 5s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out 1.5s infinite",
        "float-slow": "float 7s ease-in-out 0.5s infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
