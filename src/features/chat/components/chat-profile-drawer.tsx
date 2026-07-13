import { useState } from 'react'
import { X, FileText, Download, Play, ExternalLink, Search, Mail, Phone, Calendar, ShieldCheck, User, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFileExtension, getFileIconInfo, useDownloadFile } from '@/features/files/utils/file-helpers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Conversation, Message } from '../types/chat.types'
import { FileCard } from '@/features/files/components/file-card'
import { cn, getDisplayNameInitials } from '@/lib/utils'

interface ChatProfilePageProps {
  conversation: Conversation
  messages: Message[]
  onBack: () => void
  currentUser: { accountNo: string; name?: string; email?: string } | null
  onViewDocument?: (url: string, name: string) => void
}

export function ChatProfilePage({ conversation, messages, onBack, currentUser, onViewDocument }: ChatProfilePageProps) {
  const [activeTab, setActiveTab] = useState('contact')
  const [fileSearchQuery, setFileSearchQuery] = useState('')
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)
  const [selectedPlayVideo, setSelectedPlayVideo] = useState<string | null>(null)
  const { downloadFile } = useDownloadFile()

  // Filter attachments from messages array
  const imageMessages = messages.filter(m => m.message_type === 'image' && m.file_url && !m.deleted)
  const videoMessages = messages.filter(m => m.message_type === 'video' && m.file_url && !m.deleted)
  const documentMessages = messages.filter(m => m.message_type === 'document' && m.file_url && !m.deleted)

  // Parse links shared in messages
  const links = messages
    .filter(m => !m.deleted && m.message && /https?:\/\/[^\s]+/.test(m.message))
    .flatMap(m => {
      const urls = m.message!.match(/https?:\/\/[^\s]+/g) || []
      return urls.map(url => {
        let title = 'Shared Link'
        try {
          title = new URL(url).hostname
        } catch {}
        return {
          url,
          title,
          created_at: m.created_at
        }
      })
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Filtered documents for Files Tab
  const filteredDocuments = documentMessages.filter(doc => 
    doc.file_name?.toLowerCase().includes(fileSearchQuery.toLowerCase())
  )

  // Format file size helper
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString([], { dateStyle: 'long' })
    } catch {
      return ''
    }
  }



  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden select-none animate-in fade-in duration-200 w-full max-w-full min-w-0">
      {/* Tabs Header inside Chat Window Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full max-w-full min-w-0 p-2 sm:p-5 space-y-3 sm:space-y-4 overflow-hidden">
        {/* Header Tabs list with close button aligned right */}
        <div className="flex items-center justify-between border-b border-border pb-1 shrink-0 select-none w-full min-w-0">
          <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mr-2">
            <TabsList className="flex items-center gap-5 border-0 bg-transparent p-0 shadow-none rounded-none h-auto select-none w-max">
              <TabsTrigger 
                value="contact" 
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Contact
              </TabsTrigger>
              <TabsTrigger 
                value="files" 
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Files ({documentMessages.length})
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Images ({imageMessages.length})
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Videos ({videoMessages.length})
              </TabsTrigger>
              <TabsTrigger 
                value="links" 
                className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Links ({links.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Close Profile and return to chat"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 relative bg-card border border-border/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden w-full max-w-full min-w-0">
          {/* 1. CONTACT TAB */}
          <TabsContent value="contact" className="h-full m-0 focus-visible:outline-none">
            <ScrollArea className="h-full">
              <div className="p-6">
              {conversation.type === 'direct' ? (
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/20 shadow-md">
                      <AvatarImage src={conversation.image} alt={conversation.name} />
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-3xl">
                        {getDisplayNameInitials(conversation.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-foreground">{conversation.name}</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Direct Partner
                    </span>
                  </div>

                  <div className="border-t border-border/80 my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/20 border border-border/40">
                      <Mail className="h-5 w-5 text-muted-foreground/80" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Email Address</span>
                        <span className="text-xs font-semibold text-foreground mt-0.5">
                          {conversation.members?.find(m => m.id !== currentUser?.accountNo)?.email || 'Not available'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/20 border border-border/40">
                      <User className="h-5 w-5 text-muted-foreground/80" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Company / Organization</span>
                        <span className="text-xs font-semibold text-foreground mt-0.5">Corporate Partner</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/20 border border-border/40">
                      <Phone className="h-5 w-5 text-muted-foreground/80" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Phone Number</span>
                        <span className="text-xs font-semibold text-foreground mt-0.5">Not Shared</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/20 border border-border/40">
                      <Calendar className="h-5 w-5 text-muted-foreground/80" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Established Since</span>
                        <span className="text-xs font-semibold text-foreground mt-0.5">{formatDate(conversation.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/20 shadow-md">
                      <AvatarImage src={conversation.image} alt={conversation.name} />
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-bold text-3xl">
                        {getDisplayNameInitials(conversation.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-foreground">{conversation.name}</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Group Workspace
                    </span>
                  </div>

                  <div className="border-t border-border/80 my-4" />

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/25 border border-border/40 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Description</span>
                      <p className="text-xs text-foreground font-medium leading-relaxed">
                        This is a workspace channels group to coordinate tasks, review documents, and broadcast project updates.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1">Members ({conversation.members?.length || 0})</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {conversation.members?.map(m => (
                          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/10 transition-colors">
                            <Avatar className="h-8 w-8 rounded-lg shrink-0">
                              <AvatarImage src={m.avatar_url} />
                              <AvatarFallback className="rounded-lg bg-primary/15 text-primary text-[10px] font-bold">
                                {m.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-foreground truncate">{m.name}</span>
                              <span className="text-[9px] text-muted-foreground truncate leading-normal">{m.email}</span>
                            </div>
                            {m.id === conversation.created_by && (
                              <span className="text-[8px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0 border border-primary/10">
                                <ShieldCheck className="h-2.5 w-2.5" />
                                Admin
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 2. FILES TAB */}
          <TabsContent value="files" className="h-full m-0 flex flex-col focus-visible:outline-none">
            {/* Search documents */}
            <div className="p-4 border-b border-border bg-muted/10 shrink-0">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name..."
                  value={fileSearchQuery}
                  onChange={(e) => setFileSearchQuery(e.target.value)}
                  className="pl-8.5 rounded-xl border-border bg-background focus-visible:ring-primary/40 text-xs h-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2.5 sm:p-4">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/60 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mb-2 stroke-[1.5]" />
                  <span className="text-xs font-bold text-foreground">No files found</span>
                  <span className="text-[10px]">No files matching your search query have been shared.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map(doc => (
                    <FileCard
                      key={doc.id}
                      fileUrl={doc.file_url || ''}
                      fileName={doc.file_name || 'Document'}
                      fileSize={doc.file_size}
                      createdAt={doc.created_at}
                      onPreview={onViewDocument ? () => onViewDocument(doc.file_url || '', doc.file_name || 'Document') : () => window.open(doc.file_url || '', '_blank')}
                      messageId={doc.id}
                    />
                  ))}
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 3. IMAGES TAB */}
          <TabsContent value="images" className="h-full m-0 focus-visible:outline-none">
            <ScrollArea className="h-full">
              <div className="p-4">
              {imageMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/60 text-center">
                  <span className="text-xs font-bold text-foreground">No images shared</span>
                  <span className="text-[10px]">Images shared in this conversation will appear here.</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {imageMessages.map(img => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedPreviewImage(img.file_url || null)}
                      className="relative aspect-square border border-border/60 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 active:scale-98 transition-all bg-muted/30"
                    >
                      <img
                        src={img.file_url}
                        alt={img.file_name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 4. VIDEOS TAB */}
          <TabsContent value="videos" className="h-full m-0 focus-visible:outline-none">
            <ScrollArea className="h-full">
              <div className="p-4">
              {videoMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/60 text-center">
                  <span className="text-xs font-bold text-foreground">No videos shared</span>
                  <span className="text-[10px]">Videos shared in this conversation will appear here.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {videoMessages.map(vid => {
                    const durationStr = vid.duration 
                      ? `${Math.floor(vid.duration / 60)}:${String(Math.floor(vid.duration % 60)).padStart(2, '0')}` 
                      : '0:00'
                    return (
                      <div
                        key={vid.id}
                        onClick={() => setSelectedPlayVideo(vid.file_url || null)}
                        className="group relative aspect-video border border-border/60 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 active:scale-98 transition-all bg-muted/40"
                      >
                        <video
                          src={vid.file_url}
                          className="h-full w-full object-cover pointer-events-none"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center text-white scale-95 group-hover:scale-105 transition-transform">
                            <Play className="h-4 w-4 fill-white" />
                          </div>
                        </div>
                        {vid.duration && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-extrabold select-none">
                            {durationStr}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 5. LINKS TAB */}
          <TabsContent value="links" className="h-full m-0 focus-visible:outline-none">
            <ScrollArea className="h-full">
              <div className="p-4">
              {links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/60 text-center">
                  <span className="text-xs font-bold text-foreground">No links shared</span>
                  <span className="text-[10px]">Links shared in this conversation will appear here.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {links.map((lnk, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/80 hover:bg-muted/10 transition-colors bg-card">
                      <div className="flex flex-col min-w-0 mr-4">
                        <span className="text-xs font-bold text-foreground truncate capitalize">{lnk.title}</span>
                        <span className="text-[9px] text-primary truncate hover:underline leading-normal mt-0.5">{lnk.url}</span>
                      </div>
                      <a
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8.5 w-8.5 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                        title="Open link in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Image zoom preview overlay */}
      {selectedPreviewImage && (
        <Dialog open={!!selectedPreviewImage} onOpenChange={() => setSelectedPreviewImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none flex items-center justify-center">
            <img src={selectedPreviewImage} alt="Preview Zoom" className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl" />
          </DialogContent>
        </Dialog>
      )}

      {/* Video player overlay */}
      {selectedPlayVideo && (
        <Dialog open={!!selectedPlayVideo} onOpenChange={() => setSelectedPlayVideo(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-zinc-950 border-0 shadow-none flex items-center justify-center">
            <video src={selectedPlayVideo} controls autoPlay className="max-h-[85vh] w-full" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
export default ChatProfilePage
