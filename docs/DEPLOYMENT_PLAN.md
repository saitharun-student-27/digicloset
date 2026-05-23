# DigiCloset Deployment Plan

## Recommended Stack

**Recommended stack: Option A**

- Frontend: Vercel
- Backend: Render Web Service
- Database: Neon PostgreSQL
- Images: Cloudinary

### Why this stack

- **Frontend simplicity:** Vercel has first-class support for Vite projects and Git-based preview deployments.
- **Backend simplicity:** Render has a straightforward FastAPI deployment path with a normal Python build/start model.
- **Database clarity:** Neon keeps DigiCloset on plain PostgreSQL without pulling in unrelated platform features.
- **Image handling:** Cloudinary is the easiest beginner-friendly way to move off local uploads while still storing normal image URLs in the database.

### Why not the other options

**Option B - Vercel + Railway + Railway PostgreSQL + Cloudinary**
- Good platform ergonomics for small projects.
- Slightly more platform-specific operational learning on the backend/database side.
- Railway PostgreSQL is convenient, but Railway's docs are explicit that database templates are unmanaged and leave backups, tuning, security, and maintenance to you.

**Option C - Render frontend + backend + Render PostgreSQL + Cloudinary**
- Fewer providers than Option A.
- Simpler mental model than split frontend/backend hosts.
- Weaker fit for the current Vite frontend than Vercel, and less aligned with the repo's preview-friendly frontend workflow.

## Current Deployment Blockers

### Frontend

- `client/src/lib/api.js` falls back to `http://localhost:8000/api`.
- `client/.env` and `client/.env.example` are still localhost-oriented.
- Frontend env naming is workable, but should be cleaned up and documented before hosting.

### Backend

- `server/app/core/config.py` includes a development-safe-looking but production-unsafe default `SECRET_KEY`.
- `server/app/main.py` enables FastAPI docs/OpenAPI by default.
- `server/app/main.py` always mounts local `uploads/` static files.
- `server/app/db/database.py` calls `Base.metadata.create_all()` at startup.
- `server/app/db/database.py` always runs ownership backfill on startup.
- `server/app/db/database.py` always ensures the default local dev user exists.
- `_sync_sqlite_schema()` uses SQLite-specific DDL assumptions.
- Local upload persistence and cleanup assume filesystem-backed storage.
- AI route is mounted regardless of whether `GEMINI_API_KEY` exists.

### Data and operations

- No production-safe database migration workflow is defined yet.
- Alembic is installed, but no migration discipline is documented for hosted environments.
- Local-only scripts still exist in the normal repo flow:
  - `scripts/migrate_user_ownership.py`
  - `scripts/reset_dev_user_password.py`
  - `scripts/check-orphaned-uploads.py`

## Environment Variable Checklist

### Frontend

- `VITE_API_URL`
  - local: `http://127.0.0.1:8000/api`
  - production: hosted backend URL plus `/api`

### Backend

- `APP_NAME`
- `API_PREFIX`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `UPLOAD_DIR` (development/local only)
- `UPLOAD_URL_PREFIX`
- `MAX_UPLOAD_SIZE_BYTES`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `JWT_ALGORITHM`
- `GEMINI_API_KEY` (optional)

### Cloudinary (planned)

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- optional:
  - `CLOUDINARY_FOLDER`
  - `CLOUDINARY_SECURE_DELIVERY=true`

## PostgreSQL Migration Plan

### Current state

- Local development is using SQLite through `.env`.
- The codebase already includes `psycopg[binary]`.
- SQLAlchemy models are mostly portable and should work on PostgreSQL without model redesign.

### Likely compatible already

- SQLAlchemy ORM models use generic column types.
- Auth, ownership, and relationship modeling are PostgreSQL-friendly.
- Backend already accepts `DATABASE_URL`, which is the right production shape.

### What needs to change before migration

- Stop treating startup `create_all()` as the production schema strategy.
- Gate SQLite-only schema sync and backfill logic away from PostgreSQL production startup.
- Stop auto-seeding the local dev user in production.
- Add an explicit migration path for future schema changes.

### Recommendation

- **Phase 3H.2:** clean environment/config behavior first.
- **Phase 3H.3:** prepare PostgreSQL compatibility and migration discipline.
- Use **Alembic** before real hosted rollout, even if the first staging database can be bootstrapped from a known schema.
- For first hosted staging, one acceptable temporary stop condition is:
  - initialize PostgreSQL on an empty database
  - run a single controlled migration/bootstrap
  - do not rely on repeated startup `create_all()` in production

### Files likely changed

- `server/app/core/config.py`
- `server/app/db/database.py`
- `server/app/main.py`
- `server/requirements.txt` (only if dependency cleanup is needed)
- future Alembic files/config
- deployment service config files

### Local-only scripts that must stay local-only

- `scripts/migrate_user_ownership.py`
- `scripts/reset_dev_user_password.py`
- SQLite backfill/startup ownership bootstrap behavior

### Main migration risks

- accidental dev-user creation in production
- schema drift between local SQLite and hosted PostgreSQL
- startup-time table creation hiding migration mistakes
- relying on SQLite-specific assumptions in a PostgreSQL environment

## Cloud Image Storage Plan

### Recommendation

- Use **Cloudinary**

### Why

- Easy backend SDK story for Python
- Straightforward URL-based storage model
- Good fit for storing one image URL per outfit/piece
- Safe delete APIs exist for app-owned assets

### Planned behavior

- Development:
  - keep current local `server/uploads`
  - keep local static mount
  - keep local cleanup/orphan tooling
- Production:
  - upload new files to Cloudinary
  - store Cloudinary secure URLs (and public IDs if needed for deletes)
  - delete only app-owned Cloudinary assets when records are removed

### Files likely changed

- `server/app/utils/upload.py`
- `server/app/core/config.py`
- `server/app/main.py` (possibly to conditionally mount local uploads only in dev)
- outfit/clothing service files that create, update, or delete image-backed records
- `scripts/check-orphaned-uploads.py`

### Important storage rules

- Preserve local upload behavior for development.
- Do not try to delete arbitrary external URLs.
- Keep path-traversal protection for local mode.
- Update orphan-audit tooling so it understands:
  - local filesystem mode
  - cloud-backed mode

### Main risks

- deleting external non-Cloudinary URLs accidentally
- losing the ability to remove old local dev images safely
- mixing local and cloud cleanup assumptions in the same code path

## Auth and Security Checklist

- Require `SECRET_KEY` in production; do not allow the default fallback.
- Keep server-side ownership checks exactly where they are now.
- Keep all outfit, clothing, and suggestion routes authenticated.
- Keep dev credentials out of frontend production output.
- Do not seed the local dev user in production.
- Make `CORS_ORIGINS` explicit for production frontend domains.
- Review whether FastAPI docs should be disabled in production or made environment-controlled.
- Keep JWT over HTTPS only in hosted use.
- Keep password hashing as-is unless a verified security reason requires change.
- Ensure raw internal exceptions are not exposed as response bodies.
- Treat `GEMINI_API_KEY` as optional and avoid presenting `/ai/scan` as production-ready unless configured intentionally.

## Frontend Production Checklist

- Set `VITE_API_URL` to the real hosted backend origin.
- Keep local `.env` and hosted env values separate.
- Vite build command remains:
  - `npm.cmd run build`
- Output directory remains:
  - `client/dist`
- Verify auth redirects against the hosted backend:
  - `/welcome`
  - `/login`
  - `/signup`
  - protected-route redirects
- Verify image rendering works with:
  - Cloudinary HTTPS URLs
  - existing local dev URLs during development
- Align frontend origin with backend CORS configuration.

## Deployment Roadmap

### 3H.2 - Environment config cleanup

- **Goal:** remove dangerous defaults and separate local-only from production-required config.
- **Likely files changed:**
  - `server/app/core/config.py`
  - `server/app/main.py`
  - `server/app/db/database.py`
  - `client/src/lib/api.js`
  - `.env.example` files
  - docs
- **Tests required:**
  - local login
  - local wardrobe load
  - local uploads still work
  - production build still passes
- **Stop condition:**
  - production-required env vars are explicit
  - no automatic dev-user seeding in production path
  - no localhost fallback ambiguity

### 3H.3 - PostgreSQL compatibility + migration preparation

- **Goal:** prepare hosted PostgreSQL safely.
- **Likely files changed:**
  - `server/app/db/database.py`
  - Alembic config/files
  - schema/bootstrap docs
- **Tests required:**
  - connect to hosted/local Postgres
  - create schema cleanly
  - auth plus outfit plus clothing CRUD smoke tests
- **Stop condition:**
  - empty PostgreSQL database can be initialized safely
  - startup no longer depends on SQLite-specific sync behavior

### 3H.4 - Cloudinary image storage integration

- **Goal:** make production uploads cloud-backed while preserving local filesystem dev.
- **Likely files changed:**
  - `server/app/utils/upload.py`
  - outfit/clothing services
  - config/docs
- **Tests required:**
  - upload image
  - render image
  - delete image with record
  - do not delete external URLs
- **Stop condition:**
  - production uploads no longer depend on local disk

### 3H.5 - Deployment configs for frontend/backend

- **Goal:** add provider-specific deployment config and env wiring.
- **Likely files changed:**
  - provider config files
  - README / deployment docs
- **Tests required:**
  - preview deploy for frontend
  - backend deploy health check
  - CORS smoke test
- **Stop condition:**
  - frontend and backend can deploy independently from Git

### 3H.6 - Hosted staging deployment

- **Goal:** bring DigiCloset up in a non-production hosted environment.
- **Likely files changed:**
  - env config only
  - minimal deployment descriptors if needed
- **Tests required:**
  - end-to-end auth
  - wardrobe CRUD
  - capture
  - suggestions
  - profile
  - uploads
- **Stop condition:**
  - one stable staging environment works end-to-end

### 3H.7 - Production QA checklist

- **Goal:** verify that the hosted app is safe to make public.
- **Likely files changed:**
  - docs/checklists only
- **Tests required:**
  - auth isolation
  - protected routes
  - upload deletion safety
  - mobile visual QA
  - production env audit
- **Stop condition:**
  - release checklist is complete and risks are acknowledged

### 3I - PWA/installable app polish

- **Goal:** improve installability after hosting is stable.
- **Likely files changed:**
  - frontend manifest/icons/meta
  - service-worker-related config if chosen
- **Tests required:**
  - install prompt behavior
  - icon/manifest validation
  - offline expectations clearly scoped
- **Stop condition:**
  - installable shell behaves predictably without distorting the core app

## Risks

- Production boot path still behaves like local development.
- Startup auto-migrations hide schema issues until data is already live.
- Dev-user backfill leaks into hosted environments.
- Local filesystem assumptions break image persistence on stateless hosts.
- CORS misconfiguration blocks auth/session behavior after deployment.
- API docs remain unnecessarily public.
- AI route is deployed without intentional production support.
- SQLite-local expectations are mistaken for production-safe defaults.

## Rollback Notes

- Keep deployment work phased so environment cleanup lands before PostgreSQL or Cloudinary changes.
- Do not combine:
  - database migration
  - storage migration
  - host deployment
  in one checkpoint.
- First hosted rollout should be staging-only.
- If staging breaks:
  - roll back service config first
  - keep the local SQLite plus local uploads path untouched
  - avoid destructive data moves until staging is stable
