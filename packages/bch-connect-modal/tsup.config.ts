import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "iife"], // ESM for bundlers, IIFE for <script> usage
  globalName: "BCHConnectModal",
  dts: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
  splitting: false,
  clean: true,
  target: "es2019",
  platform: "browser",
  shims: false,
  loader: {
    ".css": "text",
    ".svg": "dataurl",
    ".png": "dataurl",
  },
});
