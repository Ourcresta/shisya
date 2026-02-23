import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  BookOpen, 
  GraduationCap,
  Award, 
  User, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  UserPlus,
  Coins,
  Sparkles,
  Search,
  X,
  CreditCard,
  Home
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditContext";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTheme, themeColors, type ThemeMode } from "@/contexts/ThemeContext";
import { Palette, Check, Sun, Moon, Monitor } from "lucide-react";

const modeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function Header() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const { balance, isLoading: creditsLoading } = useCredits();
  const { themeMode, themeColor, setThemeMode, setThemeColor, resolvedMode, isShishyaRoute } = useTheme();
  const isHome = location === "/" || location === "/courses";
  const isShishyaPortal = location.startsWith("/shishya");
  const isWalletPage = location === "/shishya/wallet";

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between gap-4">
        <Link href={user ? "/shishya/dashboard" : "/"} className="flex items-center gap-2 group shrink-0" data-testid="link-home">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            {user ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    OurShiksha
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-lg font-semibold text-primary" style={{ fontFamily: "var(--font-display)" }}>
                    Shishya
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-none hidden sm:block">
                  Student Portal
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  OurShiksha
                </span>
                <span className="text-[10px] text-muted-foreground leading-none hidden sm:block">
                  Learn. Practice. Prove.
                </span>
              </>
            )}
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 bg-muted/50 border-transparent focus:border-border focus:bg-background"
              data-testid="input-search"
            />
          </form>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            data-testid="button-search-toggle"
          >
            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-home">
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          {!isLoading && (
            <>
              {user ? (
                <>
                  {!location.startsWith("/shishya/dashboard") && (
                    <Link href="/shishya/dashboard">
                      <Button variant="ghost" size="sm" data-testid="button-dashboard">
                        <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  
                  {!isHome && !location.startsWith("/courses") && (
                    <Link href="/courses">
                      <Button variant="ghost" size="sm" data-testid="button-courses">
                        <BookOpen className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Courses</span>
                      </Button>
                    </Link>
                  )}
                  
                  {!location.startsWith("/shishya/certificates") && (
                    <Link href="/shishya/certificates">
                      <Button variant="ghost" size="sm" data-testid="button-certificates">
                        <Award className="w-4 h-4 sm:mr-2" />
                        <span className="hidden md:inline">Certificates</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* Credits Balance & Buy Button */}
                  {!isWalletPage && (
                    <Link href="/shishya/wallet">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        data-testid="button-buy-credits"
                      >
                        <Coins className="w-4 h-4" />
                        <span className="font-semibold">
                          {creditsLoading ? "..." : balance.toLocaleString()}
                        </span>
                        <span className="hidden sm:inline text-xs opacity-75">Credits</span>
                      </Button>
                    </Link>
                  )}
                  
                  <NotificationBell />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-user-menu">
                        <User className="w-4 h-4 sm:mr-2" />
                        <span className="max-w-[100px] truncate hidden sm:inline">
                          {user.email.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/shishya/profile" className="flex items-center gap-2 cursor-pointer" data-testid="menu-profile">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      {isShishyaRoute && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer" data-testid="menu-theme">
                              <Palette className="w-4 h-4 mr-2" />
                              Appearance
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-56">
                              <DropdownMenuLabel className="flex items-center gap-2">
                                {themeMode === "system" ? <Monitor className="h-4 w-4" /> : resolvedMode === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                Mode
                              </DropdownMenuLabel>
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
                            </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="menu-logout">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {!isHome && (
                    <Link href="/">
                      <Button variant="ghost" size="sm" data-testid="button-home">
                        <Home className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Home</span>
                      </Button>
                    </Link>
                  )}
                  {!isHome && !location.startsWith("/courses") && (
                    <Link href="/courses">
                      <Button variant="ghost" size="sm" data-testid="button-courses">
                        <BookOpen className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Courses</span>
                      </Button>
                    </Link>
                  )}
                  {!location.startsWith("/pricing") && (
                    <Link href="/pricing">
                      <Button variant="ghost" size="sm" data-testid="button-pricing">
                        <CreditCard className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Pricing</span>
                      </Button>
                    </Link>
                  )}
                  <Link href="/signup">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      data-testid="button-get-credits"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Get</span>
                      <span className="font-semibold">500</span>
                      <span className="hidden sm:inline">Free Credits</span>
                      <span className="sm:hidden">Credits</span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" data-testid="button-login">
                      <LogIn className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Log In</span>
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" size="sm" data-testid="button-signup">
                      <UserPlus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Sign Up</span>
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
      
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden border-t bg-background p-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 w-full"
              autoFocus
              data-testid="input-search-mobile"
            />
          </form>
        </div>
      )}
    </header>
  );
}
