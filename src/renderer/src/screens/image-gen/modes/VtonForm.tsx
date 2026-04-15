import { useState } from 'react';

export function VtonForm() {
  const [dragging, setDragging] = useState(false);
  const [vibe, setVibe] = useState('Studio');
  const vibes = ['Studio', 'Urban', 'Nature', 'Luxury', 'Vintage', 'Candid'];

  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Upload Garment
      </label>
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? 'var(--ma-accent)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 10,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 20,
          background: dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Drop garment image or click to upload</p>
      </div>

      <label style={{ fontSize: 10, fontWeight: 600, color: '#C1C6D6', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>
        Select Vibe
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {vibes.map((item) => (
          <button
            key={item}
            onClick={() => setVibe(item)}
            style={{
              padding: '6px 0',
              background: vibe === item ? 'var(--ma-accent)' : 'rgba(255,255,255,0.05)',
              color: vibe === item ? '#FFF' : '#B0B3B8',
              borderRadius: 8,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
