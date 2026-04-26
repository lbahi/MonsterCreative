import { Wand2 } from 'lucide-react';
import { ManualVideoForm } from '../modes/ManualVideoForm';
import { useVideoGen } from '../hooks/useVideoGen';

interface ManualTabProps extends ReturnType<typeof useVideoGen> {}

export function ManualTab(props: ManualTabProps) {
  const {
    prompt, setPrompt,
    generating,
    handleManualGenerate,
    sourceImage,
    estimatedCost
  } = props;

  return (
    <>
      <ManualVideoForm 
        prompt={prompt} setPrompt={setPrompt}
        disabled={generating}
      />
      
      <button
        onClick={handleManualGenerate}
        disabled={generating || !sourceImage}
        style={{
          width: '100%', padding: '16px', borderRadius: 12, border: 'none',
          background: (generating || !sourceImage) ? 'var(--ma-bg)' : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
          color: (generating || !sourceImage) ? 'rgba(255,255,255,0.3)' : '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 15, fontWeight: 700, cursor: (generating || !sourceImage) ? 'not-allowed' : 'pointer',
          boxShadow: (generating || !sourceImage) ? 'none' : '0 4px 20px rgba(108, 99, 255, 0.4)',
          transition: 'all 0.2s', marginTop: 'auto'
        }}
      >
        <Wand2 size={18} />
        {generating ? 'Generating...' : `Generate Video • $${estimatedCost}`}
      </button>
    </>
  );
}
