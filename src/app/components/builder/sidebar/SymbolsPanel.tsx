import React, { useState } from "react";
import { Sparkles, Code2, Copy, Check } from "lucide-react";

interface SymbolsPanelProps {
  onInsertSnippet: (snippet: string) => void;
}

interface SnippetGroup {
  name: string;
  items: { label: string; snippet: string; desc?: string }[];
}

const SNIPPET_GROUPS: SnippetGroup[] = [
  {
    name: "Structure & Sections",
    items: [
      { label: "\\section{}", snippet: "\\section{Section Name}\n", desc: "Main Section" },
      { label: "\\subsection{}", snippet: "\\subsection{Subsection Name}\n", desc: "Subsection" },
      { label: "\\subsubsection{}", snippet: "\\subsubsection{Subsubsection Name}\n", desc: "Subsubsection" },
      { label: "\\paragraph{}", snippet: "\\paragraph{Paragraph Title} ", desc: "Inline Paragraph" },
      { label: "\\section*{}", snippet: "\\section*{Unnumbered Section}\n", desc: "Unnumbered Section" },
    ],
  },
  {
    name: "Text Formatting",
    items: [
      { label: "\\textbf{bold}", snippet: "\\textbf{text}", desc: "Bold font" },
      { label: "\\textit{italic}", snippet: "\\textit{text}", desc: "Italic font" },
      { label: "\\underline{text}", snippet: "\\underline{text}", desc: "Underlined text" },
      { label: "\\texttt{code}", snippet: "\\texttt{code}", desc: "Monospace code" },
      { label: "\\textsc{caps}", snippet: "\\textsc{Small Caps}", desc: "Small capitals" },
      { label: "{\\large text}", snippet: "{\\large text}", desc: "Large font" },
      { label: "{\\LARGE text}", snippet: "{\\LARGE text}", desc: "Extra Large font" },
      { label: "{\\small text}", snippet: "{\\small text}", desc: "Small font" },
    ],
  },
  {
    name: "Lists & Environments",
    items: [
      {
        label: "itemize (bullets)",
        snippet: "\\begin{itemize}\n  \\item First item\n  \\item Second item\n\\end{itemize}\n",
        desc: "Bullet points",
      },
      {
        label: "enumerate (numbered)",
        snippet: "\\begin{enumerate}\n  \\item First item\n  \\item Second item\n\\end{enumerate}\n",
        desc: "Numbered list",
      },
      {
        label: "center",
        snippet: "\\begin{center}\n  Centered content\n\\end{center}\n",
        desc: "Centered block",
      },
      {
        label: "tabular (table)",
        snippet: "\\begin{tabular}{|l|c|r|}\n  \\hline\n  Col 1 & Col 2 & Col 3 \\\\\n  \\hline\n  A & B & C \\\\\n  \\hline\n\\end{tabular}\n",
        desc: "Simple table",
      },
      {
        label: "figure (image)",
        snippet: "\\begin{figure}[h]\n  \\centering\n  \\includegraphics[width=0.8\\textwidth]{image.png}\n  \\caption{Caption here}\n\\end{figure}\n",
        desc: "Figure with caption",
      },
    ],
  },
  {
    name: "Math & Equations",
    items: [
      { label: "\\frac{a}{b}", snippet: "\\frac{numerator}{denominator}", desc: "Fraction" },
      { label: "\\sqrt{x}", snippet: "\\sqrt{x}", desc: "Square root" },
      { label: "x^{n}", snippet: "x^{n}", desc: "Superscript" },
      { label: "x_{i}", snippet: "x_{i}", desc: "Subscript" },
      { label: "\\sum_{i=1}^{n}", snippet: "\\sum_{i=1}^{n}", desc: "Summation" },
      { label: "\\int_{a}^{b}", snippet: "\\int_{a}^{b}", desc: "Integral" },
      { label: "\\alpha, \\beta, \\gamma", snippet: "\\alpha, \\beta, \\gamma", desc: "Greek letters" },
      { label: "\\leq, \\geq, \\neq", snippet: "\\leq, \\geq, \\neq", desc: "Comparisons" },
    ],
  },
  {
    name: "Spacing & Rules",
    items: [
      { label: "\\vspace{8pt}", snippet: "\\vspace{8pt}\n", desc: "Vertical space" },
      { label: "\\hspace{10pt}", snippet: "\\hspace{10pt}", desc: "Horizontal space" },
      { label: "\\hrule", snippet: "\\hrule\n", desc: "Horizontal line rule" },
      { label: "\\hfill", snippet: "\\hfill ", desc: "Push to right margin" },
      { label: "\\newline (\\\\)", snippet: "\\\\\n", desc: "Line break" },
    ],
  },
];

export function SymbolsPanel({ onInsertSnippet }: SymbolsPanelProps) {
  const [filter, setFilter] = useState("");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const filteredGroups = SNIPPET_GROUPS.map((group) => {
    const matchingItems = group.items.filter(
      (item) =>
        item.label.toLowerCase().includes(filter.toLowerCase()) ||
        (item.desc && item.desc.toLowerCase().includes(filter.toLowerCase()))
    );
    return { ...group, items: matchingItems };
  }).filter((group) => group.items.length > 0);

  const handleInsert = (item: { label: string; snippet: string }) => {
    onInsertSnippet(item.snippet);
    setCopiedLabel(item.label);
    setTimeout(() => setCopiedLabel(null), 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>LaTeX commands & symbols</span>
        </div>
      </div>

      {/* Filter search */}
      <div className="p-3 border-b border-[#233045] bg-[#141b29]">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter commands (e.g. section, frac)..."
          className="w-full bg-[#0e1420] border border-[#24344c] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Snippet Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredGroups.map((group) => (
          <div key={group.name} className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group.name}
            </h4>
            <div className="grid grid-cols-1 gap-1">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleInsert(item)}
                  title={`Click to insert: ${item.desc || item.label}`}
                  className="w-full text-left p-2 rounded bg-[#131b28] hover:bg-[#1c283c] border border-transparent hover:border-[#2a3c56] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs text-emerald-300 group-hover:text-emerald-200 truncate">
                      {item.label}
                    </div>
                    {item.desc && (
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-slate-500 group-hover:text-white transition-colors">
                    {copiedLabel === item.label ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Code2 className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
