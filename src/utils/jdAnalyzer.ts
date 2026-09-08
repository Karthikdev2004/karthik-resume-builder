/**
 * Job Description Analyzer Utility
 * 
 * This utility provides functions to analyze job descriptions and extract
 * key requirements, skills, and keywords to optimize resumes.
 */

export interface JDAnalysisResult {
    // Extracted from JD
    jobTitle?: string;
    companyName?: string;
    location?: string;

    // Required qualifications
    requiredSkills: string[];
    preferredSkills: string[];

    // Experience requirements
    yearsOfExperience?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

    // Education requirements
    requiredEducation?: string;
    preferredEducation?: string;

    // Key responsibilities
    responsibilities: string[];

    // Keywords for ATS optimization
    keywords: string[];

    // Soft skills mentioned
    softSkills: string[];
}

/**
 * Extract job title from JD
 */
export const extractJobTitle = (text: string): string | undefined => {
    // Look for common patterns
    const patterns = [
        /(?:position|role|title|job)[:\s]+([^\n]+)/i,
        /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s*$/m, // Title-cased line
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1]?.trim();
    }

    return undefined;
};

/**
 * Extract company name from JD
 */
export const extractCompanyName = (text: string): string | undefined => {
    const companyPattern = /(?:at|@|company)[:\s]+([A-Z][^\n]+)/i;
    const match = text.match(companyPattern);
    return match ? match[1]?.trim() : undefined;
};

/**
 * Extract required skills from JD
 */
export const extractRequiredSkills = (text: string): string[] => {
    const skills: string[] = [];

    // Look for "required skills" section
    const requiredSection = /(?:required|must have|essential)[^\n]*(?:skills|qualifications|requirements)[:\s]*\n([^]+?)(?=\n(?:preferred|nice to have|optional|responsibilities|duties)|$)/i;
    const match = text.match(requiredSection);

    if (match) {
        const skillsText = match[1];
        // Extract bullet points and lines
        const lines = skillsText.split('\n');
        lines.forEach(line => {
            const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
            if (cleaned.length > 2 && cleaned.length < 100) {
                skills.push(cleaned);
            }
        });
    }

    return skills;
};

/**
 * Extract preferred/optional skills from JD
 */
export const extractPreferredSkills = (text: string): string[] => {
    const skills: string[] = [];

    // Look for "preferred skills" section
    const preferredSection = /(?:preferred|nice to have|optional|bonus)[^\n]*(?:skills|qualifications|requirements)[:\s]*\n([^]+?)(?=\n(?:responsibilities|duties|required)|$)/i;
    const match = text.match(preferredSection);

    if (match) {
        const skillsText = match[1];
        const lines = skillsText.split('\n');
        lines.forEach(line => {
            const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
            if (cleaned.length > 2 && cleaned.length < 100) {
                skills.push(cleaned);
            }
        });
    }

    return skills;
};

/**
 * Extract years of experience requirement
 */
export const extractExperienceRequirement = (text: string): string | undefined => {
    const experiencePattern = /(\d+\+?)\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i;
    const match = text.match(experiencePattern);
    return match ? match[1] + '+ years' : undefined;
};

/**
 * Extract experience level
 */
export const extractExperienceLevel = (text: string): JDAnalysisResult['experienceLevel'] => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('entry level') || lowerText.includes('junior')) return 'entry';
    if (lowerText.includes('senior') || lowerText.includes('sr.')) return 'senior';
    if (lowerText.includes('lead') || lowerText.includes('principal')) return 'lead';
    if (lowerText.includes('executive') || lowerText.includes('director') || lowerText.includes('vp')) return 'executive';

    return 'mid';
};

/**
 * Extract responsibilities from JD
 */
export const extractResponsibilities = (text: string): string[] => {
    const responsibilities: string[] = [];

    // Look for "responsibilities" section
    const respSection = /(?:responsibilities|duties|what you'll do|you will)[:\s]*\n([^]+?)(?=\n(?:qualifications|requirements|skills|education)|$)/i;
    const match = text.match(respSection);

    if (match) {
        const respText = match[1];
        const lines = respText.split('\n');
        lines.forEach(line => {
            const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
            if (cleaned.length > 10 && cleaned.length < 200) {
                responsibilities.push(cleaned);
            }
        });
    }

    return responsibilities;
};

/**
 * Extract keywords for ATS optimization
 */
export const extractKeywords = (text: string): string[] => {
    const keywords = new Set<string>();

    // Common technical keywords to look for
    const techKeywords = [
        'react', 'node', 'python', 'java', 'javascript', 'typescript',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd',
        'agile', 'scrum', 'git', 'api', 'rest', 'graphql',
        'sql', 'nosql', 'mongodb', 'postgresql', 'redis',
        'machine learning', 'ai', 'data science', 'analytics',
        'leadership', 'team management', 'communication'
    ];

    const lowerText = text.toLowerCase();
    techKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
            keywords.add(keyword);
        }
    });

    // Also extract capitalized words (likely to be important keywords)
    const capitalizedWords = text.match(/\b[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*\b/g) || [];
    capitalizedWords.forEach(word => {
        if (word.length > 3 && word.length < 30) {
            keywords.add(word);
        }
    });

    return Array.from(keywords);
};

/**
 * Extract soft skills from JD
 */
export const extractSoftSkills = (text: string): string[] => {
    const softSkills = new Set<string>();

    const commonSoftSkills = [
        'communication', 'leadership', 'teamwork', 'problem solving',
        'critical thinking', 'creativity', 'adaptability', 'time management',
        'collaboration', 'interpersonal', 'organizational', 'analytical'
    ];

    const lowerText = text.toLowerCase();
    commonSoftSkills.forEach(skill => {
        if (lowerText.includes(skill)) {
            softSkills.add(skill);
        }
    });

    return Array.from(softSkills);
};

/**
 * Main function to analyze job description
 */
export const analyzeJobDescription = (jdText: string): JDAnalysisResult => {
    if (!jdText || jdText.trim().length < 50) {
        // Return empty result for insufficient JD text
        return {
            requiredSkills: [],
            preferredSkills: [],
            responsibilities: [],
            keywords: [],
            softSkills: [],
        };
    }

    return {
        jobTitle: extractJobTitle(jdText),
        companyName: extractCompanyName(jdText),
        yearsOfExperience: extractExperienceRequirement(jdText),
        experienceLevel: extractExperienceLevel(jdText),
        requiredSkills: extractRequiredSkills(jdText),
        preferredSkills: extractPreferredSkills(jdText),
        responsibilities: extractResponsibilities(jdText),
        keywords: extractKeywords(jdText),
        softSkills: extractSoftSkills(jdText),
    };
};

/**
 * Compare resume skills with JD requirements
 * Returns matching skills and missing skills
 */
export const compareSkills = (
    resumeSkills: string,
    jdAnalysis: JDAnalysisResult
): {
    matchingSkills: string[];
    missingRequiredSkills: string[];
    missingPreferredSkills: string[];
    matchPercentage: number;
} => {
    const resumeSkillsLower = resumeSkills.toLowerCase();
    const allRequiredSkills = jdAnalysis.requiredSkills;
    const allPreferredSkills = jdAnalysis.preferredSkills;

    const matchingSkills: string[] = [];
    const missingRequiredSkills: string[] = [];
    const missingPreferredSkills: string[] = [];

    // Check required skills
    allRequiredSkills.forEach(skill => {
        if (resumeSkillsLower.includes(skill.toLowerCase())) {
            matchingSkills.push(skill);
        } else {
            missingRequiredSkills.push(skill);
        }
    });

    // Check preferred skills
    allPreferredSkills.forEach(skill => {
        if (resumeSkillsLower.includes(skill.toLowerCase())) {
            matchingSkills.push(skill);
        } else {
            missingPreferredSkills.push(skill);
        }
    });

    // Calculate match percentage
    const totalSkills = allRequiredSkills.length + allPreferredSkills.length;
    const matchPercentage = totalSkills > 0
        ? Math.round((matchingSkills.length / totalSkills) * 100)
        : 0;

    return {
        matchingSkills,
        missingRequiredSkills,
        missingPreferredSkills,
        matchPercentage,
    };
};

/**
 * Generate suggestions for resume improvement based on JD analysis
 */
export const generateResumeSuggestions = (
    resumeData: any,
    jdAnalysis: JDAnalysisResult
): string[] => {
    const suggestions: string[] = [];

    // Check if job title matches
    if (jdAnalysis.jobTitle && !resumeData.personalInfo?.title?.toLowerCase().includes(jdAnalysis.jobTitle.toLowerCase())) {
        suggestions.push(`Consider updating your title to align with the job: "${jdAnalysis.jobTitle}"`);
    }

    // Check skills
    const skillComparison = compareSkills(resumeData.skills || '', jdAnalysis);
    if (skillComparison.missingRequiredSkills.length > 0) {
        suggestions.push(`Add these required skills if you have them: ${skillComparison.missingRequiredSkills.slice(0, 3).join(', ')}`);
    }

    // Check experience
    if (jdAnalysis.responsibilities.length > 0 && (!resumeData.experience || resumeData.experience.length === 0)) {
        suggestions.push('Add work experience that demonstrates the key responsibilities mentioned in the JD');
    }

    // Check summary
    if (!resumeData.summary || resumeData.summary.length < 50) {
        suggestions.push('Add a professional summary that highlights your relevant experience for this role');
    }

    return suggestions;
};
