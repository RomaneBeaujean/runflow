import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
// import { PrimeVueResolver } from '@primevue/auto-import-resolver';
// import vue from '@vitejs/plugin-vue';
// import path from 'path';
// import { defineConfig } from 'vite';
// import Components from 'unplugin-vue-components/vite';
// export default defineConfig({
//   plugins: [
//     vue({ template: { compilerOptions: { strict: true } } }),
//     Components({
//       resolvers: [PrimeVueResolver()],
//     }),
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//     },
//   },
// });
