/**
 * LaTeX Compiler Utility
 * Connects directly to TeX Live engine with proxy fallback to compile arbitrary LaTeX source
 * into PDF documents with 100% accuracy.
 */

export interface CompileResult {
  success: boolean;
  pdfBlob?: Blob;
  pdfUrl?: string;
  error?: string;
  log?: string;
}

import type { ProjectFile } from './projectState';

/**
 * Normalizes and resolves LaTeX imports/inclusions (\input{}, \include{})
 * by searching through project files and inlining their contents recursively.
 */
export function resolveLatexImports(
  code: string,
  projectFiles?: ProjectFile[],
  visitedPaths = new Set<string>()
): string {
  if (!code) return '';

  let resolved = code;

  if (projectFiles && projectFiles.length > 0) {
    // Match \input{filename} and \include{filename}
    resolved = resolved.replace(
      /\\(input|include)\{([^}]+)\}/g,
      (match, command, targetPath) => {
        let cleanTarget = targetPath.trim();
        if (!cleanTarget.endsWith('.tex') && !cleanTarget.includes('.')) {
          cleanTarget += '.tex';
        }

        // Avoid infinite recursion
        if (visitedPaths.has(cleanTarget)) {
          return `% [Circular reference to ${cleanTarget} ignored]`;
        }

        // Find file by exact path, relative path, or filename
        const matchedFile = projectFiles.find(
          (f) =>
            f.type === 'file' &&
            (f.path === cleanTarget ||
              f.name === cleanTarget ||
              f.path.endsWith('/' + cleanTarget) ||
              f.name === cleanTarget.replace(/\.tex$/, ''))
        );

        if (matchedFile && matchedFile.content !== undefined) {
          const nextVisited = new Set(visitedPaths);
          nextVisited.add(cleanTarget);
          const inlinedContent = resolveLatexImports(
            matchedFile.content,
            projectFiles,
            nextVisited
          );
          return `% --- Start of inlined ${cleanTarget} ---\n${inlinedContent}\n% --- End of inlined ${cleanTarget} ---`;
        }

        return match; // Keep original if file not found locally
      }
    );
  }

  // Ensure line endings are standard CRLF (\r\n) for TeXLive CGI parser
  const normalized = resolved.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized.replace(/\n/g, '\r\n');
}

/**
 * Revokes a previously created blob URL to free up memory
 */
export function revokePdfUrl(url: string | null | undefined): void {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore revocation errors
    }
  }
}

/**
 * Extracts a concise, human-readable error message from the LaTeX compiler transcript
 */
export function extractLatexErrorMessage(log: string): string {
  if (!log) return 'Unknown LaTeX compilation error';

  if (log.includes('Bad form type')) {
    return 'Compiler protocol mismatch: form requires multipart/form-data encoding.';
  }

  const lines = log.split(/\r?\n/);
  const errorLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('!')) {
      errorLines.push(line);
      // Grab next 1-2 lines for context (e.g. l.45 \badcommand)
      if (lines[i + 1] && !lines[i + 1].startsWith('!') && lines[i + 1].trim()) {
        errorLines.push(lines[i + 1]);
      }
      if (lines[i + 2] && lines[i + 2].trim().startsWith('l.')) {
        errorLines.push(lines[i + 2]);
      }
    }
  }

  if (errorLines.length > 0) {
    return errorLines.slice(0, 4).join('\n');
  }

  // Fallback: check for Emergency stop or Fatal error
  const fatalMatch = log.match(/!.*?(?=\n\n|\n[A-Z]|\n\s*$)/s);
  if (fatalMatch) {
    return fatalMatch[0].trim();
  }

  return 'LaTeX compilation failed. Please inspect the compiler log for details.';
}

/**
 * Verifies if an ArrayBuffer represents a valid PDF (contains %PDF within initial header)
 */
function isPdfBuffer(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 4) return false;
  const checkLen = Math.min(buffer.byteLength, 1024);
  const bytes = new Uint8Array(buffer.slice(0, checkLen));
  // Look for '%PDF' (0x25, 0x50, 0x44, 0x46)
  for (let i = 0; i <= checkLen - 4; i++) {
    if (
      bytes[i] === 0x25 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x44 &&
      bytes[i + 3] === 0x46
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Compiles LaTeX source code into a PDF Blob and URL
 * Attempts multiple endpoints in priority order:
 * 1. Local Vite proxy (/api/compile-latex) — no CORS issues
 * 2. Direct TeXLive CGI — may be blocked by browser CORS
 * 3. latex.ytotech.com API — alternative compiler
 */
export async function compileLatex(
  latexCode: string,
  signalOrOptions?: AbortSignal | { signal?: AbortSignal; projectFiles?: ProjectFile[]; engine?: string }
): Promise<CompileResult> {
  if (!latexCode || !latexCode.trim()) {
    return {
      success: false,
      error: 'LaTeX source code is empty.',
      log: 'No LaTeX code provided to compiler.',
    };
  }

  const signal = signalOrOptions instanceof AbortSignal ? signalOrOptions : signalOrOptions?.signal;
  const projectFiles = !(signalOrOptions instanceof AbortSignal) ? signalOrOptions?.projectFiles : undefined;
  const engine = !(signalOrOptions instanceof AbortSignal) ? signalOrOptions?.engine || 'pdflatex' : 'pdflatex';

  const preparedSource = resolveLatexImports(latexCode, projectFiles);

  // ---- Strategy 1: Local Vite proxy (recommended — bypasses CORS) ----
  try {
    const formData = new FormData();
    formData.append('filecontents[]', preparedSource);
    formData.append('filename[]', 'document.tex');
    formData.append('engine', engine);
    formData.append('return', 'pdf');

    if (projectFiles) {
      for (const file of projectFiles) {
        if (file.type === 'file' && file.content && file.path !== 'document.tex' && file.name !== 'main.tex') {
          formData.append('filename[]', file.path || file.name);
          formData.append('filecontents[]', file.content);
        }
      }
    }

    const response = await fetch('/api/compile-latex', {
      method: 'POST',
      body: formData,
      signal,
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();

      if (isPdfBuffer(arrayBuffer)) {
        const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        return {
          success: true,
          pdfBlob,
          pdfUrl,
          log: 'Compilation successful (via local proxy)',
        };
      } else {
        // Response is the compiler log / error transcript
        const decoder = new TextDecoder('utf-8');
        const logText = decoder.decode(arrayBuffer);
        const errMsg = extractLatexErrorMessage(logText);
        return {
          success: false,
          error: errMsg,
          log: logText,
        };
      }
    } else {
      // Non-200 — fall through to next strategy
      const errorText = await response.text().catch(() => '');
      console.warn('[LaTeX] Proxy returned HTTP', response.status, errorText);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.warn('[LaTeX] Proxy endpoint failed:', err.message);
  }

  // ---- Strategy 2: Direct TeXLive CGI ----
  try {
    const formData = new FormData();
    formData.append('filecontents[]', preparedSource);
    formData.append('filename[]', 'document.tex');
    formData.append('engine', 'pdflatex');
    formData.append('return', 'pdf');

    const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: formData,
      signal,
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();

      if (isPdfBuffer(arrayBuffer)) {
        const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        return {
          success: true,
          pdfBlob,
          pdfUrl,
          log: 'Compilation successful (direct TeXLive)',
        };
      } else {
        const decoder = new TextDecoder('utf-8');
        const logText = decoder.decode(arrayBuffer);
        return {
          success: false,
          error: extractLatexErrorMessage(logText),
          log: logText,
        };
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.warn('[LaTeX] Direct TeXLive endpoint failed:', err.message);
  }

  // ---- Strategy 3: latex.ytotech.com API ----
  try {
    const payload = {
      compiler: 'pdflatex',
      resources: [
        {
          main: true,
          content: preparedSource,
        },
      ],
    };

    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });

    if (response.ok) {
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/pdf')) {
        const arrayBuffer = await response.arrayBuffer();
        if (isPdfBuffer(arrayBuffer)) {
          const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          return {
            success: true,
            pdfBlob,
            pdfUrl,
            log: 'Compilation successful (via ytotech)',
          };
        }
      }
      // Non-PDF response is an error
      const errorText = await response.text().catch(() => '');
      return {
        success: false,
        error: extractLatexErrorMessage(errorText) || 'Compilation failed on fallback service.',
        log: errorText,
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.warn('[LaTeX] ytotech fallback failed:', err.message);
  }

  return {
    success: false,
    error: 'Failed to fetch — unable to reach any LaTeX compiler service. Check your internet connection and try again.',
    log: 'All compiler endpoints failed. This is typically caused by:\n1. No internet connection\n2. Network firewall blocking outbound requests\n3. The LaTeX compiler services (texlive.net) being temporarily unavailable\n\nTry refreshing the page or checking your network.',
  };
}

