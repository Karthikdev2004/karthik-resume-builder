import React, { useState, useMemo } from "react";
import { Search, FileCode, ArrowRight, X, CaseSensitive, WholeWord } from "lucide-react";
import { LatexProject, ProjectFile } from "@/lib/projectState";

interface SearchPanelProps {
  project: LatexProject;
  onNavigateToResult: (fileId: string, lineNumber: number, query: string) => void;
}

interface SearchMatch {
  fileId: string;
  fileName: string;
  filePath: string;
  lineNumber: number;
  lineContent: string;
  matchIndex: number;
}

export function SearchPanel({ project, onNavigateToResult }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [searchScope, setSearchScope] = useState<"project" | "current">("project");

  const results = useMemo<SearchMatch[]>(() => {
    if (!query.trim()) return [];

    const matches: SearchMatch[] = [];
    const filesToSearch: ProjectFile[] =
      searchScope === "current"
        ? project.files.filter((f) => f.id === project.activeFileId && f.type === "file")
        : project.files.filter((f) => f.type === "file" && f.content !== undefined);

    const pattern = isWholeWord ? `\\b${query}\\b` : query;
    const regex = new RegExp(pattern, isCaseSensitive ? "g" : "gi");

    filesToSearch.forEach((file) => {
      if (!file.content) return;
      const lines = file.content.split("\n");

      lines.forEach((line, idx) => {
        regex.lastIndex = 0;
        const match = regex.exec(line);
        if (match) {
          matches.push({
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            lineNumber: idx + 1,
            lineContent: line.trim(),
            matchIndex: match.index,
          });
        }
      });
    });

    return matches;
  }, [query, isCaseSensitive, isWholeWord, searchScope, project.files, project.activeFileId]);

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
          <Search className="h-3.5 w-3.5 text-emerald-400" />
          <span>Search</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {results.length} {results.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* Search Input Controls */}
      <div className="p-3 border-b border-[#233045] space-y-2 bg-[#141b29]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files (Ctrl+Shift+F)..."
            autoFocus
            className="w-full bg-[#0e1420] border border-[#24344c] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-16"
          />
          <div className="absolute right-1.5 flex items-center gap-0.5">
            <button
              onClick={() => setIsCaseSensitive(!isCaseSensitive)}
              title="Match Case"
              className={`p-1 rounded text-xs transition-colors ${
                isCaseSensitive ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <CaseSensitive className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsWholeWord(!isWholeWord)}
              title="Match Whole Word"
              className={`p-1 rounded text-xs transition-colors ${
                isWholeWord ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <WholeWord className="h-3.5 w-3.5" />
            </button>
            {query && (
              <button
                onClick={() => setQuery("")}
                title="Clear"
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scope Pill */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setSearchScope("project")}
            className={`px-2 py-0.5 rounded transition-colors ${
              searchScope === "project" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Entire Project
          </button>
          <button
            onClick={() => setSearchScope("current")}
            className={`px-2 py-0.5 rounded transition-colors ${
              searchScope === "current" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Active File Only
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {query.trim() && results.length === 0 && (
          <div className="p-4 text-center text-slate-500 text-xs">
            No matches found for "{query}".
          </div>
        )}

        {results.map((r, idx) => (
          <div
            key={`${r.fileId}-${r.lineNumber}-${idx}`}
            onClick={() => onNavigateToResult(r.fileId, r.lineNumber, query)}
            className="p-2 rounded bg-[#131b28] hover:bg-[#1a2538] border border-transparent hover:border-[#2b3d56] cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] text-emerald-400">
              <span className="font-mono font-medium truncate max-w-[140px]">{r.fileName}</span>
              <span className="text-[10px] text-slate-500 font-mono">Line {r.lineNumber}</span>
            </div>
            <p className="font-mono text-[11px] text-slate-300 truncate leading-relaxed">
              {r.lineContent}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
