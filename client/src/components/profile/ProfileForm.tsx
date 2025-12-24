import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, AtSign, FileText, MapPin, Link as LinkIcon, Github, Linkedin, Image, Check, X, Loader2, Upload, Globe, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentProfile } from "@shared/schema";

const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Lowercase letters, numbers, hyphens, and underscores only"),
  headline: z.string().max(100, "Headline must be less than 100 characters").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  profilePhoto: z.string().optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Must be a valid Facebook URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid Instagram URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UsernameCheckResult {
  available: boolean;
  valid: boolean;
  message: string;
  suggestions: string[];
}

interface ProfileFormProps {
  profile: StudentProfile;
  onSave: (values: ProfileFormValues) => void;
  isPending?: boolean;
}

export default function ProfileForm({ profile, onSave, isPending = false }: ProfileFormProps) {
  const [usernameStatus, setUsernameStatus] = useState<UsernameCheckResult | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleLinks, setVisibleLinks] = useState<string[]>(() => {
    const links: string[] = ["github", "linkedin"];
    if ((profile as any).websiteUrl) links.push("website");
    if ((profile as any).facebookUrl) links.push("facebook");
    if ((profile as any).instagramUrl) links.push("instagram");
    return links;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.fullName,
      username: profile.username,
      headline: profile.headline || "",
      bio: profile.bio || "",
      location: profile.location || "",
      profilePhoto: profile.profilePhoto || "",
      githubUrl: profile.githubUrl || "",
      linkedinUrl: profile.linkedinUrl || "",
      websiteUrl: (profile as any).websiteUrl || "",
      facebookUrl: (profile as any).facebookUrl || "",
      instagramUrl: (profile as any).instagramUrl || "",
    },
  });

  const bioLength = form.watch("bio")?.length || 0;
  const currentUsername = form.watch("username");

  // Debounced username check
  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      setShowSuggestions(false);
      return;
    }

    // Don't check if it's the same as current profile username
    if (username === profile.username) {
      setUsernameStatus({
        available: true,
        valid: true,
        message: "This is your current username",
        suggestions: []
      });
      setShowSuggestions(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`/api/username/check/${encodeURIComponent(username)}`);
      if (response.ok) {
        const result: UsernameCheckResult = await response.json();
        setUsernameStatus(result);
        setShowSuggestions(!result.available && result.suggestions.length > 0);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  }, [profile.username]);

  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUsername) {
        checkUsername(currentUsername);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUsername, checkUsername]);

  const handleSelectSuggestion = (suggestion: string) => {
    form.setValue("username", suggestion);
    setShowSuggestions(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      form.setValue("profilePhoto", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = (linkType: string) => {
    if (!visibleLinks.includes(linkType)) {
      setVisibleLinks([...visibleLinks, linkType]);
    }
  };

  const availableLinksToAdd = [
    { id: "website", label: "Website", icon: Globe },
    { id: "facebook", label: "Facebook", icon: SiFacebook },
    { id: "instagram", label: "Instagram", icon: SiInstagram },
  ].filter(link => !visibleLinks.includes(link.id));

  const profilePhotoValue = form.watch("profilePhoto");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} data-testid="input-fullname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-1">@</span>
                        <Input placeholder="username" {...field} data-testid="input-username" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {checkingUsername && (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                          {!checkingUsername && usernameStatus && usernameStatus.valid && (
                            usernameStatus.available ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-destructive" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="flex items-center gap-2">
                    <span>Used for your public profile URL</span>
                    {usernameStatus && !usernameStatus.available && usernameStatus.valid && (
                      <span className="text-destructive text-xs">{usernameStatus.message}</span>
                    )}
                  </FormDescription>
                  {showSuggestions && usernameStatus?.suggestions && usernameStatus.suggestions.length > 0 && (
                    <div className="mt-2 p-3 rounded-md bg-muted/50 border" data-testid="username-suggestions">
                      <p className="text-sm text-muted-foreground mb-2">Try one of these available usernames:</p>
                      <div className="flex flex-wrap gap-2">
                        {usernameStatus.suggestions.map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            data-testid={`suggestion-${suggestion}`}
                          >
                            @{suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Frontend Developer | React | TypeScript" 
                      {...field} 
                      data-testid="input-headline"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                      <Input placeholder="City, Country" {...field} data-testid="input-location" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profilePhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={profilePhotoValue} alt="Profile" />
                        <AvatarFallback>
                          <User className="w-8 h-8 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          data-testid="input-photo-file"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-upload-photo"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                        {profilePhotoValue && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.setValue("profilePhoto", "")}
                            className="text-destructive"
                            data-testid="button-remove-photo"
                          >
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a profile photo (max 2MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell recruiters about yourself, your goals, and what you're passionate about..."
                      className="min-h-32 resize-none"
                      {...field}
                      data-testid="input-bio"
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>A brief introduction about yourself</span>
                    <span className={bioLength > 450 ? "text-amber-600" : ""}>
                      {bioLength}/500
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Links
            </CardTitle>
            {availableLinksToAdd.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" data-testid="button-add-link">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Link
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {availableLinksToAdd.map((link) => (
                    <DropdownMenuItem
                      key={link.id}
                      onClick={() => handleAddLink(link.id)}
                      data-testid={`menu-add-${link.id}`}
                    >
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleLinks.includes("github") && (
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Github className="w-4 h-4 text-muted-foreground mr-2" />
                        <Input placeholder="https://github.com/username" {...field} data-testid="input-github" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {visibleLinks.includes("linkedin") && (
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Linkedin className="w-4 h-4 text-muted-foreground mr-2" />
                        <Input placeholder="https://linkedin.com/in/username" {...field} data-testid="input-linkedin" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {visibleLinks.includes("website") && (
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-muted-foreground mr-2" />
                        <Input placeholder="https://yourwebsite.com" {...field} data-testid="input-website" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {visibleLinks.includes("facebook") && (
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <SiFacebook className="w-4 h-4 text-muted-foreground mr-2" />
                        <Input placeholder="https://facebook.com/username" {...field} data-testid="input-facebook" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {visibleLinks.includes("instagram") && (
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <SiInstagram className="w-4 h-4 text-muted-foreground mr-2" />
                        <Input placeholder="https://instagram.com/username" {...field} data-testid="input-instagram" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} data-testid="button-save-profile">
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
