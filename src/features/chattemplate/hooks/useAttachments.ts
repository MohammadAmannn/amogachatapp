import { useState, useCallback } from 'react'
import { uploadAttachment } from '../services/attachment.service'

export interface UploadState {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  folder: 'images' | 'videos' | 'documents' | 'audio'
  xhr?: XMLHttpRequest
}

export function useAttachments() {
  const [uploads, setUploads] = useState<UploadState[]>([])

  const startUpload = useCallback((
    file: File,
    folder: 'images' | 'videos' | 'documents' | 'audio',
    onSuccess: (url: string, fileDetails: { name: string; size: number; type: string; duration?: number }) => void,
    onError?: (err: Error) => void,
    duration?: number
  ) => {
    const uploadId = crypto.randomUUID()
    const newUpload: UploadState = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
      folder,
    }

    setUploads((prev) => [...prev, newUpload])

    try {
      const { xhr, promise } = uploadAttachment(file, folder, (percent) => {
        setUploads((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: percent } : u))
        )
      })

      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, xhr } : u))
      )

      promise
        .then((url) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress: 100, status: 'success' } : u))
          )
          onSuccess(url, { name: file.name, size: file.size, type: file.type, duration })
          
          setTimeout(() => {
            setUploads((prev) => prev.filter((u) => u.id !== uploadId))
          }, 1000)
        })
        .catch((err) => {
          console.error('Attachment upload failed:', err)
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: 'error' } : u))
          )
          if (onError) onError(err)
        })
    } catch (err) {
      console.error('Attachment upload failed:', err)
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'error' } : u))
      )
      if (onError && err instanceof Error) onError(err)
    }
  }, [])

  const cancelUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id)
      if (upload && upload.xhr) {
        upload.xhr.abort()
      }
      return prev.filter((u) => u.id !== id)
    })
  }, [])

  return {
    uploads,
    setUploads,
    startUpload,
    cancelUpload,
  }
}
export default useAttachments
