import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Label, Textarea } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Briefcase, GraduationCap, Code, FolderGit2, Award, FileCheck,
  Sparkles, ZoomIn, ZoomOut, CheckCircle2, Trash2, Plus,
  Linkedin, Globe, Mail, Phone, MapPin, Search, AlertCircle, LayoutTemplate, ArrowRight,
  FileCode, Folder, FileText, Upload, RefreshCw, Download, Layers, History, Layout, Share2,
  ChevronDown, Type, Bold, Italic, List, Quote, Link2, Omega, Settings, Eye, ChevronRight,
  FolderPlus, FilePlus, Edit3, X, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData, Experience, Education, Project } from "@/app/types";
import { getTemplate, TEMPLATES, TemplateId } from "@/app/templates";
import { downloadResumePDF } from "@/lib/pdf-browser";
import { VFLogo } from "@/app/components/VFLogo";

// --- LaTeX Converter Helpers ---
function dataToLaTeX(data: ResumeData): string {
  const name = data.personalInfo?.fullName || "Henry Madison";
  const title = data.personalInfo?.title || "Graphic Designer";
  const email = data.personalInfo?.email || "henry@example.com";
  const phone = data.personalInfo?.phone || "+1 (555) 234-5678";
  const location = data.personalInfo?.location || "New York, NY";
  const linkedin = data.personalInfo?.linkedin || "linkedin.com/in/user";
  const github = data.personalInfo?.github || "github.com/user";
  const website = data.personalInfo?.website || "myportfolio.com";
  const summary = data.summary || "Creative professional with experience in building high quality applications and visual brand identities.";
  const skills = data.skills || "React, TypeScript, Node.js, Next.js, Figma, UI/UX Design";

  let expCode = "";
  if (data.experience && data.experience.length > 0) {
    expCode = data.experience.map(e => `\\job{${e.role || "Role"}}{${e.company || "Company"}}{${e.duration || "2021 - Present"}}\n- ${e.description || "Key achievements and responsibilities"}`).join("\n\n");
  } else {
    expCode = `\\job{Senior Designer}{Studio Design}{2021 - Present}\n- Led visual identity projects for Fortune 500 clients.\n- Optimized brand design systems.`;
  }

  let eduCode = "";
  if (data.education && data.education.length > 0) {
    eduCode = data.education.map(e => `\\degree{${e.degree || "Degree"}}{${e.school || "University"}}{${e.year || "2017 - 2021"}}`).join("\n");
  } else {
    eduCode = `\\degree{B.F.A. Graphic Design}{Art University}{2017 - 2021}`;
  }

  return `\\documentclass[a4paper,10pt]{article}

% Packages
\\usepackage[margin=0cm]{geometry}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{fontawesome5}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}

% Colors matching the template
\\definecolor{sidebar}{HTML}{1C252E}    % Dark navy/black sidebar
\\definecolor{textgray}{HTML}{555555}
\\definecolor{lightgray}{HTML}{E8E8E8}
\\definecolor{barfill}{HTML}{1C252E}
\\definecolor{barbg}{HTML}{D0D0D0}

\\begin{document}
\\name{${name}}
\\title{${title}}
\\email{${email}}
\\phone{${phone}}
\\location{${location}}
\\linkedin{${linkedin}}
\\github{${github}}
\\website{${website}}

\\section{Profile}
${summary}

\\section{Experience}
${expCode}

\\section{Education}
${eduCode}

\\section{Skills}
${skills}

\\end{document}`;
}

function laTeXToData(code: string, currentData: ResumeData): ResumeData {
  const extractVal = (tag: string): string => {
    const match = code.match(new RegExp(`\\\\${tag}\\{([^}]*)\\}`));
    return match ? match[1].trim() : "";
  };

  const name = extractVal("name");
  const title = extractVal("title");
  const email = extractVal("email");
  const phone = extractVal("phone");
  const location = extractVal("location");
  const linkedin = extractVal("linkedin");
  const github = extractVal("github");
  const website = extractVal("website");

  const profileMatch = code.match(/\\section\{Profile\}\s*([^\\#]*)/i);
  const summary = profileMatch ? profileMatch[1].trim() : currentData.summary;

  const skillsMatch = code.match(/\\section\{Skills\}\s*([^\\#]*)/i);
  const skills = skillsMatch ? skillsMatch[1].trim() : currentData.skills;

  return {
    ...currentData,
    personalInfo: {
      ...currentData.personalInfo,
      fullName: name || currentData.personalInfo.fullName,
      title: title || currentData.personalInfo.title,
      email: email || currentData.personalInfo.email,
      phone: phone || currentData.personalInfo.phone,
      location: location || currentData.personalInfo.location,
      linkedin: linkedin || currentData.personalInfo.linkedin,
      github: github || currentData.personalInfo.github,
      website: website || currentData.personalInfo.website,
    },
    summary: summary || currentData.summary,
    skills: skills || currentData.skills,
  };
}

type Section = "personal" | "experience" | "education" | "projects" | "skills" | "certifications" | "achievements";

const SECTIONS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "skills", label: "Skills", icon: Code },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: FileCheck },
  { id: "achievements", label: "Achievements", icon: Award },
] as const;

export function Step2Profile({
  data,
  onChange,
  onNext,
  onBack
}: {
  data: ResumeData;
  onChange: (d: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [viewMode, setViewMode] = useState<"code" | "visual">("code");
  const [layoutMode, setLayoutMode] = useState<"split" | "editor" | "preview">("split");
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("sidebar-left");
  const [codeText, setCodeText] = useState<string>(() => dataToLaTeX(data));
  const [pendingChanges, setPendingChanges] = useState<number>(2);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0.55);
  const [projectName, setProjectName] = useState<string>(data.personalInfo.title ? `resume ${data.personalInfo.title}` : "resume 1");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState<boolean>(false);

  // Sync data to LaTeX when data changes externally
  useEffect(() => {
    setCodeText(dataToLaTeX(data));
  }, [data.personalInfo.fullName, data.personalInfo.title, data.summary, data.skills]);

  // Recompile handler
  const handleRecompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      if (viewMode === "code") {
        const updated = laTeXToData(codeText, data);
        onChange(updated);
      } else {
        setCodeText(dataToLaTeX(data));
      }
      setPendingChanges(0);
      setIsCompiling(false);
    }, 300);
  };

  // Code change handler
  const handleCodeChange = (val: string) => {
    setCodeText(val);
    setPendingChanges((prev) => prev + 1);
    const updated = laTeXToData(val, data);
    onChange(updated);
  };

  // Form change handler
  const handleDataChange = (updates: Partial<ResumeData>) => {
    onChange(updates);
    const merged = { ...data, ...updates };
    setCodeText(dataToLaTeX(merged));
    setPendingChanges((prev) => prev + 1);
  };

  const updateInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    handleDataChange({ personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const handleDownload = () => {
    downloadResumePDF(data, selectedTemplate);
  };

  const SelectedTemplateComponent = getTemplate(selectedTemplate).component;

  const lines = codeText.split("\n");

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0d131f] text-slate-200 font-sans w-full overflow-hidden select-none">
      {/* ----------------- 1. TOP OVERLEAF NAVBAR ----------------- */}
      <header className="h-11 bg-[#131b29] border-b border-[#233045] px-3 flex items-center justify-between z-30 shrink-0 text-xs">
        {/* Left Menu Items */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-[#233045]">
            <VFLogo size={24} showText={false} />
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <button className="hover:text-white hover:bg-[#1f2b3e] px-2 py-1 rounded transition-colors">File</button>
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
          <span className="text-sm">{projectName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-slate-300 hover:text-white hover:bg-[#1f2b3e] px-2.5 py-1 rounded transition-colors">
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

          <button className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors text-xs">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* ----------------- 2. MAIN SPLIT WORKSPACE BODY ----------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ----- LEFT SIDEBAR (File Tree & Outline) ----- */}
        <aside className="w-52 bg-[#121927] border-r border-[#233045] flex flex-col shrink-0">
          {/* File Tree Section */}
          <div className="p-3 border-b border-[#233045]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">File tree</span>
              <div className="flex items-center gap-1">
                <button title="New File" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><FilePlus className="h-3.5 w-3.5" /></button>
                <button title="New Folder" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><FolderPlus className="h-3.5 w-3.5" /></button>
                <button title="Upload" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><Upload className="h-3.5 w-3.5" /></button>
                <button title="Delete" className="hover:text-white p-0.5 rounded hover:bg-[#1f2b3e]"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#1c283c] text-emerald-400 text-xs font-semibold cursor-pointer border-l-2 border-emerald-500">
                <FileCode className="h-4 w-4 shrink-0" />
                <span className="truncate">main.tex</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-xs hover:bg-[#192334] rounded cursor-pointer transition-colors">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">style.cls</span>
              </div>
            </div>
          </div>

          {/* File Outline Section */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              File outline
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    setViewMode("visual");
                  }}
                  className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeSection === sec.id && viewMode === "visual"
                      ? "text-emerald-400 bg-[#1c283c] font-medium"
                      : "hover:text-slate-200 hover:bg-[#192334]"
                  }`}
                >
                  <ChevronRight className="h-3 w-3 opacity-60" />
                  <span className="capitalize">{sec.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ----- MIDDLE PANE (Code & Visual Dual-Mode Editor) ----- */}
        {(layoutMode === "split" || layoutMode === "editor") && (
          <main className="flex-1 bg-[#161f2e] border-r border-[#233045] flex flex-col min-w-0">
            {/* File Tab Header */}
            <div className="h-9 bg-[#121927] border-b border-[#233045] px-3 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-[#161f2e] text-slate-200 px-3 py-1.5 rounded-t font-mono text-xs border-t-2 border-emerald-500 flex items-center gap-2 border-x border-[#233045]">
                  <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                  <span>main.tex</span>
                  <X className="h-3 w-3 opacity-50 hover:opacity-100 cursor-pointer" />
                </div>
              </div>

              {/* Formatting Toolbar & Code/Visual Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border-r border-[#233045] pr-3 text-slate-400">
                  <button title="Bold" className="hover:text-white p-1 rounded hover:bg-[#1f2b3e]"><Bold className="h-3.5 w-3.5" /></button>
                  <button title="Italic" className="hover:text-white p-1 rounded hover:bg-[#1f2b3e]"><Italic className="h-3.5 w-3.5" /></button>
                  <button title="Heading" className="hover:text-white p-1 rounded hover:bg-[#1f2b3e]"><Type className="h-3.5 w-3.5" /></button>
                  <button title="List" className="hover:text-white p-1 rounded hover:bg-[#1f2b3e]"><List className="h-3.5 w-3.5" /></button>
                  <button title="Quote" className="hover:text-white p-1 rounded hover:bg-[#1f2b3e]"><Quote className="h-3.5 w-3.5" /></button>
                </div>

                {/* Code vs Visual Pill Toggle matching Image 2 */}
                <div className="flex items-center bg-[#0d131f] border border-[#26354b] rounded-full p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setViewMode("code")}
                    className={`px-3 py-0.5 rounded-full transition-all ${
                      viewMode === "code"
                        ? "bg-[#10b981] text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setViewMode("visual")}
                    className={`px-3 py-0.5 rounded-full transition-all ${
                      viewMode === "visual"
                        ? "bg-[#10b981] text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Visual
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Editing</span>
                </div>
              </div>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 overflow-hidden relative">
              {viewMode === "code" ? (
                /* CODE MODE: Interactive LaTeX Code Editor with Line Numbers */
                <div className="flex h-full font-mono text-xs overflow-auto bg-[#101726]">
                  {/* Line Numbers Column */}
                  <div className="w-10 bg-[#121a2a] text-slate-500 py-3 select-none text-right pr-3 font-mono border-r border-[#212d42] shrink-0">
                    {lines.map((_, idx) => (
                      <div key={idx} className="leading-6">{idx + 1}</div>
                    ))}
                  </div>

                  {/* Code Textarea */}
                  <textarea
                    value={codeText}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-[#101726] text-slate-200 p-3 leading-6 resize-none focus:outline-none font-mono whitespace-pre text-xs selection:bg-blue-600 selection:text-white"
                  />
                </div>
              ) : (
                /* VISUAL MODE: Form Editor for sections */
                <div className="h-full overflow-y-auto p-6 bg-[#121927]">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-[#233045] pb-3">
                      <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                        <span>{activeSection} Form</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                          Visual Mode
                        </span>
                      </h2>
                      <div className="flex items-center gap-2">
                        {SECTIONS.map((sec) => (
                          <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors ${
                              activeSection === sec.id
                                ? "bg-emerald-600 text-white font-semibold"
                                : "bg-[#1c283c] text-slate-300 hover:bg-[#25344d]"
                            }`}
                          >
                            {sec.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeSection === "personal" && (
                      <PersonalForm data={data} updateInfo={updateInfo} onChange={handleDataChange} />
                    )}
                    {activeSection === "experience" && (
                      <ListEditor
                        items={data.experience}
                        onChange={(items) => handleDataChange({ experience: items })}
                        type="experience"
                      />
                    )}
                    {activeSection === "education" && (
                      <ListEditor
                        items={data.education}
                        onChange={(items) => handleDataChange({ education: items })}
                        type="education"
                      />
                    )}
                    {activeSection === "projects" && (
                      <ListEditor
                        items={data.projects}
                        onChange={(items) => handleDataChange({ projects: items })}
                        type="projects"
                      />
                    )}
                    {activeSection === "skills" && (
                      <SkillsForm data={data.skills} onChange={(s) => handleDataChange({ skills: s })} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ----- RIGHT PANE (Live Compiler Output & PDF Preview Canvas) ----- */}
        {(layoutMode === "split" || layoutMode === "preview") && (
          <div className="flex-1 bg-[#1a2332] flex flex-col min-w-0 relative">
            {/* Compiler Header Controls Bar matching Image 2 */}
            <div className="h-9 bg-[#121927] border-b border-[#233045] px-3 flex items-center justify-between text-xs shrink-0">
              {/* Recompile Button & PDF Download */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRecompile}
                  disabled={isCompiling}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1 rounded font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isCompiling ? "animate-spin" : ""}`} />
                  <span>Recompile</span>
                  {pendingChanges > 0 && (
                    <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                      {pendingChanges}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  title="Download PDF"
                  className="p-1 rounded bg-[#1c283c] hover:bg-[#25344d] text-slate-300 hover:text-white transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Template Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    className="flex items-center gap-1 bg-[#1c283c] hover:bg-[#25344d] text-slate-300 px-2 py-1 rounded text-xs"
                  >
                    <LayoutTemplate className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="capitalize">{selectedTemplate}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>

                  {showTemplateDropdown && (
                    <div className="absolute left-0 mt-1 w-44 bg-[#141c2b] border border-[#233045] rounded-md shadow-2xl z-50 p-1">
                      {TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          onClick={() => {
                            setSelectedTemplate(tmpl.id);
                            setShowTemplateDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                            selectedTemplate === tmpl.id ? "bg-emerald-600 text-white font-semibold" : "text-slate-300 hover:bg-[#1c283c]"
                          }`}
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* View Controls & Zoom Controls matching Image 2 */}
              <div className="flex items-center gap-3 text-slate-400">
                <div className="flex items-center gap-1 bg-[#0d131f] border border-[#26354b] rounded px-2 py-0.5 text-[11px]">
                  <span>1 / 1</span>
                </div>

                <div className="flex items-center gap-1 bg-[#0d131f] border border-[#26354b] rounded px-1.5 py-0.5">
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 0.1, 0.3))}
                    className="hover:text-white px-1"
                  >
                    -
                  </button>
                  <span className="text-[11px] w-8 text-center text-slate-200 font-mono">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 0.1, 1.2))}
                    className="hover:text-white px-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Live Compiler Preview Canvas */}
            <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-[#1a2332]">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                className="bg-white rounded shadow-2xl text-slate-900 transition-all min-h-[1100px] w-[800px] overflow-hidden"
              >
                <SelectedTemplateComponent data={data} isEditing={false} />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 3. FOOTER ACTION BAR ----------------- */}
      <footer className="h-10 bg-[#121927] border-t border-[#233045] px-4 flex items-center justify-between shrink-0 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:text-slate-200 transition-colors flex items-center gap-1">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            <span>Back</span>
          </button>
          <span>•</span>
          <span>VitaForge Compiler Engine v2.4</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onNext}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-7 px-4 text-xs shadow-sm flex items-center gap-1.5"
          >
            <span>Proceed to Preview & Export</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-Components ---

function PersonalForm({ data, updateInfo, onChange }: any) {
  return (
    <div className="space-y-4 text-slate-200">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-8 space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</Label>
          <Input
            value={data.personalInfo.fullName}
            onChange={(e) => updateInfo("fullName", e.target.value)}
            className="bg-[#1c283c] border-[#2b3a52] text-white h-9 text-sm"
            placeholder="e.g. John Doe"
          />
        </div>
        <div className="col-span-12 md:col-span-4 space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</Label>
          <Input
            value={data.personalInfo.title || ""}
            onChange={(e) => updateInfo("title", e.target.value)}
            className="bg-[#1c283c] border-[#2b3a52] text-white h-9 text-sm"
            placeholder="e.g. Product Designer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</Label>
          <Input
            value={data.personalInfo.email}
            onChange={(e) => updateInfo("email", e.target.value)}
            className="bg-[#1c283c] border-[#2b3a52] text-white h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</Label>
          <Input
            value={data.personalInfo.phone}
            onChange={(e) => updateInfo("phone", e.target.value)}
            className="bg-[#1c283c] border-[#2b3a52] text-white h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn</Label>
          <Input
            value={data.personalInfo.linkedin}
            onChange={(e) => updateInfo("linkedin", e.target.value)}
            className="bg-[#1c283c] border-[#2b3a52] text-white h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitHub</Label>
          <Input
            value={data.personalInfo.github || ""}
            onChange={(e) => updateInfo("github", e.target.value)}
            className="bg-[#1c283c] border-[#2b3a52] text-white h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1 pt-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Summary</Label>
        <Textarea
          value={data.summary || ""}
          onChange={(e) => onChange({ summary: e.target.value })}
          className="bg-[#1c283c] border-[#2b3a52] text-white min-h-[100px] text-xs resize-none leading-relaxed"
          placeholder="Brief summary of your professional background..."
        />
      </div>
    </div>
  );
}

function SkillsForm({ data, onChange }: { data: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills List</Label>
      <Textarea
        value={data}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1c283c] border-[#2b3a52] text-white min-h-[120px] text-xs leading-relaxed"
        placeholder="e.g. React, TypeScript, Node.js, Next.js, Python, TailwindCSS"
      />
    </div>
  );
}

function ListEditor({ items = [], onChange, type }: { items: any[]; onChange: (items: any[]) => void; type: string }) {
  const addItem = () => {
    const newItem = { id: `item-${Date.now()}`, role: "", company: "", duration: "", description: "" };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{type} Entries</span>
        <Button onClick={addItem} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Add Entry
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="p-3 bg-[#1c283c] border border-[#2b3a52] rounded-lg space-y-2 relative">
            <button
              onClick={() => removeItem(item.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-400 p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-2 pr-6">
              <Input
                value={item.role || item.title || item.degree || item.name || ""}
                onChange={(e) => updateItem(item.id, item.role ? "role" : item.degree ? "degree" : "name", e.target.value)}
                placeholder="Title / Role / Degree"
                className="bg-[#121927] border-[#2b3a52] text-white text-xs h-8"
              />
              <Input
                value={item.company || item.school || ""}
                onChange={(e) => updateItem(item.id, item.company ? "company" : "school", e.target.value)}
                placeholder="Company / School"
                className="bg-[#121927] border-[#2b3a52] text-white text-xs h-8"
              />
            </div>
            <Textarea
              value={item.description || ""}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              placeholder="Description or bullet points..."
              className="bg-[#121927] border-[#2b3a52] text-white text-xs h-16 resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}