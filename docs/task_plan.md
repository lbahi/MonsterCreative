# MosterAds — WinUI 3 Task Plan

## Phase 0: Initialization (Current)
- [x] Review `skills/mosterads.md` (Project Constitution)
- [x] Review `skills/blast-winui.md` (B.L.A.S.T. Protocol)
- [x] Create `docs/task_plan.md`, `docs/findings.md`, `docs/progress.md`
- [ ] Scaffold WinUI 3 project solution (`MosterAds.sln`)
- [ ] Install required NuGet packages (WinAppSDK, CommunityToolkit.Mvvm, Sqlite, fal-ai)
- [ ] Scaffold `Models/`, `Services/`, `ViewModels/`, `Views/` directories
- [ ] Implement Layer 1: C# Data Models (from constitution)

## Screen Build Order (Phases 1-3 per screen)
As per the protocol, we build bottom-up, proving the layer below it.

### 1. Settings Screen
- [ ] **L (Link):** Build & Test `KeyVaultService` (save/read fal-key)
- [ ] **L (Link):** Build & Test `DatabaseService` (init sqlite, AppSettings CRUD)
- [ ] **A (Architect):** `SettingsViewModel` + `SettingsPage.xaml`
- [ ] **S (Stylize):** Apply tokens, Mica backdrop

### 2. Ad Copy Screen
- [ ] **L (Link):** Build & Test `FalService` (any-llm endpoint text streaming)
- [ ] **A (Architect):** `AdCopyViewModel` + `AdCopyPage.xaml`
- [ ] **S (Stylize):** Variant cards formatting

### 3. Image Gen Screen
- [ ] **L (Link):** Build & Test `FalService` (image generation queue/polling)
- [ ] **L (Link):** Build & Test `AssetService` (saving images locally)
- [ ] **A (Architect):** `ImageGenViewModel` + `ImageGenPage.xaml`

### 4. Video Ads Screen
- [ ] **L (Link):** Build & Test `FalService` (video generation long-polling)
- [ ] **A (Architect):** `VideoAdsViewModel` + `VideoAdsPage.xaml`

### 5. Campaigns & AI Spending Tracker
- [ ] **L (Link):** Build & Test `DatabaseService` (Campaigns CRUD, mock metrics)
- [ ] **A (Architect):** ViewModels + Pages
- [ ] **S (Stylize):** No-line tables, sparklines

### 6. Dashboard
- [ ] **A (Architect):** Aggregate data from Services into `DashboardViewModel` + Page

## Phase 4 & 5: Polish & Trigger
- [ ] Final visual QA against Stitch designs
- [ ] MSIX Packaging configuration
