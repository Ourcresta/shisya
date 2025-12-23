import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeColor = "default" | "ocean" | "forest" | "sunset" | "midnight" | "rose";
export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  resolvedMode: "light" | "dark";
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLOR_KEY = "shishya-theme-color";
const THEME_MODE_KEY = "shishya-theme-mode";

export const themeColors: { id: ThemeColor; name: string; primary: string; description: string }[] = [
  { id: "default", name: "Default", primary: "#2563eb", description: "Professional Blue" },
  { id: "ocean", name: "Ocean", primary: "#0891b2", description: "Calm & Fresh" },
  { id: "forest", name: "Forest", primary: "#16a34a", description: "Natural & Growth" },
  { id: "sunset", name: "Sunset", primary: "#ea580c", description: "Warm & Energetic" },
  { id: "midnight", name: "Midnight", primary: "#7c3aed", description: "Deep & Focused" },
  { id: "rose", name: "Rose", primary: "#db2777", description: "Soft & Creative" },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_COLOR_KEY);
      if (stored && themeColors.some(t => t.id === stored)) {
        return stored as ThemeColor;
      }
    }
    return "default";
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_MODE_KEY);
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored as ThemeMode;
      }
    }
    return "light";
  });

  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }, []);

  useEffect(() => {
    const resolved = themeMode === "system" ? getSystemTheme() : themeMode;
    setResolvedMode(resolved);

    const root = document.documentElement;
    root.setAttribute("data-theme", themeColor);

    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeColor, themeMode, getSystemTheme]);

  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setResolvedMode(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, getSystemTheme]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_COLOR_KEY, color);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, themeMode, resolvedMode, setThemeColor, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
