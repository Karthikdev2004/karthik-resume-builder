// Complete fully-editable Modern Template - Ready to replace in templates.tsx

// --- 5. Modern Template (Clean, spacious) - FULLY EDITABLE VERSION ---
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
                {/* Summary/Profile */}
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

                {/* Experience */}
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
                                            <EditableField
                                                value={exp.role}
                                                onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
                                                isEditing={isEditing}
                                                placeholder="Job Title"
                                            />
                                        </h4>
                                        <p className="text-[10px] text-slate-600">
                                            <EditableField
                                                value={exp.company}
                                                onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
                                                isEditing={isEditing}
                                                placeholder="Company"
                                            />
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        <EditableField
                                            value={exp.duration}
                                            onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)}
                                            isEditing={isEditing}
                                            placeholder="Dates"
                                            className="text-right block"
                                        />
                                    </span>
                                </div>
                                <div className="text-[10px] leading-snug text-slate-700 mt-1">
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

                {/* Two-column sections */}
                <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-4">
                        {/* Education */}
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
                                            <EditableField
                                                value={edu.degree}
                                                onChange={(v) => actions?.updateItem("education", edu.id, "degree", v)}
                                                isEditing={isEditing}
                                                placeholder="Degree"
                                            />
                                        </h4>
                                        <p className="text-[10px] text-slate-600">
                                            <EditableField
                                                value={edu.school}
                                                onChange={(v) => actions?.updateItem("education", edu.id, "school", v)}
                                                isEditing={isEditing}
                                                placeholder="School"
                                            />
                                        </p>
                                        {(edu.year || isEditing) && (
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                <EditableField
                                                    value={edu.year || ""}
                                                    onChange={(v) => actions?.updateItem("education", edu.id, "year", v)}
                                                    isEditing={isEditing}
                                                    placeholder="Year"
                                                />
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills */}
                        {(data.skills || isEditing) && (
                            <section className="break-inside-avoid">
                                <h3 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">SKILLS</h3>
                                {isEditing ? (
                                    <textarea
                                        value={data.skills}
                                        onChange={(e) => actions?.updateField("skills", e.target.value)}
                                        className="w-full bg-transparent border border-slate-200 p-2 focus:ring-1 focus:ring-blue-300 min-h-[50px] text-[10px] resize-none rounded"
                                        placeholder="List your skills..."
                                    />
                                ) : (
                                    <div className="text-[10px] leading-snug text-slate-700 whitespace-pre-wrap">
                                        {data.skills}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Projects */}
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
                                            <EditableField
                                                value={proj.name}
                                                onChange={(v) => actions?.updateItem("projects", proj.id, "name", v)}
                                                isEditing={isEditing}
                                                placeholder="Project Name"
                                            />
                                        </h4>
                                        <p className="text-[10px] leading-snug text-slate-700 mt-0.5">
                                            <EditableField
                                                value={proj.description}
                                                onChange={(v) => actions?.updateItem("projects", proj.id, "description", v)}
                                                isEditing={isEditing}
                                                multiline
                                                placeholder="Project description..."
                                            />
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Certifications */}
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
                                                <EditableField
                                                    value={cert.title}
                                                    onChange={(v) => actions?.updateItem("certifications", cert.id, "title", v)}
                                                    isEditing={isEditing}
                                                    placeholder="Certification"
                                                    className="inline"
                                                />
                                            </span>
                                            {(cert.issuer || isEditing) && (
                                                <span className="text-slate-600">
                                                    {" • "}
                                                    <EditableField
                                                        value={cert.issuer || ""}
                                                        onChange={(v) => actions?.updateItem("certifications", cert.id, "issuer", v)}
                                                        isEditing={isEditing}
                                                        placeholder="Issuer"
                                                        className="inline"
                                                    />
                                                </span>
                                            )}
                                            {(cert.date || isEditing) && (
                                                <span className="text-slate-500">
                                                    {" • "}
                                                    <EditableField
                                                        value={cert.date || ""}
                                                        onChange={(v) => actions?.updateItem("certifications", cert.id, "date", v)}
                                                        isEditing={isEditing}
                                                        placeholder="Date"
                                                        className="inline"
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Achievements */}
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
                                                <EditableField
                                                    value={ach.title}
                                                    onChange={(v) => actions?.updateItem("achievements", ach.id, "title", v)}
                                                    isEditing={isEditing}
                                                    placeholder="Achievement"
                                                    className="inline"
                                                />
                                            </span>
                                            {(ach.issuer || isEditing) && (
                                                <span className="text-slate-600">
                                                    {" • "}
                                                    <EditableField
                                                        value={ach.issuer || ""}
                                                        onChange={(v) => actions?.updateItem("achievements", ach.id, "issuer", v)}
                                                        isEditing={isEditing}
                                                        placeholder="Organization"
                                                        className="inline"
                                                    />
                                                </span>
                                            )}
                                            {(ach.date || isEditing) && (
                                                <span className="text-slate-500">
                                                    {" • "}
                                                    <EditableField
                                                        value={ach.date || ""}
                                                        onChange={(v) => actions?.updateItem("achievements", ach.id, "date", v)}
                                                        isEditing={isEditing}
                                                        placeholder="Date"
                                                        className="inline"
                                                    />
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
