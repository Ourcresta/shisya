import { Link } from "wouter";
import { Award, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";

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
    <Badge className={colors[level]}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-certificate-${certificate.certificateId}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg" data-testid={`text-cert-title-${certificate.certificateId}`}>
              {certificate.courseTitle}
            </CardTitle>
          </div>
          <LevelBadge level={certificate.level} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Issue Date:</span>{" "}
            {format(new Date(certificate.issuedAt), "MMM d, yyyy")}
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
            Issued
          </Badge>
        </div>

        {certificate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {certificate.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {certificate.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{certificate.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2 flex-wrap">
          <Link href={`/shishya/certificates/${certificate.certificateId}`}>
            <Button className="gap-2" data-testid={`button-view-cert-${certificate.certificateId}`}>
              <ExternalLink className="w-4 h-4" />
              View Certificate
            </Button>
          </Link>
          <Link href={`/shishya/certificates/${certificate.certificateId}`}>
            <Button variant="outline" className="gap-2" data-testid={`button-download-${certificate.certificateId}`}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
