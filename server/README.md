# DigiCloset Server

FastAPI backend for DigiCloset.

Current backend scope includes:

- outfit and clothing APIs
- deterministic suggestions
- safe local upload handling
- backend auth foundation:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- backend ownership filtering:
  - protected outfit routes
  - protected clothing routes
  - protected suggestions route
  - default dev-user backfill for existing local wardrobe data

## Setup

```powershell
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Health Check

```powershell
curl.exe http://127.0.0.1:8000/api/health
```

## Auth Verification

### Signup

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"verifyuser@example.com\",\"password\":\"password123\",\"display_name\":\"Verify User\"}"
```

### Login

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"verifyuser@example.com\",\"password\":\"password123\"}"
```

### Me

```powershell
curl.exe http://127.0.0.1:8000/api/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Ownership Migration

Run the idempotent local backfill script from the `server` folder:

```powershell
.\venv\Scripts\python.exe ..\scripts\migrate_user_ownership.py
```

This will:

- create or reuse `dev@digicloset.local`
- backfill `outfits.user_id`
- backfill `clothing_items.user_id`
- report any cross-user outfit-item link problems

## Dev User Password Reset

Local-only reset utility:

```powershell
.\venv\Scripts\python.exe ..\scripts\reset_dev_user_password.py
```

After reset, the default dev login is:

- email: `dev@digicloset.local`
- password: `devpassword123`

## Environment Notes

Important values in `.env` / `.env.example`:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `UPLOAD_DIR`
- `UPLOAD_URL_PREFIX`
- `MAX_UPLOAD_SIZE_BYTES`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `JWT_ALGORITHM`

## Current Boundary

Backend wardrobe APIs are now protected and user-scoped.

Current temporary limitation:

- the frontend app still needs Phase `3E.3` auth wiring before it can call protected wardrobe APIs successfully
