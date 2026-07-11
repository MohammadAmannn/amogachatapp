import { MessagesSquare } from 'lucide-react'

export function ChatWelcome() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center p-8 bg-card/10 text-center h-full rounded-lg border border-dashed border-border/60 select-none'>
      <div className='rounded-full bg-primary/10 p-6 mb-4 animate-bounce duration-1000'>
        <MessagesSquare className='h-12 w-12 text-primary' />
      </div>
      <h3 className='text-2xl font-bold tracking-tight text-foreground'>
        Welcome to Chat Template!
      </h3>
      <p className='text-sm text-muted-foreground max-w-sm mt-2 leading-relaxed'>
        Select a conversation from the sidebar or start a new message with one of your contacts to begin chatting.
      </p>
    </div>
  )
}
