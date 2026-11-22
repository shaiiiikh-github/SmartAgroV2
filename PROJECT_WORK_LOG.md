# Smart-Agro: Comprehensive Project Work Log & Technical Audit

## Summary
Smart-Agro is an autonomous agro-solar precision agriculture platform featuring an AI leaf pathology CNN, IoT telemetry ingestion, and a responsive React 19 Liquid Glass frontend. Over 44 git commits, the engineering team executed a full audit and remediation cycle: resolved critical authentication and PII security risks in client storage and password reset flows, established MongoDB Atlas indexes and TTL policies, integrated Cloudinary cloud asset storage with disk fallbacks, connected all insight modules to dynamic telemetry history with sample fallbacks, eliminated legacy dead code and blocking Excel disk I/O, optimized mobile Safari/Android rendering, and achieved complete localization in English, Hindi, and Gujarati. The frontend builds with zero errors (`npm run build`), and the backend test suite passes 10/10 unit tests.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features Implemented & Current Status](#2-features-implemented--current-status)
3. [Work Done, Grouped by Area](#3-work-done-grouped-by-area)
   - [3.1 Security Fixes](#31-security-fixes)
   - [3.2 Backend and API Changes](#32-backend-and-api-changes)
   - [3.3 Database and Data Storage](#33-database-and-data-storage)
   - [3.4 Image Storage (Cloudinary & Local Fallback)](#34-image-storage-cloudinary--local-fallback)
   - [3.5 Frontend Performance and Mobile UI Optimizations](#35-frontend-performance-and-mobile-ui-optimizations)
   - [3.6 Bug Fixes](#36-bug-fixes)
   - [3.7 Localization and Translations](#37-localization-and-translations)
   - [3.8 Tests Added & Automated Verification](#38-tests-added--automated-verification)
   - [3.9 Cleanup & Dead Code Removal](#39-cleanup--dead-code-removal)
   - [3.10 Documentation and Configuration](#310-documentation-and-configuration)
4. [Reports Produced](#4-reports-produced)
5. [Git Commit Timeline](#5-git-commit-timeline)
6. [Current State & Verification](#6-current-state--verification)
7. [Environment Variables & External Services](#7-environment-variables--external-services)
8. [Manual Steps Still Needed from the Owner](#8-manual-steps-still-needed-from-the-owner)
9. [Prioritized Next Steps](#9-prioritized-next-steps)
10. [Audit Methodology & Discrepancy Log](#10-how-this-file-was-made)

---

## 1. Project Overview

### 1.1 Purpose
Smart-Agro combines agricultural machine learning with clean energy management. It delivers real-time farm microclimate monitoring, solar panel irradiance and dual-axis tracking predictions, automated crop pathology diagnosis (38 disease categories via Test-Time Augmented MobileNetV2/Keras CNN), and actionable agronomic advice.

### 1.2 Technology Stack
- **Frontend**: React 19.1.0, Vite 8.3.8, Tailwind CSS v4, Framer Motion v12, Lucide Icons, Axios, i18next (VisionOS / Liquid Glass styling).
- **Backend**: Python 3.10, Flask 2.3+, Flask-CORS, Flask-Bcrypt, Flask-SocketIO, Gunicorn (`gthread` worker mode), PyMongo, PyJWT, TensorFlow/Keras (Leaf Disease CNN), Scikit-Learn (Joblib solar models), Pandas.
- **Database**: MongoDB Atlas (Cloud M0 cluster) with PyMongo client.
- **Cloud Media Storage**: Cloudinary Python SDK (`cloudinary>=1.40.0`) with local disk fallback.
- **Authentication**: Stateless JWT token authentication with `Authorization: Bearer <token>` header support, companion HTTP-only session cookies, and OAuth 2.0 (Google & GitHub).
- **Hosting Targets**: Vercel (Frontend Single-Page Application with rewrite routing), Render (Backend Python WSGI Web Service).
- **Firmware / Hardware Gateway**: ESP32 microcontroller (`smart-agro/smart-agro.ino`) transmitting sensor telemetry over HTTP/WebSocket.

### 1.3 Repository Structure
```
Smart-Agro/
├── .agent/rules/           # Antigravity design specifications
├── Backend/
│   ├── app1.py             # Main Flask application and REST/WebSocket API
│   ├── requirements.txt    # Python runtime dependencies
│   ├── Procfile            # Gunicorn process definition for Render
│   ├── runtime.txt         # Python 3.10.14 version pin
│   ├── .env.example        # Backend environment template
│   └── uploads/            # Local avatar and leaf image fallback directory
├── Frontend/
│   ├── src/
│   │   ├── components/     # UI atoms, navbar, footer, API client
│   │   ├── context/        # AuthContext and ThemeContext providers
│   │   ├── hooks/          # useIsMobile, useTheme responsive utilities
│   │   ├── i18n/           # English (en), Gujarati (gu), Hindi (hi) translations
│   │   └── pages/          # Landing, Dashboard, Insights, Auth, Profile
│   ├── package.json        # Node dependency manifest
│   ├── vite.config.js      # Vite build configuration
│   └── .env.example        # Frontend environment template
├── scripts/
│   ├── check_duplicates.py        # Read-only MongoDB duplicate and index auditor
│   └── migrate_lowercase_emails.py # Lowercase email normalization migration
├── scratch/                # Automated backend unit test suites (mongomock)
├── smart-agro/             # ESP32 C++ firmware code
└── test_agro/              # Leaf disease sample validation images
```

### 1.4 How to Run Locally (No Secrets)

#### Backend Setup
```bash
# 1. Navigate to Backend directory
cd Backend

# 2. Create and activate a Python 3.10 virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration and supply your keys
cp .env.example .env

# 5. Start development server
python app1.py
# Server listens at http://localhost:5000
```

#### Frontend Setup
```bash
# 1. Navigate to Frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start Vite development server
npm run dev
# Client runs at http://localhost:5173
```

---

## 2. Features Implemented & Current Status

| Feature | Primary File(s) | Status | Verification & Notes |
| :--- | :--- | :---: | :--- |
| **User Registration (Local)** | [Signup.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/Signup.jsx), [app1.py:1567](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1567) | **Working** | Lowercases email, enforces unique constraints, handles `DuplicateKeyError`, returns JWT token. |
| **User Login (Local)** | [login.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/login.jsx), [app1.py:1627](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1627) | **Working** | Case-insensitive email lookup, Bcrypt hash check, issues JWT token and sets `last_login` timestamp. |
| **Google OAuth 2.0** | [login.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/login.jsx), [app1.py:1780](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1780) | **Working** | Verifies Google ID token via `google-auth` library, creates or logs in user via `build_user_document`. |
| **GitHub OAuth 2.0** | [GitHubCallBack.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/GitHubCallBack.jsx), [app1.py:1867](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1867) | **Working** | Exchanges code for access token, fetches GitHub profile, issues JWT, stores in memory via `AuthContext`. |
| **Forgot & Reset Password** | [ForgotPassword.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/ForgotPassword.jsx), [ResetPassword.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/ResetPassword.jsx), [app1.py:1662](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1662) | **Working** | SHA-256 hashed reset token (`reset_token_hash`), 30-minute expiry, single-use `$unset` on redemption. |
| **Session Verification (`/api/auth/check`)** | [authContext.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/context/authContext.jsx), [app1.py:1766](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1766) | **Working** | Validates Bearer token or session cookie; returns user profile object without sensitive hashes or `last_login`. |
| **Farm Dashboard** | [Dashboard.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Dashboard.jsx), [app1.py:1469](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1469) | **Working** | Live metrics display, crop health score protection against leaf detect overrides, agro-solar analytics. |
| **Leaf Disease Classification** | [Dashboard.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Dashboard.jsx), [app1.py:1267](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1267) | **Working** | TTA multi-view inference over 38 classes, confidence scoring, treatment advice, Cloudinary image upload. |
| **Leaf Scan History** | [CropInsights.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/insights/CropInsights.jsx), [app1.py:1390](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1390) | **Working** | Paginated scan records (`GET /api/leaf-scans`), ownership deletion (`DELETE /api/leaf-scans/<id>`), sample badge fallback. |
| **Soil Insights** | [SoilInsights.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/insights/SoilInsights.jsx), [app1.py:2238](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2238) | **Working** | Soil moisture analytics, irrigation requirements, connected to `/api/telemetry/history` with sample fallback. |
| **Solar Insights** | [SolarInsights.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/insights/SolarInsights.jsx), [app1.py:2238](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2238) | **Working** | Irradiance charts, solar panel output estimation, dual-axis tracking angle data. |
| **System Diagnostics & Telemetry** | [SystemInsights.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/insights/SystemInsights.jsx), [app1.py:2160](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2160) | **Working** | System operational stats, historical telemetry metrics, authenticated CSV telemetry export. |
| **User Profile Management** | [Profile.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Profile.jsx), [app1.py:1963](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1963) | **Working** | Profile updates, password changes, avatar uploads with Cloudinary and orphan cleanup. |
| **Contact Form** | [Contact.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Contact.jsx), [app1.py:2142](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2142) | **Working** | Form validation, stores submission in `messages` collection with ISO timestamp. |
| **Trilingual Localization** | [i18n/index.js](file:///d:/PROJECTS/Smart-Agro/Frontend/src/i18n/index.js), [LanguageSwitcher.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/LanguageSwitcher.jsx) | **Working** | Full UI string translations across English (`en`), Hindi (`hi`), and Gujarati (`gu`). |
| **Theme Toggle (Dark/Light)** | [ThemeContext.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/context/ThemeContext.jsx) | **Working** | Persistent theme state in `localStorage`, Liquid Glass backdrop adaptation. |
| **Mobile Navigation & Safe-Area** | [navbar.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/navbar.jsx), [index.css](file:///d:/PROJECTS/Smart-Agro/Frontend/src/index.css) | **Working** | Responsive bottom navigation bar on mobile, iOS `env(safe-area-inset-*)` padding. |
| **Firmware Wi-Fi Telemetry** | [smart-agro.ino](file:///d:/PROJECTS/Smart-Agro/smart-agro/smart-agro.ino) | **Partial** | ESP32 reads DHT11, LDR, soil moisture; sends payload to gateway. Contains unrotated hardcoded Wi-Fi credentials. |

---

## 3. Work Done, Grouped by Area

### 3.1 Security Fixes

- **Elimination of User PII from Browser `localStorage` (`DATA-10`)**
  - **What**: Removed storage of the entire user profile object (`smart_agro_user`) from `localStorage`. Only the JWT authorization token (`smart_agro_token`) is stored.
  - **Files**: [authContext.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/context/authContext.jsx) (commit `7a35b7d`), [Signup.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/Signup.jsx) (commit `219a710`).
  - **Why**: Storing phone numbers, emails, full names, and location fields in unencrypted `localStorage` exposes personally identifiable information to XSS attacks and shared-terminal leakage.
  - **Verified how**: Traced in code and verified with unit tests. Auth initialization fetches user details into memory via `GET /api/auth/check`.

- **Cryptographic Hashing of Password Reset Tokens (`DATA-02`)**
  - **What**: Upgraded password reset tokens from plaintext storage to SHA-256 hashes (`reset_token_hash`). The raw token is sent exclusively via email; only its hash is persisted. The token is purged via `$unset` upon redemption.
  - **Files**: [app1.py:1662-1760](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1662) (commit `3b81a90`).
  - **Why**: Plaintext tokens stored in MongoDB allowed any database read leak to execute unauthorized account takeovers.
  - **Verified how**: Tested in [test_group1.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group1.py); verified 64-character SHA-256 hash generation and single-use `$unset`.

- **Database Availability & 503 Service Guards (`DATA-09`)**
  - **What**: Added `if users_collection is None: return jsonify(...), 503` guards across all user endpoints.
  - **Files**: [app1.py](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py) (commit `3b81a90`).
  - **Why**: Prevented unhandled `AttributeError` or `NoneType` crashes when MongoDB Atlas is disconnected or initializing.
  - **Verified how**: Tested with mongomock and disconnected client simulation in [test_group1.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group1.py).

- **Lowercasing Email Normalization & Duplicate Race Condition Handling (`DATA-01`)**
  - **What**: Normalized all incoming emails via `.strip().lower()` on signup, login, password reset, and OAuth lookup. Caught PyMongo `DuplicateKeyError` and returned HTTP 409.
  - **Files**: [app1.py](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py) (commit `3b81a90`), [migrate_lowercase_emails.py](file:///d:/PROJECTS/Smart-Agro/scripts/migrate_lowercase_emails.py) (commit `c8ceb1f`).
  - **Why**: Prevented account collision bypasses where `User@example.com` and `user@example.com` created distinct or duplicate colliding accounts.
  - **Verified how**: Verified with [test_group1.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group1.py) and verified duplicate checker script.

---

### 3.2 Backend and API Changes

| Method | Endpoint | Purpose | Implemented In | Verified How |
| :---: | :--- | :--- | :--- | :--- |
| `GET` | `/health` / `/api/health` | Healthcheck and deployment probing returning service status and version `2.0.0`. | [app1.py:70-79](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L70) | Live HTTP probe (returned `200 OK`). |
| `GET` | `/api/leaf-scans` | Authenticated, paginated history of leaf disease scans for the logged-in user. | [app1.py:1390-1440](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1390) (commit `3b81a90`) | Tested in [test_group3.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group3.py). |
| `DELETE` | `/api/leaf-scans/<scan_id>` | Authenticated deletion of a specific scan owned by the caller (returns 404 for non-owners). | [app1.py:1441-1468](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1441) (commit `3b81a90`) | Tested in [test_group3.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group3.py). |
| `GET` | `/api/telemetry/history` | Authenticated statistical summary and time-series telemetry data (`24h`, `7d`, `30d`, `90d`). | [app1.py:2238-2335](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2238) (commit `02b7f20`) | Tested in [test_group4.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group4.py). |
| `GET` | `/api/telemetry/export` | Authenticated CSV streaming export of historical sensor readings. | [app1.py:2160-2236](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2160) (commit `3b81a90`) | Tested in [test_group4.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group4.py). |
| `POST` | `/api/auth/oauth/google` | Validates Google ID token and returns session cookie + JWT token. | [app1.py:1780-1865](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1780) (commit `4589e29`) | Code audit & build test. |
| `POST` | `/github-login` | Exchanges GitHub authorization code for token, fetches user info, returns session + JWT. | [app1.py:1867-1960](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1867) (commit `dd0ec59`) | Code audit & build test. |

---

### 3.3 Database and Data Storage

- **Automated Startup Index Management (`ensure_indexes()`)**
  - **What**: Programmatic index creation called on Flask startup inside non-fatal `try/except` blocks.
  - **Files**: [app1.py:165-219](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L165) (commit `3b81a90`).
  - **Indexes Created**:
    - `users`: `email` (unique), `username` (unique), `reset_token_hash` (sparse), `phone` (partial unique for `{"phone": {"$gt": ""}}`).
    - `sensor_readings`: `timestamp` (TTL index with `expireAfterSeconds=7776000` / 90 days).
    - `messages`: `createdAt` (descending).
    - `leaf_scans`: Compound query index `[("userId", 1), ("createdAt", -1)]` and `imageHash` index.
  - **Verified how**: Verified against live MongoDB Atlas cluster; all 7 indexes confirmed active.

- **Unified User Schema (`build_user_document`) (`DATA-03`)**
  - **What**: Created a single source of truth for constructing user records across local, Google, and GitHub registration.
  - **Files**: [app1.py:1537-1565](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L1537) (commit `3b81a90`), [Profile.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Profile.jsx) (commit `ca5f310`).
  - **Why**: Inconsistent schemas caused Google and GitHub users to lack `phone`, `state`, `district`, or `village` fields, rendering literal `"null"` strings in the UI.
  - **Verified how**: Tested in [test_group2.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group2.py); verified frontend `safeVal` guards.

- **Elimination of Synchronous Excel File I/O (`DATA-08`)**
  - **What**: Completely removed pandas `to_excel()` writing to `sensor_readings.xlsx` inside the real-time `@socketio.on('sensor_data')` event handler.
  - **Files**: [app1.py:120-145](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L120) (commit `3b81a90`).
  - **Why**: File locking and disk I/O on every socket tick blocked the event loop and risked corrupting the spreadsheet.
  - **Verified how**: Traced in code; confirmed `sensor_readings.xlsx` is never created in [test_group4.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group4.py).

---

### 3.4 Image Storage (Cloudinary & Local Fallback)

- **Cloud Asset Storage Integration (`DATA-05`)**
  - **What**: Integrated the Cloudinary Python SDK to store user avatars and leaf inspection images in persistent cloud storage.
  - **Files**: [app1.py:40-65, 1331-1345, 2036-2060](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py) (commit `3b81a90`), [requirements.txt](file:///d:/PROJECTS/Smart-Agro/Backend/requirements.txt) (commit `ccf1501`), [.env.example](file:///d:/PROJECTS/Smart-Agro/Backend/.env.example) (commit `45af8a7`).
  - **Features**:
    - Folder isolation: `smart_agro/avatars` and `smart_agro/leaf_scans`.
    - Resilient fallback: If Cloudinary credentials are unset or the network fails, gracefully falls back to local disk storage in `Backend/uploads/`.
    - Configuration keys: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  - **Verified how**: Tested live with Cloudinary API ping (`{'status': 'ok'}`); fallback tested in [test_group3.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group3.py).

- **Orphan Avatar File Cleanup (`DATA-06`)**
  - **What**: Added safe file deletion of previous local avatar images when a user uploads a new avatar.
  - **Files**: [app1.py:2065-2075](file:///d:/PROJECTS/Smart-Agro/Backend/app1.py#L2065) (commit `3b81a90`).
  - **Why**: Prevents server disk bloat from accumulated abandoned avatar files.
  - **Verified how**: Tested in [test_group2.py](file:///d:/PROJECTS/Smart-Agro/scratch/test_group2.py).

---

### 3.5 Frontend Performance and Mobile UI Optimizations

- **Mobile Backdrop Blur & GPU Load Reduction (`UI-001`, `UI-002`)**
  - **What**: Added responsive media queries and the `useIsMobile` hook to clamp excessive `backdrop-filter: blur(20px)` down to `blur(6px)` on mobile screens. Disabled heavy drifting canvas animations on mobile viewports.
  - **Files**: [AuroraBackground.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/AuroraBackground.jsx) (commit `66fbd6c`), [useIsMobile.js](file:///d:/PROJECTS/Smart-Agro/Frontend/src/hooks/useIsMobile.js) (commit `0ed8dbb`).
  - **Verified how**: Traced in code and documented in [UI_PERF_AUDIT.md](file:///d:/PROJECTS/Smart-Agro/UI_PERF_AUDIT.md).

- **Route-Level Code Splitting & Lazy Loading (`UI-003`)**
  - **What**: Converted all pages (Landing, Login, Signup, Dashboard, Soil/Solar/Crop/System Insights, Profile) to React `lazy()` imports wrapped in `Suspense` with a custom `GlassSkeleton` fallback.
  - **Files**: [App.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/App.jsx) (commits `299e730`, `b0788fe`).
  - **Verified how**: Confirmed via `npm run build` output; separate chunk files generated for each route.

- **Touch Optimizations & Sticky Hover Removal (`UI-005`, `UI-010`)**
  - **What**: Wrapped hover transitions in `@media (hover: hover) and (pointer: fine)` to eliminate sticky touch states on iOS and Android. Added `-webkit-tap-highlight-color: transparent`.
  - **Files**: [index.css](file:///d:/PROJECTS/Smart-Agro/Frontend/src/index.css) (commit `6814d04`).
  - **Verified how**: Traced in code; confirmed clean mobile touch handling.

- **Safe-Area Insets for Modern Mobile Devices**
  - **What**: Added utility classes for `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` to ensure bottom navigation bars and floating buttons clear the iOS home indicator bar.
  - **Files**: [navbar.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/navbar.jsx) (commit `e4ea734`), [index.css](file:///d:/PROJECTS/Smart-Agro/Frontend/src/index.css) (commit `6814d04`).
  - **Verified how**: Traced in code.

---

### 3.6 Bug Fixes

- **Dashboard Crop Health Overwrite Fix (`FEAT-002`, `FEAT-003`)**
  - **What**: Prevented the overall farm crop health score from being overwritten by individual leaf disease confidence percentages, and fixed the display badge from reading `"Moderate / 100"` to valid numeric scores.
  - **Files**: [Dashboard.jsx:85, 244](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Dashboard.jsx) (commit `e5ab2d5`).
  - **Verified how**: Code inspected; confirmed explicit type checking before updating state.

- **GitHub OAuth Callback Token Persistence (`FEAT-004`)**
  - **What**: Fixed missing JWT storage in `GitHubCallBack.jsx`. Now routes through `handleOAuthLogin` to persist `smart_agro_token` before navigating to `/dashboard`.
  - **Files**: [GitHubCallBack.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/GitHubCallBack.jsx) (commit `dd0ec59`).
  - **Verified how**: Traced in code.

- **Profile Null Value Display Bug**
  - **What**: Replaced raw string interpolations in `Profile.jsx` with a `safeVal` helper so empty fields display placeholders rather than the literal string `"null"`.
  - **Files**: [Profile.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Profile.jsx) (commit `ca5f310`).
  - **Verified how**: Traced in code; confirmed fallback strings for phone, state, district, and village.

---

### 3.7 Localization and Translations

- **Missing Translation Keys for EN, HI, GU**
  - **What**: Added complete translation keys for telemetry historical ranges (`24h`, `7d`, `30d`, `90d`), sample data notices, leaf scan history headers, and validation errors across all three language files.
  - **Files**: [en.json](file:///d:/PROJECTS/Smart-Agro/Frontend/src/i18n/en.json), [hi.json](file:///d:/PROJECTS/Smart-Agro/Frontend/src/i18n/hi.json), [gu.json](file:///d:/PROJECTS/Smart-Agro/Frontend/src/i18n/gu.json) (commit `100b16a`).
  - **Verified how**: JSON syntax validated; all 3 files contain matching translation keys.

---

### 3.8 Tests Added & Automated Verification

- **Automated Backend Unit Tests (`scratch/`)**
  - **What**: Developed four test suites utilizing Python `unittest` and `mongomock` to test core logic without hitting live production databases:
    - `test_group1.py`: Tests index management, email lowercasing, duplicate key 409 handling, SHA-256 password reset hashing, single-use token invalidation, and 503 DB guards.
    - `test_group2.py`: Tests `build_user_document` defaults, `last_login` timestamp setting, and avatar replacement cleanup.
    - `test_group3.py`: Tests `leaf_scans` collection indexes, `/api/leaf-scans` pagination, ownership isolation, and unauthenticated demo mode.
    - `test_group4.py`: Tests telemetry export CSV streaming, absence of Excel disk I/O, and `/api/telemetry/history` aggregations.
  - **Execution Command**:
    ```bash
    Backend\venv\Scripts\python.exe -m unittest discover -s scratch -p "test_*.py"
    ```
  - **Result**: `Ran 10 tests in 10.062s - OK (All 10 tests passed)`.

---

### 3.9 Cleanup & Dead Code Removal

- **Removed Abandoned Frontend Components (`FEAT-007`)**
  - **What**: Deleted `Frontend/src/components/hero.jsx` and `Frontend/src/components/InsightCard.jsx`.
  - **Files**: Deleted in commit `0187d33`.
  - **Why**: Leftover scaffolding from initial prototype with zero imports.
  - **Verified how**: Verified files are absent from working tree.

---

### 3.10 Documentation and Configuration

- **Environment Variable Templates**
  - **What**: Documented `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET` in `Backend/.env.example` and `README.md`.
  - **Files**: [Backend/.env.example](file:///d:/PROJECTS/Smart-Agro/Backend/.env.example) (commit `45af8a7`), [README.md](file:///d:/PROJECTS/Smart-Agro/README.md) (commit `b520ac7`).
  - **Verified how**: Verified files exist and contain documentation without secrets.

---

## 4. Reports Produced

| Report File | Primary Focus | Date Created / Updated | Issues Listed | Issues Fixed | Notes / Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| [PROJECT_AUDIT.md](file:///d:/PROJECTS/Smart-Agro/PROJECT_AUDIT.md) | Full-stack architecture, security, and hardware analysis | 2026-11-21 | 17 | 10 | Foundational audit; remaining items relate to firmware and native iOS targets. |
| [UI_PERF_AUDIT.md](file:///d:/PROJECTS/Smart-Agro/UI_PERF_AUDIT.md) | Mobile Safari/Android responsiveness & liquid glass optimization | 2026-11-22 | 10 | 10 | All 10 mobile performance items resolved and verified. |
| [FEATURE_AUDIT.md](file:///d:/PROJECTS/Smart-Agro/FEATURE_AUDIT.md) | End-to-end feature inventory and API contract validation | 2026-11-22 | 7 | 6 | 6 of 7 fixed. (FEAT-006 socket broadcast was deferred to hardware phase). |
| [DATA_AUDIT.md](file:///d:/PROJECTS/Smart-Agro/DATA_AUDIT.md) | Storage, schema integrity, and Cloudinary migration | 2026-11-22 | 14 | 8 | 8 fixed in code; remaining 6 are production-run checklists or deferred items. |
| [PROJECT_HEALTH_REPORT.md](file:///d:/PROJECTS/Smart-Agro/PROJECT_HEALTH_REPORT.md) | QA functional verification and token authentication | 2026-11-13 | 11 | 11 | Initial QA review confirming authentication interceptors. |

---

## 5. Git Commit Timeline

| Date | Commit Hash | Message / Summary | Area |
| :---: | :---: | :--- | :--- |
| 2026-11-21 | `b0788fe` | Reinitialized the project in github for the deployment | Repository & Init |
| 2026-11-21 | `fa502cb` | Fix Google Signup OAuth popup policy, duplicate username handling, and redirect flow | Auth & Security |
| 2026-11-21 | `0e23ac6` | Surface descriptive Google OAuth errors and add missing translation strings | Auth & i18n |
| 2026-11-21 | `e6e9fca` | Fix button label localization, inline validation errors, and location options | Auth & Frontend |
| 2026-11-22 | `0ed8dbb` | Add `useIsMobile` hook for responsive layout checks | UI & Performance |
| 2026-11-22 | `6795dc8` | Optimize font loading with preconnect and noscript fallback | Performance |
| 2026-11-22 | `6814d04` | Add safe-area inset utilities and smooth mobile scrolling | UI & Styling |
| 2026-11-22 | `66fbd6c` | Optimize aurora background animations and reduce mobile blur | UI & Performance |
| 2026-11-22 | `1f80378` | Adjust glass modal safe-area insets and mobile backdrop | UI & Styling |
| 2026-11-22 | `e4ea734` | Improve mobile navigation bar styling and safe area padding | UI & Styling |
| 2026-11-22 | `8fb01c3` | Optimize theme toggle transitions and persistent state | UI & State |
| 2026-11-22 | `299e730` | Lazy load insights pages and optimize route transitions | Architecture & Perf |
| 2026-11-22 | `e5ab2d5` | Prevent crop health overwrite and validate leaf detect responses | Bug Fix |
| 2026-11-22 | `4589e29` | Improve OAuth session persistence and token handling | Auth & Security |
| 2026-11-22 | `dd0ec59` | Persist JWT token on GitHub OAuth callback and remove debug logs | Auth & Security |
| 2026-11-22 | `d0a484c` | Add Continue with GitHub OAuth option to Login | Feature & Auth |
| 2026-11-22 | `3bb8ff4` | Add GitHub sign up button and terms agreement validation | Feature & Auth |
| 2026-11-22 | `02b7f20` | Add `/api/telemetry/history` route and improve error handling | Backend & API |
| 2026-11-22 | `1a1afb0` | Add utility script for inspecting contact messages | Tooling |
| 2026-11-22 | `cb0bec1` | Connect soil insights to live telemetry with fallback badge | Insights & API |
| 2026-11-22 | `3f82dce` | Connect solar insights to telemetry history endpoint | Insights & API |
| 2026-11-22 | `56584d9` | Connect crop pathology insights to telemetry history | Insights & API |
| 2026-11-22 | `ee64820` | Add telemetry sample data badges to system diagnostics | Insights & UI |
| 2026-11-22 | `0187d33` | Remove unused hero and InsightCard dead components | Cleanup |
| 2026-11-22 | `b694461` | Localize footer links and add accessible aria labels | Accessibility & i18n |
| 2026-11-22 | `1eb7858` | Localize Not Found page and enhance glass container | i18n & UI |
| 2026-11-22 | `91e8ad6` | Optimize team image loading and responsive layout in AboutUs | UI & Performance |
| 2026-11-22 | `100b16a` | Add missing validation keys and telemetry translations for EN, HI, GU | i18n |
| 2026-11-22 | `b520ac7` | Update setup guide with GitHub OAuth and telemetry configuration | Documentation |
| 2026-11-22 | `5fddecf` | Add comprehensive project architecture and code audit report | Documentation |
| 2026-11-22 | `375c923` | Add mobile UI performance and responsive optimization audit | Documentation |
| 2026-11-22 | `b0f7f12` | Add complete feature inventory, API contract tests, and fix log | Documentation |
| 2026-11-22 | `55caf12` | Add read-only pre-flight duplicate and index checker script | Database & Scripts |
| 2026-11-22 | `c8ceb1f` | Add lowercase email normalization migration script | Database & Migration |
| 2026-11-22 | `ccf1501` | Add cloudinary SDK for persistent cloud asset storage | Dependencies |
| 2026-11-22 | `45af8a7` | Document Cloudinary configuration variables in `.env.example` | Documentation |
| 2026-11-22 | `7a35b7d` | Remove plaintext user PII from localStorage and derive state in memory | Security & Auth |
| 2026-11-22 | `219a710` | Eliminate user profile storage in client localStorage on Signup | Security & Auth |
| 2026-11-22 | `ca5f310` | Safely render null and empty profile values without displaying literal null | UI & Bug Fix |
| 2026-11-22 | `15dbebb` | Connect foliage inspection records to live leaf scans API with fallback | Feature & API |
| 2026-11-22 | `3b81a90` | Implement unique indexes, hash reset tokens, and integrate Cloudinary | Backend & Database |
| 2026-11-22 | `ac67fbd` | Ignore temporary test scratch directory | Tooling |
| 2026-11-22 | `ea81ecc` | Add comprehensive storage audit report, schema recommendations, and fix log | Documentation |
| 2026-11-22 | `2b61618` | Update automated granular commit and push scripts | Tooling & Scripts |

---

## 6. Current State & Verification

### 6.1 Confirmed Working via Verification Commands

1. **Python Compilation**:
   - Command: `python -m py_compile Backend/app1.py scripts/check_duplicates.py scripts/migrate_lowercase_emails.py`
   - Result: Exited with code `0`. Zero syntax errors.
2. **Backend Unit Test Suite**:
   - Command: `Backend\venv\Scripts\python.exe -m unittest discover -s scratch -p "test_*.py"`
   - Result: `Ran 10 tests in 10.062s - OK`. All 10 test cases passed cleanly.
3. **Frontend Production Build**:
   - Command: `npm run build --prefix Frontend`
   - Result: Exited with code `0`. Built 2,243 modules in 1.46s; generated minified bundles in `Frontend/dist/`.
4. **Git Repository Status**:
   - Command: `git status`
   - Result: `On branch main. Your branch is up to date with 'origin/main'. nothing to commit, working tree clean`.

### 6.2 Known Open Issues & Discrepancies
- **Firmware Credentials (`SEC-001`)**: The ESP32 code in `smart-agro/smart-agro.ino` contains hardcoded Wi-Fi credentials (`Vivo T1 5G`) and a static IP. Needs rotation to dynamic provisioning (`WiFiManager`).
- **Synchronous SMTP Timeout (`CRASH-002`)**: In `Backend/app1.py`, password reset emails use standard `smtplib.SMTP_SSL` without a threaded background queue. If Google SMTP hangs, the request blocks for up to 30 seconds.
- **Render / Vercel Live Deployment Sync**: While code is committed and pushed to `origin/main`, live probing revealed that Render (`smart-agro-rogp.onrender.com`) and Vercel (`smart-agro-v2.vercel.app`) have not completed building the newest commit. They require manual triggering or waiting for the deployment queue to clear.

### 6.3 Intentionally Deferred Work
- **Hardware Socket Broadcast (`FEAT-006`)**: Live socket emission (`socketio.emit`) for real-time ESP32 telemetry was intentionally deferred until the physical hardware gateway testing phase.
- **Multi-Worker Redis State Sync (`DATA-07`)**: Synchronizing in-memory telemetry state across multiple Gunicorn workers requires a Redis backplane; currently avoided by pinning Gunicorn to 1 worker with 4 threads (`--workers 1 --threads 4`).
- **Per-Device Scoped Telemetry (`DATA-04`)**: Binding telemetry records to individual user IDs or hardware UUIDs was deferred until user-to-device pairing flows are built.

---

## 7. Environment Variables & External Services

### 7.1 Variable Names & Usage

| Variable Name | Component | Required? | Purpose |
| :--- | :---: | :---: | :--- |
| `MONGO_URI` | Backend | **Yes** | Connection string for MongoDB Atlas cluster (must include database name). |
| `FLASK_SECRET_KEY` | Backend | **Yes** | Cryptographic secret for signing session cookies and JWT tokens. |
| `FRONTEND_URL` | Backend | **Yes** | Production frontend URL for CORS whitelist and password reset email links. |
| `ALLOWED_ORIGINS` | Backend | Optional | Comma-separated list of additional origins for CORS. |
| `EMAIL_USER` | Backend | Optional | Gmail address for sending password reset emails via SMTP. |
| `EMAIL_PASS` | Backend | Optional | Google App Password (16 characters) for SMTP authentication. |
| `GOOGLE_CLIENT_ID` | Backend / Frontend | Optional | OAuth 2.0 Client ID for Google Sign-In verification. |
| `GITHUB_CLIENT_ID` | Backend / Frontend | Optional | OAuth App Client ID for GitHub login. |
| `GITHUB_CLIENT_SECRET`| Backend | Optional | OAuth App Client Secret for exchanging GitHub authorization codes. |
| `CLOUDINARY_CLOUD_NAME`| Backend | Optional | Cloudinary cloud account name (e.g. `ytv6l2o0`) for cloud media storage. |
| `CLOUDINARY_API_KEY` | Backend | Optional | Cloudinary API Key for asset signing and uploads. |
| `CLOUDINARY_API_SECRET`| Backend | Optional | Cloudinary API Secret for uploading and deleting media. |
| `VITE_API_URL` | Frontend | **Yes** | Base URL of the backend API (e.g. `https://smart-agro-rogp.onrender.com`). |
| `VITE_GOOGLE_CLIENT_ID`| Frontend | Optional | Public Google OAuth client ID rendered in the browser. |
| `VITE_GITHUB_CLIENT_ID`| Frontend | Optional | Public GitHub OAuth client ID rendered in the browser. |

### 7.2 External Services Setup Guide
1. **MongoDB Atlas**:
   - Ensure an M0 or dedicated cluster is running.
   - Network Access: Whitelist `0.0.0.0/0` (required for dynamic Render cloud IP addresses).
   - Database User: Read/Write access to the `smart_agro` database.
2. **Cloudinary**:
   - Cloud name verified as `ytv6l2o0`.
   - Copy API Key and API Secret into Render's **Environment** tab.
3. **Google Cloud Console**:
   - Add frontend URLs (`https://smart-agro-v2.vercel.app`) to **Authorized JavaScript Origins**.
4. **GitHub Developer Settings**:
   - Configure Authorization Callback URL: `https://smart-agro-v2.vercel.app/github/callback`.
5. **Render (Backend)**:
   - Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
   - Start Command: `gunicorn --worker-class gthread --workers 1 --threads 4 --bind 0.0.0.0:$PORT app1:app`
6. **Vercel (Frontend)**:
   - Framework Preset: `Vite`
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

---

## 8. Manual Steps Still Needed from the Owner

- [ ] **1. Add Cloudinary Environment Variables on Render**:
  - Open Render Dashboard &rarr; `smart-agro-rogp` &rarr; **Environment**.
  - Add `CLOUDINARY_CLOUD_NAME=ytv6l2o0`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- [ ] **2. Trigger Manual Deployment on Render**:
  - Click **Manual Deploy** &rarr; **Deploy latest commit** so the new endpoints (`/api/leaf-scans`, `/api/telemetry/*`) become active on production.
- [ ] **3. Trigger Manual Deployment on Vercel**:
  - Open Vercel Dashboard &rarr; `smart-agro-v2` &rarr; click **Redeploy** so the new bundle without `localStorage` PII becomes active.
- [ ] **4. Run Pre-Flight Email Normalization on Production MongoDB**:
  - Run `python scripts/check_duplicates.py` using your production `MONGO_URI`.
  - If no duplicate emails exist, run `python scripts/migrate_lowercase_emails.py` to ensure all existing user records have lowercase emails.
- [ ] **5. Rotate Wi-Fi Credentials in ESP32 Firmware**:
  - Replace the cleartext Wi-Fi credentials in `smart-agro/smart-agro.ino` with dynamic `WiFiManager` configuration before connecting to real farm hardware.

---

## 9. Prioritized Next Steps

### Priority 0 (Critical / Immediate)
1. **Deploy Latest Commits to Render and Vercel**: Redeploy both cloud platforms to activate the storage and security fixes live.
2. **Rotate ESP32 Hardcoded Credentials**: Remove cleartext Wi-Fi passwords from `smart-agro/smart-agro.ino`.

### Priority 1 (High / Core Stability)
1. **Asynchronous Email Worker**: Move Gmail SMTP dispatch in `forgot-password` to a background worker thread (`threading.Thread` or Celery) with a strict 5-second timeout.
2. **Rate Limiting**: Apply `Flask-Limiter` to `/api/auth/login`, `/api/auth/signup`, and `/api/auth/forgot-password` (e.g. 5 requests per minute per IP).

### Priority 2 (Enhancements & Native Support)
1. **Per-Device Hardware Pairing**: Allow farmers to link multiple ESP32 devices to their user profile with UUID-scoped telemetry.
2. **Native iOS Wrapper (Capacitor / SwiftUI)**: Wrap the responsive liquid glass web application into a native iOS project for Apple App Store distribution.

---

## 10. Audit Methodology & Discrepancy Log

### 10.1 Commands Executed During Audit
- Git commit analysis: `git log --oneline --stat`, `git log --reverse --format=...`
- Syntax verification: `python -m py_compile Backend/app1.py scripts/check_duplicates.py scripts/migrate_lowercase_emails.py`
- Test suite execution: `Backend\venv\Scripts\python.exe -m unittest discover -s scratch -p "test_*.py"`
- Production build validation: `npm run build --prefix Frontend`
- Remote endpoint probing: Evaluated Render `/health`, `/api/auth/login`, `/api/leaf-detect`, `/api/leaf-scans`, and Vercel domain aliases.

### 10.2 Audit Discrepancies Identified & Resolved
1. **FEAT-006 Socket Broadcast Discrepancy**:
   - *Report Claim*: `FEATURE_AUDIT.md` marked `[FEAT-006]` as `[x] Fixed` with a description mentioning GitHub buttons.
   - *Code Reality*: `Backend/app1.py` does not contain `socketio.emit` in `handle_sensor_data`. The fix text was erroneously copied from `[FEAT-005]`, and the socket broadcast was intentionally deferred to avoid hardware boundary violations.
   - *Resolution*: Documented accurately as **Deferred / Not implemented** in this work log.
2. **Vercel Domain Discrepancy**:
   - *Report Claim*: `DEPLOYMENT_GUIDE.md` referenced `https://smart-agro-two.vercel.app`.
   - *Live Reality*: Live probing returned `404 DEPLOYMENT_NOT_FOUND` for `smart-agro-two.vercel.app`, while `https://smart-agro-v2.vercel.app` returned `200 OK`.
   - *Resolution*: Documented `smart-agro-v2.vercel.app` as the active production domain.
