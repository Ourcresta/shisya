import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, Plus, Trash2, ExternalLink, Download, Share2, FileText, ShieldCheck, Calendar, X, Eye } from "lucide-react";
import { format } from "date-fns";
import type { ExternalCertification } from "@/lib/portfolioExtras";
import {
  addExternalCertification,
  removeExternalCertification,
  isValidGoogleDriveLink,
  getGoogleDriveThumbnailUrl,
  getGoogleDrivePreviewUrl,
  isValidUrl,
  isVerifiedProvider,
  isVerifiedLink,
  CERTIFICATE_PROVIDERS,
  getExtCertsPortfolioVisible,
  setExtCertsPortfolioVisible,
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
  const [certifiedBy, setCertifiedBy] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<ExternalCertification | null>(null);
  const [showInPortfolio, setShowInPortfolio] = useState(getExtCertsPortfolioVisible);

  const resetForm = () => {
    setTitle("");
    setCertifiedBy("");
    setDriveLink("");
    setCompletionDate("");
    setSkillInput("");
    setSkills([]);
    setDescription("");
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast({ title: "Skill already added", variant: "destructive" });
      return;
    }
    if (skills.length >= 10) {
      toast({ title: "Maximum 10 skills", variant: "destructive" });
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAdd = () => {
    if (!title.trim()) {
      toast({ title: "Name required", description: "Please enter a certificate name.", variant: "destructive" });
      return;
    }
    if (!certifiedBy.trim()) {
      toast({ title: "Provider required", description: "Please select who certified you.", variant: "destructive" });
      return;
    }

    const link = driveLink.trim();
    if (link && !isValidUrl(link) && !isValidGoogleDriveLink(link)) {
      toast({ title: "Invalid link", description: "Please enter a valid URL or Google Drive link.", variant: "destructive" });
      return;
    }

    const newCert = addExternalCertification(
      title.trim(),
      certifiedBy.trim(),
      link,
      completionDate || undefined,
      skills.length > 0 ? skills : undefined,
      description.trim() || undefined
    );
    onChange([...certifications, newCert]);
    resetForm();
    setAddOpen(false);
    toast({ title: "Certificate added", description: "Your external certificate has been added." });
  };

  const handleRemove = (id: string) => {
    removeExternalCertification(id);
    onChange(certifications.filter((c) => c.id !== id));
    toast({ title: "Certificate removed" });
  };

  const handleTogglePortfolio = (checked: boolean) => {
    setShowInPortfolio(checked);
    setExtCertsPortfolioVisible(checked);
    toast({
      title: checked ? "Shown in portfolio" : "Hidden from portfolio",
      description: checked
        ? "External certificates will appear in your public portfolio."
        : "External certificates won't appear in your public portfolio.",
    });
  };

  const handleShare = async (cert: ExternalCertification) => {
    const text = `Check out my ${cert.title} certificate from ${cert.certifiedBy}!`;
    const url = cert.driveLink || "";
    if (navigator.share && url) {
      try {
        await navigator.share({ title: cert.title, text, url });
      } catch {
        if (url) {
          await navigator.clipboard.writeText(url);
          toast({ title: "Link copied", description: "Certificate link copied to clipboard." });
        }
      }
    } else if (url) {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Certificate link copied to clipboard." });
    } else {
      toast({ title: "No link available", description: "This certificate has no link to share.", variant: "destructive" });
    }
  };

  const handleDownload = (cert: ExternalCertification) => {
    if (cert.driveLink) {
      window.open(cert.driveLink, "_blank", "noopener,noreferrer");
    } else {
      toast({ title: "No link available", description: "This certificate has no download link.", variant: "destructive" });
    }
  };

  const getCertVerificationStatus = (cert: ExternalCertification) => {
    if (cert.driveLink && isVerifiedLink(cert.driveLink)) return "link-verified";
    if (isVerifiedProvider(cert.certifiedBy)) return "provider-verified";
    return "unverified";
  };

  return (
    <div data-testid="external-certifications-section">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">External Certificates</h3>
        {certifications.length > 0 && (
          <Badge variant="secondary">{certifications.length} added</Badge>
        )}
        {!isPublicView && certifications.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="show-ext-certs-toggle" className="text-xs text-muted-foreground cursor-pointer">
              Show in portfolio
            </Label>
            <Switch
              id="show-ext-certs-toggle"
              checked={showInPortfolio}
              onCheckedChange={handleTogglePortfolio}
              data-testid="toggle-show-ext-certs"
            />
          </div>
        )}
        {!isPublicView && (
          <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-external-cert">
                <Plus className="w-4 h-4 mr-1" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Add External Certificate
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Certificate Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AWS Cloud Practitioner"
                    data-testid="input-ext-cert-title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Certified By <span className="text-destructive">*</span>
                  </label>
                  <Select value={certifiedBy} onValueChange={setCertifiedBy}>
                    <SelectTrigger data-testid="select-ext-cert-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Certificate Link
                  </label>
                  <Input
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or any URL"
                    data-testid="input-ext-cert-link"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Google Drive link for preview, or any public verification URL
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

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Completion Date
                  </label>
                  <Input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    data-testid="input-ext-cert-date"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Skills Learned
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type a skill and press Enter"
                      data-testid="input-ext-cert-skill"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSkill}
                      disabled={!skillInput.trim()}
                      data-testid="button-add-ext-cert-skill"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                            data-testid={`button-remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of what you learned..."
                    rows={3}
                    data-testid="input-ext-cert-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" data-testid="button-cancel-ext-cert">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAdd} data-testid="button-save-ext-cert">
                  <Award className="w-4 h-4 mr-1" />
                  Save Certificate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {certifications.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {certifications.map((cert) => {
            const thumbnailUrl = cert.driveLink ? getGoogleDriveThumbnailUrl(cert.driveLink) : null;
            const previewUrl = cert.driveLink ? getGoogleDrivePreviewUrl(cert.driveLink) : null;
            const verificationStatus = getCertVerificationStatus(cert);
            return (
              <Card key={cert.id} className="overflow-visible">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    {thumbnailUrl && (
                      <div
                        className="w-full h-28 rounded-md bg-muted overflow-hidden cursor-pointer"
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
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      {verificationStatus !== "unverified" && (
                        <Badge variant="secondary" className="shrink-0 text-[10px] ml-auto">
                          <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight" data-testid={`text-ext-cert-title-${cert.id}`}>
                        {cert.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {cert.certifiedBy}
                      </p>
                      {cert.completionDate && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(cert.completionDate), "MMM yyyy")}
                        </p>
                      )}
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cert.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[10px] py-0">
                              {skill}
                            </Badge>
                          ))}
                          {cert.skills.length > 3 && (
                            <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                              +{cert.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-1 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(cert)}
                        className="flex-1"
                        data-testid={`button-download-ext-cert-${cert.id}`}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(cert)}
                        data-testid={`button-share-ext-cert-${cert.id}`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                      {!isPublicView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(cert.id)}
                          className="text-destructive"
                          data-testid={`button-remove-ext-cert-${cert.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
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
            <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No external certificates added</p>
            {!isPublicView && (
              <p className="text-xs text-muted-foreground mt-1">
                Add certificates from Udemy, Coursera, LinkedIn Learning and more to showcase your skills
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewCert?.title}
              {previewCert && getCertVerificationStatus(previewCert) !== "unverified" && (
                <Badge variant="secondary" className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                  Verified
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewCert && previewCert.driveLink && isValidGoogleDriveLink(previewCert.driveLink) ? (
            <div className="aspect-[4/3] w-full bg-muted rounded-md overflow-hidden">
              <iframe
                src={getGoogleDrivePreviewUrl(previewCert.driveLink) || ""}
                className="w-full h-full border-0"
                title={previewCert.title}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : previewCert?.driveLink ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Preview not available for this link type</p>
              <Button variant="outline" asChild>
                <a href={previewCert.driveLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          ) : null}
          {previewCert && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Certified by:</span>
                <span className="font-medium">{previewCert.certifiedBy}</span>
              </div>
              {previewCert.completionDate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{format(new Date(previewCert.completionDate), "MMMM d, yyyy")}</span>
                </div>
              )}
              {previewCert.description && (
                <p className="text-sm text-muted-foreground">{previewCert.description}</p>
              )}
              {previewCert.skills && previewCert.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewCert.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
