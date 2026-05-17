# Changelog

All notable changes to DigiCloset are documented here in chronological order.

This changelog tracks the product from the original full-stack scaffold to the current outfit-memory-first, mobile-first wardrobe experience.

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

Commit: see git history for the latest Phase 3D.3 checkpoint

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

Commit: pending current checkpoint

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

Commit: pending current checkpoint

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

Commit: pending current checkpoint

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

