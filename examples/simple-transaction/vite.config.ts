import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"zod/v4/core": "zod",
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Split vendor libraries into separate chunks
					if (id.includes("node_modules")) {
						const packageName = id
							.toString()
							.split("node_modules/")[1]
							.split("/")[0]
							.toString();
						if (packageName) {
							return `vendor-${packageName}`;
						}
					}
				},
			},
		},
	},
	optimizeDeps: {
		include: ["zod", "@hookform/resolvers", "react-hook-form"],
	},
});
