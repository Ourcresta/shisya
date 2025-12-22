import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";

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
        <div className="grid gap-3 sm:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.certificateId} className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                    <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate" data-testid={`cert-title-${cert.certificateId}`}>
                      {cert.courseTitle}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge className={getLevelColor(cert.level)}>
                        {cert.level.charAt(0).toUpperCase() + cert.level.slice(1)}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Issued {format(new Date(cert.issuedAt), "MMM d, yyyy")}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/certificates/${cert.certificateId}`} data-testid={`link-view-cert-${cert.certificateId}`}>
                          View
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/verify/${cert.certificateId}`} data-testid={`link-verify-cert-${cert.certificateId}`}>
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Verify
                        </Link>
                      </Button>
                    </div>
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
