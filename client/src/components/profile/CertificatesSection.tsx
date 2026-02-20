import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Eye, Share2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CertificatesSectionProps {
  certificates: Certificate[];
  showEmpty?: boolean;
  isPublicView?: boolean;
}

export default function CertificatesSection({ 
  certificates, 
  showEmpty = true,
  isPublicView = false
}: CertificatesSectionProps) {
  const { toast } = useToast();

  if (certificates.length === 0 && !showEmpty) {
    return null;
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "intermediate":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "advanced":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "";
    }
  };

  const handleShare = async (cert: Certificate) => {
    const url = `${window.location.origin}/certificates/${cert.certificateId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cert.courseTitle} Certificate`,
          text: `Check out my ${cert.courseTitle} certificate from OurShiksha!`,
          url,
        });
      } catch {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Certificate link copied to clipboard." });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Certificate link copied to clipboard." });
    }
  };

  return (
    <div data-testid="certificates-section">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Certificates</h3>
        {certificates.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{certificates.length} earned</Badge>
        )}
      </div>

      {certificates.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {certificates.map((cert) => (
            <Card key={cert.certificateId} className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 ml-auto">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 leading-tight" data-testid={`cert-title-${cert.certificateId}`}>
                      {cert.courseTitle}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge className={`text-[10px] ${getLevelColor(cert.level)}`}>
                        {cert.level.charAt(0).toUpperCase() + cert.level.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Issued {format(new Date(cert.issuedAt), "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1 border-t">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/certificates/${cert.certificateId}`} data-testid={`link-view-cert-${cert.certificateId}`}>
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/certificates/${cert.certificateId}`} data-testid={`link-download-cert-${cert.certificateId}`}>
                        <Download className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(cert)}
                      data-testid={`button-share-cert-${cert.certificateId}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No certificates earned yet</p>
            {!isPublicView && (
              <p className="text-sm text-muted-foreground mt-1">
                Complete a course to earn your first certificate
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
