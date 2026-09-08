import React, { useState, useCallback } from "react";
import { Button, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PenLine,
  Target,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseResumeFile, validateExtractedData, type ParsedResumeData } from "@/utils/resumeParser";

interface UploadedResumeData {
  fileName: string;
  fileSize: number;
  fileType: string;
  parsedData?: ParsedResumeData;
  rawText?: string;
  extractionScore?: number;
}

export type StepMode = 'selection' | 'upload_only' | 'target_job';

export function Step1JD({
  value,
  onChange,
  onNext,
  onResumeUpload,
  initialMode = 'selection'
}: {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onResumeUpload?: (data: UploadedResumeData | null) => void;
  initialMode?: StepMode;
}) {
  const [mode, setMode] = useState<StepMode>(initialMode);

  const [uploadedResume, setUploadedResume] = useState<UploadedResumeData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload PDF, DOCX, or TXT files.';
    }

    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit.';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    setIsProcessing(true);

    try {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        setIsProcessing(false);
        return;
      }

      const { rawText, parsedData } = await parseResumeFile(file);
      const extractionScore = validateExtractedData(parsedData);

      const resumeData: UploadedResumeData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        rawText,
        parsedData,
        extractionScore
      };

      setUploadedResume(resumeData);

      if (onResumeUpload) {
        onResumeUpload(resumeData);
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to parse resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const removeUploadedFile = () => {
    setUploadedResume(null);
    setUploadError(null);
    if (onResumeUpload) onResumeUpload(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleStartFromScratch = () => {
    onChange("");
    removeUploadedFile();
    onNext();
  };

  // --- Render Components ---

  const UploadBox = () => (
    <Card className={cn(
      "shadow-sm transition-all duration-200 border-2",
      isDragging ? "border-blue-500 bg-blue-50/50" : "border-dashed border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
    )}>
      <CardContent className="p-0">
        {!uploadedResume ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="p-8 text-center cursor-pointer"
          >
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label htmlFor="resume-upload" className="cursor-pointer w-full h-full block">
              <div className="flex flex-col items-center gap-4">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-slate-700">Processing your resume...</p>
                  </>
                ) : (
                  <>
                    <div className="h-14 w-14 bg-blue-50 rounded-full flex items-center justify-center ring-4 ring-blue-50/50">
                      <Upload className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        Drop your resume here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Supports PDF, DOCX, and TXT (Max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {uploadedResume.fileName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFileSize(uploadedResume.fileSize)}
                    </p>
                  </div>
                  <button
                    onClick={removeUploadedFile}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {uploadedResume.parsedData && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Resume parsed successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mx-6 mb-6 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{uploadError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const SelectionView = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">How would you like to start?</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Choose the best way to build your resume. You can start fresh, import an existing file, or tailor it for a specific job.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Option 1: Create New */}
        <button
          onClick={handleStartFromScratch}
          className="group relative flex flex-col items-center text-center p-8 rounded-2xl border bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-emerald-50/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
          <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <PenLine className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Create from Scratch</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Start with a blank canvas. Choose a template and fill in your details manually using our builder.
          </p>
        </button>

        {/* Option 2: Upload */}
        <button
          onClick={() => setMode('upload_only')}
          className="group relative flex flex-col items-center text-center p-8 rounded-2xl border bg-white shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
          <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Resume</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Already have a resume? Upload your PDF or DOCX and we'll extract the data for you to edit.
          </p>
        </button>

        {/* Option 3: Target Job */}
        <button
          onClick={() => setMode('target_job')}
          className="group relative flex flex-col items-center text-center p-8 rounded-2xl border bg-white shadow-sm hover:shadow-xl hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-purple-50/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
          <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Target a Job</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Upload your resume and a job description. AI will optimize your resume to match the role.
          </p>
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              <Sparkles size={10} /> AI
            </span>
          </div>
        </button>
      </div>
    </motion.div>
  );

  const UploadOnlyView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <button
          onClick={() => setMode('selection')}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to options
        </button>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          Upload Existing Resume
        </h2>
        <p className="text-slate-500 mt-2 ml-14">
          Upload your current resume (PDF, DOCX, or TXT) to import your professional history.
        </p>
      </div>

      <UploadBox />

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!uploadedResume}
          className="w-full sm:w-auto shadow-lg shadow-blue-200"
        >
          Continue to Editor
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  const TargetJobView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <button
          onClick={() => setMode('selection')}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to options
        </button>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          Target Specific Role
        </h2>
        <p className="text-slate-500 mt-2 ml-14">
          Provide your resume and the target job description for AI-powered optimization.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Resume */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">1</span>
            Your Resume
          </h3>
          <UploadBox />
        </div>

        {/* 2. JD */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">2</span>
            Job Description
          </h3>
          <Card className="shadow-sm border-2 border-slate-100 focus-within:border-purple-200 transition-colors">
            <CardContent className="p-0">
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[150px] border-0 focus-visible:ring-0 text-base resize-none p-4 leading-relaxed"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!uploadedResume || value.length < 10}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
        >
          Analyze & Optimize
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {mode === 'selection' && <SelectionView key="selection" />}
      {mode === 'upload_only' && <UploadOnlyView key="upload" />}
      {mode === 'target_job' && <TargetJobView key="target" />}
    </AnimatePresence>
  );
}
