import React from "react";
import { ResumeData } from "@/app/types";
import { TEMPLATES, getTemplate } from "@/app/templates";
import { CircleCheck } from "lucide-react";

const DUMMY_DATA: ResumeData = {
    jdText: "",
    personalInfo: {
        fullName: "John Doe",
        title: "Software Engineer",
        email: "john.doe@example.com",
        phone: "+1 234 567 890",
        location: "New York, NY",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
        website: "johndoe.dev",
    },
    summary: "Experienced software engineer with a passion for building scalable web applications. Skilled in React, Node.js, and cloud technologies. Proven track record of delivering high-quality solutions.",
    experience: [
        {
            id: "1",
            company: "Tech Corp",
            role: "Senior Developer",
            duration: "2020 - Present",
            location: "San Francisco, CA",
            description: "Led a team of developers in building a new SaaS platform.\nArchitected scalable microservices\nImproved performance by 40%\nMentored junior developers"
        },
        {
            id: "2",
            company: "Web Solutions",
            role: "Developer",
            duration: "2018 - 2020",
            location: "New York, NY",
            description: "Developed and maintained client websites.\nBuilt responsive web applications\nOptimized database queries\nCollaborated with design team"
        },
        {
            id: "3",
            company: "Startup Inc",
            role: "Junior Developer",
            duration: "2016 - 2018",
            location: "Boston, MA",
            description: "Developed features for web applications.\nImplemented REST APIs\nFixed bugs and improved code quality"
        }
    ],
    education: [
        {
            id: "1",
            school: "University of Technology",
            degree: "B.Sc. in Computer Science",
            year: "2016",
            location: "Boston, MA",
            gpa: "3.8/4.0"
        }
    ],
    projects: [
        {
            id: "1",
            name: "E-Commerce Platform",
            description: "Built a full-stack e-commerce solution with payment integration",
            link: "github.com/johndoe/ecommerce",
            duration: "2021"
        },
        {
            id: "2",
            name: "Task Management App",
            description: "Developed a collaborative task management application",
            link: "github.com/johndoe/taskapp",
            duration: "2020"
        }
    ],
    skills: "React, Node.js, TypeScript, JavaScript, HTML, CSS, Git, AWS, Docker, Kubernetes, MongoDB, PostgreSQL",
    certifications: [
        {
            id: "1",
            title: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            date: "2022"
        }
    ],
    achievements: [
        {
            id: "1",
            title: "Best Project Award",
            issuer: "Tech Corp",
            date: "2021"
        }
    ]
};

interface TemplateThumbnailProps {
    templateId: string;
    isSelected?: boolean;
    onClick?: () => void;
    resumeData?: ResumeData;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
    templateId,
    isSelected,
    onClick,
    resumeData
}) => {
    const template = getTemplate(templateId as any);
    const Component = template?.component;

    // Use provided resumeData or fallback to DUMMY_DATA
    const displayData = resumeData || DUMMY_DATA;

    if (!Component) return null;

    return (
        <button
            onClick={onClick}
            className={`relative rounded-2xl transition-all duration-300 text-left group overflow-hidden border-2 bg-white hover:scale-[1.01] active:scale-[0.99] ${isSelected
                ? "border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl shadow-emerald-500/10"
                : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
                }`}
        >
            {/* Selected Checkmark */}
            {isSelected && (
                <div className="absolute top-3 right-3 z-20">
                    <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                        <CircleCheck className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                </div>
            )}

            {/* Template Preview Area */}
            <div
                className="w-full relative bg-slate-50/50 overflow-hidden rounded-t-2xl"
                style={{ height: "280px", position: "relative" }}
            >
                <div className="absolute inset-0 flex items-start justify-center pt-4 overflow-hidden">
                    {/* Scaled Resume Preview */}
                    <div
                        className="bg-white shadow-md border border-slate-200 origin-top flex-shrink-0"
                        style={{
                            width: "210mm",
                            minHeight: "297mm",
                            transform: "scale(0.28)",
                        }}
                    >
                        <Component
                            data={displayData}
                            isEditing={false}
                            actions={undefined}
                            showHighlights={false}
                        />
                    </div>
                </div>
            </div>

            {/* Template Info Footer */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                            {template?.name}
                            {isSelected && (
                                <span className="text-[9px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                                    ACTIVE
                                </span>
                            )}
                        </h4>
                        <p className="text-xs text-slate-600 leading-snug">
                            {template?.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100" />
        </button>
    );
};
