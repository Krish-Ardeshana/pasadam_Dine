# Prasadam Dine — Security Architecture & Tenant Isolation

## 1. Principles of Multi-Tenant Security

### Server-Enforced Boundaries
- **Never Trust Client Identifiers**: A `restaurantId` provided in URL parameters, request body, or query strings is never blindly trusted.
- **Assignment Verification**: On every request targeting a restaurant:
  1. `SUPER_ADMIN` has global authority across all tenants.
  2. Non-super-admins are verified against their `restaurantAssignments` or database ownership (`restaurant.ownerId`).
  3. If verification fails, a `403 Forbidden` response is returned immediately.

### Anti-IDOR (Insecure Direct Object Reference) Protection
- **Compound Scoping**: Every write, read, and delete operation on nested entities (categories, dishes, media assets, QR codes) scopes database queries to both `_id` AND `restaurantId`.
  ```typescript
  // Example Dish Lookup:
  const dish = await this.dishModel.findOne({
    _id: new Types.ObjectId(dishId),
    restaurantId: new Types.ObjectId(restaurantId),
  });
  ```
- **Foreign Cross-Referencing Defense**:
  - When creating a dish, the service verifies that the `categoryId` actually belongs to the specified `restaurantId`. A manager cannot attach dishes to categories belonging to a different restaurant.
  - When attaching media, the asset must belong to the caller's verified restaurant.

---

## 2. Authentication & Credential Protection
- **Password Security**: Passwords hashed with `bcryptjs` using 10 salt rounds.
- **JWT Architecture**:
  - Short-lived Access Token (1 day default).
  - Long-lived Refresh Token (7 days default) stored as a secure hash in the database.
  - Refresh token rotation on each refresh request.
  - Immediate invalidation on logout.
- **Zero Secret Leakage**:
  - `passwordHash` and `refreshTokenHash` marked `select: false` in Mongoose schemas.
  - Logging interceptor sanitizes passwords, tokens, and authorization headers.
  - No secrets in Git repositories.

---

## 3. Super Admin Bootstrap Model
- **No Public Privilege Escalation**:
  - The public registration endpoint (`/api/v1/auth/register`) permits only `RESTAURANT_OWNER` or `CUSTOMER` roles. Any attempt to pass `SUPER_ADMIN` in the payload is rejected or automatically downgraded.
- **Environment-Controlled Provisioning**:
  - Initial Super Admin is idempotently bootstrapped on server launch via `BootstrapService`.
  - Credentials are read from `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `.env`.

---

## 4. Media Storage Security
- **MIME & Extension Whitelisting**:
  - Images: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` (max 5MB).
  - 3D Models: Only `.glb` and `.gltf` binary formats (max 15MB).
- **Arbitrary Code Execution Defense**:
  - Files are uploaded to external Cloudinary CDN in production or written to dedicated subdirectories with randomized UUID names in local mode.
  - Executable extensions (`.exe`, `.sh`, `.php`, `.js`) are strictly rejected.
