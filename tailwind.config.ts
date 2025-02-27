/**
 * @description
 * Tailwind CSS configuration file for ComputeFabric MVP.
 *
 * Key features:
 * - Scans app and components folders for tailwind classes
 * - Includes all necessary file types
 *
 * @dependencies
 * - tailwindcss: For utility CSS classes
 *
 * @notes
 * - Customize theme or plugins as needed.
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors can be defined here if needed
      },
      spacing: {
        // Custom spacing values can be added here
      },
      borderRadius: {
        // Custom border radius values
      },
    }
  },
  plugins: []
}

export default config