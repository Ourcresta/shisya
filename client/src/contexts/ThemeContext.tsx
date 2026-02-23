import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";

export type ThemeColor = "neon" | "cyberpunk" | "minimal" | "ocean" | "sunset";
export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  resolvedMode: "light" | "dark";
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
  isShishyaRoute: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLOR_KEY = "shishya-theme-color";
const THEME_MODE_KEY = "shishya-theme-mode";

export const themeColors: { id: ThemeColor; name: string; primary: string; description: string }[] = [
  { id: "neon", name: "Neon", primary: "#22d3ee", description: "Cyan Glow" },
  { id: "cyberpunk", name: "Cyberpunk", primary: "#f0abfc", description: "Purple Neon" },
  { id: "minimal", name: "Minimal", primary: "#3b82f6", description: "Clean Blue" },
  { id: "ocean", name: "Ocean", primary: "#2dd4bf", description: "Teal Waves" },
  { id: "sunset", name: "Sunset", primary: "#fb923c", description: "Warm Orange" },
];

const PUBLIC_UDYOG_ROUTES = ["/shishya/udyog/jobs"];
const PUBLIC_UDYOG_EXACT = "/shishya/udyog";

function checkIsShishyaRoute(path: string): boolean {
  if (PUBLIC_UDYOG_ROUTES.some(r => path.startsWith(r))) return false;
  if (path === PUBLIC_UDYOG_EXACT) return false;

  if (path.startsWith("/shishya/")) return true;

  return false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_COLOR_KEY);
      if (stored && themeColors.some(t => t.id === stored)) {
        return stored as ThemeColor;
      }
    }
    return "neon";
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_MODE_KEY);
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored as ThemeMode;
      }
    }
    return "dark";
  });

  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }, []);

  const isShishya = checkIsShishyaRoute(location);

  useEffect(() => {
    const root = document.documentElement;

    if (isShishya) {
      const resolved = themeMode === "system" ? getSystemTheme() : themeMode;
      setResolvedMode(resolved);
      root.setAttribute("data-theme", themeColor);

      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else {
      setResolvedMode("light");
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
    }
  }, [themeColor, themeMode, getSystemTheme, isShishya]);

  useEffect(() => {
    if (themeMode !== "system" || !isShishya) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setResolvedMode(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, getSystemTheme, isShishya]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_COLOR_KEY, color);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, themeMode, resolvedMode, setThemeColor, setThemeMode, isShishyaRoute: isShishya }}>
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
