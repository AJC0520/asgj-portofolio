// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

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
	],
	build: {
		// One small stylesheet: inline it rather than spend a render-blocking request on it
		inlineStylesheets: 'always',
	},
});
