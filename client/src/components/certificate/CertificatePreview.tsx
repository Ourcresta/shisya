import QRCodeBlock from "./QRCodeBlock";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";
import ourShikshaStamp from "@assets/image_1766511184194.png";

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
      className="relative aspect-[1.414/1]"
      style={{ 
        backgroundColor: "#ffffff",
        boxShadow: forPrint ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
        fontFamily: "'Times New Roman', 'Libre Baskerville', serif"
      }}
      data-testid="certificate-preview"
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: "#ffffff",
          background: `
            #ffffff
            linear-gradient(90deg, #1e3a5f 0%, #1e3a5f 10px, transparent 10px),
            linear-gradient(90deg, transparent calc(100% - 10px), #1e3a5f calc(100% - 10px)),
            linear-gradient(0deg, #1e3a5f 0%, #1e3a5f 10px, transparent 10px),
            linear-gradient(0deg, transparent calc(100% - 10px), #1e3a5f calc(100% - 10px))
          `
        }}
      />
      <div 
        className="absolute"
        style={{
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          border: '1px solid #1e3a5f',
          backgroundColor: "#ffffff"
        }}
      />
      <div className="absolute inset-0 p-10 md:p-12 flex flex-col" style={{ backgroundColor: "transparent" }}>
        
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          <img src={ourShikshaStamp} alt="" className="w-[320px] h-[320px] object-contain" />
        </div>

        <div 
          className="absolute top-6 left-6 z-20"
        >
          <img 
            src={ourShikshaStamp} 
            alt="OurShiksha Seal" 
            className="w-40 h-40 object-contain"
          />
        </div>

        <div className="text-center mb-3 relative z-10">
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-[0.1em] uppercase"
            style={{ color: "#1e3a5f" }}
          >
            OUR SHIKSHA
          </h1>
          <div 
            className="text-xs tracking-[0.2em] uppercase mt-1"
            style={{ color: "#4a5568" }}
          >
            Established Learning Authority
          </div>
          <div 
            className="text-sm mt-1"
            style={{ color: "#2d3748" }}
          >
            Chennai – 600 025
          </div>
        </div>

        <div className="text-center mb-4 relative z-10">
          <h2 
            className="text-lg md:text-xl font-bold tracking-[0.15em] uppercase"
            style={{ color: "#1e3a5f" }}
          >
            Course Completion Certificate
          </h2>
        </div>

        <div className="text-right mb-2 relative z-10">
          <span className="text-sm" style={{ color: "#4a5568" }}>Folio No. : </span>
          <span className="text-sm font-medium" style={{ color: "#1e3a5f" }} data-testid="text-cert-id">
            {certificate.certificateId}
          </span>
        </div>

        <div className="mb-4 relative z-10" style={{ color: "#2d3748" }}>
          <p className="italic text-sm text-center">
            This is to certify that the undermentioned candidate has successfully completed 
            the requirements prescribed for the award of the above certificate as detailed below :
          </p>
        </div>

        <div className="flex-1 relative z-10 flex justify-center">
          <div className="space-y-1.5 text-sm" style={{ color: "#2d3748" }}>
            <div className="flex">
              <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Name</div>
              <div className="w-64">
                <span className="mr-2">:</span>
                <span className="font-semibold uppercase" style={{ color: "#1e3a5f" }} data-testid="text-student-name">
                  {certificate.studentName}
                </span>
              </div>
            </div>

            <div className="flex">
              <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Registration No.</div>
              <div className="w-64">
                <span className="mr-2">:</span>
                <span style={{ color: "#1e3a5f" }}>{certificate.certificateId}</span>
              </div>
            </div>

            <div className="flex">
              <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Course</div>
              <div className="w-64">
                <span className="mr-2">:</span>
                <span className="font-semibold uppercase" style={{ color: "#1e3a5f" }} data-testid="text-course-title">
                  {certificate.courseTitle}
                </span>
              </div>
            </div>

            <div className="flex">
              <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Level</div>
              <div className="w-64">
                <span className="mr-2">:</span>
                <span className="uppercase" style={{ color: "#1e3a5f" }}>{levelLabel.toUpperCase()}</span>
              </div>
            </div>

            {certificate.skills.length > 0 && (
              <div className="flex">
                <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Specialization</div>
                <div className="w-64">
                  <span className="mr-2">:</span>
                  <span className="uppercase" style={{ color: "#1e3a5f" }}>
                    {certificate.skills.slice(0, 3).join(", ")}
                  </span>
                </div>
              </div>
            )}

            <div className="flex">
              <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Month & Year of Completion</div>
              <div className="w-64">
                <span className="mr-2">:</span>
                <span className="font-medium" style={{ color: "#1e3a5f" }}>{completionMonth}</span>
              </div>
            </div>

            <div className="flex">
              <div className="w-44 italic text-right pr-4" style={{ color: "#4a5568" }}>Classification</div>
              <div className="w-64">
                <span className="mr-2">:</span>
                <span className="font-bold" style={{ color: "#1e3a5f" }}>FIRST CLASS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm" style={{ color: "#4a5568" }}>
                <span style={{ color: "#1e3a5f" }}>Date : </span>
                <span data-testid="text-issue-date">
                  {format(new Date(certificate.issuedAt), "dd-MMM-yyyy").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <img 
                src={ourShikshaStamp} 
                alt="Official Seal" 
                className="w-[88px] h-[88px] object-contain ml-[10%]"
              />
              
              <div className="text-right">
                <div className="mb-6"></div>
                <div className="border-t pt-1" style={{ borderColor: "#1e3a5f", minWidth: "130px" }}>
                  <div className="text-xs font-medium" style={{ color: "#1e3a5f" }}>
                    Director of Certifications
                  </div>
                  <div className="text-[10px]" style={{ color: "#4a5568" }}>
                    OUR SHIKSHA
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <QRCodeBlock url={certificate.verificationUrl} size={60} />
                <div className="text-[7px] mt-1 text-center max-w-[70px]" style={{ color: "#4a5568" }}>
                  This certificate is digitally verifiable
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
