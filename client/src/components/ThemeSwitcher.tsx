import { Sun, Moon, Monitor, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme, themeColors, type ThemeMode } from "@/contexts/ThemeContext";

const modeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function ThemeSwitcher() {
  const { themeColor, themeMode, resolvedMode, setThemeColor, setThemeMode } = useTheme();

  const CurrentModeIcon = themeMode === "system" ? Monitor : resolvedMode === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-theme-switcher">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Theme settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <CurrentModeIcon className="h-4 w-4" />
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {modeOptions.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => setThemeMode(mode.id)}
            className="flex items-center justify-between cursor-pointer"
            data-testid={`menu-theme-mode-${mode.id}`}
          >
            <span className="flex items-center gap-2">
              <mode.icon className="h-4 w-4" />
              {mode.label}
            </span>
            {themeMode === mode.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>

        <div className="grid grid-cols-3 gap-2 p-2">
          {themeColors.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setThemeColor(theme.id)}
              className={`
                relative flex flex-col items-center gap-1 p-2 rounded-md
                hover-elevate active-elevate-2 transition-all
                ${themeColor === theme.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
              `}
              title={theme.description}
              data-testid={`button-theme-color-${theme.id}`}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-xs text-muted-foreground">{theme.name}</span>
              {themeColor === theme.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeToggle() {
  const { resolvedMode, setThemeMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setThemeMode(resolvedMode === "dark" ? "light" : "dark")}
      data-testid="button-theme-toggle"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
