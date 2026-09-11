import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, Terminal, Download, X, CheckCircle2, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { compileLatex, resolveLatexImports, revokePdfUrl, extractLatexErrorMessage, type CompileResult } from '@/lib/latexCompiler';

export { compileLatex, resolveLatexImports, revokePdfUrl, extractLatexErrorMessage };
export type { CompileResult };

export interface UniversalLatexCompilerProps {
  latexCode: string;
  pdfUrl?: string | null;
  isCompiling?: boolean;
  error?: string | null;
  log?: string | null;
  zoom?: number;
  onRecompile?: () => void;
  onDownload?: () => void;
  onClearError?: () => void;
  onCompileStart?: () => void;
  onCompileSuccess?: (result: CompileResult) => void;
  onCompileError?: (error: string, log: string | null) => void;
}

export const UniversalLatexCompiler: React.FC<UniversalLatexCompilerProps> = ({
  latexCode,
  pdfUrl: propPdfUrl,
  isCompiling: propIsCompiling,
  error: propError,
  log: propLog,
  zoom = 1,
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

  const preparedCode = resolveLatexImports(latexCode);

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
      const result = await compileLatex(preparedCode, controller.signal);
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
          {/* Target iframe for both Blob URL preview and direct multipart form responses */}
          <iframe
            ref={iframeRef}
            id="latex-preview-frame"
            name="latex-preview-frame"
            src={activePdfUrl ? `${activePdfUrl}#toolbar=0&navpanes=0` : undefined}
            onLoad={handleIframeLoaded}
            className="w-full h-full border-0 bg-white"
            title="Compiled LaTeX PDF Preview"
          />

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
