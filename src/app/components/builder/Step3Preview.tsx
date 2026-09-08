import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  Download, ArrowLeft, Eye, EyeOff,
  Linkedin, Phone, Mail, Globe, Github,
  ZoomIn, ZoomOut, MoveUp, MoveDown, Trash2, Plus,
  CheckCircle2, AlertCircle, RefreshCw, Sparkles,
  LayoutTemplate, ChevronDown
} from "lucide-react";
import { ResumeData, Experience, Project, Education, Certificate, Achievement } from "@/app/types";
import { EditableField, EditableBulletList, SectionHeader, HighlightText } from "./PreviewComponents";
import { useDebounce } from "@/lib/utils";
import { getTemplate, TEMPLATES } from "@/app/templates";
import { downloadResumePDF } from "@/lib/pdf-browser";
import { TemplateThumbnail } from "./TemplateThumbnail";

// --- Types for Local Component ---
type ZoomLevel = number; // Dynamic zoom support

interface Step3PreviewProps {
  data: ResumeData;
  onDataChange: (newData: ResumeData) => void;
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

// --- Helper Components ---

const ActionButton = ({ onClick, icon: Icon, title, variant = "ghost", className = "" }: any) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-200 hover:scale-105 ${variant === "danger"
      ? "text-red-400 hover:bg-red-50 hover:text-red-600"
      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      } ${className}`}
  >
    <Icon className="w-3.5 h-3.5" />
  </button>
);

const SectionControls = ({ onMoveUp, onMoveDown, onDelete }: any) => (
  <div className="absolute -left-10 top-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col gap-1 bg-white shadow-sm border border-slate-200 rounded-md p-0.5 z-10 print:hidden">
    {onMoveUp && <ActionButton icon={MoveUp} onClick={onMoveUp} title="Move Up" />}
    {onMoveDown && <ActionButton icon={MoveDown} onClick={onMoveDown} title="Move Down" />}
    {onDelete && <ActionButton icon={Trash2} variant="danger" onClick={onDelete} title="Delete Item" />}
  </div>
);

const EmptySectionPlaceholder = ({ title, onClick }: { title: string, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group print:hidden"
  >
    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600">
      <Plus className="w-6 h-6" />
      <span className="text-sm font-medium">Add {title}</span>
    </div>
  </div>
);

export function Step3Preview({
  data,
  onDataChange,
  onBack,
  isPremium,
  onUpgrade
}: Step3PreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // UI State
  const [isEditMode, setIsEditMode] = useState(true); // Default to true for better onboarding
  const [showHighlights, setShowHighlights] = useState(false);
  const [zoom, setZoom] = useState<number>(0.75); // Default start zoom
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Auto-fit function
  const handleAutoFit = () => {
    if (containerRef.current) {
      // Calculate fit zoom (padding 32px * 2 = 64px, top/bottom bars)
      const containerHeight = containerRef.current.clientHeight - 80;
      const containerWidth = containerRef.current.clientWidth - 80;

      // A4 Height approx 1123px, Width 794px at 96 DPI
      const scaleH = containerHeight / 1123;
      const scaleW = containerWidth / 794;

      // Use the smaller scale to fit entirely, max 1
      const autoZoom = Math.min(Math.max(Math.min(scaleH, scaleW), 0.4), 1.2);
      setZoom(Number(autoZoom.toFixed(2)));
    }
  };

  // Auto-fit effect on mount
  useEffect(() => {
    handleAutoFit();
  }, []);

  // Data State
  const [localData, setLocalData] = useState(data);
  const debouncedData = useDebounce(localData, 1000);

  // --- Auto-Save Effect ---
  useEffect(() => {
    if (JSON.stringify(debouncedData) !== JSON.stringify(data) && onDataChange) {
      setSaveStatus("saving");
      onDataChange(debouncedData);
      const timer = setTimeout(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [debouncedData, data, onDataChange]);



  // --- PDF Download Handler (jsPDF - browser-compatible) ---
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const handlePDFDownload = async () => {
    try {
      setIsPdfDownloading(true);
      const fileName = `${localData.personalInfo.fullName || 'Resume'}_Resume.pdf`;
      await downloadResumePDF(localData, fileName);
      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ PDF download failed:', error);
      alert('Failed to download PDF. Please use the Print button instead.');
    } finally {
      setIsPdfDownloading(false);
    }
  };

  // --- Data Helpers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const updateField = (section: keyof ResumeData, value: any) => {
    setLocalData((prev) => ({ ...prev, [section]: value }));
  };

  const updateItem = (section: keyof ResumeData, id: string, key: string, value: any) => {
    setLocalData((prev) => {
      const list = prev[section] as any[];
      if (!Array.isArray(list)) return prev;
      return {
        ...prev,
        [section]: list.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
      };
    });
  };

  const addItem = (section: keyof ResumeData) => {
    setLocalData((prev) => {
      const newItem: any = { id: generateId() };

      // Default values
      if (section === 'experience') {
        newItem.role = "New Role";
        newItem.company = "New Company";
        newItem.description = "• Bullet point";
        newItem.duration = "Present";
        newItem.location = "";
      } else if (section === 'education') {
        newItem.school = "New School";
        newItem.degree = "Degree";
        newItem.year = "2024";
      } else if (section === 'projects') {
        newItem.name = "New Project";
        newItem.description = "Project description...";
      } else if (section === 'certifications') {
        newItem.title = "Certification Name";
        newItem.issuer = "Issuer";
      } else if (section === 'achievements') {
        newItem.title = "Achievement";
        newItem.issuer = "Issuer";
      }

      return {
        ...prev,
        [section]: [...(prev[section] as any[] || []), newItem],
      };
    });
  };

  const deleteItem = (section: keyof ResumeData, id: string) => {
    setLocalData((prev) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item) => item.id !== id),
    }));
  };

  const moveItem = (section: keyof ResumeData, index: number, direction: "up" | "down") => {
    setLocalData((prev) => {
      const list = [...(prev[section] as any[])];
      if (direction === "up" && index > 0) {
        [list[index], list[index - 1]] = [list[index - 1], list[index]];
      } else if (direction === "down" && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
      }
      return { ...prev, [section]: list };
    });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} size="sm" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-white shadow-sm transition-all"
              onClick={() => setZoom((prev) => Math.max(0.3, Number((prev - 0.1).toFixed(2))))}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
            </Button>
            <button
              onClick={handleAutoFit}
              className="px-2 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors w-14 text-center"
              title="Fit to Screen"
            >
              {Math.round(zoom * 100)}%
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md hover:bg-white shadow-sm transition-all"
              onClick={() => setZoom((prev) => Math.min(2.0, Number((prev + 0.1).toFixed(2))))}
              disabled={zoom >= 2.0}
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
            </Button>
          </div>


        </div>

        <div className="flex items-center gap-3">
          {!isPremium && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUpgrade}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {isEditMode ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview Mode
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handlePDFDownload}
            disabled={isPdfDownloading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 disabled:opacity-50"
          >
            {isPdfDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>


        </div>
      </div>

      {/* Main Content Area - CRITICAL FIX: flex-1 min-h-0 to prevent overflow */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar - Template Selection */}
        <div className="w-80 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0 p-4 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-blue-600" />
              Select Template
            </h2>
            <p className="text-xs text-slate-500 mt-1">Choose a layout that fits your style.</p>
          </div>
          {/* Scrollable templates - CRITICAL: flex-1 min-h-0 enables proper scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3">
            <div className="grid grid-cols-1 gap-3 pb-4">
              {TEMPLATES.map((t) => (
                <TemplateThumbnail
                  key={t.id}
                  templateId={t.id}
                  isSelected={(localData.template || "classic") === t.id}
                  onClick={() => updateField("template", t.id)}
                  resumeData={localData}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Resume Canvas Area - CRITICAL: flex-1 min-h-0 enables proper scroll */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex justify-center p-8 md:p-12"
          style={{ background: 'radial-gradient(#cbd5e1 1px, transparent 1px) 0 0 / 20px 20px' }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div
              id="resume-preview"
              ref={resumeRef}
              className="bg-white shadow-xl ring-1 ring-slate-900/5 relative"
              style={{
                width: "210mm",
                minHeight: "297mm",
                // Ensure strict pixel height for A4 visual guide (297mm * 3.78px/mm ≈ 1123px)
                height: "auto"
              }}
            >
              {/* A4 Page Break Indicator (approx 297mm marker) */}
              <div className="absolute left-0 right-0 top-[297mm] border-b-2 border-dashed border-red-300 print:hidden pointer-events-none opacity-50 z-50 flex items-center justify-end pr-2">
                <span className="text-xs text-red-400 font-mono bg-white px-1 relative top-3">Page End</span>
              </div>
              {(() => {
                const selectedTemplate = localData.template || "classic";
                const template = getTemplate(selectedTemplate);
                const TemplateComponent = template?.component || TEMPLATES[0].component;

                // Bundle actions for the template
                const actions = {
                  add: addItem,
                  remove: deleteItem,
                  move: moveItem,
                  updateItem: updateItem,
                  updateField: updateField // Correct signature: (field, value)
                };

                return <TemplateComponent
                  data={localData}
                  isEditing={isEditMode}
                  actions={actions}
                  showHighlights={showHighlights}
                />;
              })()}

            </div>
          </div>
        </div>
      </div>


      {/* --- Global Styles for Print --- */}
      <style>{`
        @media print {
            @page { margin: 0; size: A4; }
            body { background: white; }
            #resume-preview { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 210mm !important;
                height: auto !important;
                min-height: 297mm !important;
                print-color-adjust: exact; 
                padding: 0 !important;
            }
            .print\\:hidden { display: none !important; }
            button { display: none !important; }
            section {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            header {
                page-break-after: avoid;
            }
        }
      `}</style>
    </div >
  );
}
