import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://vikhyat-chauhan.netlify.app',
  adapter: netlify(),
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});
