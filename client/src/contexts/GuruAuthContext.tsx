import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface GuruAdmin {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface GuruAuthContextType {
  admin: GuruAdmin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const GuruAuthContext = createContext<GuruAuthContextType | null>(null);

export function GuruAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<GuruAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/guru/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
        } else {
          setAdmin(null);
        }
      } catch {
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/guru/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Guru logout error:", error);
    } finally {
      setAdmin(null);
      setLocation("/guru");
    }
  }, [setLocation]);

  return (
    <GuruAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        logout,
      }}
    >
      {children}
    </GuruAuthContext.Provider>
  );
}

export function useGuruAuth() {
  const context = useContext(GuruAuthContext);
  if (!context) {
    throw new Error("useGuruAuth must be used within a GuruAuthProvider");
  }
  return context;
}
