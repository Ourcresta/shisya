import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuruAuth } from "@/contexts/GuruAuthContext";
import { LayoutDashboard, BookOpen, Users } from "lucide-react";

export default function GuruSettings() {
  const { admin } = useGuruAuth();

  const configStatus = {
    aiSikshaAdmin: import.meta.env.VITE_AISIKSHA_ADMIN_URL ? "configured" : "not configured",
    resendEmail: import.meta.env.VITE_RESEND_API_KEY ? "configured" : "not configured",
    database: "connected",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-settings-subtitle">
          Platform configuration and account settings
        </p>
      </div>

      <Card data-testid="card-admin-account">
        <CardHeader>
          <CardTitle>Admin Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground" data-testid="label-admin-name">
              Name
            </label>
            <p className="text-sm font-medium" data-testid="text-admin-name-value">
              {admin?.name || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground" data-testid="label-admin-email">
              Email
            </label>
            <p className="text-sm font-medium" data-testid="text-admin-email-value">
              {admin?.email || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground" data-testid="label-admin-role">
              Role
            </label>
            <p className="text-sm font-medium" data-testid="text-admin-role-value">
              {admin?.role || "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-platform-config">
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>Current environment settings status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" data-testid="text-aisiksha-label">
                AISiksha Admin URL
              </p>
              <p className="text-xs text-muted-foreground">Integration endpoint</p>
            </div>
            <Badge
              variant={configStatus.aiSikshaAdmin === "configured" ? "default" : "secondary"}
              data-testid="badge-aisiksha-status"
            >
              {configStatus.aiSikshaAdmin}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" data-testid="text-resend-label">
                Resend Email
              </p>
              <p className="text-xs text-muted-foreground">Email service provider</p>
            </div>
            <Badge
              variant={configStatus.resendEmail === "configured" ? "default" : "secondary"}
              data-testid="badge-resend-status"
            >
              {configStatus.resendEmail}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" data-testid="text-database-label">
                Database
              </p>
              <p className="text-xs text-muted-foreground">PostgreSQL connection</p>
            </div>
            <Badge variant="default" data-testid="badge-database-status">
              {configStatus.database}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to key administration areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/guru/dashboard">
              <Button variant="outline" className="w-full" data-testid="button-view-dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
            <Link href="/guru/courses">
              <Button variant="outline" className="w-full" data-testid="button-manage-courses">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
            </Link>
            <Link href="/guru/students">
              <Button variant="outline" className="w-full" data-testid="button-view-students">
                <Users className="w-4 h-4 mr-2" />
                View Students
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
