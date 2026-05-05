/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/useAdCopy.ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { AdCopyRightPanel } from './ad-copy/components/AdCopyRightPanel';
import { useAdCopy } from './ad-copy/hooks/useAdCopy';
import { AdCopyLeftPanel } from './ad-copy/components/AdCopyLeftPanel';
import { AdCopyResultsPanel } from './ad-copy/components/AdCopyResultsPanel';

const ANALYSIS_MODELS = [
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Fast & smart — ideal for most products.' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Deepest analysis — for complex products.' },
  { id: 'anthropic/claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Top-tier linguistic creativity.' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', description: 'Highly accurate image reading.' },
];

export function AdCopyScreen() {
  const { setRightPanelContent } = useApp();
  const adCopy = useAdCopy();

  const selectedModelLabel = ANALYSIS_MODELS.find(m => m.id === adCopy.analysisModel)?.label ?? adCopy.analysisModel;

  // Render the Right Panel API Costs
  useEffect(() => {
    setRightPanelContent(<AdCopyRightPanel currentModelLabel={selectedModelLabel} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, selectedModelLabel]);

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <AdCopyLeftPanel {...adCopy} analysisModels={ANALYSIS_MODELS} />
      <AdCopyResultsPanel {...adCopy} selectedModelLabel={selectedModelLabel} />
    </div>
  );
}
