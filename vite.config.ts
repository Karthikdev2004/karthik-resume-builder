import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'

function latexCompilerPlugin(): Plugin {
  return {
    name: 'latex-compiler-proxy',
    configureServer(server) {
      server.middlewares.use('/api/compile-latex', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          const bodyBuffer = Buffer.concat(chunks);
          const contentType = req.headers['content-type'] || 'multipart/form-data';

          const postReq = https.request(
            {
              hostname: 'texlive.net',
              path: '/cgi-bin/latexcgi',
              method: 'POST',
              headers: {
                'Content-Type': contentType,
                'Content-Length': bodyBuffer.length,
              },
            },
            (postRes) => {
              const redirectUrl = postRes.headers.location;
              if (redirectUrl) {
                const fullUrl = redirectUrl.startsWith('http')
                  ? redirectUrl
                  : `https://texlive.net${redirectUrl}`;

                https.get(fullUrl, (getRes) => {
                  res.statusCode = getRes.statusCode || 200;
                  res.setHeader('Content-Type', getRes.headers['content-type'] || 'application/pdf');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  getRes.pipe(res);
                }).on('error', (err) => {
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'text/plain');
                  res.end(`Failed to fetch redirected PDF: ${err.message}`);
                });
              } else {
                res.statusCode = postRes.statusCode || 200;
                res.setHeader('Content-Type', postRes.headers['content-type'] || 'text/plain');
                res.setHeader('Access-Control-Allow-Origin', '*');
                postRes.pipe(res);
              }
            }
          );

          postReq.on('error', (err) => {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'text/plain');
            res.end(`LaTeX compilation error: ${err.message}`);
          });

          postReq.write(bodyBuffer);
          postReq.end();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    latexCompilerPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})

