import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { Palette } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()

  const userName = auth.user?.name || auth.user?.email?.split('@')[0] || 'User'
  const userEmail = auth.user?.email || 'user@example.com'
  const userAvatar = auth.user?.picture || '/avatars/01.png'

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='relative size-8 shrink-0 rounded-full p-0'
          >
            <Avatar className='size-8'>
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='w-64'
          align='end'
          forceMount
        >
          {/* ==========================================
              USER INFO
          ========================================== */}
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>
                {userName}
              </p>

              <p className='text-xs leading-none text-muted-foreground'>
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Theme Settings */}
          <ConfigDrawer
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Palette className='mr-2 h-4 w-4' />
                Theme Settings
              </DropdownMenuItem>
            }
          />

          <DropdownMenuSeparator />

          {/* Sign Out */}
          <DropdownMenuItem
            variant='destructive'
            onClick={() => setOpen(true)}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog
        open={!!open}
        onOpenChange={setOpen}
      />
    </>
  )
}