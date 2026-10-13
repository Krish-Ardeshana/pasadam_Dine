# PRASADAM DINE — PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

## 1. Production Architecture Overview

PRASADAM DINE is a multi-tenant restaurant dining platform engineered with:
- **Frontend**: Next.js 16 (React 19, App Router, SSR/Static hybrid, Google `<model-viewer>` for 3D/AR).
  - Recommended Host: **Vercel** or **Docker Container** (Node 22 standalone runner).
- **Backend**: NestJS 12 (TypeScript, Express platform, Fast-glob/Multer, Swagger OpenAPI, Throttler).
  - Recommended Host: **Railway**, **Render**, **Fly.io**, or **AWS ECS/EC2 VPS** (persistent Node 22 process).
- **Database**: **MongoDB Atlas** (Replica Set with TLS 1.3, M0/M10 tier).
- **Asset Storage**: **Cloudinary** (Persistent CDN for high-resolution dish photography and `.glb` / `.gltf` 3D AR models).
- **DNS & CDN**: **Cloudflare** or provider-managed TLS/SSL with HSTS.

```
+-------------------------------------------------------------+
|                     Client Web Browser                      |
|           (Dine-In Customer Menu / Staff & Admin)           |
+------------------------------+------------------------------+
                               |
                   HTTPS (TLS 1.3 / Cloudflare)
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
+-----------------------+                 +-----------------------+
|   Next.js Frontend    |                 |    NestJS Backend     |
|   (Vercel / Docker)   |                 | (Railway / VPS Node)  |
|   Port 3000           |                 | Port 4000 (/api/v1)   |
+-----------+-----------+                 +-----------+-----------+
            |                                         |
            |  REST API Calls / Bearer JWT            |
            +---------------------------------------->|
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                                                   |
                    v                                                                   v
     +------------------------------+                                    +------------------------------+
     |        MongoDB Atlas         |                                    |          Cloudinary          |
     |   (Encrypted at rest,        |                                    |   (Persistent CDN Storage    |
     |    SCRAM-SHA-256 Auth)       |                                    |    Images & 3D GLB Models)   |
     +------------------------------+                                    +------------------------------+
```

---

## 2. Production Environment Variables Checklist

### Backend Configuration (`backend/.env` or Host Environment)

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Runtime environment mode | YES | `production` |
| `PORT` | Listening network port | YES | `4000` |
| `API_PREFIX` | Global route prefix | YES | `api/v1` |
| `FRONTEND_BASE_URL` | Canonical frontend domain for QR generation | YES | `https://menu.prasadamdine.com` |
| `CORS_ORIGINS` | Comma-delimited list of allowed browser origins | YES | `https://menu.prasadamdine.com,https://admin.prasadamdine.com` |
| `MONGODB_URI` | MongoDB Atlas replica-set connection string | YES | `mongodb+srv://user:pass@cluster.mongodb.net/prasadam_dine?retryWrites=true&w=majority` |
| `JWT_SECRET` | 256-bit cryptographically random token secret | YES | *(Generated 64-char hex)* |
| `JWT_EXPIRES_IN` | Access token time-to-live | YES | `1d` |
| `JWT_REFRESH_SECRET`| Independent 256-bit refresh token secret | YES | *(Generated 64-char hex)* |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token time-to-live | YES | `7d` |
| `SUPER_ADMIN_NAME` | Initial bootstrap Super Admin display name | YES | `Platform Super Admin` |
| `SUPER_ADMIN_EMAIL` | Initial bootstrap Super Admin email | YES | `admin@prasadamdine.com` |
| `SUPER_ADMIN_PASSWORD` | Strong password for bootstrap account (min 12 chars) | YES | *(Strong unique password)* |
| `MEDIA_STORAGE_DRIVER`| Active storage driver (`cloudinary` for production) | YES | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary account cloud identifier | YES | `prasadam-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary REST API Key | YES | `123456789012345` |
| `CLOUDINARY_API_SECRET`| Cloudinary REST API Secret | YES | `aBcDeFgHiJkLmNoPqRsTuVwXyZ` |
| `CLOUDINARY_FOLDER` | Root cloud asset folder path | NO | `prasadam_dine/production` |
| `THROTTLE_TTL` | Sliding rate limit window (seconds) | NO | `60` |
| `THROTTLE_LIMIT` | Maximum requests per IP per window | NO | `120` |

### Frontend Configuration (`frontend/.env` or Vercel Environment)

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | Full URL to backend API prefix | YES | `https://api.prasadamdine.com/api/v1` |
| `NEXT_PUBLIC_BACKEND_ORIGIN`| Backend origin for static image resolution fallback | YES | `https://api.prasadamdine.com` |

---

## 3. Cryptographic Secret Generation

Generate cryptographically secure 256-bit random keys for production JWT secrets using OpenSSL or Node.js crypto:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Security Rule**: Never reuse the access token secret for the refresh token secret.

---

## 4. Super Admin Bootstrap & Access Governance

1. On initial container startup, the backend checks for an existing `SUPER_ADMIN` role in MongoDB.
2. If absent, it bootstraps the user with credentials from `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
3. If already present, the bootstrap step is safely skipped (idempotent, no overwrite).
4. After initial login:
   - Immediately log in at `/login`.
   - Change your administrative password in the profile section.
   - Remove or rotate plain-text `SUPER_ADMIN_PASSWORD` from CI/CD runner secrets.

---

## 5. MongoDB Atlas Security & Least-Privilege Setup

1. **Database User**: Create a dedicated MongoDB user specifically for the application (e.g. `prasadam_app`).
2. **Role**: Assign `readWrite` permission restricted **only** to the `prasadam_dine` database. Do not assign `atlasAdmin` or `dbAdminAnyDatabase`.
3. **Network Access**:
   - For PaaS with static egress IPs (e.g., AWS EC2, VPS): Whitelist the specific static IP addresses.
   - For serverless or dynamic IP hosts (e.g., Railway, Render): Configure MongoDB Atlas VPC Peering or AWS PrivateLink if available, or restrict access via strong SCRAM-SHA-256 credentials with strict user scoping.
4. **TLS/SSL**: Atlas requires TLS by default. Ensure your connection string includes `retryWrites=true&w=majority&ssl=true`.

---

## 6. Cloudinary Storage Configuration

In production, ephemeral container file systems must **never** be used for dish photographs or 3D AR `.glb` models.
1. Sign up for Cloudinary (free tier supports up to 25 GB of managed assets).
2. Set `MEDIA_STORAGE_DRIVER=cloudinary`.
3. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. Uploaded `.glb` and `.gltf` models are stored with `resource_type: 'raw'` or `auto` on Cloudinary's global CDN and delivered via HTTPS with correct MIME types for `<model-viewer>` consumption.

---

## 7. Health Checks & Monitoring

The backend exposes a public health endpoint for load balancers and orchestrators:
- **Endpoint**: `GET /api/v1/health`
- **Response Format**:
  ```json
  {
    "status": "ok",
    "service": "prasadam_dine_backend",
    "version": "1.0.0",
    "timestamp": "2026-10-14T04:20:00.000Z",
    "uptime": 3600.45,
    "database": {
      "connected": true,
      "state": "connected"
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Database connected and service operational.
  - Degraded status returned if MongoDB connection state is dropped.

The frontend exposes a monitoring endpoint at `GET /api/health`.

---

## 8. HTTPS, Custom Domains & Reverse Proxy (Nginx / Cloudflare)

When hosting backend on a VPS with Nginx, use the following reverse proxy template with automatic Let's Encrypt SSL:

```nginx
server {
    listen 80;
    server_name api.prasadamdine.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.prasadamdine.com;

    ssl_certificate /etc/letsencrypt/live/api.prasadamdine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.prasadamdine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 9. Backup, Point-in-Time Recovery & Rollback Plan

### Database Backup
1. **Automated Atlas Snapshots**: Configure continuous 6-hour snapshots retained for 7 days in the Atlas UI.
2. **Manual Cold Backup via mongodump**:
   ```bash
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/prasadam_dine" --out=/backup/prasadam_dine_$(date +%F)
   ```
3. **Database Restore**:
   ```bash
   mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/prasadam_dine" --drop /backup/prasadam_dine_YYYY-MM-DD/prasadam_dine
   ```

### Application Rollback
1. **Frontend (Vercel)**: Instant rollback to any prior successful deployment directly from the Vercel Deployments dashboard with 0 downtime.
2. **Backend (Docker / PaaS)**: Tag all Docker images with semantic Git release tags (`git rev-parse --short HEAD`):
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d --remove-orphans
   ```
   To rollback: Re-deploy the previously tagged Docker image or checkout the prior Git tag.
