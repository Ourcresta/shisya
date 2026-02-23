import { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from "react";
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

const SHISHYA_PREFIX = "/shishya/";
function checkIsShishyaRoute(path: string): boolean {
  if (path === "/shishya/udyog") return false;
  if (path === "/shishya/udyog/jobs" || path.startsWith("/shishya/udyog/jobs/")) return false;
  return path.startsWith(SHISHYA_PREFIX);
}

function getStoredThemeColor(): ThemeColor {
  if (typeof window === "undefined") return "neon";
  const stored = localStorage.getItem(THEME_COLOR_KEY);
  if (stored && themeColors.some(t => t.id === stored)) return stored as ThemeColor;
  return "neon";
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_MODE_KEY);
  if (stored && ["light", "dark", "system"].includes(stored)) return stored as ThemeMode;
  return "dark";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function resolveMode(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyThemeToDOM(isShishya: boolean, themeColor: ThemeColor, themeMode: ThemeMode): "light" | "dark" {
  const root = document.documentElement;

  if (isShishya) {
    const resolved = resolveMode(themeMode);
    root.setAttribute("data-theme", themeColor);
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    return resolved;
  } else {
    root.classList.remove("dark");
    root.removeAttribute("data-theme");
    return "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [themeColor, setThemeColorState] = useState<ThemeColor>(getStoredThemeColor);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode);

  const isShishya = checkIsShishyaRoute(location);

  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const initialIsShishya = checkIsShishyaRoute(window.location.pathname);
    if (initialIsShishya) return resolveMode(getStoredThemeMode());
    return "light";
  });

  useLayoutEffect(() => {
    const resolved = applyThemeToDOM(isShishya, themeColor, themeMode);
    setResolvedMode(resolved);
  }, [themeColor, themeMode, isShishya]);

  useEffect(() => {
    if (themeMode !== "system" || !isShishya) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = applyThemeToDOM(isShishya, themeColor, themeMode);
      setResolvedMode(resolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, themeColor, isShishya]);

  const setThemeColor = useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_COLOR_KEY, color);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, []);

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
