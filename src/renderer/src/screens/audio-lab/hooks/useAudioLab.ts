import { useState } from 'react';
import { VOICE_REGISTRY, VoiceEntry } from '../../../data/voices';

export const useAudioLab = () => {
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceEntry>(VOICE_REGISTRY[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [regionFilter, setRegionFilter] = useState('');

  // Generation Settings
  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(75);
  const [speed, setSpeed] = useState(1.0);

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setIsGenerating(true);
    try {
      let response: any;

      // Standard ElevenLabs voice
      response = await (window as any).api.audio.generateSpeech({
        text: script,
        voiceId: selectedVoice.elevenLabsId,
        stability: stability / 100,
      });

      if (response.success) {
        setResults(prev => [{
          id: Date.now().toString(),
          url: response.data.url,
          text: script,
          voice: selectedVoice.name,
          createdAt: new Date().toISOString(),
          type: 'TTS'
        }, ...prev]);
      } else { alert('Generation failed: ' + response.error); }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsGenerating(false); }
  };

  const handlePreview = async (voice: VoiceEntry) => {
    try {
      // 100% Free Local Preview (Method 1)
      const audioUrl = `/OutputVoices/${voice.name}.mp4`;
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      await audio.play();
    } catch (err) {
      console.error("Failed to play local preview:", err);
      alert(`Could not play the local preview for ${voice.name}. Ensure ${voice.name}.mp4 exists in the public/OutputVoices folder.`);
    }
  };

  return {
    script, setScript,
    selectedVoice, setSelectedVoice,
    isGenerating,
    results,
    regionFilter, setRegionFilter,
    stability, setStability,
    similarity, setSimilarity,
    speed, setSpeed,
    handleGenerate,
    handlePreview
  };
};
