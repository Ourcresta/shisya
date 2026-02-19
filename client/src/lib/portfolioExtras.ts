const CERTS_KEY = "shishya_external_certifications";
const NOTES_KEY = "shishya_portfolio_notes";

export interface ExternalCertification {
  id: string;
  title: string;
  driveLink: string;
  addedAt: string;
}

export interface PortfolioNote {
  id: string;
  title: string;
  link: string;
  addedAt: string;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getExternalCertifications(): ExternalCertification[] {
  try {
    const stored = localStorage.getItem(CERTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addExternalCertification(title: string, driveLink: string): ExternalCertification {
  const certs = getExternalCertifications();
  const newCert: ExternalCertification = {
    id: generateId(),
    title,
    driveLink,
    addedAt: new Date().toISOString(),
  };
  certs.push(newCert);
  localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
  return newCert;
}

export function removeExternalCertification(id: string): void {
  const certs = getExternalCertifications().filter((c) => c.id !== id);
  localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
}

export function getPortfolioNotes(): PortfolioNote[] {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addPortfolioNote(title: string, link: string): PortfolioNote {
  const notes = getPortfolioNotes();
  const newNote: PortfolioNote = {
    id: generateId(),
    title,
    link,
    addedAt: new Date().toISOString(),
  };
  notes.push(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return newNote;
}

export function removePortfolioNote(id: string): void {
  const notes = getPortfolioNotes().filter((n) => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function getGoogleDrivePreviewUrl(driveLink: string): string | null {
  const fileIdMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  const idParam = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam) {
    return `https://drive.google.com/file/d/${idParam[1]}/preview`;
  }
  return null;
}

export function getGoogleDriveThumbnailUrl(driveLink: string): string | null {
  const fileIdMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w400`;
  }
  const idParam = driveLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam) {
    return `https://drive.google.com/thumbnail?id=${idParam[1]}&sz=w400`;
  }
  return null;
}

export function isValidGoogleDriveLink(link: string): boolean {
  return /drive\.google\.com/.test(link) && (/\/d\/[a-zA-Z0-9_-]+/.test(link) || /[?&]id=[a-zA-Z0-9_-]+/.test(link));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
