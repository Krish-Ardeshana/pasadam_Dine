# Prasadam Dine — Backend API

Backend API for **Prasadam Dine**, a centralized multi-tenant digital dining platform featuring 3D AR food models, QR dining, and role-based staff management.

---

## Tech Stack
- **Framework**: NestJS 12 (TypeScript, Node.js v24)
- **Database**: MongoDB Atlas / Mongoose ODM
- **Authentication**: JWT, Passport, Bcrypt password hashing, refresh token rotation
- **Authorization**: Role-Based Access Control (RBAC) + Tenant Isolation
- **API Documentation**: OpenAPI / Swagger (`/api/docs`)
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: Vitest unit, integration, and E2E suites
- **Media Storage**: Cloudinary with safe offline local storage fallback

---

## Getting Started

### 1. Prerequisites
- Node.js >= 20 (Tested on Node.js v24.20.0)
- npm >= 10
- MongoDB instance (local or MongoDB Atlas connection string)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your MongoDB URI:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prasadam_dine?retryWrites=true&w=majority
PORT=4000
API_PREFIX=api/v1
```

### 3. Installation
```bash
npm install
```

### 4. Running the Application
```bash
# Development server (with watch mode)
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

Once running:
- **API Base**: `http://localhost:4000/api/v1`
- **Health Check**: `http://localhost:4000/api/v1/health`
- **Swagger Documentation**: `http://localhost:4000/api/docs`

---

## Running Tests & Quality Verification

```bash
# Run unit & integration test suites
npm run test

# Run E2E test suite
npm run test:e2e

# Run Oxlint type-aware linter
npm run lint

# Build production bundle
npm run build
```

---

## Super Admin Provisioning
Super Admin is automatically and idempotently initialized on startup using credentials configured in `.env`:
```env
SUPER_ADMIN_NAME="Platform Administrator"
SUPER_ADMIN_EMAIL=admin@prasadamdine.com
SUPER_ADMIN_PASSWORD=Admin@SecurePrasadam2026!
```
Public registration endpoints prevent self-assignment of the `SUPER_ADMIN` role.

---

## Multi-Tenant Isolation
- Every manager/owner is constrained strictly to authorized restaurants in `restaurantAssignments`.
- Category, dish, media, and QR code operations scope queries to both entity ID and verified `restaurantId`.
- Automated test suites in `src/test/cross-tenant-isolation.e2e.spec.ts` prove that Restaurant A users cannot read, modify, or delete Restaurant B resources.
