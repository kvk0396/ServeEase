import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // Allow access from any IP address on the network
        port: 5173, // Explicitly set the port
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                // Keep the /api prefix so requests map to backend controllers that are prefixed via ApiPathPrefixConfig
                // Example: /api/auth/register -> http://localhost:8080/api/auth/register
            },
        },
    },
    preview: {
        host: '0.0.0.0',
        port: Number(process.env.PORT) || 4173,
    },
});
