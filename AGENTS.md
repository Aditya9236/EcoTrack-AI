# EcoTrack AI - Agent Development Reference

Welcome, Antigravity Agent! This reference outlines the folder structure, development commands, and design schemas of the EcoTrack AI repository.

---

## Workspace Layout
- `frontend/` - Next.js (TypeScript, Tailwind CSS, Firebase Client SDK, Google Maps client).
- `backend/` - FastAPI (Python 3.11, Pydantic, Gemini SDK, Pytest).
- `firestore.rules` - Production firestore security configurations.

---

## Local Setup & Environment Variables

### Frontend Setup (`frontend/`)
Create `frontend/.env.local` with the following variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend Setup (`backend/`)
Create `backend/.env` with:
```env
GEMINI_API_KEY=your_gemini_api_key
```

---

## Commands Reference

### Run Frontend in Development
```powershell
# Run from frontend/ directory
npm run dev
```

### Build Frontend
```powershell
# Run from frontend/ directory
npm run build
```

### Run Frontend Tests
```powershell
# Run from frontend/ directory
npm run test
```

### Run Backend API
```powershell
# Run from backend/ directory
python -m uvicorn main:app --reload --port 8000
```

### Run Backend Tests
```powershell
# Run from backend/ directory
python -m pytest
```

---

## Development Standards
1. **Clean Architecture**: Decouple calculator equations and agent reasoning paths from routes and views.
2. **Type Safety**: Fully type Next.js components and APIs. No `any`.
3. **Error Handling**: Graceful client UI error bounds and clear uvicorn logging.
4. **Accessibility**: Retain WCAG AA color contrast (4.5:1 text contrast) and tab order focus states.
