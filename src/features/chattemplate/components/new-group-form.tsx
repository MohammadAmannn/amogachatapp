import { useState } from 'react'
import { Contact } from '../types/chat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Users2, Check, ChevronsUpDown, X, Loader2 } from 'lucide-react'
import { getDisplayNameInitials, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { createGroupConversation } from '../services/conversation.service'
import { getOrCreatePendingUser } from '../services/user.service'
import { toast } from 'sonner'
import { getProfileByEmail } from '../services/profile.service'

interface NewGroupFormProps {
  contacts: Contact[]
  onSuccess: () => void
}

export function NewGroupForm({ contacts, onSuccess }: NewGroupFormProps) {
  const [groupName, setGroupName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [groupImage, setGroupImage] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleUser = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const currentUser = useAuthStore.getState().auth.user
    if (!currentUser) return

    if (!groupName.trim() || selectedEmails.length === 0) {
      return
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid group email address.')
      return
    }

    setIsLoading(true)
    const imageUrl = groupImage.trim() || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'

    try {
      // 1. Resolve selected emails to profiles
      const memberIds: string[] = []
      for (const email of selectedEmails) {
        const profile = await getProfileByEmail(email)
        if (profile) {
          memberIds.push(profile.id)
        }
      }

      // 2. Call conversation service to create group conversation
      const success = await createGroupConversation(
        groupName.trim(),
        imageUrl,
        memberIds,
        currentUser.accountNo
      )

      if (!success) {
        throw new Error('Failed to create group conversation')
      }

      // 3. Sync to legacy groups list
      try {
        await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupName: groupName.trim(),
            description: description.trim(),
            groupImage: imageUrl,
            users: [currentUser.email, ...selectedEmails].filter(Boolean),
            status,
            email: email.trim().toLowerCase(),
          }),
        })
      } catch (legacyErr) {
        console.error('Failed to sync to legacy groups list:', legacyErr)
      }

      setGroupName('')
      setEmail('')
      setDescription('')
      setGroupImage('')
      setSelectedEmails([])
      setStatus('Active')
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center py-6 px-4 w-full'>
      <Card className='w-full max-w-lg border border-border/80 bg-card/60 backdrop-blur-md shadow-xl rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20'>
        {/* Decorative background styling */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none' />

        <CardHeader className='pb-4 relative z-10'>
          <div className='flex items-center gap-3.5 mb-2'>
            <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs'>
              <Users2 className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-xl font-bold tracking-tight'>Create Group</CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Create a new group conversation channel.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='relative z-10'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='groupName' className='text-xs font-semibold text-muted-foreground/90'>
                Group Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='groupName'
                placeholder='e.g. Marketing Team, Weekend Sync'
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className='rounded-xl border-border/70 focus-visible:ring-primary h-10'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='email' className='text-xs font-semibold text-muted-foreground/90'>
                Email <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='e.g. group@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='rounded-xl border-border/70 focus-visible:ring-primary h-10'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='description' className='text-xs font-semibold text-muted-foreground/90'>
                Description
              </Label>
              <Textarea
                id='description'
                placeholder='Brief description of what this group chat is about...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='rounded-xl border-border/70 focus-visible:ring-primary min-h-[70px] resize-none'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='groupImage' className='text-xs font-semibold text-muted-foreground/90'>
                Group Image URL (Optional)
              </Label>
              <Input
                id='groupImage'
                placeholder='e.g. https://images.unsplash.com/... (or blank for default)'
                value={groupImage}
                onChange={(e) => setGroupImage(e.target.value)}
                className='rounded-xl border-border/70 focus-visible:ring-primary h-10'
              />
            </div>

            {/* Selecting Users / Members */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-muted-foreground/90'>
                Select Group Members <span className='text-rose-500'>*</span> (At least 1)
              </Label>

              {/* Removable chips section */}
              {selectedEmails.length > 0 && (
                <div className='flex flex-wrap gap-1.5 p-2 border border-border/60 bg-muted/10 rounded-xl mb-2 min-h-[44px] items-center transition-all duration-200'>
                  {selectedEmails.map((email) => {
                    const contact = contacts.find(c => c.email === email)
                    const label = contact ? contact.fullName : email
                    return (
                      <Badge
                        key={email}
                        variant='secondary'
                        className='bg-background hover:bg-muted text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-lg border border-border/80 flex items-center gap-1.5 transition-all duration-150 animate-in fade-in zoom-in-95'
                      >
                        <span>{label}</span>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleToggleUser(email)
                          }}
                          className='h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground transition-colors'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Searchable multi-select using Popover + Command */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between rounded-xl h-11 border-border/70 text-muted-foreground/80 hover:bg-accent/40 font-normal text-left text-xs bg-background/50 flex items-center'
                  >
                    <span className='truncate font-medium text-foreground/80'>
                      {selectedEmails.length === 0
                        ? 'Select group members...'
                        : `Selected ${selectedEmails.length} member${selectedEmails.length === 1 ? '' : 's'}`}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-55' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[350px] sm:w-[440px] p-0 rounded-2xl border-border shadow-2xl bg-card' align='start'>
                  <Command className='rounded-2xl'>
                    <CommandInput placeholder='Search contacts...' className='h-10 text-xs border-0 focus:ring-0' />
                    <CommandList className='max-h-[220px] p-1.5'>
                      <CommandEmpty className='text-xs text-muted-foreground py-6 text-center font-medium'>No contacts found.</CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact) => {
                          const isSelected = selectedEmails.includes(contact.email)
                          return (
                            <CommandItem
                              key={contact.id}
                              value={contact.fullName}
                              onSelect={() => {
                                handleToggleUser(contact.email)
                              }}
                              className='flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 data-[selected=true]:bg-primary/5 cursor-pointer text-xs font-semibold'
                            >
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-7 w-7 border border-border/60 rounded-lg'>
                                  <AvatarFallback className='rounded-lg text-[9px] font-bold bg-primary/10 text-primary'>
                                    {getDisplayNameInitials(contact.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col min-w-0'>
                                  <span className='truncate leading-tight'>{contact.fullName}</span>
                                  {contact.company && (
                                    <span className='text-[9px] text-muted-foreground font-normal truncate mt-0.5'>
                                      {contact.company}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={cn(
                                'h-4 w-4 rounded-md border border-muted-foreground/30 flex items-center justify-center transition-all duration-150',
                                isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent'
                              )}>
                                {isSelected && <Check className='h-3 w-3 stroke-[3]' />}
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='groupStatus' className='text-xs font-semibold text-muted-foreground/90'>
                Group Status <span className='text-rose-500'>*</span>
              </Label>
              <Select value={status} onValueChange={(val: 'Active' | 'Inactive') => setStatus(val)}>
                <SelectTrigger id='groupStatus' className='rounded-xl border-border/70 focus:ring-primary h-10'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='Active' className='focus:bg-primary/10 rounded-lg'>
                    Active
                  </SelectItem>
                  <SelectItem value='Inactive' className='focus:bg-primary/10 rounded-lg'>
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='pt-2'>
              <Button
                type='submit'
                className='w-full rounded-xl h-10 text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-250 active:scale-[0.98]'
                disabled={isLoading || selectedEmails.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
export default NewGroupForm
