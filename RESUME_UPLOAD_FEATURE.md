# Resume Upload & Parsing Feature

## Overview
This feature allows users to upload their existing resume (PDF, DOCX, or TXT) along with a job description. The system automatically extracts structured data from the resume to pre-fill the resume builder, then combines it with AI-driven JD analysis to create an optimized resume.

## User Flow

### Step 1: Job Description & Resume Upload
1. **Upload Resume** (Optional but recommended)
   - Users can drag & drop or click to browse their resume file
   - Supported formats: PDF, DOCX, DOC, TXT (max 5MB)
   - System validates file type and size
   - Automatic data extraction begins

2. **Paste Job Description** (Optional)
   - Users paste the target job description
   - AI analyzes keywords and requirements
   - System prepares to tailor the resume

3. **Validation**
   - Users can proceed if they either:
     - Upload a resume, OR
     - Provide a job description (min 10 characters), OR
     - Both

### Step 2: Profile & Data Validation
1. **Auto-filled Data Review**
   - Blue banner appears if data was extracted from resume
   - Users see which fields were auto-populated
   - All sections are editable and can be refined

2. **Manual Editing**
   - Add missing information
   - Update existing data
   - Reorganize sections
   - Choose templates

3. **Validation Before Analysis**
   - Required: Full Name, Email
   - Recommended: Summary, Experience, Skills
   - Error messages show if required fields missing

### Step 3: Analysis
- AI analyzes the combination of:
  - Uploaded resume data
  - Job description requirements
  - Selected template style
- Provides optimization suggestions

### Step 4: Preview & Download
- Final resume preview
- Export options

## Technical Implementation

### Components Modified

#### 1. `Step1JD.tsx`
**New Features:**
- File upload with drag & drop support
- File type and size validation
- Integration with resume parser utility
- Extraction quality scoring
- User feedback for low-quality extractions

**Key Functions:**
```typescript
- validateFile(): Validates file type and size
- handleFileSelect(): Coordinates file processing
- Uses parseResumeFile() from utility
- Validates extraction quality
```

#### 2. `ResumeBuilder.tsx`
**New Features:**
- State management for uploaded resume data
- Merges extracted data with form data
- Passes upload handler to Step1

**Key Functions:**
```typescript
- handleResumeUpload(): Stores uploaded resume data
- handleNext(): Merges parsed data before moving to Step2
```

#### 3. `Step2Profile.tsx`
**New Features:**
- Validation banner when data is auto-filled
- Enhanced personal form with extraction indicator

### New Utility: `resumeParser.ts`

#### Purpose
Centralized resume parsing logic with extensible architecture.

#### Current Capabilities
- **TXT Files**: Fully supported with regex-based extraction
- **PDF Files**: Infrastructure ready (requires `pdfjs-dist`)
- **DOCX Files**: Infrastructure ready (requires `mammoth`)

#### Extraction Features
- Personal Information:
  - Full name
  - Email
  - Phone number
  - LinkedIn profile
  - GitHub profile
  - Website/portfolio
  - Location

- Professional Data (basic):
  - Summary/objective
  - Skills list
  - Experience (structure ready)
  - Education (structure ready)
  - Projects (structure ready)

#### Quality Validation
- Scores extraction from 0-100
- Weighted scoring system:
  - Name: 20 points
  - Email: 20 points
  - Summary: 15 points
  - Phone: 10 points
  - Skills: 10 points
  - Other fields: 5 points each

### Data Flow

```
User Upload Resume
     ↓
File Validation
     ↓
Parse File (resumeParser.ts)
     ↓
Extract Structured Data
     ↓
Quality Validation
     ↓
Store in State (ResumeBuilder)
     ↓
Display in Step2 (Personal Form)
     ↓
User Validates/Edits
     ↓
Proceed with optimized data
```

## Installation & Setup

### Current Setup (TXT only)
No additional dependencies needed. Works out of the box.

### Full PDF/DOCX Support

To enable PDF parsing:
```bash
npm install pdfjs-dist
```

To enable DOCX parsing:
```bash
npm install mammoth
```

After installation, the parser will automatically use these libraries.

## Usage Examples

### Example 1: Upload TXT Resume
```
1. User uploads resume.txt
2. Parser extracts:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "+1-234-567-8900"
   - LinkedIn: "linkedin.com/in/johndoe"
3. Extraction score: 75/100
4. Data pre-fills Step2 form
5. User validates and continues
```

### Example 2: Upload PDF Resume (with library)
```
1. User uploads resume.pdf
2. Parser uses pdfjs-dist to extract text
3. Applies same extraction logic
4. Quality score calculated
5. Pre-fills form in Step2
```

### Example 3: Low Quality Extraction
```
1. User uploads poorly formatted resume
2. Parser extracts partial data:
   - Only email found
3. Extraction score: 20/100
4. Warning shown: "Low quality extraction"
5. User manually fills missing fields
```

## Error Handling

### File Validation Errors
- **Invalid file type**: "Invalid file type. Please upload PDF, DOCX, or TXT files."
- **File too large**: "File size exceeds 5MB limit."

### Parsing Errors
- **Missing library**: Informative error with installation instructions
- **Corrupted file**: Generic error with retry option
- **Low quality**: Warning but allows continuation

## Future Enhancements

### Short Term
1. **AI-Powered Extraction**
   - Use OpenAI/Claude API for better parsing
   - Extract experience details accurately
   - Identify section boundaries

2. **Template Matching**
   - Detect resume template format
   - Preserve formatting preferences
   - Auto-select matching template

### Medium Term
1. **Multi-Resume Merge**
   - Upload multiple versions
   - Combine best parts from each
   - Generate optimal resume

2. **JD Matching Score**
   - Analyze resume vs JD compatibility
   - Suggest missing keywords
   - Highlight gaps

3. **Experience Parser**
   - Extract bullet points
   - Categorize accomplishments
   - Quantify achievements

### Long Term
1. **AI Resume Rewriter**
   - Complete content optimization
   - Industry-specific language
   - ATS optimization

2. **Visual Upload**
   - Screenshot-based upload
   - OCR for scanned resumes
   - Image resume extraction

## Testing Strategy

### Unit Tests
- File validation logic
- Regex extraction patterns
- Quality scoring algorithm

### Integration Tests
- Full upload flow
- Data merging logic
- Error handling paths

### E2E Tests
- Upload → Extract → Validate → Edit → Export

## Performance Considerations

### Current Performance
- TXT parsing: < 100ms
- File size limit: 5MB
- No backend required

### Optimization Opportunities
1. Web Worker for parsing (prevent UI blocking)
2. Lazy load PDF/DOCX libraries
3. Cache parsed results
4. Incremental parsing for large files

## Security Considerations

1. **File Validation**
   - Type checking by extension AND MIME type
   - Size limits enforced
   - No executable files accepted

2. **Client-Side Only**
   - All parsing happens in browser
   - No file upload to server
   - Privacy preserved

3. **Sanitization**
   - Extracted text sanitized
   - No script execution from resume content
   - Safe rendering in forms

## Accessibility

1. **Keyboard Navigation**
   - File input accessible via keyboard
   - Drag & drop has click alternative
   - Form fields properly labeled

2. **Screen Readers**
   - Upload area has descriptive aria-labels
   - Status messages announced
   - Error messages accessible

3. **Visual Indicators**
   - Loading states with spinner
   - Success/error color coding
   - Clear extraction status

## Browser Compatibility

- **Modern Browsers**: Full support
- **IE11**: Not supported (uses modern JS features)
- **Mobile**: Works with file picker
- **Tablet**: Drag & drop may vary

## Troubleshooting

### Common Issues

**Q: PDF upload shows "requires library" error**
A: Install pdfjs-dist: `npm install pdfjs-dist`

**Q: Extraction quality is low**
A: Use TXT format or ensure resume has clear text (not images)

**Q: Some data not extracted**
A: Manually add in Step2 – parser is rule-based

**Q: File upload fails silently**
A: Check file size (max 5MB) and type (PDF/DOCX/TXT only)

## API Reference

### `parseResumeFile(file: File)`
Main parsing function that detects file type and extracts data.

**Parameters:**
- `file`: File object from input

**Returns:**
```typescript
Promise<{
  rawText: string;
  parsedData: ParsedResumeData;
}>
```

### `validateExtractedData(data: ParsedResumeData)`
Calculates quality score of extracted data.

**Parameters:**
- `data`: Parsed resume data object

**Returns:**
- `number`: Score from 0-100

### `extractResumeData(text: string)`
Extracts structured data from plain text.

**Parameters:**
- `text`: Resume text content

**Returns:**
- `ParsedResumeData`: Structured resume data

## Conclusion

This feature significantly improves the user experience by:
1. Reducing manual data entry
2. Preserving existing resume content
3. Enabling JD-based optimization
4. Providing validation and feedback
5. Maintaining user privacy (client-side only)

The modular architecture allows for easy enhancements and integration of AI/NLP services in the future.
