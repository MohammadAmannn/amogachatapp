import { useState } from 'react'
import { Contact } from '../types/contact.types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Search,
  Building2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Loader2,
  Users,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { getDisplayNameInitials } from '@/lib/utils'
import { updateContactNickname, deleteContact } from '../repositories/contact-repository'

interface ContactListProps {
  contacts: Contact[]
  onRefresh: () => void
  onSelectContact?: (contact: Contact) => void
  onAddContactClick?: () => void
}

export function ContactList({ contacts, onRefresh, onSelectContact, onAddContactClick }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  // Form states for Editing Custom Nickname
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.fullName.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      (c.mobile && c.mobile.includes(q))
    )
  })

  // Open Edit popup
  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact)
    setEditName(contact.nickname || contact.fullName)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContact) return

    if (!editName.trim()) {
      toast.error('Please enter a nickname.')
      return
    }

    setIsSaving(true)
    try {
      const success = await updateContactNickname(editingContact.id, editingContact.ownerId, editName)
      if (!success) {
        throw new Error('Failed to update nickname')
      }

      toast.success('Nickname updated successfully!')
      setEditingContact(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update contact nickname.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingContact) return

    setIsDeleting(true)
    try {
      const success = await deleteContact(deletingContact.id, deletingContact.ownerId)
      if (!success) {
        throw new Error('Failed to delete contact')
      }

      toast.success('Contact deleted successfully!')
      setDeletingContact(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete contact.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='space-y-6 w-full px-1 py-2'>
      {/* Header Search Section (Only if user has contacts) */}
      {contacts.length > 0 && (
        <div className='flex items-center justify-between gap-4 bg-card/40 border border-border/70 p-4 rounded-2xl backdrop-blur-xs'>
          <div className='relative w-full max-w-md'>
            <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60' />
            <Input
              placeholder='Search contacts by name, company, email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary h-10 text-sm'
            />
          </div>
          <div className='text-xs font-semibold text-muted-foreground bg-muted/30 px-3.5 py-1.5 rounded-lg border border-border/50 shrink-0'>
            {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
          </div>
        </div>
      )}

      {/* Grid of Contacts */}
      {contacts.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-border/85 rounded-3xl text-center p-8 max-w-md mx-auto space-y-4 animate-in fade-in duration-300'>
          <div className='h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mx-auto'>
            <Users className='h-7 w-7 stroke-[1.5]' />
          </div>
          <div className='space-y-1.5'>
            <p className='font-bold text-base text-foreground'>No contacts yet</p>
            <p className='text-xs text-muted-foreground max-w-xs leading-normal mx-auto'>
              Add your first contact to start chatting.
            </p>
          </div>
          {onAddContactClick && (
            <Button
              onClick={onAddContactClick}
              className='bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-9 px-5 active:scale-95 transition-all mt-2 cursor-pointer shadow-md'
            >
              Add Contact
            </Button>
          )}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-border/80 rounded-2xl text-center p-8'>
          <div className='h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground/70 mb-3 shadow-xs mx-auto'>
            <Users className='h-6 w-6' />
          </div>
          <p className='font-bold text-base text-foreground'>No contacts found</p>
          <p className='text-xs text-muted-foreground max-w-xs mt-1 leading-normal mx-auto'>
            Try refining your search query.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact?.(contact)}
              className='group relative flex flex-col justify-between p-5 rounded-2xl border border-border/70 bg-card hover:bg-card/90 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 overflow-hidden cursor-pointer'
            >
              {/* Colored subtle border effect on hover */}
              <div className='absolute top-0 left-0 w-1.5 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300' />

              <div>
                <div className='flex items-start justify-between gap-3 mb-4'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-11 w-11 border border-border/60 shadow-xs rounded-xl'>
                      <AvatarFallback className='rounded-xl font-bold bg-primary/10 text-primary'>
                        {getDisplayNameInitials(contact.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <h4 className='font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors duration-200'>
                        {contact.fullName}
                      </h4>
                      {contact.company && (
                        <p className='text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5 truncate'>
                          <Building2 className='h-3 w-3 shrink-0 opacity-70' />
                          {contact.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={contact.status === 'Active' ? 'default' : 'secondary'}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                      contact.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {contact.status}
                  </Badge>
                </div>

                <div className='space-y-2.5 text-xs border-t border-border/50 pt-3.5 mb-2'>
                  <div className='flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors duration-150'>
                    <Mail className='h-3.5 w-3.5 shrink-0 opacity-70' />
                    <span className='truncate font-medium'>{contact.email}</span>
                  </div>
                  <div className='flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors duration-150'>
                    <Phone className='h-3.5 w-3.5 shrink-0 opacity-70' />
                    <span className='font-medium'>{contact.mobile}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end gap-1.5 border-t border-border/40 pt-3.5 mt-3 opacity-90 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200'>
                {onSelectContact && (
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectContact(contact)
                    }}
                    className='h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground/80 transition-colors'
                    title='Message Contact'
                  >
                    <MessageSquare className='h-4 w-4' />
                  </Button>
                )}
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenEdit(contact)
                  }}
                  className='h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground/80 transition-colors'
                  title='Edit Contact'
                >
                  <Edit2 className='h-4 w-4' />
                </Button>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeletingContact(contact)
                  }}
                  className='h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/80 transition-colors'
                  title='Delete Contact'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Popup Form Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent className='sm:max-w-[425px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Edit2 className='h-4 w-4 text-primary' />
              Edit Contact
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Update the contact display nickname and click save changes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='editName' className='text-xs font-semibold text-muted-foreground/90'>
                Nickname / Custom Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='editName'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder='Enter nickname'
                className='rounded-xl border-border/80 focus-visible:ring-primary h-10'
                required
              />
            </div>

            <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditingContact(null)}
                className='rounded-xl h-10 text-xs'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-10 text-xs font-semibold'
                disabled={isSaving}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingContact} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <DialogContent className='sm:max-w-[400px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-rose-600'>
              Delete Contact
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground mt-1'>
              Are you sure you want to delete <strong>{deletingContact?.fullName}</strong>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeletingContact(null)}
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
                'Delete Contact'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default ContactList
