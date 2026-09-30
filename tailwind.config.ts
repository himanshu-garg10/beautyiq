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
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
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
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
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
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
