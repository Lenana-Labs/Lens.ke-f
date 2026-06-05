# Wild (Lens.ke) — Kenya's Premium Visual Archive 🦁

> A premium stock photography and visual archive platform dedicated to showcasing the untouched beauty of Kenya. It empowers local creators to share their visual stories while providing the world with world-class, authentic, and royalty-free imagery.

## 🌟 Features
- **Editorial Discovery:** A gorgeous, editorial-style homepage showcasing curated high-res imagery.
- **Contributor Dashboard:** A dedicated portal for photographers to track earnings, monitor photo performance, and securely upload new high-resolution files.
- **Infinite Scroll Search:** An uninterrupted, dynamically filtering search page for discovering photos by category, location, or tag.
- **Dynamic Image Modal:** A beautiful glassmorphic lightbox with quick download options and photographer details.
- **Robust Security:** Double-layer route protection, strict HTTP security headers, and XSS-resistant in-memory JWT storage.

## 🏗️ Architecture & Tech Stack

This project is a decoupled **Next.js (App Router)** frontend connecting exclusively to a **Django REST Framework (DRF)** backend (with a PostgreSQL database hosted on Supabase).

- **Framework:** Next.js 16
- **Styling:** Tailwind CSS (Vanilla utilities, no complex plugins)
- **Data Fetching:** SWR (for reactive, cached server data) + Axios
- **Authentication:** `djangorestframework-simplejwt` (In-memory access tokens, HttpOnly refresh tokens)
- **Fonts:** Next Font (Plus Jakarta Sans, Playfair Display)
- **Performance:** `@next/bundle-analyzer`, `next/image`

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed along with `pnpm` (the required package manager for this repo).
```bash
npm install -g pnpm
```

### 2. Environment Setup
Copy the example environment file and fill in the required Django backend URLs.
```bash
cp .env.example .env.local
```
*(Note: `.env.local` is ignored by Git to protect your secrets. Never commit it.)*

### 3. Installation & Running
Install all dependencies and start the Turbopack development server:
```bash
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Developer Guidelines

To maintain the security and performance standards of this repository, all developers and AI agents must strictly adhere to the project rules.

- **Frontend API Contract**: Read the [`docs/FRONTEND_API_IMPLEMENTATION.md`](./docs/FRONTEND_API_IMPLEMENTATION.md) for details on how Axios, SWR, and JWTs are wired together.
- **Source of Truth**: Read [`AGENTS.md`](./AGENTS.md) before making any architectural changes. It contains non-negotiable rules on Server vs. Client components, Next.js caching, and security boundaries.

### Core Rules Checklist
- ❌ **Never** store JWTs in `localStorage` or `sessionStorage`.
- ❌ **Never** use `useState` + `useEffect` for fetching server data (Use SWR).
- ✅ **Always** enforce route protection in BOTH `src/proxy.ts` AND the server-side layout.
- ✅ **Always** use trailing slashes for DRF API requests.

## 📄 License
All images uploaded to Wild are free to use for commercial and personal purposes under the Wild License. Please see the `/about` page for full usage guidelines. Code is proprietary unless otherwise specified.
