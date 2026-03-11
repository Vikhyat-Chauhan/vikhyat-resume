import netlify from '@astrojs/netlify'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'


// https://astro.build/config
export default defineConfig({
	site: 'https://example.me',
	integrations: [
		tailwind({
			applyBaseStyles: false
		}),
		sitemap(),
		icon(),
		react()
	],
	prefetch: true,
	output: 'hybrid',
	adapter: netlify()
})
