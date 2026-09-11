import React, { useState, useEffect } from "react";
// ResumeBuilder.tsx
import { Button } from "@/app/components/ui";
import { ArrowLeft, ChevronRight, Save, Crown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Step1JD, StepMode } from "./builder/Step1JD";
import { Step2Profile } from "./builder/Step2Profile";
import { Step3Preview } from "./builder/Step3Preview";
import { AnalysisOverlay } from "./builder/AnalysisOverlay";
import { CheckoutModal } from "./checkout/CheckoutModal";
import { analyzeJobDescription, compareSkills, type JDAnalysisResult } from "@/utils/jdAnalyzer";
import { parseAndTailorResume } from "@/utils/resumeParser";

import { useDebounce } from "@/lib/utils";
import { ResumeData } from "@/app/types";

interface UploadedResumeData {
  fileName: string;
  fileSize: number;
  fileType: string;
  parsedData?: any;
  rawText?: string;
}

const initialData: ResumeData = {
  jdText: "",
  personalInfo: { fullName: "", email: "", phone: "", linkedin: "", github: "", website: "" },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  skills: "",
};

export function ResumeBuilder({
  initialData: propInitialData,
  onSave,
  onBack,
  onStepChange,
  isPremium: isPremiumProp,
  onPremiumChange,
  showCheckout: showCheckoutProp,
  onShowCheckout,
  initialStep,
  initialMode,
}: {
  initialData?: ResumeData;
  onSave?: (data: ResumeData) => void;
  onBack: () => void;
  onStepChange: (step: number) => void;
  isPremium: boolean;
  onPremiumChange: (isPremium: boolean) => void;
  showCheckout: boolean;
  onShowCheckout: (show: boolean) => void;
  initialStep?: number;
  initialMode?: StepMode;
}) {
  const [step, setStep] = useState(initialStep ?? 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<UploadedResumeData | null>(null);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysisResult | null>(null);

  // Initialize data from props or local storage
  // Initialize data from props or local storage
  const [data, setData] = useState<ResumeData>(() => {
    // Helper to safely merge with defaults to prevent partial data crashes
    const mergeWithDefaults = (incoming: any): ResumeData => {
      if (!incoming) return initialData;
      return {
        ...initialData,
        ...incoming,
        personalInfo: { ...initialData.personalInfo, ...(incoming.personalInfo || {}) },
        education: Array.isArray(incoming.education) ? incoming.education : initialData.education,
        experience: Array.isArray(incoming.experience) ? incoming.experience : initialData.experience,
        projects: Array.isArray(incoming.projects) ? incoming.projects : initialData.projects,
        certifications: Array.isArray(incoming.certifications) ? incoming.certifications : initialData.certifications,
        achievements: Array.isArray(incoming.achievements) ? incoming.achievements : initialData.achievements,
      };
    };

    if (propInitialData) return mergeWithDefaults(propInitialData);

    try {
      const saved = localStorage.getItem("resume_draft");
      if (!saved) return initialData;
      const parsed = JSON.parse(saved);
      return mergeWithDefaults(parsed);
    } catch (e) {
      return initialData;
    }
  });

  // Use ref for onSave to avoid dependency loop
  const onSaveRef = React.useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const debouncedData = useDebounce(data, 1000);

  // Auto-save to parent (Dashboard)
  useEffect(() => {
    if (onSaveRef.current) {
      onSaveRef.current(debouncedData);
    }
  }, [debouncedData]); // Only trigger when data actually changes

  // Local auto-save (Backup)
  useEffect(() => {
    localStorage.setItem("resume_draft", JSON.stringify(data));
  }, [data]);

  const handleNext = async () => {
    console.log('🚀 [ResumeBuilder] handleNext - Step:', step);

    // STEP 1: UPLOAD & JD -> GO TO EDIT (STEP 2)
    if (step === 1) {
      // If no resume and no JD, skip analysis and go straight to editor
      const hasResume = !!uploadedResume;
      const hasJD = data.jdText && data.jdText.trim().length > 20;

      if (!hasResume && !hasJD) {
        console.log("ℹ️ [ResumeBuilder] No resume or JD provided, skipping analysis -> Step 2");
        setStep(2);
        return;
      }

      // Show Analysis Overlay
      setIsAnalyzing(true);

      // Perform Async Processing
      try {
        console.log('📝 [ResumeBuilder] Processing Resume...');

        let parsedData: any = {};

        // Scenario A: Target Job (Resume + JD)
        if (hasJD && uploadedResume?.rawText) {
          console.log("✨ [ResumeBuilder] AI Parsing & Tailoring (Target Job)...");

          // 1. Analyze JD
          const analysis = analyzeJobDescription(data.jdText);
          setJdAnalysis(analysis);

          // 2. Parse & Tailor
          const tailoredData = await parseAndTailorResume(uploadedResume.rawText, data.jdText);
          if (tailoredData) {
            parsedData = tailoredData;
          }
        }
        // Scenario B: Upload Only (Resume No JD)
        else if (uploadedResume?.rawText) {
          console.log("🤖 [ResumeBuilder] AI Extraction (Upload Only)...");
          // Import parseWithAzure dynamically or assume it's imported
          const { parseWithAzure } = await import("@/utils/resumeParser");
          const extractedData = await parseWithAzure(uploadedResume.rawText);

          if (extractedData) {
            parsedData = extractedData;
          } else {
            // Fallback to regex data if AI fails
            parsedData = uploadedResume.parsedData || {};
          }
        }
        // Scenario C: Manual Entry (No Resume)
        else {
          parsedData = {};
        }

        // Merge Data
        const suggestedTitle = jdAnalysis?.jobTitle || parsedData.title || '';

        const mergedData = {
          ...data,
          personalInfo: {
            ...data.personalInfo,
            fullName: parsedData.fullName || data.personalInfo.fullName,
            title: parsedData.title || data.personalInfo.title || suggestedTitle,
            email: parsedData.email || data.personalInfo.email,
            phone: parsedData.phone || data.personalInfo.phone,
            linkedin: parsedData.linkedin || data.personalInfo.linkedin,
            github: parsedData.github || data.personalInfo.github,
            website: parsedData.portfolio || parsedData.website || data.personalInfo.website,
            location: parsedData.location || data.personalInfo.location,
          },
          summary: parsedData.summary || data.summary,
          skills: parsedData.skills ? (Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : parsedData.skills) : data.skills,
          experience: parsedData.experience && parsedData.experience.length > 0 ? parsedData.experience.map((exp: any, index: number) => ({
            id: `exp-${Date.now()}-${index}`,
            role: exp.role || '',
            company: exp.company || '',
            duration: exp.duration || '',
            location: exp.location || '',
            description: exp.description || '',
          })) : data.experience,
          education: parsedData.education && parsedData.education.length > 0 ? parsedData.education.map((edu: any, index: number) => ({
            id: `edu-${Date.now()}-${index}`,
            school: edu.school || '',
            degree: edu.degree || '',
            year: edu.year || '',
            location: edu.location || '',
          })) : data.education,
          projects: parsedData.projects && parsedData.projects.length > 0 ? parsedData.projects.map((proj: any, index: number) => ({
            id: `proj-${Date.now()}-${index}`,
            name: proj.name || '',
            description: proj.description || '',
            duration: proj.duration || '',
            link: proj.link || '', // GitHub repo, demo, or project URL
            techStack: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.techStack || ''), // Convert technologies array to comma-separated string
          })) : data.projects,
        };

        setData(mergedData);
        console.log("✅ [ResumeBuilder] Processing Complete!");

        // Wait a small moment for the "100%" animation to show if needed, then move to step 2
        setTimeout(() => {
          setIsAnalyzing(false);
          setStep(2);
        }, 1500); // 1.5s delay to see the success state

      } catch (error) {
        console.error("💥 [ResumeBuilder] Error processing:", error);
        setIsAnalyzing(false);
        // Even on error, maybe we should let them proceed? 
        // For now, let's just stop loading. User can try again or skip.
      }
      return;
    }

    // STEP 2: EDIT -> GO TO PREVIEW (STEP 3)
    if (step === 2) {
      setStep(3);
      return;
    }

    // Default next
    setStep(step + 1);
  };

  const handleResumeUpload = (resumeData: UploadedResumeData | null) => {
    console.log('📥 [ResumeBuilder] handleResumeUpload called with:', resumeData ? 'DATA' : 'NULL');
    if (resumeData) {
      console.log('📁 [ResumeBuilder] Resume file:', resumeData.fileName);
      console.log('⭐ [ResumeBuilder] Score:', resumeData.extractionScore);
      console.log('📊 [ResumeBuilder] Parsed keys:', resumeData.parsedData ? Object.keys(resumeData.parsedData) : []);
    }
    setUploadedResume(resumeData);
  };

  const updateData = (newData: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const handlePremiumSuccess = () => {
    onPremiumChange(true);
    onShowCheckout(false);
  };

  return (
    <div className={`flex flex-col h-full ${step === 2 ? 'h-screen w-screen overflow-hidden bg-[#0c1017]' : 'min-h-screen bg-slate-50'}`}>

      {/* Analysis Overlay - Shows when analyzing */}
      <AnimatePresence>
        {isAnalyzing && <AnalysisOverlay isAnalyzing={isAnalyzing} />}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`flex-1 ${step === 1 ? 'container mx-auto px-4 py-8 max-w-5xl' : 'w-full h-full'}`}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1JD
              key="step1"
              value={data.jdText}
              onChange={(text) => updateData({ jdText: text })}
              onNext={handleNext}
              onResumeUpload={handleResumeUpload}
              initialMode={initialMode}
            />
          )}
          {step === 2 && (
            <Step2Profile
              key="step2"
              data={data}
              onChange={updateData}
              onNext={handleNext}
              onBack={onBack}
              projectTitle={propInitialData?.personalInfo?.title || data.personalInfo?.title || ""}
            />
          )}
          {step === 3 && (
            <Step3Preview
              key="step3"
              data={data}
              onDataChange={(newData) => setData(newData)}
              onBack={() => setStep(2)} // Go back to edit
              isPremium={isPremiumProp}
              onUpgrade={() => onShowCheckout(true)}
            />
          )}
        </AnimatePresence>
      </main>

      <CheckoutModal
        isOpen={showCheckoutProp}
        onClose={() => onShowCheckout(false)}
        onSuccess={handlePremiumSuccess}
      />
    </div>
  );
}
