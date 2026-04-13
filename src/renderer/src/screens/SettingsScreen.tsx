import { useEffect, useState } from 'react';
import {
  Settings, Key, Palette, Bell, Info, Plus, Trash2, Eye, EyeOff,
  Check, AlertCircle, RefreshCw, Shield, ChevronRight, ExternalLink, Globe,
  Layers, Loader2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const SECTIONS = [
  { id: 'api-keys', label: 'API Keys', icon: <Key size={16} /> },
  { id: 'general', label: 'General', icon: <Settings size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'about', label: 'About', icon: <Info size={16} /> },
];

interface ApiKey {
  id: string;
  provider: string;
  label: string;
  value: string;
  status: 'connected' | 'error' | 'unconfigured';
  lastUsed?: string;
  color: string;
  required: boolean;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: 'fal', provider: 'fal.ai', label: 'fal.ai API Key', value: '', status: 'unconfigured', color: '#6C63FF', required: true },
];

export function SettingsScreen() {
  const { setRightPanelContent, refreshConnectionStatus } = useApp();
  const [section, setSection] = useState('api-keys');
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Load real key from secure keystore on mount
  useEffect(() => {
    async function loadKeys() {
      const falKey = await window.api.keystore.getFalKey();
      setKeys(prev => prev.map(k =>
        k.id === 'fal'
          ? { ...k, value: falKey || '', status: falKey ? 'connected' : 'unconfigured' }
          : k
      ));
    }
    loadKeys();
  }, []);

  useEffect(() => {
    setRightPanelContent(<SettingsRightPanel section={section} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, section]);

  const handleSaveKey = async (keyId: string) => {
    if (!editValue.trim()) return;
    setSaving(keyId);
    setKeyError(null);
    try {
      // Smoke test first
      const result = await window.api.fal.validateKey(editValue.trim());
      if (!result.valid) {
        setKeyError(result.error || 'Invalid API key.');
        setSaving(null);
        return;
      }
      // Save to secure keystore
      await window.api.keystore.setFalKey(editValue.trim());
      setKeys(prev => prev.map(k => k.id === keyId
        ? { ...k, value: editValue.trim(), status: 'connected', lastUsed: 'Just now' }
        : k
      ));
      setSaved(keyId);
      setEditingKey(null);
      setKeyError(null);
      await refreshConnectionStatus();
      setTimeout(() => setSaved(null), 2000);
    } catch {
      setKeyError('Network error. Please check your connection.');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (keyId === 'fal') await window.api.keystore.deleteFalKey();
    setKeys(prev => prev.map(k => k.id === keyId
      ? { ...k, value: '', status: 'unconfigured', lastUsed: undefined }
      : k
    ));
    await refreshConnectionStatus();
  };

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
                onMouseEnter={e => { if (section !== sec.id) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { if (section !== sec.id) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
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
          {section === 'general' && <GeneralSection />}
          {section === 'notifications' && <NotificationsSection />}
          {section === 'about' && <AboutSection />}
        </div>
      </div>
    </div>
  );
}

function ApiKeysSection({ keys, showValues, setShowValues, editingKey, setEditingKey, editValue, setEditValue, saving, saved, keyError, onSave, onDelete }: any) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#FFF', margin: '0 0 6px' }}>
          API Keys
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Manage your API provider connections. Keys are stored locally and never leave your device.
        </p>
      </div>

      {/* Security notice */}
      <div style={{
        padding: '12px 16px', borderRadius: 10,
        background: 'rgba(108,99,255,0.07)',
        border: '1px solid rgba(108,99,255,0.18)',
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 24,
      }}>
        <Shield size={15} style={{ color: 'var(--ma-accent-light)', flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
          API keys are encrypted and stored in your local keychain. MonsterCreative does not have access to your keys.
        </p>
      </div>

      {/* Key cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {keys.map((key: ApiKey) => (
          <ApiKeyCard
            key={key.id}
            apiKey={key}
            showValue={showValues[key.id]}
            onToggleShow={() => setShowValues((prev: any) => ({ ...prev, [key.id]: !prev[key.id] }))}
            isEditing={editingKey === key.id}
            editValue={editValue}
            setEditValue={setEditValue}
            onEdit={() => { setEditingKey(key.id); setEditValue(''); }}
            onCancel={() => setEditingKey(null)}
            onSave={() => onSave(key.id)}
            onDelete={() => onDelete(key.id)}
            saving={saving === key.id}
            saved={saved === key.id}
            keyError={editingKey === key.id ? keyError : null}
          />
        ))}
      </div>


    </div>
  );
}

function ApiKeyCard({ apiKey, showValue, onToggleShow, isEditing, editValue, setEditValue, onEdit, onCancel, onSave, onDelete, saving, saved, keyError }: any) {
  const statusConfig = {
    connected: { color: 'var(--ma-green)', label: 'Connected', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
    error: { color: 'var(--ma-red)', label: 'Error', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
    unconfigured: { color: 'rgba(255,255,255,0.3)', label: 'Not configured', bg: 'rgba(255,255,255,0.05)', border: 'var(--ma-border)' },
  };
  const sc = statusConfig[apiKey.status as keyof typeof statusConfig];

  return (
    <div style={{
      background: 'var(--ma-elevated)',
      border: `1px solid ${apiKey.status === 'connected' ? 'rgba(34,197,94,0.15)' : 'var(--ma-border)'}`,
      borderRadius: 12,
      padding: 20,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `${apiKey.color}15`,
            border: `1px solid ${apiKey.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: apiKey.color }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>{apiKey.provider}</p>
              {apiKey.required && (
                <span style={{
                  fontSize: 9, fontWeight: 600, color: 'var(--ma-amber)',
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  padding: '2px 6px', borderRadius: 10, letterSpacing: '0.4px', textTransform: 'uppercase',
                }}>
                  Required
                </span>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{apiKey.label}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 20,
            background: sc.bg, border: `1px solid ${sc.border}`,
            color: sc.color,
          }}>
            {saved ? '✓ Saved' : sc.label}
          </span>
        </div>
      </div>

      {/* Key display */}
      {!isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, padding: '9px 12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--ma-border)',
            borderRadius: 7, overflow: 'hidden',
          }}>
            <span style={{
              fontSize: 12, fontFamily: 'var(--font-mono)',
              color: apiKey.status === 'connected' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
              letterSpacing: '0.5px',
            }}>
              {apiKey.status === 'connected'
                ? (showValue
                    ? apiKey.value
                    : `${apiKey.value.substring(0, 8)}${'•'.repeat(24)}`)
                : 'Not configured — click Add Key to set up'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {apiKey.status === 'connected' && (
              <>
                <button onClick={onToggleShow} style={{
                  width: 32, height: 32, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--ma-border)', borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                }}>
                  {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={onEdit} style={{
                  padding: '6px 12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--ma-border)', borderRadius: 7,
                  cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12,
                  fontFamily: 'var(--font-body)',
                }}>
                  Update
                </button>
                <button onClick={onDelete} style={{
                  width: 32, height: 32, background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#EF4444',
                }}>
                  <Trash2 size={13} />
                </button>
              </>
            )}
            {apiKey.status === 'unconfigured' && (
              <button onClick={onEdit} style={{
                padding: '7px 16px', background: 'var(--ma-accent)',
                border: 'none', borderRadius: 7,
                cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'var(--font-body)',
                boxShadow: '0 0 16px rgba(108,99,255,0.3)',
              }}>
                <Plus size={13} /> Add Key
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder={`Paste your ${apiKey.provider} API key here...`}
              autoFocus
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${keyError ? 'rgba(239,68,68,0.5)' : 'var(--ma-accent)'}`,
                borderRadius: 8, color: '#FFF',
                fontSize: 12, outline: 'none',
                fontFamily: 'var(--font-mono)',
                boxSizing: 'border-box',
                boxShadow: keyError ? '0 0 12px rgba(239,68,68,0.15)' : '0 0 12px rgba(108,99,255,0.15)',
              }}
            />
          </div>
          {keyError && (
            <div style={{
              marginBottom: 10, padding: '8px 12px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <AlertCircle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>{keyError}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onSave} disabled={saving || !editValue} style={{
              padding: '8px 20px', background: saving ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
              border: 'none', borderRadius: 7, color: 'white', cursor: saving ? 'wait' : 'pointer',
              fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)',
            }}>
              {saving ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={13} /> Save Key</>}
            </button>
            <button onClick={onCancel} style={{
              padding: '8px 16px', background: 'transparent',
              border: '1px solid var(--ma-border)', borderRadius: 7,
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12,
              fontFamily: 'var(--font-body)',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {apiKey.lastUsed && (
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '10px 0 0', fontFamily: 'var(--font-mono)' }}>
          Last used: {apiKey.lastUsed}
        </p>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function GeneralSection() {
  const [defaultModel, setDefaultModel] = useState('FLUX.1 Pro');
  const [autoSave, setAutoSave] = useState(true);
  const [currency, setCurrency] = useState('USD');

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#FFF', margin: '0 0 6px' }}>General</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>Application preferences and defaults.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SettingRow
          label="Default Image Model"
          description="Used when no model is explicitly selected"
          control={
            <select value={defaultModel} onChange={e => setDefaultModel(e.target.value)} style={{
              padding: '7px 12px', background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
              borderRadius: 7, color: '#FFF', fontSize: 12, outline: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              {['FLUX.1 Pro', 'FLUX.1 Dev', 'FLUX Schnell'].map(m => <option key={m} style={{ background: '#111124' }}>{m}</option>)}
            </select>
          }
        />
        <SettingRow
          label="Auto-save generations"
          description="Automatically save all outputs to local library"
          control={<Toggle value={autoSave} onChange={setAutoSave} />}
        />
        <SettingRow
          label="Currency display"
          description="Currency for cost estimates and API billing"
          control={
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={{
              padding: '7px 12px', background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
              borderRadius: 7, color: '#FFF', fontSize: 12, outline: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              {['USD', 'EUR', 'GBP'].map(c => <option key={c} style={{ background: '#111124' }}>{c}</option>)}
            </select>
          }
        />
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [genComplete, setGenComplete] = useState(true);
  const [costAlerts, setCostAlerts] = useState(true);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#FFF', margin: '0 0 6px' }}>Notifications</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>Control alerts and system notifications.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SettingRow label="Generation complete" description="Notify when long generations finish" control={<Toggle value={genComplete} onChange={setGenComplete} />} />
        <SettingRow label="Cost threshold alerts" description="Alert when API spend exceeds $50" control={<Toggle value={costAlerts} onChange={setCostAlerts} />} />
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#FFF', margin: '0 0 6px' }}>About</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>MonsterCreative application information.</p>

      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--ma-accent-glow)',
          }}>
            <span style={{ fontSize: 22 }}>⚡</span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0, fontFamily: 'var(--font-display)' }}>MonsterCreative</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>AI-Powered Ad Creative Suite</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Version', value: '1.0.0 (build 20260409)' },
            { label: 'License', value: 'Pro — Active' },
            { label: 'Plan', value: 'Media Buyer Pro' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#FFF', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Documentation', icon: <ExternalLink size={14} /> },
          { label: 'View Changelog', icon: <ExternalLink size={14} /> },
          { label: 'Report a Bug', icon: <AlertCircle size={14} /> },
          { label: 'Privacy Policy', icon: <Globe size={14} /> },
        ].map(item => (
          <button key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--ma-border)', borderRadius: 9,
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13,
            fontFamily: 'var(--font-body)',
          }}>
            {item.label}
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingRow({ label, description, control }: { label: string; description: string; control: React.ReactNode }) {
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? 'var(--ma-accent)' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
        boxShadow: value ? '0 0 12px rgba(108,99,255,0.4)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function SettingsRightPanel({ section }: { section: string }) {
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
