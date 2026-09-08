import PDFDocument from 'pdfkit';
import { PAGE, CONTENT } from './constants';

/**
 * Ensures there's enough space on the current page for the content.
 * If not, adds a new page automatically.
 * 
 * CRITICAL: Call this BEFORE rendering any section or content block
 * to prevent content from being cut off across pages.
 */
export function ensureSpace(
    doc: PDFKit.PDFDocument,
    requiredHeight: number,
    options: {
        forceNewPage?: boolean;
        keepTogether?: boolean;
    } = {}
): void {
    const { forceNewPage = false, keepTogether = true } = options;

    const currentY = doc.y;
    const pageBottom = PAGE.height - PAGE.margin.bottom;
    const availableSpace = pageBottom - currentY;

    // Force new page if requested
    if (forceNewPage) {
        doc.addPage();
        return;
    }

    // Check if content fits on current page
    if (keepTogether && availableSpace < requiredHeight) {
        doc.addPage();
    }
}

/**
 * Checks if we're near the bottom of the page
 */
export function isNearPageBottom(
    doc: PDFKit.PDFDocument,
    threshold: number = 100
): boolean {
    const currentY = doc.y;
    const pageBottom = PAGE.height - PAGE.margin.bottom;
    return (pageBottom - currentY) < threshold;
}

/**
 * Gets remaining space on current page
 */
export function getRemainingSpace(doc: PDFKit.PDFDocument): number {
    const currentY = doc.y;
    const pageBottom = PAGE.height - PAGE.margin.bottom;
    return Math.max(0, pageBottom - currentY);
}

/**
 * Estimates height needed for text
 */
export function estimateTextHeight(
    doc: PDFKit.PDFDocument,
    text: string,
    options: {
        width?: number;
        lineGap?: number;
    } = {}
): number {
    const { width = CONTENT.width, lineGap = 0 } = options;

    // PDFKit's heightOfString method
    return doc.heightOfString(text, {
        width,
        lineGap,
    });
}

/**
 * Smart section break - adds page only if content won't fit
 */
export function smartSectionBreak(
    doc: PDFKit.PDFDocument,
    estimatedHeight: number,
    minSpaceRequired: number = 80
): void {
    const remaining = getRemainingSpace(doc);

    // If we have very little space, start new page
    if (remaining < minSpaceRequired) {
        doc.addPage();
    }
    // If content won't fit, start new page
    else if (remaining < estimatedHeight) {
        doc.addPage();
    }
}

/**
 * Prevents orphan lines (single line at bottom of page)
 */
export function preventOrphan(
    doc: PDFKit.PDFDocument,
    contentHeight: number,
    minLinesOnPage: number = 2
): void {
    const lineHeight = doc.currentLineHeight();
    const minHeight = lineHeight * minLinesOnPage;

    if (contentHeight < minHeight && isNearPageBottom(doc, minHeight)) {
        doc.addPage();
    }
}

/**
 * Handle bullet list page breaks intelligently
 */
export function handleBulletPageBreak(
    doc: PDFKit.PDFDocument,
    bulletHeight: number,
    isLastBullet: boolean = false
): void {
    const remaining = getRemainingSpace(doc);

    // Always keep at least 2 lines of a bullet together
    const minBulletHeight = doc.currentLineHeight() * 2;

    if (remaining < Math.min(bulletHeight, minBulletHeight)) {
        doc.addPage();
    }
}
