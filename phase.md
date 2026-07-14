# Project Development Phases

This document lists the phases of development and implementation routes for the chat application features.

---

## Phase 1: Authentication & Onboarding
* **Auth Forms**: User login, registration, and email verification.
* **Onboarding Schema**: Postgres profile record creation for new signups.
* **Security & Permissions**: Initial RLS tables policies to protect raw messages from foreign queries.

---

## Phase 2: Direct Messaging & Realtime Core
* **Direct Messages**: One-to-one messaging logic, repository mapping, and clean message UI layout.
* **Supabase Realtime**: Postgres change listeners mapping incoming inserts/updates directly into UI feeds.
* **Message Delivery Status**: Real-time tracking of sent, delivered, and read status markers.

---

## Phase 3: Media & Offline Capabilities
* **File Upload Managers**: Attachment loading pipelines for images, videos, and documents.
* **Offline IndexedDB Store**: Local buffering of sent messages when internet connection is lost.
* **Network Sync Worker**: Automatic sync queue flushing upon network recovery.
* **Voice Recording**: HTML Audio recorder and visualizer waveform player.

---

## Phase 4: Group Chats & Advanced Location Sharing
* **Group Management**: Multi-user channel creation, unread member counters, and group listing tabs.
* **Serverless Reverse Geocoder**: Next.js serverless API routes to resolve coordinates to place names securely.
* **Interactive Maps (Leaflet + CARTO)**: Light/dark responsive map container overlay with custom markers and close icon layouts.
