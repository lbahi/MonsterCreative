import { useEffect } from 'react';
import { Settings, Key, Bell, Info } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { ApiKeysSection } from './sections/ApiKeysSection';
import { DefaultsSection } from './sections/DefaultsSection';
import { StorageSection } from './sections/StorageSection';
import { AboutSection } from './sections/AboutSection';
import { SettingsRightPanel } from './components/SettingsRightPanel';

const SECTIONS = [
  { id: 'api-keys', label: 'API Keys', icon: <Key size={16} /> },
  { id: 'general', label: 'General', icon: <Settings size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'about', label: 'About', icon: <Info size={16} /> },
];

export function SettingsScreen() {
  const {
    section, setSection,
    keys,
    showValues, setShowValues,
    editingKey, setEditingKey,
    editValue, setEditValue,
    saving,
    saved,
    keyError, setKeyError,
    handleSaveKey,
    handleDeleteKey,
    setRightPanelContent
  } = useSettings();

  useEffect(() => {
    setRightPanelContent(<SettingsRightPanel section={section} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, section]);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--ma-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
        }}>
          <Settings size={16} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
          Settings
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Left sub-nav */}
        <div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setSection(sec.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  background: section === sec.id ? 'rgba(108,99,255,0.12)' : 'transparent',
                  border: `1px solid ${section === sec.id ? 'rgba(108,99,255,0.25)' : 'transparent'}`,
                  borderRadius: 8, cursor: 'pointer',
                  color: section === sec.id ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.45)',
                  fontSize: 13, fontWeight: section === sec.id ? 500 : 400,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ opacity: 0.7 }}>{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div>
          {section === 'api-keys' && (
            <ApiKeysSection
              keys={keys}
              showValues={showValues}
              setShowValues={setShowValues}
              editingKey={editingKey}
              setEditingKey={setEditingKey}
              editValue={editValue}
              setEditValue={(v: string) => { setEditValue(v); setKeyError(null); }}
              saving={saving}
              saved={saved}
              keyError={keyError}
              onSave={handleSaveKey}
              onDelete={handleDeleteKey}
            />
          )}
          {section === 'general' && <DefaultsSection />}
          {section === 'notifications' && <StorageSection />}
          {section === 'about' && <AboutSection />}
        </div>
      </div>
    </div>
  );
}
