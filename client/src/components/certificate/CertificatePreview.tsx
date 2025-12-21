import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRCodeBlock from "./QRCodeBlock";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";

interface CertificatePreviewProps {
  certificate: Certificate;
  forPrint?: boolean;
}

export default function CertificatePreview({ certificate, forPrint = false }: CertificatePreviewProps) {
  const containerClass = forPrint
    ? "bg-white text-black p-8 aspect-[1.414/1] flex flex-col"
    : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6 md:p-8";

  return (
    <div 
      id="certificate-preview" 
      className={containerClass}
      data-testid="certificate-preview"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="w-8 h-8 text-amber-500" />
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400" style={{ fontFamily: "var(--font-display)" }}>
            AISiksha
          </span>
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-widest">
          Certificate of Completion
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center space-y-4">
        <div className="text-sm text-muted-foreground">This is to certify that</div>
        
        <div 
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid="text-student-name"
        >
          {certificate.studentName}
        </div>
        
        <div className="text-sm text-muted-foreground">has successfully completed</div>
        
        <div 
          className="text-xl md:text-2xl font-semibold text-primary"
          data-testid="text-course-title"
        >
          {certificate.courseTitle}
        </div>

        <div className="flex justify-center pt-2">
          <Badge 
            className={`
              ${certificate.level === "beginner" ? "bg-emerald-100 text-emerald-700" : ""}
              ${certificate.level === "intermediate" ? "bg-blue-100 text-blue-700" : ""}
              ${certificate.level === "advanced" ? "bg-purple-100 text-purple-700" : ""}
            `}
          >
            {certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1)} Level
          </Badge>
        </div>
      </div>

      {certificate.skills.length > 0 && (
        <div className="text-center mb-6">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Skills Validated</div>
          <div className="flex flex-wrap justify-center gap-1">
            {certificate.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between gap-4 pt-4 border-t border-amber-200 dark:border-amber-800">
        <div className="text-left">
          <div className="text-xs text-muted-foreground">Issue Date</div>
          <div className="font-medium" data-testid="text-issue-date">
            {format(new Date(certificate.issuedAt), "MMMM d, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground mt-2">Certificate ID</div>
          <div className="font-mono text-sm" data-testid="text-cert-id">
            {certificate.certificateId}
          </div>
        </div>
        
        <div className="text-center">
          <QRCodeBlock url={certificate.verificationUrl} size={80} />
          <div className="text-xs text-muted-foreground mt-1">Scan to verify</div>
        </div>
      </div>
    </div>
  );
}
