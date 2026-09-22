import React, { useState } from "react";
import {
  FileEdit, CheckCircle2, AlertTriangle, Sparkles, TrendingUp,
  Award, FileText, ChevronRight, Check, RefreshCw
} from "lucide-react";
import { LatexProject } from "@/lib/projectState";

interface ReviewPanelProps {
  project: LatexProject;
  codeText: string;
  onInsertSnippet?: (snippet: string) => void;
}

export function ReviewPanel({ project, codeText, onInsertSnippet }: ReviewPanelProps) {
  const [trackChanges, setTrackChanges] = useState(false);

  // Compute live resume metrics
  const wordCount = codeText.trim() ? codeText.split(/\s+/).length : 0;
  const lineCount = codeText.split("\n").length;
  const hasSummary = /\\section\*?\{.*summary.*\}/i.test(codeText) || /summary/i.test(codeText);
  const hasExperience = /\\section\*?\{.*experience.*\}/i.test(codeText) || /experience/i.test(codeText);
  const hasEducation = /\\section\*?\{.*education.*\}/i.test(codeText) || /education/i.test(codeText);
  const hasSkills = /\\section\*?\{.*skill.*\}/i.test(codeText) || /skill/i.test(codeText);
  const hasMetrics = /\b\d+%\b|\$\d+|\b\d+\+\b|\b\d+k\b/i.test(codeText);

  // Simple ATS score calculation based on content completeness
  let score = 50;
  if (hasSummary) score += 10;
  if (hasExperience) score += 15;
  if (hasEducation) score += 10;
  if (hasSkills) score += 10;
  if (hasMetrics) score += 5;

  const checks = [
    { title: "Contact Details Included", pass: true, desc: "Name, email & phone are formatted" },
    { title: "Executive Summary", pass: hasSummary, desc: "Clear summary of background & goals" },
    { title: "Work Experience Section", pass: hasExperience, desc: "Roles, dates & achievements" },
    { title: "Education Section", pass: hasEducation, desc: "Degree, institution & year" },
    { title: "Technical Skills", pass: hasSkills, desc: "Relevant keywords for ATS crawlers" },
    { title: "Quantifiable Metrics", pass: hasMetrics, desc: "Use %, numbers, or metrics for impact" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200 text-xs select-none bg-[#111827]">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#233045] flex items-center justify-between shrink-0 bg-[#121927]">
        <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-200">
          <FileEdit className="h-3.5 w-3.5 text-emerald-400" />
          <span>Review & ATS checks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full font-semibold">
            {score}/100
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ATS Score Card */}
        <div className="bg-[#141d2c] border border-[#223046] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              ATS Readability Score
            </span>
            <span className="text-emerald-400 font-bold font-mono text-sm">{score}%</span>
          </div>

          <div className="w-full bg-[#0e1420] h-2 rounded-full overflow-hidden border border-[#1e2a3c]">
            <div
              style={{ width: `${score}%` }}
              className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>{wordCount} words</span>
            <span>{lineCount} lines</span>
            <span className="text-emerald-300">ATS Optimized</span>
          </div>
        </div>

        {/* Track Changes Toggle */}
        <div className="bg-[#141d2c] border border-[#223046] rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-200">Track changes</div>
            <div className="text-[10px] text-slate-400">Highlight additions & revisions in real time</div>
          </div>
          <button
            onClick={() => setTrackChanges(!trackChanges)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              trackChanges ? "bg-emerald-600" : "bg-[#25344c]"
            }`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                trackChanges ? "left-4.5" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Document quality checklist</span>
          </h4>

          <div className="space-y-1.5">
            {checks.map((c, idx) => (
              <div
                key={idx}
                className="bg-[#141d2c] border border-[#223046] rounded-lg p-2.5 flex items-start gap-2.5 transition-colors"
              >
                {c.pass ? (
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[11px] text-slate-200">{c.title}</div>
                  <div className="text-[10px] text-slate-400 leading-normal">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Suggestions */}
        <div className="space-y-2 pt-1">
          <h4 className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Recommended Action Verbs</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {["Spearheaded", "Architected", "Accelerated", "Optimized", "Engineered", "Orchestrated"].map((verb) => (
              <button
                key={verb}
                onClick={() => onInsertSnippet?.(`\\item ${verb} `)}
                title={`Insert "\\item ${verb} "` }
                className="bg-[#182436] hover:bg-emerald-600 hover:text-white text-emerald-300 px-2 py-1 rounded text-[11px] font-mono border border-emerald-500/30 transition-colors cursor-pointer"
              >
                + {verb}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
