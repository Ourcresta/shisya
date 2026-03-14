import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FileText, Pencil, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SitePage } from "@shared/schema";

interface PageUpdatePayload {
  slug: string;
  title: string;
  content: Record<string, unknown>;
}

export default function GuruPages() {
  const { toast } = useToast();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  const { data: pages, isLoading } = useQuery<SitePage[]>({
    queryKey: ["/api/guru/pages"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ slug, title, content }: PageUpdatePayload) => {
      const res = await apiRequest("PUT", `/api/guru/pages/${slug}`, { title, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/pages"] });
      toast({ title: "Page updated", description: "The page content has been saved." });
      setEditingSlug(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update page", variant: "destructive" });
    },
  });

  const startEditing = (page: SitePage) => {
    setEditingSlug(page.slug);
    setEditTitle(page.title);
    const rawContent = (page.content || {}) as Record<string, unknown>;
    const flatContent: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawContent)) {
      if (typeof value === "string") {
        flatContent[key] = value;
      } else {
        flatContent[key] = JSON.stringify(value, null, 2);
      }
    }
    setEditContent(flatContent);
  };

  const handleSave = () => {
    if (!editingSlug) return;
    const parsedContent: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(editContent)) {
      try {
        parsedContent[key] = JSON.parse(value) as unknown;
      } catch {
        parsedContent[key] = value;
      }
    }
    updateMutation.mutate({ slug: editingSlug, title: editTitle, content: parsedContent });
  };

  const handleContentChange = (key: string, value: string) => {
    setEditContent(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Site Pages</h1>
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Site Pages</h1>
      </div>
      <p className="text-muted-foreground">
        Manage the content displayed on public marketing pages. Edit titles, headings, and section content.
      </p>

      <div className="space-y-4">
        {(pages || []).map((page) => (
          <Card key={page.slug} data-testid={`card-page-${page.slug}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <Badge variant="outline" data-testid={`badge-slug-${page.slug}`}>/{page.slug}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Updated: {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  {editingSlug === page.slug ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        data-testid={`button-save-${page.slug}`}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSlug(null)}
                        data-testid={`button-cancel-${page.slug}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(page)}
                      data-testid={`button-edit-${page.slug}`}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {editingSlug === page.slug && (
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Page Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    data-testid={`input-title-${page.slug}`}
                  />
                </div>
                {Object.entries(editContent).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium mb-1 block capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    {value.length > 100 ? (
                      <Textarea
                        value={value}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        rows={Math.min(12, value.split("\n").length + 2)}
                        className="font-mono text-xs"
                        data-testid={`textarea-${key}-${page.slug}`}
                      />
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        data-testid={`input-${key}-${page.slug}`}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
