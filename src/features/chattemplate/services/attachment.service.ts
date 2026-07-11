export interface UploadProgressCallback {
  (progress: number): void
}

export function uploadAttachment(
  file: File,
  folder: 'images' | 'videos' | 'documents' | 'audio',
  onProgress?: UploadProgressCallback
): { xhr: XMLHttpRequest; promise: Promise<string> } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing')
  }

  const xhr = new XMLHttpRequest()
  const fileExt = file.name.split('.').pop()
  const uniqueName = `${crypto.randomUUID()}.${fileExt}`
  const path = `${folder}/${uniqueName}`
  const url = `${supabaseUrl}/storage/v1/object/chat-files/${path}`

  const promise = new Promise<string>((resolve, reject) => {
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`)
    xhr.setRequestHeader('apikey', supabaseAnonKey)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/chat-files/${path}`
        resolve(publicUrl)
      } else {
        reject(new Error(`Storage upload failed: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(file)
  })

  return { xhr, promise }
}
