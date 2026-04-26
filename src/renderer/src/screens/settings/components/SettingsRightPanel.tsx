interface SettingsRightPanelProps {
  section: string;
}

export function SettingsRightPanel({ section }: SettingsRightPanelProps) {
  const docs: Record<string, { title: string; items: string[] }> = {
    'api-keys': {
      title: 'API Key Help',
      items: ['Keys are stored in OS keychain', 'Never transmitted to MonsterCreative', 'fal.ai key for image/video gen'],
    },
    'general': {
      title: 'General Settings',
      items: ['Changes apply immediately', 'Model defaults affect all tools', 'Auto-save stores to ~/MonsterCreative'],
    },
    'notifications': {
      title: 'Notifications',
      items: ['System notifications via OS', 'Cost alerts help control spend'],
    },
    'about': {
      title: 'Version Info',
      items: ['Auto-updates on app restart', 'Support: support@monstercreative.ai'],
    },
  };

  const info = docs[section] || docs['api-keys'];

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
          {info.title}
        </h3>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {info.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ma-accent)', marginTop: 7, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.15)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ma-accent-light)', margin: '0 0 6px' }}>Need help?</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
            Reach out to support natively from the application above.
          </p>
        </div>
      </div>
    </div>
  );
}
