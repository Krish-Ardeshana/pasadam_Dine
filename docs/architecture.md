# Prasadam Dine — Architecture Overview

## 1. System Vision
Prasadam Dine is an enterprise-grade multi-restaurant dining and digital menu platform engineered with:
- Multi-tenant data segregation preventing cross-restaurant IDOR.
- 3D Augmented Reality (AR) digital dining support via GLB/GLTF assets.
- Dine-in QR code generation (`/r/{restaurantSlug}` and `/r/{restaurantSlug}/d/{dishSlug}`).
- Role-Based Access Control (RBAC) with granular tenant assignment.
- Dual storage architecture: Cloudinary stream uploads with local development storage fallback.

---

## 2. Directory Structure
```
d:/Prasadam_Dine/
├── backend/                  # NestJS TypeScript Backend Application
│   ├── src/
│   │   ├── common/           # Enums, Guards, Decorators, Filters, Interceptors, DTOs
│   │   ├── config/           # Centralized configuration schema & validation
│   │   ├── database/         # Mongoose schemas, indexes, and DatabaseModule
│   │   ├── modules/
│   │   │   ├── auth/         # JWT auth, refresh token rotation, bcrypt hashing
│   │   │   ├── users/        # Staff management, tenant assignment, RBAC
│   │   │   ├── restaurants/  # Multi-tenant restaurant lifecycle & approval
│   │   │   ├── categories/   # Menu categories, safe delete, display reordering
│   │   │   ├── dishes/       # Dishes, pricing, availability, 2D/3D assets
│   │   │   ├── media/        # Cloudinary stream upload, local fallback, asset tracking
│   │   │   ├── qr/           # Dine-in menu & dish direct QR code engine
│   │   │   ├── public-menu/  # Public unauthenticated dining APIs
│   │   │   ├── audit/        # Security and operational change audit trail
│   │   │   ├── health/       # Database and service health check
│   │   │   └── bootstrap/    # Idempotent Super Admin initialization
│   │   ├── main.ts           # App bootstrap, Swagger, Global Prefix, Validation
│   │   └── app.module.ts     # Root module registering all providers and global guards
│   ├── test/                 # E2E integration test suites
│   ├── .env.example          # Environment variable template
│   └── package.json
├── frontend/                 # Client UI application (Phase 2)
└── docs/                     # Specifications and architectural documentation
```

---

## 3. Database Schema & Index Design

### Users (`users`)
- `name` (String, required)
- `email` (String, unique, indexed, lowercase)
- `passwordHash` (String, select: false)
- `role` (Enum: `SUPER_ADMIN`, `RESTAURANT_OWNER`, `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`, `CUSTOMER`)
- `restaurantAssignments` (ObjectId array ref `Restaurant`, indexed)
- `permissions` (String array)
- `accountStatus` (Enum: `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`)
- `refreshTokenHash` (String, select: false)
- Indexes: `{ email: 1 }` (unique), `{ role: 1, accountStatus: 1 }`

### Restaurants (`restaurants`)
- `name` (String, required)
- `slug` (String, unique, indexed, lowercase)
- `description`, `logoUrl`
- `address` (`{ street, city, state, postalCode, country }`)
- `contactDetails` (`{ phone, email, website }`)
- `ownerId` (ObjectId ref `User`, indexed)
- `approvalStatus` (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`)
- `isActive` (Boolean, default true)
- `settings` (`{ currency, defaultTaxRate, timezone, orderAcceptance, tableCount }`)
- Indexes: `{ slug: 1 }` (unique), `{ ownerId: 1 }`, `{ approvalStatus: 1, isActive: 1 }`, text index on `{ name, description }`

### Categories (`categories`)
- `restaurantId` (ObjectId ref `Restaurant`, indexed)
- `name` (String, required)
- `description`, `displayOrder` (Number, default 0)
- `status` (`ACTIVE`, `INACTIVE`)
- Indexes: `{ restaurantId: 1, displayOrder: 1 }`, `{ restaurantId: 1, name: 1 }` (unique per restaurant)

### Dishes (`dishes`)
- `restaurantId` (ObjectId ref `Restaurant`, indexed)
- `categoryId` (ObjectId ref `Category`, indexed)
- `name` (String, required)
- `slug` (String, required, lowercase)
- `description`, `price` (Number, min 0), `currency` (String)
- `imageUrls` (String array of 2D media references)
- `model3dUrl` (String, GLB/GLTF reference for AR view)
- `isAvailable` (Boolean, default true)
- `isPublished` (Boolean, default false)
- `dietaryFlags` (String array: `VEG`, `VEGAN`, `JAIN`, `GLUTEN_FREE`, etc.)
- Indexes: `{ restaurantId: 1, slug: 1 }` (unique), `{ restaurantId: 1, categoryId: 1 }`, `{ restaurantId: 1, isPublished: 1, isAvailable: 1 }`

### Media Assets (`media_assets`)
- `restaurantId` (ObjectId ref `Restaurant`, indexed)
- `dishId` (ObjectId ref `Dish`, optional)
- `mediaType` (`IMAGE`, `MODEL_3D`, `LOGO`, `OTHER`)
- `storageProvider` (`CLOUDINARY`, `LOCAL`)
- `fileUrl`, `publicId`, `mimeType`, `fileSize`, `originalFilename`
- `uploadedBy` (ObjectId ref `User`)
- Indexes: `{ restaurantId: 1, mediaType: 1 }`, `{ dishId: 1 }`, `{ restaurantId: 1, createdAt: -1 }`

### QR Codes (`qr_codes`)
- `restaurantId` (ObjectId ref `Restaurant`, indexed)
- `dishId` (ObjectId ref `Dish`, optional)
- `qrType` (`RESTAURANT_MENU`, `DISH_DIRECT`)
- `targetUrl` (String, required)
- `imageData` (Base64 data URI PNG)
- `status` (`ACTIVE`, `INACTIVE`)
- Indexes: `{ restaurantId: 1, qrType: 1, dishId: 1 }`, `{ targetUrl: 1 }`

### Audit Logs (`audit_logs`)
- `actorId` (ObjectId ref `User`, indexed)
- `restaurantId` (ObjectId ref `Restaurant`, indexed)
- `action` (String, e.g. `CREATE_DISH`, `UPDATE_PRICE`, `APPROVE_RESTAURANT`)
- `entityType` (String), `entityId` (String), `safeMetadata` (Object)
- `ipAddress`, `userAgent`, `createdAt`
- Indexes: `{ restaurantId: 1, createdAt: -1 }`, `{ actorId: 1, createdAt: -1 }`
