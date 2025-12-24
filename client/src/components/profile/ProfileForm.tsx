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
import { User, AtSign, FileText, MapPin, Link as LinkIcon, Github, Linkedin, Image, Check, X, Loader2 } from "lucide-react";
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
  profilePhoto: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
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
                  <FormLabel>Profile Photo URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Image className="w-4 h-4 text-muted-foreground mr-2" />
                      <Input placeholder="https://example.com/photo.jpg" {...field} data-testid="input-photo" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter a URL to your profile photo
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
