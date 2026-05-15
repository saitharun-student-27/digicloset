# Changelog

All notable changes to DigiCloset are documented here.

## 2026-05-15 - Refine outfit memory UX and mobile wardrobe flow

### Product direction

- kept DigiCloset firmly outfit-memory-first
- avoided AI chat, avatars, shopping compatibility, analytics dashboards, and feature-heavy expansion
- strengthened daily-use usefulness instead of adding more speculative surfaces

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
- demoted history-heavy resurfacing until enough real usage exists

### Wardrobe improvements

- corrected favorites behavior so favorite outfits remain:
  - featured in Favorite Fits
  - present in All Outfit Memories
- improved wardrobe browsing as a digital closet rather than a management surface

### Suggestions cleanup

- re-scoped Suggestions so it no longer competes with Home
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

### Documentation

- replaced the old Phase 0 README with a full current-state project README
- added screenshots for the main app surfaces
- added a real changelog for ongoing release tracking

## Earlier foundation

Before the 2026-05-15 refinement cycle, DigiCloset had already established:

- FastAPI backend scaffold
- React + Vite frontend scaffold
- outfit-memory-first product direction
- initial wardrobe data model
- basic capture, wardrobe, and suggestions structure
