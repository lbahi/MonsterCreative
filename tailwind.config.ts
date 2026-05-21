import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ambient Architect Design Palette
        'abyss-black': '#121314', // Infinite Foundation
        'charcoal-surface': '#1b1c1d', // Primary Container
        'elevated-card': '#1f2021', // Nested Card Surface
        'nested-high': '#292a2b',
        'ocean-cerulean': '#adc6ff', // Primary
        'vibrant-cobalt': '#4b8eff', // Primary Container (Variant)
        'warm-sunset': '#ffb691', // Tertiary (Success/Warm)
        'soft-cloud': '#e3e2e3', // On Surface
        'subtle-silver': '#c1c6d6', // On Surface Variant
        'fiery-orange': '#ff4d00', // Accent A
        'emerald-growth': '#4CAF50', // Success
        'electric-purple': '#9C27B0', // Scarcity
        'rational-sky': '#2196F3', // Logic
        'warning-amber': '#FFC107' // Surprise
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI Variable', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem'
      },
      boxShadow: {
        'premium-glow': '0 0 20px rgba(173, 198, 255, 0.1)',
        'accent-glow': '0 0 30px rgba(75, 142, 255, 0.15)'
      }
    }
  },
  plugins: []
}

export default config
