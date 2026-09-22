import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, Terminal, Download, X, CheckCircle2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { compileLatex, resolveLatexImports, revokePdfUrl, extractLatexErrorMessage, type CompileResult } from '@/lib/latexCompiler';

export { compileLatex, resolveLatexImports, revokePdfUrl, extractLatexErrorMessage };
export type { CompileResult };

import type { ProjectFile } from '@/lib/projectState';

export interface UniversalLatexCompilerProps {
  latexCode: string;
  projectFiles?: ProjectFile[];
  pdfUrl?: string | null;
  isCompiling?: boolean;
  error?: string | null;
  log?: string | null;
  zoom?: number;
  onSyncToCode?: (text: string) => void;
  onRecompile?: () => void;
  onDownload?: () => void;
  onClearError?: () => void;
  onCompileStart?: () => void;
  onCompileSuccess?: (result: CompileResult) => void;
  onCompileError?: (error: string, log: string | null) => void;
}

export const UniversalLatexCompiler: React.FC<UniversalLatexCompilerProps> = ({
  latexCode,
  projectFiles,
  pdfUrl: propPdfUrl,
  isCompiling: propIsCompiling,
  error: propError,
  log: propLog,
  zoom = 1,
  onSyncToCode,
  onRecompile,
  onDownload,
  onClearError,
  onCompileStart,
  onCompileSuccess,
  onCompileError,
}) => {
  const [localCompiling, setLocalCompiling] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLog, setLocalLog] = useState<string | null>(null);
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(propPdfUrl || null);
  const [showFullLog, setShowFullLog] = useState<boolean>(false);

  // SyncTeX Interactive Canvas Viewer state
  const [useInteractiveViewer, setUseInteractiveViewer] = useState<boolean>(true);
  const [renderCanvasReady, setRenderCanvasReady] = useState<boolean>(false);
  const [clickPin, setClickPin] = useState<{ x: number; y: number } | null>(null);
  const [pdfPageData, setPdfPageData] = useState<{
    width: number;
    height: number;
    textItems: Array<{ str: string; left: number; top: number; width: number; height: number }>;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeBlobUrlRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const downloadFormRef = useRef<HTMLFormElement>(null);
  const logFormRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);

  const isCompiling = propIsCompiling ?? localCompiling;
  const error = propError ?? localError;
  const log = propLog ?? localLog;
  const activePdfUrl = propPdfUrl || localPdfUrl;

  const preparedCode = resolveLatexImports(latexCode, projectFiles);

  // Core compilation routine
  const executeCompile = useCallback(async () => {
    if (!preparedCode.trim()) return;

    // Check if document is structurally incomplete
    if (!preparedCode.includes('\\begin{document}')) {
      const hint = 'LaTeX Document Notice: Missing \\begin{document}. Include \\begin{document} ... \\end{document} to compile your PDF.';
      setLocalError(hint);
      setLocalLog('Document preamble was provided without \\begin{document} ... \\end{document}.');
      onCompileError?.(hint, null);
      return;
    }

    // Cancel pending compile requests
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const controller = new AbortController();
    abortCtrlRef.current = controller;

    setLocalCompiling(true);
    setLocalError(null);
    onCompileStart?.();

    try {
      const result = await compileLatex(preparedCode, { signal: controller.signal, projectFiles });
      if (result.success && result.pdfUrl) {
        if (activeBlobUrlRef.current) {
          revokePdfUrl(activeBlobUrlRef.current);
        }
        activeBlobUrlRef.current = result.pdfUrl;
        setLocalPdfUrl(result.pdfUrl);
        setLocalError(null);
        setLocalLog(result.log || null);
        onCompileSuccess?.(result);
      } else {
        const errMsg = result.error || 'LaTeX compilation failed.';
        setLocalError(errMsg);
        setLocalLog(result.log || null);
        onCompileError?.(errMsg, result.log || null);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      // Fallback: submit hidden multipart form to iframe
      if (formRef.current) {
        formRef.current.submit();
      }
    } finally {
      setLocalCompiling(false);
    }
  }, [preparedCode, onCompileStart, onCompileSuccess, onCompileError]);

  // Compile once on mount only — the parent triggers recompilation by changing
  // the `key` prop (recompileTrigger), which causes this component to remount.
  // No debounced auto-recompile on code changes.
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      executeCompile();
    }
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        revokePdfUrl(activeBlobUrlRef.current);
      }
    };
  }, []);

  // Extract PDF text content positions for 1-to-1 Tap-to-Sync SyncTeX overlay
  useEffect(() => {
    if (!activePdfUrl) {
      setPdfPageData(null);
      return;
    }
    let cancelled = false;

    async function loadPdfTextLayer() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const res = await fetch(activePdfUrl);
        const arrayBuf = await res.arrayBuffer();
        if (cancelled) return;

        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
        if (cancelled) return;

        const page = await pdfDoc.getPage(1);
        if (cancelled) return;

        const baseVp = page.getViewport({ scale: 1 });
        const targetWidth = 800;
        const scale = targetWidth / baseVp.width;
        const displayVp = page.getViewport({ scale });

        const textContent = await page.getTextContent();
        if (cancelled) return;

        const items: Array<{ str: string; left: number; top: number; width: number; height: number }> = [];
        for (const item of textContent.items as any[]) {
          if (!item.str || !item.str.trim()) continue;
          const tx = item.transform[4];
          const ty = item.transform[5];
          const [vx, vy] = displayVp.convertToViewportPoint(tx, ty);
          const w = item.width * scale;
          const h = (item.height || 12) * scale;
          items.push({
            str: item.str,
            left: vx,
            top: vy - h,
            width: Math.max(w, 10),
            height: Math.max(h, 14),
          });
        }

        setPdfPageData({
          width: displayVp.width,
          height: displayVp.height,
          textItems: items,
        });
      } catch (err) {
        console.warn('SyncTeX text layer extraction note:', err);
      }
    }

    loadPdfTextLayer();
    return () => {
      cancelled = true;
    };
  }, [activePdfUrl]);

  // Click handler on the resume page to locate the text and jump the editor cursor
  const handleResumePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    // Show locator pin ripple
    setClickPin({ x: clickX, y: clickY });
    setTimeout(() => setClickPin(null), 1200);

    if (!pdfPageData || pdfPageData.textItems.length === 0) {
      // Fallback: estimate section based on document vertical percentage
      const ratio = Math.max(0, Math.min(1, clickY / 1130));
      const secMatches = [...preparedCode.matchAll(/\\(?:section|sectiontitle|cvsection)\*?\{([^}]+)\}/gi)];
      if (secMatches.length > 0) {
        const secIndex = Math.min(secMatches.length - 1, Math.floor(ratio * secMatches.length));
        onSyncToCode?.(secMatches[secIndex][1].trim());
      }
      return;
    }

    // 1. Direct hit on text bounding box
    const directHit = pdfPageData.textItems.find(
      (item) =>
        clickX >= item.left - 4 &&
        clickX <= item.left + item.width + 4 &&
        clickY >= item.top - 4 &&
        clickY <= item.top + item.height + 4
    );

    if (directHit) {
      onSyncToCode?.(directHit.str);
      return;
    }

    // 2. Nearest row within 30px vertically
    let closestItem: { str: string; left: number; top: number; width: number; height: number } | null = null;
    let minDistance = 30;
    for (const item of pdfPageData.textItems) {
      const centerY = item.top + item.height / 2;
      const dist = Math.abs(clickY - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        closestItem = item;
      }
    }

    if (closestItem) {
      onSyncToCode?.(closestItem.str);
    }
  };

  const handleIframeLoaded = () => {
    setLocalCompiling(false);
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.body) {
        const text = doc.body.innerText || '';
        if (text.includes('Bad form type')) {
          setLocalError('Compiler protocol error: form submission requires multipart/form-data.');
          return;
        }
        if (text.includes('! LaTeX Error') || text.includes('Fatal error') || text.includes('Emergency stop')) {
          setLocalError(extractLatexErrorMessage(text));
          setLocalLog(text);
          return;
        }
      }
    } catch {
      // Cross-origin PDF loaded successfully
      setLocalError(null);
    }
  };

  const handleDownloadClick = () => {
    if (activePdfUrl && activePdfUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = activePdfUrl;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (onDownload) {
      onDownload();
    } else if (downloadFormRef.current) {
      downloadFormRef.current.submit();
    }
  };

  const handleOpenLogs = () => {
    if (log) {
      setShowFullLog(!showFullLog);
    } else if (logFormRef.current) {
      logFormRef.current.submit();
    }
  };

  const handleDismissError = () => {
    setLocalError(null);
    onClearError?.();
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-0 select-none">
      {/* Hidden compilation form targeting the preview iframe with encType multipart/form-data */}
      <form
        ref={formRef}
        action="https://texlive.net/cgi-bin/latexcgi"
        method="POST"
        encType="multipart/form-data"
        target="latex-preview-frame"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="filename[]" value="document.tex" />
        <textarea name="filecontents[]" readOnly value={preparedCode} />
        <input type="hidden" name="engine" value="pdflatex" />
        <input type="hidden" name="return" value="pdf" />
      </form>

      {/* Hidden download form targeting new tab/window */}
      <form
        ref={downloadFormRef}
        action="https://texlive.net/cgi-bin/latexcgi"
        method="POST"
        encType="multipart/form-data"
        target="_blank"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="filename[]" value="document.tex" />
        <textarea name="filecontents[]" readOnly value={preparedCode} />
        <input type="hidden" name="engine" value="pdflatex" />
        <input type="hidden" name="return" value="pdf" />
      </form>

      {/* Hidden logs form targeting new tab */}
      <form
        ref={logFormRef}
        action="https://texlive.net/cgi-bin/latexcgi"
        method="POST"
        encType="multipart/form-data"
        target="_blank"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="filename[]" value="document.tex" />
        <textarea name="filecontents[]" readOnly value={preparedCode} />
        <input type="hidden" name="engine" value="pdflatex" />
        <input type="hidden" name="return" value="log" />
      </form>

      {/* Compiler Error Banner if compilation failed */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="shrink-0 bg-red-950/90 border-b border-red-800 text-red-100 px-4 py-3 text-xs shadow-lg z-20 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-semibold text-red-200 flex items-center gap-2">
                    <span>LaTeX Compilation Notice</span>
                    <span className="text-[10px] bg-red-800/60 px-1.5 py-0.5 rounded font-mono">pdflatex</span>
                  </div>
                  <pre className="mt-1 font-mono text-[11px] text-red-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto bg-black/40 p-2 rounded border border-red-900/50">
                    {error}
                  </pre>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenLogs}
                  className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded text-[11px] flex items-center gap-1 transition-colors border border-red-700/50 cursor-pointer"
                >
                  <Terminal className="w-3 h-3" />
                  <span>{showFullLog ? 'Hide Log' : 'View Log'}</span>
                </button>
                <button
                  onClick={handleDismissError}
                  className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline Log Expand */}
            {showFullLog && log && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 bg-black/70 p-3 rounded font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto border border-red-900/60 leading-relaxed whitespace-pre-wrap select-text"
              >
                {log}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-[#242f3d] relative">
        {/* Compiling Spinner Overlay */}
        <AnimatePresence>
          {isCompiling && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#121927]/60 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none"
            >
              <div className="bg-[#1c283c] border border-[#2e3e58] px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-white text-xs">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Compiling LaTeX source with TeX Live...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live PDF Preview Canvas */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            width: '800px',
            height: '1130px',
            transition: 'transform 0.15s ease-out',
          }}
          className="bg-white rounded shadow-2xl overflow-hidden shrink-0 border border-slate-300/40 relative"
        >
          {/* Target iframe for both Blob URL preview and direct multipart form responses - ALWAYS VISIBLE */}
          <iframe
            ref={iframeRef}
            id="latex-preview-frame"
            name="latex-preview-frame"
            src={activePdfUrl ? `${activePdfUrl}#toolbar=0&navpanes=0` : undefined}
            onLoad={handleIframeLoaded}
            className="w-full h-full border-0 bg-white block"
            title="Compiled LaTeX PDF Preview"
          />

          {/* Interactive Transparent Overlay for Tap-to-Sync SyncTeX */}
          {activePdfUrl && (
            <div
              onClick={handleResumePageClick}
              className="absolute inset-0 z-10 select-none overflow-hidden cursor-crosshair pointer-events-auto"
              title="Click or tap any text on the resume to jump the editor cursor to that exact line"
            >
              {/* Clickable text layer spans positioned over every word/line */}
              {pdfPageData?.textItems.map((item, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      setClickPin({
                        x: (e.clientX - rect.left) / zoom,
                        y: (e.clientY - rect.top) / zoom,
                      });
                      setTimeout(() => setClickPin(null), 1200);
                    }
                    onSyncToCode?.(item.str);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${item.left}px`,
                    top: `${item.top}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                  }}
                  title={`Tap to jump cursor to: "${item.str}"`}
                  className="cursor-pointer hover:bg-emerald-400/20 hover:outline hover:outline-1 hover:outline-emerald-400/60 rounded-xs transition-colors"
                />
              ))}

              {/* Interactive Locator Ping Pin */}
              {clickPin && (
                <div
                  style={{ left: `${clickPin.x}px`, top: `${clickPin.y}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-md"></span>
                  </span>
                </div>
              )}

              {/* Floating SyncTeX status badge */}
              <div className="absolute bottom-3 right-3 bg-[#111724]/90 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-medium shadow-lg backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Tap any text to jump to code</span>
              </div>
            </div>
          )}

          {/* Empty state placeholder when not yet compiled or error occurred with no previous PDF */}
          {!activePdfUrl && !isCompiling && (
            <div className="absolute inset-0 bg-[#141a24] text-slate-400 flex flex-col items-center justify-center p-8 text-center select-none pointer-events-none">
              <FileCode className="w-16 h-16 text-slate-600 mb-4 stroke-1" />
              <h3 className="text-sm font-semibold text-slate-300 mb-1">LaTeX Document Preview</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Ensure your document has <code className="text-emerald-400 font-mono">\begin&#123;document&#125;</code> and click{' '}
                <strong className="text-slate-300">Recompile</strong> (or press Ctrl+Enter) to generate your PDF.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
