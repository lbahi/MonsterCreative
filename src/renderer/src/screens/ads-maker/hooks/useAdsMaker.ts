import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  REFERENCE_SHEET_PROMPT,
  LOADING_MESSAGES,
  buildGeminiPrompt,
  parseGeminiOutputs
} from '../prompts';
import baseRules from '../prompts/base-rules.md?raw';
import hypermotionVibe from '../prompts/hypermotion.md?raw';
import tvspotVibe from '../prompts/tvspot.md?raw';
import wildcardVibe from '../prompts/wildcard.md?raw';

export type WizardPhase = 1 | 2 | 3;

export interface AdProject {
  id: string;
  status: string;
  source_images: string[];
  reference_sheet_url: string | null;
  metadata: {
    product_name: string | null;
    brand_name: string | null;
    platform: string | null;
    aspect_ratio: string | null;
    duration: number;
    vibe: string | null;
    creative_direction: string | null;
  };
  outputs: {
    storyboard_visual_prompt: string | null;
    seedance_video_prompt: string | null;
    seedance_negative_prompt: string | null;
    voiceover_script: string | null;
    music_prompt: string | null;
    storyboard_image_url: string | null;
    final_video_url: string | null;
    voiceover_audio_url: string | null;
    music_audio_url: string | null;
  };
  phase: WizardPhase;
  created_at: string;
  updated_at: string;
}

const VIBE_MAP: Record<string, string> = {
  hyper_motion: hypermotionVibe,
  tv_spot: tvspotVibe,
  wild_card: wildcardVibe
};

function generateId(): string {
  return `adp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createInitialProject(): AdProject {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    status: 'draft',
    source_images: [],
    reference_sheet_url: null,
    metadata: {
      product_name: null,
      brand_name: null,
      platform: null,
      aspect_ratio: null,
      duration: 10,
      vibe: null,
      creative_direction: null
    },
    outputs: {
      storyboard_visual_prompt: null,
      seedance_video_prompt: null,
      seedance_negative_prompt: null,
      voiceover_script: null,
      music_prompt: null,
      storyboard_image_url: null,
      final_video_url: null,
      voiceover_audio_url: null,
      music_audio_url: null
    },
    phase: 1,
    created_at: now,
    updated_at: now
  };
}

export function useAdsMaker() {
  const navigate = useNavigate();
  const [project, setProject] = useState<AdProject>(createInitialProject());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasUnfinishedJob, setHasUnfinishedJob] = useState(false);
  const [unfinishedJobId, setUnfinishedJobId] = useState<string | null>(null);
  const [storyboardQuality, setStoryboardQuality] = useState<'low' | 'medium' | 'high'>('low');
  const loadingInterval = useRef<NodeJS.Timeout | null>(null);

  const clearLoading = useCallback(() => {
    if (loadingInterval.current) {
      clearInterval(loadingInterval.current);
      loadingInterval.current = null;
    }
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const startLoadingSequence = useCallback((type: 'referenceSheet' | 'storyboard' | 'video') => {
    const messages = LOADING_MESSAGES[type];
    let index = 0;
    setIsLoading(true);
    setLoadingMessage(messages[0]);
    loadingInterval.current = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 5000);
  }, []);

  const persistProject = useCallback(async (updated: AdProject) => {
    try {
      console.log('[AdMaker] persistProject - reference_sheet_url:', updated.reference_sheet_url);
      await window.api.database.saveAdProject(updated);
    } catch (err) {
      console.error('[AdMaker] Failed to persist:', err);
    }
  }, []);

  const updateProject = useCallback((updates: Partial<AdProject>) => {
    setProject(prev => {
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      persistProject(updated);
      return updated;
    });
  }, [persistProject]);

  const setPhase = useCallback((phase: WizardPhase) => {
    updateProject({ phase, status: phase === 1 ? 'draft' : phase === 2 ? 'phase1_complete' : 'phase2_complete' });
  }, [updateProject]);

  const createNewProject = useCallback(() => {
    clearLoading();
    setError(null);
    setHasUnfinishedJob(false);
    const newProject = createInitialProject();
    setProject(newProject);
    persistProject(newProject);
  }, [clearLoading, persistProject]);

  const loadProject = useCallback(async (id: string) => {
    try {
      const loaded = await window.api.database.getAdProject(id);
      console.log('[AdMaker] Loaded project:', loaded);
      console.log('[AdMaker] Reference sheet URL:', loaded?.reference_sheet_url);
      console.log('[AdMaker] Source images count:', loaded?.source_images?.length);
      if (loaded) {
        setProject(loaded);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AdMaker] Failed to load project:', err);
      return false;
    }
  }, []);

  const checkUnfinishedJobs = useCallback(async () => {
    try {
      const jobs = await window.api.database.getAllAdProjects();
      const unfinished = jobs.find((j: AdProject) => !j.outputs.final_video_url && j.outputs.storyboard_image_url);
      setHasUnfinishedJob(!!unfinished);
      setUnfinishedJobId(unfinished?.id || null);
      return unfinished?.id || null;
    } catch (err) {
      console.error('[AdMaker] Failed to check jobs:', err);
      return null;
    }
  }, []);

  const generateReferenceSheet = useCallback(async (imageDataUrls: string[], _useGptImage2 = true, quality: 'low' | 'medium' | 'high' = 'low') => {
    // Filter out empty/undefined images - accept both data URLs and already-uploaded fal.media URLs
    const validImages = imageDataUrls.filter(url => url && (url.startsWith('data:') || url.includes('fal.media')));
    console.log('[AdsMaker] generateReferenceSheet called with', imageDataUrls.length, 'images,', validImages.length, 'valid', `(using GPT Image 2)`, `quality: ${quality}`);

    if (validImages.length === 0) {
      setError('No valid images to upload');
      return;
    }

    setError(null);
    startLoadingSequence('referenceSheet');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < validImages.length; i++) {
        console.log(`[AdsMaker] Uploading image ${i + 1}/${validImages.length}...`);
        console.log(`[AdsMaker] Image data preview:`, validImages[i]?.substring(0, 50));
        const result = await window.api.fal.uploadImageFromDataUrl(validImages[i]);
        console.log(`[AdsMaker] Upload result for image ${i + 1}:`, result.error ? `Error: ${result.error}` : `Success: ${result.url?.substring(0, 50)}...`);
        if (result.error || !result.url) throw new Error(result.error || 'Upload failed');
        uploadedUrls.push(result.url);
      }
      console.log('[AdsMaker] All images uploaded. Calling GPT Image 2...');

      let refResult: { images?: Array<{ url: string }>; error?: string };

      // Always use GPT Image 2 for reference sheet
      // @ts-expect-error - gptImage2Edit is added to the API
      refResult = await window.api.fal.gptImage2Edit({
        prompt: REFERENCE_SHEET_PROMPT,
        image_urls: uploadedUrls,
        image_size: 'auto',
        quality: quality,
        num_images: 1,
        output_format: 'jpeg'
      }) as { images?: Array<{ url: string }>; error?: string };
      console.log('[AdsMaker] GPT Image 2 result:', refResult.error ? `Error: ${refResult.error}` : `Success: ${refResult.images?.[0]?.url?.substring(0, 50)}...`);

      const sheetUrl = refResult.images?.[0]?.url;
      console.log('[AdsMaker] sheetUrl before updateProject:', sheetUrl);
      if (!sheetUrl) throw new Error('Failed to generate reference sheet');

      console.log('[AdsMaker] Calling updateProject with reference_sheet_url:', sheetUrl);
      updateProject({
        source_images: validImages, // Save original data URLs, not temporary Fal URLs
        reference_sheet_url: sheetUrl,
        phase: 1,
        status: 'reference_generated'
      });
      console.log('[AdsMaker] updateProject called');

      clearLoading();
      return sheetUrl;
    } catch (err) {
      console.error('[AdsMaker] generateReferenceSheet error:', err);
      clearLoading();
      const msg = err instanceof Error ? err.message : 'Reference sheet generation failed';
      setError(msg);
      throw err;
    }
  }, [startLoadingSequence, clearLoading, updateProject]);

  const detectProductInfo = useCallback(async (referenceSheetUrl: string) => {
    try {
      const prompt = `Look at this product reference sheet. Return ONLY a JSON object with two fields: {"product_name": "...", "brand_name": "..."}. Read them exactly from the packaging. If not visible, return empty strings.`;
      const response = await window.api.fal.chatCompletion([
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: referenceSheetUrl } }
          ]
        }
      ], 'google/gemini-2.5-flash');

      if (response.data) {
        const cleaned = response.data.replace(/```json\s*/i, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          productName: parsed.product_name || '',
          brandName: parsed.brand_name || ''
        };
      }
    } catch (err) {
      console.error('[AdMaker] Product detection failed:', err);
    }
    return { productName: '', brandName: '' };
  }, []);

  const generateStoryboard = useCallback(async (params: {
    productName: string;
    brandName: string;
    platform: string;
    aspectRatio: string;
    duration: number;
    vibe: string;
    creativeDirection: string;
  }) => {
    setError(null);
    startLoadingSequence('storyboard');

    try {
      const vibeRules = VIBE_MAP[params.vibe] || hypermotionVibe;
      const { system, user } = buildGeminiPrompt({
        ...params,
        vibeName: params.vibe,
        vibeRules,
        baseRules
      });

      const response = await window.api.fal.chatCompletion([
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: user },
            { type: 'image_url', image_url: { url: project.reference_sheet_url! } }
          ]
        }
      ], 'google/gemini-2.5-pro');

      if (response.error) throw new Error(`Gemini error: ${response.error}`);
      if (response.data == null || response.data === '') throw new Error('Gemini returned empty response');

      console.log('[AdMaker] Raw Gemini response:', response.data);
      console.log('[AdMaker] Response type:', typeof response.data);
      console.log('[AdMaker] Response preview:', typeof response.data === 'string' ? response.data.substring(0, 500) : JSON.stringify(response.data).substring(0, 500));

      const parsed = parseGeminiOutputs(response.data);
      if (!parsed) throw new Error('Failed to parse Gemini response');

      const referenceSheetUrl = project.reference_sheet_url;
      console.log('[AdsMaker] referenceSheetUrl:', referenceSheetUrl);
      console.log('[AdsMaker] referenceSheetUrl type:', typeof referenceSheetUrl);
      console.log('[AdsMaker] referenceSheetUrl starts with:', referenceSheetUrl?.substring(0, 50));

      console.log('[AdsMaker] About to call gptImage2Edit with:');
      console.log('[AdsMaker] - Prompt length:', parsed.storyboard_visual_prompt?.length);
      console.log('[AdsMaker] - Prompt:', parsed.storyboard_visual_prompt?.substring(0, 100) + '...');
      console.log('[AdsMaker] - Reference URL:', referenceSheetUrl?.substring(0, 50) + '...');
      console.log('[AdsMaker] - Quality:', storyboardQuality);
      console.log('[AdsMaker] - Image size:', params.aspectRatio === '9:16' ? 'portrait_16_9' : 'landscape_16_9');

      // @ts-expect-error - gptImage2Edit is defined in preload
      const storyboardImageResult = await window.api.fal.gptImage2Edit({
        prompt: parsed.storyboard_visual_prompt,
        image_urls: [referenceSheetUrl!],
        image_size: params.aspectRatio === '9:16' ? 'portrait_16_9' : 'landscape_16_9',
        quality: storyboardQuality,
        num_images: 1,
        output_format: 'webp'
      }) as { images?: Array<{ url: string }>; error?: string };

      console.log('[AdsMaker] gptImage2Edit result:', storyboardImageResult.error ? `Error: ${storyboardImageResult.error}` : `Success: ${storyboardImageResult.images?.[0]?.url?.substring(0, 50)}...`);

      if (storyboardImageResult.error) {
        console.error('[AdsMaker] === GPT Image 2 STORYBOARD ERROR ===');
        console.error('[AdsMaker] Error:', storyboardImageResult.error);
        console.error('[AdsMaker] Payload sent:');
        console.error('  model: openai/gpt-image-2/edit');
        console.error('  prompt length:', parsed.storyboard_visual_prompt?.length);
        console.error('  image_urls:', [referenceSheetUrl]);
        console.error('  quality:', storyboardQuality);
        console.error('  image_size:', params.aspectRatio === '9:16' ? 'portrait_16_9' : 'landscape_16_9');
        throw new Error(`GPT Image 2 failed: ${storyboardImageResult.error}`);
      }

      const storyboardUrl = storyboardImageResult.images?.[0]?.url;
      if (!storyboardUrl) throw new Error('Failed to generate storyboard image - no URL in response');

      updateProject({
        metadata: { ...project.metadata, ...params },
        outputs: {
          ...project.outputs,
          storyboard_visual_prompt: parsed.storyboard_visual_prompt,
          seedance_video_prompt: parsed.seedance_video_prompt,
          seedance_negative_prompt: parsed.seedance_negative_prompt,
          voiceover_script: parsed.voiceover_script,
          music_prompt: parsed.music_prompt,
          storyboard_image_url: storyboardUrl
        },
        phase: 2,
        status: 'storyboard_generated'
      });

      clearLoading();
      return { ...parsed, storyboard_image_url: storyboardUrl };
    } catch (err) {
      clearLoading();
      const msg = err instanceof Error ? err.message : 'Storyboard generation failed';
      setError(msg);
      throw err;
    }
  }, [project, storyboardQuality, startLoadingSequence, clearLoading, updateProject]);

  const generateVideo = useCallback(async (editedPrompt?: string, generateAudio = false) => {
    setError(null);
    startLoadingSequence('video');

    try {
      const basePrompt = editedPrompt || project.outputs.seedance_video_prompt!;
      const hasRefSheet = !!project.reference_sheet_url;
      const prompt = hasRefSheet
        ? basePrompt.replace('@Image1', '@Image1').replace(
            'Animate @Image1',
            'Animate @Image1 (storyboard frames). Use @Image2 as the product reference to ensure accurate product appearance, colors, and packaging details throughout'
          )
        : basePrompt;
      const videoResolution = storyboardQuality === 'low' ? '480p' : '720p';
      const result = await window.api.video.generate({
        modelId: 'bytedance/seedance-2.0/reference-to-video',
        prompt,
        negativePrompt: project.outputs.seedance_negative_prompt || undefined,
        imageUrl: project.outputs.storyboard_image_url!,
        referenceImageUrl: project.reference_sheet_url || undefined,
        aspectRatio: project.metadata.aspect_ratio!,
        resolution: videoResolution,
        duration: project.metadata.duration,
        audio: generateAudio
      });

      if (!result.success || !result.data?.url) {
        throw new Error(result.error || 'Video generation failed');
      }

      updateProject({
        outputs: { ...project.outputs, final_video_url: result.data.url },
        phase: 3,
        status: 'video_generated'
      });

      clearLoading();
      return result.data.url;
    } catch (err) {
      clearLoading();
      const msg = err instanceof Error ? err.message : 'Video generation failed';
      setError(msg);
      throw err;
    }
  }, [project, storyboardQuality, startLoadingSequence, clearLoading, updateProject]);

  const openInAudioLab = useCallback(() => {
    navigate('/audio-lab/script', {
      state: { prefillScript: project.outputs.voiceover_script }
    });
  }, [navigate, project.outputs.voiceover_script]);

  useEffect(() => {
    return () => {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
    };
  }, []);

  return {
    project,
    phase: project.phase,
    isLoading,
    loadingMessage,
    error,
    hasUnfinishedJob,
    unfinishedJobId,
    storyboardQuality,
    setStoryboardQuality,
    setPhase,
    createNewProject,
    loadProject,
    checkUnfinishedJobs,
    generateReferenceSheet,
    detectProductInfo,
    generateStoryboard,
    generateVideo,
    openInAudioLab,
    updateProject
  };
}
