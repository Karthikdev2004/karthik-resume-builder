import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Loader2, Sparkles, Crown } from "lucide-react";

export function AnalysisOverlay({ isAnalyzing }: { isAnalyzing: boolean }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isAnalyzing) {
            // Animate progressively to simulate real processing time
            interval = setInterval(() => {
                setProgress((prev) => {
                    // Phase 1: Fast scan (0-30%)
                    if (prev < 30) return prev + 2;
                    // Phase 2: Analysis (30-60%)
                    if (prev < 60) return prev + 1;
                    // Phase 3: Tailoring (60-80%) - slowing down
                    if (prev < 80) return Math.random() > 0.5 ? prev + 1 : prev;
                    // Phase 4: Polishing (80-95%) - crawling
                    if (prev < 95) return Math.random() > 0.8 ? prev + 1 : prev;
                    // Stall at 95% until finished
                    return 95;
                });
            }, 100);
        } else {
            // API Finished! Complete the progress bar
            setProgress(100);
        }

        return () => clearInterval(interval);
    }, [isAnalyzing]);

    // Dynamic status text based on progress
    const loadingStatus = useMemo(() => {
        if (progress < 25) return { text: "Reading Resume Architecture...", icon: <Loader2 className="w-5 h-5 animate-spin" /> };
        if (progress < 50) return { text: "Analyzing Job Description Requirements...", icon: <CheckCircle className="w-5 h-5 animate-pulse" /> };
        if (progress < 75) return { text: "Tailoring Skills & Experience...", icon: <Sparkles className="w-5 h-5 animate-bounce" /> };
        return { text: "Polishing & Optimizing Content...", icon: <Crown className="w-5 h-5 animate-pulse" /> };
    }, [progress]);

    if (!isAnalyzing && progress === 100) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center space-y-10">
                <div className="relative">
                    {/* Pulse Effect Background */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-20"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-48 w-48 flex items-center justify-center"
                    >
                        {/* Outer Rotating Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-emerald-500/30"
                        />

                        {/* Inner Rotating Ring (Counter) */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-emerald-400/50"
                        />

                        {/* Progress SVG */}
                        <svg className="h-full w-full -rotate-90 relative z-10">
                            <circle cx="96" cy="96" r="88" className="fill-none stroke-slate-100 stroke-[6]" />
                            <circle
                                cx="96" cy="96" r="88"
                                className="fill-none stroke-emerald-500 stroke-[6] transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                strokeDasharray={553} // 2 * pi * 88
                                strokeDashoffset={553 - (553 * progress) / 100}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Center Content */}
                        <div className="absolute flex flex-col items-center justify-center bg-white rounded-full h-36 w-36 shadow-inner">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-emerald-500 mb-1"
                            >
                                <Sparkles className="w-8 h-8" />
                            </motion.div>
                            <span className="text-4xl font-bold text-slate-800 font-mono">{Math.round(progress)}%</span>
                        </div>
                    </motion.div>
                </div>

                <div className="text-center space-y-3 max-w-md mx-auto px-4">
                    <motion.h2
                        key={loadingStatus.text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2"
                    >
                        {loadingStatus.icon}
                        {loadingStatus.text}
                    </motion.h2>

                    <div className="flex gap-2 justify-center mt-4">
                        {/* Tech pill animations */}
                        {["AI Parsing", "JD Match", "Optimizer"].map((tag, i) => (
                            <motion.span
                                key={tag}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-500 border border-slate-200"
                            >
                                {tag}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
