# MonsterCreative Release Log

## Current Version: v1.0.13
**Status:** Active Development
**Platform:** Electron (React + TypeScript)
**Last Updated:** 2026-06-05

---

## v1.0.13 (Current)
**Status:** In Development
**Focus:** AI Video Ad Generation & Asset Management
- **Ads Maker:** Complete 3-phase AI video ad generation workflow
- **Feature Isolation:** Separated Ad Maker feature with consistent brand accent colors
- **Workflow:** Script generation → Visual scene creation → Video rendering
- **Creations Screen:** New comprehensive asset management hub
  - Unified view for Images, Videos, Audio, Copy, and Ad Projects
  - Search, filter, and sort capabilities
  - Bulk selection and deletion
  - Favorite toggle for all asset types
  - Tag management system
  - Remix functionality to regenerate from existing assets
  - Detailed preview modal with metadata

---

## v1.0.11
**Date:** 2026-05-XX
**Status:** Released
**Key Features:**
- **GPT Image 2 Integration:** Dynamic quality parameter mapping based on selected resolution
- **Cost Estimation:** Dynamic cost estimation for GPT Image 2 based on resolution
- **AI Shots Enhancements:**
  - Moved estimate panel to global right sidebar for visual consistency
  - Added price estimator card, swipable lightbox, and direct download
  - Upgraded to Gemini 2.5 Flash for vision LLM with safety diagnostics
  - Premium 2-column image card grid layout
  - Simplified to 2 product types with vision-based auto-categorization
- **Virtual Try-On:** Fully merged into AI Shots workflow, removed redundant links
- **Bug Fixes:** Resolved ReactNode and QuickActions TypeScript type errors

---

## v1.0.10
**Date:** 2026-05-XX
**Status:** Released
**Key Features:**
- **YouTube Embed:** Fixed playback issues
- **Settings UI:** Updated settings interface
- **License System:** Store install_secret_key as install-api-token for deactivation auth
- **Freemius Integration:** Store purchaser email and license quota from responses

---

## v1.0.9
**Date:** 2026-05-XX
**Status:** Released
**Key Features:**
- **Freemius Licensing:** Complete license system implementation
  - Activate, validate, deactivate functionality
  - Sandbox testing support
  - Production ready
- **Replaced:** Gumroad license system with Freemius

---

## v1.0.8
**Date:** 2026-05-11
**Status:** Released
**Target:** Windows x64
**Key Accomplishments:**
- **JSX Namespace Resolution:** Systematically replaced `JSX.Element` with `React.ReactElement` across all components
- **Strict Typing Enforcement:** Fixed `unknown` type errors in `useDashboard`, `useApiCosts`, and `CampaignsView`
- **Code Hardening:** Standardized `import React from 'react'` across renderer process
- **Build Pipeline:** Successfully generated `monster-creative-1.0.8-setup.exe`

---

## Project Architecture
**Technology Stack:**
- Electron 39.2.6
- React 19.2.1
- TypeScript 5.9.3
- TailwindCSS 4.2.2
- Framer Motion 12.38.0
- SQLite (better-sqlite3 12.8.0)
- Keytar 7.9.0 (secure credential storage)

**Current Screens:**
- Dashboard
- Ad Copy Generator
- Image Gen (GPT Image 2)
- AI Shots (Virtual Try-On)
- Ads Maker (Video Ad Generation)
- Audio Lab
- Campaigns
- API Costs Tracker
- Settings

**API Integrations:**
- fal.ai (primary AI generation platform)
  - openrouter/router for text generation
  - flux for image generation
  - kling/veo for video generation
- Freemius (licensing)

---

## Next Steps
- Complete v1.0.13 Ads Maker testing and release
- Audio Lab expansion
- Performance optimization for large media files
- Enhanced campaign analytics
