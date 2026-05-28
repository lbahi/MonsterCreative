export { REFERENCE_SHEET_PROMPT } from './referenceSheet';

export const LOADING_MESSAGES = {
  referenceSheet: [
    'Analyzing your product photos...',
    'Reconstructing product geometry...',
    'Rendering reference sheet...'
  ],
  storyboard: [
    'Studying your product...',
    'Crafting your commercial concept...',
    'Writing storyboard directions...',
    'Rendering your storyboard...'
  ],
  video: [
    'Preparing your commercial...',
    'Animating the storyboard...',
    'Rendering final frames...',
    'Almost there...'
  ]
} as const;

export function buildGeminiPrompt(params: {
  productName: string;
  brandName: string;
  duration: number;
  aspectRatio: string;
  platform: string;
  vibeName: string;
  creativeDirection: string;
  vibeRules: string;
  baseRules: string;
}): { system: string; user: string } {
  const systemPrompt = `${params.baseRules}\n\n${params.vibeRules}`;

  const userPrompt = `
INPUTS:
- PRODUCT_NAME: ${params.productName}
- BRAND_NAME: ${params.brandName}
- DURATION: ${params.duration}
- ASPECT_RATIO: ${params.aspectRatio}
- PLATFORM: ${params.platform}
- VIBE_NAME: ${params.vibeName}
- CREATIVE_DIRECTION: ${params.creativeDirection || 'None provided'}

Using the attached product reference sheet image, analyze the product's visual features and generate the 5 outputs.

Return PLAIN TEXT with section headers. NO JSON. NO markdown fences.
Use exactly these section headers:

=== STORYBOARD_PROMPT ===
[OUTPUT 1: full text prompt for GPT Image 2]

=== SEEDANCE_PROMPT ===
[OUTPUT 2: full video prompt for Seedance 2.0]

=== SEEDANCE_NEGATIVE ===
[OUTPUT 2B: negative prompt text]

=== VOICEOVER ===
[OUTPUT 3: voiceover script text]

=== MUSIC ===
[OUTPUT 4: music generation prompt]

=== END ===
`;

  return { system: systemPrompt, user: userPrompt };
}

export function parseGeminiOutputs(response: string): {
  storyboard_visual_prompt: string;
  seedance_video_prompt: string;
  seedance_negative_prompt: string;
  voiceover_script: string;
  music_prompt: string;
} | null {
  try {
    const raw = response.trim();

    // --- Method 1: Section-based parsing (plain text) ---
    const extractSection = (text: string, startMarker: string, endMarker: string): string => {
      const startIdx = text.indexOf(startMarker);
      if (startIdx === -1) return '';
      const contentStart = startIdx + startMarker.length;
      const endIdx = text.indexOf(endMarker, contentStart);
      if (endIdx === -1) return text.slice(contentStart).trim();
      return text.slice(contentStart, endIdx).trim();
    };

    const sectionStoryboard = extractSection(raw, '=== STORYBOARD_PROMPT ===', '=== SEEDANCE_PROMPT ===');
    const sectionSeedance = extractSection(raw, '=== SEEDANCE_PROMPT ===', '=== SEEDANCE_NEGATIVE ===');
    const sectionNegative = extractSection(raw, '=== SEEDANCE_NEGATIVE ===', '=== VOICEOVER ===');
    const sectionVoiceover = extractSection(raw, '=== VOICEOVER ===', '=== MUSIC ===');
    const sectionMusic = extractSection(raw, '=== MUSIC ===', '=== END ===');

    // If sections found, use them
    if (sectionStoryboard && sectionSeedance) {
      return {
        storyboard_visual_prompt: sectionStoryboard,
        seedance_video_prompt: sectionSeedance,
        seedance_negative_prompt: sectionNegative,
        voiceover_script: sectionVoiceover,
        music_prompt: sectionMusic
      };
    }

    // --- Method 2: JSON fallback ---
    console.log('[AdMaker] Section markers not found, trying JSON fallback');
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch (e) {
      console.error('[AdMaker] JSON parse failed:', e);
      console.error('[AdMaker] Cleaned response was:', cleaned);
      return null;
    }

    const storyboard_visual_prompt =
      typeof parsed.storyboard_visual_prompt === 'string' ? parsed.storyboard_visual_prompt :
      typeof parsed.STORYBOARD_PROMPT === 'string' ? parsed.STORYBOARD_PROMPT :
      null;

    const seedance_video_prompt =
      typeof parsed.seedance_video_prompt === 'string' ? parsed.seedance_video_prompt :
      typeof parsed.SEEDANCE_PROMPT === 'string' ? parsed.SEEDANCE_PROMPT :
      null;

    if (!storyboard_visual_prompt || !seedance_video_prompt) {
      console.error('[AdMaker] Missing required keys. Available:', Object.keys(parsed));
      return null;
    }

    return {
      storyboard_visual_prompt,
      seedance_video_prompt,
      seedance_negative_prompt:
        typeof parsed.seedance_negative_prompt === 'string' ? parsed.seedance_negative_prompt :
        typeof parsed.negative_prompt === 'string' ? parsed.negative_prompt : '',
      voiceover_script:
        typeof parsed.voiceover_script === 'string' ? parsed.voiceover_script :
        typeof parsed.VOICEOVER_SCRIPT === 'string' ? parsed.VOICEOVER_SCRIPT : '',
      music_prompt:
        typeof parsed.music_prompt === 'string' ? parsed.music_prompt :
        typeof parsed.MUSIC_PROMPT === 'string' ? parsed.MUSIC_PROMPT : ''
    };
  } catch (err) {
    console.error('[AdMaker] Gemini parse error:', err);
    console.error('[AdMaker] Raw response was:', response);
    return null;
  }
}
