import { Camera, Home, Maximize, Layers, Package, Flame, Sparkles } from 'lucide-react'
import React from 'react'

export interface ProductType {
  id: string
  emoji: string
  title: string
  subtitle: string
}

export interface ShotStyle {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  badge?: string
  restricted?: boolean
  thumbnail: string
  color: string
}

export interface SkinTone {
  label: string
  color: string
}

export const PRODUCT_TYPES: ProductType[] = [
  {
    id: 'wearable',
    emoji: '👗',
    title: 'Fashion & Apparel',
    subtitle: 'Clothing, wearable garments, designer outfits'
  },
  {
    id: 'general',
    emoji: '✨',
    title: 'General Product',
    subtitle: 'Cosmetics, food, retail, packaging, tech, & all others'
  }
]

export const SHOT_STYLES: ShotStyle[] = [
  {
    id: 'studio',
    title: 'Studio Shot',
    subtitle: 'Clean white bg, e-commerce ready',
    icon: Camera,
    badge: 'RECOMMENDED',
    thumbnail: './ShotStyles/studio.png',
    color: '#6C63FF'
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Context',
    subtitle: 'Product in real-world setting',
    icon: Home,
    thumbnail: './ShotStyles/lifestyle.png',
    color: '#3B82F6'
  },
  {
    id: 'macro',
    title: 'Macro Detail',
    subtitle: 'Extreme close-up, texture focus',
    icon: Maximize,
    thumbnail: './ShotStyles/macro.png',
    color: '#10B981'
  },
  {
    id: 'flat-lay',
    title: 'Flat Lay',
    subtitle: 'Top-down, styled arrangement',
    icon: Layers,
    thumbnail: './ShotStyles/flatlay.png',
    color: '#EC4899'
  },
  {
    id: 'packaging',
    title: 'Packaging Hero',
    subtitle: 'Full packaging, brand identity',
    icon: Package,
    thumbnail: './ShotStyles/packaging.png',
    color: '#F59E0B'
  },
  {
    id: 'cinematic',
    title: 'Cinematic Dark',
    subtitle: 'Dramatic lighting, luxury mood',
    icon: Flame,
    thumbnail: './ShotStyles/cinematic.png',
    color: '#EF4444'
  },
  {
    id: 'auto',
    title: 'Auto / Mixed',
    subtitle: 'Smart studio & lifestyle split',
    icon: Sparkles,
    thumbnail: './ShotStyles/auto.png',
    color: '#10B981'
  }
]

export const AGE_RANGES = [
  { id: 'teen', label: 'Teen 15–19', description: 'Teenager (15-19 years old)' },
  { id: 'young-adult', label: 'Young Adult 20–30', description: 'Young adult (20-30 years old)' },
  { id: 'adult', label: 'Adult 30–45', description: 'Adult (30-45 years old)' },
  { id: 'mature', label: 'Mature 45+', description: 'Mature adult (45+ years old)' }
]

export const MODEL_STYLES = [
  { id: 'everyday', title: 'Everyday', subtitle: 'casual, relatable' },
  { id: 'editorial', title: 'Editorial', subtitle: 'high fashion, structured' },
  { id: 'minimal', title: 'Minimal', subtitle: 'clean, neutral expression' }
]

export const SKIN_TONES: SkinTone[] = [
  { label: 'Very light', color: '#FFDFC4' },
  { label: 'Light', color: '#F0C9A0' },
  { label: 'Medium', color: '#D4A574' },
  { label: 'Tan', color: '#C68642' },
  { label: 'Brown', color: '#8D5524' },
  { label: 'Deep', color: '#4A2511' }
]
