# Development Rules & Coding Guidelines

This document establishes the patterns, constraints, and boundaries that developers and AI pair programmers must follow in this codebase.

---

## 1. What to Use (Preferred Libraries & Patterns)
* **Tailwind CSS & CSS Variables**: Maximize standard utility patterns and CSS variables for theming.
* **Supabase Client SDK**: Use client-side and server-side Supabase client initializers (`createClient`) to run database mutations.
* **Serverless API Proxies**: Always implement third-party server-side API requests (such as reverse geocoding) inside Next.js `app/api/` routes to securely inject custom user-agent headers, bypass CORS, and add cache layers.
* **Lucide React Icons**: Use standard Lucide icons for all UI elements.
* **Clean Architecture Abstraction**: Code database requests inside repositories (`src/features/<feature>/repositories/`) rather than inline queries in UI components.

---

## 2. What to Avoid
* **Direct Geocoding Requests**: Do not call client-side Nominatim/OpenStreetMap APIs directly. This triggers HTTP 429 rate limit blocks and CORS failures.
* **Leaflet SSR Imports**: Do not import Leaflet globally in Next.js Server Components. Always load Leaflet map components dynamically with `ssr: false` to prevent Server-Side Rendering (SSR) reference failures (`window is not defined`).
* **Direct DOM Manipulation**: Avoid manual element querying or DOM edits; leverage React refs and class utilities.

---

## 3. Error Handling Boundaries
* **Graceful Map Fallbacks**: If the reverse geocoding API fails or returns coordinates, display raw coordinates formatted as `latitude, longitude` instead of crashing.
* **Local Offline Buffers**: Wrap all Supabase database writes in try/catch clauses. If a write fails due to network loss, enqueue the message in the IndexedDB offline sync manager.
* **Database Constraints**: Define calculated columns in PostgreSQL as `GENERATED ALWAYS AS` computed fields to maintain backward-compatibility with older database triggers.
* **Typing Checks**: Always compile with strict TypeScript settings (`--noEmit` compliance). Avoid mapping database parameters as loose implicit `any` types.
