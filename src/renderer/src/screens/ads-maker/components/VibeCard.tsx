import React from 'react';

interface VibeCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

export function VibeCard({
  icon,
  title,
  description,
  isActive,
  onClick
}: VibeCardProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 16px',
        background: 'var(--ma-elevated)',
        border: `2px solid ${isActive ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? '0 0 30px rgba(108, 99, 255, 0.2)' : 'none',
        minWidth: '100px'
      }}
    >
      <div
        style={{
          fontSize: '28px',
          marginBottom: '12px',
          opacity: isActive ? 1 : 0.7
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: isActive ? 'var(--ma-text)' : 'rgba(255,255,255,0.7)',
          marginBottom: '6px',
          fontFamily: 'Outfit'
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          lineHeight: 1.4
        }}
      >
        {description}
      </span>
    </button>
  );
}
