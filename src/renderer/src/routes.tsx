import { createBrowserRouter, Navigate } from 'react-router';
import { Shell } from './components/Shell';
import { DashboardScreen } from './screens/DashboardScreen';
import { AdCopyScreen } from './screens/AdCopyScreen';
import { ImageGenScreen } from './screens/ImageGenScreen';
import { AudioLabScreen } from './screens/AudioLabScreen';
import { VideoGenScreen } from './screens/VideoGenScreen';
import { ApiCostsScreen } from './screens/ApiCostsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export const router = createBrowserRouter([
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
      { path: 'image-gen/resize', Component: ImageGenScreen },
      { path: 'image-gen/landing', Component: ImageGenScreen },
      // Audio Lab
      { path: 'audio-lab', Component: AudioLabScreen },
      // Video Generator sub-routes
      { path: 'video-gen', element: <Navigate to="/video-gen/text" replace /> },
      { path: 'video-gen/text', Component: VideoGenScreen },
      { path: 'video-gen/image', Component: VideoGenScreen },
      // API Costs + Settings
      { path: 'api-costs', Component: ApiCostsScreen },
      { path: 'settings', Component: SettingsScreen },
    ],
  },
]);
