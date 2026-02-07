/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

let commitHash = 'unknown';
let buildDate = new Date().toISOString();

try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    console.log('Build version (git):', commitHash);
} catch (e) {
    console.log('Could not get git commit hash via command, checking environment variables...');
    const envVars = [
        'VERCEL_GIT_COMMIT_SHA',
        'GITHUB_SHA',
        'CF_PAGES_COMMIT_SHA',
        'COMMIT_REF',
        'RENDER_GIT_COMMIT',
        'CI_COMMIT_SHA'
    ];

    for (const key of envVars) {
        if (process.env[key]) {
            commitHash = process.env[key].substring(0, 7);
            console.log(`Build version (${key}):`, commitHash);
            break;
        }
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
