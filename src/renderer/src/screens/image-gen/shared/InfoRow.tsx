type InfoRowProps = {
  label: string;
  value: any;
  mono?: boolean;
  green?: boolean;
};

export function InfoRow({ label, value, mono, green }: InfoRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          color: green ? 'var(--ma-green)' : '#FFF',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
