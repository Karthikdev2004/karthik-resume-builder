/**
 * Comprehensive validation utilities for resume data
 * Ensures all fields meet industry standards
 */

// ==================== Basic Field Validators ====================

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
    if (!email) return { valid: false, error: "Email is required" };

    const emailRegex = /^[a-zA-Z0-9][\w\.\-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: "Invalid email format" };
    }

    return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
    if (!phone) return { valid: false, error: "Phone number is required" };

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
        return { valid: false, error: "Phone number must have at least 10 digits" };
    }

    return { valid: true };
};

export const validateURL = (url: string, fieldName: string = "URL"): { valid: boolean; error?: string } => {
    if (!url) return { valid: true }; // Optional field

    try {
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { valid: false, error: `${fieldName} must use http or https protocol` };
        }
        return { valid: true };
    } catch {
        return { valid: false, error: `Invalid ${fieldName} format` };
    }
};

export const validateLinkedIn = (url: string): { valid: boolean; error?: string } => {
    if (!url) return { valid: true }; // Optional

    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9\-]+\/?$/;
    if (!linkedInRegex.test(url)) {
        return {
            valid: false,
            error: "LinkedIn URL must be in format: https://linkedin.com/in/username"
        };
    }

    return { valid: true };
};

export const validateGitHub = (url: string): { valid: boolean; error?: string } => {
    if (!url) return { valid: true }; // Optional

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-]+\/?$/;
    if (!githubRegex.test(url)) {
        return {
            valid: false,
            error: "GitHub URL must be in format: https://github.com/username"
        };
    }

    return { valid: true };
};

// ==================== Academic Field Validators ====================

export const validateGPA = (gpa?: string): { valid: boolean; error?: string } => {
    if (!gpa) return { valid: true }; // Optional

    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
        return { valid: false, error: "GPA must be between 0 and 10" };
    }

    return { valid: true };
};

export const validateYear = (year: string, fieldName: string = "Year"): { valid: boolean; error?: string } => {
    if (!year) return { valid: false, error: `${fieldName} is required` };

    const currentYear = new Date().getFullYear();
    const yearRegex = /^\d{4}$/;

    // Handle ranges like "2020-2024"
    if (year.includes('-')) {
        const [start, end] = year.split('-').map(y => y.trim());
        if (!yearRegex.test(start) || (!yearRegex.test(end) && end.toLowerCase() !== 'present')) {
            return { valid: false, error: `${fieldName} range must be in format: YYYY-YYYY or YYYY-Present` };
        }

        const startYear = parseInt(start);
        const endYear = end.toLowerCase() === 'present' ? currentYear : parseInt(end);

        if (startYear < 1950 || startYear > currentYear) {
            return { valid: false, error: "Start year must be between 1950 and current year" };
        }

        if (endYear < startYear) {
            return { valid: false, error: "End year must be after start year" };
        }

        return { valid: true };
    }

    // Single year
    if (!yearRegex.test(year)) {
        return { valid: false, error: `${fieldName} must be a 4-digit year` };
    }

    const yearNum = parseInt(year);
    if (yearNum < 1950 || yearNum > currentYear + 10) {
        return { valid: false, error: "Year must be between 1950 and 10 years in the future" };
    }

    return { valid: true };
};

// ==================== Complex Object Validators ====================

export const validateEducation = (education: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!education.school?.trim()) {
        errors.push("School/University name is required");
    }

    if (!education.degree?.trim()) {
        errors.push("Degree is required");
    }

    const yearValidation = validateYear(education.year, "Graduation year");
    if (!yearValidation.valid) {
        errors.push(yearValidation.error || "Invalid year");
    }

    const gpaValidation = validateGPA(education.gpa);
    if (!gpaValidation.valid) {
        errors.push(gpaValidation.error || "Invalid GPA");
    }

    return { valid: errors.length === 0, errors };
};

export const validateExperience = (experience: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!experience.company?.trim()) {
        errors.push("Company name is required");
    }

    if (!experience.role?.trim()) {
        errors.push("Role/Position is required");
    }

    if (!experience.duration?.trim()) {
        errors.push("Duration is required");
    } else {
        const durationValidation = validateYear(experience.duration, "Duration");
        if (!durationValidation.valid) {
            errors.push(durationValidation.error || "Invalid duration");
        }
    }

    if (!experience.description?.trim()) {
        errors.push("Description is required");
    } else if (experience.description.trim().length < 50) {
        errors.push("Description should be at least 50 characters");
    }

    return { valid: errors.length === 0, errors };
};

export const validateProject = (project: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!project.name?.trim()) {
        errors.push("Project name is required");
    }

    if (!project.description?.trim()) {
        errors.push("Project description is required");
    } else if (project.description.trim().length < 30) {
        errors.push("Project description should be at least 30 characters");
    }

    if (project.link) {
        const urlValidation = validateURL(project.link, "Project link");
        if (!urlValidation.valid) {
            errors.push(urlValidation.error || "Invalid project link");
        }
    }

    if (project.duration) {
        const durationValidation = validateYear(project.duration, "Project duration");
        if (!durationValidation.valid) {
            errors.push(durationValidation.error || "Invalid duration");
        }
    }

    return { valid: errors.length === 0, errors };
};

export const validateCertification = (cert: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!cert.title?.trim()) {
        errors.push("Certification title is required");
    }

    if (!cert.issuer?.trim()) {
        errors.push("Issuing organization is required");
    }

    if (!cert.date?.trim()) {
        errors.push("Issue date is required");
    } else {
        const dateValidation = validateYear(cert.date, "Issue date");
        if (!dateValidation.valid) {
            errors.push(dateValidation.error || "Invalid date");
        }
    }

    return { valid: errors.length === 0, errors };
};

export const validateAchievement = (achievement: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!achievement.title?.trim()) {
        errors.push("Achievement title is required");
    }

    if (!achievement.issuer?.trim()) {
        errors.push("Issuing organization is required");
    }

    if (!achievement.date?.trim()) {
        errors.push("Date is required");
    } else {
        const dateValidation = validateYear(achievement.date, "Achievement date");
        if (!dateValidation.valid) {
            errors.push(dateValidation.error || "Invalid date");
        }
    }

    return { valid: errors.length === 0, errors };
};

// ==================== Full Resume Validation ====================

export const validateResumeData = (data: any): {
    valid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
} => {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // Personal Info Validation
    const personalErrors: string[] = [];
    const emailVal = validateEmail(data.personalInfo?.email);
    if (!emailVal.valid) personalErrors.push(emailVal.error || "Invalid email");

    const phoneVal = validatePhone(data.personalInfo?.phone);
    if (!phoneVal.valid) personalErrors.push(phoneVal.error || "Invalid phone");

    const linkedInVal = validateLinkedIn(data.personalInfo?.linkedin);
    if (!linkedInVal.valid) personalErrors.push(linkedInVal.error || "Invalid LinkedIn");

    const githubVal = validateGitHub(data.personalInfo?.github);
    if (!githubVal.valid) personalErrors.push(githubVal.error || "Invalid GitHub");

    const websiteVal = validateURL(data.personalInfo?.website, "Website");
    if (!websiteVal.valid) personalErrors.push(websiteVal.error || "Invalid website");

    if (!data.personalInfo?.fullName?.trim()) {
        personalErrors.push("Full name is required");
    }

    if (personalErrors.length > 0) {
        errors.personalInfo = personalErrors;
    }

    // Summary Validation
    if (!data.summary?.trim()) {
        warnings.summary = ["Professional summary is recommended"];
    } else if (data.summary.trim().length < 100) {
        warnings.summary = ["Summary should be at least 100 characters for better impact"];
    }

    // Education Validation
    if (!data.education || data.education.length === 0) {
        errors.education = ["At least one education entry is required"];
    } else {
        data.education.forEach((edu: any, index: number) => {
            const validation = validateEducation(edu);
            if (!validation.valid) {
                errors[`education[${index}]`] = validation.errors;
            }
        });
    }

    // Experience Validation
    if (!data.experience || data.experience.length === 0) {
        warnings.experience = ["At least one experience entry is recommended"];
    } else {
        data.experience.forEach((exp: any, index: number) => {
            const validation = validateExperience(exp);
            if (!validation.valid) {
                errors[`experience[${index}]`] = validation.errors;
            }
        });
    }

    // Projects Validation
    if (data.projects && data.projects.length > 0) {
        data.projects.forEach((proj: any, index: number) => {
            const validation = validateProject(proj);
            if (!validation.valid) {
                errors[`projects[${index}]`] = validation.errors;
            }
        });
    }

    // Certifications Validation
    if (data.certifications && data.certifications.length > 0) {
        data.certifications.forEach((cert: any, index: number) => {
            const validation = validateCertification(cert);
            if (!validation.valid) {
                errors[`certifications[${index}]`] = validation.errors;
            }
        });
    }

    // Achievements Validation
    if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach((ach: any, index: number) => {
            const validation = validateAchievement(ach);
            if (!validation.valid) {
                errors[`achievements[${index}]`] = validation.errors;
            }
        });
    }

    // Skills Validation
    if (!data.skills?.trim()) {
        warnings.skills = ["Skills section is recommended"];
    } else if (data.skills.trim().split(',').length < 5) {
        warnings.skills = ["Consider adding more skills (at least 5 recommended)"];
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        warnings
    };
};

// ==================== Helper Functions ====================

export const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length === 10) {
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }

    if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
        return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
    }

    if (digitsOnly.length > 10) {
        return `+${digitsOnly.slice(0, digitsOnly.length - 10)} ${digitsOnly.slice(-10, -7)}-${digitsOnly.slice(-7, -4)}-${digitsOnly.slice(-4)}`;
    }

    return phone;
};

export const extractDomain = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
};
