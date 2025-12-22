import { Link, useLocation } from "wouter";
import { BookOpen, GraduationCap, Award, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();
  const isHome = location === "/";
  const isCertificates = location.startsWith("/certificates");
  const isProfile = location.startsWith("/profile");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              SHISYA
            </span>
            <span className="text-[10px] text-muted-foreground leading-none hidden sm:block">
              Learn. Practice. Prove.
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {!isHome && (
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-courses">
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </Button>
            </Link>
          )}
          {!isCertificates && (
            <Link href="/certificates">
              <Button variant="ghost" size="sm" data-testid="button-certificates">
                <Award className="w-4 h-4 mr-2" />
                Certificates
              </Button>
            </Link>
          )}
          {!isProfile && (
            <Link href="/profile">
              <Button variant="ghost" size="sm" data-testid="button-profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
