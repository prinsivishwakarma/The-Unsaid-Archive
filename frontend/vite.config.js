import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
  const config = {
    plugins: [react()],
    server: {
      proxy: {
        '/api': 'http://localhost:3001',
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'esbuild', // Use esbuild instead of terser for better compatibility
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            socket: ['socket.io-client']
          }
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };

  // Add bundle analyzer for analyze mode (optional plugin)
  if (mode === 'analyze') {
    try {
      const { visualizer } = await import('rollup-plugin-visualizer');
      config.plugins.push(visualizer({ 
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true
      }));
    } catch (error) {
      console.warn('rollup-plugin-visualizer not available, skipping bundle analysis');
    }
  }

  return config;
});
