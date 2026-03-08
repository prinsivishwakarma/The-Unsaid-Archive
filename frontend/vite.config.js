import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
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
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            socket: ['socket.io-client']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };

  // Add bundle analyzer for analyze mode
  if (mode === 'analyze') {
    config.plugins.push(visualizer({ 
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    }));
  }

  return config;
});
