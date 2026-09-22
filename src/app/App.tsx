import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  FileText,
  CheckCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Upload,
  Sparkles,
  Download,
  ArrowLeft,
  Crown,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";

import { VFLogo } from "@/app/components/VFLogo";
import { LandingPage } from "@/app/components/LandingPage";
import { AuthPage } from "@/app/components/AuthPage";
import { Dashboard, SavedResume } from "@/app/components/Dashboard";
import { ResumeBuilder } from "@/app/components/ResumeBuilder";
import { ResumeData } from "@/app/types";

export type View = "LANDING" | "AUTH" | "DASHBOARD" | "BUILDER";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem("resume_builder_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [builderStep, setBuilderStep] = useState(1);
  const [initialMode, setInitialMode] = useState<'selection' | 'upload_only' | 'target_job'>('selection');
  const [isPremium, setIsPremium] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Resume Management State
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>(() => {
    try {
      const saved = localStorage.getItem("saved_resumes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Defaults matching Image 1
      return [
        {
          id: "project-graphic-designer",
          title: "Graphic Designer",
          updatedAt: new Date().toISOString(),
          score: 85,
          data: {
            jdText: "",
            personalInfo: {
              fullName: "R Karthik",
              title: "Graphic Designer",
              email: "henry@example.com",
              phone: "+1 (555) 234-5678",
              location: "New York, NY",
              website: "myportfolio.com",
              linkedin: "linkedin.com/in/user",
              github: "github.com/user"
            },
            summary: "Creative professional with experience in building high quality applications and visual brand identities.",
            skills: "React, TypeScript, Node.js, Next.js, Figma, UI/UX Design",
            experience: [
              {
                id: "exp-1",
                role: "Senior Graphic Designer",
                company: "Design Studio",
                duration: "2021 - Present",
                location: "New York, NY",
                description: "Led visual identity projects and brand design systems."
              }
            ],
            education: [
              {
                id: "edu-1",
                school: "Art & Design Institute",
                degree: "B.F.A. in Graphic Design",
                year: "2017 - 2021",
                location: "New York, NY"
              }
            ],
            projects: [],
            certifications: [],
            achievements: []
          }
        },
        {
          id: "project-frontend-dev",
          title: "frontend developer",
          updatedAt: new Date().toISOString(),
          score: 92,
          data: {
            jdText: "",
            personalInfo: {
              fullName: "R Karthik",
              title: "frontend developer",
              email: "karthik@example.com",
              phone: "+1 (555) 234-5678",
              location: "San Francisco, CA",
              website: "karthikdev.com",
              linkedin: "linkedin.com/in/karthik",
              github: "github.com/karthikdev"
            },
            summary: "Passionate Frontend Developer specialized in React, TypeScript, and modern web applications.",
            skills: "React, TypeScript, Next.js, Tailwind CSS, JavaScript, HTML5, CSS3, Git",
            experience: [
              {
                id: "exp-2",
                role: "Frontend Engineer",
                company: "Tech Systems",
                duration: "2022 - Present",
                location: "Remote",
                description: "Developing scalable responsive web applications using React and TypeScript."
              }
            ],
            education: [
              {
                id: "edu-2",
                school: "University of Technology",
                degree: "B.S. in Computer Science",
                year: "2018 - 2022",
                location: "San Francisco, CA"
              }
            ],
            projects: [],
            certifications: [],
            achievements: []
          }
        }
      ];
    } catch {
      return [];
    }
  });

  const [currentResume, setCurrentResume] = useState<SavedResume | null>(null);

  // Persist saved resumes
  useEffect(() => {
    localStorage.setItem("saved_resumes", JSON.stringify(savedResumes));
  }, [savedResumes]);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem("resume_builder_user", JSON.stringify(userData));
    navigate("/projects");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("resume_builder_user");
    navigate("/");
  };

  const handleUpdateUser = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem("resume_builder_user", JSON.stringify(userData));
  };

  const handleBackToDashboard = () => {
    setBuilderStep(1);
    setCurrentResume(null);
    setInitialMode('selection');
    navigate("/projects");
  };

  // Resume Handlers
  const handleNewResume = (mode: 'scratch' | 'upload' | 'target' = 'scratch', projectTitle?: string, templateId?: any) => {
    localStorage.removeItem("resume_draft");

    const title = projectTitle && projectTitle.trim().length > 0 ? projectTitle.trim() : "Untitled Resume";
    const newResume: SavedResume = {
      id: Date.now().toString(),
      title: title,
      updatedAt: new Date().toISOString(),
      score: 75,
      isArchived: false,
      isTrash: false,
      isShared: false,
      data: {
        jdText: "",
        personalInfo: {
          fullName: user?.name || "R Karthik",
          email: user?.email || "henry@example.com",
          phone: "+1 (555) 234-5678",
          location: "New York, NY",
          website: "",
          linkedin: "",
          github: "",
          title: title
        },
        summary: "",
        experience: [],
        education: [],
        skills: "",
        projects: [],
        certifications: [],
        achievements: [],
        template: templateId || "classic"
      }
    };
    setCurrentResume(newResume);
    // Immediately persist newly created project into savedResumes so it is never lost
    setSavedResumes((prev) => [newResume, ...prev]);

    if (mode === 'scratch') {
      setBuilderStep(2);
      setInitialMode('selection');
    } else if (mode === 'upload') {
      setBuilderStep(1);
      setInitialMode('upload_only');
    } else if (mode === 'target') {
      setBuilderStep(1);
      setInitialMode('target_job');
    } else {
      setBuilderStep(1);
      setInitialMode('selection');
    }

    navigate("/builder");
  };

  const handleEditResume = (resume: SavedResume) => {
    setCurrentResume(resume);
    setBuilderStep(2);
    navigate("/builder");
  };

  const handleSaveResume = (data: ResumeData) => {
    const now = new Date().toISOString();
    let newResume: SavedResume;

    if (currentResume) {
      newResume = {
        ...currentResume,
        title: data.personalInfo?.title || currentResume.title || "Untitled Resume",
        updatedAt: now,
        data: data,
        score: Math.round(Math.random() * 30 + 60)
      };

      setSavedResumes((prev) => {
        const index = prev.findIndex((r) => r.id === newResume.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newResume;
          return updated;
        }
        return [newResume, ...prev];
      });
    } else {
      const hasName = data.personalInfo?.fullName?.trim().length > 0;
      const hasSummary = data.summary?.trim().length > 0;
      const hasExperience = data.experience?.length > 0;
      const hasEducation = data.education?.length > 0;
      const hasSkills = typeof data.skills === 'string' ? data.skills.length > 0 : false;
      const hasLatex = typeof data.latexCode === 'string' && data.latexCode.trim().length > 0;
      const isUntitled = !data.personalInfo?.title || data.personalInfo.title === "Untitled Resume";

      if (!hasName && !hasSummary && !hasExperience && !hasEducation && !hasSkills && !hasLatex && isUntitled) {
        return;
      }

      newResume = {
        id: crypto.randomUUID(),
        title: data.personalInfo?.title || "Untitled Resume",
        updatedAt: now,
        isArchived: false,
        isTrash: false,
        isShared: false,
        data: data,
        score: Math.round(Math.random() * 30 + 50)
      };
      setSavedResumes((prev) => [newResume, ...prev]);
    }

    setCurrentResume(newResume);
  };

  // Move to Trash (Soft Delete)
  const handleTrashResume = (id: string) => {
    setSavedResumes((current) =>
      current.map((r) =>
        r.id === id ? { ...r, isTrash: true, deletedAt: new Date().toISOString() } : r
      )
    );
    if (currentResume?.id === id) {
      setCurrentResume(null);
    }
  };

  // Restore from Trash or Archive
  const handleRestoreResume = (id: string) => {
    setSavedResumes((current) =>
      current.map((r) =>
        r.id === id ? { ...r, isTrash: false, isArchived: false } : r
      )
    );
  };

  // Archive project
  const handleArchiveResume = (id: string) => {
    setSavedResumes((current) =>
      current.map((r) =>
        r.id === id ? { ...r, isArchived: true } : r
      )
    );
  };

  // Permanent Delete
  const handlePermanentDelete = (id: string) => {
    setSavedResumes((current) => current.filter((r) => r.id !== id));
    if (currentResume?.id === id) {
      setCurrentResume(null);
    }
  };

  // Empty Trash
  const handleEmptyTrash = () => {
    setSavedResumes((current) => current.filter((r) => !r.isTrash));
  };

  const isDashboardRoute = [
    "/projects",
    "/shared",
    "/archived",
    "/library",
    "/trash",
    "/help",
    "/account"
  ].some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));

  const isBuilderRoute = location.pathname.startsWith("/builder");

  const dashboardProps = {
    resumes: savedResumes,
    user,
    onUpdateUser: handleUpdateUser,
    onNewResume: handleNewResume,
    onEditResume: handleEditResume,
    onDeleteResume: handleTrashResume,
    onRestoreResume: handleRestoreResume,
    onPermanentDelete: handlePermanentDelete,
    onArchiveResume: handleArchiveResume,
    onEmptyTrash: handleEmptyTrash,
    onLogout: handleLogout,
  };

  return (
    <div className={isDashboardRoute || isBuilderRoute ? "h-screen w-screen overflow-hidden bg-[#111622] font-sans" : "min-h-screen bg-slate-900 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white"}>
      {!isDashboardRoute && !isBuilderRoute && (
        <Navbar
          user={user}
          onViewChange={(v) => {
            if (v === "DASHBOARD") navigate("/projects");
            else if (v === "AUTH") navigate("/auth");
            else navigate("/");
          }}
          onLogout={handleLogout}
          currentView={location.pathname === "/auth" ? "AUTH" : "LANDING"}
          builderStep={builderStep}
          isPremium={isPremium}
          onBackToDashboard={handleBackToDashboard}
          onShowCheckout={() => setShowCheckout(true)}
        />
      )}

      <main className={isDashboardRoute || isBuilderRoute ? "h-full w-full overflow-hidden" : "pt-16 min-h-[calc(100vh-4rem)]"}>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/projects" replace />
              ) : (
                <LandingPage onGetStarted={() => navigate(user ? "/projects" : "/auth")} />
              )
            }
          />

          {/* Auth Page */}
          <Route
            path="/auth"
            element={<AuthPage onLogin={handleLogin} />}
          />

          {/* Dashboard Routes for all 8 Sidebar Items */}
          <Route path="/projects" element={<Dashboard {...dashboardProps} tab="your" />} />
          <Route path="/shared" element={<Dashboard {...dashboardProps} tab="shared" />} />
          <Route path="/archived" element={<Dashboard {...dashboardProps} tab="archived" />} />
          <Route path="/library" element={<Dashboard {...dashboardProps} tab="library" />} />
          <Route path="/trash" element={<Dashboard {...dashboardProps} tab="trash" />} />
          <Route path="/help" element={<Dashboard {...dashboardProps} tab="help" />} />
          <Route path="/account" element={<Dashboard {...dashboardProps} tab="account" />} />

          {/* Resume Builder */}
          <Route
            path="/builder"
            element={
              <ResumeBuilder
                key={currentResume?.id || "builder-instance"}
                initialData={currentResume?.data}
                initialStep={builderStep}
                onBack={handleBackToDashboard}
                onStepChange={setBuilderStep}
                onSave={handleSaveResume}
                isPremium={isPremium}
                onPremiumChange={setIsPremium}
                showCheckout={showCheckout}
                onShowCheckout={setShowCheckout}
                initialMode={initialMode}
              />
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={user ? "/projects" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Navbar({
  user,
  onViewChange,
  onLogout,
  currentView,
  builderStep = 1,
  isPremium = false,
  onBackToDashboard,
  onShowCheckout
}: {
  user: any,
  onViewChange: (v: View) => void,
  onLogout: () => void,
  currentView: View,
  builderStep?: number,
  isPremium?: boolean,
  onBackToDashboard?: () => void,
  onShowCheckout?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isBuilder = currentView === "BUILDER";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-6 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {isBuilder && onBackToDashboard ? (
            <Button variant="ghost" size="icon" onClick={onBackToDashboard} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onViewChange(user ? "DASHBOARD" : "LANDING")}
            >
              <VFLogo size={32} showText={true} textColor="text-slate-900" />
            </div>
          )}

          {isBuilder && (
            <h2 className="text-sm font-semibold text-slate-900 whitespace-nowrap">Untitled Resume</h2>
          )}
        </div>

        {/* Center Section - Builder Breadcrumb */}
        {isBuilder && (
          <div className="hidden md:flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-hide flex-1 min-w-0 justify-center">
            <span className={builderStep >= 1 ? "text-emerald-600 font-medium whitespace-nowrap" : "text-slate-400 whitespace-nowrap"}>Start</span>
            <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
            <span className={builderStep >= 2 ? "text-emerald-600 font-medium whitespace-nowrap" : "text-slate-400 whitespace-nowrap"}>Edit</span>
            <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
            <span className={builderStep >= 3 ? "text-emerald-600 font-medium whitespace-nowrap" : "text-slate-400 whitespace-nowrap"}>Finalize</span>
          </div>
        )}

        {/* Right Section - Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          {isBuilder ? (
            <>
              {!isPremium && onShowCheckout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8"
                  onClick={onShowCheckout}
                >
                  <Crown className="h-3.5 w-3.5 mr-1.5" />
                  Go Pro
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            </>
          ) : !user ? (
            <>
              <Button variant="ghost" onClick={() => onViewChange("LANDING")}>How it works</Button>
              <Button variant="ghost" onClick={() => onViewChange("LANDING")}>Pricing</Button>
              <Button onClick={() => onViewChange("AUTH")}>Log In</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onViewChange("DASHBOARD")} className={cn(currentView === "DASHBOARD" && "bg-slate-100")}>
                Dashboard
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                  {user.name[0]}
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-500 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-slate-200 bg-white p-4 shadow-xl md:hidden flex flex-col gap-2">
          {!user ? (
            <>
              <Button variant="ghost" onClick={() => { onViewChange("LANDING"); setIsOpen(false); }}>How it works</Button>
              <Button onClick={() => { onViewChange("AUTH"); setIsOpen(false); }}>Log In</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { onViewChange("DASHBOARD"); setIsOpen(false); }}>Dashboard</Button>
              <Button variant="destructive" onClick={() => { onLogout(); setIsOpen(false); }}>Log Out</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
