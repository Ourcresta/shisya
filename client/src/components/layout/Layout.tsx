import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function Layout({ children, fullWidth = false }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isShishyaPortal = location.startsWith("/shishya");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className={`flex-1 ${fullWidth ? "" : "max-w-7xl mx-auto px-4 md:px-8 py-8"}`}>
        {children}
      </main>
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          {user && isShishyaPortal ? (
            <p>OurShiksha | Shishya Student Portal</p>
          ) : (
            <p>Your learning journey starts here.</p>
          )}
        </div>
      </footer>
    </div>
  );
}
