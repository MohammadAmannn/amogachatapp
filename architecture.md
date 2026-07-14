# Application Architecture & Flow

This document details the software architecture, repository pattern flow, directory structures, and the tech stack of the chat application.

---

## 1. Technology Stack
* **Framework**: Next.js (App Router, React 18, Server Components).
* **Language**: TypeScript (Strict type checking).
* **Database & BaaS**: Supabase (PostgreSQL database, Row Level Security (RLS) policies, Realtime Broadcast Channels, Supabase Auth).
* **Local Offline Cache**: IndexedDB (Local database storage for message queuing and network failover).
* **Maps & GIS**: Leaflet (Mapping library) + CARTO Basemaps (Voyager/Positron/Dark Matter raster tiles).

---

## 2. Directory Structure

```
src/
├── app/                  # Next.js routing and Page views
│   ├── api/              # Serverless API routes (e.g., geocoding proxy)
│   └── globals.css       # Global stylesheet and Tailwind tokens
├── components/           # Generic reusable UI primitives
│   ├── layout/           # Shared page wrappers and headers
│   └── ui/               # Base components (Button, Dialog, Map wrappers)
├── features/             # Feature-based modular directories
│   ├── auth/             # Authentication states, stores, and hooks
│   ├── chat/             # Core messaging feature module
│   │   ├── components/   # Chat components (ChatLayout, ChatWindow, LocationPicker)
│   │   ├── hooks/        # Feature hooks (useMessages, useRealtime, useLocation)
│   │   ├── managers/     # Queue and Sync managers (message-queue, offline-sync)
│   │   ├── repositories/ # Supabase abstraction adapters (message-repository)
│   │   ├── types/        # TypeScript interfaces (chat.types, location.types)
│   │   └── utils/        # Geolocation and IndexedDB helper methods
│   ├── contacts/         # Contacts manager module
│   └── groups/           # Group chats builder module
└── lib/                  # Shared helper libraries (supabase client, utils)
```

---

## 3. Data Flow Architecture

The feature layer is structured following clean architecture separating User Interfaces, Business logic Hooks, Sync managers, and Database Repositories:

```
[ UI React Components ] (ChatWindow, MessageBubble, LocationPicker)
        │
        ▼ (triggers action hooks)
[ React Custom Hooks ] (useMessages, useSendMessage, useLocation)
        │
        ├────────────────────────────────────┐
        ▼ (Online Mode)                      ▼ (Offline Mode)
[ DB Repositories ] (Supabase SDK)   [ Message Queue Manager ] (IndexedDB Store)
        │                                    │
        │                                    ▼ (on network reconnect)
        └────────────────────────────────────┘ (triggers sync payload)
```

---

## 4. Realtime Broadcast Flow

1. **Sender Writes**: Client calls `message-repository` to insert a message in Supabase.
2. **Supabase Realtime Trigger**: PostgreSQL inserts the row into `chat_messages`, and publishes the event to the `supabase_realtime` publication channel.
3. **Recipient Receives**: The client's `useRealtime` hook (listening on a user-specific realtime channel) receives the Postgres payload, maps the JSON attributes, and feeds the message directly to `onNewMessage`, updating the UI list instantly.
