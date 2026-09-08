import PDFDocument from 'pdfkit';
import { FONTS, COLORS, SPACING, CONTENT } from '../constants';
import { ensureSpace, handleBulletPageBreak, estimateTextHeight } from '../utils/pageBreaks';
import { renderSectionHeader } from './basic';
import { Experience, Project, Education, Certificate, Achievement } from '@/app/types';

/**
 * Renders work experience section
 */
export function renderExperience(doc: PDFKit.PDFDocument, experiences: Experience[]): void {
    if (!experiences || experiences.length === 0) return;

    renderSectionHeader(doc, 'Work Experience');

    experiences.forEach((exp, index) => {
        // Estimate height for this experience block
        const estimatedHeight = 80; // Minimum height for an experience entry
        ensureSpace(doc, estimatedHeight);

        // Company and Duration (same line)
        const startY = doc.y;

        // Company name (left)
        doc
            .font('Helvetica-Bold')
            .fontSize(FONTS.sizes.jobTitle)
            .fillColor(FONTS.colors.primary)
            .text(exp.company, doc.page.margins.left, doc.y, {
                width: CONTENT.width * 0.65,
                continued: false,
            });

        // Duration (right, same line)
        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.meta)
            .fillColor(FONTS.colors.secondary)
            .text(
                exp.duration,
                doc.page.width - doc.page.margins.right - CONTENT.width * 0.3,
                startY,
                {
                    width: CONTENT.width * 0.3,
                    align: 'right',
                }
            );

        doc.moveDown(0.3);

        // Role
        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.body)
            .fillColor(FONTS.colors.secondary)
            .text(exp.role, {
                italic: true,
            });

        // Location (if provided)
        if (exp.location) {
            doc.moveDown(0.15);
            doc
                .fontSize(FONTS.sizes.meta)
                .fillColor(FONTS.colors.muted)
                .text(exp.location, {
                    italic: true,
                });
        }

        doc.moveDown(0.4);

        // Bullet points
        if (exp.description) {
            const bullets = exp.description.split('\n').filter(b => b.trim());
            bullets.forEach((bullet, bulletIndex) => {
                const bulletText = bullet.trim().replace(/^[•\-\*]\s*/, '');

                // Estimate bullet height
                const bulletHeight = estimateTextHeight(doc, bulletText, { width: CONTENT.width - 15 });
                handleBulletPageBreak(doc, bulletHeight, bulletIndex === bullets.length - 1);

                const bulletY = doc.y;

                // Bullet point
                doc
                    .font('Helvetica')
                    .fontSize(FONTS.sizes.body)
                    .fillColor(FONTS.colors.primary)
                    .text('•', doc.page.margins.left, bulletY, {
                        width: 10,
                    });

                // Bullet text
                doc
                    .font('Helvetica')
                    .fontSize(FONTS.sizes.body)
                    .fillColor(FONTS.colors.secondary)
                    .text(bulletText, doc.page.margins.left + 15, bulletY, {
                        width: CONTENT.width - 15,
                        lineGap: 2,
                    });

                if (bulletIndex < bullets.length - 1) {
                    doc.moveDown(0.3);
                }
            });
        }

        // Space after each experience
        if (index < experiences.length - 1) {
            doc.moveDown(0.8);
        }
    });

    doc.moveDown(1);
}

/**
 * Renders projects section
 */
export function renderProjects(doc: PDFKit.PDFDocument, projects: Project[]): void {
    if (!projects || projects.length === 0) return;

    renderSectionHeader(doc, 'Projects');

    // Limit to max 3 projects (ATS optimization)
    const displayProjects = projects.slice(0, 3);

    displayProjects.forEach((proj, index) => {
        const estimatedHeight = 60;
        ensureSpace(doc, estimatedHeight);

        // Project name
        doc
            .font('Helvetica-Bold')
            .fontSize(FONTS.sizes.jobTitle)
            .fillColor(FONTS.colors.primary)
            .text(proj.name);

        // Tech stack (if provided)
        if (proj.tech) {
            doc.moveDown(0.2);
            doc
                .font('Helvetica')
                .fontSize(FONTS.sizes.meta)
                .fillColor(FONTS.colors.secondary)
                .text(`Tech: ${proj.tech}`, {
                    italic: true,
                });
        }

        doc.moveDown(0.4);

        // Project description/bullets
        if (proj.description) {
            const bullets = proj.description.split('\n').filter(b => b.trim());
            bullets.forEach((bullet, bulletIndex) => {
                const bulletText = bullet.trim().replace(/^[•\-\*]\s*/, '');

                const bulletHeight = estimateTextHeight(doc, bulletText, { width: CONTENT.width - 15 });
                handleBulletPageBreak(doc, bulletHeight);

                const bulletY = doc.y;

                doc
                    .font('Helvetica')
                    .fontSize(FONTS.sizes.body)
                    .fillColor(FONTS.colors.primary)
                    .text('•', doc.page.margins.left, bulletY, { width: 10 });

                doc
                    .font('Helvetica')
                    .fontSize(FONTS.sizes.body)
                    .fillColor(FONTS.colors.secondary)
                    .text(bulletText, doc.page.margins.left + 15, bulletY, {
                        width: CONTENT.width - 15,
                        lineGap: 2,
                    });

                if (bulletIndex < bullets.length - 1) {
                    doc.moveDown(0.3);
                }
            });
        }

        // Project link (if provided)
        if (proj.link) {
            doc.moveDown(0.3);
            doc
                .font('Helvetica')
                .fontSize(FONTS.sizes.meta)
                .fillColor(FONTS.colors.link)
                .text('🔗 View Project', {
                    link: proj.link,
                    underline: true,
                });
        }

        if (index < displayProjects.length - 1) {
            doc.moveDown(0.8);
        }
    });

    doc.moveDown(1);
}

/**
 * Renders education section
 */
export function renderEducation(doc: PDFKit.PDFDocument, education: Education[]): void {
    if (!education || education.length === 0) return;

    renderSectionHeader(doc, 'Education');

    education.forEach((edu, index) => {
        ensureSpace(doc, 40);

        // Degree
        doc
            .font('Helvetica-Bold')
            .fontSize(FONTS.sizes.jobTitle)
            .fillColor(FONTS.colors.primary)
            .text(edu.degree);

        doc.moveDown(0.2);

        // School, Year, GPA (single line)
        const eduDetails: string[] = [];
        eduDetails.push(edu.school);
        if (edu.year) eduDetails.push(edu.year);
        if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);

        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.meta)
            .fillColor(FONTS.colors.secondary)
            .text(eduDetails.join(' | '));

        if (index < education.length - 1) {
            doc.moveDown(0.6);
        }
    });

    doc.moveDown(1);
}

/**
 * Renders certifications section
 */
export function renderCertifications(doc: PDFKit.PDFDocument, certifications: Certificate[]): void {
    if (!certifications || certifications.length === 0) return;

    renderSectionHeader(doc, 'Certifications');

    certifications.forEach((cert, index) => {
        ensureSpace(doc, 25);

        const certY = doc.y;

        // Title (left)
        doc
            .font('Helvetica-Bold')
            .fontSize(FONTS.sizes.meta)
            .fillColor(FONTS.colors.primary)
            .text(cert.title, doc.page.margins.left, certY, {
                width: CONTENT.width * 0.7,
            });

        // Date (right, if provided)
        if (cert.date) {
            doc
                .font('Helvetica')
                .fontSize(FONTS.sizes.small)
                .fillColor(FONTS.colors.muted)
                .text(
                    cert.date,
                    doc.page.width - doc.page.margins.right - CONTENT.width * 0.25,
                    certY,
                    {
                        width: CONTENT.width * 0.25,
                        align: 'right',
                    }
                );
        }

        doc.moveDown(0.2);

        // Issuer
        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.small)
            .fillColor(FONTS.colors.secondary)
            .text(cert.issuer);

        if (index < certifications.length - 1) {
            doc.moveDown(0.4);
        }
    });

    doc.moveDown(1);
}

/**
 * Renders achievements section
 */
export function renderAchievements(doc: PDFKit.PDFDocument, achievements: Achievement[]): void {
    if (!achievements || achievements.length === 0) return;

    renderSectionHeader(doc, 'Achievements');

    achievements.forEach((ach, index) => {
        ensureSpace(doc, 25);

        const achY = doc.y;

        // Title (left)
        doc
            .font('Helvetica-Bold')
            .fontSize(FONTS.sizes.meta)
            .fillColor(FONTS.colors.primary)
            .text(ach.title, doc.page.margins.left, achY, {
                width: CONTENT.width * 0.7,
            });

        // Date (right, if provided)
        if (ach.date) {
            doc
                .font('Helvetica')
                .fontSize(FONTS.sizes.small)
                .fillColor(FONTS.colors.muted)
                .text(
                    ach.date,
                    doc.page.width - doc.page.margins.right - CONTENT.width * 0.25,
                    achY,
                    {
                        width: CONTENT.width * 0.25,
                        align: 'right',
                    }
                );
        }

        doc.moveDown(0.2);

        // Issuer/Organization
        doc
            .font('Helvetica')
            .fontSize(FONTS.sizes.small)
            .fillColor(FONTS.colors.secondary)
            .text(ach.issuer);

        if (index < achievements.length - 1) {
            doc.moveDown(0.4);
        }
    });

    doc.moveDown(1);
}
