import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to ensure correct HTML transformation
function fixHtmlPlugin(): Plugin {
  return {
    name: 'fix-html-transform',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        console.log('[Fix HTML Plugin] Running transformation...');

        // Remove Tailwind CDN and its config
        let cleaned = html.replace(/<script[^>]*cdn\.tailwindcss\.com[^>]*><\/script>/gi, '');
        cleaned = cleaned.replace(/<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\};\s*<\/script>/gi, '');

        console.log('[Fix HTML Plugin] Removed Tailwind CDN references');

        // Ensure main app script exists
        if (!cleaned.includes('/index.tsx')) {
          cleaned = cleaned.replace('</body>', '<script type="module" src="/index.tsx"></script>\n</body>');
          console.log('[Fix HTML Plugin] Added missing index.tsx script');
        }

        return cleaned;
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      fixHtmlPlugin(),
      react(),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
