interface VideoPlayerProps {
  fileUrl: string
  fileName?: string
}

export function VideoPlayer({ fileUrl, fileName }: VideoPlayerProps) {
  return (
    <div className="flex flex-col gap-2 max-w-full w-72 sm:w-80 border border-border/40 rounded-lg overflow-hidden shadow-xs">
      <video
        src={fileUrl}
        controls
        className="rounded-lg w-full max-h-60 bg-black"
        preload="metadata"
      />
    </div>
  )
}
export default VideoPlayer
