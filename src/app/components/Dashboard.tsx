import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  FileText,
  Search,
  Download,
  Pencil,
  Trash2,
  ChevronDown,
  Info,
  Folder,
  BookOpen,
  HelpCircle,
  User,
  MoreVertical,
  Upload,
  Target,
  X,
  Sparkles,
  Cpu,
  Building2,
  GraduationCap,
  Landmark,
  Share2,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VFLogo } from "@/app/components/VFLogo";
import { ResumeData } from "@/app/types";

export interface SavedResume {
  id: string;
  title: string;
  updatedAt: string; // ISO string
  score?: number;
  data: ResumeData;
}

interface NavOptionDetail {
  title: string;
  category: string;
  subtitle: string;
  badge?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  iconName: string;
}

export function Dashboard({
  resumes = [],
  onNewResume,
  onEditResume,
  onDeleteResume
}: {
  resumes: SavedResume[];
  onNewResume: (mode: 'scratch' | 'upload' | 'target', projectTitle?: string) => void;
  onEditResume: (resume: SavedResume) => void;
  onDeleteResume?: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "your" | "shared" | "archived" | "trash">("projects");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showNewProjectMenu, setShowNewProjectMenu] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  // New Project Modal State (Matching Image 2)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedNewProjectMode, setSelectedNewProjectMode] = useState<'scratch' | 'upload' | 'target'>('scratch');

  // Navigation Dropdown & Detail Modal state
  const [activeNavDropdown, setActiveNavDropdown] = useState<'product' | 'solutions' | null>(null);
  const [selectedOptionModal, setSelectedOptionModal] = useState<NavOptionDetail | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenNewProjectModal = (mode: 'scratch' | 'upload' | 'target' = 'scratch') => {
    setShowNewProjectMenu(false);
    setSelectedNewProjectMode(mode);
    setNewProjectName("");
    setShowNewProjectModal(true);
  };

  const handleCreateProjectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProjectName.trim()) return;
    setShowNewProjectModal(false);
    onNewResume(selectedNewProjectMode, newProjectName.trim());
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveNavDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectOption = (option: NavOptionDetail) => {
    setActiveNavDropdown(null);
    setSelectedOptionModal(option);
  };

  // Simple date formatter to match image: "3 days ago by You"
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today by You";
      if (diffDays === 1) return "1 day ago by You";
      if (diffDays < 30) return `${diffDays} days ago by You`;
      return `${date.toLocaleDateString()} by You`;
    } catch (e) {
      return "Recently by You";
    }
  };

  // Filter resumes
  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredResumes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredResumes.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#111622] text-slate-200 font-sans flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* ----------------- TOP NAVBAR (Header) ----------------- */}
      <header className="h-14 border-b border-[#222d3e] bg-[#161c2a] px-4 md:px-6 flex items-center justify-end gap-6 z-30 sticky top-0">
        {/* Right Nav Links */}
        <div className="flex items-center gap-6 text-sm text-slate-300" ref={dropdownRef}>
          {/* Product Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveNavDropdown(activeNavDropdown === 'product' ? null : 'product')}
              className={`flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-md ${
                activeNavDropdown === 'product' ? 'text-white bg-[#222d3e]' : 'hover:text-white hover:bg-[#1c2436]'
              }`}
            >
              <span>Product</span>
              <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${activeNavDropdown === 'product' ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            <AnimatePresence>
              {activeNavDropdown === 'product' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-72 rounded-xl bg-[#182030] border border-[#2b384e] shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 border-b border-[#253247] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Product Options
                  </div>

                  <div className="py-1 space-y-1">
                    {/* Features Option */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "Features",
                        category: "PRODUCT OPTION",
                        subtitle: "Comprehensive toolkit for professional resume building.",
                        badge: "CORE",
                        description: "Access our comprehensive suite of resume creation tools built to pass ATS scanners and highlight your achievements.",
                        features: [
                          "Real-time ATS keyword checker & scoring",
                          "Multiple professional template designs",
                          "Live PDF preview & instant multi-format export",
                          "Section reordering & smart formatting controls"
                        ],
                        ctaLabel: "Start Building with Features",
                        iconName: "Sparkles"
                      })}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">Features</span>
                          <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">POPULAR</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 mt-0.5">
                          ATS scoring, real-time preview & template suite
                        </p>
                      </div>
                    </button>

                    {/* AI Option */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "AI",
                        category: "PRODUCT OPTION",
                        subtitle: "Next-gen AI assistant for resume writing & matching.",
                        badge: "AI POWERED",
                        description: "Transform generic resumes into high-impact job applications with personalized AI suggestions.",
                        features: [
                          "AI Job Description matching & keyword extraction",
                          "One-click bullet point rewrite & action verb booster",
                          "Automated executive summary generator",
                          "AI Cover Letter matching generator"
                        ],
                        ctaLabel: "Launch AI Resume Builder",
                        iconName: "Cpu"
                      })}
                      className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 shrink-0 mt-0.5">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">AI</span>
                          <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">NEW</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 mt-0.5">
                          AI Mentor, JD Tailoring & smart sentence optimizer
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveNavDropdown(activeNavDropdown === 'solutions' ? null : 'solutions')}
              className={`flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-md ${
                activeNavDropdown === 'solutions' ? 'text-white bg-[#222d3e]' : 'hover:text-white hover:bg-[#1c2436]'
              }`}
            >
              <span>Solutions</span>
              <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${activeNavDropdown === 'solutions' ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            <AnimatePresence>
              {activeNavDropdown === 'solutions' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-80 rounded-xl bg-[#182030] border border-[#2b384e] shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 border-b border-[#253247] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Solutions Options
                  </div>

                  <div className="py-1 space-y-0.5 max-h-[380px] overflow-y-auto">
                    {/* For business */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "For business",
                        category: "SOLUTIONS",
                        subtitle: "Streamline recruitment, candidate sourcing & team resume formatting.",
                        badge: "ENTERPRISE",
                        description: "Empower your HR & talent acquisition team with centralized resume formatting and applicant profile analysis.",
                        features: [
                          "Bulk candidate resume standardization",
                          "Company branded resume exports",
                          "Team access & collaborative candidate management",
                          "Dedicated account support & ATS integration"
                        ],
                        ctaLabel: "Explore Business Solutions",
                        iconName: "Building2"
                      })}
                      className="w-full flex items-start gap-3 p-2 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 shrink-0 mt-0.5">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">For business</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 mt-0.5">
                          HR & recruitment team resume tools
                        </p>
                      </div>
                    </button>

                    {/* For Universities */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "For Universities",
                        category: "SOLUTIONS",
                        subtitle: "Equip students & alumni with professional career-building tools.",
                        badge: "EDUCATION",
                        description: "Partner with VitaForge to provide university-branded resume building portals for students and career advisors.",
                        features: [
                          "Custom university domain & SSO integration",
                          "Advisor review & feedback portal",
                          "Industry-specific graduate templates",
                          "Career center usage analytics & reports"
                        ],
                        ctaLabel: "Request University Portal",
                        iconName: "GraduationCap"
                      })}
                      className="w-full flex items-start gap-3 p-2 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 shrink-0 mt-0.5">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">For Universities</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 mt-0.5">
                          Student career portals & advisor feedback
                        </p>
                      </div>
                    </button>

                    {/* For Government */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "For Government",
                        category: "SOLUTIONS",
                        subtitle: "Federal resume compliance, GS level positioning & public sector standards.",
                        badge: "PUBLIC SECTOR",
                        description: "Create compliant Federal resumes formatted specifically for USAJOBS and public sector applications.",
                        features: [
                          "USAJOBS compliant federal template layout",
                          "Mandatory federal field validation",
                          "Security clearance & veteran preference formatting",
                          "SOC & CIP job code integration"
                        ],
                        ctaLabel: "Build Federal Resume",
                        iconName: "Landmark"
                      })}
                      className="w-full flex items-start gap-3 p-2 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 shrink-0 mt-0.5">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">For Government</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 mt-0.5">
                          USAJOBS compliant federal resumes
                        </p>
                      </div>
                    </button>

                    {/* For Publishers */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "For Publishers",
                        category: "SOLUTIONS",
                        subtitle: "Embeddable resume tools & white-label career widget API.",
                        badge: "API & WIDGETS",
                        description: "Integrate VitaForge's resume building engine directly into your job board, publication, or career portal.",
                        features: [
                          "White-label embeddable iframe / React SDK",
                          "RESTful API for resume parsing & PDF rendering",
                          "Custom theme & branding options",
                          "Monetization & affiliate revenue sharing"
                        ],
                        ctaLabel: "Explore Developer API",
                        iconName: "Share2"
                      })}
                      className="w-full flex items-start gap-3 p-2 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 shrink-0 mt-0.5">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">For Publishers</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 mt-0.5">
                          Embeddable widgets & career site APIs
                        </p>
                      </div>
                    </button>

                    {/* Customer Stories */}
                    <button
                      onClick={() => handleSelectOption({
                        title: "Customer Stories",
                        category: "SOLUTIONS",
                        subtitle: "See how 50,000+ job seekers landed offers at leading companies.",
                        badge: "SUCCESS STORIES",
                        description: "Real stories from professionals who transformed their job search and secured interviews at Google, Amazon, Microsoft, and top startups.",
                        features: [
                          "94% ATS pass rate improvement across candidates",
                          "Average 3x increase in recruiter interview callbacks",
                          "Transition success stories for career switchers",
                          "Over 120,000+ resumes generated globally"
                        ],
                        ctaLabel: "Start Building Your Resume",
                        iconName: "Users"
                      })}
                      className="w-full flex items-start gap-3 p-2 rounded-lg text-left hover:bg-[#232e44] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 shrink-0 mt-0.5">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">Customer Stories</span>
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-1 mt-0.5">
                          Case studies & success testimonials
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a onClick={() => onNewResume('scratch')} className="hover:text-white transition-colors cursor-pointer px-2 py-1">
            Templates
          </a>
          <a onClick={() => onNewResume('scratch')} className="hover:text-white transition-colors cursor-pointer px-2 py-1">
            Pricing
          </a>
        </div>

        <div className="h-4 w-px bg-[#263143] hidden md:block" />

        {/* Right Status & Upgrade */}
        <div className="flex items-center gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>You're on the <strong className="text-white font-semibold">free plan</strong></span>
            <button title="Plan Details" className="text-blue-400 hover:text-blue-300">
              <Info className="h-4 w-4" />
            </button>
          </div>
          <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors text-xs">
            Upgrade
          </button>
        </div>
      </header>

      {/* ----------------- MAIN BODY (Sidebar + Workspace) ----------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ----------------- SIDEBAR ----------------- */}
        <aside className="w-64 bg-[#141a26] border-r border-[#222d3e] flex flex-col justify-between shrink-0 p-4 select-none min-h-[calc(100vh-3.5rem)]">
          <div className="space-y-6">
            {/* Logo Brand Header (VF Logo VitaForge) */}
            <div className="px-2 pt-1 pb-3 border-b border-[#222d3e]/80">
              <VFLogo size={34} showText={true} textColor="text-white" />
            </div>

            {/* Primary Navigation Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "projects"
                    ? "bg-[#14532d] text-white font-semibold"
                    : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                }`}
              >
                <Folder className="h-4 w-4 text-emerald-400" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => setActiveTab("your")}
                className={`w-full flex items-center gap-3 px-8 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === "your"
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Your projects</span>
              </button>

              <button
                onClick={() => setActiveTab("shared")}
                className={`w-full flex items-center gap-3 px-8 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === "shared"
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Shared with you</span>
              </button>

              <button
                onClick={() => setActiveTab("archived")}
                className={`w-full flex items-center gap-3 px-8 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === "archived"
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Archived projects</span>
              </button>
            </nav>

            <div className="h-px bg-[#222d3e] my-3" />

            {/* Secondary Navigation Items */}
            <nav className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-[#1c2436] cursor-pointer group">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
                  <span>Library</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                  New
                </span>
              </div>

              <button
                onClick={() => setActiveTab("trash")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === "trash"
                    ? "bg-[#2a171a] text-red-400 font-semibold"
                    : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-slate-400" />
                  <span>Trash</span>
                </div>
              </button>

              <div className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-[#1c2436] cursor-pointer group">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
                  <span>Help</span>
                </div>
                <MoreVertical className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>

              <div className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-[#1c2436] cursor-pointer group">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
                  <span>Account</span>
                </div>
                <MoreVertical className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
            </nav>
          </div>

          {/* Footer Brand Credit */}
          <div className="pt-4 border-t border-[#222d3e]/60 text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
            <span>VF VITAFORGE</span>
          </div>
        </aside>

        {/* ----------------- MAIN WORKSPACE PANEL ----------------- */}
        <main className="flex-1 p-6 md:p-8 bg-[#111622] overflow-y-auto">
          {/* Main Card Container (Overleaf Dark Box) */}
          <div className="max-w-6xl mx-auto bg-[#182030] rounded-xl border border-[#253248] shadow-2xl p-6 space-y-6">
            
            {/* Panel Top Header: "All projects" & "New project" button */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-white tracking-tight">All projects</h1>

              {/* New Project Green Action Button */}
              <div className="relative">
                <button
                  onClick={() => setShowNewProjectMenu(!showNewProjectMenu)}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>New project</span>
                </button>

                {/* Dropdown Menu matching Image 1 exact Overleaf style */}
                <AnimatePresence>
                  {showNewProjectMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-64 bg-[#141b27] border border-[#263347] rounded-md shadow-2xl z-50 overflow-hidden text-xs text-slate-200 font-sans"
                    >
                      {/* Section 1 */}
                      <button
                        onClick={() => handleOpenNewProjectModal('scratch')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-100 hover:bg-[#1d2738] transition-colors"
                      >
                        Blank project
                      </button>

                      <div className="h-px bg-[#233045] my-1" />

                      {/* Section 2: Import options */}
                      <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Import
                      </div>
                      <button
                        onClick={() => handleOpenNewProjectModal('upload')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors"
                      >
                        Upload resume (PDF / DOCX)
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('upload')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-300 transition-colors"
                      >
                        Existing project (.zip)
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('upload')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-300 transition-colors"
                      >
                        Word document
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('upload')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-300 transition-colors"
                      >
                        Markdown document
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('scratch')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-300 transition-colors"
                      >
                        GitHub repo
                      </button>

                      <div className="h-px bg-[#233045] my-1" />

                      {/* Section 3: Templates */}
                      <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Templates
                      </div>
                      <button
                        onClick={() => handleOpenNewProjectModal('scratch')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors"
                      >
                        Example project
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('target')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors"
                      >
                        AI Targeted Resume
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('scratch')}
                        className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors flex items-center justify-between"
                      >
                        <span>More templates</span>
                        <span className="text-slate-400">&gt;</span>
                      </button>

                      <div className="h-px bg-[#233045] my-2" />

                      {/* Bottom Affiliation Box matching Image 1 */}
                      <div className="px-4 py-3 bg-[#0f1520] text-center space-y-2 border-t border-[#233045]">
                        <p className="text-[11px] text-slate-400">
                          Are you affiliated with an institution?
                        </p>
                        <button
                          onClick={() => setShowNewProjectMenu(false)}
                          className="w-full rounded-full border border-slate-400 hover:border-slate-200 hover:bg-[#1f2b3e] text-white font-medium py-1.5 px-3 text-xs transition-colors"
                        >
                          Add affiliation
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Dark Search Input Field */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search in all projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111724] border border-[#27354c] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ----------------- PROJECTS TABLE ----------------- */}
            <div className="border border-[#27354c] rounded-md overflow-hidden bg-[#141b28]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#27354c] bg-[#182132] text-slate-300 font-semibold">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredResumes.length > 0 && selectedIds.length === filteredResumes.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-700 bg-[#111724] text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-200">Title</th>
                    <th className="py-3 px-4 font-semibold text-slate-200">Owner</th>
                    <th className="py-3 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <span>Last modified</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233045]">
                  {filteredResumes.length > 0 ? (
                    filteredResumes.map((resume) => {
                      const isSelected = selectedIds.includes(resume.id);
                      return (
                        <tr
                          key={resume.id}
                          className={`group hover:bg-[#1f2b40] transition-colors ${
                            isSelected ? "bg-[#1d293d]" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(resume.id)}
                              className="rounded border-slate-700 bg-[#111724] text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                          </td>

                          {/* Resume Title */}
                          <td className="py-3.5 px-4 font-medium">
                            <button
                              onClick={() => onEditResume(resume)}
                              className="text-slate-200 hover:text-emerald-400 text-left transition-colors flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span className="hover:underline underline-offset-4">
                                {resume.title || "Untitled Resume"}
                              </span>
                            </button>
                          </td>

                          {/* Owner */}
                          <td className="py-3.5 px-4 text-slate-300">You</td>

                          {/* Last modified */}
                          <td className="py-3.5 px-4 text-slate-300 text-xs">
                            {formatDate(resume.updatedAt)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              {/* Edit Action */}
                              <button
                                onClick={() => onEditResume(resume)}
                                title="Edit Project"
                                className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-[#283752] rounded transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* Quick Download Action */}
                              <button
                                onClick={() => onEditResume(resume)}
                                title="Download PDF"
                                className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-[#283752] rounded transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </button>

                              {/* Delete Action */}
                              {onDeleteResume && (
                                <button
                                  onClick={() => onDeleteResume(resume.id)}
                                  title="Delete Project"
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#382025] rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    /* Empty State Row */
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto text-slate-500">
                          <Folder className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-200">
                            {searchQuery ? "No matching projects found" : "No projects yet"}
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {searchQuery
                              ? `No resumes match "${searchQuery}". Try a different keyword.`
                              : "Click 'New project' above to start building your professional resume."}
                          </p>
                        </div>
                        {!searchQuery && (
                          <button
                            onClick={() => onNewResume('scratch')}
                            className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-md font-medium text-xs inline-flex items-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create First Project</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Project Counter Footer matching Image 1 */}
            <div className="text-center text-xs text-slate-400 py-2">
              Showing {filteredResumes.length} out of {resumes.length} projects.
            </div>
          </div>
        </main>
      </div>

      {/* ----------------- COOKIE NOTICE BANNER (Matching Image 1 bottom) ----------------- */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="border-t border-[#222d3e] bg-[#0d121c] px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300 z-40"
          >
            <p className="max-w-4xl leading-relaxed">
              We use cookies to improve your experience on our site, for analytics, and to support marketing, which may involve the sharing of data. You can find out more in our cookie policy.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowCookieBanner(false)}
                className="text-slate-300 hover:text-white underline underline-offset-2"
              >
                Essential cookies only
              </button>
              <button
                onClick={() => setShowCookieBanner(false)}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3.5 py-1.5 rounded font-medium transition-colors"
              >
                Accept all cookies
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- NAV OPTION DETAIL MODAL ----------------- */}
      <AnimatePresence>
        {selectedOptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#161d2b] border border-[#2b384e] rounded-2xl shadow-2xl overflow-hidden text-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#253247] relative bg-gradient-to-r from-[#192336] to-[#161d2b]">
                <button
                  onClick={() => setSelectedOptionModal(null)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-[#253247] rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {selectedOptionModal.category}
                  </span>
                  {selectedOptionModal.badge && (
                    <span className="text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                      {selectedOptionModal.badge}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {selectedOptionModal.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedOptionModal.subtitle}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedOptionModal.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Key Capabilities & Features</h4>
                  <div className="grid gap-2">
                    {selectedOptionModal.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-[#1c2638] p-2.5 rounded-lg border border-[#27344a]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-[#111724] border-t border-[#253247] flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedOptionModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedOptionModal(null);
                    onNewResume('scratch');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-colors"
                >
                  <span>{selectedOptionModal.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- NEW PROJECT MODAL (Matching Image 2) ----------------- */}
      <AnimatePresence>
        {showNewProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden font-sans border border-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">New project</h3>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body Form */}
              <form onSubmit={handleCreateProjectSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Project name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-blue-500 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="px-4 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      newProjectName.trim()
                        ? "bg-[#2563eb] text-white hover:bg-blue-700 cursor-pointer shadow-sm"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
