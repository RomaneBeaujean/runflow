import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        include: ["src/**"],
        provider: "v8",
        reporter: ["text", "html", "lcov"]
      },
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/*"],
      include: ["./**/*.spec.ts"],
      outputFile: "coverage/junit.xml",
      reporters: ["default", "junit"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      testTransformMode: {
        web: [".[jt]sx$"]
      }
    }
  })
);
