/**
 * vite.config.ts
 *
 * @description
 * Vite config for bundling the Electron renderer code (React).
 * It scans `src/renderer/index.html` + .ts/.tsx files, outputs to `dist/renderer`.
 *
 * After building, you'll have `dist/renderer/index.html` + optimized JS/CSS.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, 'src', 'renderer'), // where index.html (React) lives
  base: './',  // ensures relative paths so it can be loaded by Electron file://
  build: {
    outDir: path.join(__dirname, 'dist', 'renderer'),
    emptyOutDir: true,
  },
  plugins: [react()]
})
