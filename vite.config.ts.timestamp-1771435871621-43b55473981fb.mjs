// vite.config.ts
import tailwindcss from "file:///C:/Users/beauj/projects/sport/runflow/node_modules/@tailwindcss/vite/dist/index.mjs";
import vue from "file:///C:/Users/beauj/projects/sport/runflow/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/beauj/projects/sport/runflow/node_modules/vite/dist/node/index.js";
import webfontDownload from "file:///C:/Users/beauj/projects/sport/runflow/node_modules/vite-plugin-webfont-dl/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/beauj/projects/sport/runflow/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    webfontDownload([
      "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
      "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap"
    ])
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxiZWF1alxcXFxwcm9qZWN0c1xcXFxzcG9ydFxcXFxydW5mbG93XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxiZWF1alxcXFxwcm9qZWN0c1xcXFxzcG9ydFxcXFxydW5mbG93XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9iZWF1ai9wcm9qZWN0cy9zcG9ydC9ydW5mbG93L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgd2ViZm9udERvd25sb2FkIGZyb20gJ3ZpdGUtcGx1Z2luLXdlYmZvbnQtZGwnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICB3ZWJmb250RG93bmxvYWQoW1xyXG4gICAgICAnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1Sb2JvdG86aXRhbCx3Z2h0QDAsMTAwLi45MDA7MSwxMDAuLjkwMCZkaXNwbGF5PXN3YXAnLFxyXG4gICAgICAnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1SYWxld2F5OndnaHRANDAwOzUwMDs2MDA7NzAwJmRpc3BsYXk9c3dhcCcsXHJcbiAgICBdKSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGNzczoge1xyXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlMsT0FBTyxpQkFBaUI7QUFDclUsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZSxXQUFXO0FBQ25DLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8scUJBQXFCO0FBSmlLLElBQU0sMkNBQTJDO0FBTTlPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFlBQVk7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
