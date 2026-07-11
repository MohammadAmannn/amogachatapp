import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { Button } from './ui/button'

export function Search({
  className = '',
  placeholder = 'Search',
  ...props
}: React.ComponentProps<'button'> & { placeholder?: string }) {
  const { setOpen } = useSearch()

  const openSearch = () => setOpen(true)

  return (
    <>
      {/* Mobile: search icon only (left of bell) */}
      <Button
        {...props}
        variant='ghost'
        size='icon'
        className={cn('size-8 shrink-0 md:hidden', className)}
        aria-label='Search'
        aria-keyshortcuts='Meta+K Control+K'
        onClick={openSearch}
      >
        <SearchIcon className='size-5' aria-hidden='true' />
      </Button>

      {/* Desktop: full search box */}
      <Button
        {...props}
        variant='outline'
        className={cn(
          'group relative hidden h-8 w-40 justify-start rounded-md bg-muted/25 px-3 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent md:flex lg:w-52 xl:w-64',
          className
        )}
        aria-keyshortcuts='Meta+K Control+K'
        onClick={openSearch}
      >
        <SearchIcon
          aria-hidden='true'
          className='absolute inset-s-2.5 top-1/2 -translate-y-1/2'
          size={16}
        />
        <span className='ms-6 truncate'>{placeholder}</span>
        <kbd className='pointer-events-none absolute inset-e-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none group-hover:bg-accent lg:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
    </>
  )
}
