import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

interface VoiceMessagePlayerProps {
  fileUrl: string
  duration?: number
}

export function VoiceMessagePlayer({ fileUrl, duration }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sync duration prop if it loads late
  useEffect(() => {
    if (duration) {
      setTotalDuration(duration)
    }
  }, [duration])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch((err) => {
        console.error("Audio play error:", err)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current && !duration) {
      setTotalDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || totalDuration === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = percentage * totalDuration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className="flex items-center gap-2.5 w-60 sm:w-72 p-2 bg-muted/20 dark:bg-muted/10 rounded-xl border border-border/40 shrink-0">
      {/* Hidden native audio tag */}
      <audio
        ref={audioRef}
        src={fileUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <button
        type="button"
        onClick={togglePlay}
        className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-600 dark:bg-emerald-500 text-white hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-white text-white" />
        ) : (
          <Play className="h-4 w-4 fill-white text-white translate-x-[1px]" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0 select-none">
        {/* Interactive progress bar */}
        <div
          onClick={handleProgressClick}
          className="h-1.5 w-full bg-border dark:bg-muted/30 rounded-full cursor-pointer relative"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-sky-400 dark:bg-sky-500 rounded-full absolute left-0 top-0 transition-all duration-100"
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold leading-none">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </div>
    </div>
  )
}
export default VoiceMessagePlayer
