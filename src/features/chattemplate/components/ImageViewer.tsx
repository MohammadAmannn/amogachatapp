import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface ImageViewerProps {
  fileUrl: string
  fileName?: string
}

export function ImageViewer({ fileUrl, fileName }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="relative max-w-sm rounded-lg overflow-hidden border border-border/40 shadow-xs">
        <img
          src={fileUrl}
          alt={fileName || 'Image'}
          className="rounded-lg max-h-60 max-w-full object-cover cursor-pointer hover:opacity-90 transition-all duration-200"
          loading="lazy"
          onClick={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl p-1 bg-black/95 border-none flex items-center justify-center">
            <div className="relative max-h-[85vh] w-full flex justify-center p-2">
              <img
                src={fileUrl}
                alt={fileName || 'Full Screen Preview'}
                className="max-h-[80vh] max-w-full object-contain rounded-md animate-in zoom-in-95 duration-200"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 rounded-full p-2 bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Close image overlay"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
export default ImageViewer
