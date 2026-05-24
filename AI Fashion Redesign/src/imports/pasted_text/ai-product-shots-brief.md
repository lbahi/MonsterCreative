FIGMA AI DESIGN BRIEF
Feature: AI Product Shots (formerly Virtual Try-On)
App: MonsterCreative — Windows Desktop App
Request: Design all 5 steps of this feature as a complete 
UI flow. Each step = one full screen frame.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM — APPLY TO ALL 5 SCREENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANVAS & LAYOUT:
  Frame size: 1280x800px (Windows desktop app)
  App canvas background: #07070F
  Sidebar/panel background: #0B0B17
  Card/elevated element background: #11111A
  All borders: 1px solid rgba(255,255,255,0.07)
  Border radius on cards: 12px to 16px
  Border radius on buttons: 8px
  Border radius on inputs: 10px

COLORS:
  Primary accent / CTA: #6C63FF (purple)
  Purple glow effect: rgba(108,99,255,0.18)
  Active state border: rgba(108,99,255,0.4)
  Success / confirm: #22C55E (green)
  Inactive / muted: rgba(255,255,255,0.25)
  Primary text: #FFFFFF
  Body / label text: rgba(255,255,255,0.5)
  Placeholder text: rgba(255,255,255,0.25)

TYPOGRAPHY:
  Feature title / screen headline: 
    Outfit ExtraBold 800, 22px, white, letter-spacing -1px
  Section labels (above inputs): 
    JetBrains Mono 500, 11px, #6C63FF, UPPERCASE, 
    letter-spacing 2px, with a 20px purple line before text
  Card titles: 
    Outfit Bold 700, 15px, white
  Body / descriptions: 
    DM Sans Regular 400, 13px, rgba(255,255,255,0.5)
  Input text: 
    DM Sans Regular 400, 14px, white
  Button text: 
    Outfit SemiBold 600, 14px, white

BUTTONS:
  Primary CTA:
    Background: #6C63FF
    Hover: #4B44CC
    Height: 44px, full width or 200px
    Text: Outfit 600, 14px, white
    Border radius: 8px
    Glow below: box-shadow 0 8px 24px rgba(108,99,255,0.3)

  Secondary:
    Background: transparent
    Border: 1px solid rgba(255,255,255,0.15)
    Text: rgba(255,255,255,0.7)
    Same sizing as primary

CARDS (selectable options):
  Default state:
    Background: #11111A
    Border: 1px solid rgba(255,255,255,0.07)
    Border radius: 14px
    Padding: 20px
  
  Selected / active state:
    Border: 1.5px solid #6C63FF
    Background: rgba(108,99,255,0.08)
    Top edge: 1px line gradient 
      (transparent → #6C63FF → transparent)
    Box shadow: 0 0 0 3px rgba(108,99,255,0.15)

PROGRESS INDICATOR (top of every screen):
  5 steps shown as horizontal pill steps
  Completed steps: #6C63FF filled
  Current step: #6C63FF with white label
  Upcoming steps: rgba(255,255,255,0.15) filled
  Connected by thin lines between pills
  Labels: JetBrains Mono 10px below each pill

LAYOUT STRUCTURE (every screen):
  Left panel (320px wide): 
    Step title, description, input/selection area
  Right panel (remaining width): 
    Live preview card showing current state
  Top bar (48px): 
    Feature name left, step X of 5 right
  Bottom bar (64px): 
    Back button left + Next/Generate button right

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 1 OF 5 — UPLOAD YOUR PRODUCT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEFT PANEL CONTENT:
  Section label: "STEP 01 — PRODUCT IMAGE"
  Headline: "Upload your product"
  Description: "A clean product photo works best. 
  No background needed."

  Upload zone (large, center of panel):
    Background: #11111A
    Border: 1.5px dashed rgba(108,99,255,0.4)
    Border radius: 16px
    Height: 260px
    Center icon: Upload arrow icon in #6C63FF, 32px
    Primary text: "Drop your product image here"
      Outfit 600, 15px, white
    Secondary text: "or click to browse — PNG, JPG, WEBP"
      DM Sans 400, 12px, rgba(255,255,255,0.4)
    On hover state: 
      Background: rgba(108,99,255,0.06)
      Border color: #6C63FF solid

  Below upload zone:
    Small tip badge:
      Background: rgba(108,99,255,0.1)
      Border: 1px solid rgba(108,99,255,0.2)
      Border radius: 6px
      Padding: 8px 14px
      Icon: lightbulb in #6C63FF
      Text: "Tip: White or transparent background 
      gives the best results"
        DM Sans 400, 12px, rgba(255,255,255,0.5)

RIGHT PANEL CONTENT:
  Large preview card (#11111A, border radius 16px):
    Empty state (before upload):
      Center: dashed circle placeholder
      Text below: "Your product preview will appear here"
        rgba(255,255,255,0.2), DM Sans, 13px
    
    Filled state (after upload — show example):
      Product image centered with subtle drop shadow
      Below image: green badge "✓ Image ready"
        #22C55E, JetBrains Mono 11px

BOTTOM BAR:
  Right: Primary CTA button "Continue →" (#6C63FF)
  Left: empty (first step, no back)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 2 OF 5 — PRODUCT TYPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEFT PANEL CONTENT:
  Section label: "STEP 02 — PRODUCT TYPE"
  Headline: "What are you selling?"
  Description: "This shapes how your product 
  is presented in the scene."

  5 selectable cards in a vertical list, 
  each card 64px tall, full panel width:

  Card 1 — Selected state (show as selected):
    Left: emoji icon area (24px) showing 👗
    Title: "Wearable" — Outfit 600, 14px, white
    Subtitle: "Clothing, accessories, bags, jewelry"
      DM Sans 400, 12px, rgba(255,255,255,0.4)
    Right: purple checkmark circle #6C63FF
    Card in active/selected style

  Card 2:
    Icon: 💄
    Title: "Beauty & Skincare"
    Subtitle: "Cosmetics, perfume, bio & natural products"

  Card 3:
    Icon: 🍃
    Title: "Food & Wellness"
    Subtitle: "Supplements, honey, herbal, organic"

  Card 4:
    Icon: 🕯️
    Title: "Lifestyle Product"
    Subtitle: "Candles, home décor, handmade goods"

  Card 5:
    Icon: 📦
    Title: "Packaged Product"
    Subtitle: "Boxes, bottles, jars, generic retail"

RIGHT PANEL CONTENT:
  Same product thumbnail from Step 1 (top, small)
  Below it: animated label "Analyzing product type..."
    Purple spinner + JetBrains Mono 11px text
  Below that: info card showing what changes 
  based on selection:
    Title: "What this affects"
      Outfit 600, 13px, rgba(255,255,255,0.7)
    3 bullet rows:
      • Scene suggestions
      • Model availability  
      • Shot angle recommendations
    Each bullet: small #6C63FF dot + DM Sans 12px text

BOTTOM BAR:
  Left: "← Back" secondary button
  Right: "Continue →" primary button #6C63FF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 3 OF 5 — SHOT STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEFT PANEL CONTENT:
  Section label: "STEP 03 — SHOT STYLE"
  Headline: "Choose your scene"
  Description: "Pick the visual mood 
  for your product images."

  5 selectable cards arranged in a 
  2-column grid (2+2+1):

  Card 1 — "Studio Clean"
    Top: small scene thumbnail placeholder 
      (white/neutral gradient, 80px tall, 
       border radius 8px)
    Label: "Studio Clean"
      Outfit 600, 13px, white
    Sub: "Minimal. Professional. Timeless."
      DM Sans 400, 11px, muted

  Card 2 — "Lifestyle Scene"
    Thumbnail: warm room environment placeholder
    Label: "Lifestyle Scene"
    Sub: "Product in real-life setting"

  Card 3 — "Model Showcase" 
    Thumbnail: silhouette of person placeholder
    Label: "Model Showcase"
    Sub: "Human model, wearing or holding"
    Badge top-right: "WEARABLE & BEAUTY ONLY"
      JetBrains Mono 9px, rgba(255,165,0,0.8) orange
      Background: rgba(245,158,11,0.1)
      Border radius: 4px

  Card 4 — "Flat Lay" — show as selected:
    Thumbnail: overhead product arrangement placeholder
    Label: "Flat Lay"
    Sub: "Overhead. Styled. Editorial."
    Selected state styling

  Card 5 — "Outdoor Natural"
    Thumbnail: outdoor soft light placeholder
    Label: "Outdoor Natural"
    Sub: "Natural light, open environment"

RIGHT PANEL CONTENT:
  Preview card showing selected style mockup:
    Large area (400x300px) with:
      Semi-transparent scene preview 
      Product image composited into scene
      Bottom label: "Preview — Flat Lay"
        JetBrains Mono 10px, rgba(255,255,255,0.4)
    
  Below preview: style description card
    Background: rgba(108,99,255,0.06)
    Border: 1px solid rgba(108,99,255,0.2)
    Text: "Best for: Beauty, food, and lifestyle products.
    Works especially well for bio skincare and 
    handmade products."
      DM Sans 400, 12px, rgba(255,255,255,0.5)

BOTTOM BAR:
  Left: "← Back" secondary button
  Right: "Continue →" primary button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 4 OF 5 — CUSTOMISE
(Conditional — shown when Wearable or Beauty 
+ Model Showcase selected. Otherwise skip to Step 5.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEFT PANEL CONTENT:
  Section label: "STEP 04 — MODEL SETTINGS"
  Headline: "Customise your model"
  Description: "These settings personalise 
  the model to match your brand."

  INPUT GROUP 1 — "Model Age Range"
    Label: JetBrains Mono 11px uppercase #6C63FF
    Horizontal pill selector (4 options):
      [Teen 15–19] [Young Adult 20–30] 
      [Adult 30–45] [Mature 45+]
      Active pill: background #6C63FF, white text
      Inactive: background #11111A, 
        border rgba(255,255,255,0.1), muted text

  INPUT GROUP 2 — "Model Style"
    Label: "AESTHETIC"
    3 cards in a row:
      Card 1: "Everyday" — casual, relatable
      Card 2: "Editorial" — high fashion, structured
      Card 3: "Minimal" — clean, neutral expression
    Show Card 1 selected

  INPUT GROUP 3 — "Skin Tone"
    Label: "SKIN TONE"
    6 circular color swatches in a row:
      Very light, Light, Medium, 
      Tan, Brown, Deep
      Each circle: 32px diameter
      Selected circle: 
        2px ring in #6C63FF with 3px gap
      Below: text label updates on selection
        DM Sans 12px, rgba(255,255,255,0.4)

RIGHT PANEL CONTENT:
  Live model preview area (large):
    Blurred/placeholder silhouette of model
    Product image faintly overlaid
    Badge: "Preview generates after settings"
      rgba(255,255,255,0.2), center aligned

  Below: summary card of all selections so far:
    Background: #11111A, border radius 12px
    Rows showing:
      Product Type: Wearable ✓
      Shot Style: Model Showcase ✓
      Age Range: Young Adult ✓
    Each row: small green dot + DM Sans 12px

BOTTOM BAR:
  Left: "← Back"
  Right: "Continue →" 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 5 OF 5 — GENERATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEFT PANEL CONTENT:
  Section label: "STEP 05 — FINAL SETTINGS"
  Headline: "How many shots?"
  Description: "Each image uses a unique 
  AI-generated scene prompt."

  NUMBER SELECTOR — "Number of Images"
    Large horizontal counter:
      [ − ]  [ 4 ]  [ + ]
      Minus/plus: circular buttons, 
        border rgba(255,255,255,0.15), 40px
      Number: Outfit Black 900, 36px, white
    Below counter: 
      "4 unique scenes will be generated"
        DM Sans 400, 12px, rgba(255,255,255,0.4)

  DIVIDER LINE: rgba(255,255,255,0.06)

  FULL SUMMARY CARD:
    Background: rgba(108,99,255,0.05)
    Border: 1px solid rgba(108,99,255,0.15)
    Border radius: 12px
    Padding: 16px
    Title: "Your Generation Summary"
      Outfit 600, 13px, rgba(255,255,255,0.7)
    4 rows:
      Product Type: Beauty & Skincare
      Shot Style: Flat Lay
      Model: None
      Images: 4
    Each row: label left (muted) + value right (white)
    DM Sans 400, 13px

  GENERATE BUTTON (inside left panel, full width):
    Height: 52px
    Background: #6C63FF
    Glow: 0 8px 32px rgba(108,99,255,0.4)
    Icon left: sparkle/magic icon white 18px
    Text: "Generate Product Shots"
      Outfit 700, 15px, white
    Below button: small text
      "Estimated time: ~30 seconds"
        DM Sans 400, 11px, rgba(255,255,255,0.3)

RIGHT PANEL CONTENT:
  4 image placeholder cards in a 2x2 grid:
    Each card: #11111A, border radius 12px
    Each: 180x180px
    Inside each: loading shimmer animation
      (gradient sweep from 
       #11111A → #1A1A2E → #11111A)
    Numbered badge top-left each card:
      "01" "02" "03" "04"
      JetBrains Mono 10px, rgba(255,255,255,0.2)
  
  Below grid: status row
    Left: "Waiting to generate..."
      DM Sans 400, 12px, rgba(255,255,255,0.3)
    Right: small purple dot (idle state)

BOTTOM BAR:
  Left: "← Back" secondary
  Right: empty (Generate button is in left panel)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL NOTES FOR FIGMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Deliver all 5 screens as individual frames 
  named: Step 01, Step 02, Step 03, Step 04, Step 05
- Connect frames with prototype arrows 
  on the Continue button
- Use Auto Layout on all panels and cards
- All frames share the same top nav bar component
- All frames share the same bottom bar component
- Progress indicator updates active step per frame
- Font imports needed: 
  Outfit (700,800,900), 
  DM Sans (300,400,500), 
  JetBrains Mono (400,500)
- No light backgrounds anywhere
- No illustrations — flat, dark, premium UI only
- Export as: Figma file + PNG preview of each step