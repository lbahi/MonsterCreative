import type { ModeOption } from '../types';

type ModeSelectorProps = {
  modes: ModeOption[];
  activeMode: string;
  onSelect: (mode: ModeOption) => void;
};

export function ModeSelector({ modes, activeMode, onSelect }: ModeSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;
        const locked = mode.comingSoon === true;

        return (
          <div key={mode.id} style={{ position: 'relative' }}>
            <button
              onClick={() => !locked && onSelect(mode)}
              title={locked ? 'Coming soon' : mode.label}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: isActive ? `${mode.color}12` : locked ? 'rgba(255,255,255,0.02)' : 'var(--ma-elevated)',
                border: `1px solid ${isActive ? mode.color + '55' : locked ? 'rgba(255,255,255,0.06)' : 'var(--ma-border)'}`,
                borderRadius: 10,
                cursor: locked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 20px ${mode.color}15` : 'none',
                opacity: locked ? 0.45 : 1,
                filter: locked ? 'grayscale(0.6)' : 'none',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isActive ? `${mode.color}20` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? mode.color + '40' : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? mode.color : 'rgba(255,255,255,0.35)',
                  marginBottom: 10,
                }}
              >
                <Icon size={16} />
              </div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  margin: '0 0 3px',
                  color: isActive ? '#FFF' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {mode.label}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.4 }}>
                {mode.description}
              </p>
            </button>

            {/* Coming Soon badge — positioned over the card */}
            {locked && (
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                fontFamily: 'var(--font-body)',
              }}>
                Coming Soon
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
