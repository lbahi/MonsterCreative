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
  // --- ENGLISH (US/UK) ---
  {
    id: 'captain',
    name: 'Captain',
    elevenLabsId: 'U0xH5XqH9N0NawL9bdEo',
    region: 'English',
    regionFlag: '🇺🇸',
    dialect: 'Deep',
    gender: 'male',
    tier: 'premium',
    useCase: 'Movie trailers, high-impact hooks.',
    sampleText: 'Welcome to the next generation of creative tools.'
  },
  {
    id: 'hale',
    name: 'Hale',
    elevenLabsId: 'dXtC3XhB9GtPusIpNtQx',
    region: 'English',
    regionFlag: '🇬🇧',
    dialect: 'Smooth',
    gender: 'male',
    tier: 'premium',
    useCase: 'Explainer videos, professional tech.',
    sampleText: 'Our platform simplifies your workflow instantly.'
  },
  {
    id: 'christina',
    name: 'Christina',
    elevenLabsId: 'BuaKXS4Sv1Mccaw3flfU',
    region: 'English',
    regionFlag: '🇺🇸',
    dialect: 'Deep',
    gender: 'female',
    tier: 'premium',
    useCase: 'Authority, luxury brand narrative.',
    sampleText: 'Experience elegance without compromise.'
  },
  {
    id: 'daria',
    name: 'Daria',
    elevenLabsId: 'vgY2u4uMeJ27m87AxkPi',
    region: 'English',
    regionFlag: '🇬🇧',
    dialect: 'Smooth',
    gender: 'female',
    tier: 'premium',
    useCase: 'Gentle wellness, lifestyle storytelling.',
    sampleText: 'Take a moment for yourself today.'
  },

  // --- FRENCH (FR) ---
  {
    id: 'lorenzo_pancino',
    name: 'Lorenzo Pancino',
    elevenLabsId: 'KjZCHHusbQ6lLGKGSTYf',
    region: 'French',
    regionFlag: '🇫🇷',
    dialect: 'Deep',
    gender: 'male',
    tier: 'premium',
    useCase: 'Prestige car ads, classic French luxury.',
    sampleText: 'L\'élégance à la française, redéfinie.'
  },
  {
    id: 'sam',
    name: 'Sam',
    elevenLabsId: '198lDJ7fXvCGYF6ldCsA',
    region: 'French',
    regionFlag: '🇫🇷',
    dialect: 'Smooth',
    gender: 'male',
    tier: 'premium',
    useCase: 'Modern apps, Parisian street fashion.',
    sampleText: 'Découvrez la nouvelle collection urbaine.'
  },
  {
    id: 'manon',
    name: 'Manon',
    elevenLabsId: 'm5U7XCsc8v988k2RJAqN',
    region: 'French',
    regionFlag: '🇫🇷',
    dialect: 'Deep',
    gender: 'female',
    tier: 'premium',
    useCase: 'High-end perfumes, sophisticated jewelry.',
    sampleText: 'L\'essence même de la beauté intemporelle.'
  },
  {
    id: 'audrey',
    name: 'Audrey',
    elevenLabsId: 'McVZB9hVxVSk3Equu8EH',
    region: 'French',
    regionFlag: '🇫🇷',
    dialect: 'Smooth',
    gender: 'female',
    tier: 'premium',
    useCase: 'Friendly service, travel, and tourism.',
    sampleText: 'Prêts pour votre prochaine aventure ?'
  },

  // --- ARABIC (MENA) ---
  {
    id: 'mazen_lawand',
    name: 'Mazen Lawand',
    elevenLabsId: 'rPNcQ53R703tTmtue1AT',
    region: 'Arabic (MENA)',
    regionFlag: '🌐',
    dialect: 'Deep',
    gender: 'male',
    tier: 'premium',
    useCase: 'Formal broadcast, documentaries.',
    sampleText: 'هنا تبدأ رحلتنا نحو اكتشاف المجهول.'
  },
  {
    id: 'elareef',
    name: 'ELareef',
    elevenLabsId: 'VqHyN6PYNu3uNKGdbxKs',
    region: 'Egypt',
    regionFlag: '🇪🇬',
    dialect: 'Masry (Deep)',
    gender: 'male',
    tier: 'premium',
    useCase: 'Powerful Egyptian sales and "Masry" energy.',
    sampleText: 'عروضنا ما تتفوتش، الحق الفرصة دلوقتي!'
  },
  {
    id: 'fares',
    name: 'Fares',
    elevenLabsId: '5Spsi3mCH9e7futpnGE5',
    region: 'Gulf',
    regionFlag: '🇸🇦',
    dialect: 'Khaleeji (Deep)',
    gender: 'male',
    tier: 'premium',
    useCase: 'Real estate, prestige automotive in GCC.',
    sampleText: 'الفخامة التي تستحقها، بانتظارك اليوم.'
  },
  {
    id: 'rachid',
    name: 'Rachid',
    elevenLabsId: '0Up3glsGKvZx3M5JI0XB',
    region: 'Maghreb',
    regionFlag: '🇲🇦',
    dialect: 'Maghrebi (Deep)',
    gender: 'male',
    tier: 'premium',
    useCase: 'Professional Maghreb business/corporate.',
    sampleText: 'مستقبل الأعمال يبدأ من هنا.'
  },
  {
    id: 'ilyass',
    name: 'Ilyass',
    elevenLabsId: 'jpofSqItAIlT4TLP5CrK',
    region: 'Maghreb',
    regionFlag: '🇩🇿',
    dialect: 'Algerian (Smooth)',
    gender: 'male',
    tier: 'premium',
    useCase: 'Conversational Algerian street culture.',
    sampleText: 'واش راكم؟ أرواحو تشوفو الجديد ديالي.'
  },
  {
    id: 'adina',
    name: 'Adina',
    elevenLabsId: 'FvmvwvObRqIHojkEGh5N',
    region: 'Maghreb',
    regionFlag: '🇲🇦',
    dialect: 'Moroccan (Smooth)',
    gender: 'female',
    tier: 'premium',
    useCase: 'Maghreb influencer style, modern retail.',
    sampleText: 'اكتشفوا أحدث صيحات الموضة معانا.'
  },
  {
    id: 'belma',
    name: 'Belma',
    elevenLabsId: 'KbaseEXyT9EE0CQLEfbB',
    region: 'Arabic (MENA)',
    regionFlag: '🌐',
    dialect: 'Smooth',
    gender: 'female',
    tier: 'premium',
    useCase: 'General Arabic lifestyle & warmth.',
    sampleText: 'نشارككم أجمل اللحظات كل يوم.'
  },
  {
    id: 'salma',
    name: 'Salma',
    elevenLabsId: 'KxMRrXEjbJ6kZ93yT3fq',
    region: 'Gulf',
    regionFlag: '🇦🇪',
    dialect: 'Khaleeji (Smooth)',
    gender: 'female',
    tier: 'premium',
    useCase: 'High-end GCC fashion and beauty.',
    sampleText: 'لأنك تستحقين الأفضل، اخترنا لك هذه المجموعة.'
  },
  {
    id: 'yasmine',
    name: 'Yasmine',
    elevenLabsId: 'L10lEremDiJfPicq5CPh',
    region: 'Egypt',
    regionFlag: '🇪🇬',
    dialect: 'Masry (Smooth)',
    gender: 'female',
    tier: 'premium',
    useCase: 'Energetic Egyptian FMCG/Retail.',
    sampleText: 'طعم يجنن، جربوه دلوقتي ومش هتندموا!'
  },
  {
    id: 'rima_m',
    name: 'Rima M',
    elevenLabsId: 'GLRyn2pNxpZ4FAjmlY3z',
    region: 'Maghreb',
    regionFlag: '🇩🇿',
    dialect: 'Algerian (Smooth)',
    gender: 'female',
    tier: 'premium',
    useCase: 'Engaging, lifestyle narrative in Algerian dialect.',
    sampleText: 'تبعونا باش تكتشفو كولش جديد.'
  }
];
