import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

let commitHash = 'unknown';
let buildDate = new Date().toLocaleString();

try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn('Could not get git commit hash', e);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 5175,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    server: {
      deps: {
        inline: ['@exodus/bytes', 'html-encoding-sniffer']
      }
    }
  },
})
