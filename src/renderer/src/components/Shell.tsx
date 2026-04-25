import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { useApp } from '../contexts/AppContext';
import { useEffect, useState } from 'react';
import { OnboardingModal } from '../screens/OnboardingScreen';
import { Share2, Users, ChevronDown, Bell, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Shell() {
  const { onboardingComplete, mcpEnabled } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(!onboardingComplete);
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  const handleOnboardingDone = () => {
    completeOnboarding();
    setShowOnboarding(false);
    navigate('/');
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--ma-bg)',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
        color: 'var(--ma-text)',
        minWidth: 800,
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: 54,
          borderBottom: '1px solid var(--ma-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 140px 0 24px', // Added 140px right padding for window controls
          background: 'rgba(7, 7, 15, 0.5)',
          backdropFilter: 'blur(12px)',
          zIndex: 50,
          flexShrink: 0,
          WebkitAppRegion: 'drag' as any // Allow dragging
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, WebkitAppRegion: 'no-drag' as any }}>
            {/* Left side reserved for future breadcrumbs/title */}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, WebkitAppRegion: 'no-drag' as any }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--ma-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: 8,
                  padding: '6px 10px 6px 32px',
                  fontSize: 12,
                  color: '#FFF',
                  width: 180,
                  outline: 'none',
                  transition: 'width 0.2s',
                  fontFamily: 'var(--font-body)'
                }}
                onFocus={(e) => e.target.style.width = '240px'}
                onBlur={(e) => e.target.style.width = '180px'}
              />
            </div>

            {/* Collaborate Button has been removed */}
            
            <button style={{ 
              width: 32, height: 32, borderRadius: 8, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid transparent',
              color: 'var(--ma-text-muted)', cursor: 'pointer'
            }}>
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
          <Outlet />
        </div>
      </div>

      <RightPanel />

      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
          >
            <OnboardingModal onComplete={handleOnboardingDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
