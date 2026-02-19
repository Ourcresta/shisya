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
import { StickyNote, Plus, Trash2, ExternalLink, LinkIcon } from "lucide-react";
import { format } from "date-fns";
import type { PortfolioNote } from "@/lib/portfolioExtras";
import { addPortfolioNote, removePortfolioNote, isValidUrl } from "@/lib/portfolioExtras";
import { useToast } from "@/hooks/use-toast";

interface PortfolioNotesSectionProps {
  notes: PortfolioNote[];
  onChange: (notes: PortfolioNote[]) => void;
  isPublicView?: boolean;
}

export default function PortfolioNotesSection({
  notes,
  onChange,
  isPublicView = false,
}: PortfolioNotesSectionProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a note title.", variant: "destructive" });
      return;
    }
    if (!link.trim() || !isValidUrl(link.trim())) {
      toast({ title: "Invalid link", description: "Please enter a valid URL (e.g. https://...).", variant: "destructive" });
      return;
    }
    const newNote = addPortfolioNote(title.trim(), link.trim());
    onChange([...notes, newNote]);
    setTitle("");
    setLink("");
    setAddOpen(false);
    toast({ title: "Note added", description: "Your note has been added to your portfolio." });
  };

  const handleRemove = (id: string) => {
    removePortfolioNote(id);
    onChange(notes.filter((n) => n.id !== id));
    toast({ title: "Note removed" });
  };

  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div data-testid="portfolio-notes-section">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <StickyNote className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Notes & Resources</h3>
        {notes.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{notes.length} saved</Badge>
        )}
        {!isPublicView && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-note">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note / Resource Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. My JavaScript Notes"
                    data-testid="input-note-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Link</label>
                  <Input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://docs.google.com/... or any URL"
                    data-testid="input-note-link"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Paste a link to your notes, Google Doc, Notion page, or any resource.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" data-testid="button-cancel-note">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAdd} data-testid="button-save-note">
                  Add Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card key={note.id} className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                    <LinkIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate" data-testid={`text-note-title-${note.id}`}>
                      {note.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {getDomain(note.link)} &middot; Added {format(new Date(note.addedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={note.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-open-note-${note.id}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Open
                      </a>
                    </Button>
                    {!isPublicView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(note.id)}
                        className="text-destructive"
                        data-testid={`button-remove-note-${note.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <StickyNote className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No notes or resources added</p>
            {!isPublicView && (
              <p className="text-sm text-muted-foreground mt-1">
                Save links to your notes, docs, or learning resources
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
