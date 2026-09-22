import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Briefcase, GraduationCap, Code, Code2, FolderGit2, Award, FileCheck,
  Sparkles, ZoomIn, ZoomOut, CheckCircle2, Trash2, Plus,
  Linkedin, Globe, Mail, Phone, MapPin, Search, AlertCircle, LayoutTemplate, ArrowRight,
  FileCode, Folder, FileText, Upload, RefreshCw, Download, Layers, History, Layout, Share2,
  ChevronDown, Type, Bold, Italic, List, Quote, Link2, Omega, Settings, Eye, ChevronRight,
  FolderPlus, FilePlus, Edit3, X, Check, MoreVertical, HelpCircle, Terminal,
  Printer, Scissors, Copy, Clipboard, Maximize2, Undo2, Redo2, FileDown, FolderOpen,
  Underline, BookOpen, Info, Crown, Save, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/app/types";
import { getTemplate, TEMPLATES, TemplateId } from "@/app/templates";
import { downloadResumePDF } from "@/lib/pdf-browser";
import { UniversalLatexCompiler, compileLatex, revokePdfUrl } from "@/app/components/builder/UniversalLatexCompiler";
import { FileTreePanel } from "./sidebar/FileTreePanel";
import { SearchPanel } from "./sidebar/SearchPanel";
import { HistoryPanel } from "./sidebar/HistoryPanel";
import { ReviewPanel } from "./sidebar/ReviewPanel";
import { CommentsPanel } from "./sidebar/CommentsPanel";
import { SymbolsPanel } from "./sidebar/SymbolsPanel";
import { SettingsPanel } from "./sidebar/SettingsPanel";
import { HelpPanel } from "./sidebar/HelpPanel";
import {
  LatexProject,
  loadProject,
  saveProject,
  setMainFileInProject,
  createFileInProject,
  EditorSettings,
} from "@/lib/projectState";

// --- Overleaf Style Green Clover Logo SVG ---
function OverleafLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" fill="#16a34a" />
      <circle cx="21" cy="11" r="7" fill="#22c55e" opacity="0.9" />
      <circle cx="11" cy="21" r="7" fill="#15803d" opacity="0.9" />
      <circle cx="21" cy="21" r="7" fill="#16a34a" />
      <circle cx="16" cy="16" r="3.5" fill="#ffffff" />
    </svg>
  );
}

// --- LaTeX Generator Helper ---
function dataToLaTeX(data: ResumeData, customTitle?: string): string {
  if (data.latexCode && data.latexCode.trim()) {
    return data.latexCode;
  }
  const name = data.personalInfo?.fullName || "Your Name";
  const title = customTitle || data.personalInfo?.title || "Curriculum Vitae";
  const email = data.personalInfo?.email || "email@example.com";
  const phone = data.personalInfo?.phone || "";
  const location = data.personalInfo?.location || "";
  const summary = data.summary || "Experienced professional dedicated to building high quality solutions.";
  const skills = data.skills || "JavaScript, TypeScript, React, Node.js, Python, Git";

  return `\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=0.75in}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{${name}}}\\\\[4pt]
  {\\large ${title}}\\\\[4pt]
  \\small ${email} ${phone ? `| ${phone}` : ''} ${location ? `| ${location}` : ''}
\\end{center}

\\vspace{8pt}

\\section*{Professional Summary}
${summary}

\\section*{Skills}
${skills}

\\section*{Experience}
\\textbf{Senior Engineer} \\hfill 2022 -- Present\\\\
\\textit{Tech Innovations Inc.}
\\begin{itemize}[noitemsep,topsep=2pt]
  \\item Spearheaded core system development and optimized latency by 35\\%.
  \\item Collaborated with cross-functional teams to deliver production features.
\\end{itemize}

\\section*{Education}
\\textbf{B.S. in Computer Science} \\hfill 2018 -- 2022\\\\
\\textit{University of Technology}

\\end{document}
`;
}

function parseLaTeXData(code: string, currentData: ResumeData): ResumeData {
  const extractVal = (tag: string): string => {
    const match = code.match(new RegExp(`\\\\${tag}\\{([^}]*)\\}`));
    return match ? match[1].trim() : "";
  };

  const title = extractVal("title");
  const author = extractVal("author");
  const introMatch = code.match(/\\section\*?\{([^}]*)\}\s*([^\\#]*)/i);
  const summary = introMatch ? introMatch[2].trim() : currentData.summary;

  return {
    ...currentData,
    latexCode: code,
    personalInfo: {
      ...currentData.personalInfo,
      title: title || currentData.personalInfo?.title || "",
      fullName: author || currentData.personalInfo?.fullName || "",
    },
    summary: summary || currentData.summary || "",
  };
}

export function Step2Profile({
  data,
  onChange,
  onNext,
  onBack,
  projectTitle,
  onUpgrade,
  isPremium,
}: {
  data: ResumeData;
  onChange: (d: Partial<ResumeData>) => void;
  onNext?: () => void;
  onBack: () => void;
  projectTitle?: string;
  onUpgrade?: () => void;
  isPremium?: boolean;
}) {
  const initialTitle = projectTitle || data.personalInfo?.title || "Resume";
  type SidebarTab = "files" | "search" | "history" | "review" | "comments" | "symbols" | "help" | "settings";
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab | null>("files");

  const [projectName, setProjectName] = useState<string>(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [codeText, setCodeText] = useState<string>(() => data.latexCode || dataToLaTeX(data, initialTitle));
  const codeTextRef = useRef<string>(codeText);
  codeTextRef.current = codeText;

  const [project, setProject] = useState<LatexProject>(() => {
    const initialCode = data.latexCode || dataToLaTeX(data, initialTitle);
    const userKey = data.personalInfo?.email || "default";
    const loaded = loadProject(userKey, initialTitle, initialCode);
    const mainFile = loaded.files.find((f) => f.id === loaded.mainFileId);
    if (mainFile && !mainFile.content) {
      mainFile.content = initialCode;
    }
    return loaded;
  });

  // Save project to storage whenever it changes
  useEffect(() => {
    const userKey = data.personalInfo?.email || "default";
    saveProject(userKey, project);
  }, [project, data.personalInfo?.email]);

  const handleSelectFile = (fileId: string) => {
    const target = project.files.find((f) => f.id === fileId);
    if (!target || target.type === "folder") return;
    setProject((prev) => ({
      ...prev,
      activeFileId: fileId,
      openFileIds: prev.openFileIds.includes(fileId) ? prev.openFileIds : [...prev.openFileIds, fileId],
    }));
    setCodeText(target.content || "");
    codeTextRef.current = target.content || "";
  };

  const handleCloseFileTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.openFileIds.length <= 1) return;
    const nextOpen = project.openFileIds.filter((id) => id !== fileId);
    const nextActive = project.activeFileId === fileId ? nextOpen[nextOpen.length - 1] : project.activeFileId;
    const targetFile = project.files.find((f) => f.id === nextActive);

    setProject((prev) => ({
      ...prev,
      openFileIds: nextOpen,
      activeFileId: nextActive,
    }));
    if (targetFile) {
      setCodeText(targetFile.content || "");
      codeTextRef.current = targetFile.content || "";
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      handleCodeChange(codeText + "\n" + snippet);
      return;
    }
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = codeText.substring(0, start);
    const after = codeText.substring(end);
    const newCode = before + snippet + after;
    handleCodeChange(newCode);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  const handleNavigateLine = (lineNumber: number, hint?: string) => {
    if (viewMode !== "code") {
      setViewMode("code");
    }
    const currentLines = codeText.split("\n");
    const lineIdx = Math.max(0, Math.min(currentLines.length - 1, lineNumber - 1));
    setHighlightedLine(lineIdx);

    setSyncToast({
      line: lineNumber,
      text: hint || currentLines[lineIdx]?.trim() || `Line ${lineNumber}`,
    });

    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedLine(null);
      setSyncToast(null);
    }, 2500);

    const lineHeight = 24;
    const targetScrollTop = Math.max(0, lineIdx * lineHeight - 150);

    let charOffset = 0;
    for (let i = 0; i < lineIdx; i++) {
      charOffset += currentLines[i].length + 1;
    }
    const lineLength = currentLines[lineIdx]?.length || 0;

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(charOffset, charOffset + lineLength);
      }
      if (gutterRef.current) {
        gutterRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
      }
      if (highlightRef.current) {
        highlightRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
      }
    }, 50);
  };

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const compileSeqRef = useRef<number>(0);
  const activePdfUrlRef = useRef<string | null>(null);

  const [viewMode, setViewMode] = useState<"code" | "visual">("code");
  const [layoutMode, setLayoutMode] = useState<"split" | "editor" | "preview">("split");
  const [zoom, setZoom] = useState<number>(0.85);
  type MenuType = "file" | "edit" | "insert" | "view" | "format" | "help" | null;
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Modals & temporary document states
  const [showSaveAsModal, setShowSaveAsModal] = useState<boolean>(false);
  const [saveAsName, setSaveAsName] = useState<string>("");
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showNewConfirmModal, setShowNewConfirmModal] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const openFileInputRef = useRef<HTMLInputElement>(null);

  // Undo/Redo history tracking
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isUndoRedoRef = useRef<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [previewModeType, setPreviewModeType] = useState<"article" | "resume">("article");
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Pane resizing splitter state
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage: 15% - 85%
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Splitter mouse drag handler
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const totalWidth = rect.width;
      if (totalWidth <= 0) return;

      let percent = (newWidth / totalWidth) * 100;
      percent = Math.max(15, Math.min(85, percent));
      setSplitRatio(percent);
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplitter]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // SyncTeX active highlighted line & floating feedback toast
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [syncToast, setSyncToast] = useState<{ line: number; text: string } | null>(null);
  const highlightTimeoutRef = useRef<any>(null);

  // Reverse Search (SyncTeX): Tap/click any text on the resume preview -> jump cursor to that exact LaTeX line/input
  const handleSyncToCode = (targetText: string) => {
    if (!targetText || !targetText.trim()) return;
    const cleanTarget = targetText.trim();
    const currentLines = codeText.split("\n");

    let matchLineIndex = -1;
    let matchStartOffset = 0;
    let matchEndOffset = 0;

    const lowerTarget = cleanTarget.toLowerCase();

    // Strategy 1: Exact substring match in line
    for (let i = 0; i < currentLines.length; i++) {
      const lineLower = currentLines[i].toLowerCase();
      const idx = lineLower.indexOf(lowerTarget);
      if (idx !== -1) {
        matchLineIndex = i;
        matchStartOffset = currentLines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0) + idx;
        matchEndOffset = matchStartOffset + cleanTarget.length;
        break;
      }
    }

    // Strategy 2: Section header match (handles \section, \sectiontitle, \cvsection, % SECTION)
    if (matchLineIndex === -1) {
      for (let i = 0; i < currentLines.length; i++) {
        const secMatch = currentLines[i].match(/\\(?:section|sectiontitle|cvsection|title)\*?\{([^}]+)\}/i);
        if (secMatch) {
          const secName = secMatch[1].trim().toLowerCase();
          if (secName.includes(lowerTarget) || lowerTarget.includes(secName)) {
            matchLineIndex = i;
            matchStartOffset = currentLines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0);
            matchEndOffset = matchStartOffset + currentLines[i].length;
            break;
          }
        }
        // Also check section comments like % ABOUT ME or % EDUCATION
        if (currentLines[i].trim().startsWith("%")) {
          const commentContent = currentLines[i].replace(/^%+\s*/, "").trim().toLowerCase();
          if (commentContent && (commentContent === lowerTarget || commentContent.includes(lowerTarget))) {
            matchLineIndex = i;
            matchStartOffset = currentLines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0);
            matchEndOffset = matchStartOffset + currentLines[i].length;
            break;
          }
        }
      }
    }

    // Strategy 3: Multi-word token overlap (handles LaTeX commands like \textbf, \textit, \&, etc.)
    if (matchLineIndex === -1) {
      const words = lowerTarget
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9]/g, ""))
        .filter((w) => w.length >= 3);

      if (words.length > 0) {
        let bestLine = -1;
        let maxMatches = 0;

        for (let i = 0; i < currentLines.length; i++) {
          const lineClean = currentLines[i].toLowerCase();
          let count = 0;
          for (const word of words) {
            if (lineClean.includes(word)) count++;
          }
          if (count > maxMatches) {
            maxMatches = count;
            bestLine = i;
          }
        }

        if (bestLine !== -1 && maxMatches >= Math.min(2, words.length)) {
          matchLineIndex = bestLine;
          matchStartOffset = currentLines.slice(0, bestLine).join("\n").length + (bestLine > 0 ? 1 : 0);
          matchEndOffset = matchStartOffset + currentLines[bestLine].length;
        }
      }
    }

    // Strategy 4: Fallback to first significant word
    if (matchLineIndex === -1) {
      const words = lowerTarget
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9]/g, ""))
        .filter((w) => w.length >= 4);

      for (const w of words) {
        for (let i = 0; i < currentLines.length; i++) {
          if (currentLines[i].toLowerCase().includes(w)) {
            matchLineIndex = i;
            matchStartOffset = currentLines.slice(0, i).join("\n").length + (i > 0 ? 1 : 0);
            matchEndOffset = matchStartOffset + currentLines[i].length;
            break;
          }
        }
        if (matchLineIndex !== -1) break;
      }
    }

    if (matchLineIndex !== -1) {
      // Switch to code view if currently in visual mode to show the cursor
      if (viewMode !== "code") {
        setViewMode("code");
      }

      setHighlightedLine(matchLineIndex);
      setSyncToast({
        line: matchLineIndex + 1,
        text: cleanTarget.length > 32 ? cleanTarget.slice(0, 32) + "..." : cleanTarget,
      });

      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedLine(null);
        setSyncToast(null);
      }, 2500);

      // Scroll editor so target line is centered, place cursor, and focus
      const lineHeight = 24;
      const targetScrollTop = Math.max(0, matchLineIndex * lineHeight - 150);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(matchStartOffset, matchEndOffset);
        }
        if (gutterRef.current) {
          gutterRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
        }
        if (highlightRef.current) {
          highlightRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
        }
      }, 50);
    }
  };

  // Synchronize scrolling between code textarea, highlighted overlay, and line number gutter
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const [recompileTrigger, setRecompileTrigger] = useState<number>(0);

  // True LaTeX Recompile handler connected to LaTeX engine
  const handleRecompile = () => {
    setRecompileTrigger((prev) => prev + 1);
  };

  // Compile on initial mount
  useEffect(() => {
    handleRecompile();
    return () => {
      if (activePdfUrlRef.current) {
        revokePdfUrl(activePdfUrlRef.current);
      }
    };
  }, []);

  const handleCodeChange = (newCode: string) => {
    if (!isUndoRedoRef.current && newCode !== codeTextRef.current) {
      undoStackRef.current.push(codeTextRef.current);
      if (undoStackRef.current.length > 50) undoStackRef.current.shift();
      redoStackRef.current = [];
    }
    setCodeText(newCode);
    codeTextRef.current = newCode;
    setProject((prev) => ({
      ...prev,
      files: prev.files.map((f) =>
        f.id === prev.activeFileId ? { ...f, content: newCode, updatedAt: Date.now() } : f
      ),
    }));
    if (project.activeFileId === project.mainFileId) {
      const updated = parseLaTeXData(newCode, data);
      const effectiveTitle = projectName || data.personalInfo?.title || "Untitled Resume";
      updated.personalInfo = {
        ...updated.personalInfo,
        title: effectiveTitle,
      };
      onChange(updated);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const a = document.createElement('a');
      const blobUrl = URL.createObjectURL(pdfBlob);
      a.href = blobUrl;
      const safeTitle = (projectName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } else {
      downloadResumePDF(data, selectedTemplate);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // --- Document Actions ---
  const handleSave = () => {
    const userKey = data.personalInfo?.email || "default";
    saveProject(userKey, project);
    const effectiveTitle = projectName || data.personalInfo?.title || "Untitled Resume";
    const updated: ResumeData = {
      ...data,
      latexCode: codeTextRef.current,
      personalInfo: {
        ...data.personalInfo,
        title: effectiveTitle,
      },
    };
    onChange(updated);
    setSaveToast("Document saved to your dashboard");
    setTimeout(() => setSaveToast(null), 2000);
  };

  const handleExitToDashboard = () => {
    const userKey = data.personalInfo?.email || "default";
    saveProject(userKey, project);
    const effectiveTitle = projectName || data.personalInfo?.title || "Untitled Resume";
    const updated: ResumeData = {
      ...data,
      latexCode: codeTextRef.current,
      personalInfo: {
        ...data.personalInfo,
        title: effectiveTitle,
      },
    };
    onChange(updated);
    onBack();
  };

  const handleConfirmSaveAs = () => {
    if (!saveAsName.trim()) return;
    const newTitle = saveAsName.trim();
    setProjectName(newTitle);
    setProject((prev) => {
      const updated = { ...prev, name: newTitle };
      const userKey = data.personalInfo?.email || "default";
      saveProject(userKey, updated);
      return updated;
    });
    setShowSaveAsModal(false);
    setSaveToast(`Saved project as "${newTitle}"`);
    setTimeout(() => setSaveToast(null), 2000);
  };

  const handleNewDocument = () => {
    const emptyLatex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{New Document}
\\author{${data.personalInfo?.fullName || "Author Name"}}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Start typing your document here...

\\end{document}`;
    handleCodeChange(emptyLatex);
    setShowNewConfirmModal(false);
    handleRecompile();
    setSaveToast("Created new document");
    setTimeout(() => setSaveToast(null), 2000);
  };

  const handleOpenTexFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const fileName = file.name.replace(/\.tex$/i, "") || "Imported Document";
        setProjectName(fileName);
        handleCodeChange(content);
        handleRecompile();
        setSaveToast(`Imported "${file.name}"`);
        setTimeout(() => setSaveToast(null), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadTex = () => {
    const blob = new Blob([codeText], { type: "text/x-tex;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    const safeTitle = (projectName || "resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `${safeTitle}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  };

  const handlePrint = () => {
    if (pdfBlob) {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      };
    } else {
      window.print();
    }
  };

  // --- Editor Selection & Transformation Helpers ---
  const wrapSelection = (beforeStr: string, afterStr: string, defaultText = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = codeText.substring(start, end) || defaultText;
    const replacement = `${beforeStr}${selected}${afterStr}`;
    const newCode = codeText.substring(0, start) + replacement + codeText.substring(end);
    handleCodeChange(newCode);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + beforeStr.length, start + beforeStr.length + selected.length);
    }, 10);
  };

  const transformSelectedLines = (transform: (line: string) => string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    const lineStart = codeText.lastIndexOf("\n", start - 1) + 1;
    const tempEnd = codeText.indexOf("\n", end);
    const lineEnd = tempEnd === -1 ? codeText.length : tempEnd;

    const selectedBlock = codeText.substring(lineStart, lineEnd);
    const transformedBlock = selectedBlock.split("\n").map(transform).join("\n");

    const newCode = codeText.substring(0, lineStart) + transformedBlock + codeText.substring(lineEnd);
    handleCodeChange(newCode);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(lineStart, lineStart + transformedBlock.length);
    }, 10);
  };

  // --- Edit Actions ---
  const handleUndo = () => {
    if (undoStackRef.current.length > 0) {
      const prev = undoStackRef.current.pop()!;
      redoStackRef.current.push(codeTextRef.current);
      isUndoRedoRef.current = true;
      handleCodeChange(prev);
      isUndoRedoRef.current = false;
    } else {
      textareaRef.current?.focus();
      document.execCommand("undo");
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length > 0) {
      const next = redoStackRef.current.pop()!;
      undoStackRef.current.push(codeTextRef.current);
      isUndoRedoRef.current = true;
      handleCodeChange(next);
      isUndoRedoRef.current = false;
    } else {
      textareaRef.current?.focus();
      document.execCommand("redo");
    }
  };

  const handleCut = async () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;
    const selected = codeText.substring(start, end);
    try {
      await navigator.clipboard.writeText(selected);
    } catch {
      document.execCommand("copy");
    }
    const newCode = codeText.substring(0, start) + codeText.substring(end);
    handleCodeChange(newCode);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, start);
    }, 10);
  };

  const handleCopy = async () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;
    const selected = codeText.substring(start, end);
    try {
      await navigator.clipboard.writeText(selected);
      setSaveToast("Copied to clipboard");
      setTimeout(() => setSaveToast(null), 1500);
    } catch {
      document.execCommand("copy");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInsertSnippet(text);
      }
    } catch {
      textareaRef.current?.focus();
      document.execCommand("paste");
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard Shortcuts & Click Outside Menu listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setShowShortcutsModal(false);
        setShowAboutModal(false);
        setShowSaveAsModal(false);
        setShowNewConfirmModal(false);
      } else if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "s") {
          e.preventDefault();
          handleSave();
        } else if (key === "p" && !e.shiftKey) {
          e.preventDefault();
          handlePrint();
        } else if (key === "f") {
          e.preventDefault();
          setActiveSidebarTab("search");
        } else if (key === "h") {
          e.preventDefault();
          setActiveSidebarTab("search");
        } else if (key === "/" || (key === "?" && e.shiftKey)) {
          e.preventDefault();
          setShowShortcutsModal((prev) => !prev);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, codeText, data, pdfBlob]);

  // Extract sections for outline
  const parsedSections = React.useMemo(() => {
    const matches = [...codeText.matchAll(/\\section\*?\{([^}]+)\}/g)];
    if (matches.length > 0) {
      return matches.map((m) => m[1].trim());
    }
    return ["Document"];
  }, [codeText]);

  // Extract metadata from code for visual view
  const compiledTitle = React.useMemo(() => {
    const match = codeText.match(/\\title\{([^}]*)\}/);
    return match ? match[1].trim() : projectName;
  }, [codeText, projectName]);

  const compiledAuthor = React.useMemo(() => {
    const match = codeText.match(/\\author\{([^}]*)\}/);
    return match ? match[1].trim() : data.personalInfo?.fullName || "";
  }, [codeText, data.personalInfo?.fullName]);

  const compiledDate = React.useMemo(() => {
    const match = codeText.match(/\\date\{([^}]*)\}/);
    return match ? match[1].trim() : "";
  }, [codeText]);

  const compiledIntro = React.useMemo(() => {
    const match = codeText.match(/\\section\*?\{([^}]*)\}\s*([\s\S]*?)(?=\\section|\\end\{document\}|$)/i);
    return match && match[2].trim() ? match[2].trim() : (data.summary || "");
  }, [codeText, data.summary]);

  const lines = codeText.split("\n");

  const SelectedTemplateComponent = getTemplate(selectedTemplate).component;

  // Syntax highlighting renderer
  const renderHighlightedCode = () => {
    return lines.map((line, lIdx) => {
      const commentIdx = line.indexOf("%");
      const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
      const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : "";

      const tokenRegex = /(\\[a-zA-Z]+)|(\{([^}]*)\})|([{}])/g;
      let lastIndex = 0;
      const tokens: React.ReactNode[] = [];
      let match;

      while ((match = tokenRegex.exec(codePart)) !== null) {
        if (match.index > lastIndex) {
          tokens.push(codePart.slice(lastIndex, match.index));
        }
        if (match[1]) {
          // Command like \documentclass, \usepackage, \title, etc. -> pink/magenta
          tokens.push(
            <span key={`${lIdx}-${match.index}-cmd`} className="text-[#e879f9] font-medium">
              {match[1]}
            </span>
          );
        } else if (match[2]) {
          // Argument {article}, {graphicx}, etc. -> cyan
          tokens.push(
            <span key={`${lIdx}-${match.index}-arg`} className="text-cyan-400">
              <span className="text-slate-400">{"{"}</span>
              <span className="text-cyan-300">{match[3]}</span>
              <span className="text-slate-400">{"}"}</span>
            </span>
          );
        } else if (match[4]) {
          tokens.push(
            <span key={`${lIdx}-${match.index}-br`} className="text-slate-400">
              {match[4]}
            </span>
          );
        }
        lastIndex = tokenRegex.lastIndex;
      }
      if (lastIndex < codePart.length) {
        tokens.push(codePart.slice(lastIndex));
      }

      const isCurrentHighlighted = lIdx === highlightedLine;
      return (
        <div
          key={lIdx}
          className={`leading-6 min-h-[1.5rem] whitespace-pre transition-colors duration-200 ${
            isCurrentHighlighted
              ? "bg-emerald-500/25 -mx-4 px-4 rounded border-l-4 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
              : ""
          }`}
        >
          {tokens}
          {commentPart && <span className="text-[#64748b] italic">{commentPart}</span>}
          {line.length === 0 && "\u00A0"}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d131f] text-slate-200 font-sans overflow-hidden select-none">
      {/* ----------------- 1. TOP OVERLEAF NAVBAR ----------------- */}
      <header className="h-11 bg-[#131b29] border-b border-[#233045] px-3 flex items-center justify-between z-30 shrink-0 text-xs">
        {/* Left Menu Items */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitToDashboard}
            title="Back to All Projects"
            className="flex items-center gap-2 pr-3 py-0.5 border-r border-[#233045] hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <OverleafLogo size={22} />
            <span className="text-slate-300 group-hover:text-white font-medium flex items-center gap-1 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              Projects
            </span>
          </button>

          {/* Top Menu Bar with Functional Dropdowns */}
          <div ref={menuContainerRef} className="relative flex items-center gap-0.5 text-slate-300 font-medium">
            {/* Hidden File Input for Open... */}
            <input
              type="file"
              ref={openFileInputRef}
              accept=".tex,text/plain"
              className="hidden"
              onChange={handleOpenTexFile}
            />

            {/* 1. FILE MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}
                onMouseEnter={() => { if (activeMenu) setActiveMenu("file"); }}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeMenu === "file" ? "bg-[#1f2b3e] text-white" : "text-slate-300 hover:text-white hover:bg-[#1a2436]"
                }`}
              >
                File
              </button>
              {activeMenu === "file" && (
                <div className="absolute top-8 left-0 w-56 bg-[#162031] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                  <button
                    onClick={() => { setActiveMenu(null); setShowNewConfirmModal(true); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
                      New Document
                    </span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); openFileInputRef.current?.click(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                      Open .tex File...
                    </span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); handleSave(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      Save
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); setSaveAsName(projectName); setShowSaveAsModal(true); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileDown className="w-3.5 h-3.5 text-slate-400" />
                      Save As...
                    </span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); handleDownloadTex(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      Download .tex
                    </span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleDownload(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Download PDF
                    </span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handlePrint(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Printer className="w-3.5 h-3.5 text-indigo-400" />
                      Print
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); handleRecompile(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                      Recompile
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+Enter</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleExitToDashboard(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      Close to Dashboard
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Esc</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. EDIT MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === "edit" ? null : "edit")}
                onMouseEnter={() => { if (activeMenu) setActiveMenu("edit"); }}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeMenu === "edit" ? "bg-[#1f2b3e] text-white" : "text-slate-300 hover:text-white hover:bg-[#1a2436]"
                }`}
              >
                Edit
              </button>
              {activeMenu === "edit" && (
                <div className="absolute top-8 left-0 w-52 bg-[#162031] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                  <button
                    onClick={() => { setActiveMenu(null); handleUndo(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Undo2 className="w-3.5 h-3.5 text-slate-300" />
                      Undo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+Z</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleRedo(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Redo2 className="w-3.5 h-3.5 text-slate-300" />
                      Redo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); handleCut(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-slate-300" />
                      Cut
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleCopy(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      Copy
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handlePaste(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Clipboard className="w-3.5 h-3.5 text-slate-300" />
                      Paste
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleSelectAll(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5 text-slate-300" />
                      Select All
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); setActiveSidebarTab("search"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-amber-400" />
                      Find
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+F</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); setActiveSidebarTab("search"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-amber-400" />
                      Find & Replace
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+H</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. INSERT MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === "insert" ? null : "insert")}
                onMouseEnter={() => { if (activeMenu) setActiveMenu("insert"); }}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeMenu === "insert" ? "bg-[#1f2b3e] text-white" : "text-slate-300 hover:text-white hover:bg-[#1a2436]"
                }`}
              >
                Insert
              </button>
              {activeMenu === "insert" && (
                <div className="absolute top-8 left-0 w-56 bg-[#162031] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                  <button
                    onClick={() => { setActiveMenu(null); handleInsertSnippet("\\section{Section Title}\n"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Section</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\section</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleInsertSnippet("\\subsection{Subsection Title}\n"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Subsection</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\subsection</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleInsertSnippet("\\subsubsection{Subsubsection Title}\n"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Subsubsection</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\subsubsection</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); handleInsertSnippet("\\textbf{Bold Text}"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-bold">Bold Text</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\textbf</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleInsertSnippet("\\textit{Italic Text}"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="italic">Italic Text</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\textit</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\begin{itemize}\n  \\item First item\n  \\item Second item\n\\end{itemize}\n");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Bullet List</span>
                    <span className="text-[10px] text-slate-400 font-mono">itemize</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\begin{enumerate}\n  \\item First item\n  \\item Second item\n\\end{enumerate}\n");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Numbered List</span>
                    <span className="text-[10px] text-slate-400 font-mono">enumerate</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\begin{tabular}{|c|c|}\n  \\hline\n  Header 1 & Header 2 \\\\\n  \\hline\n  Cell 1 & Cell 2 \\\\\n  \\hline\n\\end{tabular}\n");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Table</span>
                    <span className="text-[10px] text-slate-400 font-mono">tabular</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\includegraphics[width=\\textwidth]{image.png}\n");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Image</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\includegraphics</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\href{https://example.com}{Link Text}");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Link</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\href</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\[\n  x = y\n\\]\n");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Math Equation</span>
                    <span className="text-[10px] text-slate-400 font-mono">\\[ ... \\]</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      handleInsertSnippet("\\begin{verbatim}\nCode here\n\\end{verbatim}\n");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Code Block</span>
                    <span className="text-[10px] text-slate-400 font-mono">verbatim</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. VIEW MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === "view" ? null : "view")}
                onMouseEnter={() => { if (activeMenu) setActiveMenu("view"); }}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeMenu === "view" ? "bg-[#1f2b3e] text-white" : "text-slate-300 hover:text-white hover:bg-[#1a2436]"
                }`}
              >
                View
              </button>
              {activeMenu === "view" && (
                <div className="absolute top-8 left-0 w-52 bg-[#162031] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setZoom((prev) => Math.min(2.0, +(prev + 0.1).toFixed(2)));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                      Zoom In
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">+10%</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setZoom((prev) => Math.max(0.4, +(prev - 0.1).toFixed(2)));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ZoomOut className="w-3.5 h-3.5 text-amber-400" />
                      Zoom Out
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">-10%</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setZoom(1.0);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      Reset Zoom
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">100%</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); toggleFullscreen(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                      Toggle Fullscreen
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">F11</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setActiveSidebarTab((prev) => (prev ? null : "files"));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-violet-400" />
                      Toggle Sidebar
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{activeSidebarTab ? "Hide" : "Show"}</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); setLayoutMode("split"); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#202d44] flex items-center justify-between cursor-pointer ${
                      layoutMode === "split" ? "text-emerald-400 font-medium bg-[#1d2a3d]" : "text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5" />
                      Split View
                    </span>
                    {layoutMode === "split" && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); setLayoutMode("editor"); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#202d44] flex items-center justify-between cursor-pointer ${
                      layoutMode === "editor" ? "text-emerald-400 font-medium bg-[#1d2a3d]" : "text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      Editor Only
                    </span>
                    {layoutMode === "editor" && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); setLayoutMode("preview"); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#202d44] flex items-center justify-between cursor-pointer ${
                      layoutMode === "preview" ? "text-emerald-400 font-medium bg-[#1d2a3d]" : "text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5" />
                      Preview Only
                    </span>
                    {layoutMode === "preview" && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* 5. FORMAT MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === "format" ? null : "format")}
                onMouseEnter={() => { if (activeMenu) setActiveMenu("format"); }}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeMenu === "format" ? "bg-[#1f2b3e] text-white" : "text-slate-300 hover:text-white hover:bg-[#1a2436]"
                }`}
              >
                Format
              </button>
              {activeMenu === "format" && (
                <div className="absolute top-8 left-0 w-52 bg-[#162031] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                  <button
                    onClick={() => { setActiveMenu(null); wrapSelection("\\textbf{", "}"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <Bold className="w-3.5 h-3.5" />
                      Bold
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">\\textbf</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); wrapSelection("\\textit{", "}"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 italic">
                      <Italic className="w-3.5 h-3.5" />
                      Italic
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">\\textit</span>
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); wrapSelection("\\underline{", "}"); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2 underline">
                      <Underline className="w-3.5 h-3.5" />
                      Underline
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">\\underline</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      transformSelectedLines((l) => (l.trim().length > 0 ? (l.startsWith("%") ? l : `% ${l}`) : l));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-slate-400" />
                      Comment
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">%</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      transformSelectedLines((l) => l.replace(/^%\s?/, ""));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      Uncomment
                    </span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      transformSelectedLines((l) => `  ${l}`);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      Indent
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Tab</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      transformSelectedLines((l) => (l.startsWith("  ") ? l.slice(2) : l.startsWith(" ") ? l.slice(1) : l));
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
                      Outdent
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Shift+Tab</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. HELP MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === "help" ? null : "help")}
                onMouseEnter={() => { if (activeMenu) setActiveMenu("help"); }}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-medium cursor-pointer ${
                  activeMenu === "help" ? "bg-[#1f2b3e] text-white" : "text-slate-300 hover:text-white hover:bg-[#1a2436]"
                }`}
              >
                Help
              </button>
              {activeMenu === "help" && (
                <div className="absolute top-8 left-0 w-56 bg-[#162031] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      window.open("https://www.overleaf.com/learn", "_blank");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      Documentation
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Overleaf</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setActiveSidebarTab("symbols");
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Omega className="w-3.5 h-3.5 text-cyan-400" />
                      LaTeX Help & Symbols
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setShowShortcutsModal(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      Keyboard Shortcuts
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+/</span>
                  </button>
                  <div className="border-t border-[#23334d] my-1" />
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setShowLogModal(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Compiler Logs
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      setShowAboutModal(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      About Resume Studio
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 7. UPGRADE BUTTON */}
            <button
              onClick={() => {
                if (onUpgrade) {
                  onUpgrade();
                }
              }}
              className={`font-semibold px-2.5 py-1 rounded text-[11px] shadow-sm ml-1.5 transition-all flex items-center gap-1.5 cursor-pointer ${
                isPremium
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              }`}
            >
              <Crown className="w-3 h-3 text-amber-300" />
              <span>{isPremium ? "Pro Activated" : "Upgrade"}</span>
            </button>
          </div>
        </div>

        {/* Center Project Name Dropdown */}
        <div className="flex items-center gap-1 text-slate-200 font-medium cursor-pointer hover:bg-[#1f2b3e] px-3 py-1 rounded transition-colors">
          {isEditingTitle ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                const val = e.target.value;
                setProjectName(val);
              }}
              onBlur={() => {
                setIsEditingTitle(false);
                const clean = projectName.trim() || "Untitled Resume";
                setProjectName(clean);
                setProject((prev) => {
                  const updated = { ...prev, name: clean };
                  saveProject(data.personalInfo?.email || "default", updated);
                  return updated;
                });
                onChange({
                  ...data,
                  latexCode: codeTextRef.current,
                  personalInfo: { ...data.personalInfo, title: clean }
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                  const clean = projectName.trim() || "Untitled Resume";
                  setProjectName(clean);
                  setProject((prev) => {
                    const updated = { ...prev, name: clean };
                    saveProject(data.personalInfo?.email || "default", updated);
                    return updated;
                  });
                  onChange({
                    ...data,
                    latexCode: codeTextRef.current,
                    personalInfo: { ...data.personalInfo, title: clean }
                  });
                }
              }}
              autoFocus
              className="bg-[#121927] border border-[#2b3a52] rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div onClick={() => setIsEditingTitle(true)} className="flex items-center gap-1.5">
              <span className="text-sm">{projectName}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setActiveSidebarTab("history")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeSidebarTab === "history"
                ? "bg-[#1f2b3e] text-emerald-400 font-medium"
                : "text-slate-300 hover:text-white hover:bg-[#1f2b3e]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </button>

          {/* Layout Mode Selector */}
          <div className="flex items-center bg-[#192334] border border-[#2b3a52] rounded p-0.5">
            <button
              onClick={() => setLayoutMode("split")}
              className={`p-1 rounded text-xs transition-colors ${layoutMode === "split" ? "bg-[#253349] text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
              title="Split View (Code & Compiler)"
            >
              <Layout className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode("editor")}
              className={`p-1 rounded text-xs transition-colors ${layoutMode === "editor" ? "bg-[#253349] text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
              title="Editor Only"
            >
              <FileCode className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode("preview")}
              className={`p-1 rounded text-xs transition-colors ${layoutMode === "preview" ? "bg-[#253349] text-white font-semibold" : "text-slate-400 hover:text-slate-200"}`}
              title="Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            title="Save project changes (Ctrl+S)"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3 py-1 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors text-xs cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-blue-200" />
            <span>Save</span>
          </button>

          <button
            onClick={handleShare}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedShare ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </header>

      {/* ----------------- 2. MAIN WORKSPACE BODY ----------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ----- LEFTMOST DOCK (Overleaf Navigation Strip matching Image 2) ----- */}
        <div className="w-12 bg-[#0c1018] border-r border-[#233045] flex flex-col items-center py-2.5 justify-between shrink-0 select-none z-20">
          <div className="flex flex-col items-center gap-2.5 w-full px-1">
            {/* 1. Project Files Tab (Active Green Box with Bottom White Line, matching Image 2!) */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "files" ? null : "files")}
              title="Project Files & Outline"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "files"
                  ? "bg-[#15803d] text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "files" && (
                <div className="w-5 h-0.5 bg-white rounded-full mt-1 shrink-0" />
              )}
            </button>

            {/* 2. Search Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "search" ? null : "search")}
              title="Find in Files (Search)"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "search"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <Search className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "search" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>

            {/* 3. Code / History Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "history" ? null : "history")}
              title="History & Checkpoints"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "history"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <Code2 className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "history" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>

            {/* 4. Review / Track Changes Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "review" ? null : "review")}
              title="Review & ATS Analysis"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "review"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <Edit3 className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "review" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>

            {/* 5. Chat / Comments Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "comments" ? null : "comments")}
              title="Comments & Review Notes"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "comments"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <Quote className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "comments" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>

            {/* 6. AI / LaTeX Snippets Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "symbols" ? null : "symbols")}
              title="LaTeX Snippets & AI Assist"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "symbols"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "symbols" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>
          </div>

          {/* Bottom Dock Icons (Order matching Image 2: Help first, Settings bottom!) */}
          <div className="flex flex-col items-center gap-2.5 w-full px-1">
            {/* 7. Help Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "help" ? null : "help")}
              title="Help & Shortcuts"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "help"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "help" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>

            {/* 8. Settings Tab */}
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === "settings" ? null : "settings")}
              title="Project & Editor Settings"
              className={`w-full py-2 px-1 rounded-md transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                activeSidebarTab === "settings"
                  ? "bg-[#182335] text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#182335]"
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {activeSidebarTab === "settings" && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* ----- SIDEBAR CONTAINER ----- */}
        {activeSidebarTab && (
          <aside className="w-60 md:w-64 bg-[#111827] border-r border-[#233045] flex flex-col shrink-0 overflow-hidden select-none">
            {activeSidebarTab === "files" && (
              <FileTreePanel
                project={project}
                activeFileContent={codeText}
                onUpdateProject={setProject}
                onSelectFile={handleSelectFile}
                onCloseSidebar={() => setActiveSidebarTab(null)}
                onNavigateLine={handleNavigateLine}
              />
            )}
            {activeSidebarTab === "search" && (
              <SearchPanel
                project={project}
                onNavigateToResult={(fileId, line, q) => {
                  handleSelectFile(fileId);
                  handleNavigateLine(line, q);
                }}
              />
            )}
            {activeSidebarTab === "history" && (
              <HistoryPanel
                project={project}
                onUpdateProject={setProject}
              />
            )}
            {activeSidebarTab === "review" && (
              <ReviewPanel
                project={project}
                codeText={codeText}
                onInsertSnippet={handleInsertSnippet}
              />
            )}
            {activeSidebarTab === "comments" && (
              <CommentsPanel
                project={project}
                onNavigateLine={handleNavigateLine}
              />
            )}
            {activeSidebarTab === "symbols" && (
              <SymbolsPanel
                onInsertSnippet={handleInsertSnippet}
              />
            )}
            {activeSidebarTab === "help" && (
              <HelpPanel />
            )}
            {activeSidebarTab === "settings" && (
              <SettingsPanel
                project={project}
                onUpdateSettings={(newSettings) => setProject((prev) => ({ ...prev, settings: newSettings }))}
                onSelectMainFile={(newMainId) => setProject((prev) => setMainFileInProject(prev, newMainId))}
              />
            )}
          </aside>
        )}

        {/* ----- SPLIT CONTAINER (Code Editor + Center Splitter + PDF Preview) ----- */}
        <div ref={splitContainerRef} className="flex-1 flex min-w-0 h-full overflow-hidden relative">
          {/* Transparent Drag Shield to prevent iframe/textarea from capturing cursor events during resizing */}
          {isDraggingSplitter && (
            <div className="absolute inset-0 z-50 cursor-col-resize select-none bg-transparent" />
          )}

          {/* ----- MIDDLE PANE (Code & Visual Editor) ----- */}
          {(layoutMode === "split" || layoutMode === "editor") && (
            <main
              style={layoutMode === "split" ? { width: `${splitRatio}%`, flex: "none" } : { flex: 1 }}
              className="bg-[#141b27] border-r border-[#233045] flex flex-col min-w-0 h-full overflow-hidden"
            >
              {/* File Tab Header (Multi-File Tabs) */}
              <div className="h-9 bg-[#121927] border-b border-[#233045] px-2 flex items-center justify-between text-xs shrink-0 overflow-x-auto">
                <div className="flex items-center gap-1.5">
                  {project.openFileIds.map((fileId) => {
                    const f = project.files.find((item) => item.id === fileId);
                    if (!f) return null;
                    const isActive = project.activeFileId === fileId;
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleSelectFile(f.id)}
                        className={`px-3 py-1.5 rounded-t text-xs flex items-center gap-2 border-x border-[#233045] cursor-pointer transition-colors ${
                          isActive
                            ? "bg-[#141b27] text-slate-100 font-medium border-t-2 border-emerald-500"
                            : "bg-[#0f1522] text-slate-400 hover:text-slate-200 border-t border-transparent"
                        }`}
                      >
                        <FileCode className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                        <span className="font-mono text-[11px]">{f.name}</span>
                        {project.openFileIds.length > 1 && (
                          <X
                            onClick={(e) => handleCloseFileTab(f.id, e)}
                            className="h-3 w-3 opacity-40 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formatting Toolbar & Code/Visual Toggle */}
              <div className="h-9 bg-[#151e2c] border-b border-[#233045] px-3 flex items-center justify-between text-xs shrink-0 select-none overflow-hidden">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <button
                    onClick={() => {
                      document.execCommand("undo");
                    }}
                    title="Undo (Ctrl+Z)"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  </button>
                  <button
                    onClick={() => {
                      document.execCommand("redo");
                    }}
                    title="Redo (Ctrl+Y)"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-3.5 w-px bg-[#26354b] mx-0.5" />
                  <button
                    onClick={() => handleInsertSnippet("{\\large text}")}
                    title="Font size (\large)"
                    className="hover:text-white p-1 rounded font-serif font-bold text-xs cursor-pointer"
                  >
                    TT
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("\\textbf{}")}
                    title="Bold (\textbf{})"
                    className="hover:text-white p-1 rounded font-bold cursor-pointer"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("\\textit{}")}
                    title="Italic (\textit{})"
                    className="hover:text-white p-1 rounded italic cursor-pointer"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab("symbols")}
                    title="Insert LaTeX Symbols & Snippets"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <Omega className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("\\href{https://}{text}")}
                    title="Hyperlink (\href{})"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("% ")}
                    title="LaTeX Comment (%)"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("\\begin{figure}[h]\n  \\centering\n  \\includegraphics[width=0.5\\textwidth]{image.png}\n\\end{figure}\n")}
                    title="Insert Figure / Image"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("\\begin{tabular}{|l|r|}\n  \\hline\n  Item & Value \\\\\n  \\hline\n\\end{tabular}\n")}
                    title="Insert Table"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <Layout className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertSnippet("\\begin{itemize}\n  \\item First bullet\n  \\item Second bullet\n\\end{itemize}\n")}
                    title="Bullet List (\begin{itemize})"
                    className="hover:text-white p-1 rounded cursor-pointer"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Code vs Visual Pill Toggle matching Overleaf */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#0d131f] border border-[#26354b] rounded-full p-0.5 text-xs font-medium">
                    <button
                      onClick={() => setViewMode("code")}
                      className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
                        viewMode === "code"
                          ? "bg-[#16a34a] text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setViewMode("visual")}
                      className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
                        viewMode === "visual"
                          ? "bg-[#16a34a] text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Visual
                    </button>
                  </div>

                  <div
                    onClick={() => setActiveSidebarTab("review")}
                    className="flex items-center gap-1 text-slate-300 text-xs hover:bg-[#1e2a3c] px-2 py-1 rounded cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Editing</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </div>

                  <button
                    onClick={() => setActiveSidebarTab("search")}
                    title="Find and Replace"
                    className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Editor Content Area */}
              <div className="flex-1 overflow-hidden relative">
                {viewMode === "code" ? (
                  /* CODE MODE: Interactive LaTeX Code Editor with Line Numbers and Syntax Highlighting */
                  <div className="flex h-full font-mono text-xs overflow-hidden bg-[#111724]">
                    {/* Line Numbers Column */}
                    <div
                      ref={gutterRef}
                      className="w-10 bg-[#0f1521] text-slate-500 py-3 select-none text-right pr-3 font-mono border-r border-[#202b3d] shrink-0 overflow-hidden leading-6 text-xs"
                    >
                      {lines.map((_, idx) => (
                        <div
                          key={idx}
                          className={`leading-6 transition-colors duration-200 ${
                            idx === highlightedLine
                              ? "text-emerald-400 font-bold bg-emerald-950/70 border-r-2 border-emerald-400"
                              : ""
                          }`}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>

                    {/* Highlighted text layer & transparent editable textarea */}
                    <div className="relative flex-1 h-full overflow-hidden bg-[#111724]">
                      <div
                        ref={highlightRef}
                        className="absolute inset-0 p-3 pl-4 font-mono text-xs leading-6 pointer-events-none overflow-hidden select-none whitespace-pre text-slate-100"
                      >
                        {renderHighlightedCode()}
                      </div>

                      <textarea
                        ref={textareaRef}
                        value={codeText}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            handleRecompile();
                          }
                        }}
                        onScroll={handleEditorScroll}
                        spellCheck={false}
                        className="absolute inset-0 p-3 pl-4 font-mono text-xs leading-6 bg-transparent text-transparent caret-white resize-none focus:outline-none selection:bg-blue-600/40 selection:text-transparent whitespace-pre overflow-y-auto overflow-x-auto"
                      />

                      {/* Floating SyncTeX status toast */}
                      <AnimatePresence>
                        {syncToast && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0d1624]/95 border border-emerald-500/60 text-emerald-300 px-3.5 py-1.5 rounded-md shadow-2xl backdrop-blur-md text-xs flex items-center gap-2 pointer-events-none"
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-semibold text-white">Line {syncToast.line}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-emerald-200 font-mono text-[11px] truncate max-w-[200px]">
                              "{syncToast.text}"
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  /* VISUAL MODE: Form Editor */
                  <div className="h-full overflow-y-auto p-6 bg-[#121927]">
                    <div className="max-w-2xl mx-auto space-y-5">
                      <div className="flex items-center justify-between border-b border-[#233045] pb-3">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                          <span>Visual Settings</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                            Synchronized
                          </span>
                        </h2>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Document Title</label>
                          <input
                            type="text"
                            value={compiledTitle}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setProjectName(newTitle);
                              setCodeText((prev) => {
                                const updated = prev.includes("\\title{")
                                  ? prev.replace(/\\title\{[^}]*\}/, `\\title{${newTitle}}`)
                                  : `\\title{${newTitle}}\n` + prev;
                                codeTextRef.current = updated;
                                return updated;
                              });
                            }}
                            className="w-full bg-[#111724] border border-[#263750] rounded px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Author Name</label>
                          <input
                            type="text"
                            value={compiledAuthor}
                            onChange={(e) => {
                              const newAuthor = e.target.value;
                              setCodeText((prev) => {
                                const updated = prev.includes("\\author{")
                                  ? prev.replace(/\\author\{[^}]*\}/, `\\author{${newAuthor}}`)
                                  : `\\author{${newAuthor}}\n` + prev;
                                codeTextRef.current = updated;
                                return updated;
                              });
                            }}
                            className="w-full bg-[#111724] border border-[#263750] rounded px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Introduction Section</label>
                          <textarea
                            rows={6}
                            value={compiledIntro}
                            onChange={(e) => {
                              const newIntro = e.target.value;
                              setCodeText((prev) => {
                                const updated = prev.replace(/\\section\*?\{[^}]*\}[\s\S]*?(?=\\section|\\end\{document\}|$)/i, `\\section*{Introduction}\n${newIntro}\n\n`);
                                codeTextRef.current = updated;
                                return updated;
                              });
                            }}
                            className="w-full bg-[#111724] border border-[#263750] rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          )}

          {/* ----- CENTER RESIZER SPLITTER ----- */}
          {(layoutMode === "split") && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingSplitter(true);
              }}
              onDoubleClick={() => setSplitRatio(50)}
              title="Drag left/right to resize panes (Double-click to reset 50/50)"
              className={`w-2.5 bg-[#121927] border-x border-[#233045] flex items-center justify-center cursor-col-resize hover:bg-emerald-600/40 transition-colors relative z-20 select-none shrink-0 ${
                isDraggingSplitter ? "bg-emerald-600/60" : ""
              }`}
            >
              <div
                className={`bg-[#1b2536] border border-[#2b3a50] rounded-sm py-1.5 px-0.5 text-[8px] flex flex-col items-center shadow-md transition-colors ${
                  isDraggingSplitter ? "text-emerald-300 border-emerald-500" : "text-slate-400"
                }`}
              >
                <span>‹</span>
                <span>›</span>
              </div>
            </div>
          )}

          {/* ----- RIGHT PANE (Live Compiler Output & PDF Preview) ----- */}
          {(layoutMode === "split" || layoutMode === "preview") && (
            <div
              style={layoutMode === "split" ? { width: `calc(${100 - splitRatio}% - 10px)`, flex: "none" } : { flex: 1 }}
              className="bg-[#1a2332] flex flex-col min-w-0 h-full overflow-hidden relative"
            >
              {/* Compiler Header Controls Bar */}
              <div className="h-9 bg-[#121927] border-b border-[#233045] px-3 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecompile}
                    disabled={isCompiling}
                    className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1 rounded font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 text-xs cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isCompiling ? "animate-spin" : ""}`} />
                    <span>{isCompiling ? "Compiling..." : "Recompile"}</span>
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </button>

                  <button
                    onClick={() => setShowLogModal(true)}
                    title={compileError ? "Compiler Error (Click to view log)" : "View Compiler Logs"}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      compileError
                        ? "bg-red-900/70 text-red-200 hover:bg-red-800 hover:text-white"
                        : "bg-[#1c283c] hover:bg-[#25344d] text-slate-300 hover:text-white"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={handleDownload}
                    title="Download PDF"
                    className="p-1.5 rounded bg-[#1c283c] hover:bg-[#25344d] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                  {/* Template Mode Switch */}
                  <button
                    onClick={() => setPreviewModeType(previewModeType === "article" ? "resume" : "article")}
                    className="px-2 py-0.5 bg-[#1c283c] hover:bg-[#25344d] text-slate-300 rounded text-[11px] border border-[#2b3c54] cursor-pointer"
                  >
                    {previewModeType === "article" ? "LaTeX PDF View" : "Resume View"}
                  </button>
                </div>

                {/* Zoom & Page Count */}
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="flex items-center gap-1 bg-[#0d131f] border border-[#26354b] rounded px-1.5 py-0.5">
                    <button
                      onClick={() => setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.4))}
                      className="hover:text-white px-1 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[11px] w-8 text-center text-slate-200 font-mono">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 1.5))}
                      className="hover:text-white px-1 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Compiler Preview Canvas */}
              <div className="flex-1 min-h-0 relative flex flex-col">
                {previewModeType === "article" ? (
                  <UniversalLatexCompiler
                    key={recompileTrigger}
                    latexCode={project.files.find((f) => f.id === project.mainFileId)?.content || codeText}
                    projectFiles={project.files}
                    zoom={zoom}
                    onSyncToCode={handleSyncToCode}
                    onRecompile={handleRecompile}
                    onCompileStart={() => {
                      setIsCompiling(true);
                      setCompileError(null);
                    }}
                    onCompileSuccess={(result) => {
                      setIsCompiling(false);
                      setCompileError(null);
                      setCompileLog(result.log || null);
                      if (result.pdfBlob) setPdfBlob(result.pdfBlob);
                      if (result.pdfUrl) setPdfUrl(result.pdfUrl);
                      // Auto-save compiled output and code state to dashboard
                      const effectiveTitle = projectName || data.personalInfo?.title || "Untitled Resume";
                      const updated: ResumeData = {
                        ...data,
                        latexCode: codeTextRef.current,
                        personalInfo: {
                          ...data.personalInfo,
                          title: effectiveTitle,
                        },
                      };
                      onChange(updated);
                    }}
                    onCompileError={(err, log) => {
                      setIsCompiling(false);
                      setCompileError(err);
                      setCompileLog(log);
                    }}
                    onClearError={() => setCompileError(null)}
                  />
                ) : (
                  /* Rich Resume Template Render with Tap-to-Sync */
                  <div
                    onClick={(e) => {
                      const el = e.target as HTMLElement;
                      const text = el.innerText?.trim();
                      if (text) {
                        const firstLine = text.split("\n")[0]?.trim();
                        if (firstLine) handleSyncToCode(firstLine);
                      }
                    }}
                    title="Tap or click any text on the resume to jump editor cursor to that section"
                    className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#242f3d] cursor-pointer"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                      className="bg-white rounded shadow-2xl text-slate-900 transition-all min-h-[1100px] w-[800px] overflow-hidden"
                    >
                      <SelectedTemplateComponent data={data} isEditing={false} />
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compiler Logs Modal */}
      <AnimatePresence>
        {showLogModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-6"
          >
            <div className="bg-[#121927] border border-[#2b3c54] rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="bg-[#182233] px-4 py-3 border-b border-[#2b3c54] flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-mono text-slate-200">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>LaTeX Compiler Logs</span>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-auto bg-[#0a0e17] font-mono text-xs text-slate-300 select-text leading-relaxed whitespace-pre-wrap max-h-[60vh]">
                {compileLog || "No compiler logs recorded yet. Click Recompile to compile your document."}
              </div>
              <div className="px-4 py-2.5 bg-[#182233] border-t border-[#2b3c54] flex justify-end">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save As Modal */}
      <AnimatePresence>
        {showSaveAsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#121927] border border-[#2b3c54] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-[#182233] px-4 py-3 border-b border-[#2b3c54] flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <FileDown className="w-4 h-4 text-emerald-400" />
                  <span>Save Project As</span>
                </div>
                <button
                  onClick={() => setShowSaveAsModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={saveAsName}
                    onChange={(e) => setSaveAsName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirmSaveAs()}
                    autoFocus
                    placeholder="Enter document title..."
                    className="w-full bg-[#0a0e17] border border-[#2b3c54] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowSaveAsModal(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSaveAs}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcutsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#121927] border border-[#2b3c54] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="bg-[#182233] px-4 py-3 border-b border-[#2b3c54] flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Keyboard Shortcuts</span>
                </div>
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {[
                    { key: "Ctrl + S", action: "Save Document (Browser save prevented)" },
                    { key: "Ctrl + Enter", action: "Recompile LaTeX to PDF" },
                    { key: "Ctrl + P", action: "Print Document" },
                    { key: "Ctrl + Z", action: "Undo Last Action" },
                    { key: "Ctrl + Y", action: "Redo Action" },
                    { key: "Ctrl + F", action: "Find in Document" },
                    { key: "Ctrl + H", action: "Find & Replace" },
                    { key: "Ctrl + A", action: "Select All" },
                    { key: "Ctrl + C / V", action: "Copy / Paste" },
                    { key: "Ctrl + /", action: "Toggle Shortcuts Dialog" },
                    { key: "Tab", action: "Indent Selected Lines" },
                    { key: "Shift + Tab", action: "Outdent Selected Lines" },
                    { key: "Esc", action: "Close Dropdown / Modal" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#162031] border border-[#213047]"
                    >
                      <span className="text-slate-300">{item.action}</span>
                      <kbd className="px-2 py-0.5 bg-[#202e44] border border-[#2d405e] rounded text-emerald-400 font-mono text-[11px] shadow-xs">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 py-2.5 bg-[#182233] border-t border-[#2b3c54] flex justify-end">
                <button
                  onClick={() => setShowShortcutsModal(false)}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#121927] border border-[#2b3c54] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-[#182233] px-4 py-3 border-b border-[#2b3c54] flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>About LaTeX Resume Studio</span>
                </div>
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-[#18253a] border border-[#2b3e5c] rounded-2xl shadow-inner">
                    <OverleafLogo size={42} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">LaTeX Resume & Document Studio</h3>
                  <p className="text-xs text-slate-400 mt-1">Professional Overleaf-Compatible Edition</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed text-left bg-[#0c121e] border border-[#213047] p-3 rounded-lg">
                  Powered by WebAssembly & real-time client LaTeX engines. Features cross-navigation SyncTeX, ATS-compliant typesetting, multi-file project workspace, and high-resolution vector PDF compilation.
                </p>
                <div className="text-[11px] text-slate-400 text-left space-y-1">
                  <div>Engine: <span className="text-slate-200">PdfTeX / SwiftLaTeX WASM</span></div>
                  <div>SyncTeX: <span className="text-emerald-400">Bidirectional Enabled</span></div>
                  <div>Version: <span className="text-slate-200">2.5.0 Production</span></div>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-[#182233] border-t border-[#2b3c54] flex justify-end">
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Document Confirmation Modal */}
      <AnimatePresence>
        {showNewConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <div className="bg-[#121927] border border-[#2b3c54] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-[#182233] px-4 py-3 border-b border-[#2b3c54] flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Create New Document</span>
                </div>
                <button
                  onClick={() => setShowNewConfirmModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to create a new LaTeX document? Any unsaved edits in the current file will be replaced with a clean document template.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowNewConfirmModal(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNewDocument}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    Create New
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Notification Toast */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#142236] border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}