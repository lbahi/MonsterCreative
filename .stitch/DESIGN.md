# Design System: MosterAds
**Project ID:** 12729551298364191381

## 1. Visual Theme & Atmosphere
The creative North Star for this design system is **"The Ambient Architect."**

In the crowded landscape of ad-tech and SaaS, most tools feel like spreadsheets—rigid, flat, and cognitively taxing. "The Ambient Architect" breaks this mold by treating the Windows 11 desktop environment not as a canvas for boxes, but as a three-dimensional space of light and depth. By leveraging WinUI 3’s Mica and Acrylic effects, we move away from "template-style" layouts toward a signature editorial experience.

We prioritize **intentional asymmetry** and **tonal depth**. Large, high-contrast typography scales provide an authoritative editorial voice, while overlapping surfaces and "glass" layers create a sense of professional sophistication. This isn't just an interface; it's a premium workspace designed for high-stakes decision-making.

## 2. Color Palette & Roles

*   **Infinite Foundation (Background)** (`#121314`): The base layer (`surface`), acting as the infinite foundation for the application.
*   **Primary Container** (`#1b1c1d`): Used for main content regions (`surface-container-low`), creating a soft lift from the foundation.
*   **Nested Card Surface** (`#1f2021` or `#292a2b`): Used for interactive elements and high-priority data points (`surface-container` / `surface-container-high`).
*   **Ocean-deep Cerulean Primary** (`#adc6ff`): Used for Primary calls to action and key brand moments (`primary`). It provides a tactile, premium finish especially when used as a gradient.
*   **Vibrant Cobalt Container** (`#4b8eff`): Used as the endpoint for primary button gradients and active selection chips (`primary-container`).
*   **Warm Sunset Tertiary** (`#ffb691`): Used for "Success" or "Live" states to provide a more sophisticated, warm alternative to "standard green" (`tertiary`).
*   **Soft Cloud Pure Surface Text** (`#e3e2e3`): The standard workhorse text color (`on-surface`).
*   **Subtle Silver Variant Text** (`#c1c6d6`): Used for metadata, labels, and secondary text (`on-surface-variant`) to create a natural hierarchy.
*   **Fiery Orange Accent** (`#ff4d00`): Used for high-anxiety triggers and distinct variant highlights (like Variant A).
*   **Emerald Growth Accent** (`#4CAF50`): Used for positive dream-state actions, success CTAs.
*   **Electric Purple Accent** (`#9C27B0`): Used for scarcity or FOMO-driven highlights.
*   **Rational Sky Blue Accent** (`#2196F3`): Used for logic or data-driven variant highlights.
*   **Warning Amber Accent** (`#FFC107`): Used for pattern interrupts and surprise-driven elements.

## 3. Typography Rules
We utilize **Inter** (representing the modern interpretation of the Segoe UI Variable spirit) to create a hierarchy that feels like a high-end financial journal.

*   **Display (Lg/Md):** Used for "Big Picture" metrics. Large and monumental (e.g., `text-2xl font-black tracking-tight`).
*   **Headline (Sm/Md):** Used for page titles and major section headers, establishing clear entry points (e.g., `text-lg font-bold`).
*   **Title (Md/Sm):** Used for card headings. Always paired with `on-surface` color to ensure authority.
*   **Body (Md):** The workhorse font (`text-sm` or `text-[13px]`). It balances information density with legibility.
*   **Label (Sm):** Used for metadata, inputs, and overlines (e.g., `text-[10px] uppercase tracking-wider`). These should be in `on-surface-variant` and often all-caps with a specific letter-spacing to feel "designed."

## 4. Component Stylings

*   **Buttons:**
    *   **Primary:** Gradient fill (transitioning from `primary` to `primary-container`). Shape defaults to `rounded-lg` (`0.5rem`). No border. Often includes a subtle shadow glow (`shadow-lg shadow-primary/10`).
    *   **Secondary:** Ghost or translucent fill (`bg-surface-container-highest`) with `on-surface` text. Blends into the UI until hovered.
    *   **Variant Chips:** Active state uses `primary-container` background with `on-primary-container` text. Inactive uses `surface-container-high` background with `on-surface-variant` text.
*   **Cards/Containers:**
    *   The "No-Line" Rule: 1px solid borders are prohibited for sectioning. Boundaries must rely on background color shifts (`bg-surface-container`).
    *   Cards (like ad copy variants) use `rounded-xl` (`0.75rem`) to soften the technical nature of the data, accompanied by a `shadow-xl` to create depth through tonal layering.
    *   Feature accents on cards are typically applied as a thick left border (`border-l-4`).
*   **Inputs/Forms:**
    *   Fields use `bg-surface-container-highest` with no borders (`border-none`).
    *   Focus state utilizes a 1px ring (`focus:ring-1 focus:ring-primary-container`), replacing thick borders.
    *   Labels are placed above inputs using the defined Label typography rule, never inside as placeholder-only.

## 5. Layout Principles

*   **Asymmetrical Layouts:** Embrace asymmetry—place a narrow setup panel (e.g., `w-[320px]`) on the left and a wider, dense list of generated variants on the right to create visual interest.
*   **The Divider Ban:** Strictly forbid 1px dividers between list items. Use spacing (vertical white space, like `gap-4` or `gap-6`) or alternating surface tints to separate data.
*   **Ambient Shadows & Depth:** Eschew traditional drop shadows for tonal layering and "ambient shadows." The application background itself should utilize a Mica effect (`backdrop-filter: blur(20px)`, `bg-surface/40`), allowing desktop elements to subtly bleed through and ground the app.
*   **Spacing Strategy:** Embrace negative space. High-density areas use `space-y-1` or `gap-2`, while major structural boundaries use `gap-6` or `p-6` to let the design breathe.
