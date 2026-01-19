import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget = process.env.DROCSID_BACKEND_URL ?? "http://drocsid.eu:8080";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [react()],
		define: {
			"import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID": JSON.stringify(
				env.VITE_GOOGLE_OAUTH_CLIENT_ID || env.GOOGLE_OAUTH_CLIENT_ID
			),
		},
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
	};
});
