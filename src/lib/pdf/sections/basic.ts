import PDFDocument from 'pdfkit';
import { FONTS, COLORS, SPACING } from '../constants';
import { ensureSpace } from '../utils/pageBreaks';
import { ResumeData } from '@/app/types';

/**
 * Renders the resume header (name, title, contact info)
 */
export function renderHeader(doc: PDFKit.PDFDocument, data: ResumeData): void {
    // Name
    doc
        .font('Helvetica-Bold')
        .fontSize(FONTS.sizes.name)
        .fillColor(FONTS.colors.primary)
        .text(data.personalInfo.fullName.toUpperCase(), {
            align: 'center',
        });

    doc.moveDown(0.3);

    // Title/Role
    if (data.personalInfo.title) {
        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.jobTitle)
            .fillColor(FONTS.colors.secondary)
            .text(data.personalInfo.title, {
                align: 'center',
            });
        doc.moveDown(0.4);
    }

    // Contact Info
    const contactParts: string[] = [];
    if (data.personalInfo.location) contactParts.push(data.personalInfo.location);
    if (data.personalInfo.phone) contactParts.push(data.personalInfo.phone);
    if (data.personalInfo.email) contactParts.push(data.personalInfo.email);

    if (contactParts.length > 0) {
        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.meta)
            .fillColor(FONTS.colors.secondary)
            .text(contactParts.join(' | '), {
                align: 'center',
            });
    }

    // Links (LinkedIn, GitHub, Portfolio)
    const linkParts: string[] = [];
    if (data.personalInfo.linkedin) linkParts.push('LinkedIn');
    if (data.personalInfo.github) linkParts.push('GitHub');
    if (data.personalInfo.website) linkParts.push('Portfolio');

    if (linkParts.length > 0) {
        doc
            .fontSize(FONTS.sizes.meta)
            .fillColor(FONTS.colors.link)
            .text(linkParts.join(' | '), {
                align: 'center',
            });
    }

    // Divider line
    doc.moveDown(0.6);
    doc
        .strokeColor(COLORS.divider)
        .lineWidth(1)
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();

    doc.moveDown(0.8);
}

/**
 * Renders section header (e.g., "PROFESSIONAL SUMMARY", "EXPERIENCE")
 */
export function renderSectionHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    options: { addDivider?: boolean } = {}
): void {
    const { addDivider = true } = options;

    ensureSpace(doc, 30); // Ensure section header doesn't get orphaned

    doc
        .font('Helvetica-Bold')
        .fontSize(FONTS.sizes.sectionTitle)
        .fillColor(FONTS.colors.primary)
        .text(title.toUpperCase());

    if (addDivider) {
        doc.moveDown(0.2);
        doc
            .strokeColor(COLORS.divider)
            .lineWidth(0.5)
            .moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .stroke();
    }

    doc.moveDown(0.5);
}

/**
 * Renders professional summary
 */
export function renderSummary(doc: PDFKit.PDFDocument, summary: string): void {
    if (!summary || !summary.trim()) return;

    renderSectionHeader(doc, 'Professional Summary');

    doc
        .font('Helvetica')
        .fontSize(FONTS.sizes.body)
        .fillColor(FONTS.colors.secondary)
        .text(summary, {
            align: 'justify',
            lineGap: 2,
        });

    doc.moveDown(1);
}

/**
 * Renders skills section (grouped format)
 */
export function renderSkills(doc: PDFKit.PDFDocument, skills: string): void {
    if (!skills || !skills.trim()) return;

    renderSectionHeader(doc, 'Skills');

    const skillLines = skills.split('\n').filter(line => line.trim());

    skillLines.forEach((line, index) => {
        ensureSpace(doc, 20);

        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.body)
            .fillColor(FONTS.colors.secondary)
            .text(line.trim(), {
                lineGap: 3,
            });

        if (index < skillLines.length - 1) {
            doc.moveDown(0.3);
        }
    });

    doc.moveDown(1);
}
