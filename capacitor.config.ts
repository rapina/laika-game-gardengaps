import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sputnikworkshop.gardengaps',
  appName: 'Garden of Gaps',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
