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
  const completionMonth = format(new Date(certificate.issuedAt), "MMMM yyyy").toUpperCase();

  return (
    <div 
      id="certificate-preview" 
      className="relative bg-white aspect-[1.414/1]"
      style={{ 
        boxShadow: forPrint ? "none" : "0 4px 20px rgba(0,0,0,0.15)"
      }}
      data-testid="certificate-preview"
    >
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, #5b8fb9 0%, #5b8fb9 8px, transparent 8px),
            linear-gradient(90deg, transparent calc(100% - 8px), #5b8fb9 calc(100% - 8px)),
            linear-gradient(0deg, #5b8fb9 0%, #5b8fb9 8px, transparent 8px),
            linear-gradient(0deg, transparent calc(100% - 8px), #5b8fb9 calc(100% - 8px))
          `
        }}
      />
      
      <div 
        className="absolute"
        style={{
          top: '12px',
          left: '12px',
          right: '12px',
          bottom: '12px',
          border: '2px solid #5b8fb9'
        }}
      />

      <div className="absolute inset-0 p-8 md:p-10 flex flex-col">
        
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          <img src={ourShikshaSeal} alt="" className="w-[350px] h-[350px] object-contain" />
        </div>

        <div className="text-center mb-4 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img 
              src={ourShikshaSeal} 
              alt="OurShiksha" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-slate-800 tracking-wide"
            style={{ fontFamily: "serif" }}
          >
            OUR SHIKSHA
          </h1>
          <div 
            className="text-sm text-slate-600 tracking-wider mt-1"
            style={{ fontFamily: "serif" }}
          >
            CHENNAI - 600 025
          </div>
        </div>

        <div className="text-center mb-4 relative z-10">
          <h2 
            className="text-base md:text-lg font-bold text-blue-800 tracking-[0.15em] uppercase"
            style={{ fontFamily: "serif" }}
          >
            Course Completion Certificate
          </h2>
        </div>

        <div className="text-right mb-3 relative z-10">
          <span className="text-sm text-slate-700" style={{ fontFamily: "serif" }}>Folio No. : </span>
          <span className="text-sm text-slate-800" data-testid="text-cert-id">{certificate.certificateId}</span>
        </div>

        <div className="mb-4 relative z-10 text-slate-700" style={{ fontFamily: "serif" }}>
          <p className="italic text-sm mb-3">
            This is to certify that the undermentioned candidate has qualified for the award of
          </p>
          <p className="text-sm mb-1">Course through :</p>
          <p className="text-base font-bold text-slate-900 uppercase tracking-wide mb-3 ml-4">
            OUR SHIKSHA AI POWERED LEARNING PLATFORM
          </p>
          <p className="italic text-sm">
            an autonomous online learning platform as detailed below :
          </p>
        </div>

        <div className="flex-1 relative z-10 space-y-2 text-sm" style={{ fontFamily: "serif" }}>
          <div className="flex">
            <div className="w-36 text-slate-700 italic">Name</div>
            <div className="flex-1">
              <span className="mr-2">:</span>
              <span className="font-medium text-slate-900 uppercase" data-testid="text-student-name">
                {certificate.studentName}
              </span>
            </div>
          </div>

          <div className="flex">
            <div className="w-36 text-slate-700 italic">Register No.</div>
            <div className="flex-1">
              <span className="mr-2">:</span>
              <span className="text-slate-800">{certificate.certificateId}</span>
            </div>
          </div>

          <div className="flex">
            <div className="w-36 text-slate-700 italic">Course</div>
            <div className="flex-1">
              <span className="mr-2">:</span>
              <span className="font-medium text-slate-900 uppercase" data-testid="text-course-title">
                {certificate.courseTitle}
              </span>
            </div>
          </div>

          <div className="flex">
            <div className="w-36 text-slate-700 italic">Level/<br/>Specialization</div>
            <div className="flex-1">
              <span className="mr-2">:</span>
              <span className="text-slate-800 uppercase">{levelLabel.toUpperCase()}</span>
              {certificate.skills.length > 0 && (
                <span className="text-slate-800 uppercase"> - {certificate.skills.slice(0, 3).join(", ")}</span>
              )}
            </div>
          </div>

          <div className="flex">
            <div className="w-36 text-slate-700 italic">Month & Year of<br/>Passing</div>
            <div className="flex-1">
              <span className="mr-2">:</span>
              <span className="font-medium text-slate-800">{completionMonth}</span>
            </div>
          </div>

          <div className="flex">
            <div className="w-36 text-slate-700 italic">Classification</div>
            <div className="flex-1">
              <span className="mr-2">:</span>
              <span className="font-bold text-slate-900">FIRST CLASS</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 relative z-10">
          <div className="flex items-end justify-between">
            <div style={{ fontFamily: "serif" }}>
              <div className="text-sm text-blue-700 font-medium">
                Chennai - 600 025
              </div>
              <div className="text-sm text-slate-700">
                <span className="text-blue-700">Date : </span>
                <span data-testid="text-issue-date">
                  {format(new Date(certificate.issuedAt), "dd-MMM-yy").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-full border-2 border-blue-800 flex items-center justify-center bg-white"
                  style={{ boxShadow: "0 0 0 1px #ccc" }}
                >
                  <div className="text-center text-blue-900">
                    <div className="text-[7px] font-medium">Controller of Examinations</div>
                    <div className="text-[9px] font-bold">Chennai</div>
                    <div className="text-[8px]">600 025</div>
                    <div className="text-[6px] mt-0.5">OurShiksha</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col items-center">
              <QRCodeBlock url={certificate.verificationUrl} size={70} />
              <div className="mt-1 pt-1 border-t border-slate-400" style={{ fontFamily: "serif" }}>
                <div className="text-xs text-slate-700">Controller of Examinations</div>
                <div className="text-[10px] text-slate-500">i/c</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
