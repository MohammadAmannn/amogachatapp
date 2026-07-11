import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'

type AppLogoProps = {
  className?: string
}

export function AppLogo({ className }: AppLogoProps) {
  const { toggleSidebar } = useSidebar()
  const team = sidebarData.teams[0]
  const Logo = team.logo

  return (
    <Button
      type='button'
      variant='ghost'
      onClick={toggleSidebar}
      className={cn(
        'size-8 shrink-0 p-0 hover:bg-transparent sm:size-9',
        className
      )}
      aria-label='Open sidebar menu'
    >
      <div className='flex size-full items-center justify-center rounded-lg bg-primary text-primary-foreground'>
        <Logo className='size-4' />
      </div>
    </Button>
  )
}
