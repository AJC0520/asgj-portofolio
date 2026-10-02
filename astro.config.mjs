// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Self-hosted and preloaded (see Layout.astro) instead of a render-blocking Google Fonts stylesheet
  fonts: [
      {
          provider: fontProviders.google(),
          name: 'Inter Tight',
          cssVariable: '--font-inter-tight',
          weights: [600],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      {
          // KartTracker's logo font, for its project title (src/components/projects/KartTracker.astro)
          provider: fontProviders.google(),
          name: 'Bowlby One SC',
          cssVariable: '--font-bowlby-one-sc',
          weights: [400],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['Impact', 'sans-serif'],
      },
	],

  build: {
      // One small stylesheet: inline it rather than spend a render-blocking request on it
      inlineStylesheets: 'always',
	},

  integrations: [react()],

  vite: {
    // `astro build` also pre-bundles dependencies (in production mode) into Vite's cache. Sharing that folder with the
    // dev server left React's production build in it, and the page then failed with "_jsxDEV is not a function".
    // So the build gets a cache of its own.
    cacheDir: process.argv.includes('build') ? 'node_modules/.vite-build' : 'node_modules/.vite',
  },
});