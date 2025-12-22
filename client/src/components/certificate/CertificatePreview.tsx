import { GraduationCap, Check, Brain, FolderKanban, BarChart3, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRCodeBlock from "./QRCodeBlock";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";

interface CertificatePreviewProps {
  certificate: Certificate;
  forPrint?: boolean;
}

export default function CertificatePreview({ certificate, forPrint = false }: CertificatePreviewProps) {
  const levelLabel = certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1);

  return (
    <div 
      id="certificate-preview" 
      className={`
        relative overflow-hidden
        ${forPrint ? "bg-amber-50" : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"}
        border-2 border-amber-400 dark:border-amber-600 rounded-xl
        p-6 md:p-8 lg:p-10
        aspect-[1.414/1]
        flex flex-col
      `}
      data-testid="certificate-preview"
    >
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <GraduationCap className="w-96 h-96" />
      </div>

      <div className="text-center mb-4 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span 
            className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SHISHYA
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
          AI-Powered Learning & Skill Validation
        </div>
        <div className="mt-3 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent dark:via-indigo-500 mx-auto w-2/3" />
      </div>

      <div className="text-center mb-4 relative z-10">
        <div 
          className="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400 mb-1"
          style={{ fontFamily: "serif" }}
        >
          Certificate of
        </div>
        <h1 
          className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide"
          style={{ fontFamily: "serif" }}
        >
          AI-VALIDATED SKILL COMPLETION
        </h1>
      </div>

      <div className="text-center mb-4 relative z-10">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          This is to certify that
        </div>
        <div 
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid="text-student-name"
        >
          {certificate.studentName}
        </div>
      </div>

      <div className="text-center mb-4 relative z-10">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          has successfully completed and demonstrated
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {levelLabel.toLowerCase()} proficiency in
        </div>
        <div 
          className="text-xl md:text-2xl font-bold text-indigo-700 dark:text-indigo-300"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid="text-course-title"
        >
          {certificate.courseTitle.toUpperCase()}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {levelLabel} Level · AI-Guided Learning
        </div>
      </div>

      {certificate.skills.length > 0 && (
        <div className="text-center mb-4 relative z-10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
            Skills Validated Through AI Tutor Sessions · Projects · Assessments
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
            {certificate.skills.map((skill) => (
              <Badge 
                key={skill} 
                variant="secondary" 
                className="text-xs bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mb-4 relative z-10">
        <div className="text-left text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
          <div className="font-medium text-slate-700 dark:text-slate-300 mb-1 text-xs">
            Assessment & Verification
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>AI Tutor-Guided Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Hands-on Project Evaluation</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Automated Skill Benchmarking</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Performance-Based Validation</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-amber-300/50 dark:border-amber-600/50 relative z-10">
        <div className="flex items-end justify-between gap-4">
          <div className="text-left space-y-1">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Issue Date
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200" data-testid="text-issue-date">
                {format(new Date(certificate.issuedAt), "d MMMM yyyy")}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Certificate ID
              </div>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-200" data-testid="text-cert-id">
                {certificate.certificateId}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Issued by
              </div>
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                shishya.ai
              </div>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <QRCodeBlock url={certificate.verificationUrl} size={90} />
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
              Scan to verify<br />authenticity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
