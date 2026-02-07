/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

let commitHash = 'unknown';
let buildDate = new Date().toLocaleString();

try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn('Could not get git commit hash via git command', e);
    // Fallback to environment variables
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
        commitHash = process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7);
    } else if (process.env.GITHUB_SHA) {
        commitHash = process.env.GITHUB_SHA.substring(0, 7);
    }
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
