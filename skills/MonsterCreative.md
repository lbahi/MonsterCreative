---
name: monstercreative
description: MonsterCreative Project Constitution — React + Electron data schemas, architectural rules, API references, and design system. Update before changing code.
---

# MonsterCreative — Project Constitution (Next-Gen MosterAds)

> This file is **law**. Every schema, rule, and layout pattern defined here must be respected by all code. Update this file BEFORE changing any code.

---

## 1. Project Identity

- **App name:** MonsterCreative (formerly MosterAds)
- **Type:** Cross-platform Desktop Application
- **Stack:** Electron · Vite · React 19 · TypeScript · TailwindCSS v4 · Framer Motion
- **State Management:** React Context (`AppContext.tsx`)
- **Theme:** "Ambient Architect" Dark Theme (`#07070F` surface, `#6C63FF` primary)
- **Purpose:** AI-powered marketing suite — copy, images, video — prioritizing local-first data, BYOK API workflows, and a premium "WOW" level aesthetic.

---

## 2. Core Architecture & Layout

The app uses a strict CSS-based Shell layout pattern to ensure predictable responsiveness without scroll-clipping:
1. **Sidebar (`Sidebar.tsx`)**: Left navigation.
2. **Main Content (`Outlet`)**: The center screen area with a Top Header (`Search`, `Project dropdown`, `Collaborate` button).
3. **Right Panel (`RightPanel.tsx`)**: A dynamic overlay or side-pane fed by context (`setRightPanelContent`).

**Key File Structure:**
- `src/main/` — Electron backend processes (SQL, OS hooks, Fal service, Keystore).
- `src/renderer/src/screens/` — Primary page views.
- `src/renderer/src/components/` — Reusable parts (Checklists, Fallbacks).
- `src/renderer/src/services/` — API service layer (fal.service.ts, anthropic.service.ts).
- `src/renderer/src/styles/` — Core CSS, tokens, and Tailwind v4 injections.

---

## 3. Screen Inventory & Implementation Status

| Screen | Target Route | Status | Notes |
|--------|--------------|--------|-------|
| `Shell.tsx` | `/` | **DONE** | Responsive layout (min-width relaxed for fluid resize). |
| `DashboardScreen.tsx` | `/dashboard` | **DONE** | Uses `auto-fit` grids, Empty/Live states, Budget burn rate widget. |
| `AdCopyScreen.tsx` | `/ad-copy` | **DONE** | 9-step Content Strategy Builder, multi-model AI generation, results display. |
| `ImageGenScreen.tsx` | `/image-gen/*` | **DONE** | 4 tabs: Generate, Virtual Try-On, Format Resizer, Landing Page. Live pricing per model. |
| `VideoGenScreen.tsx` | `/video-gen/*` | **DONE** | Text-to-Video and Image-to-Video (Kling focus). |
| `AudioLabScreen.tsx` | `/audio-lab` | **PARTIAL** | TTS is active; Voice Cloning and S2S are safely gated behind 'Coming Soon' placeholders to ensure production stability. |
| `ApiCostsScreen.tsx` | `/api-costs` | **DONE** | Live API charting, MTD success rates, avg duration, model cost breakdown. |
| `SettingsScreen.tsx` | `/settings` | **DONE** | Local, secure management of BYOK api keys using keytar. |

---

## 4. Architectural Invariants (NEVER violate)

1. **Local-First Design:** The application must store and generate assets to local systems (IndexedDB/SQLite). It is not a cloud SaaS.
2. **Dynamic Right Panel Context:** The Right Panel is purely reactive. Screens populate it using `setRightPanelContent` in a `useEffect()`, passing their exact interactive UI down into it.
3. **No Placeholders in Production Views:** Screens must seamlessly support "Empty States" if there is no data to avoid showing fake stats.
4. **CSS Token Usage:** Colors must use CSS tokens (`var(--ma-accent)`) to ensure brand consistency, rather than hard-coded hashes, unless within specific isolated components.
5. **No Scroll Clipping:** Flexboxes and Grids must use `auto-fit` scaling (`minmax()`), wrapping, and flexible shrinking to support smaller monitor sizes gracefully. Do not force an unbreakable viewport width.
6. **Graceful Degradation:** Use `ImageWithFallback.tsx` to handle 404s cleanly.
7. **One-Click Sync:** Major modules must support cross-communication (e.g. Ad Copy pushing data to the Landing Page Generator).
8. **Secure IPC Pattern:** All external API calls MUST route through the main process via `ipcMain.handle` → `preload` bridge → `window.api.*`. Never call external APIs directly from the renderer.

---

## 4.5 File Size & Modularization Rules

These rules apply to ALL files in the project. They are non-negotiable and must be enforced in every future session.

### Hard Limits
- **Screen index.tsx**: Max 100 lines — layout only
- **Component files**: Max 150 lines
- **Hook files**: Max 200 lines  
- **Service files**: Max 300 lines
- **Electron main/preload**: Never refactor

### The 4-Layer Rule
Every screen must follow this exact structure:
```
screens/[screen-name]/
  index.tsx          ← LAYOUT ONLY (imports + JSX shell)
  tabs/ or sections/ ← UI sub-sections (no logic)
  components/        ← reusable UI pieces (no logic)
  hooks/             ← ALL state, effects, handlers
```

### The Mandatory Comment
Every index.tsx must have this at the top:
```typescript
/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/use[ScreenName].ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
```

### Warning Signs (stop and extract immediately)
- Any useState inside an index.tsx
- Any async function inside a screen component
- Any file exceeding its line limit
- Any component doing more than one job
- Antigraity adding logic to index.tsx instead of the hook file

### Current Modularization Status
| Screen | Index Lines | Status |
|--------|------------|--------|
| Dashboard | ~50 | ✅ Clean |
| AdCopy | ~43 | ✅ Clean |
| ImageGen | ~27 | ✅ Clean |
| ↳ SocialAds | ~98 | ✅ Clean (Modularized) |
| VideoGen | ~61 | ✅ Clean |
| AudioLab | ~120 | ✅ Clean |
| ApiCosts | ~50 | ✅ Clean |
| Settings | ~50 | ✅ Clean |
| Sidebar | ~40 | ✅ Clean |

### Audit Command
Run this before every new feature session:
`find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -10`
If any file exceeds its limit → clean before adding new features.

---

---

## 5. Design System (Tokens)

The app revolves around a hand-tailored premium dark mode:

**Core Colors (defined in `theme.css`)**
- `--ma-bg`: `#07070F` (App canvas background)
- `--ma-surface`: `#0B0B14` (Right panels, sidebars)
- `--ma-elevated`: `#11111A` (Cards and inputs)
- `--ma-border`: `rgba(255,255,255,0.06)`
- `--ma-text`: `#FFFFFF`
- `--ma-text-muted`: `rgba(255,255,255,0.5)`

**Brand Colors**
- `--ma-accent`: `#6C63FF` (Primary Purple)
- `--ma-green`: `#22C55E` (Success / Save states)
- `--ma-pink`: `#EC4899` (Video / Alt actions)
- `--ma-orange`: `#F59E0B` (Resizing workflows)

**Typography**
- `--font-display`: Bold, impactful headers (e.g. Outfit or Inter Display).
- `--font-body`: Clean functional UI (Inter / Roboto).
- `--font-mono`: JetBrains/Fira for numbers and costs.

---

## 6. Logic Workflows

### Ad Copy Generation — Content Strategy Builder (9-Step Survey)

The `AdCopyScreen` uses a multi-step survey wizard to gather product context, then generates tailored ad copy variants via LLM.

**Survey Steps:**
1. **Product Strategy & Analysis** — Upload product image + select AI Strategist model
2. **Target Audience** — Multi-select audience segments (AI suggestions based on product)
3. **Messaging Angle** — Choose 1-3 psychological frameworks
4. **Campaign Duration** — 7/15/30-day content calendar
5. **Platform Selection** — Facebook, TikTok, YouTube, Instagram
6. **Price Point** — Tier selection or exact price input
7. **Landing Page** — Toggle landing page content generation
8. **Video Content** — Toggle video scripts + select types (demos, hooks, tutorials, etc.)
9. **Brand Voice** — Professional, Friendly, Bold, Luxurious, or Playful tone

**AI Strategist Models (user-selectable):**
| Dropdown ID | OpenRouter Model ID | Specialty |
|---|---|---|
| `gemini-3-pro` | `google/gemini-3-pro` | Vision Specialist — deep product image analysis |
| `kimi-k2.5-thinking` | `moonshotai/kimi-k2.5-thinking` | Logic Engine — marketing angles & psychological triggers |
| `claude-opus-4-20250514-thinking-16k` | `anthropic/claude-opus-4-20250514` | Creative Strategist — high-converting copy & emotional resonance |

**Messaging Frameworks (variant types):**
1. `pain_killer`: (PAS Framework) Problem, Agitate, Solution. Color: `#EF4444`
2. `dream_state`: (BAB Framework) Vivid "after" transformation. Color: `#22C55E`
3. `pattern_interrupt`: (Pratfall Effect) Shocking/curiosity hook. Color: `#6C63FF`
4. `authority`: (4Cs) Social proof & trust. Color: `#8892B0`
5. `direct_benefit`: Direct value proposition. Color: `#3B82F6`

**Generation Output (CopyVariant):**
```typescript
interface CopyVariant {
  variantType: string    // Matches messaging angle ID
  headline1: string
  headline2: string
  headline3: string
  hook: string
  bodyCopy: string
  cta: string
  triggersUsed: string   // e.g. "LossAversion,SocialProof"
}
```

**Generation Pipeline:**
1. `AdCopyScreen.tsx` gathers survey state → `ContentStrategyRequest`
2. `anthropicService.generateContentStrategy(request)` builds prompt + resolves model ID
3. `falService.generateCopy(prompt, modelId)` queues to `POST https://queue.fal.run/openrouter/router`
4. Polls `/requests/{id}/status` until `COMPLETED`
5. Fetches result from `/requests/{id}`, extracts LLM text via `extractLlmOutput()`
6. "Monster Search" algorithm extracts JSON array from potentially chatty output
7. Parsed variants displayed in Results View + persisted to `copy_variants` SQLite table

### Image Generation Suites
The `ImageGenScreen` replaces rigid XAML logic with flexible `.tsx` forms:
- **Generate:** Pure txt2img (FLUX.1 models).
- **Virtual Try-On (VTON):** "AI Casting Director", requiring localized Vibes context (Studio, Urban, Nature, Luxury, Vintage, Candid).
- **Format Resizer:** Intelligent cropping via outpainting hooks.
- **Landing Page:** Combines copy output with AI code generation.
- **Video Generation:** (Kling-only focus) Image-to-Video and Text-to-Video via Kling v2.1 Pro. Handles strict duration constraints (5s/10s) and specific parameter mapping (`start_image_url`).

---

## 7. Service Layer Architecture

### Renderer Services (`src/renderer/src/services/`)

| Service | File | Purpose |
|---|---|---|
| `FalService` | `fal.service.ts` | Low-level queue/poll/extract for fal.ai endpoints (images, Kling video, LLM via OpenRouter) |
| `AnthropicService` | `anthropic.service.ts` | High-level prompt orchestration, model ID mapping, JSON parsing |

### Main Process Services (`src/main/`)

| Service | File | Purpose |
|---|---|---|
| `FalService` | `falService.ts` | Server-side API calls (billing, usage, pricing, analytics) |
| `DatabaseService` | `database.ts` | SQLite persistence (campaigns, images, copy variants, settings) |
| `KeystoreService` | `keystore.ts` | Secure API key storage via `keytar` |

### IPC Bridge (`src/preload/`)

**Available via `window.api.*`:**
- `database.getSettings()`, `updateSettings()`, `getAllCampaigns()`, `createCampaign()`, `saveImage()`, `saveCopyVariant()`
- `keystore.setFalKey()`, `getFalKey()`, `deleteFalKey()`
- `fal.getUsage()`, `getBilling()`, `validateKey()`, `getPricing()`, `getAnalytics()`
- `external.open(url)`

---

## 8. Database Schema (SQLite)

**Tables:**
- `app_settings` — Default tones, models, formats, accent color
- `campaigns` — Name, platforms, status, timestamps
- `generated_images` — Prompt, model, dimensions, fal request ID
- `generated_videos` — Prompt, modelId, resolution, duration, url, fileName, fileSize, createdAt
- `copy_variants` — variant_type, platform, headline1-3, hook, body_copy, cta, tone, triggers_used

---

## 9. API Reference

### fal.ai Endpoints Used

| Purpose | Endpoint | Auth |
|---|---|---|
| Image Generation | `POST https://queue.fal.run/fal-ai/{model}` | `Key {api_key}` |
| LLM (via OpenRouter) | `POST https://queue.fal.run/openrouter/router` | `Key {api_key}` |
| Pricing | `GET https://api.fal.ai/v1/models/pricing` | `Key {api_key}` |
| Usage | `GET https://api.fal.ai/v1/models/usage` | `Key {api_key}` (Admin) |
| Analytics | `GET https://api.fal.ai/v1/models/analytics` | `Key {api_key}` |
| Billing | `GET https://api.fal.ai/v1/account/billing` | `Key {api_key}` |
| Key Validation | `GET https://api.fal.ai/v1/account/billing?expand=credits` | `Key {api_key}` |

> **Important:** Auth header format is `Key YOUR_API_KEY` (NOT `Bearer`).

---

## 10. Next Technical Steps (Roadmap)

- Build remaining screens (`AudioLab`).
- Wire VTON "AI Casting Director" to survey-informed model/scene context.
- Fully orchestrate the one-click sync workflows from Ad Copy to Landing Page.
- Clean up pre-existing TS6133 unused variable warnings across the codebase.

**Completed Architecture Tasks:**
- ✅ Implemented Auth vault locally in Electron (`keystoreService` utilizing `keytar`) to securely store API keys.
- ✅ Built robust backend bridge endpoints (`ipcMain`/`preload` IPC routes) like `window.api.fal.getUsage` for secure, CORS-free external API analytics consumption.
- ✅ Integrated real-time fal.ai pricing and analytics into ImageGenScreen and ApiCostsScreen.
- ✅ Added Budget Burn Rate projection widget to DashboardScreen.
- ✅ Ported AdCopy generation logic from C# ViewModel/AnthropicService to TypeScript service layer.
- ✅ Built 9-step Content Strategy Builder with multi-model AI generation and structured results display.
- ✅ Implemented "Monster Search" JSON extraction algorithm for robust LLM response parsing.
- ✅ Database persistence of generated copy variants via IPC bridge.
- ✅ Stabilized `AudioLabScreen.tsx` and Image Gen's `LandingForm.tsx` by cleanly "sunsetting" incomplete features (Voice Cloning, S2S, Landing Page Generator) behind conditional "Coming Soon" placeholders without destroying the underlying layout logic.
- ✅ Fixed `fal.ai` Dashboard billing parsing logic to dynamically handle diverse API response structures (e.g., `current_balance`, `credits`, `balance`), restoring the "Available Credits" readout.
- ✅ Modularized core screens (Dashboard, AdCopy, ImageGen, VideoGen) into a strict 4-layer architecture (Index, Tabs, Components, Hooks) to ensure maintainability and file size compliance.
- ✅ Dismantled massive components (e.g., `SocialAdsForm` from 1,150 lines to 98 lines) by safely extracting constants to `data/`, logic to `hooks/`, and view sections to `components/`.
- ✅ Implemented high-performance AI Video generation pipeline (Kling focus) with real-time polling and cost estimation.
- ✅ Migrated licensing system from LemonSqueezy to Gumroad, integrating it fully into the React UI (Settings & Onboarding) via secure keytar IPC handlers.
- ✅ Resolved native `Illegal constructor` React crashes caused by missing Lucide icon imports defaulting to Web APIs.

---

## 11. Lessons Learned & Gotchas (Critical Rules)

1. **Electron CSP & Image Rendering**: 
   - `Content-Security-Policy` naturally blocks wildcard media fetching. When using models like Seedream or FLUX, ensure their delivery domains (`https://*.fal.media`, `https://storage.googleapis.com`) are explicitly whitelisted in `index.html`'s `img-src` and `connect-src`.
2. **Native Asset Downloading**: 
   - Frontend `fetch` requests inside Electron to external CDNs won't trigger standard web download behavior. To force a local file download without kicking the user to an external browser window, use `fetch(url) -> .blob() -> URL.createObjectURL -> simulate <a> click`.
3. **Synchronous Execution vs Polling (`fal.run` vs `queue.fal.run`)**: 
   - Newer image generation models often return `405 Method Not Allowed` when hitting `/status` queue loops. Bypassing the queue and hitting the synchronous execution endpoint directly via `https://fal.run/...` is safer and faster.
4. **Diffusion Models vs LLM Prompts**: 
   - Non-LLM diffusion models (like Seedream 4.5) parse prompts via text encoders like CLIP. Do NOT pass them massive JSON/Markdown system prompt templates (like "You are an expert... Goal: ..."). This overflows the encoder context and causes the model to ignore the spatial instructions. Use strictly bare-bones, concise descriptive prompts (`{{USER_PROMPT}}`).
5. **Lucide Icons and Native APIs (`Illegal constructor`)**:
   - If you use a React component like `<Lock />` or `<Image />` without explicitly importing it from `lucide-react` (or your icon library), standard JavaScript environments will fall back to native Web API constructors (e.g., the Web Locks API or HTMLImageElement). This triggers a fatal `Illegal constructor` crash during React Fiber rendering. ALWAYS verify icon imports.
6. **API Response Variability (e.g., Fal.ai Billing)**:
   - Third-party APIs frequently iterate on their response schemas. Fal's `/account/billing?expand=credits` endpoint returns balance structures differently depending on the account type (e.g., `billingRes.credits.current_balance` vs `billingRes.credits` vs `billingRes.balance`). Defensively parse third-party JSON using heuristic checks across multiple paths.
7. **Safe UI Sunsetting**:
   - When pulling a feature out of a production release, do NOT blindly delete the underlying logic or component wrappers, as this often creates JSX parsing errors (like orphaned `</div>` tags) or orphaned state. Instead, cleanly gate the components behind conditional flags (`activeTab === 'tts'`) or replace the sub-components with static placeholder wrappers.
8. **Component Size Governance**:
   - To prevent monoliths like the 1,150-line `SocialAdsForm`, enforce a strict maximum of ~150 lines per component. Adopt a 4-step extraction process when a file breaches this limit: 1) Move constants to `data/`, 2) Move types to `types.ts`, 3) Extract all state and handlers into a custom `hooks/useFeatureName.ts`, 4) Split the massive JSX return into presentational `components/`. This ensures stability and allows Vite HMR to stay fast.