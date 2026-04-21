export interface VoiceEntry {
  id: string
  name: string
  elevenLabsId: string
  region: string
  regionFlag: string
  dialect: string
  gender: 'male' | 'female'
  tier: 'free' | 'premium'
  useCase: string
  sampleText: string
}

export const VOICE_REGISTRY: VoiceEntry[] = [
  {
    id: 'haytham',
    name: 'Haytham',
    elevenLabsId: 'UR972wNGq3zluze0LoIp',
    region: 'Egypt',
    regionFlag: '🇪🇬',
    dialect: 'Masry',
    gender: 'male',
    tier: 'premium',
    useCase: 'Cairo Energy — High-tempo sales, street food, retail',
    sampleText: 'احنا هنا عشانك، أفضل عروض في مصر'
  },
  {
    id: 'nasser',
    name: 'Nasser',
    elevenLabsId: 'cFUFIbKkO2iZFwS8cRnY',
    region: 'Gulf',
    regionFlag: '🇸🇦',
    dialect: 'Khaleeji',
    gender: 'male',
    tier: 'premium',
    useCase: 'Gulf Corporate — Professional, calm, authority',
    sampleText: 'تطور مستمر، وخدمة متميزة في الخليج'
  },
  {
    id: 'mona',
    name: 'Mona',
    elevenLabsId: 'placeholder_mona',
    region: 'Egypt',
    regionFlag: '🇪🇬',
    dialect: 'Masry',
    gender: 'female',
    tier: 'premium',
    useCase: 'Daily Life — Friendly, approachable, lifestyle',
    sampleText: 'يومك أحلى مع خدماتنا الجديدة'
  },
  {
    id: 'fatima',
    name: 'Fatima',
    elevenLabsId: 'placeholder_fatima',
    region: 'Maghreb',
    regionFlag: '🇲🇦',
    dialect: 'Darija',
    gender: 'female',
    tier: 'premium',
    useCase: 'Cultural — Authentic, warm, engaging',
    sampleText: 'مرحبا بكم في عالمنا المتميز'
  },
  {
    id: 'zaid',
    name: 'Zaid',
    elevenLabsId: 'placeholder_zaid',
    region: 'Levant',
    regionFlag: '🇯🇴',
    dialect: 'Shami',
    gender: 'male',
    tier: 'premium',
    useCase: 'Narrative — Storytelling, documentary, education',
    sampleText: 'قصص نجاح من قلب بلاد الشام'
  },
  {
    id: 'hoda',
    name: 'Hoda',
    elevenLabsId: 'placeholder_hoda',
    region: 'Egypt',
    regionFlag: '🇪🇬',
    dialect: 'Masry',
    gender: 'female',
    tier: 'premium',
    useCase: 'Luxury — Elegant, sophisticated, fashion',
    sampleText: 'الأناقة تبدأ من هنا'
  },
  {
    id: 'yasmine',
    name: 'Yasmine',
    elevenLabsId: 'placeholder_yasmine',
    region: 'Gulf',
    regionFlag: '🇸🇦',
    dialect: 'Khaleeji',
    gender: 'female',
    tier: 'premium',
    useCase: 'Hospitality — Welcoming, soft, premium',
    sampleText: 'حياكم الله في وجهتكم المفضلة'
  },
  {
    id: 'kareem',
    name: 'Kareem',
    elevenLabsId: 'placeholder_kareem',
    region: 'UAE',
    regionFlag: '🇦🇪',
    dialect: 'Emirati',
    gender: 'male',
    tier: 'premium',
    useCase: 'Tech — Modern, innovative, startup',
    sampleText: 'ابتكار يقود المستقبل من دبي'
  },
  {
    id: 'laila',
    name: 'Laila',
    elevenLabsId: 'placeholder_laila',
    region: 'Global',
    regionFlag: '🌐',
    dialect: 'Fosha',
    gender: 'female',
    tier: 'premium',
    useCase: 'News — Neutral, clear, informative',
    sampleText: 'نقدم لكم آخر المستجدات بكل دقة'
  }
]
