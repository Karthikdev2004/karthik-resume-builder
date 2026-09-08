// PDF Page Constants - A4 Size, ATS Optimized
export const PAGE = {
    size: 'A4' as const,
    width: 595.28, // 210mm in points (1mm = 2.83465 points)
    height: 841.89, // 297mm in points
    margin: {
        top: 68, // 24mm
        right: 68,
        bottom: 68,
        left: 68,
    },
};

// Calculate usable content area
export const CONTENT = {
    width: PAGE.width - PAGE.margin.left - PAGE.margin.right,
    height: PAGE.height - PAGE.margin.top - PAGE.margin.bottom,
    maxWidth: PAGE.width - PAGE.margin.left - PAGE.margin.right,
};

// Typography Constants (matching Product Standard template)
export const FONTS = {
    sizes: {
        name: 22,
        sectionTitle: 14,
        jobTitle: 11.5,
        body: 10.5,
        meta: 10,
        small: 9,
    },
    colors: {
        primary: '#111827',
        secondary: '#374151',
        muted: '#6B7280',
        link: '#2563EB',
    },
    lineHeight: {
        normal: 1.45,
        relaxed: 1.5,
    },
};

// Spacing Constants
export const SPACING = {
    section: 16, // Space between sections
    subsection: 10,
    paragraph: 8,
    line: 4,
    bullet: 6,
};

// Colors
export const COLORS = {
    black: '#000000',
    darkGray: '#111827',
    mediumGray: '#374151',
    lightGray: '#6B7280',
    divider: '#E5E7EB',
    link: '#2563EB',
};

// Feature Flags
export const FEATURES = {
    enablePageNumbers: false,
    enableWatermark: false,
    strictTwoPageLimit: true,
};
