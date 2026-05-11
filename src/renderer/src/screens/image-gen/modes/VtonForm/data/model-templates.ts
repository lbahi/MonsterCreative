import type { ModelTemplate } from '../types'

/**
 * 8 Model Types — The user selects one to guarantee correct gender/age casting.
 * Thumbnails are served from /public/VtonModels/{id}.png
 * The `promptFragment` is injected directly into the AI casting prompt as a non-negotiable constraint.
 */
export const MODEL_TEMPLATES: ModelTemplate[] = [
  {
    id: 'baby_boy',
    label: 'Baby Boy',
    gender: 'male',
    ageRange: '0–3 yrs',
    ageMin: 0,
    ageMax: 3,
    promptFragment: 'A 2 year old baby boy, chubby cheeks, soft expression, playful energy.',
    thumbnail: './VtonModels/baby_boy.png',
    color: '#3B82F6'
  },
  {
    id: 'baby_girl',
    label: 'Baby Girl',
    gender: 'female',
    ageRange: '0–3 yrs',
    ageMin: 0,
    ageMax: 3,
    promptFragment: 'A 2 year old baby girl, soft features, curious bright eyes, gentle smile.',
    thumbnail: './VtonModels/baby_girl.png',
    color: '#EC4899'
  },
  {
    id: 'boy',
    label: 'Boy',
    gender: 'male',
    ageRange: '4–12 yrs',
    ageMin: 4,
    ageMax: 12,
    promptFragment: 'An 8 year old boy, energetic posture, confident smile, short hair.',
    thumbnail: './VtonModels/boy.png',
    color: '#6366F1'
  },
  {
    id: 'girl',
    label: 'Girl',
    gender: 'female',
    ageRange: '4–12 yrs',
    ageMin: 4,
    ageMax: 12,
    promptFragment: 'A 7 year old girl, lively expression, natural hair, cheerful energy.',
    thumbnail: './VtonModels/girl.png',
    color: '#F472B6'
  },
  {
    id: 'teen_boy',
    label: 'Teen Boy',
    gender: 'male',
    ageRange: '13–17 yrs',
    ageMin: 13,
    ageMax: 17,
    promptFragment: 'A 15 year old teenage boy, casual confidence, modern hairstyle.',
    thumbnail: './VtonModels/teen_boy.png',
    color: '#8B5CF6'
  },
  {
    id: 'teen_girl',
    label: 'Teen Girl',
    gender: 'female',
    ageRange: '13–17 yrs',
    ageMin: 13,
    ageMax: 17,
    promptFragment: 'A 15 year old teenage girl, trendy style, expressive eyes, natural look.',
    thumbnail: './VtonModels/teen_girl.png',
    color: '#F59E0B'
  },
  {
    id: 'man',
    label: 'Man',
    gender: 'male',
    ageRange: '18–45 yrs',
    ageMin: 18,
    ageMax: 45,
    promptFragment: 'A 28 year old man, athletic build, well-groomed, confident expression.',
    thumbnail: './VtonModels/man.png',
    color: '#10B981'
  },
  {
    id: 'woman',
    label: 'Woman',
    gender: 'female',
    ageRange: '18–45 yrs',
    ageMin: 18,
    ageMax: 45,
    promptFragment: 'A 25 year old woman, elegant posture, natural beauty, poised expression.',
    thumbnail: './VtonModels/woman.png',
    color: '#EF4444'
  }
]
