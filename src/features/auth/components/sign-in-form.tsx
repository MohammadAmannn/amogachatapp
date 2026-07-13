import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { FcGoogle } from 'react-icons/fc'
import { useAuthStore, handleAuthRedirect } from '@/features/auth'
import { sleep, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(7, 'Password must be at least 7 characters long.'),
})

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignInForm({
  className,
  redirectTo,
  ...props
}: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const { auth } = useAuthStore()

  // Persist the intended redirect in sessionStorage as a reliable fallback
  // (cookies can expire during a slow OAuth flow; sessionStorage survives the tab)
  useEffect(() => {
    if (typeof window !== 'undefined' && redirectTo && redirectTo !== '/') {
      sessionStorage.setItem('post_login_redirect', redirectTo)
    }
  }, [redirectTo])

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    console.log('[DEBUG client] handleGoogleLogin triggered. Prop redirectTo:', redirectTo)
    try {
      const redirectValue = redirectTo || '/'
      console.log('[DEBUG client] handleGoogleLogin determined redirectValue:', redirectValue)

      if (typeof window !== 'undefined' && redirectValue !== '/') {
        sessionStorage.setItem('post_login_redirect', redirectValue)
        console.log('[DEBUG client] sessionStorage item post_login_redirect set to:', redirectValue)
      }

      const supabase = createClient()
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (redirectValue !== '/') {
        callbackUrl.searchParams.set('next', redirectValue)
      }
      console.log('[DEBUG client] signInWithOAuth callbackUrl (redirectTo option):', callbackUrl.toString())
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })
      if (error) throw error
    } catch (err: any) {
      console.error('[DEBUG client] handleGoogleLogin failed with error:', err)
      toast.error(err.message || 'Google sign in failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Check if email exists in profiles table (our records)
      const { data: profileList } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)

      const emailExists = profileList && profileList.length > 0

      if (!emailExists) {
        toast.error('Account not found in our records. Redirecting to Sign Up...')
        await sleep(1500)
        router.push(`/sign-up?email=${encodeURIComponent(data.email)}`)
        return
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      const user = authData.user
      if (!user) throw new Error('No user returned from sign in.')

      // ✅ FIXED: Set user with id field
      auth.setUser({
        id: user.id,  // ✅ ADD THIS - the auth UUID
        accountNo: user.id, // Supabase UUID
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!.split('@')[0],
        picture: user.user_metadata?.avatar_url || undefined,
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
      auth.setAccessToken(authData.session?.access_token || 'mock-access-token')

      // Redirect: use prop first, then sessionStorage fallback, then home
      const storedRedirect =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('post_login_redirect')
          : null
      const destination = redirectTo || storedRedirect || undefined
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('post_login_redirect')
      }
      handleAuthRedirect(router, destination)

      toast.success(`Welcome back, ${user.email}!`)
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                href='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading || isGoogleLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant='outline'
          type='button'
          className='w-full'
          disabled={isLoading || isGoogleLoading}
          onClick={handleGoogleLogin}
        >
          {isGoogleLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <FcGoogle className='h-4 w-4' />
          )}
          Continue with Google
        </Button>
      </form>
    </Form>
  )
}