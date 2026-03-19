import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Video, Music, Captions, FileText, Code, Lock, Upload, Loader2,
  Plus, Trash2, CheckCircle2, AlertCircle, Zap, RefreshCw,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" }, { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" }, { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" }, { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" }, { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" }, { code: "pa", name: "Punjabi" },
];

const CODE_LANGUAGES = [
  "javascript", "typescript", "python", "html", "css", "java",
  "cpp", "c", "rust", "go", "php", "ruby", "sql", "bash", "json", "xml",
];

interface AudioTrack { languageCode: string; languageName: string; audioUrl: string; }
interface SubtitleTrack { languageCode: string; languageName: string; subtitleUrl: string; }
interface Attachment { name: string; url: string; fileType: string; size?: number; }
interface CodeSnippet { title: string; language: string; code: string; }

interface LessonFull {
  id?: number;
  moduleId?: number;
  courseId?: number;
  title: string;
  content: string;
  videoUrl: string;
  hlsUrl: string;
  hlsStatus: string;
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  attachments: Attachment[];
  codeSnippets: CodeSnippet[];
  unlocksLabId: number | null;
  unlocksProjectId: number | null;
  durationMinutes: number;
  orderIndex: number;
  isPreview: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  courseId: number;
  moduleId: number | null;
  editingLesson: any | null;
  defaultOrderIndex?: number;
}

const defaultForm: LessonFull = {
  title: "", content: "", videoUrl: "", hlsUrl: "", hlsStatus: "none",
  audioTracks: [], subtitleTracks: [], attachments: [], codeSnippets: [],
  unlocksLabId: null, unlocksProjectId: null,
  durationMinutes: 0, orderIndex: 0, isPreview: false,
};

function useR2Upload(folder: string) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    try {
      const presignRes = await apiRequest("POST", "/api/guru/r2/presign", {
        fileName: file.name, fileType: file.type, folder,
      });
      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Presign failed");
      }
      const { uploadUrl, publicUrl } = await presignRes.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });
      return publicUrl;
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { upload, uploading, progress };
}

export function LessonEditorDialog({ open, onClose, courseId, moduleId, editingLesson, defaultOrderIndex = 0 }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<LessonFull>(defaultForm);
  const [activeTab, setActiveTab] = useState("basic");
  const [hlsJobId, setHlsJobId] = useState<string | null>(null);
  const [hlsConverting, setHlsConverting] = useState(false);
  const [abrJobId, setAbrJobId] = useState<string | null>(null);
  const [abrConverting, setAbrConverting] = useState(false);
  const [abrProgress, setAbrProgress] = useState("");
  const [convertingAudio, setConvertingAudio] = useState(false);

  const videoUpload = useR2Upload("videos");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [pendingAudioLang, setPendingAudioLang] = useState("en");
  const [pendingSubtitleLang, setPendingSubtitleLang] = useState("en");

  const { data: courseLabs } = useQuery<any[]>({
    queryKey: ["/api/guru/courses", courseId, "labs"],
    enabled: !!courseId,
  });

  const { data: courseProjects } = useQuery<any[]>({
    queryKey: ["/api/guru/courses", courseId, "projects"],
    enabled: !!courseId,
  });

  useEffect(() => {
    if (!open) return;
    if (editingLesson) {
      setForm({
        title: editingLesson.title || "",
        content: editingLesson.content || "",
        videoUrl: editingLesson.videoUrl || "",
        hlsUrl: editingLesson.hlsUrl || "",
        hlsStatus: editingLesson.hlsStatus || "none",
        audioTracks: Array.isArray(editingLesson.audioTracks) ? editingLesson.audioTracks : [],
        subtitleTracks: Array.isArray(editingLesson.subtitleTracks) ? editingLesson.subtitleTracks : [],
        attachments: Array.isArray(editingLesson.attachments) ? editingLesson.attachments : [],
        codeSnippets: Array.isArray(editingLesson.codeSnippets) ? editingLesson.codeSnippets : [],
        unlocksLabId: editingLesson.unlocksLabId || null,
        unlocksProjectId: editingLesson.unlocksProjectId || null,
        durationMinutes: editingLesson.durationMinutes || 0,
        orderIndex: editingLesson.orderIndex || 0,
        isPreview: editingLesson.isPreview || false,
      });
    } else {
      setForm({ ...defaultForm, orderIndex: defaultOrderIndex });
    }
    setActiveTab("basic");
    setHlsJobId(null);
    setHlsConverting(false);
    setAbrJobId(null);
    setAbrConverting(false);
    setAbrProgress("");
    setConvertingAudio(false);
  }, [open, editingLesson, defaultOrderIndex]);

  useEffect(() => {
    if (!hlsJobId) return;
    const poll = setInterval(async () => {
      try {
        const res = await apiRequest("GET", `/api/guru/r2/hls-status/${hlsJobId}`);
        const job = await res.json();
        if (job.status === "done" && job.hlsUrl) {
          setForm((f) => ({ ...f, hlsUrl: job.hlsUrl, hlsStatus: "ready" }));
          setHlsConverting(false);
          setHlsJobId(null);
          toast({ title: "HLS conversion complete!", description: "The HLS stream URL has been set." });
          clearInterval(poll);
        } else if (job.status === "failed") {
          setHlsConverting(false);
          setHlsJobId(null);
          toast({ title: "HLS conversion failed", description: job.error || "Please try again.", variant: "destructive" });
          clearInterval(poll);
        }
      } catch { clearInterval(poll); }
    }, 3000);
    return () => clearInterval(poll);
  }, [hlsJobId, toast]);

  // ── ABR polling ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!abrJobId) return;
    const poll = setInterval(async () => {
      try {
        const res = await apiRequest("GET", `/api/guru/r2/abr-status/${abrJobId}`);
        const job = await res.json();
        if (job.progress) setAbrProgress(job.progress);
        if (job.status === "done" && job.hlsUrl) {
          setForm((f) => ({ ...f, hlsUrl: job.hlsUrl, hlsStatus: "ready" }));
          setAbrConverting(false);
          setAbrJobId(null);
          setAbrProgress("");
          const renditions = job.renditions?.join(", ") || "";
          toast({
            title: "ABR encoding complete!",
            description: `Multi-bitrate stream ready: ${renditions}. hls.js will now auto-select quality based on the viewer's connection.`,
          });
          clearInterval(poll);
        } else if (job.status === "failed") {
          setAbrConverting(false);
          setAbrJobId(null);
          setAbrProgress("");
          toast({ title: "ABR encoding failed", description: job.error || "Please try again.", variant: "destructive" });
          clearInterval(poll);
        }
      } catch { clearInterval(poll); }
    }, 4000);
    return () => clearInterval(poll);
  }, [abrJobId, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: LessonFull) => {
      const res = await apiRequest("POST", "/api/guru/lessons", { ...data, moduleId, courseId });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to create lesson"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", String(courseId), "modules"] });
      toast({ title: "Lesson created successfully" });
      onClose();
    },
    onError: (e: Error) => toast({ title: "Failed to create lesson", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: LessonFull) => {
      const res = await apiRequest("PUT", `/api/guru/lessons/${editingLesson!.id}`, data);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to update lesson"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", String(courseId), "modules"] });
      toast({ title: "Lesson updated successfully" });
      onClose();
    },
    onError: (e: Error) => toast({ title: "Failed to update lesson", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      videoUrl: form.videoUrl || null,
      hlsUrl: form.hlsUrl || null,
    };
    if (editingLesson) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const handleVideoFile = async (file: File) => {
    const url = await videoUpload.upload(file);
    if (url) {
      setForm((f) => ({ ...f, videoUrl: url, hlsStatus: "pending" }));
      toast({ title: "Video uploaded", description: "Click 'Convert to HLS' to enable adaptive streaming." });
    }
  };

  const handleConvertHls = async () => {
    if (!form.videoUrl) return;
    setHlsConverting(true);
    try {
      const res = await apiRequest("POST", "/api/guru/r2/convert-hls", { videoUrl: form.videoUrl });
      const { jobId } = await res.json();
      setHlsJobId(jobId);
      toast({ title: "HLS conversion started", description: "This may take 1-3 minutes. The URL will be set automatically." });
    } catch (err: any) {
      setHlsConverting(false);
      toast({ title: "Conversion failed", description: err.message, variant: "destructive" });
    }
  };

  const handleConvertAbr = async () => {
    if (!form.videoUrl) return;
    setAbrConverting(true);
    setAbrProgress("Starting ABR encoding job…");
    try {
      const res = await apiRequest("POST", "/api/guru/r2/convert-hls-abr", { videoUrl: form.videoUrl });
      const { jobId } = await res.json();
      setAbrJobId(jobId);
      toast({
        title: "ABR encoding started",
        description: "Encoding 360p → 480p → 720p → 1080p in one pass. This takes 3–8 min. The HLS URL will auto-update.",
      });
    } catch (err: any) {
      setAbrConverting(false);
      setAbrProgress("");
      toast({ title: "ABR encoding failed to start", description: err.message, variant: "destructive" });
    }
  };

  const audioUpload = useR2Upload("audio");
  const handleAudioFile = async (file: File) => {
    const rawUrl = await audioUpload.upload(file);
    if (!rawUrl) return;

    const isWav =
      file.type === "audio/wav" ||
      file.type === "audio/x-wav" ||
      file.name.toLowerCase().endsWith(".wav");

    let finalUrl = rawUrl;

    if (isWav) {
      setConvertingAudio(true);
      try {
        const res = await apiRequest("POST", "/api/guru/r2/convert-audio", { audioUrl: rawUrl });
        if (res.ok) {
          const { mp3Url } = await res.json();
          finalUrl = mp3Url;
          toast({ title: "WAV converted to MP3", description: "Audio track ready for playback." });
        } else {
          const err = await res.json();
          toast({ title: "Conversion failed — using original WAV", description: err.error, variant: "destructive" });
        }
      } catch {
        toast({ title: "Conversion failed — using original WAV", variant: "destructive" });
      } finally {
        setConvertingAudio(false);
      }
    }

    const lang = LANGUAGES.find((l) => l.code === pendingAudioLang);
    setForm((f) => ({
      ...f,
      audioTracks: [...f.audioTracks, {
        languageCode: pendingAudioLang,
        languageName: lang?.name || pendingAudioLang,
        audioUrl: finalUrl,
      }],
    }));
    toast({ title: `Audio track added (${lang?.name || pendingAudioLang})` });
  };

  const subtitleUpload = useR2Upload("subtitles");
  const handleSubtitleFile = async (file: File) => {
    const url = await subtitleUpload.upload(file);
    if (url) {
      const lang = LANGUAGES.find((l) => l.code === pendingSubtitleLang);
      setForm((f) => ({
        ...f,
        subtitleTracks: [...f.subtitleTracks, {
          languageCode: pendingSubtitleLang,
          languageName: lang?.name || pendingSubtitleLang,
          subtitleUrl: url,
        }],
      }));
      toast({ title: `Subtitle track added (${lang?.name || pendingSubtitleLang})` });
    }
  };

  const attachmentUpload = useR2Upload("files");
  const handleAttachmentFile = async (file: File) => {
    const url = await attachmentUpload.upload(file);
    if (url) {
      setForm((f) => ({
        ...f,
        attachments: [...f.attachments, { name: file.name, url, fileType: file.type, size: file.size }],
      }));
      toast({ title: "File attached", description: file.name });
    }
  };

  const addCodeSnippet = () => {
    setForm((f) => ({
      ...f,
      codeSnippets: [...f.codeSnippets, { title: `Snippet ${f.codeSnippets.length + 1}`, language: "javascript", code: "" }],
    }));
  };

  const updateSnippet = (i: number, field: keyof CodeSnippet, value: string) => {
    setForm((f) => {
      const arr = [...f.codeSnippets];
      arr[i] = { ...arr[i], [field]: value };
      return { ...f, codeSnippets: arr };
    });
  };

  const removeSnippet = (i: number) => {
    setForm((f) => ({ ...f, codeSnippets: f.codeSnippets.filter((_, idx) => idx !== i) }));
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  const tabCount = (tab: string) => {
    switch (tab) {
      case "audio": return form.audioTracks.length;
      case "subtitles": return form.subtitleTracks.length;
      case "files": return form.attachments.length;
      case "code": return form.codeSnippets.length;
      default: return 0;
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = ""; }} />
      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioFile(f); e.target.value = ""; }} />
      <input ref={subtitleInputRef} type="file" accept=".vtt,.srt,.txt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubtitleFile(f); e.target.value = ""; }} />
      <input ref={attachmentInputRef} type="file" accept=".pdf,.zip,.doc,.docx,.pptx,.xlsx,.txt,.md" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAttachmentFile(f); e.target.value = ""; }} />

      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
            <DialogDescription>{editingLesson ? "Update lesson content, media, and settings" : "Create a new lesson with video, files, and access controls"}</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-7 shrink-0">
              <TabsTrigger value="basic" className="text-xs px-2">Basic</TabsTrigger>
              <TabsTrigger value="video" className="text-xs px-2 gap-1">
                <Video className="w-3 h-3" />Video
                {form.hlsUrl && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-xs px-2 gap-1">
                <Music className="w-3 h-3" />Audio
                {tabCount("audio") > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{tabCount("audio")}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="subtitles" className="text-xs px-2 gap-1">
                <Captions className="w-3 h-3" />Subs
                {tabCount("subtitles") > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{tabCount("subtitles")}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs px-2 gap-1">
                <FileText className="w-3 h-3" />Files
                {tabCount("files") > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{tabCount("files")}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs px-2 gap-1">
                <Code className="w-3 h-3" />Code
                {tabCount("code") > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{tabCount("code")}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="access" className="text-xs px-2 gap-1">
                <Lock className="w-3 h-3" />Access
                {(form.unlocksLabId || form.unlocksProjectId) && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">

              {/* ── BASIC ── */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="lesson-title">Title *</Label>
                  <Input id="lesson-title" value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Lesson title" data-testid="input-lesson-title" />
                </div>
                <div>
                  <Label htmlFor="lesson-content">Content / Description</Label>
                  <Textarea id="lesson-content" value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Lesson content — supports markdown" rows={5}
                    data-testid="input-lesson-content" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                    <Input id="lesson-duration" type="number" value={form.durationMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))}
                      data-testid="input-lesson-duration" />
                  </div>
                  <div>
                    <Label htmlFor="lesson-order">Order Index</Label>
                    <Input id="lesson-order" type="number" value={form.orderIndex}
                      onChange={(e) => setForm((f) => ({ ...f, orderIndex: parseInt(e.target.value) || 0 }))}
                      data-testid="input-lesson-order" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="lesson-preview" checked={form.isPreview}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, isPreview: !!c }))}
                    data-testid="checkbox-lesson-preview" />
                  <Label htmlFor="lesson-preview" className="cursor-pointer">Available as free preview</Label>
                </div>
              </TabsContent>

              {/* ── VIDEO ── */}
              <TabsContent value="video" className="space-y-4 mt-0">
                <div>
                  <Label>Video URL (MP4 or paste any URL)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={form.videoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value, hlsStatus: e.target.value ? f.hlsStatus : "none" }))}
                      placeholder="https://... or upload →"
                      data-testid="input-lesson-video-url" className="flex-1" />
                    <Button type="button" variant="outline" size="sm" disabled={videoUpload.uploading}
                      onClick={() => fileInputRef.current?.click()} data-testid="button-upload-video" className="shrink-0 gap-1">
                      {videoUpload.uploading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />{videoUpload.progress > 0 ? `${videoUpload.progress}%` : "…"}</>
                        : <><Upload className="w-4 h-4" />Upload</>}
                    </Button>
                  </div>
                  {videoUpload.uploading && videoUpload.progress > 0 && (
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${videoUpload.progress}%` }} />
                    </div>
                  )}
                </div>

                {form.videoUrl && (
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">HLS Adaptive Stream</span>
                      {form.hlsUrl
                        ? <Badge className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />Ready
                          </Badge>
                        : form.hlsStatus === "none"
                        ? <Badge variant="outline">Not converted</Badge>
                        : <Badge variant="secondary" className="gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />Processing
                          </Badge>}
                    </div>
                    {form.hlsUrl && (
                      <div>
                        <Label className="text-xs text-muted-foreground">HLS URL (.m3u8)</Label>
                        <Input value={form.hlsUrl} readOnly className="text-xs mt-1 bg-muted" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Students will use the HLS stream for adaptive quality playback.
                        </p>
                      </div>
                    )}
                    {!form.hlsUrl && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Choose a conversion mode. <strong>ABR (Recommended)</strong> creates a full quality ladder so hls.js automatically picks the best quality for each viewer's connection. Standard HLS is a single-quality stream-copy.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" onClick={handleConvertAbr}
                            disabled={abrConverting || hlsConverting || !form.videoUrl}
                            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white" data-testid="button-convert-abr">
                            {abrConverting
                              ? <><Loader2 className="w-4 h-4 animate-spin" />Encoding…</>
                              : <><Zap className="w-4 h-4" />Convert ABR (360p–1080p)</>}
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={handleConvertHls}
                            disabled={hlsConverting || abrConverting || !form.videoUrl} className="gap-2" data-testid="button-convert-hls">
                            {hlsConverting
                              ? <><Loader2 className="w-4 h-4 animate-spin" />Converting…</>
                              : <><Video className="w-4 h-4" />Standard HLS</>}
                          </Button>
                        </div>
                        {abrConverting && (
                          <div className="space-y-1">
                            <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                              {abrProgress || "Encoding…"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Single-pass multi-bitrate encode — 3–8 minutes. The HLS URL will auto-populate when done.
                            </p>
                          </div>
                        )}
                        {hlsConverting && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Stream-copy conversion in progress — 1–3 minutes.
                          </p>
                        )}
                      </div>
                    )}
                    {form.hlsUrl && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, hlsUrl: "", hlsStatus: "pending" }))} className="text-xs">
                        Re-encode
                      </Button>
                    )}
                  </div>
                )}

              </TabsContent>

              {/* ── AUDIO ── */}
              <TabsContent value="audio" className="space-y-4 mt-0">
                <p className="text-sm text-muted-foreground">
                  Upload dubbed audio tracks per language (MP3 or WAV). Students switch language in the player. WAV files are automatically converted to MP3.
                </p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Language</Label>
                    <Select value={pendingAudioLang} onValueChange={setPendingAudioLang}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="sm"
                    disabled={audioUpload.uploading || convertingAudio}
                    onClick={() => audioInputRef.current?.click()}
                    className="gap-1 shrink-0" data-testid="button-upload-audio">
                    {convertingAudio
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Converting WAV…</>
                      : audioUpload.uploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />{audioUpload.progress > 0 ? `${audioUpload.progress}%` : "Uploading…"}</>
                      : <><Upload className="w-4 h-4" />Upload Audio (MP3 / WAV)</>}
                  </Button>
                </div>
                {audioUpload.uploading && audioUpload.progress > 0 && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${audioUpload.progress}%` }} />
                  </div>
                )}
                {convertingAudio && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Converting WAV to MP3 — this takes a moment for large files…
                  </div>
                )}
                {form.audioTracks.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">No audio tracks added yet</p>
                  : <div className="space-y-2">
                      {form.audioTracks.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <Music className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.languageName}</p>
                            <p className="text-xs text-muted-foreground truncate">{t.audioUrl}</p>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-destructive"
                            onClick={() => setForm((f) => ({ ...f, audioTracks: f.audioTracks.filter((_, idx) => idx !== i) }))}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>}
              </TabsContent>

              {/* ── SUBTITLES ── */}
              <TabsContent value="subtitles" className="space-y-4 mt-0">
                <p className="text-sm text-muted-foreground">Upload .vtt or .srt subtitle files per language. Students can enable captions in the player.</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Language</Label>
                    <Select value={pendingSubtitleLang} onValueChange={setPendingSubtitleLang}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="sm" disabled={subtitleUpload.uploading}
                    onClick={() => subtitleInputRef.current?.click()} className="gap-1 shrink-0" data-testid="button-upload-subtitle">
                    {subtitleUpload.uploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />{subtitleUpload.progress > 0 ? `${subtitleUpload.progress}%` : "…"}</>
                      : <><Upload className="w-4 h-4" />Upload Subtitle</>}
                  </Button>
                </div>
                {subtitleUpload.uploading && subtitleUpload.progress > 0 && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${subtitleUpload.progress}%` }} />
                  </div>
                )}
                {form.subtitleTracks.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">No subtitle tracks added yet</p>
                  : <div className="space-y-2">
                      {form.subtitleTracks.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <Captions className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{t.languageName}</p>
                            <p className="text-xs text-muted-foreground truncate">{t.subtitleUrl}</p>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-destructive"
                            onClick={() => setForm((f) => ({ ...f, subtitleTracks: f.subtitleTracks.filter((_, idx) => idx !== i) }))}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>}
              </TabsContent>

              {/* ── FILES ── */}
              <TabsContent value="files" className="space-y-4 mt-0">
                <p className="text-sm text-muted-foreground">Attach PDFs, slides, or any reference files. Students can download them from the lesson page.</p>
                <Button type="button" variant="outline" size="sm" disabled={attachmentUpload.uploading}
                  onClick={() => attachmentInputRef.current?.click()} className="gap-2" data-testid="button-upload-file">
                  {attachmentUpload.uploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{attachmentUpload.progress > 0 ? `${attachmentUpload.progress}%` : "Uploading…"}</>
                    : <><Plus className="w-4 h-4" />Add File</>}
                </Button>
                {attachmentUpload.uploading && attachmentUpload.progress > 0 && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${attachmentUpload.progress}%` }} />
                  </div>
                )}
                {form.attachments.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">No files attached yet</p>
                  : <div className="space-y-2">
                      {form.attachments.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.fileType}{a.size ? ` · ${(a.size / 1024).toFixed(0)} KB` : ""}</p>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-destructive"
                            onClick={() => setForm((f) => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>}
              </TabsContent>

              {/* ── CODE ── */}
              <TabsContent value="code" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Add code examples displayed to students on the lesson page.</p>
                  <Button type="button" variant="outline" size="sm" onClick={addCodeSnippet} className="gap-1" data-testid="button-add-code">
                    <Plus className="w-4 h-4" />Add Snippet
                  </Button>
                </div>
                {form.codeSnippets.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">No code snippets added yet</p>
                  : <div className="space-y-4">
                      {form.codeSnippets.map((s, i) => (
                        <div key={i} className="border rounded-lg p-3 space-y-3">
                          <div className="flex gap-2">
                            <Input value={s.title} onChange={(e) => updateSnippet(i, "title", e.target.value)}
                              placeholder="Snippet title" className="flex-1 text-sm" />
                            <Select value={s.language} onValueChange={(v) => updateSnippet(i, "language", v)}>
                              <SelectTrigger className="w-36 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {CODE_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="ghost" size="icon" className="w-8 h-8 text-destructive"
                              onClick={() => removeSnippet(i)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Textarea value={s.code} onChange={(e) => updateSnippet(i, "code", e.target.value)}
                            placeholder={`// Write your ${s.language} code here...`} rows={6}
                            className="font-mono text-xs" />
                        </div>
                      ))}
                    </div>}
              </TabsContent>

              {/* ── ACCESS CONTROL ── */}
              <TabsContent value="access" className="space-y-5 mt-0">
                <p className="text-sm text-muted-foreground">
                  Gate labs and projects behind video completion. The selected lab/project is only accessible after a student finishes watching this lesson.
                </p>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Unlock Lab After Video</span>
                  </div>
                  <Select
                    value={form.unlocksLabId ? String(form.unlocksLabId) : "none"}
                    onValueChange={(v) => setForm((f) => ({ ...f, unlocksLabId: v === "none" ? null : parseInt(v) }))}>
                    <SelectTrigger data-testid="select-unlock-lab"><SelectValue placeholder="No lab gate" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No lab gate</SelectItem>
                      {(courseLabs || []).map((lab: any) => (
                        <SelectItem key={lab.id} value={String(lab.id)}>{lab.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.unlocksLabId && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex gap-1 items-start">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      Students must complete this video before accessing the lab.
                    </p>
                  )}
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium">Unlock Project After Video</span>
                  </div>
                  <Select
                    value={form.unlocksProjectId ? String(form.unlocksProjectId) : "none"}
                    onValueChange={(v) => setForm((f) => ({ ...f, unlocksProjectId: v === "none" ? null : parseInt(v) }))}>
                    <SelectTrigger data-testid="select-unlock-project"><SelectValue placeholder="No project gate" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project gate</SelectItem>
                      {(courseProjects || []).map((proj: any) => (
                        <SelectItem key={proj.id} value={String(proj.id)}>{proj.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.unlocksProjectId && (
                    <p className="text-xs text-violet-600 dark:text-violet-400 flex gap-1 items-start">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      Students must complete this video before accessing the project.
                    </p>
                  )}
                </div>

                {(form.unlocksLabId || form.unlocksProjectId) && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Video completion is tracked via the student&apos;s watch progress. The gate unlocks at 90% video completion.</span>
                  </div>
                )}
              </TabsContent>

            </div>
          </Tabs>

          <DialogFooter className="shrink-0 border-t pt-4">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-lesson">Cancel</Button>
            <Button onClick={handleSubmit}
              disabled={!form.title.trim() || isBusy}
              data-testid="button-submit-lesson">
              {isBusy ? "Saving…" : editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
