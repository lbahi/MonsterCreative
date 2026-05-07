import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { useApp } from '../contexts/AppContext';
import { useState, useEffect } from 'react';
import { OnboardingModal } from '../screens/OnboardingScreen';
import { Bell, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Shell() {
  const { onboardingComplete, licenseChecking } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(!onboardingComplete);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // @ts-ignore
    if (window.api?.update) {
      // @ts-ignore
      window.api.update.onDownloaded(() => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  // Sync showOnboarding when license check overrides onboardingComplete
  useEffect(() => {
    if (!licenseChecking && !onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [licenseChecking, onboardingComplete]);

  const handleOnboardingDone = () => {
    completeOnboarding();
    setShowOnboarding(false);
    navigate('/');
  };

  // Show loading while license is being validated
  if (licenseChecking) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'var(--ma-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        fontFamily: 'var(--font-body)', color: 'var(--ma-text)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px var(--ma-accent-glow)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <Zap size={18} color="white" />
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
          Validating license...
        </p>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {updateAvailable && (
        <div style={{
          width: '100%',
          height: 28,
          background: 'var(--ma-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: '#FFF',
          fontSize: 11,
          fontWeight: 600,
          zIndex: 100,
          flexShrink: 0
        }}>
          ✨ Update available — 
          <button 
            // @ts-ignore
            onClick={() => window.api.update.install()}
            style={{ 
              background: 'rgba(0,0,0,0.2)', 
              border: 'none', 
              padding: '2px 8px', 
              borderRadius: 4, 
              color: '#FFF', 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Install & Restart
          </button>
          <button 
            onClick={() => setUpdateAvailable(false)}
            style={{ position: 'absolute', right: 16, background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: 14 }}
          >
            ×
          </button>
        </div>
      )}
      <div
        style={{
          flex: 1,
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
          ['WebkitAppRegion' as string]: 'drag' // Allow dragging
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, ['WebkitAppRegion' as string]: 'no-drag' }}>
            {/* Left side reserved for future breadcrumbs/title */}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, ['WebkitAppRegion' as string]: 'no-drag' }}>
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
    </div>
  );
}
