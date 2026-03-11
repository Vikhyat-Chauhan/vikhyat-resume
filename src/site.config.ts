import type { SiteConfig } from '@/types'

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: 'Vikhyat Chauhan',
	// Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
	title: 'Vikhyat Chauhan',
	// Meta property used as the default description meta property
	description:
		'Brain-inspired Computer Architecture | Graduate Research Assistant at Virginia Tech',
	// HTML lang property, found in src/layouts/Base.astro L:18
	lang: 'en',
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: 'en',
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: 'en',
		options: {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}
	}
}

export const menuLinks: Array<{ title: string; path: string }> = [
	{
		title: 'Vikhyat Chauhan',
		path: '/'
	}
]
