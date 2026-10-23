# AR_DINE — Multi-Restaurant Dining Platform

Centralized platform supporting multi-restaurant dining operations with 3D Augmented Reality (AR) digital menus, QR codes, and role-based staff management.

---

## Repository Structure
```
Prasadam_Dine/
├── backend/       # Phase 1: NestJS 12, MongoDB/Mongoose, JWT, RBAC, 3D AR, QR Engine
├── frontend/      # Phase 2: Web Application (Customer AR dining & Restaurant Portal)
├── docs/          # Specifications, Architecture, Security, and API documentation
├── .env.example   # Global environment configuration template
└── .gitignore
```

---

## Phase 1 Implementation Summary

### Core Technologies
- **NestJS 12 + TypeScript (Node.js v24)**
- **MongoDB Atlas + Mongoose ODM**
- **JWT Authentication & Refresh Token Rotation**
- **Role-Based Access Control (RBAC)**: `SUPER_ADMIN`, `RESTAURANT_OWNER`, `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`, `CUSTOMER`
- **Multi-Tenant Isolation**: Server-side tenant assertion, compound queries, anti-IDOR verification
- **Media Uploads**: Cloudinary streaming upload with safe local file storage fallback for development
- **QR Code Engine**: Dine-in restaurant menu QR (`/r/{slug}`) and dish-specific QR (`/r/{slug}/d/{slug}`)
- **Public Menu APIs**: Safe, unauthenticated read-only APIs for customer menu browsing and 3D AR dish viewing
- **Online Dining Ordering & Real-Time KDS**: Complete table order placement, server-sent events (SSE) live kitchen stream, and status tracking
- **Secure Razorpay Test Checkout & Refunds**: Server-authoritative pricing in subunits (paise), cryptographic HMAC-SHA256 signature verification, idempotent webhook processing, and tenant-scoped refunds
- **Swagger / OpenAPI**: Live interactive documentation at `/api/docs`
- **Testing**: 81 automated unit, integration, and E2E tests verifying tenant isolation, auth, media, QR, orders, and payments

---

## Quick Start (Backend)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run start:dev
```

Server endpoints:
- **API Base**: `http://localhost:4000/api/v1`
- **Health Check**: `http://localhost:4000/api/v1/health`
- **Swagger UI**: `http://localhost:4000/api/docs`

---

## Documentation Links
- [Production Deployment & Operations Guide](docs/production-deployment-guide.md)
- [Architecture & Database Schemas](docs/architecture.md)
- [API Endpoint Specification](docs/api-specification.md)
- [Security & Tenant Isolation Whitepaper](docs/security-and-tenant-isolation.md)

