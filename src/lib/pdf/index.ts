// Main exports for PDF generation
export {
    generateResumePDF,
    previewResumePDF,
    downloadResumePDF,
    getResumePDFBlob,
} from './generator';

export { PAGE, CONTENT, FONTS, COLORS, SPACING } from './constants';

export {
    ensureSpace,
    isNearPageBottom,
    getRemainingSpace,
    estimateTextHeight,
    smartSectionBreak,
} from './utils/pageBreaks';
