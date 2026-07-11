import { useState } from 'react'
import { Plus, Users2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MOCK_USERS, UserProfile } from '../data/chat-mock'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getDisplayNameInitials } from '@/lib/utils'

interface CreateGroupProps {
  open: boolean
  onClose: () => void
  onCreateGroup: (name: string, memberIds: string[]) => void
}

export function CreateGroup({ open, onClose, onCreateGroup }: CreateGroupProps) {
  const [groupName, setGroupName] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim() || selectedUserIds.length === 0) return
    onCreateGroup(groupName.trim(), ['you', ...selectedUserIds])
    setGroupName('')
    setSelectedUserIds([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='sm:max-w-[425px] rounded-xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
            <Users2 className='h-5 w-5 text-primary' />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='group-name' className='text-xs font-semibold text-muted-foreground'>
              Group Name
            </label>
            <Input
              id='group-name'
              placeholder='e.g., Marketing Team, Weekend Plans'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className='rounded-lg focus-visible:ring-primary'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-xs font-semibold text-muted-foreground'>
              Select Members (at least 1)
            </label>
            <div className='max-h-[200px] overflow-y-auto space-y-2 pr-1'>
              {MOCK_USERS.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleToggleUser(user.id)}
                  className='flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-150'
                >
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getDisplayNameInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='text-sm font-semibold'>{user.name}</span>
                      <span className='text-[10px] text-muted-foreground'>@{user.username}</span>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={() => handleToggleUser(user.id)}
                    onClick={(e) => e.stopPropagation()}
                    className='rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className='pt-4 gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='rounded-lg text-xs'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!groupName.trim() || selectedUserIds.length === 0}
              className='rounded-lg text-xs font-semibold gap-1.5 shadow-sm'
            >
              <Plus className='h-3.5 w-3.5' />
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
