import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command } from 'lucide-react'

type AppLogoProps = {
  className?: string
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <Button
      type='button'
      variant='ghost'
      className={cn(
        'size-8 shrink-0 p-0 hover:bg-transparent sm:size-9 cursor-default',
        className
      )}
      aria-label='App Logo'
    >
      <div className='flex size-full items-center justify-center rounded-lg bg-primary text-primary-foreground'>
        <Command className='size-4' />
      </div>
    </Button>
  )
}
