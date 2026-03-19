import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture2,
  Settings,
  Languages,
  Captions,
  SkipBack,
  SkipForward,
  Check,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ushaAvatarImage from "@assets/image_1767697725032.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export interface AudioTrack {
  id: string;
  languageCode: string;
  languageName: string;
  audioUrl: string;
  voiceName?: string;
}

export interface SubtitleTrack {
  id: string;
  languageCode: string;
  languageName: string;
  subtitleUrl: string;
}

interface ChapterMarker {
  time: number;
  label: string;
}

interface UshaVideoPlayerProps {
  videoUrl: string;
  hlsUrl?: string | null;
  audioTracks?: AudioTrack[];
  subtitleTracks?: SubtitleTrack[];
  poster?: string;
  title?: string;
  chapters?: ChapterMarker[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onUshaToggle?: () => void;
  isUshaOpen?: boolean;
}

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8") || url.includes("m3u8");
}

// Hostnames that must be proxied through the server to avoid CORS restrictions.
const PROXIED_HOSTS = ["r2.dev", "cloudflarestorage.com", "b-cdn.net", "backblazeb2.com"];

function needsProxy(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return PROXIED_HOSTS.some((h) => hostname.endsWith(h));
  } catch {
    return false;
  }
}

// Route R2/CDN videos through the server proxy to bypass browser CORS restrictions.
function resolveVideoUrl(url: string): string {
  if (!url) return url;
  return needsProxy(url) ? `/api/video-proxy?url=${encodeURIComponent(url)}` : url;
}

// ── WebVTT parser ─────────────────────────────────────────────────────────────
interface VttCue { start: number; end: number; text: string }

function parseVttTime(s: string): number {
  const p = s.trim().split(":");
  if (p.length === 3) return +p[0] * 3600 + +p[1] * 60 + parseFloat(p[2]);
  if (p.length === 2) return +p[0] * 60 + parseFloat(p[1]);
  return NaN;
}

function parseVtt(raw: string): VttCue[] {
  const cues: VttCue[] = [];
  const blocks = raw.split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    const ti = lines.findIndex((l) => l.includes("-->"));
    if (ti === -1) continue;
    const [s, e] = lines[ti].split("-->").map((x) => x.trim());
    const text = lines.slice(ti + 1).join("\n").trim();
    if (!s || !e || !text) continue;
    const start = parseVttTime(s);
    const end = parseVttTime(e);
    if (!isNaN(start) && !isNaN(end)) cues.push({ start, end, text });
  }
  return cues;
}

export function UshaVideoPlayer({
  videoUrl,
  hlsUrl,
  audioTracks = [],
  subtitleTracks = [],
  poster,
  title,
  chapters,
  onProgress,
  onComplete,
  onPlayStateChange,
  onUshaToggle,
  isUshaOpen = false,
}: UshaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hasReportedPlayRef = useRef(false);
  const lastBufferReportRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    try { const s = localStorage.getItem("vp-volume"); return s !== null ? Math.max(0, Math.min(1, parseFloat(s))) : 1; } catch { return 1; }
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string>(
    audioTracks[0]?.languageCode || "en"
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    try { const s = localStorage.getItem("vp-speed"); return s !== null ? parseFloat(s) : 1; } catch { return 1; }
  });
  const [isBuffering, setIsBuffering] = useState(false);
  const [hlsLevels, setHlsLevels] = useState<{ height: number; bitrate: number }[]>([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [subtitleCues, setSubtitleCues] = useState<VttCue[]>([]);
  const [currentCue, setCurrentCue] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  const currentAudioTrack = audioTracks.find(
    (t) => t.languageCode === selectedAudioTrack
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prefer HLS stream when available; fall back to direct MP4
    const activeHlsUrl = hlsUrl || (videoUrl && isHlsUrl(videoUrl) ? videoUrl : null);
    const activeMp4Url = videoUrl && !isHlsUrl(videoUrl) ? videoUrl : null;

    if (activeHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;

      const sourceUrl = needsProxy(activeHlsUrl)
        ? `/api/hls-proxy?url=${encodeURIComponent(activeHlsUrl)}`
        : activeHlsUrl;

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((l) => ({
          height: l.height,
          bitrate: l.bitrate,
        }));
        setHlsLevels(levels);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          const now = Date.now();
          if (now - lastBufferReportRef.current > 30000) {
            lastBufferReportRef.current = now;
            fetch("/api/metrics/buffering", { method: "POST" }).catch(() => {});
          }
        }
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      // Force-sync dubbed audio every time HLS transitions to a new segment.
      // Without this, the audio can drift at segment boundaries and cause
      // the last few words of one segment to overlap with the first words
      // of the next segment.
      hls.on(Hls.Events.FRAG_CHANGED, () => {
        if (audioRef.current?.src && videoRef.current) {
          audioRef.current.currentTime = videoRef.current.currentTime;
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (activeHlsUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari — native HLS support
      video.src = activeHlsUrl;
    } else if (activeMp4Url) {
      // Regular MP4 — route R2 through proxy
      video.src = resolveVideoUrl(activeMp4Url);
    }
  }, [videoUrl, hlsUrl]);

  const handleQualityChange = useCallback((levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setSelectedQuality(levelIndex);
    }
  }, []);

  const syncAudioWithVideo = useCallback((force = false) => {
    if (videoRef.current && audioRef.current && audioRef.current.src) {
      const timeDiff = Math.abs(
        videoRef.current.currentTime - audioRef.current.currentTime
      );
      // Force-sync on segment boundaries (zero tolerance) or when drift exceeds 0.05s
      if (force || timeDiff > 0.05) {
        audioRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      syncAudioWithVideo();
      if (onProgress && duration > 0) {
        onProgress((video.currentTime / duration) * 100);
      }

      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered(duration > 0 ? (bufferedEnd / duration) * 100 : 0);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      if (onComplete) onComplete();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      syncAudioWithVideo(true);
      if (!hasReportedPlayRef.current) {
        hasReportedPlayRef.current = true;
        fetch("/api/metrics/play-start", { method: "POST" }).catch(() => {});
      }
    };
    // After any seek completes (user scrub, skip, or HLS internal seek), snap audio to video
    const handleSeeked = () => syncAudioWithVideo(true);
    const handlePiPEnter = () => setIsPiP(true);
    const handlePiPLeave = () => setIsPiP(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("enterpictureinpicture", handlePiPEnter);
    video.addEventListener("leavepictureinpicture", handlePiPLeave);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("enterpictureinpicture", handlePiPEnter);
      video.removeEventListener("leavepictureinpicture", handlePiPLeave);
    };
  }, [duration, onProgress, onComplete, onPlayStateChange, syncAudioWithVideo]);

  // Apply persisted volume/speed whenever the video element is ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.playbackRate = playbackSpeed;
  }, [volume, playbackSpeed]);

  // When the active dubbed audio track changes, swap the audio src and resume from
  // the current video position. We read play state directly from the video element
  // so this effect does NOT re-run on every play/pause toggle.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioTrack) return;
    const currentVideoTime = videoRef.current?.currentTime || 0;
    const videoIsPlaying = videoRef.current ? !videoRef.current.paused : false;
    audio.pause();
    audio.src = currentAudioTrack.audioUrl;
    audio.playbackRate = playbackSpeed;
    audio.currentTime = currentVideoTime;
    if (videoIsPlaying) {
      audio.play().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudioTrack]);

  // Load WebVTT file when subtitle selection changes
  useEffect(() => {
    if (!selectedSubtitle) {
      setSubtitleCues([]);
      setCurrentCue(null);
      return;
    }
    const track = subtitleTracks.find((t) => t.languageCode === selectedSubtitle);
    if (!track) {
      setSubtitleCues([]);
      setCurrentCue(null);
      return;
    }
    const proxyUrl = `/api/video-proxy?url=${encodeURIComponent(track.subtitleUrl)}`;
    fetch(proxyUrl)
      .then((r) => r.text())
      .then((text) => setSubtitleCues(parseVtt(text)))
      .catch(() => setSubtitleCues([]));
  }, [selectedSubtitle, subtitleTracks]);

  // Track the active cue based on playback position
  useEffect(() => {
    if (!subtitleCues.length || !selectedSubtitle) {
      setCurrentCue(null);
      return;
    }
    const cue = subtitleCues.find((c) => currentTime >= c.start && currentTime <= c.end);
    setCurrentCue(cue ? cue.text : null);
  }, [currentTime, subtitleCues, selectedSubtitle]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      audio?.pause();
    } else {
      video.play().catch(console.error);
      if (currentAudioTrack) {
        audio?.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
    onPlayStateChange?.(!isPlaying);
  }, [isPlaying, onPlayStateChange, currentAudioTrack]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    try { localStorage.setItem("vp-volume", String(newVolume)); } catch {}
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (videoRef.current && !audioRef.current?.src) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverTime(percent * duration);
      setHoverX(e.clientX - rect.left);
    },
    [duration]
  );

  const skip = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    },
    [duration]
  );

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    try { localStorage.setItem("vp-speed", String(speed)); } catch {}
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch { /* PiP not available on this device */ }
  }, []);

  // Double-click on the video area toggles fullscreen
  const handleVideoDoubleClick = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  // Touch support: single tap = show/hide controls, double-tap left/right = seek ±10s
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    const touch = e.touches[0];
    const timeSinceLastTap = now - lastTapRef.current.time;
    if (timeSinceLastTap < 280 && timeSinceLastTap > 0) {
      e.preventDefault();
      const containerWidth = containerRef.current?.offsetWidth ?? 1;
      const isLeftSide = touch.clientX < containerWidth / 2;
      if (isLeftSide) {
        skip(-10);
      } else {
        skip(10);
      }
    } else {
      setShowControls((prev) => {
        if (!prev) {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
        return !prev;
      });
    }
    lastTapRef.current = { time: now, x: touch.clientX };
  }, [skip]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
          e.preventDefault();
          togglePiP();
          break;
      }
    },
    [togglePlay, skip, toggleMute, toggleFullscreen, togglePiP]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getQualityLabel = (height: number) => {
    if (height >= 1080) return "1080p";
    if (height >= 720) return "720p";
    if (height >= 480) return "480p";
    if (height >= 360) return "360p";
    return `${height}p`;
  };

  return (
    <div
      ref={containerRef}
      className="vp-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { isPlaying && setShowControls(false); setHoverTime(null); }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      tabIndex={0}
      data-testid="video-player"
    >
      <video
        ref={videoRef}
        poster={poster}
        className="vp-video"
        muted={!!currentAudioTrack || isMuted}
        playsInline
        onClick={togglePlay}
        onDoubleClick={handleVideoDoubleClick}
        data-testid="video-element"
      />

      {currentAudioTrack && (
        <audio
          ref={audioRef}
          src={currentAudioTrack.audioUrl}
          preload="auto"
          data-testid="audio-element"
        />
      )}

      {isBuffering && (
        <div className="vp-buffering-overlay" data-testid="buffering-indicator">
          <div className="vp-buffering-rings">
            <div className="vp-buffering-dot" />
            <div className="vp-buffering-ring" />
            <div className="vp-buffering-ring" />
            <div className="vp-buffering-ring" />
          </div>
        </div>
      )}

      {!isPlaying && !isBuffering && (
        <div className="vp-play-overlay" onClick={togglePlay}>
          <div className="vp-play-btn-large">
            <Play className="w-8 h-8 text-white ml-0.5" />
          </div>
          {title && <p className="vp-play-title">{title}</p>}
        </div>
      )}

      {title && isPlaying && (
        <div className={`vp-top-bar ${showControls ? "vp-top-bar-visible" : "vp-top-bar-hidden"}`}>
          <span className="vp-top-title" data-testid="text-top-title">{title}</span>
        </div>
      )}

      {currentCue && (
        <div className="vp-subtitle-overlay" data-testid="subtitle-overlay">
          {currentCue.split("\n").map((line, i) => (
            <span key={i} className="vp-subtitle-line">{line}</span>
          ))}
        </div>
      )}

      {(hlsUrl || (videoUrl && isHlsUrl(videoUrl))) && showControls && (
        <div className="vp-hls-badge" data-testid="badge-hls">
          {hlsLevels.length > 0 && selectedQuality >= 0
            ? getQualityLabel(hlsLevels[selectedQuality]?.height || 0)
            : hlsLevels.length > 0
              ? "HD"
              : "HLS"}
          <span className="vp-hls-badge-dot" />
        </div>
      )}

      <div className={`vp-controls-wrapper ${showControls ? "vp-controls-visible" : "vp-controls-hidden"}`}>
        <div
          ref={progressRef}
          className="vp-progress-container"
          onClick={handleSeek}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
        >
          {hoverTime !== null && (
            <div className="vp-hover-tooltip" style={{ left: `${hoverX}px` }}>
              {formatTime(hoverTime)}
            </div>
          )}
          <div className="vp-progress-track">
            <div className="vp-progress-buffered" style={{ width: `${buffered}%` }} />
            <div className="vp-progress-filled" style={{ width: `${progressPercent}%` }} />
            <div className="vp-progress-thumb" style={{ left: `${progressPercent}%` }} />
            {chapters && duration > 0 && chapters.map((ch, i) => {
              const pos = (ch.time / duration) * 100;
              return pos >= 0 && pos <= 100 ? (
                <div
                  key={i}
                  className="vp-chapter-dot"
                  style={{ left: `${pos}%` }}
                  title={ch.label}
                  data-testid={`chapter-dot-${i}`}
                />
              ) : null;
            })}
          </div>
        </div>

        <div className="vp-controls-bar">
          <div className="vp-controls-left">
            <button className="vp-ctrl-btn" onClick={togglePlay} data-testid="button-play-pause">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button className="vp-ctrl-btn" onClick={() => skip(-10)} data-testid="button-skip-back">
              <SkipBack className="w-4 h-4" />
            </button>

            <button className="vp-ctrl-btn" onClick={() => skip(10)} data-testid="button-skip-forward">
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="vp-volume-group">
              <button className="vp-ctrl-btn" onClick={toggleMute} data-testid="button-mute">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="vp-volume-slider">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_.bg-primary]:bg-white"
                />
              </div>
            </div>

            <span className="vp-time-display" data-testid="text-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {audioTracks.length > 0 && (
              <span className="vp-lang-pill" data-testid="pill-lang">
                {AVAILABLE_LANGUAGES.find((l) => l.code === selectedAudioTrack)?.name || selectedAudioTrack}
              </span>
            )}
          </div>

          <div className="vp-controls-right">
            {audioTracks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="vp-ctrl-btn" data-testid="button-language">
                    <Languages className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#1a1a2e] border-white/10 text-white">
                  <DropdownMenuLabel className="text-white/70">Audio Language</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {audioTracks.map((track) => (
                    <DropdownMenuItem
                      key={track.languageCode}
                      onClick={() => setSelectedAudioTrack(track.languageCode)}
                      className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                      data-testid={`menu-audio-${track.languageCode}`}
                    >
                      <span>{track.languageName}{track.voiceName && <span className="text-white/50 ml-1 text-xs">({track.voiceName})</span>}</span>
                      {selectedAudioTrack === track.languageCode && <Check className="w-4 h-4 text-cyan-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {subtitleTracks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`vp-ctrl-btn ${selectedSubtitle ? "vp-ctrl-btn-active" : ""}`} data-testid="button-subtitles">
                    <Captions className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#1a1a2e] border-white/10 text-white">
                  <DropdownMenuLabel className="text-white/70">Subtitles</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => setSelectedSubtitle(null)}
                    className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                  >
                    <span>Off</span>
                    {selectedSubtitle === null && <Check className="w-4 h-4 text-cyan-400" />}
                  </DropdownMenuItem>
                  {subtitleTracks.map((track) => (
                    <DropdownMenuItem
                      key={track.languageCode}
                      onClick={() => setSelectedSubtitle(track.languageCode)}
                      className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                      data-testid={`menu-subtitle-${track.languageCode}`}
                    >
                      <span>{track.languageName}</span>
                      {selectedSubtitle === track.languageCode && <Check className="w-4 h-4 text-cyan-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="vp-ctrl-btn" data-testid="button-settings">
                  <Settings className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#1a1a2e] border-white/10 text-white">
                <DropdownMenuLabel className="text-white/70">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white">
                    Speed ({playbackSpeed}x)
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-[#1a1a2e] border-white/10">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => handlePlaybackSpeedChange(speed)}
                        className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                        data-testid={`menu-speed-${speed}`}
                      >
                        <span>{speed}x</span>
                        {playbackSpeed === speed && <Check className="w-4 h-4 text-cyan-400" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {hlsLevels.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white">
                      Quality ({selectedQuality === -1 ? "Auto" : getQualityLabel(hlsLevels[selectedQuality]?.height || 0)})
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-[#1a1a2e] border-white/10">
                      <DropdownMenuItem
                        onClick={() => handleQualityChange(-1)}
                        className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                      >
                        <span>Auto</span>
                        {selectedQuality === -1 && <Check className="w-4 h-4 text-cyan-400" />}
                      </DropdownMenuItem>
                      {hlsLevels.map((level, i) => (
                        <DropdownMenuItem
                          key={i}
                          onClick={() => handleQualityChange(i)}
                          className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                        >
                          <span>{getQualityLabel(level.height)}</span>
                          {selectedQuality === i && <Check className="w-4 h-4 text-cyan-400" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className="text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                    data-testid="menu-settings-audio"
                  >
                    <Languages className="w-4 h-4 mr-2 opacity-70" />
                    Audio ({audioTracks.length > 0
                      ? (AVAILABLE_LANGUAGES.find((l) => l.code === selectedAudioTrack)?.name || "English")
                      : "Default"})
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-[#1a1a2e] border-white/10">
                    {audioTracks.length > 0 ? audioTracks.map((track) => (
                      <DropdownMenuItem
                        key={track.languageCode}
                        onClick={() => setSelectedAudioTrack(track.languageCode)}
                        className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                        data-testid={`menu-settings-audio-${track.languageCode}`}
                      >
                        <span>
                          {track.languageName}
                          {track.voiceName && <span className="text-white/50 ml-1 text-xs">({track.voiceName})</span>}
                        </span>
                        {selectedAudioTrack === track.languageCode && <Check className="w-4 h-4 text-cyan-400" />}
                      </DropdownMenuItem>
                    )) : (
                      <DropdownMenuItem disabled className="text-white/40 text-sm">
                        Default (video audio)
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className="text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                    data-testid="menu-settings-subtitles"
                  >
                    <Captions className="w-4 h-4 mr-2 opacity-70" />
                    Subtitles ({selectedSubtitle
                      ? (subtitleTracks.find((t) => t.languageCode === selectedSubtitle)?.languageName || selectedSubtitle)
                      : "Off"})
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-[#1a1a2e] border-white/10">
                    <DropdownMenuItem
                      onClick={() => setSelectedSubtitle(null)}
                      className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                      data-testid="menu-settings-subtitle-off"
                    >
                      <span>Off</span>
                      {selectedSubtitle === null && <Check className="w-4 h-4 text-cyan-400" />}
                    </DropdownMenuItem>
                    {subtitleTracks.map((track) => (
                      <DropdownMenuItem
                        key={track.languageCode}
                        onClick={() => setSelectedSubtitle(track.languageCode)}
                        className="flex items-center justify-between cursor-pointer text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                        data-testid={`menu-settings-subtitle-${track.languageCode}`}
                      >
                        <span>{track.languageName}</span>
                        {selectedSubtitle === track.languageCode && <Check className="w-4 h-4 text-cyan-400" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            {onUshaToggle && (
              <button
                className={`vp-usha-btn ${isUshaOpen ? "vp-usha-btn-active" : ""}`}
                onClick={onUshaToggle}
                title="Ask Usha AI"
                data-testid="button-usha-tutor"
              >
                <Avatar className="h-7 w-7 border border-cyan-400/50">
                  <AvatarImage src={ushaAvatarImage} alt="Usha AI" />
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs font-bold">U</AvatarFallback>
                </Avatar>
                <span className="vp-usha-label">Usha</span>
              </button>
            )}

            {typeof document !== "undefined" && (document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled && (
              <button
                className={`vp-ctrl-btn ${isPiP ? "vp-ctrl-btn-active" : ""}`}
                onClick={togglePiP}
                title="Picture in Picture (P)"
                data-testid="button-pip"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </button>
            )}

            <button className="vp-ctrl-btn" onClick={toggleFullscreen} title="Fullscreen (F)" data-testid="button-fullscreen">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
