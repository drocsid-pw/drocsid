import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget = process.env.DROCSID_BACKEND_URL ?? "http://drocsid.eu:8080";

export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		proxy: {
			"/api": {
				target: backendTarget,
				changeOrigin: true,
			},
		},
	},
	preview: {
		host: true,
		port: 5173,
	},
});
