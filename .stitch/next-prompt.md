---
page: settings
---
A Settings screen for MosterAds — a comprehensive application preferences workspace where users manage their account, billing, API keys (for AI models), and team members.

**DESIGN SYSTEM (REQUIRED):**

Visual Theme: "The Ambient Architect" — premium, editorially sophisticated dark-mode workspace. Intentional asymmetry, tonal depth, overlapping glass surfaces.

Color Palette:
- Background / Surface: #121314
- Surface Container Low: #1b1c1d
- Surface Container: #1f2021
- Surface Container High: #292a2b
- Surface Container Highest: #343536
- Primary: #adc6ff
- Primary Container: #4b8eff
- On Surface: #e3e2e3
- On Surface Variant: #c1c6d6
- Tertiary: #ffb691
- Outline Variant: #414754
- Brand Blue: #1877F2

Typography: Inter. Display: text-2xl font-black. Headline: text-lg font-bold. Body: text-sm. Label: text-[10px] uppercase tracking-wider.

Component Rules: Gradient primary buttons (#adc6ff → #4b8eff), rounded-xl cards, NO 1px borders, tonal shifts only. Mica effect on sidebar/topbar. Ambient glow orbs.

**Page Structure:**

1. Sidebar with "Settings" nav item active (brand blue #1877F2 left border). Nav items: Dashboard, Ad Copy, Image Gen, Video Ads, AI Spending Tracker, Settings (ACTIVE).
2. Left panel (~280px): Settings Navigation
   - Header: "Settings" as display text
   - Vertical menu list using tonal shifts for the active state: General, Account (ACTIVE — bg-surface-container), Billing & Usage, Team & Access, AI Models & API Keys, Integrations.
3. Right panel (flex-1): Active Settings View ("Account")
   - Header: "Account Profile" as headline + "Manage your personal information and preferences."
   - Profile Picture section: Avatar circle + "Upload new picture" ghost button
   - Form grid (2 columns): First Name, Last Name, Email Address, Phone Number
     - Inputs: bg-surface-container-highest, border-none, label text above them
   - "Save Changes" primary gradient button
   - Divider (use spacing + a very subtle tonal block, no 1px lines)
   - "Danger Zone" card (bg-surface-container-low, rounded-xl, p-6): Delete Account section with a red/tertiary ghost button.
4. Background glow orbs (primary top-right, tertiary bottom-left)
