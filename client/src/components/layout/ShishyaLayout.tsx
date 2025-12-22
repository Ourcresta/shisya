import { Header } from "./Header";

interface ShishyaLayoutProps {
  children: React.ReactNode;
}

export function ShishyaLayout({ children }: ShishyaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}
