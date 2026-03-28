import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to mount our backend API endpoints during dev
function expressPlugin() {
  return {
    name: 'express-plugin',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const { default: analyticsRouter } = await import('./src/server/analytics.js');
          // Fake a minimal express-like environment for the router
          const express = (await import('express')).default;
          const app = express();
          app.use(express.json());
          app.use(analyticsRouter);
          app(req, res, next);
        } catch (err) {
          console.error('Error loading API routes:', err);
          next();
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), expressPlugin()],
  server: {
    port: 8888,
    proxy: {
      // Ikas OAuth2 token endpoint
      '/ikas-auth': {
        target: 'https://gilan11.myikas.com',
        changeOrigin: true,
        rewrite: (path) => '/api/admin/oauth/token',
        secure: true
      },
      // Ikas GraphQL API
      '/ikas-api': {
        target: 'https://api.myikas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ikas-api/, '/api/v1/admin'),
        secure: true
      },
      // Trendyol REST API
      '/trendyol-api': {
        target: 'https://api.trendyol.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trendyol-api/, ''),
        secure: true,
        headers: {
          'User-Agent': '931428 - SelfIntegration'
        }
      }
    }
  }
})
