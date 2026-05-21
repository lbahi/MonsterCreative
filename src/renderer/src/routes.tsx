import { createHashRouter, Navigate } from 'react-router'
import { Shell } from './components/Shell'
import { DashboardScreen } from './screens/DashboardScreen'
import { AdCopyScreen } from './screens/AdCopyScreen'
import { ImageGenScreen } from './screens/image-gen'
import { AudioLabScreen } from './screens/AudioLabScreen'
import { VideoGenScreen } from './screens/video-gen'
import { ApiCostsScreen } from './screens/ApiCostsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AiShotsScreen } from './screens/ai-shots'

export const router = createHashRouter([
  {
    path: '/',
    Component: Shell,
    children: [
      { index: true, Component: DashboardScreen },
      { path: 'ad-copy', Component: AdCopyScreen },
      // Image Generator sub-routes
      { path: 'image-gen', element: <Navigate to="/image-gen/generate" replace /> },
      { path: 'image-gen/generate', Component: ImageGenScreen },
      { path: 'image-gen/vton', Component: ImageGenScreen },
      { path: 'image-gen/ai-shots', Component: AiShotsScreen },
      { path: 'image-gen/social', Component: ImageGenScreen },
      { path: 'image-gen/resize', Component: ImageGenScreen },
      { path: 'image-gen/landing', Component: ImageGenScreen },
      // Audio Lab
      { path: 'audio-lab', element: <Navigate to="/audio-lab/tts" replace /> },
      { path: 'audio-lab/tts', Component: AudioLabScreen },
      { path: 'audio-lab/clone', Component: AudioLabScreen },
      { path: 'audio-lab/s2s', Component: AudioLabScreen },
      // Video Generator sub-routes
      { path: 'video-gen', element: <Navigate to="/video-gen/fashion" replace /> },
      { path: 'video-gen/fashion', Component: VideoGenScreen },
      // API Costs + Settings
      { path: 'api-costs', Component: ApiCostsScreen },
      { path: 'settings', Component: SettingsScreen }
    ]
  }
])
