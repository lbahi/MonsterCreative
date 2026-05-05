import { Loader2, Sparkles, CheckCircle2, FolderOpen, Download } from 'lucide-react';
import type { Template } from '../types';

type Props = {
  canGenerate: boolean;
  generating: boolean;
  progressMsg: string;
  selectedTemplate: Template | null;
  selectedRatio: string;
  savedPath: string | null;
  saveError: string | null;
  onGenerate: () => void;
  onOpenFolder: () => void;
};

export const PromptPreviewFooter = ({
  canGenerate,
  generating,
  progressMsg,
  selectedTemplate,
  selectedRatio,
  savedPath,
  saveError,
  onGenerate,
  onOpenFolder
}: Props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: canGenerate ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--ma-elevated)',
          color: canGenerate ? '#FFF' : 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 14, fontWeight: 700,
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          boxShadow: canGenerate ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        {generating ? (
          <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{progressMsg || 'Generating...'}</>
        ) : (
          <><Sparkles size={16} />Generate Social Ad {selectedTemplate ? `· ${selectedTemplate.label}` : ''} {selectedRatio}</>
        )}
      </button>

      {savedPath && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 8, padding: '8px 12px'
        }}>
          <CheckCircle2 size={14} color="#22C55E" />
          <span style={{ fontSize: 11, color: '#22C55E', flex: 1 }}>
            Saved to OutputSocialAds folder
          </span>
          <button
            onClick={onOpenFolder}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', color: '#22C55E',
              fontSize: 10, fontWeight: 700, cursor: 'pointer'
            }}
          >
            <FolderOpen size={11} /> Open
          </button>
          <button
            onClick={() => window.open(savedPath, '_blank')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', color: '#22C55E',
              fontSize: 10, fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Download size={11} /> View
          </button>
        </div>
      )}

      {saveError && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#EF4444'
        }}>
          ⚠️ Generated but save failed: {saveError}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};
