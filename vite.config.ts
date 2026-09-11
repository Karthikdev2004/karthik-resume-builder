import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'
import http from 'node:http'
import { URL } from 'node:url'

/**
 * Follow redirects (up to maxRedirects) for both http and https URLs.
 * Collects the final response body into a single Buffer and returns it
 * along with the final status code and content-type.
 */
function followAndCollect(
  url: string,
  maxRedirects = 5
): Promise<{ status: number; contentType: string; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const requester = parsed.protocol === 'https:' ? https : http;

    requester.get(url, { timeout: 60_000 }, (res) => {
      const status = res.statusCode || 200;

      // Follow 3xx redirects
      if (status >= 300 && status < 400 && res.headers.location) {
        if (maxRedirects <= 0) {
          reject(new Error('Too many redirects'));
          return;
        }
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        res.resume(); // drain current response
        followAndCollect(next, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status,
          contentType: (res.headers['content-type'] as string) || 'application/octet-stream',
          body: Buffer.concat(chunks),
        });
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function latexCompilerPlugin(): Plugin {
  return {
    name: 'latex-compiler-proxy',
    configureServer(server) {
      server.middlewares.use('/api/compile-latex', (req, res) => {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }

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
              timeout: 60_000,
              headers: {
                'Content-Type': contentType,
                'Content-Length': bodyBuffer.length,
              },
            },
            (postRes) => {
              const status = postRes.statusCode || 200;
              const location = postRes.headers.location;

              // If texlive.net responds with a redirect, follow it
              if (status >= 300 && status < 400 && location) {
                const fullUrl = location.startsWith('http')
                  ? location
                  : `https://texlive.net${location}`;

                // Drain the original response
                postRes.resume();

                followAndCollect(fullUrl)
                  .then(({ status: finalStatus, contentType: ct, body }) => {
                    res.statusCode = finalStatus;
                    res.setHeader('Content-Type', ct);
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(body);
                  })
                  .catch((err) => {
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'text/plain');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(`Failed to fetch redirected PDF: ${err.message}`);
                  });
              } else {
                // Direct response (no redirect) — collect full body
                const responseChunks: Buffer[] = [];
                postRes.on('data', (chunk: Buffer) => responseChunks.push(chunk));
                postRes.on('end', () => {
                  res.statusCode = status;
                  res.setHeader('Content-Type', postRes.headers['content-type'] || 'text/plain');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(Buffer.concat(responseChunks));
                });
                postRes.on('error', (err) => {
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'text/plain');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(`Proxy read error: ${err.message}`);
                });
              }
            }
          );

          postReq.on('error', (err) => {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(`LaTeX compilation error: ${err.message}`);
          });

          postReq.on('timeout', () => {
            postReq.destroy(new Error('Request to texlive.net timed out'));
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

