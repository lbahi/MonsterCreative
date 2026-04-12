import { useApp } from '../contexts/AppContext';
import { X } from 'lucide-react';

export function RightPanel() {
  const { rightPanelContent } = useApp();

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        background: 'var(--ma-surface)',
        borderLeft: '1px solid var(--ma-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {rightPanelContent ?? <DefaultPanelContent />}
      </div>
    </div>
  );
}

function DefaultPanelContent() {
  return (
    <div style={{ padding: 20, color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 60 }}>
      <p style={{ fontSize: 13 }}>Select a tool to get started</p>
    </div>
  );
}
