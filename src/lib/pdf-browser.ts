import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { ResumeData } from '@/app/types';

/**
 * Browser-compatible PDF generator using html-to-image + jsPDF
 * Captures the rendered DOM element for 100% visual fidelity
 * Uses html-to-image to avoid 'oklab' color issues
 */

export async function generateResumePDF(resumeData: ResumeData, filename?: string): Promise<void> {
    const element = document.getElementById('resume-preview');
    if (!element) {
        throw new Error('Resume preview element not found');
    }

    // Capture the element using html-to-image (more robust than html2canvas)
    const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // Higher resolution
    });

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Calculate dimensions
    const imgProps = pdf.getImageProperties(dataUrl);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // Helper to calculate scale factor between DOM pixels and PDF mm
    // element.offsetWidth is in pixels, imgWidth is 210mm
    const scaleFactor = imgWidth / element.offsetWidth;
    const containerRect = element.getBoundingClientRect();

    // Find all links
    const links = Array.from(element.querySelectorAll('a'));
    const linkAnnotations = links.map(link => {
        const rect = link.getBoundingClientRect();
        return {
            url: link.getAttribute('href') || '',
            x: (rect.left - containerRect.left) * scaleFactor,
            y: (rect.top - containerRect.top) * scaleFactor,
            w: rect.width * scaleFactor,
            h: rect.height * scaleFactor
        };
    }).filter(l => l.url); // Filter out empty links

    // Calculate total pages needed (with 1mm tolerance to avoid floating point issues)
    const tolerance = 1; // 1mm tolerance
    const totalPages = Math.ceil((imgHeight - tolerance) / pageHeight);

    console.log(`📄 PDF Generation: Content height=${imgHeight.toFixed(1)}mm, Page height=${pageHeight}mm, Total pages=${totalPages}`);

    // Generate each page
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) {
            pdf.addPage();
        }

        // Calculate Y position for this page's content
        // For page 0: y=0 (show from top)
        // For page 1: y=-297 (shift image up by one page height)
        // For page 2: y=-594 (shift image up by two page heights)
        const yOffset = -(pageIndex * pageHeight);

        pdf.addImage(dataUrl, 'PNG', 0, yOffset, imgWidth, imgHeight);

        // Add links for this page
        const pageTop = pageIndex * pageHeight;
        const pageBottom = (pageIndex + 1) * pageHeight;

        linkAnnotations.forEach(link => {
            // Check if link falls within this page's vertical range
            if (link.y >= pageTop && link.y < pageBottom) {
                // Adjust Y relative to this page (0 at top of this page)
                const relativeY = link.y - pageTop;
                pdf.link(link.x, relativeY, link.w, link.h, { url: link.url });
            }
        });
    }

    console.log(`✅ PDF generated with ${totalPages} page(s)`);

    const fileName = filename || `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    pdf.save(fileName);
}

// Export helper functions
export function downloadResumePDF(resumeData: ResumeData, fileName?: string): Promise<void> {
    return generateResumePDF(resumeData, fileName);
}

export function previewResumePDF(resumeData: ResumeData): Promise<void> {
    // For preview, we just trigger the download in this new WYSIWYG mode
    // or we could open a blob, but download is usually preferred for exact file check
    return generateResumePDF(resumeData, `Preview_${resumeData.personalInfo.fullName || 'Resume'}.pdf`);
}
