import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Award, GraduationCap } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CertificateCard from "@/components/certificate/CertificateCard";
import { getAllCertificates, initializeMockCertificates } from "@/lib/certificates";
import type { Certificate } from "@shared/schema";

export default function CertificatesDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    initializeMockCertificates("Demo Student");
    setCertificates(getAllCertificates());
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-page-title"
            >
              My Certificates
            </h1>
            <p className="text-muted-foreground">
              Your earned certificates and achievements
            </p>
          </div>
        </div>

        {certificates.length > 0 ? (
          <div className="grid gap-4" data-testid="certificates-grid">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.certificateId} certificate={certificate} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete courses to earn certificates.
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
