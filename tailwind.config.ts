import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        card: "var(--card)",
        ring: "var(--ring)",
        input: "var(--input)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        border: "var(--border)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        destructive: "var(--destructive)",
        "card-foreground": "var(--card-foreground)",
        "muted-foreground": "var(--muted-foreground)",
        "accent-foreground": "var(--accent-foreground)",
        "popover-foreground": "var(--popover-foreground)",
        "primary-foreground": "var(--primary-foreground)",
        "secondary-foreground": "var(--secondary-foreground)",
        "destructive-foreground": "var(--destructive-foreground)",
        popover: "var(--popover)",
        sidebar: "var(--sidebar)",
        "sidebar-ring": "var(--sidebar-ring)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "var(--radius)",
        "2xl": "calc(var(--radius) + 0.25rem)",
        "3xl": "calc(var(--radius) + 0.5rem)",
      },
      boxShadow: {
        soft: "0 8px 30px rgb(30 41 59 / 0.08)",
      },
    },
  },
};

export default config;
