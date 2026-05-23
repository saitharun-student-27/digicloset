# DigiCloset Server

FastAPI backend for DigiCloset.

Current backend scope includes:

- outfit and clothing APIs
- deterministic suggestions
- safe local upload handling
- category validation that supports expanded normalized wardrobe categories
- metadata validation that now accepts normalized values for:
  - season
  - occasion
- backend auth foundation:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- backend ownership filtering:
  - protected outfit routes
  - protected clothing routes
  - protected suggestions route
  - default dev-user backfill for existing local wardrobe data
- backend-ready support for frontend auth:
  - bearer-token current-user access
  - dev login for local private-wardrobe testing

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

- `APP_ENV`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `UPLOAD_DIR`
- `UPLOAD_URL_PREFIX`
- `MAX_UPLOAD_SIZE_BYTES`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `JWT_ALGORITHM`
- `ENABLE_API_DOCS`

Current environment behavior:

- local development defaults to `APP_ENV=development`
- production must set a real `SECRET_KEY`
- production must set explicit non-local `CORS_ORIGINS`
- FastAPI docs are enabled by default in development and disabled by default in production
- local SQLite bootstrap and default dev-user backfill are development-only and must not run in production
- production schema creation must be explicit through Alembic

PostgreSQL notes:

- local SQLite is still supported for development
- PostgreSQL URLs using either:
  - `postgresql+psycopg://...`
  - `postgresql://...`
  are normalized for SQLAlchemy/psycopg use
- production should use Alembic migrations instead of startup `create_all()`

## Alembic

Safe migration commands from the `server` folder:

```powershell
.\venv\Scripts\python.exe -m alembic -c alembic.ini heads
.\venv\Scripts\python.exe -m alembic -c alembic.ini upgrade head
```

Important boundary:

- do not run local-only ownership backfill or dev-reset scripts against a hosted production database
- local-only scripts now fail fast when `APP_ENV=production`
- do not rely on startup bootstrap for PostgreSQL schema creation

## Current Boundary

Backend wardrobe APIs are protected and user-scoped.

Current frontend/backend auth state:

- frontend welcome/login/signup now exists
- protected frontend routes now attach bearer tokens automatically
- local dev testing can use:
  - email: `dev@digicloset.local`
  - password: `devpassword123`

Current category-taxonomy boundary:

- frontend now normalizes category input for Indian, western, and Indo-western wardrobes
- backend clothing schemas accept expanded canonical category strings and safe custom category values
- frontend now also normalizes wardrobe metadata such as:
  - color
  - season
  - occasion
  - style
  - formality
- backend season and occasion schemas accept these normalized values safely
- old category records are not auto-rewritten by the backend

Current outfit-builder contract boundary:

- backend outfit creation already accepts:
  - new manual pieces through `pieces`
  - existing wardrobe reuse through `clothing_item_ids`
- ownership checks still apply when linking existing clothing records into a new outfit
- cross-user clothing-item linking is rejected safely

Next backend-adjacent phase:

- Phase `3H.4`: Cloudinary image storage integration

## User-Scoped Upload QA Notes

Current verified behavior:

- new authenticated outfit uploads can save under:
  - `uploads/u_{user_id}/...`
- new authenticated clothing uploads can save under:
  - `uploads/u_{user_id}/...`
- old top-level local upload URLs still work
- local delete cleanup still removes safe app-owned files
- external URLs remain untouched by local cleanup

## Orphaned Upload Audit

Run:

```powershell
cd D:\projects\digicloset
python scripts\check-orphaned-uploads.py
```

The audit now checks:

- DB-referenced local image paths
- missing local files
- orphaned local files
- nested user-scoped upload directories
