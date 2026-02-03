import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.projetcloud.s5',
  appName: 'RoadIssuesMadagascar',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    Camera: {},
    Geolocation: {},
    Network: {},
    Preferences: {}
  }
};

export default config;