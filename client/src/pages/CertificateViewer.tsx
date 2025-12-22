import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Download, Copy, Check, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CertificatePreview from "@/components/certificate/CertificatePreview";
import { getCertificate, initializeMockCertificates } from "@/lib/certificates";
import type { Certificate } from "@shared/schema";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CertificateViewer() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeMockCertificates("Demo Student");
    if (certificateId) {
      const cert = getCertificate(certificateId);
      setCertificate(cert);
    }
    setLoading(false);
  }, [certificateId]);

  const handleCopyLink = async () => {
    if (!certificate) return;
    try {
      await navigator.clipboard.writeText(certificate.verificationUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Verification link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificate || !previewRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffbeb",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${certificate.certificateId}-certificate.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your certificate has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading certificate...</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The certificate you're looking for doesn't exist.
          </p>
          <Link href="/shisya/certificates">
            <Button>Back to Certificates</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/shisya/certificates">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Certificates
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div ref={previewRef}>
            <CertificatePreview certificate={certificate} />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={handleDownloadPDF} 
                  className="gap-2"
                  disabled={downloading}
                  data-testid="button-download-pdf"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Generating..." : "Download PDF"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopyLink}
                  className="gap-2"
                  data-testid="button-copy-link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Verification Link"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Verify this certificate at:{" "}
              <a 
                href={certificate.verificationUrl}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {certificate.verificationUrl}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
