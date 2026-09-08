// Product Standard (ATS Optimized) Template - Production Ready
// Based on FAANG/Unicorn/SaaS company standards

const ProductStandardTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, actions, showHighlights = false }) => {
    const getContactItems = () => {
        const items = [];
        if (data.personalInfo.location || isEditing) items.push({ icon: MapPin, val: data.personalInfo.location, key: 'location', label: 'Location' });
        if (data.personalInfo.phone || isEditing) items.push({ icon: Phone, val: data.personalInfo.phone, key: 'phone', label: 'Phone' });
        if (data.personalInfo.email || isEditing) items.push({ icon: Mail, val: data.personalInfo.email, key: 'email', label: 'Email' });
        if (data.personalInfo.linkedin || isEditing) items.push({ icon: Linkedin, val: data.personalInfo.linkedin, key: 'linkedin', label: 'LinkedIn' });
        if (data.personalInfo.github || isEditing) items.push({ icon: Github, val: data.personalInfo.github, key: 'github', label: 'GitHub' });
        if (data.personalInfo.website || isEditing) items.push({ icon: Globe, val: data.personalInfo.website, key: 'website', label: 'Portfolio' });
        return items;
    };

    // Validation helpers (for UI feedback)
    const validateSummary = (text: string) => {
        const lines = text.split('\n').length;
        const chars = text.length;
        if (!text) return { valid: false, message: 'Summary required' };
        if (lines > 4) return { valid: false, message: 'Max 4 lines' };
        if (chars > 300) return { valid: false, message: 'Max 300 characters' };
        if (text.toLowerCase().includes('seeking opportunity') || text.toLowerCase().includes('hardworking')) {
            return { valid: false, message: 'Avoid generic phrases' };
        }
        return { valid: true, message: '' };
    };

    return (
        <div className="p-[24mm] text-[#111827] h-full font-inter" style={{ maxWidth: '210mm', fontSize: '10.5px', lineHeight: '1.45' }}>
            {/* Header */}
            <header className="text-center mb-4 break-inside-avoid border-b border-[#E5E7EB] pb-4">
                <h1 className="text-[22px] font-semibold mb-1 tracking-tight" style={{ fontWeight: 600 }}>
                    <EditableField
                        value={data.personalInfo.fullName}
                        onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, fullName: v })}
                        isEditing={isEditing}
                        placeholder="YOUR NAME"
                        className="w-full text-center uppercase"
                    />
                </h1>
                {(data.personalInfo.title || isEditing) && (
                    <p className="text-[11.5px] text-[#374151] mb-3 font-normal">
                        <EditableField
                            value={data.personalInfo.title || ""}
                            onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, title: v })}
                            isEditing={isEditing}
                            placeholder="Professional Title | Role"
                            className="w-full text-center"
                        />
                    </p>
                )}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-[#374151]">
                    {getContactItems().map((item, idx) => (
                        <span key={item.key} className="flex items-center gap-1">
                            <item.icon className="h-3 w-3" />
                            {isEditing ? (
                                <EditableField
                                    value={item.val || ""}
                                    onChange={(v) => actions?.updateField("personalInfo", { ...data.personalInfo, [item.key]: v })}
                                    isEditing={true}
                                    placeholder={item.label}
                                    className="inline-block"
                                />
                            ) : (
                                <>
                                    {item.key === 'linkedin' || item.key === 'github' || item.key === 'website' ? (
                                        item.val && (
                                            <a href={item.val.startsWith('http') ? item.val : `https://${item.val}`} target="_blank" rel="noreferrer" className="text-[#2563EB] hover:underline">
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

            {/* Professional Summary - MAX 3-4 lines, 300 chars */}
            {(data.summary || isEditing) && (
                <section className="mb-5 break-inside-avoid">
                    <h2 className="text-[14px] font-semibold uppercase mb-2 tracking-wide text-[#111827] border-b border-[#E5E7EB] pb-1" style={{ fontWeight: 600 }}>
                        Professional Summary
                    </h2>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={data.summary || ""}
                                onChange={(e) => actions?.updateField("summary", e.target.value)}
                                className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-400 min-h-[60px] text-[10.5px] resize-none rounded"
                                placeholder="3-4 lines max, 300 characters. Focus on experience, skills, and impact. Avoid 'seeking opportunity' or generic phrases."
                                maxLength={300}
                                style={{ lineHeight: '1.45' }}
                            />
                            {data.summary && (
                                <div className="text-[9px] mt-1 text-slate-500">
                                    {data.summary.length}/300 chars · {data.summary.split('\n').length} lines
                                    {validateSummary(data.summary).message && (
                                        <span className="text-red-500 ml-2">⚠️ {validateSummary(data.summary).message}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[10.5px] leading-relaxed text-[#374151] text-justify" style={{ lineHeight: '1.45' }}>
                            <HighlightText text={data.summary || ""} enabled={showHighlights} />
                        </p>
                    )}
                </section>
            )}

            {/* Skills - GROUPED ONLY */}
            {(data.skills || isEditing) && (
                <section className="mb-5 break-inside-avoid">
                    <h2 className="text-[14px] font-semibold uppercase mb-2 tracking-wide text-[#111827] border-b border-[#E5E7EB] pb-1" style={{ fontWeight: 600 }}>
                        Skills
                    </h2>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={data.skills}
                                onChange={(e) => actions?.updateField("skills", e.target.value)}
                                className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-400 min-h-[70px] text-[10.5px] resize-none rounded font-mono"
                                placeholder="Group skills (max 5 groups, 10 skills per group):&#10;Languages: Kotlin, Java&#10;Android: Jetpack Compose, MVVM, LiveData&#10;Architecture: Clean Architecture, Modular Design&#10;Tools: Git, Gradle, CI/CD"
                                style={{ lineHeight: '1.5' }}
                            />
                            <div className="text-[9px] mt-1 text-slate-500">
                                💡 Group by category. No ratings or bars. Max 5 groups.
                            </div>
                        </div>
                    ) : (
                        <div className="text-[10.5px] leading-relaxed text-[#374151] whitespace-pre-wrap font-normal" style={{ lineHeight: '1.5' }}>
                            {data.skills}
                        </div>
                    )}
                </section>
            )}

            {/* Work Experience - CORE SECTION */}
            <section className="mb-5 group/section">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[14px] font-semibold uppercase tracking-wide text-[#111827] border-b border-[#E5E7EB] pb-1 flex-1" style={{ fontWeight: 600 }}>
                        Work Experience
                    </h2>
                    {isEditing && (
                        <button onClick={() => actions?.add("experience")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                            <Plus size={12} />
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
                            <div className="flex justify-between items-baseline mb-1">
                                <div className="flex-1">
                                    <span className="font-semibold text-[11.5px] text-[#111827]">
                                        <EditableField value={exp.company} onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)} isEditing={isEditing} placeholder="Company Name" />
                                    </span>
                                    <span className="text-[#374151] mx-2">—</span>
                                    <span className="font-medium text-[11px] text-[#374151]">
                                        <EditableField value={exp.role} onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)} isEditing={isEditing} placeholder="Role" className="inline" />
                                    </span>
                                </div>
                                <span className="text-[10px] text-[#374151]">
                                    <EditableField value={exp.duration} onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)} isEditing={isEditing} placeholder="Month Year – Present" className="text-right block whitespace-nowrap" />
                                </span>
                            </div>
                            {(exp.location || isEditing) && (
                                <div className="text-[10px] text-[#374151] mb-2 italic">
                                    <EditableField value={exp.location || ""} onChange={(v) => actions?.updateItem("experience", exp.id, "location", v)} isEditing={isEditing} placeholder="Location (optional)" />
                                </div>
                            )}
                            <div className="text-[10.5px] leading-relaxed text-[#374151]" style={{ lineHeight: '1.5' }}>
                                {isEditing && (
                                    <div className="text-[9px] text-amber-600 mb-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                                        💡 <strong>Bullet Rules:</strong> Max 5 bullets. Start with action verb. Include tech OR impact. Max 2 lines each.
                                        <br />✅ Good: "Reduced app launch time by 35% by optimizing cold-start logic with Kotlin coroutines"
                                        <br />❌ Avoid: "Worked on app development"
                                    </div>
                                )}
                                <EditableBulletList
                                    items={exp.description ? exp.description.split('\n').filter(line => line.trim()).slice(0, 5) : []}
                                    onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
                                    isEditing={isEditing}
                                    showHighlights={showHighlights}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects - MAX 3 */}
            <section className="mb-5 group/section">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[14px] font-semibold uppercase tracking-wide text-[#111827] border-b border-[#E5E7EB] pb-1 flex-1" style={{ fontWeight: 600 }}>
                        Projects
                    </h2>
                    {isEditing && (
                        <button onClick={() => actions?.add("projects")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2" disabled={data.projects.length >= 3}>
                            <Plus size={12} />
                        </button>
                    )}
                </div>
                {isEditing && data.projects.length >= 3 && (
                    <div className="text-[9px] text-amber-600 mb-2 bg-amber-50 p-1.5 rounded">
                        ⚠️ Max 3 projects recommended for ATS optimization
                    </div>
                )}
                <div className="space-y-3">
                    {data.projects.length === 0 && isEditing && <EmptySectionPlaceholder title="Project" onClick={() => actions?.add("projects")} />}
                    {data.projects.slice(0, 3).map((proj, i) => (
                        <div key={proj.id} className="break-inside-avoid relative group/item">
                            {isEditing && (
                                <SectionControls
                                    onMoveUp={i > 0 ? () => actions?.move("projects", i, "up") : undefined}
                                    onMoveDown={i < data.projects.length - 1 ? () => actions?.move("projects", i, "down") : undefined}
                                    onDelete={() => actions?.remove("projects", proj.id)}
                                />
                            )}
                            <div className="font-semibold text-[11px] text-[#111827] mb-1">
                                <EditableField value={proj.name} onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)} isEditing={isEditing} placeholder="Project Name" />
                            </div>
                            {(proj.tech || isEditing) && (
                                <div className="text-[10px] text-[#374151] mb-1 italic">
                                    <span className="font-medium">Tech:</span>{" "}
                                    <EditableField value={proj.tech || ""} onChange={(v) => actions?.updateItem("projects", proj.id, "tech", v)} isEditing={isEditing} placeholder="Kotlin, Firebase, ML APIs" className="inline" />
                                </div>
                            )}
                            <div className="text-[10.5px] leading-relaxed text-[#374151]" style={{ lineHeight: '1.5' }}>
                                <EditableBulletList
                                    items={proj.description ? proj.description.split('\n').filter(line => line.trim()) : []}
                                    onChange={(items) => actions?.updateItem("projects", proj.id, "description", items.join('\n'))}
                                    isEditing={isEditing}
                                    showHighlights={showHighlights}
                                />
                            </div>
                            {(proj.link || isEditing) && (
                                <div className="text-[10px] mt-1">
                                    {isEditing ? (
                                        <EditableField value={proj.link || ""} onChange={(v) => actions?.updateItem("projects", proj.id, "link", v)} isEditing={isEditing} placeholder="GitHub Link (strongly encouraged)" className="text-blue-600" />
                                    ) : (
                                        proj.link && (
                                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-[#2563EB] hover:underline">
                                                🔗 View Project
                                            </a>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="mb-5 group/section">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[14px] font-semibold uppercase tracking-wide text-[#111827] border-b border-[#E5E7EB] pb-1 flex-1" style={{ fontWeight: 600 }}>
                        Education
                    </h2>
                    {isEditing && (
                        <button onClick={() => actions?.add("education")} className="text-blue-600 hover:bg-blue-50 p-1 rounded ml-2">
                            <Plus size={12} />
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {data.education.length === 0 && isEditing && <EmptySectionPlaceholder title="Education" onClick={() => actions?.add("education")} />}
                    {data.education.map((edu, i) => (
                        <div key={edu.id} className="break-inside-avoid relative group/item">
                            {isEditing && (
                                <SectionControls
                                    onMoveUp={i > 0 ? () => actions?.move("education", i, "up") : undefined}
                                    onMoveDown={i < data.education.length - 1 ? () => actions?.move("education", i, "down") : undefined}
                                    onDelete={() => actions?.remove("education", edu.id)}
                                />
                            )}
                            <div className="font-semibold text-[11px] text-[#111827]">
                                <EditableField value={edu.degree} onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)} isEditing={isEditing} placeholder="Bachelor of Computer Applications (BCA)" />
                            </div>
                            <div className="text-[10px] text-[#374151] flex items-center gap-2 flex-wrap">
                                <EditableField value={edu.school} onChange={(v) => actions?.updateItem("education", edu.id, "school", v)} isEditing={isEditing} placeholder="University Name" className="inline" />
                                <span>|</span>
                                <EditableField value={edu.year} onChange={(v) => actions?.updateItem("education", edu.id, "year", v)} isEditing={isEditing} placeholder="2019 – 2022" className="inline" />
                                {(edu.gpa || isEditing) && (
                                    <>
                                        <span>|</span>
                                        <span>
                                            GPA: <EditableField value={edu.gpa || ""} onChange={(v) => actions?.updateItem("education", edu.id, "gpa", v)} isEditing={isEditing} placeholder="8.5" className="inline" />
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Optional: Achievements/OSS */}
            {((data.achievements && data.achievements.length > 0) || (data.certifications && data.certifications.length > 0) || isEditing) && (
                <section className="group/section">
                    <h2 className="text-[14px] font-semibold uppercase tracking-wide text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2" style={{ fontWeight: 600 }}>
                        Additional
                    </h2>

                    {/* Achievements */}
                    {((data.achievements && data.achievements.length > 0) || isEditing) && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[11px] font-medium text-[#374151] uppercase">Achievements</h3>
                                {isEditing && (
                                    <button onClick={() => actions?.add("achievements")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded">
                                        <Plus size={10} />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1">
                                {data.achievements && data.achievements.map((ach, i) => (
                                    <div key={ach.id} className="text-[10px] text-[#374151] relative group/item flex items-start gap-1">
                                        {isEditing && (
                                            <SectionControls
                                                onMoveUp={i > 0 ? () => actions?.move("achievements", i, "up") : undefined}
                                                onMoveDown={i < data.achievements.length - 1 ? () => actions?.move("achievements", i, "down") : undefined}
                                                onDelete={() => actions?.remove("achievements", ach.id)}
                                            />
                                        )}
                                        <span>•</span>
                                        <span className="flex-1">
                                            <EditableField value={ach.title} onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)} isEditing={isEditing} placeholder="Achievement" className="inline font-medium" />
                                            {" — "}
                                            <EditableField value={ach.issuer} onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)} isEditing={isEditing} placeholder="Organization" className="inline" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {((data.certifications && data.certifications.length > 0) || isEditing) && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[11px] font-medium text-[#374151] uppercase">Certifications</h3>
                                {isEditing && (
                                    <button onClick={() => actions?.add("certifications")} className="text-blue-600 hover:bg-blue-50 p-0.5 rounded">
                                        <Plus size={10} />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1">
                                {data.certifications && data.certifications.map((cert, i) => (
                                    <div key={cert.id} className="text-[10px] text-[#374151] relative group/item flex items-start gap-1">
                                        {isEditing && (
                                            <SectionControls
                                                onMoveUp={i > 0 ? () => actions?.move("certifications", i, "up") : undefined}
                                                onMoveDown={i < data.certifications.length - 1 ? () => actions?.move("certifications", i, "down") : undefined}
                                                onDelete={() => actions?.remove("certifications", cert.id)}
                                            />
                                        )}
                                        <span>•</span>
                                        <span className="flex-1">
                                            <EditableField value={cert.title} onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)} isEditing={isEditing} placeholder="Certification Name" className="inline font-medium" />
                                            {" — "}
                                            <EditableField value={cert.issuer} onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)} isEditing={isEditing} placeholder="Issuer" className="inline" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Page indicator for editing mode */}
            {isEditing && (
                <div className="mt-8 pt-4 border-t-2 border-dashed border-red-300 text-center text-[9px] text-red-500 print:hidden">
                    ⚠️ Page 2 only if content overflows. Keep resume to 1 page if possible.
                </div>
            )}
        </div>
    );
};
