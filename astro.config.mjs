// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://10millionwins.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: {
    assets: '_assets'
  },
  compressHTML: true
});
