/**
 * Multi-Page Resume Template Wrapper
 * 
 * Handles automatic page breaks when content exceeds one page
 * Supports both A4 (595 × 842pt) and Letter (612 × 792pt) sizes
 */

import React from 'react';
import { ResumeData } from '@/app/types';

export type PageSize = 'a4' | 'letter';

interface MultiPageResumeProps {
    data: ResumeData;
    Template: React.ComponentType<{ data: ResumeData }>;
    pageSize?: PageSize;
}

// Page dimensions in CSS units
const PAGE_DIMENSIONS = {
    a4: {
        width: '210mm',     // 8.27 inches
        height: '297mm',    // 11.69 inches
        widthPx: 794,       // at 96 DPI
        heightPx: 1123,     // at 96 DPI
    },
    letter: {
        width: '8.5in',
        height: '11in',
        widthPx: 816,       // at 96 DPI
        heightPx: 1056,     // at 96 DPI
    }
};

/**
 * Multi-Page Resume Wrapper
 * Automatically creates new pages when content overflows
 */
export const MultiPageResume: React.FC<MultiPageResumeProps> = ({
    data,
    Template,
    pageSize = 'a4'
}) => {
    const dimensions = PAGE_DIMENSIONS[pageSize];

    return (
        <div className="resume-document">
            {/* Single page wrapper - browser will handle pagination */}
            <div
                className="resume-page"
                style={{
                    width: dimensions.width,
                    minHeight: dimensions.height,
                    padding: '12mm', // Standard resume margins
                    backgroundColor: 'white',
                    pageBreakAfter: 'auto',
                    pageBreakInside: 'avoid',
                    orphans: 2,
                    widows: 2,
                }}
            >
                <Template data={data} />
            </div>

            {/* CSS for printing and page breaks */}
            <style jsx global>{`
        @media print {
          @page {
            size: ${pageSize === 'a4' ? 'A4' : 'Letter'};
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .resume-document {
            width: 100%;
            height: auto;
          }

          .resume-page {
            page-break-after: auto;
            page-break-inside: avoid;
            width: ${dimensions.width} !important;
            min-height: ${dimensions.height} !important;
            padding: 12mm !important;
            margin: 0;
            box-shadow: none !important;
          }

          /* Prevent page breaks inside important elements */
          section, .experience-item, .project-item, .education-item {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Allow page breaks between items */
          .experience-item + .experience-item,
          .project-item + .project-item,
          .education-item + .education-item {
            page-break-before: auto;
          }

          /* Keep section headers with content */
          h3,
          .section-header {
            page-break-after: avoid;
            break-after: avoid;
          }

          /* Orphans and widows control */
          p {
            orphans: 3;
            widows: 3;
          }
        }

        @media screen {
          .resume-page {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }

          /* Show page boundaries on screen */
          .resume-page::after {
            content: '';
            display: block;
            height: 1px;
            background: linear-gradient(to right, transparent, #d1d5db 50%, transparent);
            margin-top: 20px;
          }
        }
      `}</style>
        </div>
    );
};

/**
 * CSS-only page break utility classes
 * Add these to your template components for better page break control
 */
export const pageBreakClasses = {
    // Prevent breaks
    avoidBreak: 'break-inside-avoid page-break-inside-avoid',
    avoidBreakBefore: 'break-before-avoid page-break-before-avoid',
    avoidBreakAfter: 'break-after-avoid page-break-after-avoid',

    // Force breaks
    forceBreakBefore: 'break-before-page page-break-before-always',
    forceBreakAfter: 'break-after-page page-break-after-always',

    // Auto breaks
    autoBreak: 'break-inside-auto page-break-inside-auto',
};

/**
 * Hook to detect content overflow and suggest page breaks
 */
export const usePageOverflow = (contentRef: React.RefObject<HTMLDivElement>, pageSize: PageSize = 'a4') => {
    const [pageCount, setPageCount] = React.useState(1);
    const dimensions = PAGE_DIMENSIONS[pageSize];

    React.useEffect(() => {
        if (!contentRef.current) return;

        const checkOverflow = () => {
            const contentHeight = contentRef.current!.scrollHeight;
            const pageHeight = dimensions.heightPx;
            const calculatedPages = Math.ceil(contentHeight / pageHeight);
            setPageCount(calculatedPages);
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [contentRef, dimensions.heightPx]);

    return { pageCount, isMultiPage: pageCount > 1 };
};
