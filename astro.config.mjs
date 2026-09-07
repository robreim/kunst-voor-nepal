import { defineConfig } from 'astro/config';
import remarkAbsoluteUrls from './plugins/remark-absolute-urls.mjs';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkAbsoluteUrls],
  },
});
