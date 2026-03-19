import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Zap, Users, AlertTriangle, CheckCircle2, RefreshCw, Settings2 } from "lucide-react";

interface CdnStatusData {
  mode: "cloudflare" | "bunny";
  activeUrl: string;
  metrics: {
    date: string;
    uniqueViewers: number;
    playSessions: number;
    bufferingEvents: number;
    bufferingRate: number;
  };
  thresholds: {
    viewers: number;
    bufferingPct: number;
  };
  switchLog: string;
  b2CloudflareUrl: string | null;
  bunnyCdnUrl: string | null;
}

export default function GuruCdnStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery<CdnStatusData>({
    queryKey: ["/api/guru/cdn-status"],
    refetchInterval: 30000,
  });

  const overrideMutation = useMutation({
    mutationFn: (mode: string) =>
      apiRequest("POST", "/api/guru/cdn-override", { mode }),
    onSuccess: (_res, mode) => {
      toast({ title: "CDN mode updated", description: `Switched to ${mode === "bunny" ? "Bunny CDN" : "Cloudflare CDN"}` });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/cdn-status"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update CDN mode", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics;
  const thresholds = data?.thresholds;
  const viewersPct = thresholds ? Math.min(100, ((metrics?.uniqueViewers ?? 0) / thresholds.viewers) * 100) : 0;
  const bufferingPct = metrics?.bufferingRate ?? 0;
  const viewersBreached = (metrics?.uniqueViewers ?? 0) > (thresholds?.viewers ?? 100);
  const bufferingBreached = bufferingPct > (thresholds?.bufferingPct ?? 5);
  const isCloudflare = data?.mode === "cloudflare";
  const cloudflareConfigured = !!data?.b2CloudflareUrl;
  const bunnyConfigured = !!data?.bunnyCdnUrl;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">CDN Status</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Auto-switches from Cloudflare → Bunny CDN when viewer or buffering thresholds are crossed.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          data-testid="button-cdn-refresh"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Active CDN Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {isCloudflare ? <Cloud className="w-5 h-5 text-orange-500" /> : <Zap className="w-5 h-5 text-violet-500" />}
            Active CDN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className={isCloudflare
                ? "border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-950/30 text-sm px-3 py-1"
                : "border-violet-400 text-violet-500 bg-violet-50 dark:bg-violet-950/30 text-sm px-3 py-1"
              }
              data-testid="badge-cdn-mode"
            >
              {isCloudflare ? "Cloudflare CDN (Free)" : "Bunny CDN (Performance)"}
            </Badge>
            {data?.activeUrl && (
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded truncate max-w-xs" data-testid="text-cdn-url">
                {data.activeUrl}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md border ${cloudflareConfigured ? "border-green-200 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "border-muted text-muted-foreground"}`}>
              {cloudflareConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              B2_CLOUDFLARE_URL {cloudflareConfigured ? "configured" : "not set"}
            </div>
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md border ${bunnyConfigured ? "border-green-200 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "border-muted text-muted-foreground"}`}>
              {bunnyConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              BUNNY_CDN_URL {bunnyConfigured ? "configured" : "not set"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Unique Viewers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Today's Unique Viewers
            </CardTitle>
            <CardDescription className="text-xs">
              Threshold: {thresholds?.viewers} viewers/day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold" data-testid="text-viewer-count">
                  {metrics?.uniqueViewers ?? 0}
                </span>
                <span className="text-xs text-muted-foreground mb-1">/ {thresholds?.viewers}</span>
              </div>
              <Progress
                value={viewersPct}
                className={`h-2 ${viewersBreached ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"}`}
              />
              {viewersBreached && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Threshold exceeded — Bunny CDN active
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buffering Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Today's Buffering Rate
            </CardTitle>
            <CardDescription className="text-xs">
              {metrics?.bufferingEvents ?? 0} stalls / {metrics?.playSessions ?? 0} sessions &nbsp;·&nbsp; Threshold: {thresholds?.bufferingPct}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold" data-testid="text-buffering-rate">
                  {bufferingPct.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground mb-1">/ {thresholds?.bufferingPct}%</span>
              </div>
              <Progress
                value={Math.min(100, (bufferingPct / (thresholds?.bufferingPct ?? 5)) * 100)}
                className={`h-2 ${bufferingBreached ? "[&>div]:bg-red-500" : "[&>div]:bg-amber-500"}`}
              />
              {bufferingBreached && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Buffering threshold exceeded
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Override */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Manual CDN Override
          </CardTitle>
          <CardDescription className="text-xs">
            Override the auto-detected CDN mode. The hourly evaluator will still run and may revert this.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select
              defaultValue={data?.mode}
              onValueChange={(val) => overrideMutation.mutate(val)}
              disabled={overrideMutation.isPending}
            >
              <SelectTrigger className="w-52" data-testid="select-cdn-override">
                <SelectValue placeholder="Select CDN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloudflare">
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-orange-500" />
                    Cloudflare CDN (Free)
                  </span>
                </SelectItem>
                <SelectItem value="bunny">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-500" />
                    Bunny CDN (Performance)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {overrideMutation.isPending && (
              <span className="text-xs text-muted-foreground">Saving…</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Switch Log */}
      {data?.switchLog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Auto-Switch Log</CardTitle>
            <CardDescription className="text-xs">Last 2000 characters of CDN switch events</CardDescription>
          </CardHeader>
          <CardContent>
            <pre
              className="text-xs font-mono bg-muted rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap"
              data-testid="text-switch-log"
            >
              {data.switchLog}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-4 pb-4">
          <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <p className="font-semibold">How auto-switching works</p>
            <p>Every hour the server checks today's metrics. If unique viewers exceed <strong>{thresholds?.viewers}</strong> or buffering rate exceeds <strong>{thresholds?.bufferingPct}%</strong>, it switches to Bunny CDN automatically. When metrics return to normal, it switches back to Cloudflare.</p>
            <p className="mt-1">Storage: <strong>Backblaze B2</strong> (both CDNs serve from B2 as origin). Video data is never re-uploaded when switching CDNs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
