import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export type ConnectionStatus = 'idle' | 'verifying' | 'connected' | 'invalid' | 'error' | 'required'

interface AppContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  rightPanelContent: ReactNode
  setRightPanelContent: (content: ReactNode) => void
  onboardingComplete: boolean
  completeOnboarding: () => void
  licenseChecking: boolean
  isLicenseValid: boolean
  activeImageMode: string
  setActiveImageMode: (mode: string) => void
  activeVideoMode: string
  setActiveVideoMode: (mode: string) => void
  mcpEnabled: boolean
  setMcpEnabled: (v: boolean) => void
  connectionStatus: ConnectionStatus
  falCredits: number | null
  refreshConnectionStatus: () => Promise<ConnectionStatus>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false)
  const [rightPanelContent, setRightPanelContent] = useState<ReactNode>(null)
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('mosterads_onboarded') === 'true'
  })
  const [activeImageMode, setActiveImageMode] = useState('generate')
  const [activeVideoMode, setActiveVideoMode] = useState('text-to-video')
  const [mcpEnabled, setMcpEnabled] = useState(false)
  const [licenseChecking, setLicenseChecking] = useState(true)
  const [isLicenseValid, setIsLicenseValid] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [falCredits, setFalCredits] = useState<number | null>(null)

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => !prev)
  }, [])

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('mosterads_onboarded', 'true')
    setOnboardingComplete(true)
  }, [])

  const refreshConnectionStatus = useCallback(async (): Promise<ConnectionStatus> => {
    setConnectionStatus('verifying')
    try {
      // Check if any key exists first
      const existingKey = await window.api.keystore.getFalKey()
      if (!existingKey) {
        setConnectionStatus('required')
        return 'required'
      }
      // Smoke test against billing endpoint
      const result = await window.api.fal.validateKey(existingKey)
      if (result.valid) {
        setConnectionStatus('connected')
        if (result.credits !== undefined) setFalCredits(result.credits)
        return 'connected'
      } else {
        // 401 = invalid key
        setConnectionStatus('invalid')
        return 'invalid'
      }
    } catch {
      setConnectionStatus('error')
      return 'error'
    }
  }, [])

  // On mount: validate license via main process, then check fal connection
  useEffect(() => {
    const checkLicense = async () => {
      setLicenseChecking(true)
      try {
        console.log('[AppContext] Starting license check...')
        const result = await window.api.license.validate()
        console.log('[AppContext] License validate result:', result)
        if (!result.valid) {
          // License invalid — force onboarding regardless of localStorage
          console.log('[AppContext] License invalid, showing onboarding. Reason:', result.reason)
          setOnboardingComplete(false)
          setIsLicenseValid(false)
        } else {
          // License valid! Check fal connection.
          setIsLicenseValid(true)
          console.log('[AppContext] License valid! import.meta.env.DEV =', import.meta.env.DEV)

          // In dev mode, skip onboarding entirely when license is valid.
          // Dev uses a fresh Chromium profile with no localStorage/fal key state.
          if (import.meta.env.DEV) {
            console.log('[AppContext] DEV mode — bypassing onboarding')
            setOnboardingComplete(true)
            localStorage.setItem('mosterads_onboarded', 'true')
            await refreshConnectionStatus()
          } else {
            const status = await refreshConnectionStatus()
            if (status !== 'required') {
              // Fal key exists in keystore — skip onboarding.
              setOnboardingComplete(true)
              localStorage.setItem('mosterads_onboarded', 'true')
            } else if (localStorage.getItem('mosterads_onboarded') === 'true') {
              // Previously completed onboarding (localStorage flag set)
              setOnboardingComplete(true)
            } else {
              // Missing Fal key completely — need to onboard
              setOnboardingComplete(false)
            }
          }
        }
      } catch (err) {
        // Network error — force onboarding so user can re-validate
        console.error('[AppContext] License check threw error:', err)

        setOnboardingComplete(false)
        setIsLicenseValid(false)
      } finally {
        setLicenseChecking(false)
      }
    }
    checkLicense()
  }, [refreshConnectionStatus])

  return (
    <AppContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        rightPanelContent,
        setRightPanelContent,
        onboardingComplete,
        completeOnboarding,
        licenseChecking,
        isLicenseValid,
        activeImageMode,
        setActiveImageMode,
        activeVideoMode,
        setActiveVideoMode,
        mcpEnabled,
        setMcpEnabled,
        connectionStatus,
        falCredits,
        refreshConnectionStatus
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
