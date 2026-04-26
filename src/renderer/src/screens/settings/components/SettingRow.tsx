interface SettingRowProps {
  label: string;
  description: string;
  control: React.ReactNode;
}

export function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'var(--ma-elevated)',
      border: '1px solid var(--ma-border)',
      borderRadius: 10, gap: 20,
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#FFF', margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{description}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}
