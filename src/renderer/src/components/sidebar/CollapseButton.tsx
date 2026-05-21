import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CollapseButtonProps {
  collapsed: boolean
  onToggle: () => void
}

export const CollapseButton = ({
  collapsed,
  onToggle
}: CollapseButtonProps): React.ReactElement => {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--ma-border)',
        border: '1px solid rgba(255,255,255,0.05)',
        color: 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'absolute',
        right: -12,
        top: 48,
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}
    >
      {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  )
}
