import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const createProxyErrorHandler = (targetUrl) => (proxy) => {
    proxy.on('error', (err, req, res) => {
      console.warn(`[Vite Proxy] Не удалось связаться с бэкендом ${targetUrl}:`, err.message);
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            error: 'Бэкенд-сервер на http://localhost:5000 не запущен. Пожалуйста, запустите его в отдельном окне терминала командой: cd backend && npm start',
            status: 503
          })
        );
      }
    });
  };

  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000';

  return {
    // Base URL for GitHub Pages deployment (https://<username>.github.io/ahk-factory_project/)
    base: env.VITE_BASE || '/ahk-factory_project/',
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 3000,
      proxy: {
        // 1. Matches direct /api calls
        '^/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: createProxyErrorHandler(proxyTarget)
        },
        // 2. Matches /ahk-factory_project/api calls
        '^/ahk-factory_project/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ahk-factory_project/, ''),
          configure: createProxyErrorHandler(proxyTarget)
        },
        // 3. Matches /ahk-factory/api calls (legacy compatibility)
        '^/ahk-factory/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ahk-factory/, ''),
          configure: createProxyErrorHandler(proxyTarget)
        }
      }
    }
  };
});
