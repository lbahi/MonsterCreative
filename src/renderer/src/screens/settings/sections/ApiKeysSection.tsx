import React from 'react'
import { Shield, Eye, EyeOff, Trash2, Plus, RefreshCw, Check, AlertCircle } from 'lucide-react'

interface ApiKey {
  id: string
  provider: string
  label: string
  value: string
  status: 'connected' | 'error' | 'unconfigured'
  lastUsed?: string
  color: string
  required: boolean
}

interface ApiKeysSectionProps {
  keys: ApiKey[]
  showValues: Record<string, boolean>
  setShowValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  editingKey: string | null
  setEditingKey: (id: string | null) => void
  editValue: string
  setEditValue: (val: string) => void
  saving: string | null
  saved: string | null
  keyError: string | null
  onSave: (id: string) => void
  onDelete: (id: string) => void
}

export const ApiKeysSection = ({
  keys,
  showValues,
  setShowValues,
  editingKey,
  setEditingKey,
  editValue,
  setEditValue,
  saving,
  saved,
  keyError,
  onSave,
  onDelete
}: ApiKeysSectionProps) => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: '#FFF',
            margin: '0 0 6px'
          }}
        >
          API Keys
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Manage your API provider connections. Keys are stored locally and never leave your device.
        </p>
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(108,99,255,0.07)',
          border: '1px solid rgba(108,99,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 24
        }}
      >
        <Shield size={15} style={{ color: 'var(--ma-accent-light)', flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
          API keys are encrypted and stored in your local keychain. MonsterCreative does not have
          access to your keys.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {keys.map((key) => (
          <ApiKeyCard
            key={key.id}
            apiKey={key}
            showValue={showValues[key.id]}
            onToggleShow={() => setShowValues((prev) => ({ ...prev, [key.id]: !prev[key.id] }))}
            isEditing={editingKey === key.id}
            editValue={editValue}
            setEditValue={setEditValue}
            onEdit={() => {
              setEditingKey(key.id)
              setEditValue('')
            }}
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
  )
}

function ApiKeyCard({
  apiKey,
  showValue,
  onToggleShow,
  isEditing,
  editValue,
  setEditValue,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  saving,
  saved,
  keyError
}: {
  apiKey: ApiKey
  showValue: boolean
  onToggleShow: () => void
  isEditing: boolean
  editValue: string
  setEditValue: (val: string) => void
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onDelete: () => void
  saving: boolean
  saved: boolean
  keyError: string | null
}) {
  const statusConfig = {
    connected: {
      color: 'var(--ma-green)',
      label: 'Connected',
      bg: 'rgba(34,197,94,0.12)',
      border: 'rgba(34,197,94,0.25)'
    },
    error: {
      color: 'var(--ma-red)',
      label: 'Error',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.25)'
    },
    unconfigured: {
      color: 'rgba(255,255,255,0.3)',
      label: 'Not configured',
      bg: 'rgba(255,255,255,0.05)',
      border: 'var(--ma-border)'
    }
  }
  const sc = statusConfig[apiKey.status as keyof typeof statusConfig]

  return (
    <div
      style={{
        background: 'var(--ma-elevated)',
        border: `1px solid ${apiKey.status === 'connected' ? 'rgba(34,197,94,0.15)' : 'var(--ma-border)'}`,
        borderRadius: 12,
        padding: 20,
        transition: 'border-color 0.2s'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: `${apiKey.color}15`,
              border: `1px solid ${apiKey.color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: apiKey.color }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
                {apiKey.provider}
              </p>
              {apiKey.required && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--ma-amber)',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    padding: '2px 6px',
                    borderRadius: 10,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  Required
                </span>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
              {apiKey.label}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 20,
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              color: sc.color
            }}
          >
            {saved ? '✓ Saved' : sc.label}
          </span>
        </div>
      </div>

      {!isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              flex: 1,
              padding: '9px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--ma-border)',
              borderRadius: 7,
              overflow: 'hidden'
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                color:
                  apiKey.status === 'connected'
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(255,255,255,0.2)',
                letterSpacing: '0.5px'
              }}
            >
              {apiKey.status === 'connected'
                ? showValue
                  ? apiKey.value
                  : `${apiKey.value.substring(0, 8)}${'•'.repeat(24)}`
                : 'Not configured — click Add Key to set up'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {apiKey.status === 'connected' && (
              <>
                <button
                  onClick={onToggleShow}
                  style={{
                    width: 32,
                    height: 32,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)'
                  }}
                >
                  {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={onEdit}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: 7,
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 12,
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Update
                </button>
                <button
                  onClick={onDelete}
                  style={{
                    width: 32,
                    height: 32,
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#EF4444'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
            {apiKey.status === 'unconfigured' && (
              <button
                onClick={onEdit}
                style={{
                  padding: '7px 16px',
                  background: 'var(--ma-accent)',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 0 16px rgba(108,99,255,0.3)'
                }}
              >
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
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Paste your ${apiKey.provider} API key here...`}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${keyError ? 'rgba(239,68,68,0.5)' : 'var(--ma-accent)'}`,
                borderRadius: 8,
                color: '#FFF',
                fontSize: 12,
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                boxSizing: 'border-box',
                boxShadow: keyError
                  ? '0 0 12px rgba(239,68,68,0.15)'
                  : '0 0 12px rgba(108,99,255,0.15)'
              }}
            />
          </div>
          {keyError && (
            <div
              style={{
                marginBottom: 10,
                padding: '8px 12px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <AlertCircle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>{keyError}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onSave}
              disabled={saving || !editValue}
              style={{
                padding: '8px 20px',
                background: saving ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
                border: 'none',
                borderRadius: 7,
                color: 'white',
                cursor: saving ? 'wait' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-body)'
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
                </>
              ) : (
                <>
                  <Check size={13} /> Save Key
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--ma-border)',
                borderRadius: 7,
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'var(--font-body)'
              }}
            >
              Cancel
            </button>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  )
}
