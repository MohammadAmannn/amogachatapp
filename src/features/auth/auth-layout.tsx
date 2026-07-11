import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='relative min-h-svh overflow-hidden'>
      {/* Animated gradient background */}
      <div className='fixed inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-background via-background to-muted/40' />
        <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl' />
        <div className='absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl' />
      </div>

      <div className='container grid h-svh max-w-none items-center justify-center'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-xl font-medium'>Shadcn Admin</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
