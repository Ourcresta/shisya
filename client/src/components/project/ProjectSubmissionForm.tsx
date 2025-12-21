import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink, Github, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const submissionSchema = z.object({
  githubUrl: z.string().url("Please enter a valid GitHub URL").refine(
    (url) => url.includes("github.com"),
    "URL must be a GitHub repository"
  ),
  liveUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  confirmation: z.boolean().refine((val) => val === true, {
    message: "You must confirm this is your own work",
  }),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface ProjectSubmissionFormProps {
  onSubmit: (data: { githubUrl: string; liveUrl?: string; notes?: string }) => void;
  isSubmitting: boolean;
  liveUrlRequired?: boolean;
}

export function ProjectSubmissionForm({ 
  onSubmit, 
  isSubmitting, 
  liveUrlRequired = false 
}: ProjectSubmissionFormProps) {
  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      githubUrl: "",
      liveUrl: "",
      notes: "",
      confirmation: false,
    },
  });

  const handleSubmit = (data: SubmissionFormData) => {
    onSubmit({
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl || undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="githubUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository URL <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://github.com/username/project-name" 
                  {...field} 
                  data-testid="input-github-url"
                />
              </FormControl>
              <FormDescription>
                Link to your public GitHub repository
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="liveUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Live Demo URL {liveUrlRequired && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://your-project.vercel.app" 
                  {...field} 
                  data-testid="input-live-url"
                />
              </FormControl>
              <FormDescription>
                Link to your deployed project {!liveUrlRequired && "(optional)"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes / Explanation
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your approach, challenges faced, or anything you'd like to share about your project..."
                  className="min-h-[100px] resize-y"
                  {...field}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormDescription>
                Optional notes about your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-confirmation"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I confirm this project is my own work
                </FormLabel>
                <FormDescription>
                  By checking this box, you certify that this submission represents your original work.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
          data-testid="button-submit-project"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Project"
          )}
        </Button>
      </form>
    </Form>
  );
}
