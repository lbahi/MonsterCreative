import { createHashRouter, Navigate } from 'react-router'
import { Shell } from './components/Shell'
import { DashboardScreen } from './screens/DashboardScreen'
import { AdCopyScreen } from './screens/AdCopyScreen'
import { ImageGenScreen } from './screens/image-gen'
import { AudioLabScreen } from './screens/AudioLabScreen'
import { ApiCostsScreen } from './screens/ApiCostsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AiShotsScreen } from './screens/ai-shots'
import { AdMakerScreen } from './screens/ads-maker'
import { CreationsScreen } from './screens/CreationsScreen'

export const router = createHashRouter([
  {
    path: '/',
    Component: Shell,
    children: [
      { index: true, Component: DashboardScreen },
      { path: 'creations', Component: CreationsScreen },
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
      { path: 'video-gen', element: <Navigate to="/video-gen/ad-maker" replace /> },
      { path: 'video-gen/ad-maker', Component: AdMakerScreen },
      // API Costs + Settings
      { path: 'api-costs', Component: ApiCostsScreen },
      { path: 'settings', Component: SettingsScreen }
    ]
  }
])

