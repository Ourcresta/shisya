import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Award, Plus, Trash2, ExternalLink, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import type { ExternalCertification } from "@/lib/portfolioExtras";
import {
  addExternalCertification,
  removeExternalCertification,
  isValidGoogleDriveLink,
  getGoogleDriveThumbnailUrl,
  getGoogleDrivePreviewUrl,
} from "@/lib/portfolioExtras";
import { useToast } from "@/hooks/use-toast";

interface ExternalCertificationsSectionProps {
  certifications: ExternalCertification[];
  onChange: (certs: ExternalCertification[]) => void;
  isPublicView?: boolean;
}

export default function ExternalCertificationsSection({
  certifications,
  onChange,
  isPublicView = false,
}: ExternalCertificationsSectionProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<ExternalCertification | null>(null);

  const handleAdd = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a certification title.", variant: "destructive" });
      return;
    }
    if (!driveLink.trim() || !isValidGoogleDriveLink(driveLink.trim())) {
      toast({ title: "Invalid link", description: "Please enter a valid Google Drive link.", variant: "destructive" });
      return;
    }
    const newCert = addExternalCertification(title.trim(), driveLink.trim());
    onChange([...certifications, newCert]);
    setTitle("");
    setDriveLink("");
    setAddOpen(false);
    toast({ title: "Certification added", description: "Your certification has been added to your portfolio." });
  };

  const handleRemove = (id: string) => {
    removeExternalCertification(id);
    onChange(certifications.filter((c) => c.id !== id));
    toast({ title: "Certification removed" });
  };

  return (
    <div data-testid="external-certifications-section">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">External Certifications</h3>
        {certifications.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{certifications.length} added</Badge>
        )}
        {!isPublicView && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-external-cert">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Certification from Google Drive</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Certification Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AWS Cloud Practitioner"
                    data-testid="input-ext-cert-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Google Drive Link</label>
                  <Input
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    data-testid="input-ext-cert-link"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Paste a shareable Google Drive link to your certification file (PDF/image).
                  </p>
                </div>
                {driveLink && isValidGoogleDriveLink(driveLink) && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Preview</p>
                    </div>
                    <div className="aspect-video bg-muted/50">
                      <iframe
                        src={getGoogleDrivePreviewUrl(driveLink) || ""}
                        className="w-full h-full border-0"
                        title="Certificate preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" data-testid="button-cancel-ext-cert">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAdd} data-testid="button-save-ext-cert">
                  Add Certification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {certifications.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {certifications.map((cert) => {
            const thumbnailUrl = getGoogleDriveThumbnailUrl(cert.driveLink);
            const previewUrl = getGoogleDrivePreviewUrl(cert.driveLink);
            return (
              <Card key={cert.id} className="overflow-visible">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    {thumbnailUrl && (
                      <div
                        className="w-full h-32 rounded-md bg-muted overflow-hidden cursor-pointer"
                        onClick={() => setPreviewCert(cert)}
                        data-testid={`button-preview-ext-cert-${cert.id}`}
                      >
                        <img
                          src={thumbnailUrl}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate" data-testid={`text-ext-cert-title-${cert.id}`}>
                          {cert.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {format(new Date(cert.addedAt), "MMM d, yyyy")}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewCert(cert)}
                            data-testid={`button-view-ext-cert-${cert.id}`}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={cert.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`link-open-ext-cert-${cert.id}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              Open
                            </a>
                          </Button>
                          {!isPublicView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(cert.id)}
                              className="text-destructive"
                              data-testid={`button-remove-ext-cert-${cert.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No external certifications added</p>
            {!isPublicView && (
              <p className="text-sm text-muted-foreground mt-1">
                Add certifications from Google Drive to showcase in your portfolio
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewCert?.title}</DialogTitle>
          </DialogHeader>
          {previewCert && (
            <div className="aspect-[4/3] w-full bg-muted rounded-md overflow-hidden">
              <iframe
                src={getGoogleDrivePreviewUrl(previewCert.driveLink) || ""}
                className="w-full h-full border-0"
                title={previewCert.title}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
