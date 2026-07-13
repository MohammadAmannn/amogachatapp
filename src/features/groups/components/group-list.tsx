import { useState } from 'react'
import { Group } from '../types/group.types'
import { Contact } from '@/features/contacts/types/contact.types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Search,
  Users,
  Edit2,
  Trash2,
  Loader2,
  Check,
  ChevronsUpDown,
  X,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { getDisplayNameInitials, cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth'

interface GroupListProps {
  groups: Group[]
  contacts: Contact[]
  onRefresh: () => void
  onSelectGroup?: (group: Group) => void
  onAddGroupClick?: () => void
}

export function GroupList({ groups, contacts, onRefresh, onSelectGroup, onAddGroupClick }: GroupListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null)

  // Form states for Editing
  const [editGroupName, setEditGroupName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editGroupImage, setEditGroupImage] = useState('')
  const [editSelectedUsers, setEditSelectedUsers] = useState<string[]>([])
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active')
  const [editEmail, setEditEmail] = useState('')  // ✅ Add email state
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const q = searchQuery.toLowerCase()
    return (
      g.groupName.toLowerCase().includes(q) ||
      (g.description && g.description.toLowerCase().includes(q))
    )
  })

  // Open Edit Dialog
  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group)
    setEditGroupName(group.groupName)
    setEditDescription(group.description || '')
    setEditGroupImage(group.groupImage || '')
    setEditSelectedUsers(group.users || [])
    setEditStatus(group.status)
    setEditEmail(group.email || '')  // ✅ Set email
    setPopoverOpen(false)
  }

  // Toggle user selection during editing
  const handleToggleUser = (userName: string) => {
    setEditSelectedUsers((prev) =>
      prev.includes(userName)
        ? prev.filter((u) => u !== userName)
        : [...prev, userName]
    )
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return

    if (!editGroupName.trim() || editSelectedUsers.length === 0) {
      toast.error('Please enter a group name and select at least one member.')
      return
    }

    setIsSaving(true)
    try {
      const currentUser = useAuthStore.getState().auth.user
      const userUuid = currentUser?.accountNo || currentUser?.id

      const response = await fetch(`/api/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: editGroupName.trim(),
          description: editDescription.trim(),
          groupImage: editGroupImage.trim() || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
          users: editSelectedUsers,
          status: editStatus,
          email: editEmail.trim().toLowerCase() || editingGroup.email,  // ✅ Include email
          user_uuid: userUuid || editingGroup.userUuid,  // ✅ Include user_uuid
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update group')
      }

      toast.success('Group updated successfully!')
      setEditingGroup(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update group.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/groups/${deletingGroup.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete group')
      }

      toast.success('Group deleted successfully!')
      setDeletingGroup(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete group.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='space-y-6 w-full px-1 py-2'>
      {/* Header Search Section (Only if user has groups) */}
      {groups.length > 0 && (
        <div className='flex items-center justify-between gap-4 bg-card/40 border border-border/70 p-4 rounded-2xl backdrop-blur-xs'>
          <div className='relative w-full max-w-md'>
            <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60' />
            <Input
              placeholder='Search groups by name or description...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary h-10 text-sm'
            />
          </div>
          <div className='text-xs font-semibold text-muted-foreground bg-muted/30 px-3.5 py-1.5 rounded-lg border border-border/50 shrink-0'>
            {filteredGroups.length} {filteredGroups.length === 1 ? 'Group' : 'Groups'}
          </div>
        </div>
      )}

      {/* Grid display of groups */}
      {groups.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-border/85 rounded-3xl text-center p-8 max-w-md mx-auto space-y-4 animate-in fade-in duration-300'>
          <div className='h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mx-auto'>
            <Users className='h-7 w-7 stroke-[1.5]' />
          </div>
          <div className='space-y-1.5'>
            <p className='font-bold text-base text-foreground'>No groups yet</p>
            <p className='text-xs text-muted-foreground max-w-xs leading-normal mx-auto'>
              Create your first group to start chatting with multiple people.
            </p>
          </div>
          {onAddGroupClick && (
            <Button
              onClick={onAddGroupClick}
              className='bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-9 px-5 active:scale-95 transition-all mt-2 cursor-pointer shadow-md'
            >
              Create Group
            </Button>
          )}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-border/80 rounded-2xl text-center p-8'>
          <div className='h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground/70 mb-3 shadow-xs mx-auto'>
            <Users className='h-6 w-6' />
          </div>
          <p className='font-bold text-base text-foreground'>No groups found</p>
          <p className='text-xs text-muted-foreground max-w-xs mt-1 leading-normal mx-auto'>
            Try refining your search query.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup?.(group)}
              className='group relative flex flex-col justify-between p-5 rounded-2xl border border-border/70 bg-card hover:bg-card/90 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 overflow-hidden cursor-pointer'
            >
              {/* Colored subtle border effect on hover */}
              <div className='absolute top-0 left-0 w-1.5 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300' />

              <div>
                <div className='flex items-start justify-between gap-3 mb-4'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-11 w-11 border border-border/60 shadow-xs rounded-xl'>
                      <AvatarImage src={group.groupImage} alt={group.groupName} />
                      <AvatarFallback className='rounded-xl font-bold bg-primary/10 text-primary'>
                        {getDisplayNameInitials(group.groupName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <h4 className='font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors duration-200'>
                        {group.groupName}
                      </h4>
                      <p className='text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5 truncate'>
                        <Users className='h-3.5 w-3.5 shrink-0 opacity-70' />
                        {group.users?.length || 0} {group.users?.length === 1 ? 'Member' : 'Members'}
                      </p>
                      {/* ✅ Show email and userUuid if present */}
                      {group.email && (
                        <p className='text-[10px] text-muted-foreground/60 truncate mt-0.5'>
                          {group.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={group.status === 'Active' ? 'default' : 'secondary'}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                      group.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {group.status}
                  </Badge>
                </div>

                <div className='space-y-2.5 text-xs border-t border-border/50 pt-3.5 mb-2'>
                  {group.description && (
                    <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium mb-1'>
                      {group.description}
                    </p>
                  )}
                  <div className='flex flex-wrap gap-1.5 pt-1.5'>
                    {group.users?.map((user, idx) => (
                      <Badge
                        key={idx}
                        variant='outline'
                        className='bg-background text-[10px] font-medium px-2 py-0.5 rounded-md text-muted-foreground border-border/80'
                      >
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end gap-1.5 border-t border-border/40 pt-3.5 mt-3 opacity-90 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200'>
                {onSelectGroup && (
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectGroup(group)
                    }}
                    className='h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground/80 transition-colors'
                    title='Open Group Chat'
                  >
                    <MessageSquare className='h-4 w-4' />
                  </Button>
                )}
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenEdit(group)
                  }}
                  className='h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground/80 transition-colors'
                  title='Edit Group'
                >
                  <Edit2 className='h-4 w-4' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeletingGroup(group)
                  }}
                  className='h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/80 transition-colors'
                  title='Delete Group'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Group Modal */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className='sm:max-w-[450px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Edit2 className='h-4 w-4 text-primary' />
              Edit Group
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Update the group information and member roster.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='editGroupName' className='text-xs font-semibold text-muted-foreground/90'>
                Group Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='editGroupName'
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className='rounded-xl border-border/80 focus-visible:ring-primary h-10'
                required
              />
            </div>

            {/* ✅ Add email field in edit */}
            <div className='space-y-1.5'>
              <Label htmlFor='editEmail' className='text-xs font-semibold text-muted-foreground/90'>
                Group Email <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='editEmail'
                type='email'
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className='rounded-xl border-border/80 focus-visible:ring-primary h-10'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='editDescription' className='text-xs font-semibold text-muted-foreground/90'>
                Description
              </Label>
              <Textarea
                id='editDescription'
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className='rounded-xl border-border/80 focus-visible:ring-primary min-h-[70px] resize-none'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='editGroupImage' className='text-xs font-semibold text-muted-foreground/90'>
                Group Image URL
              </Label>
              <Input
                id='editGroupImage'
                value={editGroupImage}
                onChange={(e) => setEditGroupImage(e.target.value)}
                className='rounded-xl border-border/80 focus-visible:ring-primary h-10'
              />
            </div>

            {/* Checkbox selector for Group members */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-muted-foreground/90'>
                Group Members <span className='text-rose-500'>*</span> (At least 1)
              </Label>

              {/* Removable chips section */}
              {editSelectedUsers.length > 0 && (
                <div className='flex flex-wrap gap-1.5 p-2 border border-border/60 bg-muted/10 rounded-xl mb-2 min-h-[44px] items-center transition-all duration-200'>
                  {editSelectedUsers.map((userName) => (
                    <Badge
                      key={userName}
                      variant='secondary'
                      className='bg-background hover:bg-muted text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-lg border border-border/80 flex items-center gap-1.5 transition-all duration-150 animate-in fade-in zoom-in-95'
                    >
                      <span>{userName}</span>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleToggleUser(userName)
                        }}
                        className='h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground transition-colors'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Searchable multi-select using Popover + Command */}
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={popoverOpen}
                    className='w-full justify-between rounded-xl h-11 border-border/70 text-muted-foreground/80 hover:bg-accent/40 font-normal text-left text-xs bg-background/50 flex items-center'
                  >
                    <span className='truncate font-medium text-foreground/80'>
                      {editSelectedUsers.length === 0
                        ? 'Select group members...'
                        : `Selected ${editSelectedUsers.length} member${editSelectedUsers.length === 1 ? '' : 's'}`}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-55' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[350px] sm:w-[380px] p-0 rounded-2xl border-border shadow-2xl bg-card' align='start'>
                  <Command className='rounded-2xl'>
                    <CommandInput placeholder='Search contacts...' className='h-10 text-xs border-0 focus:ring-0' />
                    <CommandList className='max-h-[220px] p-1.5'>
                      <CommandEmpty className='text-xs text-muted-foreground py-6 text-center font-medium'>No contacts found.</CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact) => {
                          const isSelected = editSelectedUsers.includes(contact.fullName)
                          return (
                            <CommandItem
                              key={contact.id}
                              value={contact.fullName}
                              onSelect={() => {
                                handleToggleUser(contact.fullName)
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
              <Label htmlFor='editGroupStatus' className='text-xs font-semibold text-muted-foreground/90'>
                Group Status <span className='text-rose-500'>*</span>
              </Label>
              <Select value={editStatus} onValueChange={(val: 'Active' | 'Inactive') => setEditStatus(val)}>
                <SelectTrigger id='editGroupStatus' className='rounded-xl border-border/80 focus:ring-primary h-10'>
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

            <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditingGroup(null)}
                className='rounded-xl h-10 text-xs'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-10 text-xs font-semibold'
                disabled={isSaving || editSelectedUsers.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirm */}
      <Dialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <DialogContent className='sm:max-w-[400px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-rose-600'>
              Delete Group
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground mt-1'>
              Are you sure you want to delete group <strong>{deletingGroup?.groupName}</strong>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeletingGroup(null)}
              className='rounded-xl h-10 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDeleteConfirm}
              className='rounded-xl h-10 text-xs font-semibold'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default GroupList