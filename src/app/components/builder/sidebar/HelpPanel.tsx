import React from "react";
import { HelpCircle, Keyboard, Lightbulb, ExternalLink } from "lucide-react";

export function HelpPanel() {
  const SHORTCUTS = [
    { key: "Ctrl + S", desc: "Save project & file" },
    { key: "Ctrl + Enter", desc: "Recompile LaTeX to PDF" },
    { key: "Ctrl + F", desc: "Search current file" },
    { key: "Ctrl + Shift + F", desc: "Search entire project" },
    { key: "Tap / Click on Resume", desc: "SyncTeX jump cursor to line" },
    { key: "Esc", desc: "Close modals / menus" },
  ];

  const TIPS = [
    {
      title: "Splitting into Multiple Files",
      code: "\\input{sections/education.tex}",
      desc: "Use \\input{path} or \\include{path} to organize complex resumes into neat subfiles.",
    },
    {
      title: "Escaping Special Symbols",
      code: "\\% \\& \\$ \\# \\_ \\{ \\}",
      desc: "Characters with special LaTeX meaning must be preceded by a backslash.",
    },
    {
      title: "Compact Resume Spacing",
      code: "\\vspace{-4pt} \\hfill",
      desc: "Use negative vspace and hfill to align dates and titles precisely on one line.",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>Editor help & shortcuts</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Keyboard Shortcuts */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
            <Keyboard className="h-3.5 w-3.5 text-emerald-400" />
            <span>Keyboard shortcuts</span>
          </h4>
          <div className="space-y-1 bg-[#131b28] p-2.5 rounded-lg border border-[#202d42]">
            {SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-1 text-xs">
                <span className="text-slate-400 text-[11px]">{s.desc}</span>
                <kbd className="bg-[#1c2738] text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#2a3c56]">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* LaTeX Tips */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>LaTeX quick tips</span>
          </h4>
          <div className="space-y-2">
            {TIPS.map((t) => (
              <div key={t.title} className="bg-[#131b28] p-2.5 rounded-lg border border-[#202d42] space-y-1">
                <div className="font-medium text-slate-200 text-[11px]">{t.title}</div>
                <pre className="bg-[#0e1420] text-emerald-300 p-1.5 rounded font-mono text-[10px] overflow-x-auto border border-[#202e44]">
                  {t.code}
                </pre>
                <div className="text-[10px] text-slate-400 leading-relaxed">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
