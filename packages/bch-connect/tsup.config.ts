import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	outDir: "dist",
	clean: true,
	sourcemap: true,
	target: "es2020",
	external: ["react", "react-dom", "react/jsx-runtime"],
	minify: false,
	splitting: false,
	treeshake: true,
	shims: true,
	onSuccess: "echo ✅ Build completed successfully!",
});
