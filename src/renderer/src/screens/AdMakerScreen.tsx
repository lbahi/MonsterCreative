import React, { useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { AdMakerTab } from './video-gen/tabs/AdMakerTab'

export function AdMakerScreen(): React.ReactElement {
  const { setRightPanelContent } = useApp()

  useEffect(() => {
    setRightPanelContent(null)
    return () => setRightPanelContent(null)
  }, [setRightPanelContent])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        background: 'var(--ma-bg)',
        overflowY: 'auto'
      }}
    >
      <AdMakerTab />
    </div>
  )
}
