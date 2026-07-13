import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className='flex h-svh w-full flex-col items-center justify-center gap-4 bg-background text-foreground px-4 text-center select-none'>
      <h1 className='text-6xl font-bold tracking-tight'>404</h1>
      <p className='text-sm text-muted-foreground'>Oops! The page you are looking for does not exist.</p>
      <Button asChild className='rounded-xl font-bold text-xs h-9 mt-2'>
        <Link href='/'>Back to Home</Link>
      </Button>
    </div>
  )
}
