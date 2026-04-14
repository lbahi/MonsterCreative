import { falService, CopyVariant } from './fal.service'

/**
 * AnthropicService - TypeScript Port
 * Orchestrates high-level LLM prompts using the fal.ai openrouter/router endpoint.
 * Ported from C# AnthropicService.cs with identical prompt structure.
 */

/** Maps the ANALYSIS_MODELS dropdown IDs to OpenRouter model IDs */
const MODEL_ID_MAP: Record<string, string> = {
  'gemini-3-pro': 'google/gemini-2.0-flash-exp:free',
  'kimi-k2.5-thinking': 'moonshotai/kimi-k2.5-thinking',
  'claude-opus-4-20250514-thinking-16k': 'anthropic/claude-opus-4-20250514'
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

export interface ConsultationResponse {
  question: string;
  contextSummary: string; // "What we know so far"
  isFinished: boolean;
}

export interface ProductAnalysis {
  product: string;
  material: string;
  category: string;
  features: string[];
  // AI-determined strategy (populated in one-shot mode)
  targetAudience?: string;
  priceTier?: string;
  recommendedPlatforms?: string[];
}

export interface OneShotResult {
  analysis: ProductAnalysis;
  variants: CopyVariant[];
}


export interface AdCopyRequest {
  productName: string
  valueProp: string
  targetAudience: string
  platform: string
  desiredAction: string
  tone: string
  selectedVariantTypes: string[]
  llmModelId: string
}

export interface ContentStrategyRequest {
  // From survey
  productAnalysis: {
    product: string
    material: string
    category: string
    features: string[]
  }
  selectedAudiences: string[]
  selectedAngles: string[]
  campaignDuration: string
  selectedPlatforms: string[]
  priceTier: string
  exactPrice: string
  needsLandingPage: boolean
  needsVideo: boolean
  selectedVideoTypes: string[]
  brandVoice: string
  analysisModelId: string
}

export interface ContentStrategyResult {
  variants: CopyVariant[]
  rawOutput: string
}

export class AnthropicService {
  /**
   * Resolves the user-facing model dropdown ID to the OpenRouter model ID.
   */
  private resolveModelId(dropdownId: string): string {
    return MODEL_ID_MAP[dropdownId] || dropdownId;
  }

  /**
   * ONE-SHOT: Analyzes the product image AND generates the full content plan
   * in a single API call. The AI self-determines: audience, price tier, platforms.
   */
  async generatePlanFromImage(dataUrl: string, selectedModel: string = 'google/gemini-2.5-flash'): Promise<OneShotResult> {
    const systemPrompt = `أنت MonsterCreative AI — خبير تسويق رقمي متخصص في السوق العربي والخليجي.

مهمتك في هذا الطلب الواحد:
1. حلّل صورة المنتج (المنتج، المادة، الفئة، المزايا البيعية).
2. حدد استراتيجية التسويق الأمثل بنفسك: الجمهور المستهدف، فئة السعر، المنصات المناسبة.
3. أنشئ خطة محتوى تسويقي متكاملة.

قواعد الكتابة الإعلانية الصارمة:
1. كل عنوان يجذب الانتباه خلال 3 ثوانٍ.
2. استخدم استراتيجية السعر حسب الفئة التي حددتها (اقتصادي/متوسط/فاخر).
3. التزم بحدود الأحرف: فيسبوك 125 حرف، تيك توك 100 حرف.
4. فيسبوك: إيموجي بحذر. تيك توك: أشر لصوت تريند.
5. خطافات الفيديو: Pattern Interrupt في أول ثانيتين.
6. CTA محدد وموجه للفعل الفوري.
7. Pain-Killer: مشكلة → تهييج → حل.
8. Dream-State: صورة حية للمستقبل المشرق للعميل.
9. نوّع الخطافات: سؤال، صدمة، فضول، تصريح.

أخرج JSON واحد فقط بهذا الهيكل الدقيق (بدون أي نص قبله أو بعده، بدون markdown):
{
  "analysis": {
    "product": "اسم المنتج",
    "material": "المادة",
    "category": "الفئة",
    "features": ["ميزة 1", "ميزة 2", "ميزة 3"],
    "targetAudience": "الجمهور المستهدف المقترح مع مبرر",
    "priceTier": "متوسط",
    "recommendedPlatforms": ["فيسبوك", "إنستغرام"]
  },
  "variants": [
    {
      "variantType": "Pain-Killer",
      "headline1": "العنوان الأول (40 حرف كحد أقصى)",
      "headline2": "العنوان الثاني",
      "headline3": "العنوان الثالث",
      "hook": "الخطاف (سؤال، صدمة، فضول)",
      "bodyCopy": "النص الإعلاني الكامل بأسلوب الاستجابة المباشرة",
      "cta": "نداء الإجراء المحدد",
      "triggersUsed": "المحفزات النفسية المستخدمة",
      "landingPagePart": "موجز الصفحة التسويقية",
      "videoScripts": "فكرة الفيديو والخطاف المرئي"
    },
    {
      "variantType": "Dream-State",
      "headline1": "...", "headline2": "...", "headline3": "...",
      "hook": "...", "bodyCopy": "...", "cta": "...",
      "triggersUsed": "...", "landingPagePart": "...", "videoScripts": "..."
    },
    {
      "variantType": "Curiosity",
      "headline1": "...", "headline2": "...", "headline3": "...",
      "hook": "...", "bodyCopy": "...", "cta": "...",
      "triggersUsed": "...", "landingPagePart": "...", "videoScripts": "..."
    }
  ]
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'حلّل هذا المنتج وأنشئ خطة التسويق الكاملة.' },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ];

    const response = await window.api.fal.chatCompletion(messages, selectedModel);
    if (response.error) throw new Error(response.error);

    const raw = response.data!;
    const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    const parsed = JSON.parse(jsonStr.substring(start, end + 1));

    return {
      analysis: parsed.analysis as ProductAnalysis,
      variants: parsed.variants as CopyVariant[]
    };
  }

  /**
   * @deprecated Use generatePlanFromImage instead.
   * Kept for backward compatibility with other screens.
   */
  async analyzeProductImage(dataUrl: string, selectedModel: string = 'google/gemini-2.5-flash'): Promise<ProductAnalysis> {
    const systemPrompt = `أنت "المحلل الاستراتيجي" — مدير تسويق عالي الأداء متخصص في السوق العربي.
مهمتك: تحليل صورة المنتج فقط وإخراج تشخيص دقيق.

أخرج JSON فقط بهذه الهيكلة (بدون أي نص قبله أو بعده، بدون markdown):
{
  "product": "اسم المنتج بالعربية",
  "material": "المادة أو الخامة بالعربية",
  "category": "الفئة بالعربية",
  "features": ["ميزة بيعية 1", "ميزة بيعية 2", "ميزة بيعية 3"]
}

قواعد صارمة:
- جميع القيم النصية باللغة العربية الفصيحة
- مفاتيح JSON فقط تبقى بالإنجليزية
- ركّز على الميزات البيعية الفعلية من الصورة`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'حلل هذا المنتج وأخرج JSON التشخيص التسويقي.' },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ];

    const response = await window.api.fal.chatCompletion(messages, selectedModel);
    if (response.error) throw new Error(response.error);

    const jsonStr = response.data!.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(jsonStr) as ProductAnalysis;
  }

  /**
   * Phase 2: The Proactive Strategist.
   * Makes intelligent suggestions based on the product analysis, then confirms
   * or refines with the user. Collects: Audience, Price, Platforms, Video Content.
   * Does NOT ask — it SUGGESTS and asks the user to confirm.
   */
  async getNextConsultationQuestion(
    history: ChatMessage[],
    productInfo: ProductAnalysis,
    selectedModel: string = 'google/gemini-2.5-flash'
  ): Promise<ConsultationResponse> {
    const systemPrompt = `أنت "الاستراتيجي الاستباقي" لـ MonsterCreative — تساعد أصحاب المنتجات في السوق العربي.

هذا هو المنتج الذي تم تحليله:
- المنتج: ${productInfo.product}
- الفئة: ${productInfo.category}
- المادة: ${productInfo.material}
- الميزات: ${productInfo.features?.join('، ')}

دورك:
بدلاً من مجرد طرح أسئلة، اقترح بذكاء بناءً على المنتج. مثال:
"بناءً على هذا المنتج، أرى أن الجمهور الأنسب هو [X] بسبب [Y]. هل تتفق؟ أو لديك شريحة مختلفة في ذهنك؟"

البيانات التي يجب جمعها (متسلسلة، واحدة في كل رد):
1. Target Audience — اقترح شريحة محددة مع مبرر من الصورة.
2. Price Point — اقترح فئة السعر (اقتصادي / متوسط / فاخر) مع نطاق سعري مقترح.
3. Platforms — اقترح منصات بناءً على الجمهور المتفق عليه.
4. Video Content — اقترح نوع الفيديو الأنسب للمنتج والمنصة (Reels، UGC، Animation، إلخ).

بمجرد تأكيد جميع البنود الأربعة — اضبط "isFinished" على true.

قواعد المحادثة:
- اقتراح ذكي + تأكيد في كل رد (وليس مجرد سؤال).
- لا مقدمات، لا "أحسنت"، مباشرة للاقتراح.
- احتفظ بـ "contextSummary": جملة واحدة تلخص ما تم الاتفاق عليه.

أخرج JSON فقط:
{
  "question": "الاقتراح + سؤال التأكيد بالعربية",
  "contextSummary": "ملخص ما تم الاتفاق عليه حتى الآن بالعربية",
  "isFinished": false
}`;

    // Gemini requires: system → user → assistant → user → ...
    // We inject a synthetic trigger user message so history always follows a valid turn pattern.
    // Without this, system → assistant → user causes Gemini to ignore prior turns.
    const triggerMessage = {
      role: 'user' as const,
      content: `المنتج: ${productInfo.product} | الفئة: ${productInfo.category} | الميزات: ${productInfo.features?.join('، ')}. ابدأ جلسة الاستراتيجية.`
    };

    const messages = [
      { role: 'system', content: systemPrompt },
      triggerMessage,
      ...history
    ];

    const response = await window.api.fal.chatCompletion(messages, selectedModel);
    if (response.error) throw new Error(response.error);

    const jsonStr = response.data!.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(jsonStr) as ConsultationResponse;
  }

  /**
   * Final Step: Synthesis.
   * Generates the multi-variant content plan from the entire consultation.
   */
  async generateFinalMarketingPlan(
    history: ChatMessage[],
    productInfo: ProductAnalysis,
    selectedModel: string = 'google/gemini-2.5-pro'
  ): Promise<ContentStrategyResult> {
    const transcript = history.map(m => `${m.role.toUpperCase()}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n');
    
    const prompt = `أنت MonsterCreative AI — خبير تسويق رقمي وإطلاق منتجات للسوق العربي.
لخّص هذه الجلسة الاستشارية في خطة محتوى تسويقي متكاملة بناءً على هذه القواعد الصارمة.

محاضر الجلسة (الاستراتيجية المتفق عليها):
${transcript}

معلومات المنتج الأساسية (من الصورة):
- المنتج: ${productInfo.product}
- الفئة: ${productInfo.category}
- المادة: ${productInfo.material}
- الميزات: ${productInfo.features?.join('، ')}

قواعد الكتابة الإعلانية الصارمة (CRITICAL STRATEGY RULES):
1. يجب أن يجذب كل عنوان (Headline) الانتباه خلال 3 ثوانٍ.
2. استخدم استراتيجية السعر بناءً على الفئة المتفق عليها في الجلسة.
3. التزم بحدود الأحرف للمنصات (فيسبوك: 125 حرف للنص الأساسي، تيك توك: 100 حرف).
4. استخدم عناصر المنصات (فيسبوك: إيموجي بحذر، تيك توك: إشارة لصوت تريند).
5. خطافات الفيديو يجب أن تخلق (Pattern Interrupt) في أول ثانيتين.
6. جميع الـ CTAs يجب أن تكون محددة وموجهة للفعل المجرد.
7. لزاوية Pain-Killer: ابدأ بالمشكلة، هيّج المشاعر، ثم قدم الحل.
8. لزاوية Dream-State: ارسم صورة حية للمستقبل المشرق للعميل.
9. نوّع الخطافات: سؤال، تصريح، صدمة، فضول.

عدد النسخ المطلوبة:
استخرج من محاضر الجلسة عدد النسخ المطلوبة. إذا لم يُذكر عدد محدد، أنتج 3 نسخ كحد أدنى بزوايا مختلفة.

أخرج JSON array فقط (بدون أي نص آخر أو markdown):
[
  {
    "variantType": "نوع الزاوية (Pain-Killer / Dream-State / Curiosity)",
    "headline1": "العنوان الأول (40 حرف كحد أقصى)",
    "headline2": "العنوان الثاني",
    "headline3": "العنوان الثالث",
    "hook": "الخطاف (سؤال، صدمة، فضول)",
    "bodyCopy": "النص الإعلاني الكامل بأسلوب الاستجابة المباشرة",
    "cta": "نداء الإجراء المحدد",
    "triggersUsed": "المحفزات النفسية المستخدمة",
    "landingPagePart": "موجز الصفحة التسويقية",
    "videoScripts": "فكرة الفيديو والخطاف المرئي (Pattern Interrupt)"
  }
]`;

    const rawOutput = await falService.generateCopy(prompt, selectedModel);
    
    let jsonString = rawOutput.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = jsonString.substring(firstBracket, lastBracket + 1);
    }

    try {
      const parsed = JSON.parse(jsonString);
      const variants: CopyVariant[] = Array.isArray(parsed) ? parsed : [parsed];
      return { variants, rawOutput };
    } catch (e: any) {
      throw new Error(`Failed to parse final plan JSON: ${e.message}`);
    }
  }

  /**
   * Simple ad copy generation (Compatibility helper).
   */
  async generateAdCopy(campaignName: string, platforms: string[], tone: string, modelId?: string): Promise<string> {
    const prompt = `Generate 3 ad copy variations for ${campaignName} on ${platforms.join(', ')} with a ${tone} tone. Return JSON array with keys: variant, headline, hook, body, cta.`;
    return await falService.generateCopy(prompt, modelId || 'google/gemini-2.0-flash-001');
  }

  /**
   * The "AI Casting Director" logic for VTON and campaign imagery.
   */
  async getGarmentAnalysis(description: string): Promise<string> {
    const prompt = `
      Analyze this garment: "${description}"
      Determine:
      1. Gender (Male/Female/Unisex) - BE EXTREMELY ACCURATE BASED ON CUT/STYLE.
      2. Primary Color/Pattern.
      3. Occasion (Casual/Formal/Sport).

      Return a descriptive prompt fragment for an AI model choice.`

    return await falService.generateCopy(prompt, 'google/gemini-3-pro')
  }
}

export const anthropicService = new AnthropicService()
