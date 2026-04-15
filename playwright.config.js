import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'blocks/**/*.spec.js',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npx -y @adobe/aem-cli up --no-open --forward-browser-logs',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
