// Azure OpenAI Config
const getAzureConfig = () => {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

    if (!endpoint || !apiKey || !deployment) {
        console.warn("⚠️ [ResumeParser] Azure OpenAI credentials missing. AI parsing will be skipped.");
        return null;
    }

    return { endpoint, apiKey, deployment, apiVersion };
};

export interface ParsedResumeData {
    // Personal Information
    fullName?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    portfolio?: string;
    location?: string;
    title?: string;

    // Professional Data
    summary?: string;
    skills?: string[];
    experience?: Array<{
        role?: string;
        company?: string;
        duration?: string;
        location?: string;
        description?: string;
    }>;
    education?: Array<{
        school?: string;
        degree?: string;
        year?: string;
        location?: string;
        gpa?: string;
    }>;
    projects?: Array<{
        name?: string;
        description?: string;
        duration?: string;
        link?: string;
        technologies?: string[];
    }>;
    certifications?: Array<{
        title?: string;
        issuer?: string;
        date?: string;
        credentialId?: string;
        url?: string;
    }>;
    achievements?: Array<{
        title?: string;
        description?: string;
        date?: string;
    }>;
    awards?: Array<{
        title?: string;
        issuer?: string;
        date?: string;
        description?: string;
    }>;
}

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Validate and clean email address
 */
export const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleaned = email.trim().toLowerCase();
    return emailRegex.test(cleaned) ? cleaned : undefined;
};

/**
 * Validate and format phone number
 */
export const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined;
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it's a valid length (10-15 digits)
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
        return phone.trim(); // Return original format
    }
    return undefined;
};

// Validate LinkedIn URL
export const validateLinkedIn = (url: string): string | undefined => {
    if (!url || ['unknown', 'n/a', 'not provided'].includes(url.toLowerCase().trim())) return undefined;
    const cleaned = url.trim();

    // Check for various LinkedIn URL formats (allowing dots and dashes)
    const linkedInPatterns = [
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-\.]+\/?$/i,
        /^linkedin\.com\/in\/[\w\-\.]+\/?$/i,
        /^\/in\/[\w\-\.]+\/?$/i,
        /^[\w\-\.]+$/  // Just username
    ];

    for (const pattern of linkedInPatterns) {
        if (pattern.test(cleaned)) {
            // Normalize to full URL
            if (cleaned.startsWith('http')) {
                return cleaned;
            } else if (cleaned.startsWith('linkedin.com')) {
                return `https://${cleaned}`;
            } else if (cleaned.startsWith('/in/')) {
                return `https://linkedin.com${cleaned}`;
            } else {
                // Just username - assume it goes to /in/
                return `https://linkedin.com/in/${cleaned}`;
            }
        }
    }

    return undefined;
};

// Validate GitHub URL
export const validateGitHub = (url: string): string | undefined => {
    if (!url || ['unknown', 'n/a', 'not provided'].includes(url.toLowerCase().trim())) return undefined;
    const cleaned = url.trim();

    // Check for various GitHub URL formats (allowing dots just in case, though standard is alphanumeric + hyphens)
    const githubPatterns = [
        /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/?$/i,
        /^github\.com\/[\w\-\.]+\/?$/i,
        /^[\w\-\.]+$/  // Just username
    ];

    for (const pattern of githubPatterns) {
        if (pattern.test(cleaned)) {
            // Normalize to full URL
            if (cleaned.startsWith('http')) {
                return cleaned;
            } else if (cleaned.startsWith('github.com')) {
                return `https://${cleaned}`;
            } else {
                // Just username
                return `https://github.com/${cleaned}`;
            }
        }
    }

    return undefined;
};

/**
 * Helper to check if a value is a placeholder
 */
const isPlaceholder = (val: string): boolean => {
    if (!val) return true;
    const lower = val.toLowerCase().trim();
    return ['unknown', 'n/a', 'not provided', 'null', 'undefined', 'placeholder'].includes(lower);
};

/**
 * Validate portfolio/website URL
 */
export const validateWebsite = (url: string): string | undefined => {
    if (!url || isPlaceholder(url)) return undefined;
    const cleaned = url.trim();

    // Reject if it doesn't look like a domain (needs at least one dot)
    if (!cleaned.includes('.') && !cleaned.includes('localhost')) {
        return undefined;
    }

    try {
        // Try to parse as URL
        const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);

        // Extra check: hostname must have a dot (e.g. example.com)
        if (!urlObj.hostname.includes('.')) {
            return undefined;
        }

        return urlObj.href;
    } catch {
        // Not a valid URL
        return undefined;
    }
};

/**
 * Validate project link URL
 */
export const validateProjectLink = (url: string): string | undefined => {
    if (!url) return undefined;
    const cleaned = url.trim();

    // Accept various formats: full URLs, GitHub repos, etc.
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        try {
            new URL(cleaned);
            return cleaned;
        } catch {
            return undefined;
        }
    }

    // Try to parse as potential URL
    try {
        const urlObj = new URL(`https://${cleaned}`);
        return urlObj.href;
    } catch {
        return undefined;
    }
};

/**
 * Validate and clean experience entry
 */
export const validateExperience = (exp: any): boolean => {
    if (!exp || typeof exp !== 'object') return false;

    // Must have at least role and company
    if (!exp.role || typeof exp.role !== 'string' || exp.role.trim().length === 0) {
        return false;
    }
    if (!exp.company || typeof exp.company !== 'string' || exp.company.trim().length === 0) {
        return false;
    }

    return true;
};

/**
 * Validate and clean education entry
 */
export const validateEducation = (edu: any): boolean => {
    if (!edu || typeof edu !== 'object') return false;

    // Must have at least school and degree
    if (!edu.school || typeof edu.school !== 'string' || edu.school.trim().length === 0) {
        return false;
    }
    if (!edu.degree || typeof edu.degree !== 'string' || edu.degree.trim().length === 0) {
        return false;
    }

    return true;
};

/**
 * Validate and clean project entry
 */
export const validateProject = (project: any): boolean => {
    if (!project || typeof project !== 'object') return false;

    // Must have at least name
    if (!project.name || typeof project.name !== 'string' || project.name.trim().length === 0) {
        return false;
    }

    // Validate link if present
    if (project.link) {
        // If the link is just a label like "Github" or "Link", it's not useful
        // We only want actual URLs.
        const validated = validateProjectLink(project.link);
        if (validated) {
            project.link = validated;
        } else {
            // Invalid link (e.g. just text "Source Code"), remove it
            delete project.link;
        }
    }

    return true;
};

/**
 * Validate certification entry
 */
export const validateCertification = (cert: any): boolean => {
    if (!cert || typeof cert !== 'object') return false;

    // Must have at least title
    if (!cert.title || typeof cert.title !== 'string' || cert.title.trim().length === 0) {
        return false;
    }

    // Validate URL if present
    if (cert.url) {
        cert.url = validateWebsite(cert.url);
    }

    return true;
};

/**
 * Validate achievement entry
 */
export const validateAchievement = (achievement: any): boolean => {
    if (!achievement || typeof achievement !== 'object') return false;

    // Must have at least title
    if (!achievement.title || typeof achievement.title !== 'string' || achievement.title.trim().length === 0) {
        return false;
    }

    return true;
};

/**
 * Validate award entry
 */
export const validateAward = (award: any): boolean => {
    if (!award || typeof award !== 'object') return false;

    // Must have at least title
    if (!award.title || typeof award.title !== 'string' || award.title.trim().length === 0) {
        return false;
    }

    return true;
};

/**
 * Extract and validate email from text
 */
export const extractEmail = (text: string): string | undefined => {
    const emailRegex = /[\w._%+-]+@[\w.-]+\.\w{2,}/g;
    const matches = text.match(emailRegex);

    if (matches && matches.length > 0) {
        // Validate and return the first valid email
        for (const match of matches) {
            const validated = validateEmail(match);
            if (validated) return validated;
        }
    }

    return undefined;
};

/**
 * Extract and validate phone from text
 */
export const extractPhone = (text: string): string | undefined => {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = text.match(phoneRegex);

    if (matches && matches.length > 0) {
        // Validate and return the first valid phone
        for (const match of matches) {
            const validated = validatePhone(match);
            if (validated) return validated;
        }
    }

    return undefined;
};

/**
 * Extract LinkedIn URL from text
 */
export const extractLinkedIn = (text: string): string | undefined => {
    // Strategy 1: Look for standard LinkedIn URLs (loose match)
    // Matches linkedin.com/in/username (allowing dots, dashes)
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-\.]+\/?/gi;
    const urlMatch = text.match(urlRegex);

    if (urlMatch && urlMatch[0]) {
        return validateLinkedIn(urlMatch[0]);
    }

    // Strategy 2: Look for "LinkedIn: username" pattern
    // Matches "LinkedIn: /in/username" or "LinkedIn: username"
    const labelRegex = /LinkedIn\s*:?\s*(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com)?(?:\/in\/)?([\w\-\.]+)/i;
    const labelMatch = text.match(labelRegex);

    if (labelMatch && labelMatch[1]) {
        // Construct standard URL from extracted username
        return validateLinkedIn(`https://linkedin.com/in/${labelMatch[1]}`);
    }

    return undefined;
};

/**
 * Extract GitHub URL from text
 */
export const extractGitHub = (text: string): string | undefined => {
    // Strategy 1: Look for standard GitHub URLs
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-\.]+\/?/gi;
    const urlMatch = text.match(urlRegex);

    if (urlMatch && urlMatch[0]) {
        return validateGitHub(urlMatch[0]);
    }

    // Strategy 2: Look for "GitHub: username" pattern
    const labelRegex = /GitHub\s*:?\s*(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w\-\.]+)/i;
    const labelMatch = text.match(labelRegex);

    if (labelMatch && labelMatch[1]) {
        return validateGitHub(`https://github.com/${labelMatch[1]}`);
    }

    return undefined;
};

/**
 * Extract portfolio/website URL from text
 */
export const extractWebsite = (text: string): string | undefined => {
    // Strategy 1: Look for labeled website/portfolio
    const labelRegex = /(?:Portfolio|Website|Link)\s*:?\s*((?:https?:\/\/)?(?:www\.)?[\w\-\.]+\.(?:com|net|org|io|dev|me|co|in|app)[\w\-\.\/?=&%]*)/i;
    const labelMatch = text.match(labelRegex);

    if (labelMatch && labelMatch[1]) {
        const validated = validateWebsite(labelMatch[1]);
        if (validated && !validated.includes('linkedin.com') && !validated.includes('github.com')) {
            return validated;
        }
    }

    // Strategy 2: Look for common portfolio patterns (fallback)
    const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w\-\.]+\.(?:com|net|org|io|dev|me|co|in|app)(?:\/[\w\-\.\/?=&%]*)?/gi;
    const matches = text.match(websiteRegex);

    if (matches && matches.length > 0) {
        // Filter out LinkedIn, GitHub, and email domains
        for (const match of matches) {
            if (!match.includes('linkedin.com') &&
                !match.includes('github.com') &&
                !match.includes('@') &&
                !match.endsWith('.')) { // Avoid trailing dots
                const validated = validateWebsite(match);
                if (validated) return validated;
            }
        }
    }

    return undefined;
};

/**
 * Parse Resume using Azure OpenAI
 */
export const parseWithAzure = async (text: string): Promise<ParsedResumeData | null> => {
    const config = getAzureConfig();
    if (!config) return null;

    try {
        console.log("🤖 [Azure AI] Starting AI Resume Parsing...");

        // Construct URL: {endpoint}/openai/deployments/{deployment}/chat/completions?api-version={version}
        const baseUrl = config.endpoint.replace(/\/+$/, ''); // remove trailing slash
        const url = `${baseUrl}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;

        const prompt = `
        You are an expert Resume Parser. Your job is to extract structured data from the provided resume text.
        
        Return ONLY a valid JSON object with the following structure. Do not include markdown formatting or backticks.
        
        {
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "linkedin": "url string",
            "github": "url string (profile URL)",
            "website": "url string",
            "portfolio": "url string",
            "location": "string",
            "title": "current job title string",
            "summary": "professional summary string",
            "skills": ["string array of skills"],
            "experience": [
                {
                    "role": "string",
                    "company": "string",
                    "duration": "string",
                    "location": "string",
                    "description": "string"
                }
            ],
            "education": [
                {
                    "school": "string",
                    "degree": "string",
                    "year": "string",
                    "location": "string",
                    "gpa": "string"
                }
            ],
            "projects": [
                {
                    "name": "string",
                    "description": "string",
                    "duration": "string",
                    "link": "string (GitHub repo, demo, or project URL)",
                    "technologies": ["string array of technologies/frameworks used"]
                }
            ],
            "certifications": [
                {
                    "title": "string",
                    "issuer": "string",
                    "date": "string",
                    "credentialId": "string",
                    "url": "string"
                }
            ],
             "achievements": [
                {
                    "title": "string",
                    "description": "string",
                    "date": "string"
                }
            ],
            "awards": [
                {
                    "title": "string",
                    "issuer": "string",
                    "date": "string",
                    "description": "string"
                }
            ]
        }

        CRITICAL INSTRUCTIONS FOR LINK EXTRACTION:
        1. The resume text contains a "--- EXTRACTED LINKS ---" section at the bottom with all clickable URLs from the PDF.
        2. MAP these URLs to the correct fields:
           - linkedin.com URLs → "linkedin" field
           - github.com/username (profile) → "github" field  
           - github.com/username/repo-name → project "link" field (match by project name if possible)
           - Other URLs (play.google.com, live demos, portfolio sites) → "website", "portfolio", or project "link"
        3. For PROJECTS: Look for GitHub repository URLs, Play Store links, or demo URLs in the EXTRACTED LINKS section. If a project mentions "Github", "Source Code", "Demo", or "Link", find the matching URL from EXTRACTED LINKS.
        4. Extract "technologies" for each project from the description or nearby text (e.g., "React, Node.js, MongoDB").
        5. All URLs must be fully qualified (https://...).
        6. NEVER set a field to placeholder text like "unknown" or "n/a" - leave it empty instead.

        RESUME TEXT:
        ${text.slice(0, 30000)}
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': config.apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a helpful assistant that extracts structured data from resumes." },
                    { role: "user", content: prompt }
                ],
                max_completion_tokens: 16000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Azure API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        console.log("🔍 [Azure AI] Raw Response:", JSON.stringify(data, null, 2)); // Debug log

        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error("❌ [Azure AI] Missing content in response:", data);
            throw new Error("No content received from Azure OpenAI");
        }

        // Clean up response if it contains markdown code blocks
        const jsonString = content.replace(/```json\n?|\n?```/g, "").trim();

        try {
            const rawData = JSON.parse(jsonString);

            // ===================================
            // STRICT VALIDATION & CLEANING
            // ===================================
            const parsedData: ParsedResumeData = {
                fullName: rawData.fullName,
                location: rawData.location,
                title: rawData.title,
                summary: rawData.summary,
                skills: Array.isArray(rawData.skills) ? rawData.skills : [],

                // Validate contact info
                email: validateEmail(rawData.email),
                phone: validatePhone(rawData.phone),
                linkedin: validateLinkedIn(rawData.linkedin),
                github: validateGitHub(rawData.github),
                website: validateWebsite(rawData.website),
                portfolio: validateWebsite(rawData.portfolio),

                // Validate Sections
                experience: Array.isArray(rawData.experience)
                    ? rawData.experience.filter(validateExperience)
                    : [],

                education: Array.isArray(rawData.education)
                    ? rawData.education.filter(validateEducation)
                    : [],

                projects: Array.isArray(rawData.projects)
                    ? rawData.projects.filter(validateProject)
                    : [],

                certifications: Array.isArray(rawData.certifications)
                    ? rawData.certifications.filter(validateCertification)
                    : [],

                achievements: Array.isArray(rawData.achievements)
                    ? rawData.achievements.filter(validateAchievement)
                    : [],

                awards: Array.isArray(rawData.awards)
                    ? rawData.awards.filter(validateAward)
                    : []
            };

            console.log("✅ [Azure AI] Parsing Validated!", parsedData);
            return parsedData;

        } catch (parseError) {
            console.error("💥 [Azure AI] JSON Parse Error:", parseError);
            return null;
        }

    } catch (error) {
        console.error("💥 [Azure AI] Parsing Failed:", error);
        return null; // Fallback to Regex
    }
};

/**
 * Tailor the resume data to match the Job Description (JD)
 */
/**
 * Parse raw resume text AND tailor it to the Job Description (JD) in one go.
 */
export const parseAndTailorResume = async (resumeText: string, jdText: string): Promise<ParsedResumeData | null> => {
    const config = getAzureConfig();
    if (!config) return null;

    try {
        console.log("✨ [Azure AI] Parsing & Tailoring Resume...");

        const baseUrl = config.endpoint.replace(/\/+$/, '');
        const url = `${baseUrl}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;

        const prompt = `
        You are an elite Resume Strategist and ATS Optimization Specialist. Your goal is to rewrite the candidate's resume so it matches the provided Job Description (JD) as closely as possible, without lying.

        TASK:
        1. Parse the "RESUME TEXT".
        2. Tailor every single section (Skills, Experience, Projects, Summary) to the "JOB DESCRIPTION".
        
        === AGGRESSIVE OPTIMIZATION STRATEGY ===
        
        1. **SKILLS (CRITICAL):**
           - **Action:** extract all technical and soft skills from the resume.
           - **Optimization:** Compare them against the JD.
           - **Ordering:** You MUST list the skills that appear in the JD **FIRST**.
           - **Missing Skills:** If the JD requires a skill (e.g., "JIRA") that is implied by the candidate's experience (e.g., "Project Management") but not explicitly listed, **ADD IT**.
        
        2. **EXPERIENCE (REWRITE REQUIRED):**
           - **Action:** Keep the same companies and dates, but **COMPLETELY REWRITE** the bullet points.
           - **Optimization:** 
             - Scan the JD for "Key Responsibilities" and "Requirements".
             - Match them to the candidate's experience.
             - **Rewrite** the candidate's bullet points to use the **EXACT KEYWORDS** and phrasing from the JD where truthful.
             - **Structure:** Start every bullet point with a strong power verb (e.g., "Architected", "Deployed", "Led").
             - **Focus:** If the JD wants "Cloud", emphasize cloud tasks. If it wants "Leadership", emphasize leadership tasks. Remove irrelevant details.
        
        3. **PROJECTS (ALIGNMENT):**
           - **Action:** Select projects that use the tech stack mentioned in the JD.
           - **Optimization:** Rewrite the project descriptions to highlight the specific technologies requested in the JD.
           - **Tech Stack:** Explicitly list the tech stack for each project, prioritizing tools found in the JD.
        
        4. **SUMMARY (THE PITCH):**
           - **Action:** Write a brand new 3-4 sentence professional summary.
           - **Optimization:** Incorporate the target Job Title. Explicitly state years of experience with the key technologies requested in the JD.
        
        === DATA EXTRACTION RULES ===
        - **Personal Info:** Extract accurately (Email, Phone, LinkedIn, GitHub, Portfolio).
        - **Links:** Map URLs from the "EXTRACTED LINKS" section to the correct fields.
        - **Truthfulness:** Do not invent roles or companies. Do not claim skills the candidate clearly does not have.
        
        === EXTRACTED LINKS SECTION INSTRUCTIONS ===
        - Look at the "--- EXTRACTED LINKS ---" section at the bottom of the resume text.
        - Map valid URLs to: 'linkedin', 'github', 'portfolio', 'website', or 'link' (for projects).
        
        RETURN JSON STRUCTURE:
        {
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "linkedin": "url string",
            "github": "url string",
            "website": "url string",
            "portfolio": "url string",
            "location": "string",
            "title": "Optimized Target Title",
            "summary": "Optimized summary string",
            "skills": ["Skill 1", "Skill 2", "Skill 3"],
            "experience": [
                {
                    "role": "string",
                    "company": "string",
                    "duration": "string",
                    "location": "string",
                    "description": "• Bullet point optimized for JD keyword 1\n• Bullet point optimized for JD keyword 2"
                }
            ],
            "education": [
                {
                    "school": "string",
                    "degree": "string",
                    "year": "string",
                    "location": "string",
                    "gpa": "string"
                }
            ],
            "projects": [
                {
                    "name": "string",
                    "description": "Optimized description highlighting JD tech",
                    "duration": "string",
                    "link": "url string",
                    "technologies": ["Tech 1", "Tech 2"]
                }
            ],
            "certifications": [
                { "title": "string", "issuer": "string", "date": "string", "url": "string" }
            ],
            "achievements": [
                { "title": "string", "description": "string", "date": "string" }
            ],
            "awards": [
                { "title": "string", "issuer": "string", "date": "string", "description": "string" }
            ]
        }

        IMPORTANT FORMATTING RULES:
        - **CLEAN OUTPUT:** Do NOT append "(JD Match)", "(Nice to Have)", "(Keyword)", or any other suffixes/prefixes to ANY field values in the JSON.
        - **NO LABELS:** Return ONLY the clean content (e.g., return "Java", not "Java (JD Match)"; return "Architected...", not "Architected... (Keywords: Agile)").
        - **SORTING:** You MUST still SORT the arrays (like skills and technologies) to put the JD-matching items first, but do not mark them with text labels.

        JOB DESCRIPTION:
        ${jdText.slice(0, 5000)}

        RESUME TEXT:
        ${resumeText.slice(0, 25000)}
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': config.apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a specialized assistant that extracts and optimizes resume data." },
                    { role: "user", content: prompt }
                ],
                max_completion_tokens: 16000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Azure API Error: ${response.status} - ${errText}`);
        }

        console.log("✅ [Azure AI] Response received");
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No content received for tailoring");

        const jsonString = content.replace(/```json\n?|\n?```/g, "").trim();
        const optimizedData = JSON.parse(jsonString);

        // Apply strict validation
        const validatedData: ParsedResumeData = {
            fullName: optimizedData.fullName,
            location: optimizedData.location,
            title: optimizedData.title,
            summary: optimizedData.summary,
            skills: Array.isArray(optimizedData.skills) ? optimizedData.skills : [],

            email: validateEmail(optimizedData.email),
            phone: validatePhone(optimizedData.phone),
            linkedin: validateLinkedIn(optimizedData.linkedin),
            github: validateGitHub(optimizedData.github),
            website: validateWebsite(optimizedData.website),
            portfolio: validateWebsite(optimizedData.portfolio),

            experience: Array.isArray(optimizedData.experience) ? optimizedData.experience.filter(validateExperience) : [],
            projects: Array.isArray(optimizedData.projects) ? optimizedData.projects.filter(validateProject) : [],
            education: Array.isArray(optimizedData.education) ? optimizedData.education.filter(validateEducation) : [],
            certifications: Array.isArray(optimizedData.certifications) ? optimizedData.certifications.filter(validateCertification) : [],
            achievements: Array.isArray(optimizedData.achievements) ? optimizedData.achievements.filter(validateAchievement) : [],
            awards: Array.isArray(optimizedData.awards) ? optimizedData.awards.filter(validateAward) : []
        };

        console.log("✅ [Azure AI] Resume Parsed & Tailored Successfully!", validatedData);
        return validatedData;

    } catch (error) {
        console.error("💥 [Azure AI] Parsing & Tailoring Failed:", error);
        return null;
    }
};

export const extractName = (text: string): string | undefined => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const excludeKeywords = /resume|curriculum|vitae|profile|contact|email|phone|address/i;
    for (const line of lines) {
        if (line.length >= 3 && line.length <= 50 && /^[A-Z]/.test(line) && line.split(/\s+/).length >= 2 && !excludeKeywords.test(line) && !line.includes('@')) {
            return line;
        }
    }
    return undefined;
};

export const extractSkills = (text: string): string[] | undefined => {
    const skillsSectionRegex = /(?:skills|technologies|technical skills|expertise)[\s:]*\n([^\n]+(?:\n[^\n]+)*)/i;
    const match = text.match(skillsSectionRegex);
    if (!match) return undefined;
    if (match && match[1]) {
        return match[1].split(/[,|\n•·]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 50);
    }
    return undefined;
};

export const extractSummary = (text: string): string | undefined => {
    const summaryRegex = /(?:summary|profile|about|objective|professional summary)[\s:]*\n([^\n]+(?:\n(?![A-Z][A-Z\s]+)[^\n]+)*)/i;
    const match = text.match(summaryRegex);
    return match ? match[1].trim() : undefined;
};

// Regex Fallback
export const extractResumeDataRegex = (text: string): ParsedResumeData => {
    return {
        fullName: extractName(text),
        email: extractEmail(text),
        phone: extractPhone(text),
        linkedin: extractLinkedIn(text),
        github: extractGitHub(text),
        website: extractWebsite(text),
        portfolio: extractWebsite(text),
        skills: extractSkills(text),
        summary: extractSummary(text),
    };
};

/**
 * Parse PDF file to extract text
 * @requires pdfjs-dist
 */
export const parsePDF = async (file: File): Promise<string> => {
    try {
        console.log('📄 [PDF Parser] Starting PDF parsing...');
        const pdfjsLib = await import('pdfjs-dist');

        // Use a reliable CDN for the worker - unpkg is more reliable than cdnjs
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const links: string[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);

            // Extract text content
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');

            // Extract hidden links (annotations)
            const annotations = await page.getAnnotations();
            annotations.forEach((annot: any) => {
                if (annot.subtype === 'Link' && annot.url) {
                    links.push(annot.url);
                }
            });

            fullText += pageText + '\n';
        }

        // Append extracted links to the text so regex extractors can find them
        if (links.length > 0) {
            fullText += "\n\n--- EXTRACTED LINKS ---\n" + links.join('\n');
        }

        console.log('✅ [PDF Parser] PDF parsing complete, total chars:', fullText.length);
        console.log('🔗 [PDF Parser] Extracted hidden links:', links.length);
        return fullText;
    } catch (error) {
        console.error('💥 [PDF Parser] Error:', error);
        throw new Error('Failed to parse PDF file.');
    }
};

export const parseTXT = async (file: File): Promise<string> => {
    return await file.text();
};

export const parseDOCX = async (file: File): Promise<string> => {
    console.warn("DOCX parsing is currently limited. Convert to PDF for best results.");
    return ""; // Placeholder
};

/**
 * Main parsing function
 */
export const parseResumeFile = async (file: File): Promise<{ rawText: string; parsedData: ParsedResumeData }> => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    let rawText = '';

    try {
        if (fileExtension === '.pdf') {
            rawText = await parsePDF(file);
        } else if (fileExtension === '.txt') {
            rawText = await parseTXT(file);
        } else {
            throw new Error('Unsupported format. Please use PDF or TXT.');
        }

        console.log("⚠️ [Parser] Skipping initial AI parsing. Using Regex fallback for speed.");
        const regexData = extractResumeDataRegex(rawText);
        return { rawText, parsedData: regexData };

    } catch (error: any) {
        console.error('💥 [Parser] Parsing error:', error);
        return {
            rawText: error.message || 'Failed to parse resume',
            parsedData: {}
        };
    }
};

export const validateExtractedData = (data: ParsedResumeData): number => {
    let score = 0;
    if (data.fullName) score += 20;
    if (data.email) score += 20;
    if (data.phone) score += 10;
    if (data.skills && data.skills.length > 0) score += 10;
    if (data.experience && data.experience.length > 0) score += 20;
    if (data.education && data.education.length > 0) score += 20;
    return score;
};
