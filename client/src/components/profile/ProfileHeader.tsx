import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Github, Linkedin, ExternalLink, Eye, EyeOff, Copy, Check } from "lucide-react";
import type { StudentProfile } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  profile: StudentProfile;
  editable?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
  canMakePublic?: boolean;
}

export default function ProfileHeader({ 
  profile, 
  editable = false, 
  onToggleVisibility,
  canMakePublic = true
}: ProfileHeaderProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center" data-testid="profile-header">
      <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border">
        <AvatarImage src={profile.profilePhoto || undefined} alt={profile.fullName} />
        <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

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
