import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill for process.env.API_KEY to work in the browser with Vite
      // Fallback to empty string to prevent undefined errors
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});