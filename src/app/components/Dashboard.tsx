import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
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
  Star,
  RotateCcw,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Keyboard,
  Lightbulb,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  Eye,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VFLogo } from "@/app/components/VFLogo";
import { ResumeData } from "@/app/types";
import { TEMPLATES, Template, TemplateId } from "@/app/templates";

export interface SavedResume {
  id: string;
  title: string;
  updatedAt: string; // ISO string
  score?: number;
  data: ResumeData;
  isArchived?: boolean;
  isTrash?: boolean;
  deletedAt?: string;
  isShared?: boolean;
  sharedBy?: string;
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
  user,
  onUpdateUser,
  onNewResume,
  onEditResume,
  onDeleteResume,
  onRestoreResume,
  onPermanentDelete,
  onArchiveResume,
  onEmptyTrash,
  onLogout,
  tab
}: {
  resumes: SavedResume[];
  user?: { name: string; email: string } | null;
  onUpdateUser?: (userData: { name: string; email: string }) => void;
  onNewResume: (mode: 'scratch' | 'upload' | 'target', projectTitle?: string, templateId?: any) => void;
  onEditResume: (resume: SavedResume) => void;
  onDeleteResume?: (id: string) => void;
  onRestoreResume?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onArchiveResume?: (id: string) => void;
  onEmptyTrash?: () => void;
  onLogout?: () => void;
  tab?: "projects" | "your" | "shared" | "archived" | "library" | "trash" | "help" | "account";
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): "your" | "shared" | "archived" | "library" | "trash" | "help" | "account" => {
    if (tab) {
      if (tab === "projects") return "your";
      return tab;
    }
    const p = location.pathname;
    if (p.startsWith("/shared")) return "shared";
    if (p.startsWith("/archived")) return "archived";
    if (p.startsWith("/library")) return "library";
    if (p.startsWith("/trash")) return "trash";
    if (p.startsWith("/help")) return "help";
    if (p.startsWith("/account")) return "account";
    return "your";
  };

  const currentTab = getActiveTab();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showNewProjectMenu, setShowNewProjectMenu] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  // New Project Modal State (Matching Image 2)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedNewProjectMode, setSelectedNewProjectMode] = useState<'scratch' | 'upload' | 'target'>('scratch');

  // Library State
  const [libraryCategory, setLibraryCategory] = useState<"all" | "ats" | "tech" | "academic" | "modern">("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Help State
  const [helpSearch, setHelpSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactFeedback, setContactFeedback] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Account State
  const [profileName, setProfileName] = useState(user?.name || "R Karthik");
  const [profileEmail, setProfileEmail] = useState(user?.email || "henry@example.com");
  const [profileRole, setProfileRole] = useState("Frontend Developer & Designer");
  const [compilerPref, setCompilerPref] = useState<"pdflatex" | "xelatex" | "lualatex">("pdflatex");
  const [autoSavePref, setAutoSavePref] = useState(true);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
    if (user?.email) setProfileEmail(user.email);
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ name: profileName.trim(), email: profileEmail.trim() });
    }
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  // Subsets for each project view
  const yourResumes = resumes.filter((r) => !r.isArchived && !r.isTrash && !r.isShared);
  const sharedResumes = resumes.filter((r) => r.isShared && !r.isTrash);
  const archivedResumes = resumes.filter((r) => r.isArchived && !r.isTrash);
  const trashResumes = resumes.filter((r) => r.isTrash);
  const trashCount = trashResumes.length;

  const getTargetResumes = () => {
    switch (currentTab) {
      case "shared":
        return sharedResumes;
      case "archived":
        return archivedResumes;
      case "trash":
        return trashResumes;
      default:
        return yourResumes;
    }
  };

  const currentList = getTargetResumes();

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
  const filteredResumes = currentList.filter((r) =>
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
    <div className="h-full w-full bg-[#111622] text-slate-200 font-sans flex flex-col selection:bg-emerald-600 selection:text-white overflow-hidden">
      {/* ----------------- TOP NAVBAR (Header) ----------------- */}
      <header className="h-14 border-b border-[#222d3e] bg-[#161c2a] px-4 md:px-6 flex items-center justify-end gap-6 z-30 sticky top-0 shrink-0">
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
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ----------------- SIDEBAR ----------------- */}
        <aside className="w-64 bg-[#141a26] border-r border-[#222d3e] flex flex-col justify-between shrink-0 p-4 select-none h-full overflow-y-auto">
          <div className="space-y-6">
            {/* Logo Brand Header (VF Logo VitaForge) */}
            <div className="px-2 pt-1 pb-3 border-b border-[#222d3e]/80">
              <VFLogo size={34} showText={true} textColor="text-white" />
            </div>

            {/* Primary Navigation Menu */}
            <nav className="space-y-1" aria-label="Projects navigation">
              {/* 1. Projects */}
              <NavLink
                to="/projects"
                className={() =>
                  `w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === "your" || currentTab === "shared" || currentTab === "archived"
                      ? "bg-[#14532d] text-white font-semibold"
                      : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                  }`
                }
              >
                <Folder className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Projects</span>
              </NavLink>

              {/* 2. Your projects */}
              <NavLink
                to="/projects"
                end
                className={() =>
                  `w-full flex items-center gap-3 px-8 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "your"
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                <span>Your projects</span>
              </NavLink>

              {/* 3. Shared with you */}
              <NavLink
                to="/shared"
                className={() =>
                  `w-full flex items-center gap-3 px-8 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "shared"
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                <span>Shared with you</span>
              </NavLink>

              {/* 4. Archived projects */}
              <NavLink
                to="/archived"
                className={() =>
                  `w-full flex items-center gap-3 px-8 py-1.5 rounded-md text-xs transition-colors ${
                    currentTab === "archived"
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`
                }
              >
                <span>Archived projects</span>
              </NavLink>
            </nav>

            <div className="h-px bg-[#222d3e] my-3" />

            {/* Secondary Navigation Items */}
            <nav className="space-y-1" aria-label="Secondary navigation">
              {/* 5. Library */}
              <NavLink
                to="/library"
                className={() =>
                  `w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    currentTab === "library"
                      ? "bg-[#1c2436] text-white font-semibold"
                      : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={`h-4 w-4 ${currentTab === "library" ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>Library</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                  New
                </span>
              </NavLink>

              {/* 6. Trash */}
              <NavLink
                to="/trash"
                className={() =>
                  `w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    currentTab === "trash"
                      ? "bg-[#2a171a] text-red-400 font-semibold"
                      : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Trash2 className={`h-4 w-4 ${currentTab === "trash" ? "text-red-400" : "text-slate-400"}`} />
                  <span>Trash</span>
                </div>
                {trashCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-500/30">
                    {trashCount}
                  </span>
                )}
              </NavLink>

              {/* 7. Help */}
              <NavLink
                to="/help"
                className={() =>
                  `w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    currentTab === "help"
                      ? "bg-[#1c2436] text-white font-semibold"
                      : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`h-4 w-4 ${currentTab === "help" ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>Help</span>
                </div>
              </NavLink>

              {/* 8. Account */}
              <NavLink
                to="/account"
                className={() =>
                  `w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    currentTab === "account"
                      ? "bg-[#1c2436] text-white font-semibold"
                      : "text-slate-300 hover:bg-[#1c2436] hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <User className={`h-4 w-4 ${currentTab === "account" ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>Account</span>
                </div>
              </NavLink>
            </nav>
          </div>

          {/* Footer Brand Credit */}
          <div className="pt-4 border-t border-[#222d3e]/60 text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
            <span>VF VITAFORGE</span>
          </div>
        </aside>

        {/* ----------------- MAIN WORKSPACE PANEL ----------------- */}
        <main className="flex-1 min-h-0 p-4 md:p-8 bg-[#111622] overflow-y-auto">
          {/* ===================== VIEW 1: PROJECTS & YOUR PROJECTS ===================== */}
          {(currentTab === "your") && (
            <div className="max-w-6xl mx-auto bg-[#182030] rounded-xl border border-[#253248] shadow-2xl p-6 space-y-6">
              {/* Panel Top Header: "All projects" & "New project" button */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">All projects</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage and edit your active resume projects</p>
                </div>

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
                          onClick={() => navigate("/library")}
                          className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors"
                        >
                          Browse template library
                        </button>
                        <button
                          onClick={() => handleOpenNewProjectModal('target')}
                          className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors"
                        >
                          AI Targeted Resume
                        </button>
                        <button
                          onClick={() => navigate("/library")}
                          className="w-full px-4 py-2 text-left hover:bg-[#1d2738] text-slate-200 transition-colors flex items-center justify-between"
                        >
                          <span>More templates</span>
                          <span className="text-slate-400">&gt;</span>
                        </button>

                        <div className="h-px bg-[#233045] my-2" />

                        {/* Bottom Affiliation Box */}
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

              {/* Projects Table */}
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
                            <td className="py-3.5 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(resume.id)}
                                className="rounded border-slate-700 bg-[#111724] text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                              />
                            </td>

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

                            <td className="py-3.5 px-4 text-slate-300">You</td>

                            <td className="py-3.5 px-4 text-slate-300 text-xs">
                              {formatDate(resume.updatedAt)}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onEditResume(resume)}
                                  title="Edit Project"
                                  className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-[#283752] rounded transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => onEditResume(resume)}
                                  title="Download PDF"
                                  className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-[#283752] rounded transition-colors"
                                >
                                  <Download className="h-4 w-4" />
                                </button>

                                {onArchiveResume && (
                                  <button
                                    onClick={() => onArchiveResume(resume.id)}
                                    title="Archive Project"
                                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#383225] rounded transition-colors"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </button>
                                )}

                                {onDeleteResume && (
                                  <button
                                    onClick={() => onDeleteResume(resume.id)}
                                    title="Move to Trash"
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

              {/* Project Counter Footer */}
              <div className="text-center text-xs text-slate-400 py-2">
                Showing {filteredResumes.length} out of {yourResumes.length} projects.
              </div>
            </div>
          )}

          {/* ===================== VIEW 2: SHARED WITH YOU ===================== */}
          {currentTab === "shared" && (
            <div className="max-w-6xl mx-auto bg-[#182030] rounded-xl border border-[#253248] shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Shared with you</h1>
                  <p className="text-xs text-slate-400 mt-1">Resumes and templates shared by collaborators, teammates, or reviewers</p>
                </div>
                <button
                  onClick={() => handleOpenNewProjectModal('scratch')}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New project</span>
                </button>
              </div>

              {sharedResumes.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in shared projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111724] border border-[#27354c] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              <div className="border border-[#27354c] rounded-md overflow-hidden bg-[#141b28]">
                {filteredResumes.length > 0 ? (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#27354c] bg-[#182132] text-slate-300 font-semibold">
                        <th className="py-3 px-4 font-semibold text-slate-200">Title</th>
                        <th className="py-3 px-4 font-semibold text-slate-200">Shared By</th>
                        <th className="py-3 px-4 font-semibold text-slate-200">Last modified</th>
                        <th className="py-3 px-4 font-semibold text-slate-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#233045]">
                      {filteredResumes.map((resume) => (
                        <tr key={resume.id} className="hover:bg-[#1f2b40] transition-colors">
                          <td className="py-3.5 px-4 font-medium">
                            <button
                              onClick={() => onEditResume(resume)}
                              className="text-slate-200 hover:text-emerald-400 text-left transition-colors flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span className="hover:underline underline-offset-4">{resume.title}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 text-xs">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                              {resume.sharedBy || "Team Member"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 text-xs">{formatDate(resume.updatedAt)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onEditResume(resume)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                              >
                                Open
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-4 px-4">
                    <div className="h-14 w-14 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto text-emerald-400 border border-[#2d3a50]">
                      <Users className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <p className="font-semibold text-base text-slate-200">No shared projects yet</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        When teammates, hiring managers, or career advisors share resumes or templates with you, they'll appear here.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => navigate("/library")}
                        className="bg-[#222d3e] hover:bg-[#2b394f] text-slate-200 px-4 py-2 rounded-md text-xs font-medium transition-colors"
                      >
                        Explore Templates
                      </button>
                      <button
                        onClick={() => handleOpenNewProjectModal('scratch')}
                        className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-md text-xs font-medium transition-colors"
                      >
                        Create Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== VIEW 3: ARCHIVED PROJECTS ===================== */}
          {currentTab === "archived" && (
            <div className="max-w-6xl mx-auto bg-[#182030] rounded-xl border border-[#253248] shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Archived projects</h1>
                  <p className="text-xs text-slate-400 mt-1">Archived resumes are hidden from your active list. You can restore them anytime.</p>
                </div>
              </div>

              {archivedResumes.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in archived projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111724] border border-[#27354c] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              <div className="border border-[#27354c] rounded-md overflow-hidden bg-[#141b28]">
                {filteredResumes.length > 0 ? (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#27354c] bg-[#182132] text-slate-300 font-semibold">
                        <th className="py-3 px-4 font-semibold text-slate-200">Title</th>
                        <th className="py-3 px-4 font-semibold text-slate-200">Status</th>
                        <th className="py-3 px-4 font-semibold text-slate-200">Last modified</th>
                        <th className="py-3 px-4 font-semibold text-slate-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#233045]">
                      {filteredResumes.map((resume) => (
                        <tr key={resume.id} className="hover:bg-[#1f2b40] transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <Archive className="h-4 w-4 text-amber-400 shrink-0" />
                              <span>{resume.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/20">
                              Archived
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 text-xs">{formatDate(resume.updatedAt)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onRestoreResume && (
                                <button
                                  onClick={() => onRestoreResume(resume.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                                  title="Restore to active projects"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  <span>Restore</span>
                                </button>
                              )}
                              {onDeleteResume && (
                                <button
                                  onClick={() => onDeleteResume(resume.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#382025] rounded transition-colors"
                                  title="Move to trash"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-4 px-4">
                    <div className="h-14 w-14 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto text-amber-400 border border-[#2d3a50]">
                      <Archive className="h-7 w-7" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="font-semibold text-base text-slate-200">No archived projects</p>
                      <p className="text-xs text-slate-400">
                        Archive older or inactive projects from Your Projects to keep your dashboard clean and focused.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/projects")}
                      className="bg-[#222d3e] hover:bg-[#2b394f] text-slate-200 px-4 py-2 rounded-md text-xs font-medium transition-colors"
                    >
                      Back to Your Projects
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== VIEW 4: TEMPLATE LIBRARY ===================== */}
          {currentTab === "library" && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-[#182030] via-[#1c263c] to-[#182030] rounded-xl border border-[#27354d] p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        New
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">VitaForge Template Catalog</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Resume Template Library</h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                      Choose from our curated collection of ATS-proven, recruiter-approved LaTeX and modern templates. Click any template to immediately start building.
                    </p>
                  </div>
                  <button
                    onClick={() => onNewResume('scratch', 'Custom Resume')}
                    className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-lg font-medium text-xs shrink-0 flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Start Blank Resume</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#182030] p-4 rounded-xl border border-[#253248]">
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { id: "all", label: "All Templates" },
                    { id: "ats", label: "ATS-Optimized" },
                    { id: "tech", label: "Tech & Engineering" },
                    { id: "academic", label: "Academic & Research" },
                    { id: "modern", label: "Modern & Creative" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setLibraryCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                        libraryCategory === cat.id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-[#141b27] text-slate-400 hover:text-white hover:bg-[#1f2b3e]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full bg-[#111724] border border-[#27354c] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.filter((t) => {
                  const matchesSearch = t.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
                    t.description.toLowerCase().includes(librarySearch.toLowerCase());
                  if (!matchesSearch) return false;
                  if (libraryCategory === "ats") return t.id === "ats-optimized" || t.id === "classic";
                  if (libraryCategory === "tech") return t.id === "tech-pro" || t.id === "modern";
                  if (libraryCategory === "academic") return t.id === "academic-pro" || t.id === "sidebar-left";
                  if (libraryCategory === "modern") return t.id === "modern" || t.id === "tech-pro";
                  return true;
                }).map((template) => {
                  const getBadge = () => {
                    switch (template.id) {
                      case "ats-optimized": return { label: "ATS 99%", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
                      case "tech-pro": return { label: "FAANG Ready", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
                      case "academic-pro": return { label: "Academic", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
                      case "classic": return { label: "Minimalist", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
                      case "modern": return { label: "Creative", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
                      default: return { label: "Professional", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
                    }
                  };
                  const badge = getBadge();

                  return (
                    <div
                      key={template.id}
                      className="bg-[#182030] rounded-xl border border-[#253248] hover:border-emerald-500/50 shadow-xl overflow-hidden flex flex-col group transition-all duration-200 hover:-translate-y-1"
                    >
                      {/* Thumbnail Mockup */}
                      <div className="h-44 bg-[#0d121c] p-4 flex flex-col justify-between relative border-b border-[#232f44]">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">LaTeX</span>
                        </div>

                        {/* Visual Mock Lines */}
                        <div className="space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <div className="h-3 w-1/3 bg-slate-400 rounded mx-auto" />
                          <div className="h-1.5 w-1/2 bg-slate-600 rounded mx-auto" />
                          <div className="h-px bg-slate-700 my-2" />
                          <div className="space-y-1">
                            <div className="h-2 w-3/4 bg-slate-600 rounded" />
                            <div className="h-1.5 w-full bg-slate-700 rounded" />
                            <div className="h-1.5 w-5/6 bg-slate-700 rounded" />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-medium">Overleaf Compatible</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[#232f44]">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-[#2b394f] text-slate-300 hover:text-white hover:bg-[#222d3e] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => onNewResume('scratch', `${template.name} Resume`, template.id)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
                          >
                            <span>Use Template</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== VIEW 5: TRASH ===================== */}
          {currentTab === "trash" && (
            <div className="max-w-6xl mx-auto bg-[#182030] rounded-xl border border-[#253248] shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Trash</h1>
                  <p className="text-xs text-slate-400 mt-1">Deleted resumes remain here. You can restore them or delete them permanently.</p>
                </div>
                {trashResumes.length > 0 && onEmptyTrash && (
                  <button
                    onClick={onEmptyTrash}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Empty Trash</span>
                  </button>
                )}
              </div>

              {trashResumes.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in trash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111724] border border-[#27354c] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              <div className="border border-[#27354c] rounded-md overflow-hidden bg-[#141b28]">
                {filteredResumes.length > 0 ? (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#27354c] bg-[#182132] text-slate-300 font-semibold">
                        <th className="py-3 px-4 font-semibold text-slate-200">Title</th>
                        <th className="py-3 px-4 font-semibold text-slate-200">Deleted Date</th>
                        <th className="py-3 px-4 font-semibold text-slate-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#233045]">
                      {filteredResumes.map((resume) => (
                        <tr key={resume.id} className="hover:bg-[#1f2b40] transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-red-400 shrink-0" />
                              <span>{resume.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-xs">
                            {resume.deletedAt ? formatDate(resume.deletedAt) : formatDate(resume.updatedAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onRestoreResume && (
                                <button
                                  onClick={() => onRestoreResume(resume.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                                  title="Restore project"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  <span>Restore</span>
                                </button>
                              )}
                              {onPermanentDelete && (
                                <button
                                  onClick={() => onPermanentDelete(resume.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded text-xs font-medium transition-colors"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Forever</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-4 px-4">
                    <div className="h-14 w-14 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto text-red-400/80 border border-[#2d3a50]">
                      <Trash2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="font-semibold text-base text-slate-200">Trash is empty</p>
                      <p className="text-xs text-slate-400">
                        Items moved to trash will appear here for safe keeping before permanent deletion.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/projects")}
                      className="bg-[#222d3e] hover:bg-[#2b394f] text-slate-200 px-4 py-2 rounded-md text-xs font-medium transition-colors"
                    >
                      Back to Projects
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== VIEW 6: HELP ===================== */}
          {currentTab === "help" && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Help Banner */}
              <div className="bg-gradient-to-r from-[#182030] to-[#1c263c] rounded-xl border border-[#27354d] p-6 shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <HelpCircle className="h-6 w-6 text-emerald-400" />
                      <span>VitaForge Help & Support Center</span>
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">
                      Quick shortcuts, LaTeX syntax tips, and frequently asked questions.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/projects")}
                    className="bg-[#222d3e] hover:bg-[#2b394f] text-slate-200 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Back to Projects
                  </button>
                </div>

                {/* Help Search */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search shortcuts, LaTeX commands, or FAQs..."
                    value={helpSearch}
                    onChange={(e) => setHelpSearch(e.target.value)}
                    className="w-full bg-[#111724] border border-[#27354c] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Grid: Shortcuts + Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keyboard Shortcuts Card */}
                <div className="bg-[#182030] rounded-xl border border-[#253248] p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm border-b border-[#233045] pb-3">
                    <Keyboard className="h-4 w-4 text-emerald-400" />
                    <span>Essential Keyboard Shortcuts</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: "Ctrl + S", desc: "Save current project and synchronize LaTeX draft" },
                      { key: "Ctrl + Enter", desc: "Recompile LaTeX code to instant PDF preview" },
                      { key: "Ctrl + F", desc: "Search within active document or editor file" },
                      { key: "Ctrl + Shift + F", desc: "Global search across all project files" },
                      { key: "Click on PDF", desc: "SyncTeX bi-directional cursor jump to source line" },
                      { key: "Esc", desc: "Close open modals, dropdowns, and overlays" }
                    ].map((sc) => (
                      <div key={sc.key} className="flex items-center justify-between p-2 rounded-lg bg-[#121824] border border-[#202d42] text-xs">
                        <span className="text-slate-300 text-xs">{sc.desc}</span>
                        <kbd className="bg-[#1c2738] text-emerald-300 px-2 py-1 rounded text-[11px] font-mono border border-[#2a3c56] shrink-0 ml-2">
                          {sc.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LaTeX Quick Tips Card */}
                <div className="bg-[#182030] rounded-xl border border-[#253248] p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm border-b border-[#233045] pb-3">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span>LaTeX Formatting Tips</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Modular Subfiles",
                        code: "\\input{sections/experience.tex}",
                        desc: "Break long resumes into manageable components for easier editing."
                      },
                      {
                        title: "Escaping Special Characters",
                        code: "\\%  \\&  \\$  \\#  \\_  \\{  \\}",
                        desc: "Always precede reserved symbols with a backslash."
                      },
                      {
                        title: "Precision Spacing",
                        code: "\\vspace{-4pt}  \\hfill  \\textbf{Title}",
                        desc: "Use negative vspace and hfill for tight single-page layouts."
                      }
                    ].map((tip) => (
                      <div key={tip.title} className="bg-[#121824] p-3 rounded-lg border border-[#202d42] space-y-1.5">
                        <div className="font-semibold text-xs text-slate-200">{tip.title}</div>
                        <pre className="bg-[#0b1018] text-emerald-400 p-2 rounded font-mono text-[11px] border border-[#1f2c40] overflow-x-auto">
                          {tip.code}
                        </pre>
                        <p className="text-[11px] text-slate-400">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-[#182030] rounded-xl border border-[#253248] p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
                <div className="space-y-2.5">
                  {[
                    {
                      q: "How does the ATS Keyword Scoring system work?",
                      a: "VitaForge analyzes your resume against industry job description benchmarks and standard Applicant Tracking System (ATS) parsers. It checks section headings, bullet-point impact metrics, keyword density, and clean single-column structure."
                    },
                    {
                      q: "Can I export high-resolution PDFs without watermarks?",
                      a: "Yes! VitaForge provides instant vector PDF generation through our embedded LaTeX compilation engine and client-side PDF renderer with zero watermarks on all plans."
                    },
                    {
                      q: "How do I restore deleted projects?",
                      a: "Navigate to the 'Trash' section in the sidebar. Any resume deleted within the last 30 days can be restored back to your active list with a single click."
                    },
                    {
                      q: "What LaTeX packages are supported by default?",
                      a: "Our environment supports standard TeX Live packages including geometry, hyperref, titlesec, enumitem, fontawesome5, xcolor, and tabularx."
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-[#222e42] rounded-lg overflow-hidden bg-[#131a27]">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedFaq === idx ? "rotate-180 text-emerald-400" : ""}`} />
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-[#222e42]/60">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Support Card */}
              <div className="bg-[#182030] rounded-xl border border-[#253248] p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-base font-bold text-white">Need Personalized Assistance?</h4>
                  <p className="text-xs text-slate-400">
                    Our technical support team is ready to help you with formatting issues, LaTeX syntax bugs, or custom template requests.
                  </p>
                </div>
                <a
                  href="mailto:support@vitaforge.io"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 shadow-lg"
                >
                  <Mail className="h-4 w-4" />
                  <span>support@vitaforge.io</span>
                </a>
              </div>
            </div>
          )}

          {/* ===================== VIEW 7: ACCOUNT ===================== */}
          {currentTab === "account" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-[#182030] rounded-xl border border-[#253248] p-6 shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-bold">
                    {(profileName || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{profileName || "User Account"}</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{profileEmail || "user@vitaforge.io"}</p>
                    <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Free Plan Tier
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/projects")}
                  className="bg-[#222d3e] hover:bg-[#2b394f] text-slate-200 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  Back to Projects
                </button>
              </div>

              {/* Profile Details Form */}
              <div className="bg-[#182030] rounded-xl border border-[#253248] p-6 shadow-xl space-y-5">
                <h3 className="text-base font-bold text-white border-b border-[#233045] pb-3">
                  Profile Information
                </h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#111724] border border-[#27354c] rounded-md px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-[#111724] border border-[#27354c] rounded-md px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Professional Title</label>
                      <input
                        type="text"
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        className="w-full bg-[#111724] border border-[#27354c] rounded-md px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Default LaTeX Engine</label>
                      <select
                        value={compilerPref}
                        onChange={(e) => setCompilerPref(e.target.value as any)}
                        className="w-full bg-[#111724] border border-[#27354c] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="pdflatex">pdfLaTeX (Fastest, Standard)</option>
                        <option value="xelatex">XeLaTeX (Custom TrueType Fonts)</option>
                        <option value="lualatex">LuaLaTeX (Modern Typography)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#233045]">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        id="autosave"
                        checked={autoSavePref}
                        onChange={(e) => setAutoSavePref(e.target.checked)}
                        className="rounded border-slate-700 bg-[#111724] text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="autosave" className="cursor-pointer">Auto-save drafts while typing</label>
                    </div>

                    <div className="flex items-center gap-3">
                      {profileSavedToast && (
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>Saved successfully!</span>
                        </span>
                      )}
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Plan Card */}
              <div className="bg-[#182030] rounded-xl border border-[#253248] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Subscription & Limits</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Active projects: {yourResumes.length} / 10 allowed on Free tier</p>
                  </div>
                  <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                    Upgrade to Pro
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#121824] rounded-lg border border-[#202d42]">
                    <p className="text-[11px] text-slate-400">PDF Compilations</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">Unlimited</p>
                  </div>
                  <div className="p-3 bg-[#121824] rounded-lg border border-[#202d42]">
                    <p className="text-[11px] text-slate-400">LaTeX Cloud Engine</p>
                    <p className="text-sm font-bold text-white mt-1">TeX Live 2024</p>
                  </div>
                  <div className="p-3 bg-[#121824] rounded-lg border border-[#202d42]">
                    <p className="text-[11px] text-slate-400">ATS Scans</p>
                    <p className="text-sm font-bold text-white mt-1">Active</p>
                  </div>
                </div>
              </div>

              {/* Security & Sign Out */}
              <div className="bg-[#182030] rounded-xl border border-[#253248] p-6 shadow-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Session Management</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Sign out of your VitaForge account on this browser</p>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== TEMPLATE PREVIEW MODAL ===================== */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-[#161d2b] border border-[#2b384e] rounded-2xl shadow-2xl overflow-hidden text-slate-200"
            >
              <div className="p-6 border-b border-[#253247] flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{previewTemplate.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#253247] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
                <div className="bg-white text-slate-900 rounded-lg p-6 shadow-inner space-y-4 font-sans text-xs">
                  <div className="text-center border-b pb-2">
                    <h2 className="text-lg font-bold">ALEXANDER MORGAN</h2>
                    <p className="text-[10px] text-slate-600 font-medium">SENIOR FULL STACK SOFTWARE ENGINEER</p>
                    <p className="text-[9px] text-slate-500 mt-1">alex.morgan@example.com • +1 (555) 019-2834 • San Francisco, CA • linkedin.com/in/alexmorgan</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-700 border-b pb-0.5">Professional Experience</h4>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Staff Software Engineer — CloudScale</span>
                        <span className="text-slate-500">2021 — Present</span>
                      </div>
                      <p className="text-slate-600 text-[10px]">• Led microservices architecture scaling to 15M daily requests with 99.99% uptime.</p>
                      <p className="text-slate-600 text-[10px]">• Decreased API latency by 45% through Redis caching and query indexing.</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-700 border-b pb-0.5">Core Technical Skills</h4>
                    <p className="text-slate-600 text-[10px] mt-1">TypeScript, React, Node.js, Go, Python, PostgreSQL, Docker, AWS, GraphQL, Git</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#111724] border-t border-[#253247] flex items-center justify-between">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const t = previewTemplate;
                    setPreviewTemplate(null);
                    onNewResume('scratch', `${t.name} Resume`, t.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium text-xs flex items-center gap-2 shadow-lg transition-colors"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
