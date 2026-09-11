import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Briefcase, GraduationCap, Code, FolderGit2, Award, FileCheck,
  Sparkles, ZoomIn, ZoomOut, CheckCircle2, Trash2, Plus,
  Linkedin, Globe, Mail, Phone, MapPin, Search, AlertCircle, LayoutTemplate, ArrowRight,
  FileCode, Folder, FileText, Upload, RefreshCw, Download, Layers, History, Layout, Share2,
  ChevronDown, Type, Bold, Italic, List, Quote, Link2, Omega, Settings, Eye, ChevronRight,
  FolderPlus, FilePlus, Edit3, X, Check, MoreVertical, HelpCircle, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/app/types";
import { getTemplate, TEMPLATES, TemplateId } from "@/app/templates";
import { downloadResumePDF } from "@/lib/pdf-browser";
import { UniversalLatexCompiler, compileLatex, revokePdfUrl } from "@/app/components/builder/UniversalLatexCompiler";

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
  projectTitle
}: {
  data: ResumeData;
  onChange: (d: Partial<ResumeData>) => void;
  onNext?: () => void;
  onBack: () => void;
  projectTitle?: string;
}) {
  const initialTitle = projectTitle || data.personalInfo?.title || "Resume";
  const [projectName, setProjectName] = useState<string>(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [codeText, setCodeText] = useState<string>(() => data.latexCode || dataToLaTeX(data, initialTitle));
  const codeTextRef = useRef<string>(codeText);
  codeTextRef.current = codeText;

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
  const [showFileMenu, setShowFileMenu] = useState<boolean>(false);
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
    setCodeText(newCode);
    codeTextRef.current = newCode;
    const updated = parseLaTeXData(newCode, data);
    onChange(updated);
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

      return (
        <div key={lIdx} className="leading-6 min-h-[1.5rem] whitespace-pre">
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
            onClick={onBack}
            title="Back to All Projects"
            className="flex items-center gap-2 pr-2 border-r border-[#233045] hover:opacity-80 transition-opacity"
          >
            <OverleafLogo size={22} />
          </button>

          <div className="relative flex items-center gap-1 text-slate-300 font-medium">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors"
            >
              File
            </button>
            {showFileMenu && (
              <div className="absolute top-8 left-0 w-48 bg-[#182233] border border-[#263750] rounded-md shadow-2xl z-50 py-1 text-xs">
                <button
                  onClick={() => { setShowFileMenu(false); onBack(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between"
                >
                  <span>Go to Dashboard</span>
                  <span className="text-[10px] text-slate-400">Esc</span>
                </button>
                <button
                  onClick={() => { setShowFileMenu(false); handleRecompile(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200 flex items-center justify-between"
                >
                  <span>Recompile</span>
                  <span className="text-[10px] text-slate-400">Ctrl+Enter</span>
                </button>
                <button
                  onClick={() => { setShowFileMenu(false); handleDownload(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#202d44] text-slate-200"
                >
                  Download PDF
                </button>
              </div>
            )}
            <button className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors">Edit</button>
            <button className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors">Insert</button>
            <button className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors">View</button>
            <button className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors">Format</button>
            <button className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors">Help</button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2.5 py-0.5 rounded text-[11px] shadow-sm ml-1 transition-colors">
              Upgrade
            </button>
          </div>
        </div>

        {/* Center Project Name Dropdown */}
        <div className="flex items-center gap-1 text-slate-200 font-medium cursor-pointer hover:bg-[#1f2b3e] px-3 py-1 rounded transition-colors">
          {isEditingTitle ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
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
          <button className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-[#1f2b3e] px-2.5 py-1 rounded transition-colors">
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
        {/* ----- LEFTMOST DOCK (Overleaf Navigation Strip) ----- */}
        <div className="w-11 bg-[#0f141f] border-r border-[#233045] flex flex-col items-center py-3 justify-between shrink-0 select-none z-20">
          <div className="flex flex-col items-center gap-4 w-full">
            <button
              onClick={onBack}
              title="Return to Projects Dashboard"
              className="p-1 hover:bg-[#1a2436] rounded-lg transition-colors group"
            >
              <OverleafLogo size={20} />
            </button>

            <div className="w-5 h-px bg-[#233045]" />

            <button
              title="Project Files"
              className="p-2 text-emerald-400 bg-[#192436] rounded-md transition-colors relative"
            >
              <div className="absolute -left-2.5 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r" />
              <FileText className="h-4 w-4" />
            </button>

            <button
              title="Search"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192436] rounded-md transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              title="Git & History"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192436] rounded-md transition-colors"
            >
              <FolderGit2 className="h-4 w-4" />
            </button>

            <button
              title="Comments & Chat"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192436] rounded-md transition-colors"
            >
              <Quote className="h-4 w-4" />
            </button>

            <button
              title="Symbols & AI"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192436] rounded-md transition-colors"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <button
              title="Settings"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192436] rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              title="Help"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192436] rounded-md transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ----- SIDEBAR (File Tree & Outline) ----- */}
        <aside className="w-52 bg-[#121927] border-r border-[#233045] flex flex-col shrink-0">
          {/* File Tree Section */}
          <div className="p-3 border-b border-[#233045]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
              <div className="flex items-center gap-1 font-semibold text-[11px] text-slate-300">
                <ChevronDown className="h-3 w-3 text-slate-400" />
                <span>File tree</span>
              </div>
              <div className="flex items-center gap-1">
                <button title="New File" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><FilePlus className="h-3.5 w-3.5" /></button>
                <button title="New Folder" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><FolderPlus className="h-3.5 w-3.5" /></button>
                <button title="Upload" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><Upload className="h-3.5 w-3.5" /></button>
                <button title="Delete" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#1c283c] text-emerald-400 text-xs font-semibold cursor-pointer border-l-2 border-emerald-500">
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">main.tex</span>
                </div>
                <MoreVertical className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* File Outline Section */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="flex items-center gap-1 font-semibold text-[11px] text-slate-300 mb-2">
              <ChevronDown className="h-3 w-3 text-slate-400" />
              <span>File outline</span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              {parsedSections.map((secName, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded hover:bg-[#1c283c] hover:text-emerald-400 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span className="text-slate-300 font-medium">{secName}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

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
              {/* File Tab Header */}
              <div className="h-9 bg-[#121927] border-b border-[#233045] px-2 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-[#141b27] text-slate-200 px-3 py-1.5 rounded-t text-xs flex items-center gap-2 border-t-2 border-emerald-500 border-x border-[#233045]">
                    <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                    <span>main.tex</span>
                    <X className="h-3 w-3 opacity-50 hover:opacity-100 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Formatting Toolbar & Code/Visual Toggle */}
              <div className="h-9 bg-[#151e2c] border-b border-[#233045] px-3 flex items-center justify-between text-xs shrink-0 select-none overflow-hidden">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <button title="Undo" className="hover:text-white p-1 rounded"><ArrowRight className="h-3.5 w-3.5 rotate-180" /></button>
                  <button title="Redo" className="hover:text-white p-1 rounded"><ArrowRight className="h-3.5 w-3.5" /></button>
                  <div className="h-3.5 w-px bg-[#26354b] mx-0.5" />
                  <button title="Font size" className="hover:text-white p-1 rounded font-serif font-bold text-xs">TT</button>
                  <button title="Bold" className="hover:text-white p-1 rounded font-bold"><Bold className="h-3.5 w-3.5" /></button>
                  <button title="Italic" className="hover:text-white p-1 rounded italic"><Italic className="h-3.5 w-3.5" /></button>
                  <button title="Symbols" className="hover:text-white p-1 rounded"><Omega className="h-3.5 w-3.5" /></button>
                  <button title="Link" className="hover:text-white p-1 rounded"><Link2 className="h-3.5 w-3.5" /></button>
                  <button title="Comment" className="hover:text-white p-1 rounded"><Quote className="h-3.5 w-3.5" /></button>
                  <button title="Image" className="hover:text-white p-1 rounded"><FileText className="h-3.5 w-3.5" /></button>
                  <button title="Table" className="hover:text-white p-1 rounded"><Layout className="h-3.5 w-3.5" /></button>
                  <button title="List" className="hover:text-white p-1 rounded"><List className="h-3.5 w-3.5" /></button>
                  <button title="More" className="hover:text-white p-1 rounded">...</button>
                </div>

                {/* Code vs Visual Pill Toggle matching Image 3 */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#0d131f] border border-[#26354b] rounded-full p-0.5 text-xs font-medium">
                    <button
                      onClick={() => setViewMode("code")}
                      className={`px-3 py-0.5 rounded-full transition-all ${
                        viewMode === "code"
                          ? "bg-[#16a34a] text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setViewMode("visual")}
                      className={`px-3 py-0.5 rounded-full transition-all ${
                        viewMode === "visual"
                          ? "bg-[#16a34a] text-white font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Visual
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-slate-300 text-xs hover:bg-[#1e2a3c] px-2 py-1 rounded cursor-pointer">
                    <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Editing</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </div>

                  <button title="Find and Replace" className="text-slate-400 hover:text-white p-1 rounded">
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
                        <div key={idx} className="leading-6">{idx + 1}</div>
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
                    latexCode={codeText}
                    zoom={zoom}
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
                    }}
                    onCompileError={(err, log) => {
                      setIsCompiling(false);
                      setCompileError(err);
                      setCompileLog(log);
                    }}
                    onClearError={() => setCompileError(null)}
                  />
                ) : (
                  /* Rich Resume Template Render */
                  <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#242f3d]">
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
    </div>
  );
}