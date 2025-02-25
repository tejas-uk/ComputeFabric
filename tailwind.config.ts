/**
 * @description
 * Tailwind CSS configuration file for ComputeFabric MVP.
 *
 * Key features:
 * - Scans app and components folders for tailwind classes
 *
 * @notes
 * - Customize theme or plugins as needed.
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}

export default config
