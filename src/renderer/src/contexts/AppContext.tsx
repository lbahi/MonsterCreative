import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type ConnectionStatus = 'idle' | 'verifying' | 'connected' | 'invalid' | 'error' | 'required';

interface AppContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  rightPanelContent: ReactNode;
  setRightPanelContent: (content: ReactNode) => void;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  activeImageMode: string;
  setActiveImageMode: (mode: string) => void;
  activeVideoMode: string;
  setActiveVideoMode: (mode: string) => void;
  mcpEnabled: boolean;
  setMcpEnabled: (v: boolean) => void;
  connectionStatus: ConnectionStatus;
  falCredits: number | null;
  refreshConnectionStatus: () => Promise<ConnectionStatus>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<ReactNode>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('mosterads_onboarded') === 'true';
  });
  const [activeImageMode, setActiveImageMode] = useState('generate');
  const [activeVideoMode, setActiveVideoMode] = useState('text-to-video');
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [falCredits, setFalCredits] = useState<number | null>(null);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState(prev => !prev);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem('mosterads_onboarded', 'true');
    setOnboardingComplete(true);
  }, []);

  const refreshConnectionStatus = useCallback(async (): Promise<ConnectionStatus> => {
    setConnectionStatus('verifying');
    try {
      // Check if any key exists first
      const existingKey = await window.api.keystore.getFalKey();
      if (!existingKey) {
        setConnectionStatus('required');
        return 'required';
      }
      // Smoke test against billing endpoint
      const result = await window.api.fal.validateKey(existingKey);
      if (result.valid) {
        setConnectionStatus('connected');
        if (result.credits !== undefined) setFalCredits(result.credits);
        return 'connected';
      } else {
        // 401 = invalid key
        setConnectionStatus('invalid');
        return 'invalid';
      }
    } catch {
      setConnectionStatus('error');
      return 'error';
    }
  }, []);

  // On mount: auto-check status (informational only — never blocks post-onboarded users)
  useEffect(() => {
    if (localStorage.getItem('mosterads_onboarded') === 'true') {
      refreshConnectionStatus();
    }
  }, [refreshConnectionStatus]);

  return (
    <AppContext.Provider value={{
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      rightPanelContent,
      setRightPanelContent,
      onboardingComplete,
      completeOnboarding,
      activeImageMode,
      setActiveImageMode,
      activeVideoMode,
      setActiveVideoMode,
      mcpEnabled,
      setMcpEnabled,
      connectionStatus,
      falCredits,
      refreshConnectionStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
