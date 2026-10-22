# PRASADAM DINE — RENDER (BACKEND) & VERCEL (FRONTEND) DEPLOYMENT GUIDE

આ ગાઈડ મુજબ તમે તમારા **Backend ને Render** પર અને **Frontend ને Vercel** પર સરળતાથી deploy કરી શકશો.

---

## STEP 1: Backend Deployment on Render

### 1.1 Render પર Login / Register કરો
1. [dashboard.render.com](https://dashboard.render.com/) ખોલો.
2. તમારા **GitHub Account** થી Sign in કરો જેથી GitHub repositories સીધી link થઈ શકે.

### 1.2 New Web Service Create કરો
1. Render Dashboard માં **"New +"** બટન પર ક્લિક કરો -> **"Web Service"** પસંદ કરો.
2. **"Build and deploy from a Git repository"** પસંદ કરીને `Next` પર ક્લિક કરો.
3. તમારી repository શોધો: `pasadam_Dine` (અથવા `Krish-Ardeshana/pasadam_Dine`) અને **Connect** પર ક્લિક કરો.

### 1.3 Service Configuration સેટ કરો
નીચે મુજબની વિગતો ભરો:

| Field | Value |
|---|---|
| **Name** | `prasadam-dine-backend` (અથવા તમારી પસંદ મુજબ) |
| **Region** | `Singapore` (અથવા `Frankfurt` - India ની સૌથી નજીક) |
| **Branch** | `main` |
| **Root Directory** | `backend` *(⚠️ ખૂબ મહત્વનું: `backend` લખવું)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | `Free` |

> **Alternative (Docker):** જો તમે Docker વાપરવા માંગતા હો, તો Runtime માં `Docker` પસંદ કરી શકો છો (Render આપોઆપ `backend/Dockerfile` વાપરશે).

### 1.4 Environment Variables ઉમેરો
Render page માં નીચે સ્ક્રોલ કરો -> **"Advanced"** અથવા **"Environment Variables"** સેક્શન માં જાઓ અને **"Add Environment Variable"** કરીને નીચેના variables ઉમેરો:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `4000` | Backend port |
| `API_PREFIX` | `api/v1` | API prefix |
| `MONGODB_URI` | `mongodb+srv://24cs007_db_user:D1YNUSjeHuMENq3B@cluster0.junnzwj.mongodb.net/prasadam_dine?retryWrites=true&w=majority&appName=Cluster0` | તમારું MongoDB Atlas URI |
| `JWT_SECRET` | `prasadam_dine_jwt_secret_key_2026_super_secure` | JWT Access Token Secret |
| `JWT_EXPIRES_IN` | `1d` | Access Token Validity |
| `JWT_REFRESH_SECRET` | `prasadam_dine_jwt_refresh_secret_key_2026_super_secure` | Refresh Token Secret |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh Token Validity |
| `SUPER_ADMIN_NAME` | `Platform Administrator` | Admin Name |
| `SUPER_ADMIN_EMAIL` | `admin@prasadamdine.com` | Super Admin Login Email |
| `SUPER_ADMIN_PASSWORD` | `Admin@SecurePrasadam2026!` | Super Admin Password |
| `MEDIA_STORAGE_DRIVER` | `cloudinary` | Cloudinary Storage |
| `CLOUDINARY_CLOUD_NAME` | `dvvodc4i0` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `912914767468259` | Cloudinary Key |
| `CLOUDINARY_API_SECRET` | `HeHIR4Ca9KYRtC6XN3icJDfbUGQ` | Cloudinary Secret |
| `CLOUDINARY_FOLDER` | `prasadam_dine` | Upload Folder |
| `FRONTEND_BASE_URL` | `http://localhost:3000` *(Vercel deploy થયા પછી Vercel URL થી બદલવું)* | Frontend URL |
| `CORS_ORIGINS` | `http://localhost:3000` *(Vercel deploy થયા પછી Vercel URL ઉમેરવું)* | Allowed Origins |
| `PAYMENT_GATEWAY` | `razorpay` | Payment Gateway |
| `PAYMENT_MODE` | `test` | Razorpay Test Mode |

### 1.5 Deploy પર ક્લિક કરો
1. **"Create Web Service"** પર ક્લિક કરો.
2. Render build કરશે અને થોડી મિનિટોમાં `Live` થઈ જશે.
3. Render તમને ઉપર એક પબ્લિક URL આપશે (જેમ કે: `https://prasadam-dine-backend.onrender.com`).
4. બ્રાઉઝરમાં ચેક કરો: `https://<your-render-url>/api/v1/health`  
   જો `{"status":"ok", ...}` દેખાય, તો Backend સફળતાપૂર્વક Live થઈ ગયું છે!

---

## STEP 2: Frontend Deployment on Vercel

### 2.1 Vercel પર Login કરો
1. [vercel.com](https://vercel.com/) ખોલો.
2. તમારા **GitHub Account** થી Sign In કરો.

### 2.2 New Project Import કરો
1. Vercel Dashboard માં **"Add New..."** -> **"Project"** પર ક્લિક કરો.
2. તમારી GitHub repository પસંદ કરો: `pasadam_Dine` અને **Import** પર ક્લિક કરો.

### 2.3 Project Settings ગોઠવો
1. **Project Name:** `prasadam-dine` (અથવા તમારી પસંદ મુજબ)
2. **Framework Preset:** `Next.js` (આપોઆપ સિલેક્ટ થઈ જશે)
3. **Root Directory:** Edit પર ક્લિક કરો અને **`frontend`** પસંદ કરો. *(⚠️ ખૂબ મહત્વનું: Root directory `frontend` રાખવી)*
4. Build and Output Settings: Default રહેવા દો (`npm run build`, `.next`).

### 2.4 Environment Variables ઉમેરો
**"Environment Variables"** સેક્શન ખોલો અને નીચે મુજબ 2 variables ઉમેરો:

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<your-render-url>/api/v1` | તમારા Render backend નું URL + `/api/v1` |
| `NEXT_PUBLIC_BACKEND_ORIGIN` | `https://<your-render-url>` | તમારા Render backend નું Base URL |

*(ઉદાહરણ તરીકે: જો તમારું Render URL `https://prasadam-dine-backend.onrender.com` હોય, તો `NEXT_PUBLIC_API_URL` માં `https://prasadam-dine-backend.onrender.com/api/v1` મુકવું)*

### 2.5 Deploy પર ક્લિક કરો
1. **"Deploy"** બટન પર ક્લિક કરો.
2. Vercel 1-2 મિનિટમાં Next.js 16 build કરશે.
3. સફળતાપૂર્વક પૂરું થતાં તમને Vercel Live URL મળશે (જેમ કે: `https://prasadam-dine.vercel.app`).

---

## STEP 3: Connect Frontend URL into Backend Render CORS (Final Step)

હવે તમારું Frontend Vercel પર અને Backend Render પર છે. બંને વચ્ચે CORS connection માટે:

1. Render Dashboard માં તમારા `prasadam-dine-backend` માં જાઓ.
2. **"Environment"** ટેબ પર ક્લિક કરો.
3. નીચેના 2 variables અપડેટ કરો:
   - `FRONTEND_BASE_URL` = `https://<your-vercel-domain>.vercel.app`
   - `CORS_ORIGINS` = `https://<your-vercel-domain>.vercel.app,http://localhost:3000`
4. **"Save Changes"** પર ક્લિક કરો (Render આપમેળે નવો deploy કરી લેશે).

---

## STEP 4: Live Website Verification

1. બ્રાઉઝરમાં તમારું Vercel URL ખોલો (`https://<your-vercel-domain>.vercel.app`).
2. `/login` પેજ પર જાઓ.
3. લોગીન કરો:
   - **Email:** `admin@prasadamdine.com`
   - **Password:** `Admin@SecurePrasadam2026!`
4. સુપર એડમિન ડેશબોર્ડ ખુલી જશે!
5. પબ્લિક રેસ્ટોરન્ટ QR અને 3D ફૂડ મોડલ્સ લાઈવ ચાલશે!
