export interface Group {
  id: string
  groupName: string
  description?: string
  groupImage?: string
  users: string[] // List of user names/emails/ids
  status: 'Active' | 'Inactive'
  email?: string
  userUuid?: string
  createdAt?: string
  updatedAt?: string
}
