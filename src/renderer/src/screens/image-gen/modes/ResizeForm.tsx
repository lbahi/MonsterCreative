import { useState } from 'react';

export function ResizeForm() {
  const formats = ['Meta Feed', 'Meta Story', 'TikTok', 'Google Display', 'Pinterest', 'LinkedIn'];
  const [selected, setSelected] = useState<string[]>(['Meta Feed', 'Meta Story']);

  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Upload Source Creative
      </label>
      <div
        style={{
          border: '2px dashed rgba(255,255,255,0.12)',
          borderRadius: 10,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Drop image or click to upload</p>
      </div>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Export Formats
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {formats.map((format) => (
          <button
            key={format}
            onClick={() =>
              setSelected((current) => (current.includes(format) ? current.filter((item) => item !== format) : [...current, format]))
            }
            style={{
              padding: '6px 12px',
              background: selected.includes(format) ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected.includes(format) ? 'var(--ma-border-accent)' : 'var(--ma-border)'}`,
              borderRadius: 20,
              color: selected.includes(format) ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.4)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {format}
          </button>
        ))}
      </div>
    </div>
  );
}
