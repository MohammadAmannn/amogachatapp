export interface Contact {
  id: string
  ownerId: string
  contactUserId: string
  userUuid?: string
  fullName: string
  email: string
  mobile?: string
  company?: string
  status?: 'Active' | 'Inactive'
  avatarUrl?: string
  nickname?: string
  createdAt?: string
}
