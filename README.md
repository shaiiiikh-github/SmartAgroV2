🌱 Smart Agro

A Smart Agriculture Platform built with React (Frontend) and Flask (Backend) to help farmers with real-time insights, crop recommendations, soil analysis, and smart system monitoring.

✅ Features

📊 Dashboard – Centralized platform for managing farm data.

🌾 Crop Insights – Get recommendations based on soil and weather conditions.

☀️ Solar Insights – Monitor solar panel efficiency for irrigation systems.

🌍 Soil Insights – Analyze soil health with ML predictions.

🔐 Authentication – Login/Signup with username & password.

🌐 OAuth Login – Google and GitHub sign-in.

💬 Customer Support – Message system for farmers to connect with support.

🛠 Tech Stack
Frontend

React.js

React Router

TailwindCSS / CSS

Axios

Backend

Python (Flask)

MongoDB (Database)

TensorFlow (for ML Models)

---

## ⚙️ Environment Variables

### Frontend (`Frontend/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Base URL of the backend Flask server (e.g. `http://localhost:5000` or production URL) |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Web Client ID |
| `VITE_GITHUB_CLIENT_ID` | GitHub Developer OAuth App Client ID |

### Backend (`Backend/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Flask server port (default: `5000`) |
| `MONGO_URI` | MongoDB connection URI string |
| `FLASK_SECRET_KEY` | Secret key used for session cookie and JWT signing |
| `FRONTEND_URL` | Frontend origin for CORS and password reset links |
| `GOOGLE_CLIENT_ID` | Google Client ID for backend ID token verification |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `EMAIL_USER` | Gmail address for sending password reset emails |
| `EMAIL_PASS` | Gmail 16-character App Password |
