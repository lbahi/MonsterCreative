import React from 'react';
import { Check } from 'lucide-react';

interface PhaseNavProps {
  current: 1 | 2 | 3;
  onChange: (phase: 1 | 2 | 3) => void;
}

const PHASES = [
  { num: 1, label: '1 · Product' },
  { num: 2, label: '2 · Storyboard' },
  { num: 3, label: '3 · Video' }
];

export function PhaseNav({ current, onChange }: PhaseNavProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        marginBottom: '32px'
      }}
    >
      {PHASES.map((phase, index) => {
        const isActive = current === phase.num;
        const isCompleted = current > phase.num;
        const isLocked = current < phase.num;

        return (
          <React.Fragment key={phase.num}>
            {/* Circle */}
            <button
              onClick={() => !isLocked && onChange(phase.num as 1 | 2 | 3)}
              disabled={isLocked}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: isCompleted
                  ? 'var(--ma-green)'
                  : isActive
                    ? 'var(--ma-accent)'
                    : 'var(--ma-border)',
                background: isCompleted
                  ? 'var(--ma-green)'
                  : isActive
                    ? 'var(--ma-accent)'
                    : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 20px rgba(108, 99, 255, 0.3)' : 'none'
              }}
            >
              {isCompleted ? (
                <Check size={20} color="#FFF" />
              ) : (
                <span
                  style={{
                    color: isActive ? '#FFF' : isLocked ? 'rgba(255,255,255,0.3)' : 'var(--ma-text)',
                    fontWeight: 700,
                    fontSize: '14px',
                    fontFamily: 'Outfit'
                  }}
                >
                  {phase.num}
                </span>
              )}
            </button>

            {/* Label */}
            <span
              style={{
                marginLeft: '10px',
                marginRight: index < PHASES.length - 1 ? '10px' : '0',
                color: isActive
                  ? 'var(--ma-accent)'
                  : isCompleted
                    ? 'var(--ma-green)'
                    : isLocked
                      ? 'rgba(255,255,255,0.3)'
                      : 'var(--ma-text)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                fontFamily: 'Outfit',
                letterSpacing: '-0.3px'
              }}
            >
              {phase.label}
            </span>

            {/* Connecting line */}
            {index < PHASES.length - 1 && (
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  background: isCompleted
                    ? 'var(--ma-accent)'
                    : 'var(--ma-border)',
                  borderStyle: isCompleted ? 'solid' : 'dashed',
                  borderWidth: '1px 0',
                  borderColor: isCompleted ? 'var(--ma-accent)' : 'var(--ma-border)',
                  margin: '0 12px'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
