import React from "react";
import { ResumeData } from "@/app/types";
import { Mail, Phone, MapPin, Linkedin, Globe, Github, Plus } from "lucide-react";
import { EditableField, EditableBulletList, SectionHeader, HighlightText, SectionControls, EmptySectionPlaceholder } from "@/app/components/builder/PreviewComponents";

export type TemplateId = "classic" | "sidebar-left" | "modern" | "academic-pro" | "tech-pro" | "ats-optimized";

export interface TemplateActions {
  add: (section: "experience" | "education" | "projects" | "certifications" | "achievements") => void;
  remove: (section: "experience" | "education" | "projects" | "certifications" | "achievements", id: string) => void;
  move: (section: "experience" | "education" | "projects" | "certifications" | "achievements", index: number, direction: "up" | "down") => void;
  updateItem: (section: string, id: string, field: string, value: any) => void;
  updateField: (field: string, value: any) => void;
}

export interface TemplateProps {
  data: ResumeData;
  isEditing?: boolean;
  actions?: TemplateActions;
  showHighlights?: boolean;
}

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  component: React.ComponentType<TemplateProps>;
}

// --- 1. Classic Template (Clean, Center Header) ---
const ClassicTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
  // Helper to standardise contact items for the header loop
  const getContactItems = () => {
    const items = [];
    if (data.personalInfo.phone || isEditing) items.push({ type: 'phone', icon: Phone, val: data.personalInfo.phone, key: 'phone' });
    if (data.personalInfo.email || isEditing) items.push({ type: 'email', icon: Mail, val: data.personalInfo.email, key: 'email' });
    if (data.personalInfo.linkedin || isEditing) items.push({ type: 'link', icon: Linkedin, val: data.personalInfo.linkedin, key: 'linkedin', label: 'LinkedIn' });
    if (data.personalInfo.github || isEditing) items.push({ type: 'link', icon: Github, val: data.personalInfo.github, key: 'github', label: 'GitHub' });
    if (data.personalInfo.website || isEditing) items.push({ type: 'link', icon: Globe, val: data.personalInfo.website, key: 'website', label: 'Portfolio' });
    if (data.personalInfo.location || isEditing) items.push({ type: 'text', icon: MapPin, val: data.personalInfo.location, key: 'location' });
    return items;
  };

  return (
    <div className="p-8 text-slate-900 h-full font-sans group/resume">
      {/* Header */}
      <header className="text-center border-b-2 border-slate-800 pb-2 mb-3 break-inside-avoid relative hover:bg-slate-50/50 -mx-2 px-2 rounded transition-colors">
        <h1 className="text-3xl font-serif font-bold tracking-wide uppercase mb-1">
          <EditableField
            value={data.personalInfo.fullName}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
            isEditing={isEditing}
            placeholder="YOUR NAME"
            className="text-center w-full"
          />
        </h1>
        <div className="text-xs font-medium tracking-widest uppercase text-slate-500 mb-2">
          <EditableField
            value={data.personalInfo.title || ""}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, title: v })}
            isEditing={isEditing}
            placeholder="JOB TITLE"
            className="text-center w-full block"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
          {getContactItems().map((item, i) => (
            <div key={item.key} className="flex items-center gap-1">
              <item.icon size={10} />
              {isEditing ? (
                <EditableField
                  value={item.val || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, [item.key]: v })}
                  isEditing={true}
                  placeholder={item.key}
                  className={!item.val ? "text-slate-300 italic" : ""}
                />
              ) : (
                <span className={!item.val ? "hidden" : ""}>
                  {item.type === 'link' && item.val ? (
                    <a href={item.val.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" rel="noreferrer" className="hover:underline">
                      {item.label}
                    </a>
                  ) : item.val}
                </span>
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        {/* Summary */}
        {(data.summary || isEditing) && (
          <section className="break-inside-avoid group/section relative">

            <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-0.5">Summary</h3>
            <div className="text-xs leading-relaxed text-slate-700 text-justify">
              {isEditing ? (
                <textarea
                  value={data.summary || ""}
                  onChange={(e) => actions?.updateField("summary", e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 min-h-[40px] resize-none text-xs leading-relaxed text-justify"
                  placeholder="Write your professional summary..."
                />
              ) : (
                <HighlightText text={data.summary || ""} enabled={showHighlights} />
              )}
            </div>
          </section>
        )}

        {/* Experience */}
        <section className="group/section">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider">Experience</h3>
            {isEditing && (
              <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {data.experience.length === 0 && isEditing && <EmptySectionPlaceholder title="Experience" onClick={() => actions?.add("experience")} />}
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="break-inside-avoid relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded transition-colors">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
                    onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
                    onDelete={() => actions?.remove("experience", exp.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs w-2/3">
                    <EditableField
                      value={exp.company}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
                      isEditing={isEditing}
                      placeholder="Company"
                    />
                  </span>
                  <span className="text-[10px] text-slate-500 text-right w-1/3">
                    <EditableField
                      value={exp.duration}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)}
                      isEditing={isEditing}
                      placeholder="Dates"
                      className="text-right w-full block"
                    />
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-slate-700 mb-0.5">
                  <EditableField
                    value={exp.role}
                    onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
                    isEditing={isEditing}
                    placeholder="Role"
                  />
                </div>
                <div className="text-[10px] leading-snug text-slate-600">
                  <EditableBulletList
                    items={exp.description ? exp.description.split('\n') : []}
                    onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
                    isEditing={isEditing}
                    showHighlights={showHighlights}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="break-inside-avoid group/section">
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider">Education</h3>
            {isEditing && (
              <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
            {data.education.map((edu, i) => (
              <div key={edu.id} className="relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                    onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                    onDelete={() => actions?.remove("education", edu.id)}
                  />
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-[10px]">
                    <EditableField value={edu.school} onChange={(v) => actions?.updateItem("education", edu.id, "school", v)} isEditing={isEditing} placeholder="School" />
                  </span>
                  <span className="text-[10px] text-slate-500">
                    <EditableField value={edu.year} onChange={(v) => actions?.updateItem("education", edu.id, "year", v)} isEditing={isEditing} placeholder="Year" />
                  </span>
                </div>
                <div className="text-[10px] text-slate-600">
                  <EditableField value={edu.degree} onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)} isEditing={isEditing} placeholder="Degree" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        {(data.skills || isEditing) && (
          <section className="break-inside-avoid group/section">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Skills</h3>
            <div className="text-[10px] leading-relaxed text-slate-700">
              {isEditing ? (
                <textarea
                  value={data.skills}
                  onChange={(e) => actions?.updateField("skills", e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 min-h-[40px] text-[10px]"
                  placeholder="List your skills..."
                />
              ) : (
                data.skills
              )}
            </div>
          </section>
        )}

        {/* Projects */}
        <section className="group/section">
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider">Projects</h3>
            {isEditing && (
              <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                    onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                    onDelete={() => actions?.remove("projects", proj.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs">
                    <EditableField value={proj.name} onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)} isEditing={isEditing} placeholder="Project Name" />
                    {proj.link && isEditing && (
                      <span className="ml-2 font-normal text-blue-500">
                        <EditableField value={proj.link} onChange={(v) => actions?.updateItem("projects", proj.id, "link", v)} isEditing={true} placeholder="Link" className="underline" />
                      </span>
                    )}
                    {proj.link && !isEditing && (
                      <a href={proj.link} target="_blank" className="ml-2 font-normal text-blue-500 underline text-[9px]">Link</a>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    <EditableField value={proj.duration || ""} onChange={(v) => actions?.updateItem("projects", proj.id, "duration", v)} isEditing={isEditing} placeholder="Duration" />
                  </span>
                </div>
                {/* Tech Stack Display */}
                {(proj.techStack || isEditing) && (
                  <div className="mb-1">
                    {isEditing ? (
                      <EditableField
                        value={proj.techStack || ""}
                        onChange={(v) => actions?.updateItem("projects", proj.id, "techStack", v)}
                        isEditing={true}
                        placeholder="Tech: React, Node.js, TypeScript..."
                        className="text-[9px] text-slate-500 italic"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack?.split(',').map((tech, idx) => (
                          <span key={idx} className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-medium">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-[10px] leading-snug text-slate-600">
                  <EditableField
                    value={proj.description}
                    onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)}
                    isEditing={isEditing}
                    multiline
                    placeholder="Project description..."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        {((data.certifications && data.certifications.length > 0) || isEditing) && (
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2.5 border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider">Certifications</h3>
              {isEditing && (
                <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {data.certifications && data.certifications.length === 0 && isEditing && (
                <EmptySectionPlaceholder title="Certification" onClick={() => actions?.add("certifications")} />
              )}
              {data.certifications && data.certifications.map((cert, i) => (
                <div key={cert.id} className="relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                      onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                      onDelete={() => actions?.remove("certifications", cert.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[10px]">
                      <EditableField
                        value={cert.title}
                        onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)}
                        isEditing={isEditing}
                        placeholder="Certification Name"
                      />
                    </span>
                    {(cert.date || isEditing) && (
                      <span className="text-[10px] text-slate-500">
                        <EditableField
                          value={cert.date || ""}
                          onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)}
                          isEditing={isEditing}
                          placeholder="Year"
                        />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    <EditableField
                      value={cert.issuer}
                      onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)}
                      isEditing={isEditing}
                      placeholder="Issuing Organization"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {((data.achievements && data.achievements.length > 0) || isEditing) && (
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2.5 border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider">Achievements</h3>
              {isEditing && (
                <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {data.achievements && data.achievements.length === 0 && isEditing && (
                <EmptySectionPlaceholder title="Achievement" onClick={() => actions?.add("achievements")} />
              )}
              {data.achievements && data.achievements.map((ach, i) => (
                <div key={ach.id} className="relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                      onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                      onDelete={() => actions?.remove("achievements", ach.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[10px]">
                      <EditableField
                        value={ach.title}
                        onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)}
                        isEditing={isEditing}
                        placeholder="Achievement Title"
                      />
                    </span>
                    {(ach.date || isEditing) && (
                      <span className="text-[10px] text-slate-500">
                        <EditableField
                          value={ach.date || ""}
                          onChange={(v) => actions?.updateItem("achievements", ach.id, "date", v)}
                          isEditing={isEditing}
                          placeholder="Year"
                        />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    <EditableField
                      value={ach.issuer}
                      onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)}
                      isEditing={isEditing}
                      placeholder="Organization / Context"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

// --- 2. Sidebar Left (Inspired by Sakshi Chhabra Image) ---
const SidebarLeftTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
  const getContactItems = () => {
    const items = [];
    if (data.personalInfo.email || isEditing) items.push({ val: data.personalInfo.email, key: 'email' });
    if (data.personalInfo.phone || isEditing) items.push({ val: data.personalInfo.phone, key: 'phone' });
    if (data.personalInfo.linkedin || isEditing) items.push({ val: data.personalInfo.linkedin, key: 'linkedin', label: 'LinkedIn' });
    if (data.personalInfo.github || isEditing) items.push({ val: data.personalInfo.github, key: 'github', label: 'GitHub' });
    if (data.personalInfo.website || isEditing) items.push({ val: data.personalInfo.website, key: 'website', label: 'Portfolio' });
    if (data.personalInfo.location || isEditing) items.push({ val: data.personalInfo.location, key: 'location' });
    return items;
  };

  return (
    <div className="p-8 text-slate-900 h-full font-sans group/resume">
      <header className="text-center border-b border-slate-300 pb-3 mb-4 break-inside-avoid">
        <h1 className="text-3xl font-light mb-0.5">
          <EditableField
            value={data.personalInfo.fullName}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
            isEditing={isEditing}
            placeholder="Your Name"
            className="w-full text-center"
          />
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600 px-6">
          {getContactItems().map((item, idx) => (
            <span key={item.key} className={idx > 0 ? "border-l border-slate-400 pl-3" : ""}>
              {isEditing ? (
                <EditableField
                  value={item.val || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, [item.key]: v })}
                  isEditing={true}
                  placeholder={item.label || item.key}
                  className="inline-block text-center"
                />
              ) : (
                <>
                  {item.key === 'linkedin' || item.key === 'github' || item.key === 'website' ? (
                    item.val && (
                      <a href={item.val.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                        {item.label}
                      </a>
                    )
                  ) : (
                    item.val
                  )}
                </>
              )}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-[28%_72%] gap-5 h-full">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Education */}
          <section className="group/section">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-0.5 flex-1">Education</h3>
              {isEditing && (
                <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                  <Plus size={10} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
              {data.education.map((edu, i) => (
                <div key={edu.id} className="text-[10px] relative group/item">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                      onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                      onDelete={() => actions?.remove("education", edu.id)}
                    />
                  )}
                  <div className="font-bold uppercase text-slate-800">
                    <EditableField value={edu.school} onChange={(v) => actions?.updateItem("education", edu.id, "school", v)} isEditing={isEditing} placeholder="School" />
                  </div>
                  <div className="text-slate-600">
                    <EditableField value={edu.degree} onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)} isEditing={isEditing} placeholder="Degree" />
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    <EditableField value={edu.year} onChange={(v) => actions?.updateItem("education", edu.id, "year", v)} isEditing={isEditing} placeholder="Year" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          {(data.skills || isEditing) && (
            <section>
              <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-0.5">Skills</h3>
              {isEditing ? (
                <textarea
                  value={data.skills}
                  onChange={(e) => actions?.updateField("skills", e.target.value)}
                  className="w-full bg-transparent border border-slate-200 p-1.5 focus:ring-1 focus:ring-blue-300 min-h-[60px] text-[10px] resize-none rounded"
                  placeholder="List your skills..."
                />
              ) : (
                <div className="text-[10px] leading-snug text-slate-700 whitespace-pre-wrap">{data.skills}</div>
              )}
            </section>
          )}

          {/* Certifications */}
          {((data.certifications && data.certifications.length > 0) || isEditing) && (
            <section className="group/section">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-0.5 flex-1">Certifications</h3>
                {isEditing && (
                  <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                    <Plus size={10} />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {data.certifications && data.certifications.length === 0 && isEditing && <EmptySectionPlaceholder title="Certification" onClick={() => actions?.add("certifications")} />}
                {data.certifications && data.certifications.map((cert, i) => (
                  <div key={cert.id} className="text-[10px] relative group/item">
                    {isEditing && (
                      <SectionControls
                        onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                        onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                        onDelete={() => actions?.remove("certifications", cert.id)}
                      />
                    )}
                    <div className="font-bold">
                      <EditableField value={cert.title} onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)} isEditing={isEditing} placeholder="Certification" />
                    </div>
                    <div className="text-slate-500">
                      <EditableField value={cert.issuer} onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)} isEditing={isEditing} placeholder="Issuer" />
                    </div>
                    {(cert.date || isEditing) && (
                      <div className="text-slate-400 text-[9px]">
                        <EditableField value={cert.date || ""} onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)} isEditing={isEditing} placeholder="Date" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {((data.achievements && data.achievements.length > 0) || isEditing) && (
            <section className="group/section">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-0.5 flex-1">Achievements</h3>
                {isEditing && (
                  <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                    <Plus size={10} />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {data.achievements && data.achievements.length === 0 && isEditing && <EmptySectionPlaceholder title="Achievement" onClick={() => actions?.add("achievements")} />}
                {data.achievements && data.achievements.map((ach, i) => (
                  <div key={ach.id} className="text-[10px] relative group/item">
                    {isEditing && (
                      <SectionControls
                        onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                        onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                        onDelete={() => actions?.remove("achievements", ach.id)}
                      />
                    )}
                    <div className="font-bold">
                      <EditableField value={ach.title} onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)} isEditing={isEditing} placeholder="Achievement" />
                    </div>
                    <div className="text-slate-500">
                      <EditableField value={ach.issuer} onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)} isEditing={isEditing} placeholder="Organization" />
                    </div>
                    {(ach.date || isEditing) && (
                      <div className="text-slate-400 text-[9px]">
                        <EditableField value={ach.date || ""} onChange={(v) => actions?.updateItem("achievements", ach.id, "date", v)} isEditing={isEditing} placeholder="Date" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Summary */}
          {(data.summary || isEditing) && (
            <section>
              <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-0.5">Summary</h3>
              {isEditing ? (
                <textarea
                  value={data.summary || ""}
                  onChange={(e) => actions?.updateField("summary", e.target.value)}
                  className="w-full bg-transparent border border-slate-200 p-1.5 focus:ring-1 focus:ring-blue-300 min-h-[50px] text-[10px] resize-none rounded"
                  placeholder="Professional summary..."
                />
              ) : (
                <p className="text-[10px] leading-snug text-slate-700 text-justify whitespace-pre-wrap">
                  <HighlightText text={data.summary || ""} enabled={showHighlights} />
                </p>
              )}
            </section>
          )}

          {/* Experience */}
          <section className="group/section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 flex-1">Experience</h3>
              {isEditing && (
                <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                  <Plus size={10} />
                </button>
              )}
            </div>
            <div className="space-y-4">
              {data.experience.length === 0 && isEditing && <EmptySectionPlaceholder title="Experience" onClick={() => actions?.add("experience")} />}
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="break-inside-avoid relative group/item">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
                      onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
                      onDelete={() => actions?.remove("experience", exp.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-xs uppercase">
                      <EditableField value={exp.company} onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)} isEditing={isEditing} placeholder="Company" />
                    </span>
                    <span className="text-[10px] text-slate-500">
                      <EditableField value={exp.duration} onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)} isEditing={isEditing} placeholder="Duration" className="text-right block" />
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold italic text-slate-600 mb-1">
                    <EditableField value={exp.role} onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)} isEditing={isEditing} placeholder="Role" />
                  </div>
                  <div className="text-[10px] leading-snug text-slate-700 pl-2 border-l-2 border-slate-100">
                    <EditableBulletList
                      items={exp.description ? exp.description.split('\n') : []}
                      onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
                      isEditing={isEditing}
                      showHighlights={showHighlights}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="group/section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-normal uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 flex-1">Projects</h3>
              {isEditing && (
                <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                  <Plus size={10} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="break-inside-avoid relative group/item">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                      onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                      onDelete={() => actions?.remove("projects", proj.id)}
                    />
                  )}
                  <div className="font-bold text-xs mb-0.5">
                    <EditableField value={proj.name} onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)} isEditing={isEditing} placeholder="Project Name" />
                  </div>
                  {/* Tech Stack Display */}
                  {(proj.techStack || isEditing) && (
                    <div className="mb-1">
                      {isEditing ? (
                        <EditableField
                          value={proj.techStack || ""}
                          onChange={(v) => actions?.updateItem("projects", proj.id, "techStack", v)}
                          isEditing={true}
                          placeholder="Tech: React, Node.js..."
                          className="text-[9px] text-slate-500 italic"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-0.5">
                          {proj.techStack?.split(',').map((tech, idx) => (
                            <span key={idx} className="text-[8px] px-1 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-medium">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] leading-snug text-slate-700">
                    <EditableField value={proj.description} onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)} isEditing={isEditing} multiline placeholder="Project description..." />
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- 5. Modern Template (Clean, spacious) ---
const ModernTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
  const getContactItems = () => {
    const items = [];
    if (data.personalInfo.email || isEditing) items.push({ icon: Mail, val: data.personalInfo.email, key: 'email' });
    if (data.personalInfo.phone || isEditing) items.push({ icon: Phone, val: data.personalInfo.phone, key: 'phone' });
    if (data.personalInfo.linkedin || isEditing) items.push({ icon: Linkedin, val: data.personalInfo.linkedin, key: 'linkedin', label: 'LinkedIn' });
    if (data.personalInfo.github || isEditing) items.push({ icon: Github, val: data.personalInfo.github, key: 'github', label: 'GitHub' });
    if (data.personalInfo.website || isEditing) items.push({ icon: Globe, val: data.personalInfo.website, key: 'website', label: 'Portfolio' });
    return items;
  };

  return (
    <div className="p-8 text-slate-900 h-full group/resume">
      <header className="mb-5 pb-4 border-b border-slate-200 break-inside-avoid">
        <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">
          <EditableField
            value={data.personalInfo.fullName}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
            isEditing={isEditing}
            placeholder="Your Name"
            className="w-full"
          />
        </h1>
        {(data.personalInfo.title || isEditing) && (
          <p className="text-sm text-slate-600 font-light mb-3">
            <EditableField
              value={data.personalInfo.title || ""}
              onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, title: v })}
              isEditing={isEditing}
              placeholder="Professional Title"
              className="w-full"
            />
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
          {getContactItems().map((item) => (
            <span key={item.key} className="flex items-center gap-1">
              <item.icon className="h-3 w-3" />
              {isEditing ? (
                <EditableField
                  value={item.val || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, [item.key]: v })}
                  isEditing={true}
                  placeholder={item.label || item.key}
                  className="inline-block"
                />
              ) : (
                <>
                  {item.key === 'linkedin' || item.key === 'github' || item.key === 'website' ? (
                    item.val && (
                      <a href={item.val.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                        {item.label}
                      </a>
                    )
                  ) : (
                    item.val
                  )}
                </>
              )}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {(data.summary || isEditing) && (
          <section className="break-inside-avoid">
            <h3 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">PROFILE</h3>
            {isEditing ? (
              <textarea
                value={data.summary || ""}
                onChange={(e) => actions?.updateField("summary", e.target.value)}
                className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-300 min-h-[50px] text-xs resize-none rounded"
                placeholder="Professional summary..."
              />
            ) : (
              <p className="text-xs leading-snug text-slate-700 whitespace-pre-wrap">
                <HighlightText text={data.summary || ""} enabled={showHighlights} />
              </p>
            )}
          </section>
        )}

        <section className="group/section">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">EXPERIENCE</h3>
            {isEditing && (
              <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>
          <div className="space-y-3">
            {data.experience.length === 0 && isEditing && <EmptySectionPlaceholder title="Experience" onClick={() => actions?.add("experience")} />}
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="border-l-2 border-slate-200 pl-3 break-inside-avoid relative group/item">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
                    onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
                    onDelete={() => actions?.remove("experience", exp.id)}
                  />
                )}
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-slate-900">
                      <EditableField value={exp.role} onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)} isEditing={isEditing} placeholder="Job Title" />
                    </h4>
                    <p className="text-[10px] text-slate-600">
                      <EditableField value={exp.company} onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)} isEditing={isEditing} placeholder="Company" />
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    <EditableField value={exp.duration} onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)} isEditing={isEditing} placeholder="Dates" className="text-right block" />
                  </span>
                </div>
                <div className="text-[10px] leading-snug text-slate-700 mt-1">
                  <EditableBulletList items={exp.description ? exp.description.split('\n') : []} onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))} isEditing={isEditing} showHighlights={showHighlights} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-4">
            <section className="break-inside-avoid group/section">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">EDUCATION</h3>
                {isEditing && (
                  <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                    <Plus size={12} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
                {data.education.map((edu, i) => (
                  <div key={edu.id} className="relative group/item">
                    {isEditing && (
                      <SectionControls
                        onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                        onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                        onDelete={() => actions?.remove("education", edu.id)}
                      />
                    )}
                    <h4 className="text-xs font-semibold text-slate-900">
                      <EditableField value={edu.degree} onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)} isEditing={isEditing} placeholder="Degree" />
                    </h4>
                    <p className="text-[10px] text-slate-600">
                      <EditableField value={edu.school} onChange={(v) => actions?.updateItem("education", edu.id, "school", v)} isEditing={isEditing} placeholder="School" />
                    </p>
                    {(edu.year || isEditing) && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <EditableField value={edu.year || ""} onChange={(v) => actions?.updateItem("education", edu.id, "year", v)} isEditing={isEditing} placeholder="Year" />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {(data.skills || isEditing) && (
              <section className="break-inside-avoid">
                <h3 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">SKILLS</h3>
                {isEditing ? (
                  <textarea value={data.skills} onChange={(e) => actions?.updateField("skills", e.target.value)} className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-300 min-h-[50px] text-[10px] resize-none rounded" placeholder="List your skills..." />
                ) : (
                  <div className="text-[10px] leading-snug text-slate-700 whitespace-pre-wrap">{data.skills}</div>
                )}
              </section>
            )}
          </div>

          <div className="space-y-4">
            <section className="group/section">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">PROJECTS</h3>
                {isEditing && (
                  <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                    <Plus size={12} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
                {data.projects.map((proj, i) => (
                  <div key={proj.id} className="relative group/item">
                    {isEditing && (
                      <SectionControls
                        onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                        onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                        onDelete={() => actions?.remove("projects", proj.id)}
                      />
                    )}
                    <h4 className="text-xs font-semibold text-slate-900">
                      <EditableField value={proj.name} onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)} isEditing={isEditing} placeholder="Project Name" />
                    </h4>
                    {/* Tech Stack Display */}
                    {(proj.techStack || isEditing) && (
                      <div className="mt-0.5 mb-1">
                        {isEditing ? (
                          <EditableField
                            value={proj.techStack || ""}
                            onChange={(v) => actions?.updateItem("projects", proj.id, "techStack", v)}
                            isEditing={true}
                            placeholder="Tech: React, Node.js..."
                            className="text-[9px] text-slate-500 italic"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-0.5">
                            {proj.techStack?.split(',').map((tech, idx) => (
                              <span key={idx} className="text-[8px] px-1 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-medium">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] leading-snug text-slate-700 mt-0.5">
                      <EditableField value={proj.description} onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)} isEditing={isEditing} multiline placeholder="Project description..." />
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {((data.certifications && data.certifications.length > 0) || isEditing) && (
              <section className="break-inside-avoid group/section">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">CERTIFICATIONS</h3>
                  {isEditing && (
                    <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                      <Plus size={12} />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {data.certifications && data.certifications.length === 0 && isEditing && <EmptySectionPlaceholder title="Certification" onClick={() => actions?.add("certifications")} />}
                  {data.certifications && data.certifications.map((cert, i) => (
                    <div key={cert.id} className="text-[10px] relative group/item">
                      {isEditing && (
                        <SectionControls
                          onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                          onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                          onDelete={() => actions?.remove("certifications", cert.id)}
                        />
                      )}
                      <span className="font-semibold text-slate-900">
                        <EditableField value={cert.title} onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)} isEditing={isEditing} placeholder="Certification" className="inline" />
                      </span>
                      {(cert.issuer || isEditing) && (
                        <span className="text-slate-600">
                          {" • "}
                          <EditableField value={cert.issuer || ""} onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)} isEditing={isEditing} placeholder="Issuer" className="inline" />
                        </span>
                      )}
                      {(cert.date || isEditing) && (
                        <span className="text-slate-500">
                          {" • "}
                          <EditableField value={cert.date || ""} onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)} isEditing={isEditing} placeholder="Date" className="inline" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {((data.achievements && data.achievements.length > 0) || isEditing) && (
              <section className="break-inside-avoid group/section">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">ACHIEVEMENTS</h3>
                  {isEditing && (
                    <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                      <Plus size={12} />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {data.achievements && data.achievements.length === 0 && isEditing && <EmptySectionPlaceholder title="Achievement" onClick={() => actions?.add("achievements")} />}
                  {data.achievements && data.achievements.map((ach, i) => (
                    <div key={ach.id} className="text-[10px] relative group/item">
                      {isEditing && (
                        <SectionControls
                          onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                          onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                          onDelete={() => actions?.remove("achievements", ach.id)}
                        />
                      )}
                      <span className="font-semibold text-slate-900">
                        <EditableField value={ach.title} onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)} isEditing={isEditing} placeholder="Achievement" className="inline" />
                      </span>
                      {(ach.issuer || isEditing) && (
                        <span className="text-slate-600">
                          {" • "}
                          <EditableField value={ach.issuer || ""} onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)} isEditing={isEditing} placeholder="Organization" className="inline" />
                        </span>
                      )}
                      {(ach.date || isEditing) && (
                        <span className="text-slate-500">
                          {" • "}
                          <EditableField value={ach.date || ""} onChange={(v) => actions?.updateItem("achievements", ach.id, "date", v)} isEditing={isEditing} placeholder="Date" className="inline" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 6. Professional Academic Template (Industry Standard) ---
const AcademicProTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
  const getContactItems = () => {
    const items = [];
    if (data.personalInfo.email || isEditing) items.push({ icon: Mail, val: data.personalInfo.email, key: 'email', type: 'email' });
    if (data.personalInfo.phone || isEditing) items.push({ icon: Phone, val: data.personalInfo.phone, key: 'phone', type: 'phone' });
    if (data.personalInfo.location || isEditing) items.push({ icon: MapPin, val: data.personalInfo.location, key: 'location', type: 'text' });
    if (data.personalInfo.linkedin || isEditing) items.push({ icon: Linkedin, val: data.personalInfo.linkedin, key: 'linkedin', label: 'LinkedIn', type: 'link' });
    if (data.personalInfo.github || isEditing) items.push({ icon: Github, val: data.personalInfo.github, key: 'github', label: 'GitHub', type: 'link' });
    if (data.personalInfo.website || isEditing) items.push({ icon: Globe, val: data.personalInfo.website, key: 'website', label: 'Website', type: 'link' });
    return items;
  };

  return (
    <div className="p-8 text-slate-900 h-full font-serif group/resume">
      {/* Professional Header */}
      <header className="text-center mb-4 pb-3 border-b-2 border-slate-900 break-inside-avoid">
        <h1 className="text-4xl font-bold tracking-wide mb-2 uppercase text-slate-900">
          <EditableField
            value={data.personalInfo.fullName}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
            isEditing={isEditing}
            placeholder="YOUR NAME"
            className="text-center w-full"
          />
        </h1>

        {(data.personalInfo.title || isEditing) && (
          <div className="text-sm font-medium text-slate-600 mb-3 tracking-wide">
            <EditableField
              value={data.personalInfo.title || ""}
              onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, title: v })}
              isEditing={isEditing}
              placeholder="PROFESSIONAL TITLE / RESEARCH AREA"
              className="text-center w-full italic"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 font-sans">
          {getContactItems().map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <item.icon size={11} className="text-slate-500" />
              {isEditing ? (
                <EditableField
                  value={item.val || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, [item.key]: v })}
                  isEditing={true}
                  placeholder={item.key}
                  className={!item.val ? "text-slate-300 italic" : ""}
                />
              ) : (
                <span className={!item.val ? "hidden" : ""}>
                  {item.type === 'link' && item.val ? (
                    <a href={item.val.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" rel="noreferrer" className="hover:underline text-blue-700">
                      {item.label}
                    </a>
                  ) : item.type === 'email' && item.val ? (
                    <a href={`mailto:${item.val}`} className="hover:underline">{item.val}</a>
                  ) : item.val}
                </span>
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="space-y-4 font-sans">
        {/* Professional Summary */}
        {(data.summary || isEditing) && (
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-900 border-b border-slate-300 pb-1">
              Professional Summary
            </h2>
            <div className="text-xs leading-relaxed text-slate-700 text-justify">
              {isEditing ? (
                <textarea
                  value={data.summary || ""}
                  onChange={(e) => actions?.updateField("summary", e.target.value)}
                  className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-300 min-h-[60px] resize-none text-xs leading-relaxed rounded"
                  placeholder="Concise professional summary highlighting your expertise, research interests, and career objectives..."
                />
              ) : (
                <p className="whitespace-pre-wrap">
                  <HighlightText text={data.summary || ""} enabled={showHighlights} />
                </p>
              )}
            </div>
          </section>
        )}

        {/* Education (Highlighted for Academic) */}
        <section className="break-inside-avoid group/section">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex-1">
              Education
            </h2>
            {isEditing && (
              <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                <Plus size={14} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
            {data.education.map((edu, i) => (
              <div key={edu.id} className="relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded transition-colors">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                    onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                    onDelete={() => actions?.remove("education", edu.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs text-slate-900">
                    <EditableField
                      value={edu.degree}
                      onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)}
                      isEditing={isEditing}
                      placeholder="Degree (e.g., B.Tech in Computer Science)"
                    />
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    <EditableField
                      value={edu.year}
                      onChange={(v) => actions?.updateItem("education", edu.id, "year", v)}
                      isEditing={isEditing}
                      placeholder="Year (e.g., 2020-2024)"
                      className="text-right w-full block"
                    />
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 font-medium">
                  <EditableField
                    value={edu.school}
                    onChange={(v) => actions?.updateItem("education", edu.id, "school", v)}
                    isEditing={isEditing}
                    placeholder="Institution Name"
                  />
                </div>
                {(edu.location || isEditing) && (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    <EditableField
                      value={edu.location || ""}
                      onChange={(v) => actions?.updateItem("education", edu.id, "location", v)}
                      isEditing={isEditing}
                      placeholder="Location (Optional)"
                      className={!edu.location ? "text-slate-300 italic" : ""}
                    />
                  </div>
                )}
                {(edu.gpa || isEditing) && (
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    <span className="font-medium">GPA: </span>
                    <EditableField
                      value={edu.gpa || ""}
                      onChange={(v) => actions?.updateItem("education", edu.id, "gpa", v)}
                      isEditing={isEditing}
                      placeholder="X.X/10 or X.X/4.0"
                      className={!edu.gpa ? "text-slate-300 italic" : "inline"}
                    />
                  </div>
                )}
                {(edu.description || isEditing) && (
                  <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    <EditableField
                      value={edu.description || ""}
                      onChange={(v) => actions?.updateItem("education", edu.id, "description", v)}
                      isEditing={isEditing}
                      multiline
                      placeholder="Relevant coursework, honors, thesis topics..."
                      className={!edu.description ? "text-slate-300 italic" : ""}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="group/section">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex-1">
              Professional Experience
            </h2>
            {isEditing && (
              <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                <Plus size={14} />
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {data.experience.length === 0 && isEditing && <EmptySectionPlaceholder title="Experience" onClick={() => actions?.add("experience")} />}
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="break-inside-avoid relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded transition-colors">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
                    onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
                    onDelete={() => actions?.remove("experience", exp.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs text-slate-900">
                    <EditableField
                      value={exp.role}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
                      isEditing={isEditing}
                      placeholder="Job Title"
                    />
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium text-right">
                    <EditableField
                      value={exp.duration}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)}
                      isEditing={isEditing}
                      placeholder="Dates"
                      className="text-right w-full block"
                    />
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-700 italic mb-1">
                  <EditableField
                    value={exp.company}
                    onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
                    isEditing={isEditing}
                    placeholder="Company/Organization"
                  />
                  {(exp.location || isEditing) && (
                    <span className="text-[10px] text-slate-500 not-italic ml-2">
                      • <EditableField
                        value={exp.location || ""}
                        onChange={(v) => actions?.updateItem("experience", exp.id, "location", v)}
                        isEditing={isEditing}
                        placeholder="Location"
                        className={!exp.location ? "text-slate-300 italic inline" : "inline"}
                      />
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-700 mt-1">
                  <EditableBulletList
                    items={exp.description ? exp.description.split('\n') : []}
                    onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
                    isEditing={isEditing}
                    showHighlights={showHighlights}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="group/section">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex-1">
              Projects & Research
            </h2>
            {isEditing && (
              <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                <Plus size={14} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="break-inside-avoid relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                    onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                    onDelete={() => actions?.remove("projects", proj.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs text-slate-900">
                    <EditableField
                      value={proj.name}
                      onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)}
                      isEditing={isEditing}
                      placeholder="Project Title"
                    />
                    {proj.link && !isEditing && (
                      <a href={proj.link} target="_blank" className="ml-2 font-normal text-blue-600 underline text-[10px]">Link</a>
                    )}
                  </span>
                  {(proj.duration || isEditing) && (
                    <span className="text-[11px] text-slate-600">
                      <EditableField
                        value={proj.duration || ""}
                        onChange={(v) => actions?.updateItem("projects", proj.id, "duration", v)}
                        isEditing={isEditing}
                        placeholder="Duration"
                        className="text-right w-full block"
                      />
                    </span>
                  )}
                </div>
                {/* Tech Stack Display */}
                {(proj.techStack || isEditing) && (
                  <div className="mb-1">
                    {isEditing ? (
                      <EditableField
                        value={proj.techStack || ""}
                        onChange={(v) => actions?.updateItem("projects", proj.id, "techStack", v)}
                        isEditing={true}
                        placeholder="Tech: React, Node.js, TypeScript..."
                        className="text-[9px] text-slate-500 italic"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack?.split(',').map((tech, idx) => (
                          <span key={idx} className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-sm font-medium border border-blue-100">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-[11px] leading-relaxed text-slate-700">
                  <EditableField
                    value={proj.description}
                    onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)}
                    isEditing={isEditing}
                    multiline
                    placeholder="Project description, technologies used, outcomes..."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        {(data.skills || isEditing) && (
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-900 border-b border-slate-300 pb-1">
              Technical Skills
            </h2>
            <div className="text-[11px] leading-relaxed text-slate-700">
              {isEditing ? (
                <textarea
                  value={data.skills}
                  onChange={(e) => actions?.updateField("skills", e.target.value)}
                  className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-300 min-h-[50px] text-[11px] rounded"
                  placeholder="Languages: Python, Java, C++&#10;Frameworks: React, Node.js, TensorFlow&#10;Tools: Git, Docker, AWS"
                />
              ) : (
                <div className="whitespace-pre-wrap">{data.skills}</div>
              )}
            </div>
          </section>
        )}

        {/* Certifications */}
        {(data.certifications && data.certifications.length > 0) && (
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex-1">
                Certifications
              </h2>
              {isEditing && (
                <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.certifications.map((cert, i) => (
                <div key={cert.id} className="text-[11px] relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                      onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                      onDelete={() => actions?.remove("certifications", cert.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      <EditableField
                        value={cert.title}
                        onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)}
                        isEditing={isEditing}
                        placeholder="Certification Title"
                      />
                    </span>
                    <span className="text-[10px] text-slate-500">
                      <EditableField
                        value={cert.date}
                        onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)}
                        isEditing={isEditing}
                        placeholder="Date"
                        className="text-right w-full block"
                      />
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <EditableField
                      value={cert.issuer}
                      onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)}
                      isEditing={isEditing}
                      placeholder="Issuing Organization"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {(data.achievements && data.achievements.length > 0) && (
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex-1">
                Honors & Awards
              </h2>
              {isEditing && (
                <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.achievements.map((ach, i) => (
                <div key={ach.id} className="text-[11px] relative group/item pl-2 hover:bg-slate-50/50 -ml-2 rounded">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                      onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                      onDelete={() => actions?.remove("achievements", ach.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">
                      <EditableField
                        value={ach.title}
                        onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)}
                        isEditing={isEditing}
                        placeholder="Award Title"
                      />
                    </span>
                    <span className="text-[10px] text-slate-500">
                      <EditableField
                        value={ach.date}
                        onChange={(v) => actions?.updateItem("achievements", ach.id, "date", v)}
                        isEditing={isEditing}
                        placeholder="Date"
                        className="text-right w-full block"
                      />
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <EditableField
                      value={ach.issuer}
                      onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)}
                      isEditing={isEditing}
                      placeholder="Issuing Organization"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// --- 7. Tech Pro Template (FAANG-Style, Two-Column) ---
const TechProTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
  const getContactItems = () => {
    const items = [];
    if (data.personalInfo.phone || isEditing) items.push({ icon: Phone, val: data.personalInfo.phone, key: 'phone' });
    if (data.personalInfo.email || isEditing) items.push({ icon: Mail, val: data.personalInfo.email, key: 'email' });
    if (data.personalInfo.linkedin || isEditing) items.push({ icon: Linkedin, val: data.personalInfo.linkedin, key: 'linkedin', label: 'LinkedIn' });
    if (data.personalInfo.github || isEditing) items.push({ icon: Github, val: data.personalInfo.github, key: 'github', label: 'GitHub' });
    return items;
  };

  return (
    <div className="p-7 text-slate-900 h-full font-sans group/resume">
      {/* Compact Header */}
      <header className="text-center mb-3 pb-2 border-b-2 border-slate-900 break-inside-avoid">
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">
          <EditableField
            value={data.personalInfo.fullName}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
            isEditing={isEditing}
            placeholder="YOUR NAME"
            className="text-center w-full"
          />
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
          {getContactItems().map((item) => (
            <div key={item.key} className="flex items-center gap-1">
              <item.icon size={10} className="text-slate-500" />
              {isEditing ? (
                <EditableField
                  value={item.val || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, [item.key]: v })}
                  isEditing={true}
                  placeholder={item.key}
                  className={!item.val ? "text-slate-300 italic" : ""}
                />
              ) : (
                <span className={!item.val ? "hidden" : ""}>
                  {item.key === 'linkedin' || item.key === 'github' ? (
                    <a href={item.val?.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" rel="noreferrer" className="hover:underline">
                      {item.label}
                    </a>
                  ) : item.key === 'email' ? (
                    <a href={`mailto:${item.val}`} className="hover:underline">{item.val}</a>
                  ) : item.val}
                </span>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Professional Summary */}
      {(data.summary || isEditing) && (
        <section className="break-inside-avoid mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-900 border-b border-slate-300 pb-0.5">
            Professional Summary
          </h2>
          <div className="text-[10px] leading-relaxed text-slate-700 text-justify">
            {isEditing ? (
              <textarea
                value={data.summary || ""}
                onChange={(e) => actions?.updateField("summary", e.target.value)}
                className="w-full bg-transparent border border-slate-200 p-1.5 focus:ring-1 focus:ring-blue-300 min-h-[45px] resize-none text-[10px] leading-relaxed rounded"
                placeholder="Brief professional summary highlighting your expertise and key strengths..."
              />
            ) : (
              <p className="whitespace-pre-wrap">
                <HighlightText text={data.summary || ""} enabled={showHighlights} />
              </p>
            )}
          </div>
        </section>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-[60%_40%] gap-4">
        {/* LEFT COLUMN - Experience & Projects */}
        <div className="space-y-3">
          {/* Skills Section - Full Width at Top */}
          {(data.skills || isEditing) && (
            <section className="break-inside-avoid col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-900 border-b border-slate-300 pb-0.5">
                Skills
              </h2>
              <div className="text-[10px] leading-relaxed text-slate-700">
                {isEditing ? (
                  <textarea
                    value={data.skills}
                    onChange={(e) => actions?.updateField("skills", e.target.value)}
                    className="w-full bg-transparent border border-slate-200 p-1.5 focus:ring-1 focus:ring-blue-300 min-h-[40px] text-[10px] rounded resize-none"
                    placeholder="Kotlin, Java, Android SDK, Jetpack Components, MVVM, Clean Architecture, XML, Material Design, Jetpack Compose, Retrofit, OkHttp, Room, SQLite, Firebase, Cloud Messaging, Coroutines, WorkManager, Glide, Git, Kotlin, Android Studio"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{data.skills}</div>
                )}
              </div>
            </section>
          )}

          {/* Experience */}
          <section className="group/section">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 flex-1">
                Experience
              </h2>
              {isEditing && (
                <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {data.experience.length === 0 && isEditing && <EmptySectionPlaceholder title="Experience" onClick={() => actions?.add("experience")} />}
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="break-inside-avoid relative group/item pl-1.5 hover:bg-slate-50/50 -ml-1.5 rounded">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
                      onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
                      onDelete={() => actions?.remove("experience", exp.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[11px] text-slate-900">
                      <EditableField
                        value={exp.company}
                        onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
                        isEditing={isEditing}
                        placeholder="Company Name"
                      />
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      <EditableField
                        value={exp.duration}
                        onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)}
                        isEditing={isEditing}
                        placeholder="May 2024 - Present"
                        className="text-right w-full block"
                      />
                    </span>
                  </div>
                  <div className="text-[10px] italic text-slate-600 mb-1">
                    <EditableField
                      value={exp.role}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
                      isEditing={isEditing}
                      placeholder="Job Title"
                    />
                  </div>
                  <div className="text-[10px] leading-snug text-slate-700">
                    <EditableBulletList
                      items={exp.description ? exp.description.split('\n') : []}
                      onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
                      isEditing={isEditing}
                      showHighlights={showHighlights}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="group/section">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 flex-1">
                Projects
              </h2>
              {isEditing && (
                <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="break-inside-avoid relative group/item pl-1.5 hover:bg-slate-50/50 -ml-1.5 rounded">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                      onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                      onDelete={() => actions?.remove("projects", proj.id)}
                    />
                  )}
                  <div className="font-bold text-[10px] text-slate-900 mb-0.5">
                    <EditableField
                      value={proj.name}
                      onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)}
                      isEditing={isEditing}
                      placeholder="Project Name"
                    />
                  </div>
                  {/* Tech Stack Display - Green themed for TechPro */}
                  {(proj.techStack || isEditing) && (
                    <div className="mb-0.5">
                      {isEditing ? (
                        <EditableField
                          value={proj.techStack || ""}
                          onChange={(v) => actions?.updateItem("projects", proj.id, "techStack", v)}
                          isEditing={true}
                          placeholder="Tech: React, Node.js..."
                          className="text-[8px] text-slate-500 italic"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-0.5">
                          {proj.techStack?.split(',').map((tech, idx) => (
                            <span key={idx} className="text-[7px] px-1 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm font-medium border border-emerald-100">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-[9px] leading-snug text-slate-700">
                    <EditableField
                      value={proj.description}
                      onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)}
                      isEditing={isEditing}
                      multiline
                      placeholder="Brief project description with technologies used..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - Education, Awards, Certifications */}
        <div className="space-y-3">
          {/* Education */}
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 flex-1">
                Education
              </h2>
              {isEditing && (
                <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
              {data.education.map((edu, i) => (
                <div key={edu.id} className="relative group/item pl-1.5 hover:bg-slate-50/50 -ml-1.5 rounded text-[10px]">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                      onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                      onDelete={() => actions?.remove("education", edu.id)}
                    />
                  )}
                  <div className="font-bold text-slate-900 uppercase">
                    <EditableField
                      value={edu.school}
                      onChange={(v) => actions?.updateItem("education", edu.id, "school", v)}
                      isEditing={isEditing}
                      placeholder="University Name"
                    />
                  </div>
                  <div className="text-slate-700">
                    <EditableField
                      value={edu.degree}
                      onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)}
                      isEditing={isEditing}
                      placeholder="Degree"
                    />
                  </div>
                  <div className="text-[9px] text-slate-500">
                    <EditableField
                      value={edu.year}
                      onChange={(v) => actions?.updateItem("education", edu.id, "year", v)}
                      isEditing={isEditing}
                      placeholder="Year"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Honors & Awards */}
          {(data.achievements && data.achievements.length > 0) || isEditing ? (
            <section className="break-inside-avoid group/section">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 flex-1">
                  Honors & Awards
                </h2>
                {isEditing && (
                  <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                    <Plus size={12} />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {data.achievements && data.achievements.length === 0 && isEditing && <EmptySectionPlaceholder title="Achievement" onClick={() => actions?.add("achievements")} />}
                {data.achievements && data.achievements.map((ach, i) => (
                  <div key={ach.id} className="relative group/item pl-1.5 hover:bg-slate-50/50 -ml-1.5 rounded text-[10px]">
                    {isEditing && (
                      <SectionControls
                        onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                        onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                        onDelete={() => actions?.remove("achievements", ach.id)}
                      />
                    )}
                    <div className="font-bold text-slate-900">
                      <EditableField
                        value={ach.title}
                        onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)}
                        isEditing={isEditing}
                        placeholder="Award Title"
                      />
                    </div>
                    <div className="text-[9px] text-slate-600">
                      <EditableField
                        value={ach.issuer}
                        onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)}
                        isEditing={isEditing}
                        placeholder="Organization"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Certifications */}
          {(data.certifications && data.certifications.length > 0) || isEditing ? (
            <section className="break-inside-avoid group/section">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 flex-1">
                  Certifications
                </h2>
                {isEditing && (
                  <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded ml-1">
                    <Plus size={12} />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {data.certifications && data.certifications.length === 0 && isEditing && <EmptySectionPlaceholder title="Certification" onClick={() => actions?.add("certifications")} />}
                {data.certifications && data.certifications.map((cert, i) => (
                  <div key={cert.id} className="relative group/item pl-1.5 hover:bg-slate-50/50 -ml-1.5 rounded text-[10px]">
                    {isEditing && (
                      <SectionControls
                        onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                        onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                        onDelete={() => actions?.remove("certifications", cert.id)}
                      />
                    )}
                    <div className="font-bold text-slate-900">
                      <EditableField
                        value={cert.title}
                        onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)}
                        isEditing={isEditing}
                        placeholder="Certification Name"
                      />
                    </div>
                    <div className="text-[9px] text-slate-600">
                      <EditableField
                        value={cert.issuer}
                        onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)}
                        isEditing={isEditing}
                        placeholder="Issuing Organization"
                      />
                    </div>
                    {(cert.date || isEditing) && (
                      <div className="text-[9px] text-slate-500">
                        <EditableField
                          value={cert.date || ""}
                          onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)}
                          isEditing={isEditing}
                          placeholder="Date"
                          className={!cert.date ? "text-slate-300 italic" : ""}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// --- 6. ATS Optimized Template (Maximum ATS compatibility) ---
// Single-column, left-aligned, standard headings, no graphics/icons
// Designed to pass 95%+ of Applicant Tracking Systems (Taleo, Workday, Greenhouse, etc.)
const ATSOptimizedTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
  // Build contact string for plain text display (ATS-friendly)
  const getContactString = () => {
    const parts = [];
    if (data.personalInfo.email) parts.push(data.personalInfo.email);
    if (data.personalInfo.phone) parts.push(data.personalInfo.phone);
    if (data.personalInfo.location) parts.push(data.personalInfo.location);
    if (data.personalInfo.linkedin) parts.push(`linkedin.com/in/${data.personalInfo.linkedin.replace(/.*linkedin\.com\/in\//, '').replace(/^\/+|\/+$/g, '')}`);
    if (data.personalInfo.github) parts.push(`github.com/${data.personalInfo.github.replace(/.*github\.com\//, '').replace(/^\/+|\/+$/g, '')}`);
    if (data.personalInfo.website) parts.push(data.personalInfo.website.replace(/^https?:\/\//, ''));
    return parts;
  };

  return (
    <div className="p-8 text-slate-900 h-full font-sans text-xs leading-normal group/resume">
      {/* Header - Left-aligned, no centering (ATS best practice) */}
      <header className="mb-4 break-inside-avoid">
        <h1 className="text-2xl font-bold mb-1">
          <EditableField
            value={data.personalInfo.fullName}
            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
            isEditing={isEditing}
            placeholder="Full Name"
          />
        </h1>
        {(data.personalInfo.title || isEditing) && (
          <p className="text-sm font-medium text-slate-700 mb-2">
            <EditableField
              value={data.personalInfo.title || ""}
              onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, title: v })}
              isEditing={isEditing}
              placeholder="Professional Title"
            />
          </p>
        )}
        {/* Contact info in body text, pipe-separated (ATS-friendly) */}
        <div className="text-xs text-slate-600">
          {isEditing ? (
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span>
                <EditableField
                  value={data.personalInfo.email || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, email: v })}
                  isEditing={true}
                  placeholder="email@example.com"
                />
              </span>
              <span>|</span>
              <span>
                <EditableField
                  value={data.personalInfo.phone || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, phone: v })}
                  isEditing={true}
                  placeholder="Phone"
                />
              </span>
              <span>|</span>
              <span>
                <EditableField
                  value={data.personalInfo.location || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, location: v })}
                  isEditing={true}
                  placeholder="City, State"
                />
              </span>
              <span>|</span>
              <span>
                <EditableField
                  value={data.personalInfo.linkedin || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, linkedin: v })}
                  isEditing={true}
                  placeholder="LinkedIn URL"
                />
              </span>
              <span>|</span>
              <span>
                <EditableField
                  value={data.personalInfo.github || ""}
                  onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, github: v })}
                  isEditing={true}
                  placeholder="GitHub URL"
                />
              </span>
            </div>
          ) : (
            <span>{getContactString().join(' | ')}</span>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {/* Professional Summary - Standard heading */}
        {(data.summary || isEditing) && (
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-1 border-b border-slate-300 pb-0.5">
              Professional Summary
            </h2>
            <div className="text-xs leading-relaxed text-slate-700">
              {isEditing ? (
                <textarea
                  value={data.summary || ""}
                  onChange={(e) => actions?.updateField("summary", e.target.value)}
                  className="w-full bg-transparent border border-slate-200 p-1.5 focus:ring-1 focus:ring-blue-300 min-h-[50px] text-xs resize-none rounded"
                  placeholder="Write a professional summary with relevant keywords..."
                />
              ) : (
                <HighlightText text={data.summary || ""} enabled={showHighlights} />
              )}
            </div>
          </section>
        )}

        {/* Work Experience - Standard heading (most ATS systems expect this exact wording) */}
        <section className="group/section">
          <div className="flex items-center justify-between mb-2 border-b border-slate-300 pb-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wide">Work Experience</h2>
            {isEditing && (
              <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {data.experience.length === 0 && isEditing && <EmptySectionPlaceholder title="Experience" onClick={() => actions?.add("experience")} />}
            {data.experience.map((exp, i) => (
              <div key={exp.id} className="break-inside-avoid relative group/item">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
                    onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
                    onDelete={() => actions?.remove("experience", exp.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs">
                    <EditableField
                      value={exp.role}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
                      isEditing={isEditing}
                      placeholder="Job Title"
                    />
                    {" - "}
                    <EditableField
                      value={exp.company}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
                      isEditing={isEditing}
                      placeholder="Company Name"
                    />
                  </span>
                  <span className="text-[10px] text-slate-600">
                    <EditableField
                      value={exp.duration}
                      onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)}
                      isEditing={isEditing}
                      placeholder="Start - End"
                      className="text-right"
                    />
                  </span>
                </div>
                <div className="text-[10px] leading-snug text-slate-700 pl-3">
                  <EditableBulletList
                    items={exp.description ? exp.description.split('\n') : []}
                    onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
                    isEditing={isEditing}
                    showHighlights={showHighlights}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education - Standard heading */}
        <section className="break-inside-avoid group/section">
          <div className="flex items-center justify-between mb-2 border-b border-slate-300 pb-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wide">Education</h2>
            {isEditing && (
              <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
            {data.education.map((edu, i) => (
              <div key={edu.id} className="relative group/item">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                    onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                    onDelete={() => actions?.remove("education", edu.id)}
                  />
                )}
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10px]">
                    <EditableField value={edu.degree} onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)} isEditing={isEditing} placeholder="Degree" />
                  </span>
                  <span className="text-[10px] text-slate-600">
                    <EditableField value={edu.year} onChange={(v) => actions?.updateItem("education", edu.id, "year", v)} isEditing={isEditing} placeholder="Year" />
                  </span>
                </div>
                <div className="text-[10px] text-slate-700">
                  <EditableField value={edu.school} onChange={(v) => actions?.updateItem("education", edu.id, "school", v)} isEditing={isEditing} placeholder="School/University" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills - Plain text or bulleted list (ATS-friendly) */}
        {(data.skills || isEditing) && (
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-1 border-b border-slate-300 pb-0.5">
              Skills
            </h2>
            <div className="text-[10px] leading-relaxed text-slate-700">
              {isEditing ? (
                <textarea
                  value={data.skills}
                  onChange={(e) => actions?.updateField("skills", e.target.value)}
                  className="w-full bg-transparent border border-slate-200 p-1.5 focus:ring-1 focus:ring-blue-300 min-h-[40px] text-[10px] resize-none rounded"
                  placeholder="List skills separated by commas (e.g., JavaScript, React, Node.js, AWS, Python...)"
                />
              ) : (
                <span>{data.skills}</span>
              )}
            </div>
          </section>
        )}

        {/* Projects - Standard heading */}
        <section className="group/section">
          <div className="flex items-center justify-between mb-2 border-b border-slate-300 pb-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wide">Projects</h2>
            {isEditing && (
              <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
            {data.projects.map((proj, i) => (
              <div key={proj.id} className="break-inside-avoid relative group/item">
                {isEditing && (
                  <SectionControls
                    onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                    onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                    onDelete={() => actions?.remove("projects", proj.id)}
                  />
                )}
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-xs">
                    <EditableField value={proj.name} onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)} isEditing={isEditing} placeholder="Project Name" />
                    {proj.link && !isEditing && <span className="font-normal text-slate-500 text-[9px] ml-1">({proj.link.replace(/^https?:\/\//, '')})</span>}
                    {isEditing && (
                      <span className="ml-2 font-normal text-[9px]">
                        <EditableField value={proj.link || ""} onChange={(v) => actions?.updateItem("projects", proj.id, "link", v)} isEditing={true} placeholder="Link (optional)" className="text-blue-600" />
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    <EditableField value={proj.duration || ""} onChange={(v) => actions?.updateItem("projects", proj.id, "duration", v)} isEditing={isEditing} placeholder="Duration" />
                  </span>
                </div>
                {/* Tech stack as plain text (ATS-friendly, no badges) */}
                {(proj.techStack || isEditing) && (
                  <div className="text-[9px] text-slate-600 italic mb-0.5">
                    {isEditing ? (
                      <EditableField
                        value={proj.techStack || ""}
                        onChange={(v) => actions?.updateItem("projects", proj.id, "techStack", v)}
                        isEditing={true}
                        placeholder="Technologies: React, Node.js, MongoDB..."
                      />
                    ) : (
                      <span>Technologies: {proj.techStack}</span>
                    )}
                  </div>
                )}
                <div className="text-[10px] leading-snug text-slate-700">
                  <EditableField
                    value={proj.description}
                    onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)}
                    isEditing={isEditing}
                    multiline
                    placeholder="Project description with quantifiable achievements..."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications - Standard heading */}
        {((data.certifications && data.certifications.length > 0) || isEditing) && (
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2 border-b border-slate-300 pb-0.5">
              <h2 className="text-sm font-bold uppercase tracking-wide">Certifications</h2>
              {isEditing && (
                <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {data.certifications && data.certifications.length === 0 && isEditing && (
                <EmptySectionPlaceholder title="Certification" onClick={() => actions?.add("certifications")} />
              )}
              {data.certifications && data.certifications.map((cert, i) => (
                <div key={cert.id} className="relative group/item text-[10px]">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                      onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                      onDelete={() => actions?.remove("certifications", cert.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">
                      <EditableField value={cert.title} onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)} isEditing={isEditing} placeholder="Certification Name" />
                      {" - "}
                      <span className="font-normal text-slate-600">
                        <EditableField value={cert.issuer} onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)} isEditing={isEditing} placeholder="Issuer" />
                      </span>
                    </span>
                    {(cert.date || isEditing) && (
                      <span className="text-slate-500">
                        <EditableField value={cert.date || ""} onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)} isEditing={isEditing} placeholder="Year" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements - Standard heading */}
        {((data.achievements && data.achievements.length > 0) || isEditing) && (
          <section className="break-inside-avoid group/section">
            <div className="flex items-center justify-between mb-2 border-b border-slate-300 pb-0.5">
              <h2 className="text-sm font-bold uppercase tracking-wide">Achievements</h2>
              {isEditing && (
                <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                  <Plus size={12} />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {data.achievements && data.achievements.length === 0 && isEditing && (
                <EmptySectionPlaceholder title="Achievement" onClick={() => actions?.add("achievements")} />
              )}
              {data.achievements && data.achievements.map((ach, i) => (
                <div key={ach.id} className="relative group/item text-[10px]">
                  {isEditing && (
                    <SectionControls
                      onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                      onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                      onDelete={() => actions?.remove("achievements", ach.id)}
                    />
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">
                      <EditableField value={ach.title} onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)} isEditing={isEditing} placeholder="Achievement Title" />
                      {" - "}
                      <span className="font-normal text-slate-600">
                        <EditableField value={ach.issuer} onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)} isEditing={isEditing} placeholder="Organization" />
                      </span>
                    </span>
                    {(ach.date || isEditing) && (
                      <span className="text-slate-500">
                        <EditableField value={ach.date || ""} onChange={(v) => actions?.updateItem("achievements", ach.id, "date", v)} isEditing={isEditing} placeholder="Year" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export const TEMPLATES: Template[] = [
  { id: "classic", name: "Classic", description: "Minimalist, centered header", component: ClassicTemplate },
  { id: "ats-optimized", name: "ATS Optimized", description: "Maximum ATS compatibility - single column, standard headings", component: ATSOptimizedTemplate },
  { id: "tech-pro", name: "Tech Pro", description: "FAANG-style two-column layout", component: TechProTemplate },
  { id: "academic-pro", name: "Academic Pro", description: "Professional academic layout", component: AcademicProTemplate },
  { id: "sidebar-left", name: "Academic", description: "Sidebar left (Sakshi Style)", component: SidebarLeftTemplate },
  { id: "modern", name: "Modern", description: "Clean, spacious design", component: ModernTemplate },
];

export const getTemplate = (id: TemplateId): Template | undefined => TEMPLATES.find(t => t.id === id);
