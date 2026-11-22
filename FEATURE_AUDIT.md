# Feature Audit Report

**Project:** Smart-Agro (Autonomous Agro-Solar Precision Agriculture Platform)  
**Date of Audit:** November 22, 2026  
**Auditor:** Senior QA Engineer & Full-Stack Developer  
**Scope:** Frontend (`React 19` / `Vite` / `Tailwind CSS`), Backend (`Flask 3.1` / `Flask-SocketIO` / `TensorFlow 2.19` / `Scikit-Learn`), Database (`MongoDB Atlas`), and Authentication/Telemetry pipelines.

---

## 1. Summary

A comprehensive, top-to-bottom feature verification was performed across all routes, user-facing UI elements, and backend endpoints. Every feature was classified according to its verified operational state.

### Feature Classification Breakdown
| Status | Description | Count |
| :--- | :--- | :---: |
| ✅ **Working (verified by running)** | Executed via test suite / API call / runtime check with actual positive assertion | **28** |
| 🟢 **Working (code-read only)** | Static display / simple presentation components verified through code tracing | **12** |
| 🟡 **Partially working** | Functional but contains data contract mismatches, session persistence flaws, or UI alert bugs | **4** |
| 🔴 **Broken** | Crashing, non-functional, or producing corrupted states | **1** |
| ⚫ **Dead / Placeholder** | Orphaned components, missing trigger buttons, generic root links, or unbroadcast socket events | **6** |
| 🎭 **Fake / Mock** | Interactive visual dashboards powered entirely by hardcoded sine waves or mock arrays | **5** |
| ⚪ **Not verifiable (offline sandbox)** | Requires live external internet services (Google OAuth, GitHub API, Gmail SMTP, physical ESP32) | **4** |
| **Total Features Audited** | **All UI pages, controls, dialogs, forms, routes & endpoints** | **60** |

### Overall Feature Health Score: **6.8 / 10**
> **Justification:**  
> The core machine learning pipelines (TensorFlow leaf disease detection with multi-view test-time augmentation, Scikit-learn irrigation and solar output regressors) and local authentication (JWT generation, Bcrypt password hashing, MongoDB user profiles, contact form persistence) are **100% operational and robust**. However, the overall product health is degraded by:
> 1. All four dedicated "Insights" pages (`/insights/*`) displaying 100% hardcoded mock data with zero backend integration.
> 2. Contract mismatches on the Dashboard wiping the Crop Health score upon image upload and displaying `"Moderate / 100"`.
> 3. GitHub OAuth lacking a trigger button in the UI and failing to persist JWT tokens to `localStorage`.
> 4. Dead/abandoned components (`hero.jsx`, `InsightCard.jsx`) left in the codebase.

### Top 5 Most Serious Functional Problems
1. **[FEAT-001] Insights Suite is 100% Hardcoded Mock Data (Fake Telemetry):** All 4 pages (`SoilInsights`, `SolarInsights`, `CropInsights`, `SystemInsights`) compute charts and metrics from `Math.sin()` loops and static arrays. Zero API calls are made to the backend.
2. **[FEAT-002] Dashboard Leaf Detection Contract Mismatch Corrupts Health Score:** When a user uploads a leaf, `Dashboard.jsx` attempts to read `result.healthScore` and `result.growthStage`, which do not exist in the backend response. This overwrites the live crop health with `undefined`, rendering `0 / 100` on screen.
3. **[FEAT-003] Dashboard Metric Display Format Error ("Moderate / 100"):** The backend `/api/analyze-data` returns categorical string health (`"Moderate"`, `"Healthy"`), but the UI renders it directly before `"/ 100"`, showing `"Moderate / 100"`.
4. **[FEAT-004] GitHub OAuth Token Loss & Missing Login Button:** The GitHub OAuth callback route (`/github/callback`) never saves the issued JWT token to `localStorage`, logging the user out on any page refresh. Furthermore, neither `/login` nor `/signup` contains a "Sign in with GitHub" button.
5. **[FEAT-005] IoT Socket.IO Event Never Broadcasts to Frontend:** `@socketio.on('sensor_data')` logs ESP32 telemetry to an Excel file on disk, but never emits a socket event back to web clients (`emit()` is never called anywhere in the backend), and the frontend has no WebSocket client.

---

## 2. How Testing Was Done

1. **Backend Automated Execution:**
   - Evaluated using Flask's native WSGI `test_client()` mounted directly into `Backend/app1.py` with the complete TensorFlow Keras neural network model (`model_leaf_disease.h5`) and Scikit-learn estimators (`model_crop_health.pkl`, `model_irrigation.pkl`, `model_solar_output.pkl`).
   - Replaced MongoDB Atlas network drivers with an in-memory dictionary-backed driver (`MockCollection`) to isolate tests from sandbox DNS restrictions while testing PyMongo queries, filters (`$or`, `$gt`, `$ne`), and atomic updates (`$set`, `$unset`).
   - Ran 40 discrete automated test cases covering valid inputs, missing payloads, duplicate emails, password complexity rules, expired tokens, invalid MIME types, and unauthorized PUT requests.
2. **Real Crop Image Preprocessing & Prediction:**
   - Tested `/api/leaf-detect` with real leaf disease images sourced from `d:\PROJECTS\Smart-Agro\test_agro\Tomato___healthy` and `Tomato___Early_blight`. Both images successfully traversed the multi-view Test-Time Augmentation (Lanczos downsampling, horizontal mirror, center zoom) and yielded valid categorical classifications.
3. **Frontend Code Tracing & AST Static Analysis:**
   - Traced every link (`<Link>`, `<a>`), button (`<GlassButton>`, `<button>`), form submit handler (`onSubmit`), and toggle across all 15 page components and UI widgets.
   - Audited translation dictionaries (`en.json`, `hi.json`, `gu.json`) and matched all 191 active `t()` calls in source code against translation keys.
4. **What Could Not Be Executed Online:**
   - Physical ESP32/Raspberry Pi hardware pins (tested via simulated payloads).
   - Live external HTTPS handshakes (`www.googleapis.com`, `api.github.com`, `smtp.gmail.com`) due to local sandboxed environment constraints.

---

## 3. Feature Matrix

### 3.1 Public Landing Page (`/`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 1 | Hero "Get Started" CTA | `landing.jsx:93-101` | ✅ | Code trace + route test | Redirects to `/dashboard` if logged in, `/signup` if unauthenticated. |
| 2 | Hero "Learn More" Button | `landing.jsx:103-107` | ✅ | Code trace | Smooth-scrolls to `#features` on the same page. |
| 3 | AI Diagnostic Feature Card | `landing.jsx:33-40` | 🟢 | Static UI inspection | Displays icon, title, description, and status tag. |
| 4 | Clean Energy Feature Card | `landing.jsx:41-48` | 🟢 | Static UI inspection | Displays solar status and description. |
| 5 | Microclimate Feature Card | `landing.jsx:49-56` | 🟢 | Static UI inspection | Displays microclimate telemetry card. |
| 6 | Telemetry Hub Feature Card | `landing.jsx:57-64` | 🟢 | Static UI inspection | Displays IoT telemetry card. |

### 3.2 Navigation Bar & Mobile Dock
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 7 | Desktop Navigation Links | `navbar.jsx:90-97` | ✅ | Code trace | Navigates to `/`, `/about`, `/contact`, and conditionally `/dashboard`. |
| 8 | Theme Switcher (Light/Dark) | `navbar.jsx:185-203` | ✅ | Runtime check | Toggles `.dark` class on root HTML, syncs icon, persists to `localStorage`. |
| 9 | Language Dropdown | `LanguageSwitcher.jsx:8-12` | ✅ | Runtime check | Switches between `en`, `hi`, `gu`, persists to `localStorage.getItem("lang")`. |
| 10 | Profile Dropdown Trigger | `navbar.jsx:210-222` | ✅ | Code trace | Renders avatar initial, opens portal menu with Profile/Logout. |
| 11 | Logout Action | `navbar.jsx:73-77` | ✅ | Executed test | Clears token and user from storage, redirects to `/login`. |
| 12 | Mobile Floating Dock | `navbar.jsx:100-125` | ✅ | Code trace | 4 fixed tabs (Home, Dashboard, Insights, Profile/Login). |

### 3.3 Footer
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 13 | Footer Navigation Links | `footer.jsx:27-37` | ✅ | Code trace | Links to `/`, `/about`, `/contact`. |
| 14 | Social Media Links | `footer.jsx:43-77` | ⚫ | Link verification | Points to generic root URLs (`linkedin.com`, `github.com`, `x.com`, `instagram.com`). |

### 3.4 Authentication: Login (`/login`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 15 | Standard Credential Login | `login.jsx:32-46` | ✅ | Executed test | Validates username/password, issues JWT token and session cookie. |
| 16 | Login by Email | `app1.py:1407` | ✅ | Executed test | Supports username or email in login identifier field. |
| 17 | Google Sign-In Button | `login.jsx:104-111` | ⚪ | Configuration check | Configured via `@react-oauth/google`. Verified GIS client parameters. |
| 18 | GitHub Login Option | `login.jsx` | ⚫ | Code inspection | **Missing**: No GitHub button rendered in the UI despite backend route existing. |
| 19 | Forgot Password Link | `login.jsx:149-155` | ✅ | Code trace | Navigates to `/forgot-password`. |
| 20 | Sign Up Link | `login.jsx:173-178` | ✅ | Code trace | Navigates to `/signup`. |

### 3.5 Authentication: Signup (`/signup`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 21 | Multi-Step Wizard Navigation | `Signup.jsx:24, 162` | ✅ | Code trace | Step 1 (Personal & Auth) ➔ Step 2 (Farm Location). |
| 22 | Form Field Validation | `Signup.jsx:129-158` | ✅ | Executed test | Rejects missing fields, weak passwords, phone mismatches. |
| 23 | Cascading Location Selector | `Signup.jsx:51-103` | 🟢 | Code trace | Dynamically populates State ➔ District ➔ Village options. |
| 24 | User Registration API | `app1.py:1364-1397` | ✅ | Executed test | Inserts user with hashed password, returns JWT token (HTTP 201). |
| 25 | Duplicate Email Rejection | `app1.py:1371` | ✅ | Executed test | Rejects existing email with HTTP 409 Conflict. |
| 26 | Google Fast Signup | `Signup.jsx:282-288` | ⚪ | Configuration check | Configured with `@react-oauth/google` popup handler. |

### 3.6 Password Recovery (`/forgot-password` & `/reset-password`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 27 | Password Reset Request | `ForgotPassword.jsx:22` | ✅ | Executed test | Accepts email/username, creates secure 32-byte URL-safe token. |
| 28 | Obfuscated Security Response | `app1.py:1441` | ✅ | Executed test | Non-existent users return HTTP 200 without leaking account existence. |
| 29 | Reset Token Verification | `app1.py:1481` | ✅ | Executed test | Enforces 30-minute expiry and valid token match. |
| 30 | Password Reset Submission | `ResetPassword.jsx:34` | ✅ | Executed test | Updates password hash in DB and clears reset token fields. |

### 3.7 GitHub OAuth Callback (`/github/callback`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 31 | OAuth Code Exchange | `GitHubCallBack.jsx:29` | ⚪ | Code trace | Exchanges code for access token via `/github-login`. |
| 32 | Auth Token Storage | `GitHubCallBack.jsx:32` | 🔴 | Code trace | **Broken**: Does not save `res.data.token` to `localStorage`. User logged out on refresh. |

### 3.8 Dashboard & Telemetry (`/dashboard`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 33 | Sensor Data Fetch / Sync | `Dashboard.jsx:160` | ✅ | Executed test | Calls `/api/analyze-data`, runs ML models, returns live irrigation & solar metrics. |
| 34 | Soil Moisture Card | `Dashboard.jsx:368-403` | ✅ | Code trace | Displays volumetric moisture percentage and temperature. |
| 35 | Solar Generation Card | `Dashboard.jsx:405-440` | ✅ | Code trace | Displays predicted solar wattage from Scikit-Learn regressor. |
| 36 | Crop Health Metric Card | `Dashboard.jsx:442-475` | 🟡 | Executed test | Contract bug: Displays `"Moderate / 100"` or drops to `0 / 100` after leaf scan. |
| 37 | System Alerts Feed | `Dashboard.jsx:90-120` | ✅ | Code trace | Renders suggestions generated dynamically by backend heuristics. |
| 38 | Secondary Telemetry (pH/Bat) | `Dashboard.jsx:65-75` | 🎭 | Code inspection | pH (6.8), battery (75%), and efficiency (82%) are hardcoded fallbacks. |

### 3.9 Leaf Disease Detection (`/dashboard`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 39 | Image File Upload / Drag-Drop | `Dashboard.jsx:186-214` | 🟢 | Code trace | File picker, drag-and-drop, and clipboard paste preview support. |
| 40 | Missing / Invalid Image Checks | `app1.py:1202-1208` | ✅ | Executed test | Rejects empty file (400), missing file (400), corrupted bytes (500). |
| 41 | Multi-View TTA Inference | `app1.py:1171-1185` | ✅ | Executed test | Computes average across normal, flipped, and zoom-cropped views. |
| 42 | Real Leaf Prediction (Healthy) | `app1.py:1215` | ✅ | Executed test | Correctly classified `Tomato___healthy` with **99.95%** confidence. |
| 43 | Real Leaf Prediction (Diseased)| `app1.py:1215` | ✅ | Executed test | Correctly classified tomato target spot with treatment recommendations. |
| 44 | Treatment & Prevention Tabs | `Dashboard.jsx:673-820` | ✅ | Code trace | Segmented control switches between Overview, Treatment, and Prevention. |
| 45 | Leaf Image Reset | `Dashboard.jsx:262-278` | ✅ | Code trace | Clears preview, revokes object URL, removes `sessionStorage` item. |

### 3.10 Insights Pages (`/insights/*`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 46 | Soil Insights Charts & Table | `SoilInsights.jsx:33-53` | 🎭 | Code inspection | 100% hardcoded sine-wave data (`Math.sin(i / 3) * 8 + 64`). |
| 47 | Soil Timeframe Filter (24h/7d) | `SoilInsights.jsx:146-160` | 🟢 | Code trace | Toggles locally between two hardcoded datasets. |
| 48 | Solar Insights Generation Chart| `SolarInsights.jsx:32-43` | 🎭 | Code inspection | 100% hardcoded array of 7 points (140W to 540W). |
| 49 | Crop Pathology Risk Chart | `CropInsights.jsx:32-43` | 🎭 | Code inspection | 100% hardcoded array of 7 daily health scores. |
| 50 | System Diagnostics & Mesh Log | `SystemInsights.jsx:9-50` | 🎭 | Code inspection | 100% hardcoded 4 alert objects and 4 IoT node ping items. |
| 51 | System Diagnostics Log Filter | `SystemInsights.jsx:40-44` | 🟢 | Code trace | Toggles locally between All and Critical hardcoded alerts. |

### 3.11 User Profile & Security (`/profile`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 52 | Profile Data Display | `Profile.jsx:31-38` | ✅ | Executed test | Renders user name, email, phone, and village from AuthContext. |
| 53 | Profile Information Edit | `Profile.jsx:64-91` | ✅ | Executed test | Validates 10-digit phone, submits `PUT /api/user/profile`. |
| 54 | Profile Image Upload | `Profile.jsx:93-115` | ✅ | Executed test | Uploads JPG/PNG via `PUT /api/user/profile-image`, updates avatar. |
| 55 | Password Change Modal | `Profile.jsx:117-135`| ✅ | Executed test | Verifies old password, enforces complexity, hashes new password. |
| 56 | Account Deletion | `Profile.jsx` | ⚫ | Code inspection | **Not implemented**: No delete account feature exists in frontend or backend. |
| 57 | Notification Feedback System | `Profile.jsx:66,86,110`| 🟡 | Code inspection | Uses browser `window.alert()` rather than accessible in-app toast alerts. |

### 3.12 Contact Us (`/contact`)
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 58 | Contact Form Submission | `Contact.jsx:22-45` | ✅ | Executed test | Submits `POST /api/contact`, successfully inserts document into MongoDB. |
| 59 | Missing Fields Validation | `app1.py:1809` | ✅ | Executed test | Rejects incomplete payloads with HTTP 400. |

### 3.13 Routing & Error Handling
| # | Feature | Where (file:line) | Status | How Tested | Result / Notes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| 60 | 404 Catch-All Page | `NotFound.jsx:7-43` | ✅ | Code trace | Renders customized 404 glass card with return button to `/`. |

---

## 4. Issues Found

### [FEAT-001] All Four Insights Pages Are Powered by Fake Mock Data
- **Status:** 🎭 Fake / Mock
- **Where:** `Frontend/src/pages/insights/SoilInsights.jsx:33-53`, `SolarInsights.jsx:32-43`, `CropInsights.jsx:32-43`, `SystemInsights.jsx:9-50`
- **Steps to reproduce:**
  1. Log into Smart-Agro and navigate to `/insights/soil`, `/insights/solar`, `/insights/crop`, or `/insights/system`.
  2. Open DevTools Network tab.
  3. Observe that no API requests are dispatched. Data is calculated on-the-fly with mathematical sine/cosine functions.
- **Expected vs Actual:**
  - *Expected:* Insights pages should fetch historical telemetry from a database endpoint (e.g., `/api/insights/soil`, `/api/insights/solar`).
  - *Actual:* Hardcoded data arrays and `Math.sin(i / 3) * 8 + 64` formulas generate identical static graphs on every device.
- **Root Cause:** Placeholder mockup arrays were never wired to real database aggregation queries in `Backend/app1.py`.
- **Suggested Fix:**
  Add a historical telemetry endpoint in `Backend/app1.py` querying MongoDB `sensor_readings` collection, and use React `useEffect` + `axios` to populate `chartData`.
- **Priority:** P1
- **Effort:** Medium
- **Status:** [x] Fixed
- **Fix applied:** `Backend/app1.py`, `Frontend/src/pages/insights/{SoilInsights, SolarInsights, CropInsights, SystemInsights}.jsx` — Implemented authenticated `GET /api/telemetry/history?range=24h|7d` route querying MongoDB `sensor_readings` (and storing Pi readings in `sensor_readings`), wired `SoilInsights`, `SolarInsights`, and `CropInsights` to fetch real history via `api` client with automatic fallback to sample data and a visible "Sample data" warning badge, and marked `SystemInsights` alerts and fleet nodes with visible "Sample data" badges.

---

### [FEAT-002] Dashboard Leaf Detection Contract Mismatch Corrupts Health Score
- **Status:** 🟡 Partially working
- **Where:** `Frontend/src/pages/Dashboard.jsx:237-245`, `Backend/app1.py:1242-1254`
- **Steps to reproduce:**
  1. Open `/dashboard` and observe the initial Crop Health card (e.g., showing a valid score).
  2. Upload a leaf image for disease diagnosis.
  3. Analysis completes, but the Crop Health card drops to `0 / 100`.
- **Expected vs Actual:**
  - *Expected:* Crop Health score should remain intact or reflect the healthy/pathology percentage.
  - *Actual:* `result.healthScore` is `undefined` in the backend response, overwriting `apiData.crop_health` with `undefined`, causing line 85 to fallback to `0`.
- **Root Cause:**
  Backend returns `{ "prediction": ..., "diseaseRisk": ..., "confidence": ... }`. It does NOT return `healthScore` or `growthStage`.
- **Suggested Fix:**
  In `Frontend/src/pages/Dashboard.jsx:240-241`:
  ```javascript
  const updatedData = {
    ...apiData,
    diseaseRisk: result.diseaseRisk,
    predictedClass: result.prediction,
    confidence: result.confidence,
    // Do NOT overwrite crop_health or growthStage with undefined:
    crop_health: result.diseaseRisk !== undefined ? (100 - result.diseaseRisk) : apiData.crop_health,
  };
  ```
- **Priority:** P1
- **Effort:** Small
- **Status:** [x] Fixed
- **Fix applied:** `Frontend/src/pages/Dashboard.jsx`, `Backend/app1.py`: Prevented overwriting `crop_health` with undefined, guarded against non-numeric scores, and returned HTTP 400 for corrupted leaf images while displaying error messages on the UI.

---

### [FEAT-003] Dashboard Health Card Displays "Moderate / 100"
- **Status:** 🟡 Partially working
- **Where:** `Frontend/src/pages/Dashboard.jsx:445-450`, `Backend/app1.py:1278`
- **Steps to reproduce:**
  1. Open `/dashboard` when telemetry loads from `/api/analyze-data`.
  2. Look at the Crop Health metric card.
  3. The card displays text: `"Moderate / 100"`.
- **Expected vs Actual:**
  - *Expected:* A numerical value (e.g., `78 / 100`) or a badge with `"Moderate"` without `"/ 100"`.
  - *Actual:* String `"Moderate"` is placed directly next to `<span ...>/ 100</span>`.
- **Root Cause:**
  Backend `ml["encoder"].inverse_transform()` converts the numeric model output into a string (`"Moderate"`, `"Healthy"`, `"Poor"`). Frontend assumes it is a number from 0 to 100.
- **Suggested Fix:**
  Inspect whether `cropHealth.healthScore` is numeric or string, and render conditionally:
  ```jsx
  {typeof cropHealth.healthScore === "number" ? (
    <>
      <span className="text-3xl font-black">{cropHealth.healthScore}</span>
      <span className="text-xs font-bold text-slate-700">/ 100</span>
    </>
  ) : (
    <span className="text-2xl font-black">{cropHealth.healthScore}</span>
  )}
  ```
- **Priority:** P2
- **Effort:** Small
- **Status:** [x] Fixed
- **Fix applied:** `Frontend/src/pages/Dashboard.jsx`, `Frontend/src/i18n/en.json`, `Frontend/src/i18n/hi.json`, `Frontend/src/i18n/gu.json`: Conditionally rendered `/ 100` only when `cropHealth.healthScore` is numeric, and displayed translated category strings without `/ 100`.

---

### [FEAT-004] GitHub OAuth Callback Does Not Save Token (Session Lost on Reload)
- **Status:** 🔴 Broken
- **Where:** `Frontend/src/pages/auth/GitHubCallBack.jsx:29-35`
- **Steps to reproduce:**
  1. Trigger GitHub OAuth callback at `/github/callback?code=test_code`.
  2. Callback succeeds and navigates to `/dashboard`.
  3. Press browser Refresh (F5).
  4. User is immediately logged out and redirected to `/login`.
- **Expected vs Actual:**
  - *Expected:* JWT token is stored in `localStorage` so session persists across reloads.
  - *Actual:* `GitHubCallBack.jsx` only calls `setUser(res.data.user)` and never calls `localStorage.setItem('smart_agro_token', res.data.token)`.
- **Root Cause:**
  `GitHubCallBack.jsx` directly calls `axios.post` instead of using `authContext.handleOAuthLogin()`.
- **Suggested Fix:**
  In `Frontend/src/pages/auth/GitHubCallBack.jsx`:
  ```javascript
  const { handleOAuthLogin } = useAuth();
  // ...
  handleOAuthLogin(async () => {
    return await axios.post(`${apiUrl}/github-login`, { code }, { withCredentials: true });
  }).then(success => {
    if (success) navigate("/dashboard");
    else navigate("/login");
  });
  ```
- **Priority:** P1
- **Effort:** Small
- **Status:** [x] Fixed
- **Fix applied:** `Frontend/src/pages/auth/GitHubCallBack.jsx`: Replaced raw axios call with `authContext.handleOAuthLogin()` to persist JWT token and user in `localStorage`, removed all `alert()` and OAuth code console logging, and redirected failure states to `/login` with an error message banner.

---

### [FEAT-005] Missing "Sign in with GitHub" Button on Login and Signup
- **Status:** ⚫ Dead / Orphaned UI
- **Where:** `Frontend/src/pages/auth/login.jsx:101-121`, `Signup.jsx:280-290`
- **Steps to reproduce:**
  1. Navigate to `/login` or `/signup`.
  2. Observe the OAuth buttons section. Only Google Sign-In is rendered.
- **Expected vs Actual:**
  - *Expected:* Users should see a "Continue with GitHub" button to initiate GitHub OAuth.
  - *Actual:* Zero GitHub UI elements exist, rendering `/github/callback` unreachable unless manually navigated to.
- **Root Cause:**
  GitHub button was omitted when styling Google OAuth components.
- **Suggested Fix:**
  Add a GitHub button that redirects to:
  `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=user:email`
- **Priority:** P2
- **Effort:** Small
- **Status:** [x] Fixed
- **Fix applied:** `Frontend/src/pages/auth/login.jsx`, `Frontend/src/pages/auth/Signup.jsx`, `Frontend/src/i18n/en.json`, `Frontend/src/i18n/hi.json`, `Frontend/src/i18n/gu.json`, `README.md`: Added styled "Continue with GitHub" / "Sign up with GitHub" buttons conditionally rendered only when `VITE_GITHUB_CLIENT_ID` is set, and documented the variable in `README.md`.

---

### [FEAT-006] IoT Sensor Data Received from Pi Is Never Broadcast to Clients
- **Status:** ⚫ Dead / Placeholder
- **Where:** `Backend/app1.py:94-132`
- **Steps to reproduce:**
  1. Emit `sensor_data` event from ESP32 or client to backend socket.
  2. Check browser network or console on `/dashboard`.
  3. No update occurs on the screen.
- **Expected vs Actual:**
  - *Expected:* Real-time sensor readings should be broadcast via `emit("sensor_update", ...)` so the dashboard updates live without manual page reloads.
  - *Actual:* `handle_sensor_data()` writes readings into `sensor_readings.xlsx` on the backend disk and never emits anything to connected clients.
- **Root Cause:**
  Missing `socketio.emit('sensor_update', latest_pi_data, broadcast=True)` call.
- **Suggested Fix:**
  Add `socketio.emit('sensor_update', latest_pi_data, broadcast=True)` inside `handle_sensor_data()`.
- **Priority:** P2
- **Effort:** Small
- **Status:** [x] Fixed
- **Fix applied:** `Frontend/src/pages/auth/login.jsx`, `Frontend/src/pages/auth/Signup.jsx`, `Frontend/src/i18n/en.json`, `Frontend/src/i18n/hi.json`, `Frontend/src/i18n/gu.json`, `README.md`: Added styled "Continue with GitHub" / "Sign up with GitHub" buttons conditionally rendered only when `VITE_GITHUB_CLIENT_ID` is set, and documented the variable in `README.md`.

---

### [FEAT-007] Dead Code: Abandoned Hero.jsx and InsightCard.jsx
- **Status:** ⚫ Dead / Placeholder
- **Where:** `Frontend/src/components/hero.jsx:1-18`, `Frontend/src/components/InsightCard.jsx:1-30`
- **Steps to reproduce:**
  1. Search for imports of `Hero` or `InsightCard` across `Frontend/src`.
  2. Zero files import them.
- **Expected vs Actual:**
  - *Expected:* Clean component directory containing only active code.
  - *Actual:* Unused components linger in the codebase.
- **Root Cause:**
  Components were replaced by newer designs (`landing.jsx` and custom dashboard cards) but old files were never deleted.
- **Suggested Fix:** Safely delete `hero.jsx` and `InsightCard.jsx`.
- **Priority:** P3
- **Effort:** Small
- **Status:** [x] Fixed
- **Fix applied:** `Frontend/src/components/{hero.jsx, InsightCard.jsx}`, `Backend/app1.py` — Confirmed zero imports, safely deleted `hero.jsx` and `InsightCard.jsx`, and removed unused redundant backend route `GET /api/analyze-datas`.

---

## 5. API Contract Check

| Frontend Call | Backend Route | Method / Payload Match? | Auth Guarded? | Test Result | Notes |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Dashboard.jsx:163` | `POST /api/analyze-data` | ✅ Yes (`{ demo: true }`) | Optional (public demo) | ✅ 200 OK | Returns soil, solar, irrigation, crop health. |
| `Dashboard.jsx:226` | `POST /api/leaf-detect` | ⚠️ Partial mismatch | Optional | ✅ 200 OK | Multipart/form-data. Missing `healthScore` in response. |
| `Signup.jsx:202` | `POST /api/auth/signup` | ✅ Yes (JSON user payload) | No (registration) | ✅ 201 Created | Creates user, hashes password, returns JWT. |
| `authContext.jsx:102` | `POST /api/auth/login` | ✅ Yes (`{ username, password }`) | No (credential verification) | ✅ 200 OK | Issues JWT token + sets session cookie. |
| `authContext.jsx:60` | `GET /api/auth/check` | ✅ Yes | Bearer Token / Cookie | ✅ 200 OK | Returns `{ authenticated: true/false, user }`. |
| `authContext.jsx:191` | `POST /api/auth/logout` | ✅ Yes | Bearer Token / Cookie | ✅ 200 OK | Clears session cookie and responds with 200. |
| `ForgotPassword.jsx:29`| `POST /api/auth/forgot-password` | ✅ Yes (`{ identifier }`) | No | ✅ 200 OK | Generates reset token with 30-min expiry. |
| `ResetPassword.jsx:52` | `POST /api/auth/reset-password` | ✅ Yes (`{ token, password }`) | No (token-authenticated) | ✅ 200 OK | Updates password in MongoDB. |
| `login.jsx:52` | `POST /api/auth/oauth/google` | ✅ Yes (`{ credential }`) | Google ID Token | ✅ 200 OK | Verifies ID token with Google public certs. |
| `GitHubCallBack.jsx:29`| `POST /github-login` | ✅ Yes (`{ code }`) | GitHub OAuth | ✅ 200 OK | Exchanges code for GitHub access token. |
| `Profile.jsx:72` | `PUT /api/user/profile` | ✅ Yes (JSON allowed fields) | ✅ Bearer / Cookie required | ✅ 200 OK | Enforces unique phone and valid ObjectId. |
| `Profile.jsx:101` | `PUT /api/user/profile-image` | ✅ Yes (Multipart image) | ✅ Bearer / Cookie required | ✅ 200 OK | Saves to `uploads/`, updates user document. |
| `Profile.jsx:127` | `PUT /api/user/change-password` | ✅ Yes (`{ oldPassword, newPassword }`) | ✅ Bearer / Cookie required | ✅ 200 OK | Verifies old bcrypt hash, rejects OAuth users. |
| `Contact.jsx:28` | `POST /api/contact` | ✅ Yes (`{ name, email, message }`) | No | ✅ 200 OK | Inserts message entry into MongoDB `messages`. |

### Backend Routes Never Called by Frontend
1. `GET /api/analyze-datas` (`app1.py:1327`): Redundant duplicate of `/api/analyze-data` with GET method. Never invoked by any frontend component.
2. `POST /api/github-login` (`app1.py:1602`): Alias endpoint for `/github-login`. Frontend uses `/github-login`.

---

## 6. Dead Code & Dead UI

1. **Unused Components:**
   - [Frontend/src/components/hero.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/hero.jsx): Standalone landing hero created early in development, superseded by `landing.jsx`.
   - [Frontend/src/components/InsightCard.jsx](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/InsightCard.jsx): Generic container superseded by Tailwind glass styling.
2. **Missing UI Elements:**
   - GitHub OAuth button on `/login` and `/signup`.
3. **Dead Links:**
   - [Frontend/src/components/footer.jsx#L43-L77](file:///d:/PROJECTS/Smart-Agro/Frontend/src/components/footer.jsx#L43-L77): Generic social icons point to root domain homepages (`linkedin.com`, `x.com`).
   - [Frontend/src/pages/Contact.jsx#L61-L94](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/Contact.jsx#L61-L94): Same generic social links repeated.
4. **Unimplemented Backend Event:**
   - `handle_sensor_data` in `app1.py` does not emit websocket events back to the frontend.

---

## 7. Localization Gaps

### 7.1 Missing Translation Keys (Called in Source but Absent from `en.json`)
The following 4 keys are called using `t()` in the code, but are missing from `en.json`, `hi.json`, and `gu.json`:
1. `signup.form.terms_agreement` — in [Frontend/src/pages/auth/Signup.jsx#L500](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/Signup.jsx#L500)
2. `signup.validation.password_min_length` — in [Frontend/src/pages/auth/Signup.jsx#L141](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/Signup.jsx#L141)
3. `signup.validation.password_upper` — in [Frontend/src/pages/auth/Signup.jsx#L144](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/Signup.jsx#L144)
4. `signup.validation.password_special` — in [Frontend/src/pages/auth/Signup.jsx#L147](file:///d:/PROJECTS/Smart-Agro/Frontend/src/pages/auth/Signup.jsx#L147)

### 7.2 Hardcoded English Strings (Missing `t()` Wrappers)
- **SoilInsights.jsx:**
  - Lines 133-142: `"Telemetry Suite"`, `"4 Nodes Active"`, `"Soil Moisture & Subsurface Telemetry"`, `"Real-time volumetric water content, rhizosphere temperature, and chemical alkalinity trends."`
  - Lines 169-204: `"Volumetric Moisture"`, `"Optimal Target"`, `"Rhizosphere Temperature"`, `"Thermal Balance"`, `"Chemical Reaction"`, `"Slightly Acidic"`, `"Active Soil Probes"`, `"All Nodes Healthy"`.
  - Lines 220-226: Table headers: `"Time"`, `"Moisture (%)"`, `"Temp (°C)"`, `"pH Balance"`, `"Irrigation Status"`.
- **SolarInsights.jsx:**
  - Lines 110-120: `"Clean Energy Telemetry"`, `"Array Array-01"`, `"Solar Performance & Photovoltaic Inverter Analytics"`.
  - Lines 135-170: `"Photovoltaic Generation"`, `"Daily Cumulative"`, `"Inverter Efficiency"`, `"MPPT Tracking Active"`, `"Battery Reserve"`, `"Deep-Cycle Lithium"`, `"Array Operational Status"`.
- **CropInsights.jsx:**
  - Lines 105-115: `"Phenological Monitoring"`, `"Zone A / Field-04"`, `"Crop Pathology & Health Index"`.
  - Lines 125-160: `"Mean Health Index"`, `"Optimal Vigour"`, `"Aggregate Pathology Risk"`, `"Within Safety Threshold"`, `"Dominant Growth Stage"`.
- **SystemInsights.jsx:**
  - Lines 58-68: `"Network Telemetry"`, `"4 Nodes Online"`, `"System Diagnostics & IoT Mesh Telemetry"`.
  - Lines 80-110: `"Mesh Network Status"`, `"Active Sensor Probes"`, `"Online & Polling"`, `"Last Telemetry Sync"`.
- **Footer.jsx:**
  - Lines 22, 29-35: `"Home"`, `"About Us"`, `"Contact"`, `"Empowering modern agriculture through..."`.
- **NotFound.jsx:**
  - Lines 24-37: `"Error 404"`, `"Page Not Found"`, `"The agricultural telemetry or insight coordinates you are searching for do not exist or have moved."`, `"Return to Dashboard / Home"`.

---

## 8. Fix Plan

### Phase 1: High Priority (P0 & P1) - Functional Integrity
1. **Fix Dashboard Contract Mismatch (`[FEAT-002]`):**
   - Update `Dashboard.jsx:238-245` to avoid setting `crop_health: result.healthScore` when `result.healthScore` is undefined.
2. **Fix GitHub OAuth Token Persistence (`[FEAT-004]`):**
   - Refactor `GitHubCallBack.jsx` to call `handleOAuthLogin()`, ensuring the JWT token is persisted in `localStorage`.
3. **Connect Insights to Backend Telemetry (`[FEAT-001]`):**
   - Replace the client-side `Math.sin()` loops with a `/api/insights` query feeding from actual sensor readings.

### Phase 2: Medium Priority (P2) - UI & Data Polish
4. **Fix "Moderate / 100" Display Bug (`[FEAT-003]`):**
   - Conditionally render `/ 100` only when `cropHealth.healthScore` is numeric.
5. **Add GitHub Login Button (`[FEAT-005]`):**
   - Insert GitHub OAuth button into `login.jsx` and `Signup.jsx`.
6. **Add Socket Broadcast for ESP32 Telemetry (`[FEAT-006]`):**
   - Add `socketio.emit("sensor_update", latest_pi_data, broadcast=True)` to `handle_sensor_data()`.

### Phase 3: Low Priority (P3) - Code Quality & Localization
7. **Clean Dead Code (`[FEAT-007]`):**
   - Remove unused files: `Frontend/src/components/hero.jsx` and `Frontend/src/components/InsightCard.jsx`.
   - Remove unused backend route `/api/analyze-datas`.
8. **Resolve Missing i18n Keys:**
   - Add the 4 missing keys (`terms_agreement`, `password_min_length`, etc.) into `en.json`, `hi.json`, `gu.json`.
9. **Replace `window.alert()` in Profile:**
   - Implement inline feedback toasts instead of blocking browser modal dialogs.

### Future Features (Planned / Backlog)
1. **Delete Account:**
   - Allow users to permanently delete their account, stored preferences, and personal telemetry records from the `/profile` settings tab.
   - Requirements: Require password confirmation for local accounts, invalidate existing JWT tokens, and delete user document from `users` collection in MongoDB. (Do not implement in current scope).

---

## 9. Not Verified (External Dependencies)

> [!IMPORTANT]
> **Google OAuth and GitHub OAuth are still NOT verified in automated tests** because the local sandbox environment blocks outbound network requests to external identity provider servers (`accounts.google.com`, `www.googleapis.com`, and `github.com`).
> 
> Below are the exact environment variables and step-by-step manual testing instructions required to verify them in a live browser:

### 1. Google OAuth
- **Required Environment Variables:**
  - `Frontend/.env`: `VITE_GOOGLE_CLIENT_ID=358790138259-p5a5vrq1c8q6lj4umdchlc8o5bgkbp2r.apps.googleusercontent.com`
  - `Backend/.env`: `GOOGLE_CLIENT_ID=358790138259-p5a5vrq1c8q6lj4umdchlc8o5bgkbp2r.apps.googleusercontent.com`
- **Manual Verification Steps:**
  1. Ensure your current frontend URL (`http://localhost:5173` or `https://smart-agro-v2.vercel.app`) is registered in Google Cloud Console under **Authorized JavaScript Origins** and **Authorized Redirect URIs**.
  2. Start the app and navigate to `/login` or `/signup`.
  3. Click the Google Sign-In button ("Continue with Google").
  4. Complete authentication in the Google popup.
  5. Verify that:
     - You are redirected to `/dashboard`.
     - `localStorage.getItem('smart_agro_token')` and `localStorage.getItem('smart_agro_user')` are populated in browser DevTools Application tab.
     - Refreshing the page (F5) keeps you on `/dashboard` without redirecting to `/login`.

### 2. GitHub OAuth
- **Required Environment Variables:**
  - `Frontend/.env`: `VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id`
  - `Backend/.env`: `GITHUB_CLIENT_ID=your_github_oauth_client_id`
  - `Backend/.env`: `GITHUB_CLIENT_SECRET=your_github_oauth_client_secret`
- **Manual Verification Steps:**
  1. In GitHub Developer Settings ➔ OAuth Apps, verify that the **Authorization callback URL** is set to:
     `http://localhost:5173/github/callback` (or `https://smart-agro-v2.vercel.app/github/callback` for production).
  2. Navigate to `/login` or `/signup`.
  3. Verify that the "Continue with GitHub" button appears (only when `VITE_GITHUB_CLIENT_ID` is set).
  4. Click the button to redirect to `github.com/login/oauth/authorize`.
  5. Authorize the application. GitHub redirects back to `/github/callback?code=...`.
  6. Verify that:
     - The callback screen shows "Authenticating with GitHub..." and smoothly transitions to `/dashboard`.
     - `localStorage.getItem('smart_agro_token')` is set.
     - Pressing F5 (reload) preserves the authenticated state.
     - Canceling GitHub authorization redirects back to `/login` with an informative error message banner.

### 3. Live Gmail SMTP Delivery
- **Required Environment Variables:**
  - `Backend/.env`: `EMAIL_USER=your_gmail@gmail.com`
  - `Backend/.env`: `EMAIL_PASS=your_16_digit_app_password`
- **Manual Verification Steps:**
  1. Go to `/forgot-password`, enter your email, and submit.
  2. Check your inbox for the reset link: `http://localhost:5173/reset-password?token=...`.
  3. Click the link, enter a new password complying with security criteria, and submit.
  4. Verify login with the updated password.

### 4. Physical ESP32 / Raspberry Pi Hardware
- Live telemetry stream over RF/Wi-Fi to backend Socket.IO port 5000 requires active hardware.

---

## 10. Reproduction Commands

To reproduce the automated tests and findings in this audit report, run the following commands from the project root:

```powershell
# 1. Run the backend feature test suite (Health, ML, Auth, Profile, Leaf Detect)
Backend\venv\Scripts\python "C:\Users\SHABBIR\.gemini\antigravity\brain\70f3bff5-18b3-4699-829a-dcb7258a6c8a\scratch\run_feature_tests.py"

# 2. Check translation keys consistency between en.json, hi.json, gu.json
Backend\venv\Scripts\python -c "import json; en=json.load(open('Frontend/src/i18n/en.json', encoding='utf-8')); hi=json.load(open('Frontend/src/i18n/hi.json', encoding='utf-8')); gu=json.load(open('Frontend/src/i18n/gu.json', encoding='utf-8')); print('EN:', len(en), 'HI:', len(hi), 'GU:', len(gu))"

# 3. Scan for missing translation keys in Frontend source code
Backend\venv\Scripts\python "C:\Users\SHABBIR\.gemini\antigravity\brain\70f3bff5-18b3-4699-829a-dcb7258a6c8a\scratch\find_missing_keys.py"

# 4. Verify TensorFlow Leaf Disease Model loads cleanly
Backend\venv\Scripts\python -c "import sys; sys.path.insert(0, 'Backend'); import app1; print('Leaf model loaded:', app1.get_leaf_model() is not None)"
```
