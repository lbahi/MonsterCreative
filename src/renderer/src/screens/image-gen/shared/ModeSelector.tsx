import type { ModeOption } from '../types';

type ModeSelectorProps = {
  modes: ModeOption[];
  activeMode: string;
  onSelect: (mode: ModeOption) => void;
};

export function ModeSelector({ modes, activeMode, onSelect }: ModeSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
      {modes.map((mode) => {
        const Icon = mode.icon;

        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode)}
            style={{
              padding: '16px',
              background: activeMode === mode.id ? `${mode.color}12` : 'var(--ma-elevated)',
              border: `1px solid ${activeMode === mode.id ? mode.color + '55' : 'var(--ma-border)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              boxShadow: activeMode === mode.id ? `0 0 24px ${mode.color}20` : 'none',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: activeMode === mode.id ? `${mode.color}20` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeMode === mode.id ? mode.color + '40' : 'rgba(255,255,255,0.07)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeMode === mode.id ? mode.color : 'rgba(255,255,255,0.35)',
                marginBottom: 12,
              }}
            >
              <Icon size={22} />
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                margin: '0 0 4px',
                color: activeMode === mode.id ? '#FFF' : 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {mode.label}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.5 }}>{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
}
