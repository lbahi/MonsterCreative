import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
