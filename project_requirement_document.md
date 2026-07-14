# Project Requirement Document (PRD)

This document outlines the core functional requirements and built features of the Realtime Chat Application.

---

## 1. Core Chat Messaging System
* **Direct Messages (1-to-1)**: Secured direct chat threads between two authenticated contacts.
* **Group Chats**: Shared conversation spaces supporting multiple members with creator control pipelines.
* **Realtime Syncing**: Instant message delivery powered by Supabase Postgres Realtime broadcast channels.
* **Delivery & Read Receipts**: Real-time status indicators (`sent` -> `delivered` -> `read`) updating instantly on client screens.
* **Offline Queuing & Buffering**: 
  - Messages are cached locally in IndexedDB if the device goes offline.
  - Automatically retries and syncs queued messages back to Supabase once an active network connection is restored.
* **Message Management**: Support for message replying, forwarding, deleting for self, and deleting for everyone.

---

## 2. Rich Media & Attachments
* **File Uploads**: Integration for sharing images, videos, and document file attachments.
* **Voice Messages**: Seamless voice note recording and playback with an integrated visualizer interface.
* **Document Previews**: Built-in viewing overlays for PDF and document attachments without navigating away from the chat interface.

---

## 3. Location Sharing System
* **Interactive Map Viewer**: Custom-built client-side Leaflet Map wrapper utilizing CARTO basemaps (Positron for light theme, Dark Matter for dark theme).
* **Location Options**:
  - **Current Location**: Shares static GPS coordinates.
  - **Live Location**: Shares coordinates that update in real-time on the map wrapper based on the device's moving location (with custom pulsating indicator animations).
* **Address Resolving (Reverse Geocoding)**:
  - An internal Next.js API geocoding proxy (`/api/geocode`) queries OpenStreetMap's Nominatim engine on the server side.
  - Resolves raw latitude/longitude coordinates into readable place names (e.g., "Civil Lines, Kanpur").
  - Throttled geocoding triggers limit API requests to once every 5 seconds to comply with rate limits.
  - Includes serverless caching of geocode requests for 1 hour to optimize performance.

---

## 4. Authentication & Security
* **Supabase Auth**: Email/password authentication and callbacks.
* **Security Rules & RLS**: Postgres Row Level Security (RLS) restricts message and contact access exclusively to conversation members.
* **Profile Integration**: Autocreated client profiles inside public schemas mapped from Supabase Authentication records.
