import { Pin, Star, Heart, Flag, Archive, ThumbsUp } from 'lucide-react'

interface MessageActionsProps {
  thumb: boolean
  favorite: boolean
  flag: boolean
  star: boolean
  pin: boolean
  archive: boolean
}

export function MessageActions({
  thumb,
  favorite,
  flag,
  star,
  pin,
  archive,
}: MessageActionsProps) {
  const hasActions = thumb || favorite || flag || star || pin || archive
  if (!hasActions) return null

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap select-none">
      {pin && (
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 text-[9px] font-extrabold animate-in fade-in duration-200">
          <Pin className="h-2.5 w-2.5 fill-primary/10" />
          <span>Pinned</span>
        </div>
      )}
      {favorite && (
        <div className="flex items-center justify-center p-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-in fade-in duration-200" title="Favorite">
          <Heart className="h-2.5 w-2.5 fill-rose-500/20" />
        </div>
      )}
      {star && (
        <div className="flex items-center justify-center p-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-in fade-in duration-200" title="Starred">
          <Star className="h-2.5 w-2.5 fill-amber-500/20" />
        </div>
      )}
      {flag && (
        <div className="flex items-center justify-center p-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 animate-in fade-in duration-200" title="Flagged">
          <Flag className="h-2.5 w-2.5 fill-red-500/20" />
        </div>
      )}
      {archive && (
        <div className="flex items-center justify-center p-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-in fade-in duration-200" title="Archived">
          <Archive className="h-2.5 w-2.5" />
        </div>
      )}
      {thumb && (
        <div className="flex items-center justify-center p-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-in fade-in duration-200" title="Liked">
          <ThumbsUp className="h-2.5 w-2.5 fill-emerald-500/20" />
        </div>
      )}
    </div>
  )
}
export default MessageActions
