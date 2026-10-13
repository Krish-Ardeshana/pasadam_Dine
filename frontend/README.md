# PRASADAM_DINE — Frontend (Phase 2)
## Multi-Restaurant Cloud & AR Smart Dining Experience

Modern Next.js 16 (App Router) + TypeScript + Tailwind CSS web application built for **PRASADAM_DINE**. Connected directly to the NestJS backend on `http://localhost:4000/api/v1`.

---

## 1. Brand Identity & Strict 60:30:10 Light Palette

- **60% — Almond (`#EDE1CF`)**: Main page backgrounds, large neutral surfaces, content backdrops.
- **30% — Cordovan (`#90323D`)**: Sidebar navigation, secondary controls, badges, and brand highlights.
- **10% — Chocolate Cosmos (`#5E0B15`)**: Primary buttons, critical action triggers, active tabs, and headings.
- **Architectural 90-degree square borders**: Strict `rounded-none` / `border-radius: 0px` across all cards, inputs, tables, buttons, and modals.

---

## 2. Directory Structure & Key Modules

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Commercial SaaS Landing Page
│   │   ├── login/page.tsx               # Role-Aware Authentication Screen
│   │   ├── admin/                       # Super Admin Operations
│   │   │   ├── page.tsx                 # System Overview & Metrics
│   │   │   ├── restaurants/page.tsx     # Restaurant Approvals & Management
│   │   │   └── users/page.tsx           # Global User Registry
│   │   ├── dashboard/                   # Restaurant Management Console
│   │   │   ├── page.tsx                 # Restaurant Overview
│   │   │   ├── categories/page.tsx      # Category CRUD & Order Management
│   │   │   ├── dishes/page.tsx          # Dish Catalog (2D Images & 3D GLB/GLTF)
│   │   │   ├── media/page.tsx           # Digital Asset Library
│   │   │   ├── qr/page.tsx              # Dynamic QR Code Engine & Stand Printing
│   │   │   ├── staff/page.tsx           # Role-based Staff Management
│   │   │   └── settings/page.tsx        # Restaurant Profile & Contact Settings
│   │   └── r/[restaurantSlug]/          # Public Customer Dining Portal
│   │       ├── page.tsx                 # Mobile-first Digital Menu & Filtering
│   │       └── d/[dishSlug]/page.tsx    # 3D Model & WebXR / Quick Look AR Viewer
│   ├── components/
│   │   ├── 3d/
│   │   │   └── ModelViewer.tsx          # Google <model-viewer> AR Wrapper
│   │   ├── layout/
│   │   │   ├── DashboardShell.tsx       # Topbar, Restaurant Switcher & Drawer
│   │   │   └── Sidebar.tsx              # Role-aware Cordovan Sidebar Navigation
│   │   └── ui/
│   │       ├── Button.tsx               # 90-degree Action Buttons
│   │       ├── Card.tsx                 # Architectural Card, Badge & Modal
│   │       ├── Input.tsx                # Text Inputs & Select Dropdowns
│   │       └── Table.tsx                # Responsive Tables & Skeleton Loaders
│   ├── context/
│   │   ├── auth-context.tsx             # JWT Lifecycle & Multi-tenant Switching
│   │   └── toast-context.tsx            # Alert Notifications
│   └── lib/
│       ├── api.ts                       # Typed Backend API Client with Auto-Refresh
│       └── types.ts                     # Full Domain Contracts
```

---

## 3. Environment Configuration

Create a `.env.local` file in `frontend/` (sample provided in `.env.example`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:4000
```

---

## 4. Local Development

Run the frontend development server:

```bash
cd frontend
npm run dev
```

Frontend will be accessible at:
- **Web App**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login`
- **Super Admin**: `http://localhost:3000/admin`
- **Restaurant Console**: `http://localhost:3000/dashboard`
- **Public Customer Menu**: `http://localhost:3000/r/:restaurantSlug`

---

## 5. Verification Commands

```bash
# Linting
npm run lint

# Production Build
npm run build
```
