# Changelog

All notable changes to DigiCloset are documented here in chronological order.

This changelog tracks the product from the original full-stack scaffold to the current outfit-memory-first, mobile-first wardrobe experience.

## 2026-05-19 - Verify user-scoped uploads and full authenticated app isolation

Commit: `9021157`

### Phase 3E.4 scope

- verified user-scoped uploads for authenticated outfit and clothing creation
- verified old upload URL compatibility for earlier dev data
- verified logout/login switching against the shared wardrobe provider
- verified image cleanup behavior after authenticated delete flows
- verified full auth-aware browser behavior across protected app pages

### Upload verification

- confirmed new outfit uploads save under:
  - `uploads/u_{user_id}/...`
- confirmed new clothing uploads save under:
  - `uploads/u_{user_id}/...`
- confirmed old top-level upload URLs still render correctly
- confirmed external URLs remain ignored by local cleanup
- confirmed safe file cleanup still works for nested user-scoped upload paths

### Isolation verification

- confirmed User B cannot see User A uploaded outfits
- confirmed User B cannot see User A clothing pieces
- confirmed User B cannot open User A outfit or piece ids
- confirmed cross-user clothing-item linking is blocked safely
- confirmed suggestions remain user-scoped after auth

### Auth-aware app QA

- confirmed unauthenticated app entry goes to:
  - `/welcome`
- confirmed:
  - login
  - signup
  - refresh persistence
  - logout
  - protected-route redirect after logout
- confirmed authenticated access to:
  - Home
  - Wardrobe
  - Outfit Memory
  - Suggestions
  - Outfit Detail
  - Piece Detail

### Orphaned upload audit fix

- fixed `scripts/check-orphaned-uploads.py` so it now scans nested upload folders instead of only top-level files
- this makes orphan reporting accurate for user-scoped upload directories like:
  - `uploads/u_{user_id}/...`

### Result

- DigiCloset now has verified user-scoped upload behavior and a clean end-to-end auth/app QA pass
- historical orphan files remain detectable, but no new orphan files were introduced by the Phase `3E.4` tests

## 2026-05-19 - Add searchable category taxonomy for Indian and western wardrobes

Commit: `0b56ff6`

### Phase 3F.1 scope

- added a shared wardrobe taxonomy that supports:
  - western clothing
  - Indian traditional clothing
  - Indo-western sets
  - one-piece / full-body clothing
  - footwear
  - accessories
- added a searchable category picker for piece entry and editing flows
- added alias normalization for messy category input without rewriting old database records
- improved wardrobe grouping and category display labels across the app

### Taxonomy additions

- introduced canonical grouped categories for:
  - Western upperwear
  - Western lowerwear
  - One-piece / Full body
  - Outerwear
  - Indian upperwear
  - Indian lowerwear
  - Indian full outfit
  - Drapes
  - Footwear
  - Accessories
  - Base layers
  - Activewear
  - Other
- added alias normalization such as:
  - `tee` -> `t_shirt`
  - `pant` -> `pants`
  - `frock` -> `dress`
  - `sari` -> `saree`
  - `chunni` -> `dupatta`
  - `lehenga choli` -> `lehenga`
  - `jutti` -> `juttis`

### Picker and display improvements

- added a lightweight searchable `CategoryPicker`
- integrated it into:
  - Quick Add Piece
  - Clothing form flows
  - piece editing
  - outfit-memory piece entry
- updated category display labels so raw values like:
  - `t_shirt`
  - `co_ord_set`
  - `salwar_suit`
  - `indo_western_set`
  become readable UI labels

### Grouping behavior

- wardrobe grouping now uses shared category normalization instead of narrow hardcoded buckets
- old records remain safe:
  - no automatic database rewrite was performed
  - unknown/custom categories still display safely and group under `Other`

### Backend compatibility

- widened backend clothing-category validation so expanded canonical and custom normalized category strings can persist safely
- did not change:
  - auth
  - user ownership
  - uploads
  - broader product behavior

### Result

- DigiCloset now handles mixed Indian and western wardrobes more realistically
- category entry is faster and more forgiving
- wardrobe sections and outfit breakdowns are more reliable and readable

## 2026-05-19 - Add wardrobe search and lightweight filtering

Commit: `a1bcda0`

### Phase 3F.2 scope

- added a mobile-friendly search bar to Wardrobe
- added frontend-only matching across saved outfits and wardrobe pieces
- preserved the normal closet layout when search is empty
- added a calm search-results mode and empty state

### Search behavior

- search now matches outfit memories by:
  - title
  - description
  - occasion
  - season
  - style
  - source type
  - linked piece names
  - linked piece categories
- search now matches wardrobe pieces by:
  - name
  - category
  - normalized category label
  - category section
  - color
  - season
  - occasion
  - style
  - formality level

### Taxonomy-aware matching

- search uses shared taxonomy helpers so queries like:
  - `t shirt`
  - `saree`
  - `footwear`
  - `indian`
  match normalized categories and wardrobe sections more naturally
- no database values are rewritten during search

### Search active mode

- when search is empty:
  - Wardrobe stays in its normal rail-and-section closet layout
- when search is active:
  - Wardrobe shows:
    - `Matching Outfit Memories`
    - `Matching Wardrobe Pieces`
- added a calm empty state:
  - `No matching wardrobe memories.`
  - `Try a color, category, outfit title, or occasion.`

### Safety and QA

- search only uses the authenticated user’s already-loaded wardrobe data
- no backend search endpoint was introduced
- verified:
  - no-token redirect
  - authenticated search behavior
  - clear-search return to normal layout
  - empty-state behavior
  - new-user isolation from dev-user wardrobe data

### Result

- DigiCloset now makes growing wardrobes easier to navigate without turning Wardrobe into a dashboard or admin table

## 2026-05-19 - Add autosuggest metadata fields and chip inputs

Commit: `4ac1cf3`

### Phase 3F.3 scope

- extended the shared wardrobe taxonomy beyond categories into:
  - color
  - season
  - occasion
  - style
  - formality
- added reusable autosuggest and chip-input components
- integrated normalized metadata entry into piece and outfit flows
- kept Capture lightweight while making common inputs cleaner and more consistent

### Taxonomy additions

- added deterministic normalization for inputs such as:
  - `off white` -> `off_white`
  - `mehroon` -> `maroon`
  - `monsoon` -> `rainy`
  - `marriage` -> `wedding`
  - `indo western` -> `indo_western`
  - `smart casual` -> `smart_casual`
- preserved unknown values safely instead of crashing or rewriting old records
- added readable field labels such as:
  - `Off white`
  - `All season`
  - `Wedding`
  - `Indo-western`
  - `Smart casual`

### UI integration

- added reusable:
  - `AutosuggestField`
  - `ChipSelect`
- integrated them into:
  - `ClothingForm`
  - `Capture` Quick Add Piece
  - `PieceDetail` edit flow
  - `OutfitMemoryForm`
  - `OutfitEditModal`
- kept `CategoryPicker` in place for category-specific entry

### Display and search cleanup

- cleaned metadata labels across:
  - clothing cards
  - piece detail
  - outfit cards
  - outfit detail
  - scan-result previews
- updated Wardrobe search so normalized metadata is discoverable through user-friendly queries like:
  - `off white`
  - `monsoon`
  - `indo western`
  - `smart casual`
  - `wedding`

### Backend alignment

- widened backend season and occasion schema acceptance so normalized frontend values can persist safely
- did not change:
  - auth
  - ownership logic
  - product scope

### Result

- DigiCloset now collects cleaner metadata without making forms feel heavier
- metadata displays more gracefully across the app
- wardrobe search stays aligned with what users naturally type

## 2026-05-19 - Add existing wardrobe piece search inside the outfit builder

Commit: latest Phase 3F.4 checkpoint on `main`

### Phase 3F.4 scope

- added existing-piece search inside the outfit-memory text builder
- made it easier to reuse current wardrobe pieces before creating new ones
- kept manual new-piece entry available as a fallback
- preserved mixed outfit creation using:
  - existing linked pieces
  - new manual pieces

### Current builder findings

- the backend already supported linking existing `clothing_item_id` values into outfits
- the frontend outfit service was not yet sending `clothing_item_ids`
- the text-based outfit builder only surfaced manual new-piece creation before this phase
- current-user clothing data was already available through `WardrobeDataProvider`

### Reuse-first builder behavior

- added a `Reuse from your wardrobe` search block inside `OutfitMemoryForm`
- search now matches current-user wardrobe pieces by:
  - name
  - category
  - normalized category label
  - category section
  - color
  - season
  - occasion
  - style
- added a `Selected pieces` area that shows:
  - image when available
  - piece name
  - category
  - color
  - `Existing piece` marker
  - remove action

### Mixed outfit support

- outfit creation now sends `clothing_item_ids` alongside new manual pieces
- verified mixed outfits can save with:
  - reused existing wardrobe pieces
  - new supporting pieces created only when needed
- verified removing a selected existing piece only removes it from the pending outfit, not from the wardrobe

### Ownership and safety

- existing-piece search only uses the authenticated user’s already-loaded wardrobe pieces
- backend ownership checks continue to block cross-user clothing linking
- browser and API verification confirmed a second user cannot see or attach the dev user’s searched pieces

### Result

- DigiCloset now makes wardrobe reuse easier than duplication during outfit creation
- outfit memory stays primary while clothing pieces become cleaner reusable support data

## 2026-03-15 - Initial commit - DigiCloset full-stack app

Commit: `31fee73`

### What started here

- created the first full-stack DigiCloset scaffold
- added the initial React + Vite frontend
- added the initial Python backend
- introduced early wardrobe, upload, and try-on experiments

### Initial frontend shape

- basic Home page
- Closet / wardrobe-facing screens
- upload component
- outfit generator component
- virtual try-on component

### Initial backend shape

- first wardrobe model
- first wardrobe routes
- uploads directory
- basic environment setup

### Historical note

This was the earliest broad concept stage, before DigiCloset was refocused around outfit memory as the primary product unit.

## 2026-05-10 - Initialize DigiCloset full-stack foundation

Commit: `7aa41ac`

### Foundation reset

- replaced the earlier broad prototype structure with a cleaner app foundation
- reorganized the backend into a more maintainable modular FastAPI structure
- introduced:
  - `api/routes`
  - `core`
  - `db`
  - `models`
  - `schemas`
  - `services`
  - `utils`

### Backend setup

- added a proper `main.py`
- added health route support
- added config and database bootstrap files
- added a server-specific README and cleaner environment handling

### Frontend cleanup

- removed early prototype-heavy frontend features
- reduced the app back to a cleaner starting point
- aligned the repository more closely with a product that could grow intentionally

### Why this phase mattered

This was the structural reset that made the later product direction possible.

## 2026-05-10 - Add clothing item backend foundation

Commit: `b0c4e0b`

### Backend wardrobe data layer

- added `clothing_item` model
- added clothing item schemas
- added clothing routes
- added wardrobe service support for clothing pieces
- updated database wiring for clothing persistence

### Result

DigiCloset gained its first real backend foundation for storing reusable wardrobe pieces.

## 2026-05-10 - Build wardrobe frontend and enhance branding

Commit: `c16c87f`

### Frontend wardrobe experience

- added branded frontend presentation
- added a wardrobe page
- added clothing cards
- added clothing form support
- added loading, empty, and error state components
- added brand/logo components
- added frontend service layer for clothing items

### Visual direction

- improved branding
- introduced a more intentional presentation style
- moved beyond a bare scaffold toward an actual product surface

### Result

DigiCloset became a recognizably branded wardrobe app instead of only a backend-first scaffold.

## 2026-05-10 - Add optional clothing image upload

Commit: `abec612`

### Upload support

- added optional clothing image upload
- added upload utilities on the backend
- updated clothing form and clothing card behavior
- added configuration for upload handling
- ensured the backend could save uploaded clothing images safely

### Result

Wardrobe pieces could now carry visual memory support through uploaded images.

## 2026-05-11 - Refactor DigiCloset around outfit memory

Commit: `56bef30`

### Major product direction change

- introduced `PROJECT_RULES.md` as the permanent source of truth
- formally redefined DigiCloset as an outfit-memory-first product
- made outfits the primary user-facing asset

### Frontend changes

- added `AppShell`
- added `OutfitMemoryForm`
- added `OutfitShowcaseCard`
- added outfit-first Home
- added outfit-memory page
- reshaped Wardrobe around the new hierarchy

### Backend changes

- added outfit model
- added outfit schemas
- added outfit routes
- added outfit service layer

### Why this phase mattered

This was the real product identity shift.

DigiCloset stopped being "clothing inventory with outfit support" and became "outfit memories supported by wardrobe pieces."

## 2026-05-11 - Unify outfit capture and support quick add pieces

Commit: `f5b2517`

### Capture flow improvements

- refined the outfit capture flow
- expanded reusable outfit utilities
- improved wardrobe behavior around piece support
- kept Quick Add Piece available while preserving outfit-first hierarchy

### Backend alignment

- updated clothing and outfit schemas
- improved outfit service behavior
- improved wardrobe service behavior

### Result

The outfit-memory flow became more coherent while still allowing single-piece support when needed.

## 2026-05-11 - Split outfit memory into three capture paths

Commit: `34ac1a2`

### Capture path refinement

- split outfit capture into three distinct save modes
- refined the main outfit memory form around clearer user paths
- updated backend schema/service support to handle those flows more safely

### Result

DigiCloset moved away from one heavy capture form and toward a more flexible outfit-memory creation experience.

## 2026-05-12 - Add vault capture and resilient AI suggestion flows

Commit: `f1806c7`

### Page structure expansion

- added `Capture`
- added `Vault`
- added `Suggestions`
- improved `App.jsx` routing
- updated `AppShell`

### Suggestions and assistive systems

- introduced backend AI route scaffolding
- introduced backend suggestions route scaffolding
- added suggestion service logic
- added AI service support

### Product data support

- added seed script
- expanded outfit service behavior
- improved clothing and outfit service coordination

### Result

This phase created the broad app shape that the later refinement phases would polish:

- capture
- wardrobe browsing
- suggestions

## 2026-05-15 - Refine outfit memory UX and mobile wardrobe flow

Commit: `3e0befe`

### Product direction

- kept DigiCloset firmly outfit-memory-first
- avoided AI chat, avatars, shopping compatibility, analytics dashboards, and feature-heavy expansion
- strengthened daily-use usefulness instead of adding speculative systems

### Outfit lifecycle consistency

- standardized outfit actions across the app:
  - edit
  - delete
  - favorite / unfavorite
  - mark worn
- aligned behavior for newly created outfits and backend-fetched outfits
- reused shared outfit card patterns more consistently

### Piece detail flow

- added a dedicated piece detail route:
  - `/pieces/:id`
- added related outfit memory surfacing for pieces
- kept delete safety in place for linked pieces

### Classification cleanup

- improved clothing category-to-section mapping
- made grouping more consistent across:
  - Wardrobe
  - piece display
  - capture support flows
  - closet organization logic

### Mobile-native layout pass

- improved viewport and root layout behavior
- tightened safe-area and bottom dock handling
- refined mobile card widths and rail sizing
- improved capture, wardrobe, and piece detail behavior on narrow screens

### Upload validation

- increased image upload limit from 5 MB to 10 MB
- applied the same 10 MB rule in:
  - frontend validation
  - backend validation
  - AI scan uploads
  - outfit upload flows
  - piece upload flows
- kept format validation for:
  - jpg
  - jpeg
  - png
  - webp

### Home redesign

- refactored Home around daily usefulness
- introduced adaptive Home states based on wardrobe maturity
- added deterministic starter looks from real closet pieces when outfit history is still shallow
- reduced forced rediscovery on low-data accounts
- demoted history-heavy resurfacing until enough real usage existed

### Home rule refinement

- corrected `Today’s Fit` so it now appears only when a real outfit was saved that day
- stopped forcing a synthetic “today” hero card when no outfit was actually added that day
- let recommendation and starting-point rails lead the page when there is no fresh same-day outfit memory

### Wardrobe improvements

- corrected favorites behavior so favorite outfits remain:
  - featured in Favorite Fits
  - present in All Outfit Memories
- improved wardrobe browsing as a digital closet rather than a management surface

### Suggestions cleanup

- re-scoped Suggestions so it no longer competed with Home
- moved it toward quieter resurfacing and rotation
- hid low-signal empty rails
- kept rediscovery deterministic and explainable

### Emotional and editorial refinement

- improved outfit memory framing
- improved generated note tone
- softened copy across rediscovery surfaces
- reduced dashboard-like language

### Layout and composition refinement

- improved Home composition and section rhythm
- improved rail behavior and spacing consistency
- reduced oversized empty states
- strengthened surface unification and layout cohesion

### Performance / perceived loading

- added route-level lazy loading in the frontend
- reduced the main entry bundle and split pages into route chunks
- improved first-load efficiency without changing product scope

## 2026-05-15 - Document current DigiCloset product state

Commit: `a0ca408`

### Documentation

- replaced the old Phase 0 README with a full current-state project README
- added a real release-style changelog
- added screenshots for:
  - Home
  - Outfit Memory
  - Wardrobe
  - Suggestions
  - Piece Detail

### Maintenance support

- documented how to refresh screenshots with headless Edge
- documented current setup, routes, upload rules, strengths, and known gaps

### Result

The repo now reflects the actual current DigiCloset product state instead of only its early scaffold.

## 2026-05-15 - Add shared client data layer and faster mutations

Commit: `0ef658f`

### Why this phase happened

- the app had become structurally strong, but many simple actions still triggered full page or list refetches
- this made common flows feel slightly prototype-like even when the product direction was correct

### Shared client data layer

- added `WardrobeDataProvider` to manage shared frontend state for:
  - outfits
  - clothing items
  - loading
  - error
  - pending mutation state
- exposed shared refresh helpers:
  - `refreshOutfits()`
  - `refreshClothing()`
  - `refreshAll()`
- exposed shared mutation helpers:
  - favorite / unfavorite outfit
  - mark outfit worn
  - update outfit
  - delete outfit
  - create piece
  - update piece
  - delete piece

### Faster mutation handling

- added optimistic updates for:
  - favorite / unfavorite
  - mark worn
- added near-instant local updates with rollback for:
  - edit outfit metadata
  - delete outfit
  - edit piece
  - delete piece
- reduced page-wide flicker after small actions

### Page integration

- updated:
  - `Home`
  - `Capture`
  - `Wardrobe`
  - `Suggestions`
  - `Piece Detail`
- reduced page-level duplication of fetch and mutation handlers
- improved cross-page consistency when navigating after an action

### Result

DigiCloset now feels more cohesive during repeated use:

- favorites update faster
- worn tracking updates faster
- edits and deletes propagate more consistently
- shared wardrobe state reduces duplicate fetching without introducing heavy state-management tooling

## 2026-05-17 - Add Outfit Detail page and card-to-detail flow

Commit: `f87af2c`

### Outfit detail route

- added a dedicated outfit detail route:
  - `/outfits/:id`
- added lazy route wiring without breaking:
  - `/`
  - `/outfit-memory`
  - `/wardrobe`
  - `/suggestions`
  - `/pieces/:id`

### Outfit detail experience

- added a memory-led Outfit Detail page
- added:
  - back navigation
  - large outfit image / placeholder
  - calm outfit metadata context
  - favorite / worn / edit / delete actions
  - grouped piece breakdown with links to piece detail
- kept the page mobile-first and avoided turning it into a CRUD-heavy detail screen

### Card-to-detail flow

- updated outfit cards so the primary preview surface now opens:
  - `/outfits/:id`
- kept quick actions separate from navigation to avoid nested button/link conflicts
- clarified the product pattern:
  - card = preview
  - detail page = depth + actions

### Shared-state integration

- reused shared provider helpers for:
  - favorite
  - mark worn
  - edit metadata
  - delete
- added cached + fetch-backed outfit detail loading behavior
- fixed deleted or missing outfit routes so they settle into a clean not-found state instead of looping

## 2026-05-17 - Verify shared wardrobe state in a real browser

Commit: `fae8121`

### Browser verification tooling

- added Playwright-based verification support for shared wardrobe state flows
- added reusable verification script:
  - `client/scripts/verify-shared-data-layer.mjs`

### Verified flows

- favorite on Home -> Wardrobe Favorite Fits
- mark worn -> Home updates
- edit title -> Home / Wardrobe / Suggestions update
- delete outfit -> removal across pages
- piece detail edit persistence
- linked piece delete protection

### Result

- DigiCloset now has a repeatable browser verification path for critical cross-page mutation behavior

## 2026-05-17 - Fix backend image/delete persistence and upload cleanup consistency

Commit: `f87af2c`

### Root issue

- frontend delete/edit actions could look successful while backend image/file cleanup stayed inconsistent
- local upload paths and SQLite paths were still too dependent on process working directory
- old orphaned uploads from earlier bugs remained undetectable in the normal product flow

### Backend persistence fixes

- made SQLite database resolution stable relative to the `server` app directory
- made upload directory resolution stable relative to the `server` app directory
- added safe local upload cleanup helpers:
  - `resolve_local_upload_path(image_url)`
  - `is_safe_upload_path(image_url)`
  - `delete_uploaded_file(image_url)`
- ignored external image URLs during file cleanup
- ensured missing files do not break core DB deletion flows

### Outfit and clothing consistency

- deleting an outfit now:
  - removes the outfit row
  - removes outfit-item links
  - deletes the local uploaded image if it belongs to this app
- deleting a standalone clothing piece now:
  - removes the clothing row
  - deletes the local uploaded image if it belongs to this app
- deleting a linked clothing piece remains blocked safely
- outfit image removal via backend update now persists `image_url = null`
- clothing image removal via backend update now persists `image_url = null`

### Frontend sync improvements

- shared wardrobe provider now silently revalidates outfits/clothing after successful critical mutations
- reduces the chance of stale cache after delete/update actions
- keeps backend as the source of truth instead of relying on local-only optimistic state

### Orphaned upload audit

- added developer script:
  - `scripts/check-orphaned-uploads.py`
- reports:
  - orphaned local upload files
  - DB image URLs whose files are missing
  - external image URLs

### Verification result

- route-level persistence tests confirmed:
  - delete outfit with image -> DB row gone, links gone, file gone
  - delete standalone piece with image -> DB row gone, file gone
  - linked piece delete -> `409 Conflict`
  - remove outfit image -> DB null + file gone
  - remove piece image -> DB null + file gone

## 2026-05-17 - Add backend auth foundation

Commit: `0cc48cb`

### Scope of this phase

- added backend authentication foundation only
- did not add frontend login/signup yet
- did not add `user_id` ownership to wardrobe tables yet
- did not change outfit/clothing APIs to user-scope yet

### Auth model and schemas

- added `users` table model
- added auth schemas for:
  - signup
  - login
  - user read
  - token response

### Password hashing and token utilities

- added secure password hashing using PBKDF2-HMAC SHA-256
- added JWT-style bearer token creation and verification using HMAC SHA-256
- added auth settings:
  - `SECRET_KEY`
  - `ACCESS_TOKEN_EXPIRE_MINUTES`
  - `JWT_ALGORITHM`

### Auth service and dependency

- added auth service helpers for:
  - create user
  - authenticate user
  - get user by email
  - get user by id
- added `get_current_user` dependency for protected backend use

### Auth routes

- added:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- kept wardrobe routes untouched in this phase

### Verification

- backend compile passed
- signup / duplicate signup / login / wrong-password / me route behavior verified against a clean app instance

## 2026-05-17 - Add backend user ownership filtering and local dev backfill

Commit: `fbe32c5`

### Scope of this phase

- added real backend ownership boundaries
- did not add frontend auth yet
- did not migrate to PostgreSQL
- did not change product UX

### Model ownership changes

- added `user_id` to:
  - `outfits`
  - `clothing_items`
- added ownership relationships between:
  - `User`
  - `Outfit`
  - `ClothingItem`
- kept `outfit_items` ownership derived through outfit and clothing item records

### Local migration / backfill

- added an idempotent local migration script:
  - `scripts/migrate_user_ownership.py`
- added startup-safe backfill support for SQLite development
- created or reused a default local dev user:
  - `dev@digicloset.local`
- preserved existing local outfit and clothing data by assigning missing ownership instead of resetting the database

### Backend route protection

- protected wardrobe routes with `get_current_user`:
  - `GET /api/outfits`
  - `GET /api/outfits/{id}`
  - `POST /api/outfits`
  - `PUT /api/outfits/{id}`
  - `DELETE /api/outfits/{id}`
  - `POST /api/outfits/{id}/favorite`
  - `POST /api/outfits/{id}/worn`
  - `GET /api/clothing`
  - `GET /api/clothing/{id}`
  - `POST /api/clothing`
  - `PUT /api/clothing/{id}`
  - `DELETE /api/clothing/{id}`
  - `GET /api/clothing/{id}/outfits`
  - `GET /api/suggestions`

### Service-level ownership filtering

- outfits now:
  - list only current-user outfits
  - fetch only current-user outfits
  - create with current-user ownership
  - block cross-user edits, deletes, favorite, and worn updates
- clothing items now:
  - list only current-user pieces
  - fetch only current-user pieces
  - create with current-user ownership
  - block cross-user edits and deletes
- suggestions now:
  - use only the authenticated user’s outfits, pieces, favorites, and wear history

### Cross-user protection

- blocked linking another user’s clothing item into a new outfit
- returned safe not-found behavior for cross-user access attempts
- kept linked-piece delete protection in place for same-user outfit links

### Upload scope preparation

- prepared new local uploads to support user-scoped paths like:
  - `uploads/u_{user_id}/...`
- kept old upload URLs working without bulk file moves

### Verification

- backend compile passed
- two-user privacy verification passed:
  - User B could not see User A outfits
  - User B could not edit or delete User A data
  - User B could not link User A clothing into a User B outfit
- missing-token tests returned `401`
- existing local data remained visible to the default dev user after login

### Temporary state after this phase

- backend privacy boundaries now exist
- frontend auth is still not wired
- the app frontend will need Phase `3E.3` before it can call protected wardrobe APIs normally

## 2026-05-18 - Add dev user password reset utility

Commit: `9768ad2`

### Scope of this phase

- added a development-only password reset utility for the backfilled default dev user
- did not change production auth behavior
- did not modify wardrobe ownership
- did not wipe or reset data

### Utility added

- added:
  - `scripts/reset_dev_user_password.py`
- behavior:
  - finds `dev@digicloset.local`
  - resets password using the existing password hashing helper
  - creates the dev user if missing
  - does not expose `password_hash`

### Verification

- login for `dev@digicloset.local` with `devpassword123` passed
- `GET /api/auth/me` passed
- existing outfit and clothing counts remained unchanged

## 2026-05-18 - Add frontend auth context, login/signup, and protected routes

Commit: `ceab689`

### Scope of this phase

- completed the frontend side of auth for the existing backend ownership system
- did not add OAuth, password reset, refresh tokens, or product-feature expansion
- kept the focus on making protected wardrobe APIs usable again from the app

### Frontend auth foundation

- added `AuthContext` to manage:
  - user
  - token
  - auth loading
  - session restore
  - login
  - signup
  - logout
- added auth service helpers for:
  - `signup`
  - `login`
  - `getMe`

### Token and API wiring

- added localStorage token persistence using:
  - `digicloset_access_token`
- attached bearer token headers centrally in the shared axios client
- added shared 401 handling to:
  - clear session state
  - avoid infinite redirect loops
  - push the app back toward login when the session is no longer valid

### Protected route behavior

- added public routes:
  - `/login`
  - `/signup`
- wrapped protected app routes so:
  - unauthenticated users are redirected to login
  - authenticated users can return to the route they originally asked for
- preserved lazy route loading and legacy route redirects

### Wardrobe data auth gating

- updated `WardrobeDataProvider` so it:
  - waits for auth resolution before fetching outfits and clothing
  - clears wardrobe state on logout
  - clears wardrobe state when 401 invalidates the session
  - fetches user-scoped wardrobe data only after successful auth

### Login and signup UX

- added a mobile-first login screen with calm DigiCloset tone
- added a mobile-first signup screen with simple validation
- kept the auth flow visually aligned with the rest of the app instead of turning it into a separate product
- included local dev helper credentials subtly on the login screen during development

### App shell auth behavior

- added a compact signed-in identity + logout control to the top shell
- kept the bottom dock unchanged
- made logout a quiet supporting action instead of a primary navigation item

### Verification

- production frontend build passed
- end-to-end browser auth QA passed for:
  - no-token redirect to login
  - dev user login
  - session persistence on refresh
  - wardrobe loading after login
  - outfit detail access
  - piece detail access
  - logout
  - protected route redirect after logout
  - signup for a new user
  - frontend-visible user data isolation
  - dev-user data restoration after logging back in

## 2026-05-18 - Redesign auth screens to match DigiCloset reference mood

Commit: `7a901a8`

### Phase 3E.3B visual redesign

- introduced a dedicated auth visual system instead of plain functional auth screens
- added a shared auth shell for:
  - warm ivory / linen background
  - editorial DigiCloset lockup
  - black pill CTA styling
  - calmer mobile-first form rhythm
- redesigned:
  - `Login`
  - `Signup`
- kept auth behavior unchanged while moving the visual tone closer to the generated DigiCloset reference

### What this changed emotionally

- auth no longer felt like a generic product utility screen
- the entry experience now better matched the app’s theme:
  - calm
  - premium
  - wardrobe-memory-first

## 2026-05-18 - Correct auth flow into separate mobile-style welcome, login, and signup screens

Commit: `7a901a8`

### Phase 3E.3C correction

- replaced the desktop-leaning auth composition with a true mobile-style auth flow
- added a dedicated public welcome route:
  - `/welcome`
- kept:
  - `/login`
  - `/signup`
- updated protected-route fallback so unauthenticated users now land on `/welcome`

### Welcome screen

- added a standalone welcome screen inspired by the left-side reference phone
- included:
  - DigiCloset lockup
  - `YOUR WARDROBE, remembered.`
  - wardrobe-inspired soft visual scene
  - curved lower ivory panel
  - `Open My Closet`
  - `Create New Closet`

### Login and signup correction

- added back-arrow navigation from:
  - login -> welcome
  - signup -> welcome
- tightened mobile spacing so primary CTAs sit more like real phone screens
- kept signup clearly reachable from both:
  - welcome
  - login
- kept signup visually aligned with login

### Dev-helper correction

- removed the prominent dev credentials card
- replaced it with a tiny development-only helper:
  - `Local dev account available`
  - optional `Fill dev login`
- stopped showing the dev password openly by default

### Verification

- frontend build passed
- browser QA passed for:
  - welcome -> login
  - welcome -> signup
  - login -> signup
  - signup -> login
  - invalid login error
  - dev login
  - refresh persistence
  - logout -> welcome
  - protected route redirect after logout
  - signup new user
  - duplicate signup error
- responsive browser checks passed for:
  - `360 x 800`
  - `390 x 844`
  - `414 x 896`
  - desktop

