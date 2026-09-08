import React, { useState } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "motion/react";
import { Trash2, GripVertical, Plus } from "lucide-react";

// Highlight Logic Component
export const HighlightText = ({ text, enabled }: { text: string; enabled: boolean }) => {
    if (!enabled) return <>{text}</>;

    const parts = text.split(/(\d+(?:[.,]\d+)?%?|\$\d+(?:[.,]\d+)?k?m?b?|\b(?:Led|Designed|Developed|Implemented|Created|Managed|Reduced|Increased|Automated|Optimized|Facilitated|Enriched|Integrated)\b)/g);

    return (
        <span>
            {parts.map((part, i) => {
                if (part.match(/\d+(?:[.,]\d+)?%?|\$\d+(?:[.,]\d+)?k?m?b?/)) {
                    return <span key={i} className="bg-green-200 px-0.5 rounded text-green-900 border-b-2 border-green-300" title="Impact Metric">{part}</span>;
                }
                if (part.match(/\b(?:Led|Designed|Developed|Implemented|Created|Managed|Reduced|Increased|Automated|Optimized|Facilitated|Enriched|Integrated)\b/)) {
                    return <span key={i} className="bg-pink-200 px-0.5 rounded text-pink-900 border-b-2 border-pink-300" title="Action Verb">{part}</span>;
                }
                if (part.match(/\b(?:React|Node|Java|Python|AWS|Azure|C#|\.NET|JavaScript|TypeScript|SQL|NoSQL|Docker|Kubernetes|CI\/CD)\b/i)) {
                    return <span key={i} className="bg-yellow-200 px-0.5 rounded text-yellow-900 border-b-2 border-yellow-300" title="Hard Skill">{part}</span>;
                }
                return part;
            })}
        </span>
    );
};

// Editable Field
interface EditableFieldProps {
    value: string;
    onChange: (value: string) => void;
    isEditing: boolean;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    multiline?: boolean;
    type?: "text" | "email" | "tel" | "url";
    required?: boolean;
    label?: string;
}

export function EditableField({
    value,
    onChange,
    isEditing,
    placeholder = "Click to edit",
    className = "",
    inputClassName = "",
    multiline = false,
    type = "text",
    required = false,
    label,
}: EditableFieldProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);

    if (!isEditing) {
        return (
            <span className={className}>
                {value || <span className="text-slate-400 italic">{placeholder}</span>}
            </span>
        );
    }

    const baseClasses = `
    bg-transparent border-0 border-b-2 transition-all duration-200
    focus:outline-none focus:ring-0 p-0 m-0
    ${isFocused ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:border-slate-300'}
    ${required && !value ? 'border-red-300' : ''}
    ${className}
    ${inputClassName}
  `;

    if (multiline) {
        return (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`${baseClasses} resize-none min-h-[1.5em] w-full`}
                rows={value.split('\n').length || 1}
                style={{ height: 'auto' }}
                aria-label={label}
            />
        );
    }

    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`${baseClasses} w-full`}
            aria-label={label}
        />
    );
}

// Sortable Item Wrapper - FIXED: Controls Inside + Always Visible (dim)
interface SortableItemProps<T> {
    value: T;
    onDelete: () => void;
    children: React.ReactNode;
    className?: string;
}

export function SortableItem<T>({ value, onDelete, children, className = "" }: SortableItemProps<T>) {
    const controls = useDragControls();

    return (
        <Reorder.Item value={value} dragListener={false} dragControls={controls} className={className}>
            <div className="relative pr-7 group/item">
                {children}
                <div className="absolute right-0 top-1 flex flex-col gap-1 opacity-40 group-hover/item:opacity-100 transition-opacity z-20">
                    <div
                        className="p-1 rounded bg-slate-100 text-slate-500 cursor-grab active:cursor-grabbing hover:bg-slate-200 hover:text-slate-800 shadow-sm border border-slate-200"
                        onPointerDown={(e) => controls.start(e)}
                        title="Drag to reorder"
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 rounded bg-white text-red-400 hover:bg-red-50 hover:text-red-600 border border-slate-200 shadow-sm transition-colors cursor-pointer"
                        title="Delete item"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </Reorder.Item>
    );
}

// Editable List - FIXED: Robust Delete + Smart Keys
interface EditableBulletListProps {
    items: string[];
    onChange: (items: string[]) => void;
    isEditing: boolean;
    showHighlights: boolean;
}

export function EditableBulletList({
    items,
    onChange,
    isEditing,
    showHighlights
}: EditableBulletListProps) {
    const addBullet = () => onChange([...items, '']);
    const updateBullet = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };
    const removeBullet = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    if (!isEditing) {
        return (
            <ul className="list-disc ml-4 space-y-0.5 marker:text-black">
                {items.filter(item => item.trim()).map((item, i) => (
                    <li key={i} className="pl-0.5 leading-snug">
                        <HighlightText text={item.trim().replace(/^[•-]\s*/, '')} enabled={showHighlights} />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="space-y-1.5">
            {items.map((item, i) => (
                <div
                    key={i}
                    className="flex items-start gap-2 group/bullet relative"
                >
                    <span className="text-slate-400 mt-1.5 flex-shrink-0 select-none">•</span>
                    <textarea
                        value={item}
                        onChange={(e) => updateBullet(i, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                // Insert new bullet after current
                                const newItems = [...items];
                                newItems.splice(i + 1, 0, '');
                                onChange(newItems);
                            }
                            if (e.key === 'Backspace' && item === '') {
                                e.preventDefault();
                                removeBullet(i);
                            }
                        }}
                        placeholder="Add a bullet point..."
                        className="flex-1 bg-transparent border-0 border-b border-transparent hover:border-slate-300 
                     focus:border-blue-500 focus:bg-blue-50/30 focus:outline-none transition-all
                     resize-none min-h-[1.5em] p-0.5 focus:ring-0 leading-relaxed overflow-hidden"
                        rows={1}
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => removeBullet(i)}
                        className="opacity-0 group-hover/bullet:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 flex-shrink-0 cursor-pointer"
                        title="Remove bullet"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={addBullet}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 
                 opacity-60 hover:opacity-100 transition-all ml-4 mt-1 font-medium"
            >
                <Plus className="w-3 h-3" /> Add bullet
            </button>
        </div>
    );
}

export const SectionHeader = ({ title, onAdd, isEditing }: { title: string; onAdd?: () => void; isEditing: boolean }) => (
    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-1">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h2>
        {isEditing && onAdd && (
            <button
                onClick={onAdd}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 
                   opacity-70 hover:opacity-100 transition-all font-medium py-0.5 px-2 hover:bg-blue-50 rounded"
            >
                <Plus className="w-3 h-3" /> Add
            </button>
        )}
    </div>
);

// --- New Helpers for Templates ---

import { MoveUp, MoveDown } from "lucide-react";

export const ActionButton = ({ onClick, icon: Icon, title, variant = "ghost", className = "" }: any) => (
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

export const SectionControls = ({ onMoveUp, onMoveDown, onDelete }: { onMoveUp?: () => void, onMoveDown?: () => void, onDelete?: () => void }) => (
    <div className="absolute -left-8 top-0 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col gap-1 bg-white shadow-sm border border-slate-200 rounded-md p-0.5 z-20 print:hidden">
        {onMoveUp && <ActionButton icon={MoveUp} onClick={onMoveUp} title="Move Up" />}
        {onMoveDown && <ActionButton icon={MoveDown} onClick={onMoveDown} title="Move Down" />}
        {onDelete && <ActionButton icon={Trash2} variant="danger" onClick={onDelete} title="Delete Item" />}
    </div>
);

export const EmptySectionPlaceholder = ({ title, onClick }: { title: string, onClick: () => void }) => (
    <div
        onClick={onClick}
        className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group print:hidden my-2"
    >
        <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-blue-600">
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Add {title}</span>
        </div>
    </div>
);
