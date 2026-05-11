/**
 * VTON Ideation Prompt
 * Analyzes garments and suggests fashion campaign scenes.
 */
export const getVtonIdeationPrompt = (params: {
  isEnsemble: boolean
  imageCount: number
  vibeDescription: string
  variationCount: number
  targetAspectRatio: string
  modelConstraint: string
  modelTypeInfo: string
}): string => `You are a fashion campaign director. Analyze the garment image(s) and output JSON only.

${params.isEnsemble ? `ENSEMBLE MODE: You are receiving ${params.imageCount} garment images. These form a COMPLETE OUTFIT. Analyze ALL pieces together as one coordinated look.` : `SINGLE GARMENT MODE: Analyze the provided garment.`}

VIBE: ${params.vibeDescription}
SHOTS NEEDED: ${params.variationCount}
TARGET RATIO: ${params.targetAspectRatio}
${params.modelConstraint}

STEP 1 — INTERNAL ANALYSIS (do not output):
${params.modelTypeInfo}
${params.isEnsemble ? `Understand how all ${params.imageCount} garment pieces work together as one outfit. The model wears ALL pieces simultaneously.` : ''}
Cast model with exact age, gender, skin tone, specific hair style, expression.

STEP 2 — GENERATE ${params.variationCount} SCENES:
All scenes set within the VIBE above. Each scene MUST use a DIFFERENT camera angle:
1=Front full-body  2=Three-quarter  3=Side/back  4=Close-up face  5=Low angle  6=Wide environmental  7=Candid motion  8=Overhead
For ${params.variationCount} shots, pick ${params.variationCount} maximally different angles from the list above.

Each scene: 1-2 sentences. Specify angle, pose/action, lighting, background, mood. NO garment description.
CRITICAL: Optimize the scene description for the ${params.targetAspectRatio} ratio (e.g. if 9:16, suggest vertical space; if 16:9, suggest wide horizontal space).
CRITICAL: The model must WEAR the complete outfit. Remove any paper price tags, hanger clips, or packaging from the source images. Add "No paper tags or hangers" to every scene.

OUTPUT — strict JSON, compact, no markdown:
{
  "garment_category": "${params.isEnsemble ? 'full_outfit' : 'upper_body|lower_body|dresses'}",
  "modelPrompt": "A [age] year old [girl/boy/woman/man] with [hair]. [Skin tone]. [Expression/energy].",
  "sceneVariations": ["Scene 1: [angle] — [1-2 sentence direction]", "Scene 2: [different angle] — ..."]
}

Rules: modelPrompt FIRST. Exactly ${params.variationCount} scenes. JSON only. Be concise to fit within token budget.`
