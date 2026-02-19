import { Link } from "wouter";
import { Award, Download, ExternalLink, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CertificateCardProps {
  certificate: Certificate;
}

function LevelBadge({ level }: { level: "beginner" | "intermediate" | "advanced" }) {
  const colors = {
    beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Badge className={`${colors[level]} text-[10px]`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const { toast } = useToast();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/${certificate.certificateId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link copied",
        description: "Certificate verification link copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Share",
        description: shareUrl,
      });
    });
  };

  return (
    <Card className="hover-elevate flex flex-col h-full" data-testid={`card-certificate-${certificate.certificateId}`}>
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-1">
          <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <LevelBadge level={certificate.level} />
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold text-sm leading-tight line-clamp-2"
            data-testid={`text-cert-title-${certificate.certificateId}`}
          >
            {certificate.courseTitle}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            {format(new Date(certificate.issuedAt), "MMM d, yyyy")}
          </p>
        </div>

        {certificate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {certificate.skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                {skill}
              </Badge>
            ))}
            {certificate.skills.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{certificate.skills.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 pt-1 mt-auto">
          <Link href={`/shishya/certificates/${certificate.certificateId}`} className="flex-1">
            <Button size="sm" className="w-full text-xs gap-1" data-testid={`button-view-cert-${certificate.certificateId}`}>
              <ExternalLink className="w-3 h-3" />
              View
            </Button>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={handleShare}
                data-testid={`button-share-cert-${certificate.certificateId}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share certificate link</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
