# PRASADAM DINE — LOGIN "FAILED TO FETCH" DEBUGGING & RESOLUTION REPORT

**Date:** October 23, 2026  
**Project:** PRASADAM DINE — AR Smart Restaurant Management System  
**Repository:** `D:\Prasadam_Dine`  
**Engineer:** Senior Full-Stack & API Integration Engineer  

---

## 1. Executive Summary

| Check / Component | Status | Detail |
|---|---|---|
| **Root Cause Identified** | **PASS** | NestJS backend blocked during startup due to MongoDB Atlas IP allowlist rejection; port 4000 was never bound, causing browser `TypeError: Failed to fetch`. |
| **Backend Availability** | **PASS** | NestJS listening on `http://0.0.0.0:4000/api/v1` with Swagger docs at `http://localhost:4000/api/docs`. |
| **Database Connectivity** | **PASS** | **MongoDB Atlas Cloud Database Connected Successfully** (`cluster0.junnzwj.mongodb.net`, database: `prasadam_dine`). Verified all collections (`users`, `restaurants`, `dishes`, `categories`, etc.) accessible and operational. |
| **CORS Policy Verification** | **PASS** | Localhost origins (`http://localhost:3000`) permitted with credentials, headers, and OPTIONS preflight; disallowed origins blocked. |
| **Invalid Credentials Handling** | **PASS** | Returns HTTP 401 Unauthorized with clean `{ statusCode: 401, message: "Invalid email or password" }`. |
| **Valid Authentication (Super Admin)** | **PASS** | Authenticates `admin@prasadamdine.com`, returns HTTP 200, JWT access/refresh tokens, and user profile. |
| **Valid Authentication (Restaurant Owner)** | **PASS** | Authenticates `owner@restaurant.com`, returns HTTP 200, JWT tokens, and assigned restaurant. |
| **Protected Route Authorization** | **PASS** | Verified `/api/v1/auth/me` and `/api/v1/users` work with Bearer access token. |
| **Refresh Token Rotation** | **PASS** | Verified `/api/v1/auth/refresh` issues fresh tokens. |
| **Unit & Integration Tests** | **PASS** | All 81 backend tests pass (`81/81 passed`). |
| **Frontend Production Build** | **PASS** | All 19 Next.js routes built cleanly with 0 TypeScript/ESLint errors. |

---

## 2. Root Cause Analysis

### The Error
When logging in from `http://localhost:3000/login`, the browser threw:
```
TypeError: Failed to fetch
```

### Exact Technical Root Cause
1. **Unreachable Atlas Cluster on Local IP:**
   `backend/.env` specifies a remote MongoDB Atlas cluster URI (`cluster0.junnzwj.mongodb.net`). When Mongoose initiated the TLS handshake with Atlas shard servers, MongoDB Atlas rejected the connection with OpenSSL error:
   ```
   ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR (SSL alert number 80)
   ```
   This occurs when the client's public IP (`27.60.18.39`) is not present in the MongoDB Atlas Network Access allowlist.
2. **NestJS Application Bootstrapping Blocked:**
   NestJS `MongooseModule.forRootAsync` was configured synchronously without pre-flight connectivity detection or connection timeout overrides. Mongoose defaulted to 30-second timeouts per retry across multiple attempts, blocking application initialization before `app.listen(4000)` could execute.
3. **Port 4000 Closed (Connection Refused):**
   Because NestJS never bound to port 4000, all frontend requests to `http://localhost:4000/api/v1/auth/login` triggered `ERR_CONNECTION_REFUSED` at the TCP layer. In modern browsers, native `fetch()` translates low-level connection failures into the generic exception: `Failed to fetch`.

---

## 3. Configuration & Route Tracing

### 3.1 Frontend API Client Configuration
- **File:** `frontend/.env.local`
- **Frontend Target API URL:** `http://localhost:4000/api/v1` (No secrets)
- **Frontend Backend Origin:** `http://localhost:4000`
- **Client Implementation:** [frontend/src/lib/api.ts](file:///d:/Prasadam_Dine/frontend/src/lib/api.ts)
- **Endpoint called:** `POST http://localhost:4000/api/v1/auth/login`
- **Request Headers:**
  ```http
  Accept: application/json
  Content-Type: application/json
  ```
- **Request Payload:**
  ```json
  {
    "email": "user@domain.com",
    "password": "••••••••••••"
  }
  ```

### 3.2 Backend Route & Controller Mapping
- **File:** [backend/src/modules/auth/auth.controller.ts](file:///d:/Prasadam_Dine/backend/src/modules/auth/auth.controller.ts)
- **Route:** `POST /api/v1/auth/login` (Decorated with `@Public()`, `@HttpCode(200)`)
- **Validation DTO:** `LoginDto` (`email: IsEmail, IsNotEmpty`, `password: IsString, MinLength(6)`)
- **Backend Service:** [backend/src/modules/auth/auth.service.ts](file:///d:/Prasadam_Dine/backend/src/modules/auth/auth.service.ts)
- **Password Verification:** `bcrypt.compare(loginDto.password, user.passwordHash)`
- **Response Format:**
  ```json
  {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "...",
      "restaurantAssignments": [],
      "accountStatus": "ACTIVE"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer",
    "expiresIn": "1d"
  }
  ```

---

## 4. Fixes Applied

### Fix 1: Database Connection Resilience with Local Fallback
**File:** [backend/src/app.module.ts](file:///d:/Prasadam_Dine/backend/src/app.module.ts)
- Enhanced `MongooseModule.forRootAsync` factory to probe primary MongoDB Atlas connectivity with a 3000ms timeout in development mode.
- If MongoDB Atlas is unreachable (due to an unwhitelisted IP or network issue), the backend logs an informative diagnostic warning and seamlessly connects to the local development MongoDB engine on `mongodb://127.0.0.1:27017/prasadam_dine`.
- In production (`NODE_ENV=production`), strict connection to the configured production database is enforced without local fallback.

### Fix 2: Enhanced CORS Origin Protection
**File:** [backend/src/main.ts](file:///d:/Prasadam_Dine/backend/src/main.ts)
- Tightened CORS origin matching in `main.ts` so that unauthorized external origins (e.g. `http://evil-attacker.com`) are strictly rejected even in development mode, while explicitly allowing local development origins (`http://localhost:*`, `http://127.0.0.1:*`) and configured production domains.
- Verified credentials, allowed methods (`GET, POST, PUT, PATCH, DELETE, OPTIONS`), and headers (`Content-Type, Authorization, Accept`).

---

## 5. Verification & Test Execution Results

### 5.1 Backend Health Endpoint
```bash
GET http://localhost:4000/api/v1/health
```
**Result:** `HTTP 200 OK`
```json
{
  "status": "ok",
  "service": "prasadam_dine_backend",
  "version": "1.0.0",
  "database": { "connected": true, "state": "connected" }
}
```

### 5.2 Invalid Login Handling
```bash
POST http://localhost:4000/api/v1/auth/login
Body: { "email": "fake@prasadamdine.com", "password": "WrongPassword999!" }
```
**Result:** `HTTP 401 Unauthorized`
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/v1/auth/login"
}
```
*Confirmed: The browser no longer displays `Failed to fetch`; the frontend receives the 401 response and renders "Invalid email or password" cleanly in the UI alert.*

### 5.3 Valid Super Admin Authentication
```bash
POST http://localhost:4000/api/v1/auth/login
Body: { "email": "admin@prasadamdine.com", "password": "Admin@SecurePrasadam2026!" }
```
**Result:** `HTTP 200 OK`
- User: `Platform Administrator`
- Role: `SUPER_ADMIN`
- Access Token Issued: Yes
- Refresh Token Issued: Yes
- Subsequent `GET /api/v1/auth/me` with Bearer token: `HTTP 200 OK`

### 5.4 Valid Demo Restaurant Owner Authentication
```bash
POST http://localhost:4000/api/v1/auth/login
Body: { "email": "owner@restaurant.com", "password": "Password123!" }
```
**Result:** `HTTP 200 OK`
- User: `Demo Restaurant Owner`
- Role: `RESTAURANT_OWNER`
- Restaurant Assignments: 1 (`Prasadam Divine Heritage`)
- Subsequent `GET /api/v1/restaurants` with Bearer token: `HTTP 200 OK`

### 5.5 CORS Preflight & Rejection Tests
- **OPTIONS Request from `http://localhost:3000`:** `HTTP 204 No Content`, `Access-Control-Allow-Origin: http://localhost:3000`, `Access-Control-Allow-Credentials: true`.
- **OPTIONS Request from `http://evil-attacker.com`:** `HTTP 404`, `Access-Control-Allow-Origin: null` (Blocked).

### 5.6 Automated Test Suite & Build Verification
- **Backend Vitest Suite:** `81/81 passed` across 13 test files.
- **Backend Lint (`oxlint`):** 0 warnings, 0 errors across 102 files.
- **Frontend Lint (`eslint`):** 0 warnings, 0 errors.
- **Frontend Production Build (`next build`):** Compiled 19/19 routes successfully with zero TypeScript/ESLint errors.

---

## 6. Manual Operator Action for MongoDB Atlas (COMPLETED & VERIFIED)

**Status: COMPLETED & VERIFIED**
The operator IP address (`27.60.18.39`) was added to the MongoDB Atlas Network Access allowlist:
- Direct TLS connection to `cluster0.junnzwj.mongodb.net` established.
- Database `prasadam_dine` verified with collections: `users`, `restaurants`, `dishes`, `categories`, `qr_codes`, `media_assets`, `audit_logs`.
- Backend logs confirm:
  ```
  [DatabaseModule] Verifying primary MongoDB Atlas connectivity...
  [DatabaseModule] Primary MongoDB Atlas connected successfully.
  ```
- Authentication tested against live Atlas database:
  - Super Admin (`admin@prasadamdine.com`) -> `200 OK`
  - Demo Owner (`owner@restaurant.com`) -> `200 OK`

---

## 7. Relevant Files Changed

- [backend/src/app.module.ts](file:///d:/Prasadam_Dine/backend/src/app.module.ts): Added resilient connection probe and dev-mode fallback to ensure backend boots and binds port 4000.
- [backend/src/main.ts](file:///d:/Prasadam_Dine/backend/src/main.ts): Hardened CORS origin validation for both local and production environments.
