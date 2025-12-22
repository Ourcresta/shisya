import type { Certificate } from "@shared/schema";

const STORAGE_KEY = "shishya_certificates";

export interface CertificateStore {
  [certificateId: string]: Certificate;
}

function generateCertificateId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) id += "-";
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export function getCertificates(): CertificateStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function getCertificate(certificateId: string): Certificate | null {
  const certificates = getCertificates();
  return certificates[certificateId] || null;
}

export function getCertificatesByCourse(courseId: number): Certificate[] {
  const certificates = getCertificates();
  return Object.values(certificates).filter(cert => cert.courseId === courseId);
}

export function getAllCertificates(): Certificate[] {
  const certificates = getCertificates();
  return Object.values(certificates).sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export function issueCertificate(
  courseId: number,
  courseTitle: string,
  studentName: string,
  level: "beginner" | "intermediate" | "advanced",
  skills: string[]
): Certificate {
  const certificates = getCertificates();
  
  const existingCert = Object.values(certificates).find(
    cert => cert.courseId === courseId
  );
  if (existingCert) {
    return existingCert;
  }
  
  const certificateId = generateCertificateId();
  const verificationUrl = `${window.location.origin}/verify/${certificateId}`;
  
  const certificate: Certificate = {
    certificateId,
    studentName,
    courseId,
    courseTitle,
    certificateTitle: `Certificate of Completion: ${courseTitle}`,
    certificateType: "completion",
    level,
    skills: skills || [],
    issuedAt: new Date().toISOString(),
    verificationUrl,
  };
  
  certificates[certificateId] = certificate;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
  
  return certificate;
}

export function hasCertificateForCourse(courseId: number): boolean {
  const certificates = getCertificates();
  return Object.values(certificates).some(cert => cert.courseId === courseId);
}

export function verifyCertificate(certificateId: string): { valid: boolean; certificate: Certificate | null } {
  const certificate = getCertificate(certificateId);
  if (!certificate) {
    return { valid: false, certificate: null };
  }
  return { valid: true, certificate };
}

export function initializeMockCertificates(studentName: string = "Demo Student"): void {
  const certificates = getCertificates();
  if (Object.keys(certificates).length > 0) return;
  
  const mockCerts: Certificate[] = [
    {
      certificateId: "CERT-7X9K-M2PL",
      studentName,
      courseId: 1,
      courseTitle: "Introduction to Web Development",
      certificateTitle: "Certificate of Completion: Introduction to Web Development",
      certificateType: "completion",
      level: "beginner",
      skills: ["HTML5", "CSS3", "JavaScript Basics", "Responsive Design", "Git"],
      issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      verificationUrl: `${window.location.origin}/verify/CERT-7X9K-M2PL`,
    },
    {
      certificateId: "CERT-4B8N-Q5RT",
      studentName,
      courseId: 3,
      courseTitle: "Full Stack Development",
      certificateTitle: "Certificate of Completion: Full Stack Development",
      certificateType: "completion",
      level: "advanced",
      skills: ["React", "Node.js", "Express", "MongoDB", "REST APIs", "Authentication"],
      issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      verificationUrl: `${window.location.origin}/verify/CERT-4B8N-Q5RT`,
    },
  ];
  
  const store: CertificateStore = {};
  mockCerts.forEach(cert => {
    store[cert.certificateId] = cert;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
