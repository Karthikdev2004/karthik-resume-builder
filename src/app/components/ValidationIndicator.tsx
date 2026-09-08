/**
 * Validation Indicator Component
 * Shows real-time validation feedback for resume fields
 */

import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { validateResumeData } from '@/lib/validation';
import { ResumeData } from '@/app/types';

interface ValidationIndicatorProps {
    data: ResumeData;
    compact?: boolean;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({ data, compact = false }) => {
    const validation = useMemo(() => validateResumeData(data), [data]);

    const errorCount = Object.keys(validation.errors).length;
    const warningCount = Object.keys(validation.warnings).length;

    if (validation.valid && warningCount === 0) {
        return (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Resume validation passed!</span>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {errorCount > 0 && (
                    <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errorCount} error{errorCount > 1 ? 's' : ''}
                    </span>
                )}
                {warningCount > 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {warningCount} warning{warningCount > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Errors */}
            {errorCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <h3 className="text-sm font-bold text-red-900">
                            Validation Errors ({errorCount})
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(validation.errors).map(([field, errors]) => (
                            <div key={field} className="text-sm">
                                <span className="font-semibold text-red-800 capitalize">
                                    {field.replace(/\[(\d+)\]/, ' #$1')}:
                                </span>
                                <ul className="list-disc list-inside ml-2 text-red-700">
                                    {(errors as string[]).map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warnings */}
            {warningCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="text-amber-600" size={20} />
                        <h3 className="text-sm font-bold text-amber-900">
                            Suggestions ({warningCount})
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(validation.warnings).map(([field, warnings]) => (
                            <div key={field} className="text-sm">
                                <span className="font-semibold text-amber-800 capitalize">
                                    {field.replace(/\[(\d+)\]/, ' #$1')}:
                                </span>
                                <ul className="list-disc list-inside ml-2 text-amber-700">
                                    {(warnings as string[]).map((warning, idx) => (
                                        <li key={idx}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Field-level validation indicator
 * Shows validation status for individual fields
 */
interface FieldValidationProps {
    isValid: boolean;
    error?: string;
    showIcon?: boolean;
}

export const FieldValidationIcon: React.FC<FieldValidationProps> = ({
    isValid,
    error,
    showIcon = true
}) => {
    if (!showIcon) return null;

    return (
        <div className="inline-flex items-center gap-1 ml-2">
            {isValid ? (
                <CheckCircle2 className="text-green-600" size={14} />
            ) : (
                <div className="group/error relative">
                    <AlertCircle className="text-red-600" size={14} />
                    {error && (
                        <div className="absolute z-10 invisible group-hover/error:visible bg-red-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-1">
                            {error}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-900"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
