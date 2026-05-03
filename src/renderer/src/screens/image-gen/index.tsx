/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/useImageGen.ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
import { useLocation } from 'react-router';
import { useImageGen } from './hooks/useImageGen';
import { useImageGenRightPanel } from './hooks/useImageGenRightPanel';
import type { ActiveImageGenMode } from './types';
import { ModeRouter } from './components/ModeRouter';

function getActiveMode(pathname: string): ActiveImageGenMode {
  if (pathname.includes('vton')) return 'vton';
  if (pathname.includes('social')) return 'social';
  if (pathname.includes('resize')) return 'resize';
  if (pathname.includes('landing')) return 'landing';
  return 'generate';
}

export function ImageGenScreen() {
  const location = useLocation();
  const activeMode = getActiveMode(location.pathname);
  const imageGen = useImageGen(activeMode);

  // Synchronize the Right Panel with the current state
  useImageGenRightPanel(activeMode, imageGen);

  return <ModeRouter {...imageGen} activeMode={activeMode} />;
}
