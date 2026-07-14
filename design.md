# Design System & Aesthetics Guidelines

This document defines the colors, theme tokens, map basemap configurations, and typography rules of the application.

---

## 1. Color Palettes & UI Theming
* **Base Colors**: Slate/Zinc scale for backgrounds and cards.
* **Accent Colors**: Emerald/Emerald-Green (`#10b981`, `#059669`) for actions, active pins, and indicators.
* **Light Mode theme**: White cards (`#ffffff`) with subtle light borders (`border-border`), and slate foreground texts.
* **Dark Mode theme**: Sleek zinc backgrounds (`#09090b`), dark-tinted message bubbles (`#18181b`), and light foreground texts.

---

## 2. Map Aesthetics (CARTO Styles)
The application dynamically styles the location sharing map container based on the client's current theme class (`.dark`):

* **Light Mode Basemap**: 
  - Style: **CARTO Positron** (`light_all`).
  - Tile URL: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
  - Style Profile: A clean, desaturated, light grey map that keeps UI components and pins readable.
* **Dark Mode Basemap**: 
  - Style: **CARTO Dark Matter** (`dark_all`).
  - Tile URL: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
  - Style Profile: A dark grey, minimalist night style that matches dark layout configurations.

---

## 3. Typography & Font Styling
* **Primary Fonts**: `Inter` or `Outfit` loaded from Google Fonts for clean interface rendering.
* **Heading Styling**: Outlined hierarchy using semantic HTML headings (`h1` for page titles, `h2` for layouts).
* **Truncation & Ellipsis**: Strict usage of CSS `truncate` and `max-w-x` classes to prevent long place names and file strings from breaking component structures.
