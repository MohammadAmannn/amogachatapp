export interface Message {
  id: string
  senderId: string // 'you' or recipient user ID
  senderName: string
  message: string
  timestamp: string
  isRead?: boolean
}

export interface UserProfile {
  id: string
  name: string
  username: string
  avatar: string
  bio?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: string
}

export interface Conversation {
  id: string
  name: string // If group, group name. If direct, recipient name.
  isGroup: boolean
  avatar?: string // If group
  memberIds: string[]
  recipientId?: string // If direct messaging
  messages: Message[]
  unreadCount: number
}

// Logged-in User profile card (simulating Clerk Auth)
export const CURRENT_USER: UserProfile = {
  id: 'you',
  name: 'Mohammad Aman',
  username: 'mohammad_aman',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  bio: 'Software Engineer | Frontend Developer',
  status: 'online',
}

// System Contacts (People)
export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Ateendra Pratap',
    username: 'ateendra_24',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    bio: 'Full Stack Developer | Creator of Realtime Chat NextJS',
    status: 'online',
  },
  {
    id: 'user_2',
    name: 'Sarah Chen',
    username: 'sarah_codes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    bio: 'Product Designer at Amoga App',
    status: 'online',
  },
  {
    id: 'user_3',
    name: 'Alex Johnson',
    username: 'alex_backend',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    bio: 'Golang & Rust enthusiast',
    status: 'offline',
    lastSeen: '2 hours ago',
  },
  {
    id: 'user_4',
    name: 'Emily Davis',
    username: 'emily_d',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    bio: 'QA Engineer and automation script writer',
    status: 'away',
  },
  {
    id: 'user_5',
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    bio: 'Developer Relations Manager',
    status: 'offline',
    lastSeen: '1 day ago',
  },
]

// Conversations list (initial dummy conversations)
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    name: 'Ateendra Pratap',
    isGroup: false,
    memberIds: ['you', 'user_1'],
    recipientId: 'user_1',
    unreadCount: 2,
    messages: [
      {
        id: 'm1_1',
        senderId: 'user_1',
        senderName: 'Ateendra Pratap',
        message: 'Hey Aman! Thanks for checking out the Realtime Chat template. Let me know if you need any database integrations.',
        timestamp: '2026-07-03T10:05:00Z',
      },
      {
        id: 'm1_2',
        senderId: 'you',
        senderName: 'Mohammad Aman',
        message: 'Wow, the layout is extremely sleek and responsive! I am building the mock UI right now.',
        timestamp: '2026-07-03T10:10:00Z',
      },
      {
        id: 'm1_3',
        senderId: 'user_1',
        senderName: 'Ateendra Pratap',
        message: 'Awesome! Did you configure the Clerk Auth simulator as well?',
        timestamp: '2026-07-03T10:11:00Z',
      },
      {
        id: 'm1_4',
        senderId: 'user_1',
        senderName: 'Ateendra Pratap',
        message: 'Also remember to keep the app bar themes integrated with the dashboard style!',
        timestamp: '2026-07-03T10:12:00Z',
      },
    ],
  },
  {
    id: 'conv_2',
    name: 'Sarah Chen',
    isGroup: false,
    memberIds: ['you', 'user_2'],
    recipientId: 'user_2',
    unreadCount: 0,
    messages: [
      {
        id: 'm2_1',
        senderId: 'you',
        senderName: 'Mohammad Aman',
        message: 'Hi Sarah, are the chat page mockups ready?',
        timestamp: '2026-07-02T15:00:00Z',
      },
      {
        id: 'm2_2',
        senderId: 'user_2',
        senderName: 'Sarah Chen',
        message: 'Yes! They look beautiful. Check the Figma workspace link under components.',
        timestamp: '2026-07-02T15:05:00Z',
      },
    ],
  },
  {
    id: 'conv_3',
    name: 'Dev Team Chat 🚀',
    isGroup: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
    memberIds: ['you', 'user_1', 'user_2', 'user_3'],
    unreadCount: 0,
    messages: [
      {
        id: 'mg_1',
        senderId: 'user_3',
        senderName: 'Alex Johnson',
        message: 'Just deployed the new backend router endpoint for message queries.',
        timestamp: '2026-07-03T09:00:00Z',
      },
      {
        id: 'mg_2',
        senderId: 'user_2',
        senderName: 'Sarah Chen',
        message: 'Perfect! I am adjusting the CSS parameters for the dark mode layout.',
        timestamp: '2026-07-03T09:02:00Z',
      },
      {
        id: 'mg_3',
        senderId: 'you',
        senderName: 'Mohammad Aman',
        message: 'Great job team, I will merge the UI templates shortly!',
        timestamp: '2026-07-03T09:15:00Z',
      },
    ],
  },
]
