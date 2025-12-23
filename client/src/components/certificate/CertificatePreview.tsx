import QRCodeBlock from "./QRCodeBlock";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";
import ourShikshaSeal from "@assets/ourshiksha-seal.png";

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
      className="relative overflow-hidden bg-white p-6 md:p-8 lg:p-10 aspect-[1.414/1] flex flex-col"
      style={{ 
        background: "#fff",
        boxShadow: forPrint ? "none" : "0 4px 20px rgba(0,0,0,0.1)"
      }}
      data-testid="certificate-preview"
    >
      <div className="absolute inset-3 border-2 border-slate-800 pointer-events-none" />
      <div className="absolute inset-4 border border-slate-400 pointer-events-none" />

      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <img src={ourShikshaSeal} alt="" className="w-[400px] h-[400px] object-contain" />
      </div>

      <div className="text-center mb-4 relative z-10">
        <h1 
          className="text-2xl md:text-3xl font-bold text-slate-800 tracking-wide uppercase"
          style={{ fontFamily: "serif" }}
        >
          OUR SHIKSHA
        </h1>
        <div className="text-sm text-slate-600 tracking-widest uppercase mt-1" style={{ fontFamily: "serif" }}>
          AI Powered Learning Platform
        </div>
        <div className="mt-3 w-full h-[1px] bg-slate-400" />
      </div>

      <div className="text-center mb-4 relative z-10">
        <h2 
          className="text-lg md:text-xl font-bold text-slate-700 tracking-[0.15em] uppercase"
          style={{ fontFamily: "serif" }}
        >
          Course Completion Certificate
        </h2>
      </div>

      <div className="text-right mb-3 relative z-10">
        <span className="text-sm text-slate-600" style={{ fontFamily: "serif" }}>Folio No. : </span>
        <span className="font-mono text-sm text-slate-800" data-testid="text-cert-id">{certificate.certificateId}</span>
      </div>

      <div className="mb-4 relative z-10 text-slate-700 text-sm leading-relaxed" style={{ fontFamily: "serif" }}>
        <p className="italic text-center mb-3">
          This is to certify that the undermentioned candidate has qualified for the award of
        </p>
        <p className="text-center font-medium text-slate-800 mb-1">
          Course Completion through
        </p>
        <p className="text-center text-lg font-bold text-slate-900 uppercase tracking-wide mb-2">
          OUR SHIKSHA AI POWERED LEARNING PLATFORM
        </p>
        <p className="italic text-center text-sm">
          as detailed below :
        </p>
      </div>

      <div className="flex-1 relative z-10 space-y-2 px-4 md:px-12" style={{ fontFamily: "serif" }}>
        <div className="flex">
          <div className="w-44 text-sm text-slate-600 italic">Name</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-semibold text-slate-900 uppercase" data-testid="text-student-name">
              {certificate.studentName}
            </span>
          </div>
        </div>

        <div className="flex">
          <div className="w-44 text-sm text-slate-600 italic">Register No.</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-mono text-slate-800">{certificate.certificateId}</span>
          </div>
        </div>

        <div className="flex">
          <div className="w-44 text-sm text-slate-600 italic">Course</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-semibold text-slate-900 uppercase" data-testid="text-course-title">
              {certificate.courseTitle}
            </span>
          </div>
        </div>

        <div className="flex">
          <div className="w-44 text-sm text-slate-600 italic">Level</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="text-slate-800 uppercase">{levelLabel}</span>
          </div>
        </div>

        {certificate.skills.length > 0 && (
          <div className="flex">
            <div className="w-44 text-sm text-slate-600 italic">Skills Acquired</div>
            <div className="flex-1 text-sm">
              <span className="mr-2">:</span>
              <span className="text-slate-800 uppercase">{certificate.skills.join(", ")}</span>
            </div>
          </div>
        )}

        <div className="flex">
          <div className="w-44 text-sm text-slate-600 italic">Month & Year of<br/>Completion</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-medium text-slate-800 uppercase">{completionMonth.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex">
          <div className="w-44 text-sm text-slate-600 italic">Classification</div>
          <div className="flex-1 text-sm">
            <span className="mr-2">:</span>
            <span className="font-bold text-slate-900 uppercase">PASSED</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 relative z-10">
        <div className="flex items-end justify-between gap-4">
          <div className="text-left" style={{ fontFamily: "serif" }}>
            <div className="text-sm text-slate-700 font-medium mb-1">
              Chennai
            </div>
            <div className="text-sm text-slate-600">
              <span className="italic">Date : </span>
              <span className="font-medium" data-testid="text-issue-date">
                {format(new Date(certificate.issuedAt), "dd-MMM-yy").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <img 
              src={ourShikshaSeal} 
              alt="OurShiksha Official Seal" 
              className="w-24 h-24 object-contain"
            />
          </div>

          <div className="text-center flex flex-col items-center">
            <QRCodeBlock url={certificate.verificationUrl} size={80} />
            <div className="mt-2 pt-1" style={{ fontFamily: "serif" }}>
              <div className="text-xs font-medium text-slate-700">Director of Certifications</div>
              <div className="text-[10px] text-slate-500 italic">OurShiksha</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-3 pt-2 border-t border-slate-300 relative z-10" style={{ fontFamily: "serif" }}>
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
