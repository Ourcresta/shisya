import { Link, useLocation, Redirect } from "wouter";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Coins,
  ClipboardCheck,
  FlaskConical,
  FolderKanban,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GuruAuthProvider, useGuruAuth } from "@/contexts/GuruAuthContext";

const menuItems = [
  { title: "Dashboard", url: "/guru/dashboard", icon: LayoutDashboard },
  { title: "Courses", url: "/guru/courses", icon: BookOpen },
  { title: "Students", url: "/guru/students", icon: Users },
  { title: "Credits", url: "/guru/credits", icon: Coins },
  { title: "Tests", url: "/guru/tests", icon: ClipboardCheck },
  { title: "Labs", url: "/guru/labs", icon: FlaskConical },
  { title: "Projects", url: "/guru/projects", icon: FolderKanban },
  { title: "Settings", url: "/guru/settings", icon: Settings },
];

function GuruLayoutInner({ children }: { children: React.ReactNode }) {
  const { admin, isLoading, isAuthenticated, logout } = useGuruAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/guru" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/guru/dashboard">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-guru-home">
                <Shield className="w-6 h-6 text-orange-500" />
                <span className="text-base font-bold tracking-tight">OurShiksha Guru</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        tooltip={item.title}
                      >
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-admin-name">
                  {admin?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {admin?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                data-testid="button-guru-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 border-b px-4 py-2 sticky top-0 z-50 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <span className="text-sm text-muted-foreground" data-testid="text-header-admin">
              {admin?.name}
            </span>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuruAuthProvider>
      <GuruLayoutInner>{children}</GuruLayoutInner>
    </GuruAuthProvider>
  );
}
