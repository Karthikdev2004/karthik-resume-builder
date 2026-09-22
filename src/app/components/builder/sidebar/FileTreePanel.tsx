import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FileCode, Folder, FileText, Image, FileQuestion, ChevronDown, ChevronRight,
  MoreVertical, FilePlus, FolderPlus, Upload, X, Trash2, Edit2, Copy,
  Star, Download, AlertCircle, HelpCircle, ExternalLink, ListTree, Code2
} from "lucide-react";
import {
  ProjectFile,
  LatexProject,
  createFileInProject,
  createFolderInProject,
  renameFileInProject,
  deleteFileInProject,
  duplicateFileInProject,
  setMainFileInProject,
} from "@/lib/projectState";

export interface OutlineItem {
  id: string;
  level: number; // 1: part, 2: chapter, 3: section, 4: subsection, 5: subsubsection
  title: string;
  lineNumber: number; // 1-indexed
  type: string;
}

export function parseDocumentOutline(code: string): OutlineItem[] {
  if (!code) return [];
  const lines = code.split("\n");
  const items: OutlineItem[] = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Check part
    const partMatch = trimmed.match(/\\part\*?\{([^}]+)\}/i);
    if (partMatch) {
      items.push({ id: `part-${lineNum}`, level: 1, title: partMatch[1].trim(), lineNumber: lineNum, type: "part" });
      return;
    }

    // Check chapter
    const chapMatch = trimmed.match(/\\chapter\*?\{([^}]+)\}/i);
    if (chapMatch) {
      items.push({ id: `chap-${lineNum}`, level: 2, title: chapMatch[1].trim(), lineNumber: lineNum, type: "chapter" });
      return;
    }

    // Check section or sectiontitle or cvsection
    const secMatch = trimmed.match(/\\(?:section|sectiontitle|cvsection|resumesection)\*?\{([^}]+)\}/i);
    if (secMatch) {
      items.push({ id: `sec-${lineNum}`, level: 3, title: secMatch[1].trim(), lineNumber: lineNum, type: "section" });
      return;
    }

    // Check subsection or cvsubsection
    const subMatch = trimmed.match(/\\(?:subsection|cvsubsection)\*?\{([^}]+)\}/i);
    if (subMatch) {
      items.push({ id: `sub-${lineNum}`, level: 4, title: subMatch[1].trim(), lineNumber: lineNum, type: "subsection" });
      return;
    }

    // Check subsubsection
    const subSubMatch = trimmed.match(/\\subsubsection\*?\{([^}]+)\}/i);
    if (subSubMatch) {
      items.push({ id: `subsub-${lineNum}`, level: 5, title: subSubMatch[1].trim(), lineNumber: lineNum, type: "subsubsection" });
      return;
    }

    // Check common uppercase resume comment headers: % SUMMARY, % WORK EXPERIENCE, % EDUCATION, etc.
    if (trimmed.startsWith("%") && !trimmed.startsWith("%%")) {
      const comment = trimmed.replace(/^%+[=\-\s]*/, "").replace(/[=\-\s]+$/, "").trim();
      if (
        comment.length >= 3 &&
        comment.length <= 40 &&
        /^[A-Z0-9\s,&/\-_]+$/.test(comment) &&
        !comment.toLowerCase().includes("package") &&
        !comment.toLowerCase().includes("author") &&
        !comment.toLowerCase().includes("documentclass") &&
        !comment.toLowerCase().includes("license")
      ) {
        items.push({ id: `com-${lineNum}`, level: 3, title: comment, lineNumber: lineNum, type: "comment" });
      }
    }
  });

  return items;
}

interface FileTreePanelProps {
  project: LatexProject;
  activeFileContent?: string;
  onUpdateProject: (updater: (prev: LatexProject) => LatexProject) => void;
  onSelectFile: (fileId: string) => void;
  onCloseSidebar?: () => void;
  onNavigateLine?: (lineNumber: number, titleHint?: string) => void;
}

export function FileTreePanel({
  project,
  activeFileContent = "",
  onUpdateProject,
  onSelectFile,
  onCloseSidebar,
  onNavigateLine,
}: FileTreePanelProps) {
  // Tree expansion state for folders
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Collapsible section states for File tree and File outline
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState(false);

  // Splitter ratio state between File Tree and File Outline (default 52%)
  const [treeHeightPercent, setTreeHeightPercent] = useState<number>(52);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const panelContainerRef = useRef<HTMLDivElement>(null);

  // Inline creation / rename states
  const [creatingType, setCreatingType] = useState<"file" | "folder" | null>(null);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [newEntryName, setNewEntryName] = useState<string>("");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
  } | null>(null);

  // Delete confirmation modal
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  // Outline help modal
  const [showOutlineHelp, setShowOutlineHelp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active file determination
  const activeFile = useMemo(() => {
    return project.files.find((f) => f.id === project.activeFileId) || project.files[0];
  }, [project.files, project.activeFileId]);

  // Parse outline for active file
  const outlineCode = activeFile?.content || activeFileContent;
  const outlineItems = useMemo(() => {
    return parseDocumentOutline(outlineCode);
  }, [outlineCode]);

  // Mouse drag handler for horizontal splitter between tree and outline
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelContainerRef.current) return;
      const rect = panelContainerRef.current.getBoundingClientRect();
      const newHeight = e.clientY - rect.top;
      const totalHeight = rect.height;
      if (totalHeight <= 0) return;

      const percent = Math.max(15, Math.min(85, (newHeight / totalHeight) * 100));
      setTreeHeightPercent(percent);
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

  // Helper to determine file icon
  const getFileIcon = (file: ProjectFile, isActive: boolean) => {
    if (file.type === "folder") {
      const isExp = expandedFolders[file.id];
      return <Folder className={`h-4 w-4 shrink-0 ${isExp ? "text-amber-400" : "text-amber-500/80"}`} />;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "tex" || ext === "sty" || ext === "cls") {
      return (
        <span className={isActive ? "text-white" : "text-emerald-400"}>
          <FileCode className="h-4 w-4 shrink-0" />
        </span>
      );
    }
    if (ext === "bib") {
      return <FileText className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-sky-400"}`} />;
    }
    if (["png", "jpg", "jpeg", "svg", "webp"].includes(ext || "")) {
      return <Image className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-purple-400"}`} />;
    }
    if (ext === "pdf") {
      return <FileText className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-rose-400"}`} />;
    }
    return <FileQuestion className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleStartCreate = (type: "file" | "folder", parentId: string | null = null) => {
    setCreatingType(type);
    setCreatingParentId(parentId);
    setNewEntryName(type === "file" ? "new_file.tex" : "new_folder");
  };

  const handleFinishCreate = () => {
    if (!newEntryName.trim()) {
      setCreatingType(null);
      return;
    }
    if (creatingType === "file") {
      onUpdateProject((prev) => createFileInProject(prev, newEntryName, creatingParentId));
    } else if (creatingType === "folder") {
      onUpdateProject((prev) => createFolderInProject(prev, newEntryName, creatingParentId));
      if (creatingParentId) {
        setExpandedFolders((prev) => ({ ...prev, [creatingParentId]: true }));
      }
    }
    setCreatingType(null);
    setNewEntryName("");
  };

  const handleStartRename = (file: ProjectFile) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
    setContextMenu(null);
  };

  const handleFinishRename = () => {
    if (renamingId && renameValue.trim()) {
      onUpdateProject((prev) => renameFileInProject(prev, renamingId, renameValue));
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onUpdateProject((prev) => deleteFileInProject(prev, fileToDelete.id));
      setFileToDelete(null);
    }
  };

  const handleDownloadFile = (file: ProjectFile) => {
    if (file.type === "folder") return;
    const blob = new Blob([file.content || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setContextMenu(null);
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    for (let i = 0; i < uploaded.length; i++) {
      const file = uploaded[i];
      const text = await file.text().catch(() => "");
      onUpdateProject((prev) => createFileInProject(prev, file.name, null, text));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Render items recursively
  const renderTree = (parentId: string | null = null, depth = 0) => {
    const items = project.files.filter((f) => (f.parentId || null) === parentId);

    return (
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = project.activeFileId === item.id;
          const isMain = project.mainFileId === item.id;
          const isFolder = item.type === "folder";
          const isExpanded = !!expandedFolders[item.id];

          return (
            <div key={item.id} className="relative select-none">
              {renamingId === item.id ? (
                <div
                  style={{ paddingLeft: `${depth * 14 + 10}px` }}
                  className="py-1 pr-2 flex items-center gap-1.5 bg-[#172233] border border-emerald-500/60 rounded text-xs"
                >
                  {getFileIcon(item, false)}
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleFinishRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFinishRename();
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    autoFocus
                    className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              ) : (
                <div
                  style={{ paddingLeft: `${depth * 14 + 8}px` }}
                  onClick={() => {
                    if (isFolder) {
                      toggleFolder(item.id);
                    } else {
                      onSelectFile(item.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      fileId: item.id,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  className={`group flex items-center justify-between py-1.5 pr-2 rounded text-xs cursor-pointer transition-colors ${
                    isActive && !isFolder
                      ? "bg-[#165a36] text-white font-medium shadow-xs"
                      : "text-slate-300 hover:bg-[#182334] hover:text-white"
                  }`}
                  title={`${item.path}${isMain ? " (Root File)" : ""}`}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    {isFolder && (
                      <span className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </span>
                    )}
                    {getFileIcon(item, isActive && !isFolder)}
                    <span className="truncate font-sans tracking-wide">{item.name}</span>
                    {isMain && !isActive && (
                      <span
                        title="Root Document File"
                        className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono shrink-0"
                      >
                        root
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setContextMenu({
                        fileId: item.id,
                        x: rect.right,
                        y: rect.bottom,
                      });
                    }}
                    title="File Options"
                    className={`p-0.5 rounded transition-opacity ${
                      isActive && !isFolder
                        ? "text-white/80 hover:text-white hover:bg-emerald-700/50 opacity-100"
                        : "text-slate-400 hover:text-white hover:bg-[#202d42] opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Sub-tree if folder is expanded */}
              {isFolder && isExpanded && renderTree(item.id, depth + 1)}
            </div>
          );
        })}

        {/* Inline creation input when creating at this depth */}
        {creatingType && creatingParentId === parentId && (
          <div
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className="py-1 pr-2 flex items-center gap-1.5 bg-[#172233] border border-emerald-500 rounded text-xs"
          >
            {creatingType === "folder" ? (
              <Folder className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <input
              type="text"
              value={newEntryName}
              onChange={(e) => setNewEntryName(e.target.value)}
              onBlur={handleFinishCreate}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishCreate();
                if (e.key === "Escape") setCreatingType(null);
              }}
              autoFocus
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
            />
          </div>
        )}
      </div>
    );
  };

  const contextFile = contextMenu ? project.files.find((f) => f.id === contextMenu.fileId) : null;

  return (
    <div ref={panelContainerRef} className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none bg-[#111827]">
      {/* Hidden Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUploadFiles}
      />

      {/* ----------------- TOP SECTION: FILE TREE ----------------- */}
      <div
        style={{
          height: isTreeCollapsed ? "36px" : isOutlineCollapsed ? "100%" : `${treeHeightPercent}%`,
          flexShrink: 0,
        }}
        className="flex flex-col overflow-hidden transition-[height] duration-75"
      >
        {/* File Tree Header */}
        <div className="px-2.5 py-2 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#121927]">
          <button
            onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
            className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-200 hover:text-white transition-colors"
          >
            {isTreeCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="tracking-tight">File tree</span>
          </button>

          {/* Overleaf Action Icons: New File, New Folder, Upload, Close Sidebar */}
          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              onClick={() => handleStartCreate("file")}
              title="New File"
              className="p-1 rounded hover:bg-[#1f2b3e] hover:text-white transition-colors cursor-pointer"
            >
              <FilePlus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleStartCreate("folder")}
              title="New Folder"
              className="p-1 rounded hover:bg-[#1f2b3e] hover:text-white transition-colors cursor-pointer"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload Files"
              className="p-1 rounded hover:bg-[#1f2b3e] hover:text-white transition-colors cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            {onCloseSidebar && (
              <button
                onClick={onCloseSidebar}
                title="Close File Tree"
                className="p-1 rounded hover:bg-[#1f2b3e] hover:text-white transition-colors cursor-pointer ml-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* File Tree Items Area */}
        {!isTreeCollapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {renderTree(null, 0)}
          </div>
        )}
      </div>

      {/* ----------------- HORIZONTAL RESIZER SPLITTER (With 4 dots handle matching Image 2) ----------------- */}
      {!isTreeCollapsed && !isOutlineCollapsed && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingSplitter(true);
          }}
          title="Drag up/down to resize sections"
          className="h-2.5 bg-[#141d2c] border-y border-[#233045] hover:bg-emerald-600/30 cursor-row-resize flex items-center justify-center shrink-0 select-none group transition-colors"
        >
          {/* Overleaf 4-dots handle */}
          <div className="flex items-center gap-0.5 text-slate-500 group-hover:text-emerald-400 transition-colors">
            <span className="h-1 w-1 rounded-full bg-current inline-block" />
            <span className="h-1 w-1 rounded-full bg-current inline-block" />
            <span className="h-1 w-1 rounded-full bg-current inline-block" />
            <span className="h-1 w-1 rounded-full bg-current inline-block" />
          </div>
        </div>
      )}

      {/* ----------------- BOTTOM SECTION: FILE OUTLINE ----------------- */}
      <div
        style={{
          height: isOutlineCollapsed ? "36px" : isTreeCollapsed ? "calc(100% - 36px)" : `calc(${100 - treeHeightPercent}% - 10px)`,
          flexShrink: 0,
        }}
        className="flex flex-col overflow-hidden transition-[height] duration-75"
      >
        {/* File Outline Header */}
        <div className="px-2.5 py-2 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#121927]">
          <button
            onClick={() => setIsOutlineCollapsed(!isOutlineCollapsed)}
            className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-200 hover:text-white transition-colors"
          >
            {isOutlineCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="tracking-tight">File outline</span>
          </button>

          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]" title={activeFile?.name}>
            {activeFile?.name}
          </span>
        </div>

        {/* Outline Content Area */}
        {!isOutlineCollapsed && (
          <div className="flex-1 overflow-y-auto p-2">
            {outlineItems.length === 0 ? (
              /* Overleaf Empty State matching Image 2 */
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-300">
                <p className="text-xs leading-relaxed max-w-[190px] mb-3 text-slate-200 font-normal">
                  We can&apos;t find any sections or subsections in this file.
                </p>
                <button
                  onClick={() => setShowOutlineHelp(true)}
                  className="text-xs text-slate-300 hover:text-white underline underline-offset-3 transition-colors cursor-pointer"
                >
                  Find out more about the file outline
                </button>
              </div>
            ) : (
              /* Outline Items matching Image 1 */
              <div className="space-y-1">
                {outlineItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigateLine?.(item.lineNumber, item.title)}
                    className="px-2.5 py-1.5 rounded hover:bg-[#182334] hover:text-emerald-400 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <span className="text-slate-300 font-semibold text-[11px] tracking-wide uppercase group-hover:text-emerald-400 truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 shrink-0 ml-1">
                      L{item.lineNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- CONTEXT MENU DROPDOWN ----------------- */}
      {contextMenu && contextFile && (
        <>
          <div
            className="fixed inset-0 z-50 bg-transparent"
            onClick={() => setContextMenu(null)}
          />
          <div
            style={{
              top: `${Math.min(contextMenu.y, window.innerHeight - 200)}px`,
              left: `${Math.min(contextMenu.x, window.innerWidth - 180)}px`,
            }}
            className="fixed z-50 w-48 bg-[#182335] border border-[#273852] rounded-md shadow-2xl py-1 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
          >
            {contextFile.type === "file" && contextFile.name.endsWith(".tex") && !contextFile.isMain && (
              <button
                onClick={() => {
                  onUpdateProject((prev) => setMainFileInProject(prev, contextFile.id));
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#223048] flex items-center gap-2 text-emerald-400 font-medium"
              >
                <Star className="h-3.5 w-3.5" />
                <span>Set as Root File</span>
              </button>
            )}

            <button
              onClick={() => handleStartRename(contextFile)}
              className="w-full text-left px-3 py-1.5 hover:bg-[#223048] flex items-center gap-2"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Rename</span>
            </button>

            {contextFile.type === "file" && (
              <>
                <button
                  onClick={() => {
                    onUpdateProject((prev) => duplicateFileInProject(prev, contextFile.id));
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#223048] flex items-center gap-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  onClick={() => handleDownloadFile(contextFile)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#223048] flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </>
            )}

            <div className="h-px bg-[#263750] my-1" />

            <button
              onClick={() => {
                setFileToDelete(contextFile);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-300 hover:text-red-200 flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* ----------------- DELETE CONFIRMATION MODAL ----------------- */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#182335] border border-[#273852] rounded-lg max-w-sm w-full p-4 shadow-2xl text-slate-200 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>Delete {fileToDelete.type === "folder" ? "Folder" : "File"}</span>
            </div>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-mono">&quot;{fileToDelete.name}&quot;</strong>?
              {fileToDelete.type === "folder" && " All files inside this folder will also be deleted."} This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-3 py-1.5 bg-[#202d44] hover:bg-[#2a3a56] text-slate-300 rounded font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- OUTLINE HELP MODAL ----------------- */}
      {showOutlineHelp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#182335] border border-[#273852] rounded-xl max-w-md w-full p-5 shadow-2xl text-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#273852] pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ListTree className="h-4 w-4" />
                <span>About the File Outline</span>
              </div>
              <button
                onClick={() => setShowOutlineHelp(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#202d44]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed">
              The file outline automatically displays all sections in your document so you can jump to any part with a single click.
            </p>
            <div className="bg-[#111724] p-3 rounded-lg border border-[#233045] space-y-1.5 font-mono text-[11px]">
              <div className="text-emerald-300">\section&#123;Work Experience&#125;</div>
              <div className="text-emerald-300">\section&#123;Education&#125;</div>
              <div className="text-emerald-300">\section&#123;Skills&#125;</div>
              <div className="text-slate-400 text-[10px] mt-1">// or uppercase comments:</div>
              <div className="text-sky-300">% SUMMARY</div>
              <div className="text-sky-300">% WORK EXPERIENCE</div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Add any of these headings to your LaTeX code to instantly see them listed in the outline.
            </p>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowOutlineHelp(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
