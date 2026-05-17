# DigiCloset Project Rules

## 1. Purpose of This Document

`PROJECT_RULES.md` is the permanent architectural and product source of truth for DigiCloset.

Its job is to prevent:
- architecture drift
- feature explosion
- inventory-first regressions
- fake AI implementations
- inconsistent UX direction
- short-term demo choices that damage long-term product quality

Any new feature, refactor, schema change, page design, or prompt-driven implementation must be evaluated against this document first.

If a future request conflicts with these rules, these rules win unless the project direction is explicitly redefined.

---

## 2. Product Vision

DigiCloset is a personal wardrobe intelligence platform centered on outfit memory, style organization, and future personalized outfit guidance.

DigiCloset is not a clothing inventory app.

DigiCloset is:
- an outfit-memory-first system
- a digital closet experience
- a wardrobe organization platform
- a future AI wardrobe companion
- a personalized style memory product

The user-facing value is:
- remembering complete looks
- rediscovering past combinations
- organizing wardrobe pieces around outfits
- preparing the foundation for trustworthy personalization

The product should feel like:
- premium
- calm
- visually organized
- personal
- style-aware
- deliberate

The product must not feel like:
- an admin dashboard
- a spreadsheet UI
- an e-commerce storefront
- a generic fashion social app
- a fake AI wrapper around CRUD

---

## 3. Core Product Philosophy

### 3.1 Primary product unit
The primary product unit is the **outfit memory**, not the single clothing item.

Users should think:
- "I saved a look"
- "I remembered an outfit"
- "I can revisit a combination"

Users should not primarily think:
- "I added an item row"
- "I filled an inventory form"
- "I manage clothing records"

### 3.2 Supporting product unit
`clothing_items` exist as reusable supporting wardrobe data behind outfit memories.

They are important for:
- wardrobe organization
- outfit composition
- future compatibility logic
- future suggestion logic

They are not the main emotional or UX center of the product.

### 3.3 Intelligence philosophy
No intelligence layer should be claimed before the data foundation is real.

Trustworthy wardrobe intelligence must be built on:
- outfit memories
- structured clothing pieces
- style preferences
- actual reuse patterns
- explainable rule-based logic first

### 3.4 Product sequencing
The product must progress in this order:
1. outfit memory
2. wardrobe organization
3. style profile
4. rule-based suggestions
5. visual mannequin/avatar preview
6. shopping compatibility
7. deeper AI assistance

Do not reverse this order casually.

---

## 4. Primary UX Hierarchy

The UX hierarchy for DigiCloset is fixed:

1. **Outfit experiences**
2. **Outfit memories**
3. **Wardrobe visualization**
4. **Clothing pieces as supporting structure**
5. **Future suggestions and intelligence**

This means:
- the home page should focus on outfit experiences
- outfit creation should be the primary creation flow
- wardrobe browsing should feel like opening a closet
- individual clothing management must remain secondary

If a page starts feeling like a CRUD panel, the hierarchy has been broken.

---

## 5. Outfit-First Architecture Rules

### 5.1 Domain priority
`outfits` are the primary user-facing asset.

### 5.2 Data relationship
Each outfit may:
- contain many outfit pieces
- link to multiple `clothing_items`
- have optional image memory
- have generated descriptive notes
- have contextual metadata like season, occasion, and style

### 5.3 Required mental model
The system should model:
- a saved look first
- extracted pieces second

Never model the app around:
- a closet full of isolated items with outfits as an afterthought

### 5.4 Creation flow rule
Primary creation flow must be:
1. capture outfit
2. break down pieces
3. add context
4. save memory

Primary creation flow must not be:
1. add shirt
2. add pants
3. add shoes
4. maybe build an outfit later

### 5.5 API rule
`POST /api/outfits` is the strategic creation path.

`POST /api/clothing` may remain available, but it is supporting infrastructure, not the flagship workflow.

---

## 6. Home Page Rules

The home page must be outfit-centric only.

### 6.1 Home page may show
- today's fit
- recent outfit memories
- seasonal fits
- saved combinations
- future mannequin/avatar preview modules
- future style insights
- future personalized suggestion rails

### 6.2 Home page must not show
- raw clothing inventory
- clothing CRUD forms
- isolated item grids as the main content
- admin-style stats as the primary product story
- generic dashboard widgets that reduce the product to operational metrics

### 6.3 Home page emotional goal
The home page should feel like:
- entering a personal wardrobe companion
- rediscovering style memories
- getting oriented around complete looks

It should not feel like:
- checking a database
- managing a catalog

### 6.4 Today's Fit truthfulness rule
`Today's Fit` should represent a real same-day outfit memory when one exists.

Do:
- show a real outfit saved today as `Today's Fit`
- let recommendations lead when no same-day outfit memory exists

Do not:
- force a fake `Today's Fit` card when the user did not actually save a look that day

---

## 7. Wardrobe Page Rules

The wardrobe page should feel like opening a real digital closet.

### 7.1 Wardrobe page may show
- upperwear
- lowerwear
- footwear
- accessories
- saved outfits as contextual anchors
- outfit-linked wardrobe organization
- lightweight filters by season, occasion, color, or category

### 7.2 Wardrobe page must not become
- a spreadsheet
- a table-first admin panel
- a form-first item management page
- the primary place for single-item creation

### 7.3 Wardrobe page hierarchy
Within wardrobe:
- complete outfit memories come first or remain clearly visible
- individual pieces are secondary
- clothing sections must feel spatially grouped, not flat-listed

### 7.4 Wardrobe page CTA rule
Primary call to action on wardrobe should push users toward **Outfit Memory**, not toward item-by-item inventory entry.

---

## 8. Backend Architecture Boundaries

### 8.1 Required backend style
Backend must remain modular, service-oriented, and domain-separated.

### 8.2 Core backend entities
Current or near-term core entities:
- `clothing_items`
- `outfits`
- `outfit_items`
- `style_profiles`

Future entities:
- `avatar_profiles`
- `saved_combinations`
- `suggestions`
- `style_insights`
- `wardrobe_analytics`
- `shopping_candidates`
- `compatibility_scores`

### 8.3 Service-layer rule
Business logic belongs in services, not route files.

Routes should:
- validate request entry points
- call service functions
- map service errors to HTTP responses

Routes should not:
- implement multi-step domain orchestration inline
- contain ad hoc upload logic
- contain recommendation logic

### 8.4 Model rule
Schema and ORM design must support:
- multiple outfits using a piece
- outfits as first-class assets
- future personalization
- future user scoping

### 8.5 User-scoping rule
Even if auth is not yet implemented, backend design should be ready for eventual `user_id` ownership across major entities.

Do not paint the schema into a single-user-only corner.

### 8.6 Migration discipline
Do not add speculative tables without a product reason and a near-term usage path.

### 8.7 Auth sequencing rule
Authentication foundation may be introduced before full wardrobe ownership, but private-user claims must not be made until backend ownership filtering is actually enforced.

Do:
- add backend auth in a narrow foundation phase first when needed
- add `user_id` ownership and service-level filtering as the next step

Do not:
- imply that wardrobes are private per user before outfit and clothing ownership checks exist
- ship frontend auth screens as if privacy is complete while backend wardrobe routes are still global


### 8.8 Ownership enforcement rule
Once backend ownership filtering is introduced:
- outfits must be filtered by authenticated user ownership
- clothing items must be filtered by authenticated user ownership
- suggestions must be filtered by authenticated user ownership
- routes must derive ownership from `current_user`, never from request body `user_id`

Do not:
- leave list endpoints global after auth exists
- allow cross-user outfit-to-piece linking
- treat frontend auth screens as the privacy boundary instead of backend ownership checks
---

## 9. Frontend Architecture Boundaries

### 9.1 Page hierarchy
Primary pages:
- `Home`
- `Outfit Memory`
- `Wardrobe`

Future pages:
- `Suggestions`
- `Style Profile`
- `Avatar Preview`
- `Shopping Compatibility`

### 9.2 UI responsibilities
- pages own flow and layout composition
- components own reusable presentation and focused interactions
- services own API access

### 9.3 Forbidden frontend architecture patterns
Do not:
- bury business logic inside display components
- mix API calls across many unrelated components
- let a single page become a dumping ground for all product behaviors
- keep obsolete inventory-first components active in the main flow

### 9.4 Visual hierarchy rule
Outfit cards should carry more visual weight than clothing cards.

### 9.5 State rule
Persistent product data belongs in the backend, not in `localStorage`, except for narrowly scoped temporary drafts if explicitly justified.

### 9.6 Shared client state rule
Shared frontend product data may use a lightweight provider or hook when it reduces duplicate fetching, avoids page-to-page state drift, and keeps outfit or wardrobe mutations feeling fast.

Do:
- centralize common outfit and clothing fetches when reused across pages
- centralize common mutation helpers when the same actions appear on multiple pages
- keep rollback and error handling understandable

Do not:
- introduce heavy frontend state-management libraries without a real scaling need
- split the same persistent outfit state across many unrelated page-level sources of truth

### 9.7 Backend source-of-truth rule
Persistent delete, edit, and image-removal behavior must be validated against backend state, not only against immediate frontend appearance.

Do:
- treat the backend and committed database state as the source of truth
- ensure delete/update success means the next refresh still reflects the same result
- revalidate shared frontend state after critical mutations when useful

Do not:
- fake-delete items or images only in local UI state
- leave `image_url` values stale in the database after image removal
- treat a preview-only image removal as if persisted backend removal already happened

---

## 10. Allowed Future Phases

Allowed future phases, in order:

### Phase 3A
- outfit-first UX refactor

### Phase 3B
- style profile structure and page

### Phase 3C
- stronger digital closet organization

### Phase 3D
- outfit-centric home personalization using real backend data

### Phase 3E
- saved combinations and rule-based suggestions

### Phase 3F
- 2D mannequin/avatar-ready payloads and preview architecture

### Phase 4
- shopping compatibility
- gap analysis
- style insight generation

### Phase 5
- AI-assisted outfit detection
- explainable AI suggestions
- conversational stylist agent

Any phase that skips ahead must justify why it will not weaken the data foundation.

---

## 11. Explicitly Rejected Directions

The following directions are explicitly rejected unless the product is intentionally re-scoped:

- inventory-first home page
- clothing CRUD as the main journey
- e-commerce store behavior
- social feed behavior
- follower/creator/influencer mechanics
- fake AI outfit generator claims
- premature 3D avatar systems
- metaverse framing
- overly futuristic cyber-fashion branding
- random analytics dashboards with no wardrobe meaning
- feature stuffing for demo theater

If a future request resembles one of these, it should be challenged, not blindly implemented.

---

## 12. AI Implementation Rules

### 12.1 No fake AI
Never label something as AI if it is:
- deterministic string generation
- simple rules
- template-based phrasing
- manual user input disguised as intelligence

### 12.2 Allowed pre-AI behavior
Allowed before true AI:
- generated outfit notes from deterministic rules
- rule-based outfit suggestions
- wardrobe coverage summaries
- explainable matching logic

### 12.3 AI must be explainable
Future AI suggestions must be grounded in visible signals such as:
- owned pieces
- saved outfits
- style profile
- season and occasion context

### 12.4 AI order of operations
Do not add AI before:
1. outfit memories are stable
2. clothing extraction flow is stable
3. style profile exists
4. enough structured data exists to support non-random output

---

## 13. Mobile-First UX Rules

### 13.1 Mobile-first is mandatory
The product must be designed mobile-first, not desktop-first with mobile patched later.

### 13.2 Mobile page priorities
On mobile:
- primary CTAs must remain visible and obvious
- outfit cards must remain legible
- closet sections must be scroll-friendly
- forms must be stepwise and low-friction
- text must not overflow or crowd

### 13.3 Mobile experience rule
Outfit capture and review should feel natural on a phone.

This matters because outfit photos, quick saves, and wardrobe browsing are naturally mobile behaviors.

### 13.4 Forbidden mobile mistakes
Do not:
- cram dense admin UI into mobile
- rely on hover-only behavior
- require wide-screen comparison layouts for core flows

---

## 14. Commit and Version-Control Rules

### 14.1 Commit scope rule
Each commit should represent one coherent product or architectural step.

### 14.2 Commit message rule
Commit messages should describe meaningful project progress, not generic file churn.

Good examples:
- `Refactor app flow around outfit memory`
- `Add backend outfit composition service`
- `Introduce style profile domain scaffolding`

Bad examples:
- `update files`
- `changes`
- `fix stuff`

### 14.3 Branch discipline
Do not leave large mixed-purpose changes uncommitted for long.

### 14.4 Refactor rule
When changing direction, commit architectural checkpoints before adding more features on top.

---

## 15. Upload and Security Rules

### 15.1 Upload scope
Uploads are currently for wardrobe memory support only:
- outfit images
- clothing images

### 15.2 Upload restrictions
Uploads must:
- use safe filenames
- validate allowed extensions
- validate size limits
- avoid arbitrary executable content
- avoid base64 storage for persistent product data

### 15.3 Storage rule
Current local storage is acceptable for development, but architecture should remain migration-friendly for future object storage.

### 15.3A Upload cleanup rule
If a local uploaded image is removed or its owning persisted record is deleted:
- the database state must be updated
- safe local file cleanup should run for app-owned uploads only
- external URLs must never be deleted as local files
- missing files must not make the main mutation falsely fail after the DB commit

### 15.4 Secrets rule
Never hardcode secrets or credentials.

Use environment variables only.

---

## 16. Code Organization Rules

### 16.1 Backend organization
Backend structure must stay domain-modular:
- `models`
- `schemas`
- `services`
- `api/routes`
- `utils`
- `core`
- `db`

### 16.2 Frontend organization
Frontend structure must stay responsibility-based:
- `pages`
- `components`
- `services`
- shared layout/shell components

### 16.3 Reuse rule
If a UI pattern or backend behavior is used more than once, centralize it cleanly.

### 16.4 No Ã¢â‚¬Å“misc dumpÃ¢â‚¬Â rule
Do not create vague catch-all files that accumulate unrelated logic.

---

## 17. Performance and Scalability Principles

### 17.1 Build for real growth
Assume DigiCloset may become a real startup product, not just a demo.

### 17.2 Data access rule
Avoid frontend overfetching and backend N+1 patterns where possible.

### 17.3 Composition rule
Outfit reads should be optimized because they are the primary product asset.

### 17.4 Image rule
Do not let image-heavy views become unbounded or unoptimized over time.

### 17.5 Incremental complexity rule
Prefer simple, scalable architecture over flashy complexity that is hard to maintain.

---

## 18. What Not to Build Early

Do not build these early:
- advanced recommendation ML
- shopping compatibility scoring engine
- autonomous fashion chatbot
- full avatar editor
- hyper-realistic try-on
- social sharing ecosystem
- e-commerce marketplace flows
- massive analytics dashboards
- gamification systems
- trend scraping engines

These are downstream features and must not be allowed to distort the core product foundation.

---

## 19. MVP Boundaries

The MVP is successful if it delivers:
- outfit-memory-first creation
- stable outfit storage
- wardrobe pieces derived from saved outfits
- visual digital closet organization
- optional image upload
- deterministic outfit notes
- premium, coherent mobile-first UX

The MVP does not require:
- AI model inference
- advanced personalization
- shopping intelligence
- avatar rendering
- auth-heavy multi-tenant complexity

---

## 20. Definition of Success for DigiCloset

DigiCloset is succeeding when:
- users save complete looks, not just isolated items
- the home page feels like outfit rediscovery, not data management
- the wardrobe feels like a digital closet, not a CRUD grid
- clothing data supports the experience without dominating it
- future intelligence is being built on real structured memories
- the codebase remains coherent under new features

DigiCloset is failing when:
- users are pushed toward item-by-item entry as the main flow
- the UI starts looking like an inventory tool
- AI language outpaces actual intelligence
- architecture becomes reactive and inconsistent
- the product forgets that outfit memory is the center of gravity

---

## 21. Final Rule

When in doubt, ask:

**Does this make DigiCloset better at remembering, organizing, and resurfacing complete outfits?**

If the answer is no, the feature or implementation direction is probably wrong.
