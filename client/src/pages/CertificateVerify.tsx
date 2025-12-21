import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { CheckCircle, XCircle, Award, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { verifyCertificate, initializeMockCertificates } from "@/lib/certificates";
import type { Certificate } from "@shared/schema";
import { format } from "date-fns";

export default function CertificateVerify() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    initializeMockCertificates("Demo Student");
    if (certificateId) {
      const result = verifyCertificate(certificateId);
      setValid(result.valid);
      setCertificate(result.certificate);
    }
    setLoading(false);
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying certificate...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              AISiksha Certificate Verification
            </span>
          </div>
        </div>

        {valid && certificate ? (
          <Card data-testid="verification-valid">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <Badge className="mx-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 mb-2">
                Verified
              </Badge>
              <CardTitle className="text-xl" data-testid="text-valid-title">
                This certificate is valid and issued by AISiksha
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Student Name</div>
                  <div className="font-medium text-lg" data-testid="text-student-name">
                    {certificate.studentName}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Course Completed</div>
                  <div className="font-medium text-lg" data-testid="text-course-title">
                    {certificate.courseTitle}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Certificate Type</div>
                    <div className="font-medium capitalize">
                      {certificate.certificateType}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Level</div>
                    <Badge 
                      className={`
                        ${certificate.level === "beginner" ? "bg-emerald-100 text-emerald-700" : ""}
                        ${certificate.level === "intermediate" ? "bg-blue-100 text-blue-700" : ""}
                        ${certificate.level === "advanced" ? "bg-purple-100 text-purple-700" : ""}
                      `}
                    >
                      {certificate.level.charAt(0).toUpperCase() + certificate.level.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Issue Date</div>
                  <div className="font-medium" data-testid="text-issue-date">
                    {format(new Date(certificate.issuedAt), "MMMM d, yyyy")}
                  </div>
                </div>

                {certificate.skills.length > 0 && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-2">Skills Validated</div>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Certificate ID</div>
                  <div className="font-mono text-sm" data-testid="text-cert-id">
                    {certificate.certificateId}
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground pt-2">
                  <span className="flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" />
                    Issued by AISiksha
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="verification-invalid">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4">
                <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-rose-600" />
                </div>
              </div>
              <Badge className="mx-auto bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 mb-2">
                Invalid
              </Badge>
              <CardTitle className="text-xl" data-testid="text-invalid-title">
                Certificate not found or invalid
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                The certificate ID <span className="font-mono">{certificateId}</span> could not be verified.
                Please check the ID and try again.
              </p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            AISiksha Certificate Verification System
          </p>
        </div>
      </div>
    </div>
  );
}
