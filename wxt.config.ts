import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reddit Thread Scraper',
    description: 'Scrape and export Reddit comment threads with ease',
    permissions: ['storage', 'scripting', 'activeTab'],
    host_permissions: ['*://reddit.com/*', '*://www.reddit.com/*'],
    icons: {
      16: '/icons/icon-16.png',
      48: '/icons/icon-48.png',
      128: '/icons/icon-128.png',
    },
  },
});
