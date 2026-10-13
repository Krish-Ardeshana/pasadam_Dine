# Prasadam Dine — API Endpoint Specification

**Base URL**: `http://localhost:4000/api/v1`  
**Swagger UI**: `http://localhost:4000/api/docs`

---

## 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new Restaurant Owner or Customer account |
| `POST` | `/auth/login` | Public | Authenticate user with email and password |
| `POST` | `/auth/refresh` | Public | Rotate access and refresh tokens |
| `GET` | `/auth/me` | Bearer Token | Retrieve current authenticated user profile & restaurant assignments |
| `POST` | `/auth/logout` | Bearer Token | Invalidate current refresh token |
| `POST` | `/auth/change-password` | Bearer Token | Update password |

---

## 2. Multi-Tenant Restaurants (`/api/v1/restaurants`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/restaurants` | SUPER_ADMIN, RESTAURANT_OWNER | Create/register a new restaurant |
| `GET` | `/restaurants` | SUPER_ADMIN, OWNER, MANAGER | List restaurants (filtered to assigned tenants) |
| `GET` | `/restaurants/:id` | Authenticated (Assigned) | Get restaurant administrative profile |
| `PATCH` | `/restaurants/:id` | SUPER_ADMIN, OWNER, MANAGER | Update restaurant details |
| `PATCH` | `/restaurants/:id/approval` | SUPER_ADMIN | Approve, reject, or suspend a restaurant |
| `PATCH` | `/restaurants/:id/owner` | SUPER_ADMIN | Transfer restaurant ownership |

---

## 3. Categories (`/api/v1/restaurants/:restaurantId/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/restaurants/:restaurantId/categories` | OWNER, MANAGER | Create new category |
| `GET` | `/restaurants/:restaurantId/categories` | Staff / Manager / Owner | List categories for restaurant |
| `PUT` | `/restaurants/:restaurantId/categories/reorder` | OWNER, MANAGER | Reorder categories display order |
| `GET` | `/restaurants/:restaurantId/categories/:id` | Staff / Manager / Owner | Get category details |
| `PATCH`| `/restaurants/:restaurantId/categories/:id` | OWNER, MANAGER | Update category |
| `DELETE`|`/restaurants/:restaurantId/categories/:id`| OWNER, MANAGER | Delete category safely (guarded against orphan dishes) |

---

## 4. Dishes & 3D AR Models (`/api/v1/restaurants/:restaurantId/dishes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/restaurants/:restaurantId/dishes` | OWNER, MANAGER | Create dish (validates category belongs to restaurant) |
| `GET` | `/restaurants/:restaurantId/dishes` | Staff / Manager / Owner | List & filter dishes (pagination, category, status) |
| `GET` | `/restaurants/:restaurantId/dishes/:id` | Staff / Manager / Owner | Get dish details |
| `PATCH`| `/restaurants/:restaurantId/dishes/:id` | OWNER, MANAGER | Update dish attributes |
| `PATCH`| `/restaurants/:restaurantId/dishes/:id/price` | OWNER, MANAGER | Update dish price (audited) |
| `PATCH`| `/restaurants/:restaurantId/dishes/:id/availability` | Staff / Manager / Owner | Toggle dish availability |
| `PATCH`| `/restaurants/:restaurantId/dishes/:id/publish` | OWNER, MANAGER | Publish or unpublish dish on public menu |
| `DELETE`|`/restaurants/:restaurantId/dishes/:id`| OWNER, MANAGER | Delete dish safely |

---

## 5. Media Upload & Asset Management (`/api/v1/restaurants/:restaurantId/media`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/restaurants/:restaurantId/media/upload` | OWNER, MANAGER | Upload dish image, 3D GLB model, or logo |
| `GET` | `/restaurants/:restaurantId/media` | OWNER, MANAGER | List uploaded media assets for restaurant |
| `DELETE`|`/restaurants/:restaurantId/media/:assetId`| OWNER, MANAGER | Delete media asset and cleanup external storage |
| `GET` | `/media/file/*` | Public | Stream local media files in offline development |

---

## 6. QR Code Generation (`/api/v1/restaurants/:restaurantId/qr`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/restaurants/:restaurantId/qr/generate` | OWNER, MANAGER | Generate Restaurant Menu or Dish Direct QR |
| `POST` | `/restaurants/:restaurantId/qr/:id/regenerate` | OWNER, MANAGER | Regenerate QR image preserving stable target URL |
| `GET` | `/restaurants/:restaurantId/qr` | Staff / Manager / Owner | List QR codes for restaurant |
| `GET` | `/restaurants/:restaurantId/qr/:id` | Staff / Manager / Owner | Get QR code details and Base64 image |
| `GET` | `/restaurants/:restaurantId/qr/:id/download` | Staff / Manager / Owner | Download binary PNG image file |

---

## 7. Public Menu & AR Dining (`/api/v1/public/restaurants`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/public/restaurants/:restaurantSlug` | Public | Public restaurant profile |
| `GET` | `/public/restaurants/:restaurantSlug/menu` | Public | Grouped restaurant menu by category |
| `GET` | `/public/restaurants/:restaurantSlug/categories` | Public | Active public categories |
| `GET` | `/public/restaurants/:restaurantSlug/dishes` | Public | Published dishes with 2D/3D asset URLs |
| `GET` | `/public/restaurants/:restaurantSlug/dishes/:dishSlug` | Public | Single dish with 3D AR asset metadata |

---

## 8. Users & Staff Administration (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | SUPER_ADMIN | List all users across the platform |
| `POST` | `/users/staff` | OWNER, MANAGER, SUPER_ADMIN | Create staff or manager assigned to restaurant |
| `POST` | `/users/assign-restaurant` | OWNER, SUPER_ADMIN | Assign existing user to restaurant |
| `DELETE`|`/users/:userId/assignments/:restaurantId` | OWNER, SUPER_ADMIN | Revoke restaurant assignment |
| `GET` | `/users/:id` | SUPER_ADMIN | User details |
| `PATCH`| `/users/:id` | SUPER_ADMIN | Update user status or role |

---

## 9. Platform Health (`/api/v1/health`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health status and MongoDB connection verification |
