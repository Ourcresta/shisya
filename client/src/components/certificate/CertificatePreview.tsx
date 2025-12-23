import { GraduationCap } from "lucide-react";
import QRCodeBlock from "./QRCodeBlock";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";

interface CertificatePreviewProps {
  certificate: Certificate;
  forPrint?: boolean;
}

export default function CertificatePreview({ certificate, forPrint = false }: CertificatePreviewProps) {
  const levelLabel = certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1);
  const academicYear = new Date(certificate.issuedAt).getFullYear();
  const completionMonth = format(new Date(certificate.issuedAt), "MMMM yyyy");

  return (
    <div 
      id="certificate-preview" 
      className={`
        relative overflow-hidden
        bg-white
        border-[3px] border-emerald-700
        p-8 md:p-10 lg:p-12
        aspect-[1.414/1]
        flex flex-col
      `}
      style={{ 
        background: forPrint ? "#fff" : "linear-gradient(135deg, #fefefe 0%, #f8fdf8 100%)",
        boxShadow: forPrint ? "none" : "0 4px 20px rgba(0,0,0,0.1)"
      }}
      data-testid="certificate-preview"
    >
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <GraduationCap className="w-[500px] h-[500px] text-emerald-900" />
      </div>

      <div className="absolute top-4 left-4 right-4 bottom-4 border border-emerald-600/30 pointer-events-none" />

      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 
          className="text-2xl md:text-3xl font-bold text-emerald-800 tracking-wide uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          OurShiksha
        </h1>
        <div className="text-sm text-slate-600 tracking-widest uppercase mt-1">
          Online Learning Platform
        </div>
        <div className="mt-4 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-600 to-transparent" />
      </div>

      <div className="text-center mb-6 relative z-10">
        <h2 
          className="text-lg md:text-xl font-bold text-emerald-700 tracking-[0.2em] uppercase"
          style={{ fontFamily: "serif" }}
        >
          Official Course Completion Certificate
        </h2>
      </div>

      <div className="text-right mb-4 relative z-10">
        <span className="text-sm text-slate-600">Folio No. : </span>
        <span className="font-mono text-sm text-slate-800" data-testid="text-cert-id">{certificate.certificateId}</span>
      </div>

      <div className="mb-6 relative z-10 text-slate-700 text-sm leading-relaxed">
        <p className="italic text-center mb-4">
          This is to certify that the undermentioned candidate has qualified for the award of
        </p>
        <p className="text-center font-medium text-slate-800 mb-2">
          Course Completion through
        </p>
        <p className="text-center text-lg font-bold text-emerald-800 uppercase tracking-wide mb-2">
          OurShiksha Online Learning Platform
        </p>
        <p className="italic text-center">
          as detailed below :
        </p>
      </div>

      <div className="flex-1 relative z-10 space-y-3 px-4 md:px-8">
        <div className="flex">
          <div className="w-40 text-sm text-slate-600 italic">Name</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-semibold text-slate-900 uppercase" data-testid="text-student-name">
              {certificate.studentName}
            </span>
          </div>
        </div>

        <div className="flex">
          <div className="w-40 text-sm text-slate-600 italic">Certificate No.</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-mono text-slate-800">{certificate.certificateId}</span>
          </div>
        </div>

        <div className="flex">
          <div className="w-40 text-sm text-slate-600 italic">Course</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-semibold text-slate-900" data-testid="text-course-title">
              {certificate.courseTitle}
            </span>
          </div>
        </div>

        <div className="flex">
          <div className="w-40 text-sm text-slate-600 italic">Level</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="text-slate-800">{levelLabel}</span>
          </div>
        </div>

        {certificate.skills.length > 0 && (
          <div className="flex">
            <div className="w-40 text-sm text-slate-600 italic">Skills Acquired</div>
            <div className="flex-1 text-sm">
              <span className="mr-2">:</span>
              <span className="text-slate-800">{certificate.skills.join(", ")}</span>
            </div>
          </div>
        )}

        <div className="flex">
          <div className="w-40 text-sm text-slate-600 italic">Month & Year of<br/>Completion</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-medium text-slate-800 uppercase">{completionMonth.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex">
          <div className="w-40 text-sm text-slate-600 italic">Classification</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-bold text-emerald-700 uppercase">PASSED</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 relative z-10">
        <div className="flex items-end justify-between gap-4">
          <div className="text-left">
            <div className="text-xs text-slate-500 mb-1">
              <span className="text-emerald-700 font-medium">Chennai</span>
            </div>
            <div className="text-sm text-slate-600">
              <span className="italic">Date : </span>
              <span className="font-medium" data-testid="text-issue-date">
                {format(new Date(certificate.issuedAt), "dd-MMM-yy").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-emerald-700 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="text-[8px] text-emerald-700 font-medium">OurShiksha</div>
                  <div className="text-[10px] text-emerald-800 font-bold">VERIFIED</div>
                  <div className="text-[7px] text-emerald-600">{academicYear}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <QRCodeBlock url={certificate.verificationUrl} size={70} />
            <div className="mt-2 border-t border-slate-300 pt-1">
              <div className="text-xs font-medium text-slate-700">Director of Certifications</div>
              <div className="text-[10px] text-slate-500 italic">OurShiksha</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 pt-3 border-t border-emerald-200 relative z-10">
        <div className="text-[10px] text-slate-500 italic">
          Issued by OurShiksha – Learn. Practice. Prove.
        </div>
        <div className="text-[9px] text-slate-400 mt-1">
          Verify this certificate at: {certificate.verificationUrl}
        </div>
      </div>
    </div>
  );
}
