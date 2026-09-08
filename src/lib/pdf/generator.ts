import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import { ResumeData } from '@/app/types';
import { PAGE } from './constants';
import {
    renderHeader,
    renderSummary,
    renderSkills
} from './sections/basic';
import {
    renderExperience,
    renderProjects,
    renderEducation,
    renderCertifications,
    renderAchievements
} from './sections/content';

/**
 * Main Resume PDF Generator
 * 
 * Generates a professional, ATS-optimized PDF resume from ResumeData.
 * Features:
 * - Auto page-break logic
 * - Professional typography
 * - Single-column layout (ATS safe)
 * - Smart content overflow handling
 * - Max 2 pages (strict)
 */
export function generateResumePDF(
    resumeData: ResumeData,
    options: {
        download?: boolean;
        fileName?: string;
        openInNewTab?: boolean;
    } = {}
): Promise<Blob> {
    const {
        download = true,
        fileName = `${resumeData.personalInfo.fullName}_Resume.pdf`,
        openInNewTab = false,
    } = options;

    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new PDFDocument({
                size: PAGE.size,
                margins: PAGE.margin,
                bufferPages: true, // Allow page count tracking
                info: {
                    Title: `${resumeData.personalInfo.fullName} - Resume`,
                    Author: resumeData.personalInfo.fullName,
                    Subject: 'Professional Resume',
                    Keywords: 'resume, cv, professional',
                    Creator: 'Resume Builder Pro',
                    Producer: 'PDFKit',
                },
            });

            // Create blob stream
            const stream = doc.pipe(blobStream());

            // === RENDER RESUME SECTIONS ===
            // Order matches Product Standard template

            // 1. Header (Name, Title, Contact)
            renderHeader(doc, resumeData);

            // 2. Professional Summary
            if (resumeData.summary) {
                renderSummary(doc, resumeData.summary);
            }

            // 3. Skills (Grouped)
            if (resumeData.skills) {
                renderSkills(doc, resumeData.skills);
            }

            // 4. Work Experience
            if (resumeData.experience && resumeData.experience.length > 0) {
                renderExperience(doc, resumeData.experience);
            }

            // 5. Projects (Max 3)
            if (resumeData.projects && resumeData.projects.length > 0) {
                renderProjects(doc, resumeData.projects);
            }

            // 6. Education
            if (resumeData.education && resumeData.education.length > 0) {
                renderEducation(doc, resumeData.education);
            }

            // 7. Optional: Certifications
            if (resumeData.certifications && resumeData.certifications.length > 0) {
                renderCertifications(doc, resumeData.certifications);
            }

            // 8. Optional: Achievements
            if (resumeData.achievements && resumeData.achievements.length > 0) {
                renderAchievements(doc, resumeData.achievements);
            }

            // Finalize PDF
            doc.end();

            // Handle blob when ready
            stream.on('finish', () => {
                const blob = stream.toBlob('application/pdf');
                const url = stream.toBlobURL('application/pdf');

                // Download file
                if (download) {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    link.click();
                }

                // Open in new tab
                if (openInNewTab) {
                    window.open(url, '_blank');
                }

                resolve(blob);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Preview PDF in new tab (no download)
 */
export function previewResumePDF(resumeData: ResumeData): Promise<Blob> {
    return generateResumePDF(resumeData, {
        download: false,
        openInNewTab: true,
    });
}

/**
 * Download PDF directly
 */
export function downloadResumePDF(
    resumeData: ResumeData,
    fileName?: string
): Promise<Blob> {
    return generateResumePDF(resumeData, {
        download: true,
        fileName,
        openInNewTab: false,
    });
}

/**
 * Get PDF as blob (for upload/storage)
 */
export function getResumePDFBlob(resumeData: ResumeData): Promise<Blob> {
    return generateResumePDF(resumeData, {
        download: false,
        openInNewTab: false,
    });
}
