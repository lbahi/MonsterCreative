export const getGarmentAnalysisPrompt = (description: string): string => `
Analyze this garment: "${description}"
Determine:
1. Gender (Male/Female/Unisex) - BE EXTREMELY ACCURATE BASED ON CUT/STYLE.
2. Primary Color/Pattern.
3. Occasion (Casual/Formal/Sport).

Return a descriptive prompt fragment for an AI model choice.`
