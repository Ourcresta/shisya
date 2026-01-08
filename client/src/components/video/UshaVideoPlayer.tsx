import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Languages,
  Subtitles,
  SkipBack,
  SkipForward,
  Check,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface UshaVideoPlayerProps {
  videoUrl: string;
  audioTracks?: AudioTrack[];
  subtitleTracks?: SubtitleTrack[];
  poster?: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
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
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function UshaVideoPlayer({
  videoUrl,
  audioTracks = [],
  subtitleTracks = [],
  poster,
  title,
  onProgress,
  onComplete,
  onPlayStateChange,
}: UshaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string>(
    audioTracks[0]?.languageCode || "en"
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentAudioTrack = audioTracks.find(
    (t) => t.languageCode === selectedAudioTrack
  );

  const syncAudioWithVideo = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const timeDiff = Math.abs(
        videoRef.current.currentTime - audioRef.current.currentTime
      );
      if (timeDiff > 0.1) {
        audioRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      syncAudioWithVideo();
      if (onProgress && duration > 0) {
        onProgress((video.currentTime / duration) * 100);
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
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [duration, onProgress, onComplete, onPlayStateChange, syncAudioWithVideo]);

  useEffect(() => {
    if (audioRef.current && currentAudioTrack) {
      const wasPlaying = isPlaying;
      const currentVideoTime = videoRef.current?.currentTime || 0;

      audioRef.current.src = currentAudioTrack.audioUrl;
      audioRef.current.currentTime = currentVideoTime;

      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentAudioTrack, isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    const newPlayState = !isPlaying;
    if (isPlaying) {
      video.pause();
      audio?.pause();
    } else {
      video.play().catch(console.error);
      audio?.play().catch(console.error);
    }
    setIsPlaying(newPlayState);
    onPlayStateChange?.(newPlayState);
  }, [isPlaying, onPlayStateChange]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;

      videoRef.current.currentTime = newTime;
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
      setCurrentTime(newTime);
    },
    [duration]
  );

  const skip = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const newTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
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
    setIsFullscreen(!isFullscreen);
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
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
      }
    },
    [togglePlay, skip, toggleMute, toggleFullscreen]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden group border-2 border-border shadow-lg"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="video-player"
    >
      {/* Video Element - Muted (audio comes from separate audio element) */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-800"
        muted
        playsInline
        onClick={togglePlay}
        data-testid="video-element"
      />

      {/* Separate Audio Element for Language Switching */}
      <audio
        ref={audioRef}
        src={currentAudioTrack?.audioUrl}
        preload="auto"
        data-testid="audio-element"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isBuffering && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-10 h-10 text-primary-foreground ml-1" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 
          bg-gradient-to-t from-black/90 via-black/50 to-transparent
          transition-opacity duration-300
          ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Title Bar */}
        {title && (
          <div className="px-4 pt-8 pb-2">
            <h3 className="text-white text-sm font-medium truncate">{title}</h3>
          </div>
        )}

        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="px-4 py-2 cursor-pointer group/progress"
          onClick={handleSeek}
        >
          <div className="relative h-1 bg-white/30 rounded-full group-hover/progress:h-1.5 transition-all">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="px-4 pb-4 flex items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => skip(-10)}
              data-testid="button-skip-back"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => skip(10)}
              data-testid="button-skip-forward"
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
                data-testid="button-mute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <div className="w-20 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.bg-primary]:bg-white"
                />
              </div>
            </div>

            {/* Time Display */}
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            {audioTracks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    data-testid="button-language"
                  >
                    <Languages className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Audio Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {audioTracks.map((track) => (
                    <DropdownMenuItem
                      key={track.languageCode}
                      onClick={() => setSelectedAudioTrack(track.languageCode)}
                      className="flex items-center justify-between cursor-pointer"
                      data-testid={`menu-audio-${track.languageCode}`}
                    >
                      <span>
                        {track.languageName}
                        {track.voiceName && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({track.voiceName})
                          </span>
                        )}
                      </span>
                      {selectedAudioTrack === track.languageCode && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Subtitles */}
            {subtitleTracks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white/20 ${selectedSubtitle ? "bg-white/20" : ""}`}
                    data-testid="button-subtitles"
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSelectedSubtitle(null)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>Off</span>
                    {selectedSubtitle === null && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                  {subtitleTracks.map((track) => (
                    <DropdownMenuItem
                      key={track.languageCode}
                      onClick={() => setSelectedSubtitle(track.languageCode)}
                      className="flex items-center justify-between cursor-pointer"
                      data-testid={`menu-subtitle-${track.languageCode}`}
                    >
                      <span>{track.languageName}</span>
                      {selectedSubtitle === track.languageCode && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  data-testid="button-settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Playback Speed ({playbackSpeed}x)
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => handlePlaybackSpeedChange(speed)}
                        className="flex items-center justify-between cursor-pointer"
                        data-testid={`menu-speed-${speed}`}
                      >
                        <span>{speed}x</span>
                        {playbackSpeed === speed && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
              data-testid="button-fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Current Language Badge */}
      {audioTracks.length > 0 && showControls && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-2">
            <Languages className="w-3.5 h-3.5" />
            {AVAILABLE_LANGUAGES.find((l) => l.code === selectedAudioTrack)
              ?.name || "English"}
          </div>
        </div>
      )}

      {/* Usha Avatar Guide Overlay */}
      <div className="absolute bottom-20 right-4 flex items-end gap-2 pointer-events-none">
        {/* Speech Bubble */}
        <div className="relative bg-white dark:bg-slate-800 rounded-xl px-3 py-2 shadow-lg max-w-[180px] animate-pulse">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
            {isPlaying ? "I am explaining the lesson..." : "Click play to start learning!"}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -right-2 bottom-3 w-0 h-0 border-t-[8px] border-t-transparent border-l-[10px] border-l-white dark:border-l-slate-800 border-b-[8px] border-b-transparent" />
        </div>

        {/* Avatar with label */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
              <AvatarImage src={ushaAvatarImage} alt="Usha" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">U</AvatarFallback>
            </Avatar>
            {/* Live indicator when playing */}
            {isPlaying && (
              <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                LIVE
              </div>
            )}
          </div>
          <div className="mt-1 bg-primary/90 backdrop-blur px-2 py-0.5 rounded-md">
            <span className="text-[10px] font-semibold text-primary-foreground">Usha Guide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
