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
    port: 4000,
    proxy: {
      '/ikas-api': {
        target: 'https://api.myikas.com/api/v1/admin',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ikas-api/, '')
      },
      '/ikas-auth': {
        target: 'https://gilan11.myikas.com/api/admin/oauth/token',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ikas-auth/, '')
      },
      '/trendyol-api': {
        target: 'https://api.trendyol.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trendyol-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Trendyol API STRICTLY requires a specific User-Agent format to bypass Cloudflare
            proxyReq.setHeader('User-Agent', '931428 - SelfIntegration');
          });
        }
      },
      '/trendyol-apigw': {
        target: 'https://apigw.trendyol.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trendyol-apigw/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('User-Agent', '931428 - SelfIntegration');
          });
        }
      }
    }
  }
})
