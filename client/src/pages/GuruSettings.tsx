import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuruAuth } from "@/contexts/GuruAuthContext";
import { LayoutDashboard, BookOpen, Users, RefreshCw, Plug } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface IntegrationStatus {
  zoho: {
    configured: boolean;
    status: string;
  };
  aisiksha: {
    configured: boolean;
  };
  resend: {
    configured: boolean;
  };
}

export default function GuruSettings() {
  const { admin } = useGuruAuth();
  const { toast } = useToast();

  const { data: integrations, isLoading: integrationsLoading } = useQuery<IntegrationStatus>({
    queryKey: ["/api/guru/settings/integrations"],
  });

  const zohoConnected = integrations?.zoho?.configured ?? false;

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/guru/zoho/test-connection");
      return res.json();
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      toast({
        title: "Connection Test",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/settings/integrations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/guru/zoho/sync");
      return res.json();
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      toast({
        title: "Sync Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/settings/integrations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium" data-testid="text-aisiksha-label">
                AISiksha Admin URL
              </p>
              <p className="text-xs text-muted-foreground">Integration endpoint</p>
            </div>
            <Badge
              variant={integrations?.aisiksha?.configured ? "default" : "secondary"}
              data-testid="badge-aisiksha-status"
            >
              {integrationsLoading ? "checking..." : integrations?.aisiksha?.configured ? "configured" : "not configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium" data-testid="text-resend-label">
                Resend Email
              </p>
              <p className="text-xs text-muted-foreground">Email service provider</p>
            </div>
            <Badge
              variant={integrations?.resend?.configured ? "default" : "secondary"}
              data-testid="badge-resend-status"
            >
              {integrationsLoading ? "checking..." : integrations?.resend?.configured ? "configured" : "not configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium" data-testid="text-database-label">
                Database
              </p>
              <p className="text-xs text-muted-foreground">PostgreSQL connection</p>
            </div>
            <Badge variant="default" data-testid="badge-database-status">
              connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-zoho-integration">
        <CardHeader>
          <CardTitle>Zoho TrainerCentral Integration</CardTitle>
          <CardDescription>Sync courses and users from Zoho TrainerCentral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium" data-testid="text-zoho-connection-label">
                Connection Status
              </p>
            </div>
            <Badge
              variant={zohoConnected ? "default" : "secondary"}
              data-testid="badge-zoho-status"
            >
              {integrationsLoading ? "checking..." : zohoConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" data-testid="text-zoho-features-label">
              What This Does
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li data-testid="text-zoho-feature-catalog">Syncs course catalog from TrainerCentral</li>
              <li data-testid="text-zoho-feature-enrollments">Imports user enrollments</li>
              <li data-testid="text-zoho-feature-updates">Keeps content updated automatically</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" data-testid="text-zoho-setup-label">
              Setup Instructions
            </p>
            <p className="text-sm text-muted-foreground mb-2" data-testid="text-zoho-setup-description">
              To connect Zoho TrainerCentral, you need to add your Zoho API credentials in the Secrets tab.
            </p>
            <p className="text-sm text-muted-foreground mb-3" data-testid="text-zoho-required-secrets">
              Required secrets: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_ORG_ID
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isPending}
                data-testid="button-zoho-test-connection"
              >
                <Plug className="w-4 h-4 mr-2" />
                {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
              <Button
                variant="outline"
                onClick={() => syncMutation.mutate()}
                disabled={!zohoConnected || syncMutation.isPending}
                data-testid="button-zoho-sync"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {syncMutation.isPending ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
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
