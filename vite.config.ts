import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import webfontDownload from 'vite-plugin-webfont-dl';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    webfontDownload([
      'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
      'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    ]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@components': fileURLToPath(
        new URL('./src/ui/components', import.meta.url)
      ),
      '@pages': fileURLToPath(new URL('./src/ui/pages', import.meta.url)),
      '@composables': fileURLToPath(
        new URL('./src/ui/composables', import.meta.url)
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
