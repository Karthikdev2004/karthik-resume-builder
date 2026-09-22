import React, { useMemo } from "react";
import { ListTree, ChevronRight, Hash, FileCode } from "lucide-react";

export interface OutlineItem {
  id: string;
  level: number; // 1: part, 2: chapter, 3: section, 4: subsection, 5: subsubsection
  title: string;
  lineNumber: number; // 1-indexed
  type: string;
}

interface OutlinePanelProps {
  codeText: string;
  fileName: string;
  onNavigateLine: (lineNumber: number, titleHint?: string) => void;
}

export function OutlinePanel({ codeText, fileName, onNavigateLine }: OutlinePanelProps) {
  const outlineItems = useMemo<OutlineItem[]>(() => {
    if (!codeText) return [];
    const lines = codeText.split("\n");
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

      // Check section or sectiontitle
      const secMatch = trimmed.match(/\\(?:section|sectiontitle|cvsection)\*?\{([^}]+)\}/i);
      if (secMatch) {
        items.push({ id: `sec-${lineNum}`, level: 3, title: secMatch[1].trim(), lineNumber: lineNum, type: "section" });
        return;
      }

      // Check subsection
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

      // Fallback: Check clean section comments like % ====== ABOUT ME ====== or % EDUCATION
      if (trimmed.startsWith("%") && !trimmed.startsWith("%%")) {
        const comment = trimmed.replace(/^%+[=\-\s]*/, "").replace(/[=\-\s]+$/, "").trim();
        if (
          comment.length > 2 &&
          comment.length < 35 &&
          /^[A-Z0-9\s,&/]+$/.test(comment) &&
          !comment.toLowerCase().includes("package") &&
          !comment.toLowerCase().includes("author")
        ) {
          items.push({ id: `com-${lineNum}`, level: 3, title: comment, lineNumber: lineNum, type: "comment" });
        }
      }
    });

    return items;
  }, [codeText]);

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
          <ListTree className="h-3.5 w-3.5 text-emerald-400" />
          <span>File outline</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[90px]" title={fileName}>
          {fileName}
        </span>
      </div>

      {/* Outline List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {outlineItems.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            <p className="mb-1 text-xs">No sections detected.</p>
            <p className="text-[11px] text-slate-600">
              Add <code className="text-emerald-400 font-mono">\section&#123;...&#125;</code> to generate an outline.
            </p>
          </div>
        ) : (
          outlineItems.map((item) => {
            const indentPx = Math.max(0, (item.level - 3) * 12 + 6);
            return (
              <div
                key={item.id}
                onClick={() => onNavigateLine(item.lineNumber, item.title)}
                style={{ paddingLeft: `${indentPx}px` }}
                className="group flex items-center justify-between py-1.5 pr-2 rounded text-xs text-slate-300 hover:text-emerald-300 hover:bg-[#18263a] cursor-pointer transition-colors"
                title={`Jump to line ${item.lineNumber}: ${item.title}`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0 text-right">
                    {item.lineNumber}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-500 shrink-0 group-hover:text-emerald-400" />
                  <span className={`truncate ${item.level <= 3 ? "font-semibold text-slate-200" : "font-normal text-slate-400"}`}>
                    {item.title}
                  </span>
                </div>

                <span className="text-[9px] text-slate-600 font-mono opacity-0 group-hover:opacity-100 uppercase">
                  {item.type}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
