import { Bell } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'

type AppHeaderProps = {
  title: string
  fixed?: boolean
  children?: React.ReactNode
}

export function AppHeader({
    title,
    fixed = true,
    children,
  }: AppHeaderProps) {
    return (
      <Header fixed={fixed} className='border-b bg-background'>
        {/* Left */}
        <h1 className='min-w-0 truncate text-base font-semibold sm:text-lg'>
          {title}
        </h1>
  
        {/* Desktop-only centered search */}
        <div className='absolute left-1/2 hidden -translate-x-1/2 md:block'>
          <Search />
        </div>
  
        {/* Right */}
        <div className='ms-auto flex shrink-0 items-center gap-1 sm:gap-2'>
          {/* Mobile search stays where it is */}
          <div className='md:hidden'>
            <Search />
          </div>
  
          {children}
  
          <Button
            variant='ghost'
            size='icon'
            className='size-8 shrink-0'
            aria-label='Notifications'
          >
            <Bell className='size-5' />
          </Button>
  
          <ProfileDropdown />
        </div>
      </Header>
    )
  }
