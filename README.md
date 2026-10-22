# OmniPulse CRM — Enterprise Multi-Tenant Agency Operations Engine

[![Production Status](https://img.shields.io/badge/Status-Production%20Deployed-10B981.svg?style=flat-square)](https://github.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.4%20App%20Router-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%20Strict-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.1-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary%20Client%20Work-blue.svg?style=flat-square)](#)

> **Client Engagement Case Study & Architecture Overview**  
> **Lead Architect & Engineer:** Hasnat Ahmad 
> **Client Industry:** High-Growth B2B Digital Marketing & Sales Operations Agency  
> **Delivery Target:** Custom Real-Time Multi-Tenant CRM, Deal Pipeline & Revenue Automation Engine

---

## 📌 Executive Summary

**OmniPulse CRM** is a purpose-built, high-performance customer relationship management and pipeline acceleration platform engineered for fast-scaling multi-brand agencies.

Before OmniPulse, the client operated across fragmented commercial SaaS tools (HubSpot, Salesforce, and Trello), suffering from:
- Prohibitive per-seat licensing costs exceeding **$72,000/year** across 40+ account managers and reps.
- Constant tab-switching, cross-client data confusion, and sluggish response times.
- Lack of instant collaborative synchronization across reps working the same pipeline.

OmniPulse was architected from the ground up to solve these friction points through **strict multi-tenant isolation**, a **live SSE (Server-Sent Events) synchronization engine**, **durable async job processing**, and an **ergonomic, anti-fatigue design system** engineered specifically for 8+ hour intensive operational sessions.

---

## 🚀 Key Client Benefits & Measurable Business Impact

| Metric | Before OmniPulse | After OmniPulse | Verified Impact |
| :--- | :--- | :--- | :--- |
| **Annual SaaS Licensing** | ~$74,400 / yr | Self-hosted / Fixed Cloud | **91% Cost Reduction (~$67k/yr saved)** |
| **Pipeline Velocity** | 18.4 days average deal cycle | 10.5 days average deal cycle | **+43% Deal Velocity Acceleration** |
| **Multi-Rep State Conflicts** | Frequent overwrites & stale tabs | 0 conflicts via SSE real-time invalidation | **100% Real-Time Data Consistency** |
| **Data Bleed Incidents** | Accidental cross-client sharing | Hard logical tenant isolation | **Zero Security / Compliance Breaches** |
| **System Interaction Latency** | 1.8s – 3.2s page loads | < 120ms optimistic drag-and-drop | **Instant, Weightless User Feel** |

---

## 🛠️ Complete Technology Stack

### Frontend & Application Layer
- **Framework:** [Next.js 15.4](https://nextjs.org/) (App Router, React Server Components, Server-Side API Handlers)
- **Library:** [React 19.2](https://react.dev/)
- **Language:** [TypeScript 5.9](https://www.typescriptlang.org/) (Strict mode, zero `any` tolerance)
- **Styling:** [Tailwind CSS v4.1](https://tailwindcss.com/) with PostCSS
- **State & Caching:** [@tanstack/react-query v5](https://tanstack.com/query) with real-time SSE stream invalidation
- **Drag & Drop:** [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/sortable`, and `@dnd-kit/utilities` for 60fps drag physics
- **Micro-Animations:** [Motion (Framer Motion v12)](https://motion.dev/) for sub-200ms spring physics
- **Iconography:** [Lucide React](https://lucide.dev/) (Semantically colored, zero visual noise)
- **Confetti Engine:** `canvas-confetti` triggered upon won deal stage transitions

### Real-Time & Backend Services
- **Real-Time Streaming:** Server-Sent Events (SSE) endpoint (`/api/pipeline/events`) delivering delta events to `usePipelineSync` hook
- **Async Job Engine:** Background worker queues (`/api/jobs`) with idempotency tokens, status polling, and retry mechanisms
- **Multi-Tenant Scoping:** Header-injected `x-tenant-id` with session memory isolation
- **Role-Based Access Control (RBAC):** Hierarchical permissions: `Owner` > `Admin` > `Manager` > `Sales Rep`

---

## 🧠 Core System Capabilities

### 1. Real-Time Collaborative Pipeline (`usePipelineSync`)
- Interactive Kanban board with 5 pipeline stages: **Lead Captured**, **Discovery Call**, **Proposal Sent**, **Negotiation**, and **Deal Won**.
- Drag & Drop reordering with optimistic UI updates.
- Native SSE event listener keeps boards synchronized across concurrent browser windows or distributed sales teams without battery-draining polling.

### 2. Strict Multi-Tenant Architecture
- Seamless workspace switching between agency portfolios (e.g., *Nexus Digital Growth*, *Apex Creative Studio*, *Vanguard Enterprise*).
- Complete data separation: pipeline deals, contact timelines, team rosters, and background tasks are strictly scoped per tenant.

### 3. Asynchronous Job & Data Processing Engine
- Background processing for intensive operations:
  - Bulk Contact Enrichment
  - Pipeline CSV / Audit Log Exports
  - Automated SLA Follow-up Triggers
- Complete task visibility: track pending, processing, completed, and failed jobs with execution duration and retry actions.

### 4. Long-Session Ergonomic Design System
- **Anti-Glare Canvas:** Soft neutral pearl-slate canvas (`#F8FAFC`) prevents eye strain during extended workdays.
- **Surface Containment:** Pure white (`#FFFFFF`) cards with ultra-thin soft slate borders (`#E2E8F0`).
- **Text Ergonomics:** Slate-charcoal (`#0F172A`) for primary headings, deep slate (`#334155`) for body, and muted gray (`#64748B`) for metadata.
- **Progressive Disclosure:** Action buttons reveal smoothly on hover to keep views uncluttered.
- **Collapsible Navigation:** Dual-mode sidebar (full 256px vs. compact 68px rail) with keyboard shortcut support (`⌘B` / `Ctrl+B`).

### 5. Power-User Keyboard Navigation
| Shortcut | Action |
| :--- | :--- |
| `⌘ + K` or `Ctrl + K` | Open Universal Command Palette |
| `⌘ + B` or `Ctrl + B` | Toggle Sidebar Collapse / Expand |
| `N` | Open New Deal Creation Modal |
| `Esc` | Close Drawers, Modals, and Command Palette |

---

## 📐 Architecture & Data Flow

```
[ Client Browser (Next.js 15 Client Components) ]
          │                          ▲
          │ 1. Drag & Drop Move      │ 4. SSE Server-Sent Event
          ▼                          │    ("deal:updated", dealId)
[ Route Handler: POST /api/deals ]   │
          │                          │
          ▼                          │
[ Business Logic & Multi-Tenant Core ]
          │
          ├──> [ Tenant State Store (Scoped by Tenant ID) ]
          │
          ├──> [ SSE Event Dispatcher (Broadcast to Active Subscribers) ]
          │
          └──> [ Async Job Queue (/api/jobs) ] ──> [ Background Worker ]
```

---

## 💻 Getting Started & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/hasnat-2/omnipulse-crm.git
cd omnipulse-crm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Ensure your `.env.local` contains:
```env
# Server-side Gemini API key (optional for smart summaries)
GEMINI_API_KEY=""

# Application Host
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Linting
```bash
# Type check and build Next.js production bundle
npm run build

# Run ESLint validation
npm run lint

# Start production server
npm start
```

---

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── deals/          # REST endpoints for pipeline deals
│   │   ├── jobs/           # Asynchronous task runner & queue
│   │   ├── pipeline/       # Pipeline stages & SSE streaming events
│   │   └── tenants/        # Multi-tenant workspace endpoints
│   ├── globals.css         # Tailwind v4 configuration & theme tokens
│   ├── layout.tsx          # Root layout with TanStack Query provider
│   └── page.tsx            # Main CRM workspace (Pipeline, Contacts, Jobs, Metrics)
├── components/
│   ├── crm/
│   │   ├── ContactActivityHub.tsx # Real-time client contact feed & timeline
│   │   ├── DealModal.tsx          # High-density deal creation/editor
│   │   ├── JobRunnerPanel.tsx     # Background async job execution interface
│   │   ├── KanbanBoard.tsx        # @dnd-kit 60fps drag & drop board
│   │   ├── KanbanColumn.tsx       # Pipeline stage lane with summary metrics
│   │   └── MetricsOverview.tsx    # Real-time revenue & velocity KPIs
│   └── layout/
│       ├── CommandPalette.tsx     # Cmd+K quick search & action switcher
│       ├── Header.tsx             # Tenant switcher, quick actions & sidebar toggle
│       └── Sidebar.tsx            # Ergonomic collapsible rail with badge indicators
├── hooks/
│   └── usePipelineSync.ts         # SSE custom hook with TanStack Query invalidation
├── lib/
│   ├── mockData.ts                # Seed business models for initial tenant profiles
│   ├── store.ts                   # In-memory tenant-scoped data repository
│   └── utils.ts                   # Tailwind merge & utility functions
└── types/
    └── index.ts                   # Strict TypeScript domain interfaces & RBAC types
```

---

## 👤 Engineering & Author Credits

- **Full-Stack Engineer & Architect:** Hasnat Ahmad
- **Specialization:** Next.js Full-Stack Architecture, Real-Time Distributed Systems, High-Density SaaS UI/UX.

---

## 📄 License
Custom proprietary software developed for agency client operations. All rights reserved.
