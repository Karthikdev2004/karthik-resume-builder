# Resume Upload & JD Analysis Debugging Guide

## 🔍 How to Test and Verify

### **Step 1: Open Browser Console**
1. Open your resume builder in the browser
2. Press **F12** (or Right-click → Inspect)
3. Go to the **Console** tab
4. Keep it open while testing

---

## 📤 Testing Resume Upload

### **Test 1: Upload Sample Resume**

1. **Navigate to Step 1** (Job Description step)
2. **Click** the upload area or drag `sample-resume.txt`
3. **Watch the console** for these logs:

```
📤 [Step1JD] Starting file upload: sample-resume.txt text/plain 2048
✅ [Step1JD] File validation passed
🔍 [Step1JD] Starting resume parsing...
📄 [Step1JD] Raw text length: 2048
📊 [Step1JD] Parsed data: {fullName: "John Doe", email: "john.doe@example.com", ...}
⭐ [Step1JD] Extraction score: 85
💾 [Step1JD] Resume data stored: {...}
✅ [Step1JD] Good extraction quality: 85
📡 [Step1JD] Notifying parent component with resume data
🏁 [Step1JD] File processing complete
```

4. **In ResumeBuilder, you should see:**

```
📥 [ResumeBuilder] handleResumeUpload called with: DATA
📁 [ResumeBuilder] Resume file: sample-resume.txt
⭐ [ResumeBuilder] Score: 85
📊 [ResumeBuilder] Parsed keys: ["fullName", "email", "phone", "linkedin", ...]
```

✅ **If you see these logs:** Resume upload is working!
❌ **If logs are missing:** There's a connection issue

---

## 📝 Testing JD Analysis

### **Test 2: Paste Job Description**

1. **Paste** the contents of `sample-jd.txt` into the JD textarea
2. **Click** "Analyze & Continue"
3. **Watch the console:**

```
🚀 [ResumeBuilder] handleNext - Step: 1 Uploaded Resume: true
📝 [ResumeBuilder] JD Text length: 1234
🔍 [ResumeBuilder] Analyzing JD...
✅ [ResumeBuilder] JD Analysis: {
  jobTitle: "Senior Full Stack Developer",
  requiredSkills: [...],
  preferredSkills: [...],
  keywords: [...]
}
```

✅ **If you see JD Analysis:** JD parsing is working!
❌ **If you see "JD text too short":** JD needs at least 50 characters

---

## 🔄 Testing Data Merge

### **Test 3: Check Data Merge**

After clicking "Analyze & Continue", watch for:

```
🔄 [ResumeBuilder] Merging resume data...
📊 [ResumeBuilder] Parsed Data: {
  fullName: "John Doe",
  email: "john.doe@example.com",
  experience: [...],
  education: [...],
  skills: [...]
}
✅ [ResumeBuilder] Data merged successfully!
📋 [ResumeBuilder] Personal: {fullName: "John Doe", email: "..."}
💼 [ResumeBuilder] Experience: 3 items
🎓 [ResumeBuilder] Education: 1 items
```

✅ **If you see these logs:** Data merging is working!

---

## 🎯 Expected Behavior

### **What Should Happen:**

1. **Upload sample-resume.txt:**
   - ✅ File is validated
   - ✅ Text is extracted
   - ✅ Data is parsed (name, email, phone, skills, experience, etc.)
   - ✅ Extraction score is calculated (should be 60+)
   - ✅ Parent component is notified

2. **Paste JD and click Continue:**
   - ✅ JD is analyzed
   - ✅ Skills and requirements are extracted
   - ✅ Resume data is merged with current data
   - ✅ Step 2 opens with ALL fields populated

3. **In Step 2:**
   - ✅ **Personal Info** tab shows: Name, email, phone, LinkedIn, location
   - ✅ **Experience** tab shows: 3 work experiences
   - ✅ **Education** tab shows: 1 education entry
   - ✅ **Skills** tab shows: Full skills list
   - ✅ **Projects** tab shows: 2 projects
   - ✅ **Certifications** tab shows: 2 certifications
   - ✅ **Achievements** tab shows: 2 achievements

---

## ❌ Troubleshooting

### **Problem: No logs appear**

**Solution:** Clear browser cache and hard reload (Ctrl+Shift+R / Cmd+Shift+R)

### **Problem: "Validation failed" error**

**Cause:** File type not supported
**Solution:** Use .txt files for testing (PDF/DOCX need additional libraries)

### **Problem: Low extraction score (<40)**

**Cause:** Resume format not recognized
**Solution:** 
- Check `sample-resume.txt` has clear sections
- Ensure section headers are capitalized (EXPERIENCE, EDUCATION)
- Use bullet points for lists

### **Problem: "No resume data to merge" warning**

**Causes:**
1. Resume wasn't uploaded before clicking Continue
2. Resume parsing failed
3. Callback wasn't triggered

**Solution:**
1. Upload resume BEFORE clicking Continue
2. Check console for parsing errors
3. Verify `onResumeUpload` callback in Step1JD

### **Problem: Fields not auto-populated in Step 2**

**Causes:**
1. Data merge happened but data structure mismatch
2. Component not re-rendering
3. Local storage has old data

**Solution:**
1. Check merged data structure in console
2. Clear browser localStorage: `localStorage.clear()`
3. Refresh page and try again

---

## 🔧 Manual Testing Checklist

### **Resume Upload Test:**
- [ ] File upload triggers
- [ ] Validation passes
- [ ] Parsing completes
- [ ] Extraction score > 40
- [ ] Parent notified
- [ ] Data stored in uploadedResume

### **JD Analysis Test:**
- [ ] Paste JD (min 50 chars)
- [ ] JD analysis triggers
- [ ] Job title extracted
- [ ] Skills extracted
- [ ] Keywords identified

### **Data Merge Test:**
- [ ] Merge starts
- [ ] Personal info merged
- [ ] Experience merged (arrays)
- [ ] Education merged (arrays)
- [ ] Skills merged (string conversion)
- [ ] setData() called

### **Step 2 Verification:**
- [ ] Personal tab populated
- [ ] Experience tab has items
- [ ] Education tab has items
- [ ] Skills tab filled
- [ ] Projects tab has items
- [ ] Certifications tab has items
- [ ] Achievements tab has items

---

## 📊 Sample Console Output (Success)

```
📤 [Step1JD] Starting file upload: sample-resume.txt text/plain 5120
✅ [Step1JD] File validation passed
🔍 [Step1JD] Starting resume parsing...
📄 [Step1JD] Raw text length: 5120
📊 [Step1JD] Parsed data: {
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  linkedin: "linkedin.com/in/johndoe",
  location: "San Francisco, CA",
  summary: "Experienced software engineer...",
  skills: ["React", "Node.js", ...],
  experience: [{role: "Senior Developer", ...}],
  education: [{school: "UC Berkeley", ...}]
}
⭐ [Step1JD] Extraction score: 85
💾 [Step1JD] Resume data stored
✅ [Step1JD] Good extraction quality: 85
📡 [Step1JD] Notifying parent component
🏁 [Step1JD] File processing complete

📥 [ResumeBuilder] handleResumeUpload called with: DATA
📁 [ResumeBuilder] Resume file: sample-resume.txt
⭐ [ResumeBuilder] Score: 85
📊 [ResumeBuilder] Parsed keys: ["fullName", "email", "phone", "linkedin", ...]

[User clicks "Analyze & Continue"]

🚀 [ResumeBuilder] handleNext - Step: 1 Uploaded Resume: true
📝 [ResumeBuilder] JD Text length: 1234
🔍 [ResumeBuilder] Analyzing JD...
✅ [ResumeBuilder] JD Analysis: {jobTitle: "Senior Full Stack Developer", ...}
🔄 [ResumeBuilder] Merging resume data...
📊 [ResumeBuilder] Parsed Data: {...}
✅ [ResumeBuilder] Data merged successfully!
📋 [ResumeBuilder] Personal: {fullName: "John Doe", email: "john.doe@example.com", ...}
💼 [ResumeBuilder] Experience: 3 items
🎓 [ResumeBuilder] Education: 1 items
```

---

## 🎯 Quick Test Commands

### **Clear All Data:**
```javascript
localStorage.clear()
location.reload()
```

### **Check Current Data:**
```javascript
console.log(JSON.parse(localStorage.getItem('resume_draft')))
```

### **Force Re-render:**
```javascript
// Just refresh the page
location.reload()
```

---

## 📞 What to Report

If still not working, report:

1. **Console logs** (copy all logs)
2. **File used** (sample-resume.txt or custom?)
3. **Error messages** (if any)
4. **Browser** (Chrome, Firefox, Safari?)
5. **Step where it fails** (upload, merge, or display?)

---

**Test now and check your console!** 🚀
