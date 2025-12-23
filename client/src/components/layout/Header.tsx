import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  User, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, logout } = useAuth();
  const isHome = location === "/" || location === "/courses";
  const isShishyaPortal = location.startsWith("/shishya");

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between gap-4">
        <Link href={user ? "/shishya/dashboard" : "/"} className="flex items-center gap-2 group" data-testid="link-home">
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

        <nav className="flex items-center gap-1 sm:gap-2">
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
                  
                  <ThemeSwitcher />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-user-menu">
                        <User className="w-4 h-4 sm:mr-2" />
                        <span className="max-w-[100px] truncate hidden sm:inline">
                          {user.email.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/shishya/profile" className="flex items-center gap-2 cursor-pointer" data-testid="menu-profile">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
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
                    <Link href="/courses">
                      <Button variant="ghost" size="sm" data-testid="button-courses">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Courses
                      </Button>
                    </Link>
                  )}
                  <Link href="/login">
                    <Button variant="ghost" size="sm" data-testid="button-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" size="sm" data-testid="button-signup">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
