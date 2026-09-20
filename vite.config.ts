import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL;

  return {
    plugins: [react()],

    base: '/crushpad-admin-panel/',

    server: {
      port: 5173,
      host: true,
      proxy: {
        '/v1': {
          target: apiUrl,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  };
});