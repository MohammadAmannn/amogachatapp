import { useState } from 'react'
import { FileText, Image, Video, Music, File } from 'lucide-react'
import { toast } from 'sonner'

export function getFileExtension(fileName?: string, url?: string): string {
  if (fileName) {
    const ext = fileName.split('.').pop()
    if (ext) return ext.toLowerCase()
  }
  if (url) {
    try {
      const path = new URL(url).pathname
      const ext = path.split('.').pop()
      if (ext) return ext.toLowerCase()
    } catch {}
  }
  return ''
}

export function getFileIconInfo(ext: string) {
  const extLower = ext.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extLower)) {
    return { icon: Image, colorClass: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900' }
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extLower)) {
    return { icon: Video, colorClass: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900' }
  }
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extLower)) {
    return { icon: Music, colorClass: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900' }
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(extLower)) {
    return { icon: FileText, colorClass: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900' }
  }
  return { icon: File, colorClass: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700' }
}

export function useDownloadFile() {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadFile = async (url: string, fileName: string) => {
    setIsDownloading(true)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Failed to download file.')
    } finally {
      setIsDownloading(false)
    }
  }

  return { downloadFile, isDownloading }
}
