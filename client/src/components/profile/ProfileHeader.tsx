import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Github, Linkedin, ExternalLink, Eye, EyeOff, Copy, Check, Camera } from "lucide-react";
import type { StudentProfile } from "@shared/schema";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  profile: StudentProfile;
  editable?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
  onPhotoChange?: (photoUrl: string) => void;
  canMakePublic?: boolean;
}

export default function ProfileHeader({ 
  profile, 
  editable = false, 
  onToggleVisibility,
  onPhotoChange,
  canMakePublic = true
}: ProfileHeaderProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = profile.fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const publicUrl = `${window.location.origin}/profile/${profile.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Public profile link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhotoClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (onPhotoChange) {
        onPhotoChange(base64);
        toast({
          title: "Photo updated",
          description: "Your profile photo has been updated",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center" data-testid="profile-header">
      <div className="relative group">
        <Avatar 
          className={`w-20 h-20 sm:w-24 sm:h-24 border-2 border-border ${editable ? "cursor-pointer" : ""}`}
          onClick={handlePhotoClick}
        >
          <AvatarImage src={profile.profilePhoto || undefined} alt={profile.fullName} />
          <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {editable && (
          <>
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handlePhotoClick}
              data-testid="button-upload-photo"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              data-testid="input-photo-upload"
            />
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h1 
          className="text-2xl sm:text-3xl font-bold truncate"
          data-testid="text-profile-name"
        >
          {profile.fullName}
        </h1>
        
        {profile.headline && (
          <p className="text-muted-foreground mt-1" data-testid="text-profile-headline">
            {profile.headline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="secondary" className="font-mono text-xs">
            @{profile.username}
          </Badge>
          
          {profile.location && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {profile.githubUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" data-testid="link-github">
                <Github className="w-4 h-4 mr-1" />
                GitHub
              </a>
            </Button>
          )}
          
          {profile.linkedinUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">
                <Linkedin className="w-4 h-4 mr-1" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
      </div>

      {editable && (
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {profile.portfolioVisible ? (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-4 h-4" /> Private
                </span>
              )}
            </span>
            <Switch
              checked={profile.portfolioVisible}
              onCheckedChange={onToggleVisibility}
              disabled={!canMakePublic && !profile.portfolioVisible}
              data-testid="switch-visibility"
            />
          </div>
          
          {profile.portfolioVisible && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyLink}
              data-testid="button-copy-link"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              Copy Link
            </Button>
          )}
          
          {!canMakePublic && !profile.portfolioVisible && (
            <p className="text-xs text-muted-foreground max-w-48 text-right">
              Complete a course or submit a project to make profile public
            </p>
          )}
        </div>
      )}
    </div>
  );
}
