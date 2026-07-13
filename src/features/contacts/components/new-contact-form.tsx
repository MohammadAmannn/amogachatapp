import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth'
import { createContact } from '../repositories/contact-repository'

interface NewContactFormProps {
  onSuccess: () => void
}

export function NewContactForm({ onSuccess }: NewContactFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  
  const currentUser = useAuthStore((state: any) => state.auth.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorText(null)

    if (!email.trim()) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (!currentUser) {
      toast.error('You must be logged in to add contacts.')
      return
    }

    // ✅ SIMPLE: Use currentUser.id directly - no need for complex fallbacks
    const userId = currentUser.id
    
    if (!userId) {
      toast.error('Unable to get user ID. Please log out and log back in.')
      return
    }

    setIsLoading(true)
    try {
      const result = await createContact(
        userId,  // ✅ Pass the auth user ID directly
        email.trim(), 
        fullName.trim() || undefined
      )
      
      if (!result.success) {
        setErrorText(result.error || 'Failed to add contact.')
        toast.error(result.error || 'Failed to add contact.')
        return
      }

      toast.success('Contact added successfully!')
      setFullName('')
      setEmail('')
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while creating the contact.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center py-6 px-4 w-full'>
      <Card className='w-full max-w-lg border border-border/80 bg-card/60 backdrop-blur-md shadow-xl rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none' />

        <CardHeader className='pb-4 relative z-10'>
          <div className='flex items-center gap-3.5 mb-2'>
            <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs'>
              <UserPlus className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-xl font-bold tracking-tight'>New Contact</CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Add anyone by email - they'll be added to your contacts even if they're not registered yet.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='relative z-10'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='email' className='text-xs font-semibold text-muted-foreground/90'>
                Email Address <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='e.g. name@example.com'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorText) setErrorText(null)
                }}
                className='rounded-xl border-border/70 focus-visible:ring-primary h-10'
                required
              />
              {errorText && (
                <p className='text-[11px] font-semibold text-rose-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200'>
                  {errorText}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='fullName' className='text-xs font-semibold text-muted-foreground/90'>
                Display Nickname <span className='text-muted-foreground/60'>(Optional)</span>
              </Label>
              <Input
                id='fullName'
                placeholder='e.g. John Office'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='rounded-xl border-border/70 focus-visible:ring-primary h-10'
              />
              <p className='text-[10px] text-muted-foreground/60 mt-0.5'>
                If no nickname is provided, we'll use their name or email.
              </p>
            </div>

            <div className='pt-2'>
              <Button
                type='submit'
                className='w-full rounded-xl h-10 text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-250 active:scale-[0.98]'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Adding Contact...
                  </>
                ) : (
                  'Add Contact'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
export default NewContactForm