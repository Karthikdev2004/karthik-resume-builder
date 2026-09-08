# Template Editing Support - Complete Implementation Guide

## Status Update

### ✅ COMPLETED: Template Signatures Updated

All templates now accept editing props:
```typescript
const Template: React.FC<TemplateProps> = ({ 
  data, 
  isEditing = false, 
  actions, 
  showHighlights = false 
}) => (
  // template code
)
```

**Updated Templates:**
- ✅ SidebarLeftTemplate  
- ✅ SidebarRightTemplate
- ✅ CompactTemplate
- ✅ ModernTemplate

**Already Had Editing Support:**
- ✅ ClassicTemplate
- ✅ TechProTemplate
- ✅ AcademicProTemplate

### 🚧 TODO: Make Fields Editable

While all templates now *accept* editing props, only 3 templates actually implement editable fields. The remaining 4 templates display data as read-only.

## Implementation Pattern

### Editable Templates (Reference Implementation)

Templates that are fully editable:
1. `ClassicTemplate` - Complete reference
2. `TechProTemplate` - Modern reference  
3. `AcademicProTemplate` - Comprehensive reference

### Read-Only Templates (Need Implementation)

Templates that need editing implementation:
1. `SidebarLeftTemplate`
2. `SidebarRightTemplate`
3. `CompactTemplate`
4. `ModernTemplate`

## How to Make a Field Editable

### Pattern 1: Simple Text Field

**Before (Read-Only):**
```tsx
<h1>{data.personalInfo.fullName || "Your Name"}</h1>
```

**After (Editable):**
```tsx
<h1>
  {isEditing ? (
    <input
      value={data.personalInfo.fullName}
      onChange={(e) => actions?.updateField("personalInfo", {
        ...data.personalInfo,
        fullName: e.target.value
      })}
      className="w-full bg-transparent border-b border-slate-300 focus:border-blue-500"
    />
  ) : (
    data.personalInfo.fullName || "Your Name"
  )}
</h1>
```

**Or use EditableField component:**
```tsx
<h1>
  <EditableField
    value={data.personalInfo.fullName}
    onChange={(v) => actions?.updateField("personalInfo", {
      ...data.personalInfo,
      fullName: v
    })}
    isEditing={isEditing}
    placeholder="YOUR NAME"
    className="text-center w-full"
  />
</h1>
```

### Pattern 2: Multi-line Text (Textarea)

**Before:**
```tsx
<p>{data.summary}</p>
```

**After:**
```tsx
{isEditing ? (
  <textarea
    value={data.summary || ""}
    onChange={(e) => actions?.updateField("summary", e.target.value)}
    className="w-full border border-slate-200 p-2 rounded"
    placeholder="Professional summary..."
  />
) : (
  <p>{data.summary}</p>
)}
```

### Pattern 3: List Items (Experience, Projects, etc.)

**Before:**
```tsx
{data.experience.map((exp, i) => (
  <div key={i}>
    <h3>{exp.company}</h3>
    <p>{exp.role}</p>
    <p>{exp.description}</p>
  </div>
))}
```

**After:**
```tsx
{data.experience.map((exp, i) => (
  <div key={exp.id} className="relative group/item">
    {isEditing && (
      <SectionControls
        onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
        onMoveDown={i < data.experience.length - 1 ? () =>  actions?.move("experience", i, "down") : undefined}
        onDelete={() => actions?.remove("experience", exp.id)}
      />
    )}
    
    <h3>
      <EditableField
        value={exp.company}
        onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
        isEditing={isEditing}
        placeholder="Company Name"
      />
    </h3>
    
    <p>
      <EditableField
        value={exp.role}
        onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
        isEditing={isEditing}
        placeholder="Job Title"
      />
    </p>
    
    <div>
      <EditableBulletList
        items={exp.description ? exp.description.split('\n') : []}
        onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
        isEditing={isEditing}
        showHighlights={showHighlights}
      />
    </div>
  </div>
))}
```

### Pattern 4: Add/Remove Sections

**Add "Add Item" button:**
```tsx
<div className="flex items-center justify-between mb-2">
  <h2>Experience</h2>
  {isEditing && (
    <button 
      onClick={() => actions?.add("experience")} 
      className="text-blue-600 hover:bg-blue-50 p-1 rounded"
    >
      <Plus size={12} />
    </button>
  )}
</div>
```

**Add empty placeholder:**
```tsx
<div className="space-y-3">
  {data.experience.length === 0 && isEditing && (
    <EmptySectionPlaceholder 
      title="Experience" 
      onClick={() => actions?.add("experience")} 
    />
  )}
  {/* ... experience items ... */}
</div>
```

## Required Imports

Make sure these are imported at the top of templates.tsx:
```tsx
import {
  EditableField,
  EditableBulletList,
  SectionHeader,
  HighlightText,
  SectionControls,
  EmptySectionPlaceholder
} from "@/app/components/builder/PreviewComponents";
```

## Complete Update Checklist 

### For Each Template:

#### Personal Info Section:
- [ ] Full Name - editable
- [ ] Email - editable
- [ ] Phone - editable
- [ ] LinkedIn - editable
- [ ] GitHub - editable
- [ ] Website - editable
- [ ] Location - editable
- [ ] Title/Tagline - editable

#### Summary Section:
- [ ] Summary/Profile text - textarea, editable
- [ ] Show/hide based on `data.summary || isEditing`

#### Experience Section:
- [ ] Company name - editable
- [ ] Role/title - editable
- [ ] Duration - editable
- [ ] Location - editable
- [ ] Description - EditableBulletList
- [ ] Add button (if isEditing)
- [ ] SectionControls for each item
- [ ] EmptySectionPlaceholder when empty

#### Education Section:
- [ ] School name - editable
- [ ] Degree - editable
- [ ] Year - editable
- [ ] GPA - editable (if shown)
- [ ] Location - editable (if shown)
- [ ] Description - editable (if shown)
- [ ] Add button (if isEditing)
- [ ] SectionControls for each item

#### Skills Section:
- [ ] Skills text - textarea, editable

#### Projects Section:
- [ ] Project name - editable
- [ ] Description - editable (multiline)
- [ ] Link - editable (if shown)
- [ ] Duration - editable (if shown)
- [ ] Add button (if isEditing)
- [ ] SectionControls for each item

#### Certifications Section:
- [ ] Title - editable
- [ ] Issuer - editable
- [ ] Date -editable
- [ ] Description - editable (if shown)
- [ ] Add button (if isEditing)
- [ ] SectionControls for each item

#### Achievements Section:
- [ ] Title - editable
- [ ] Issuer - editable
- [ ] Date - editable
- [ ] Description - editable (if shown)
- [ ] Add button (if isEditing)
- [ ] SectionControls for each item

## Templates Status

### SidebarLeftTemplate
**Current State**: Accepts props ✅, but all fields are read-only ❌

**Needs:**
- [ ] Header: Make name, email, phone, links editable
- [ ] Left Column (Education, Skills, Certifications, Achievements)
- [ ] Right Column (Summary, Experience, Projects)
- [ ] Add/remove functionality for all list sections

**Complexity**: Medium (sidebar layout requires careful positioning of edit controls)

### SidebarRightTemplate
**Current State**: Accepts props ✅, but all fields are read-only ❌

**Needs:**
- [ ] Header: Make name, contact info editable
- [ ] Left Column (Summary, Skills, Experience)
- [ ] Right Column (Education, Achievements, Projects, Certifications)
- [ ] Add/remove functionality for all list sections

**Complexity**: Medium

### CompactTemplate
**Current State**: Accepts props ✅, but all fields are read-only ❌

**Needs:**
- [ ] Header: Make name, pill badges editable
- [ ] Skills bar - editable
- [ ] Summary bar - editable
- [ ] All list sections (Experience, Education, Projects, etc.)

**Complexity**: High (dense layout, unique bar-style formatting)

### ModernTemplate  
**Current State**: Accepts props ✅, but all fields are read-only ❌

**Needs:**
- [ ] Header: Make name, title, contact editable
- [ ] Profile/Summary - editable
- [ ] Two-column sections (Education & Skills, Projects & Certifications)
- [ ] Experience section

**Complexity**: Medium

## Recommended Approach

### Phase 1: Quick Win (RECOMMENDED FOR NOW)
Since updating all fields in all templates is extensive work, users can:
1. Use one of the **fully editable templates** for editing:
   - Classic Template
   - Tech Pro Template
   - Academic Pro Template
2. Switch templates only when they're satisfied with content

### Phase 2: Incremental Implementation
Update templates one at a time in priority order:
1. **ModernTemplate** (popular choice)
2. **SidebarRightTemplate** (tech-focused)
3. **SidebarLeftTemplate** (academic-focused)
4. **CompactTemplate** (specialized use)

### Phase 3: Full Parity
All 7 templates fully editable with consistent UX.

## Automation Opportunity

To speed up implementation, could create a script to:
1. Find all static display fields
2. Generate EditableField wrappers
3. Add conditional rendering based on `isEditing`
4. Insert Add buttons and SectionControls

## Testing Requirements

After making fields editable, test:
1. **Edit Mode**: All fields can be modified
2. **Preview Mode**: Clean display without edit controls
3. **Add/Remove**: List items can be added and removed
4. **Move**: Items can be reordered
5. **Auto-save**: Changes persist (debounced)
6. **Print**: Edit controls don't appear in PDF
7. **Validation**: Errors show appropriately

## Example: Complete Editable Section

```tsx
{/* Experience */}
<section className="group/section">
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-xs font-bold uppercase">Experience</h2>
    {isEditing && (
      <button 
        onClick={() => actions?.add("experience")} 
        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
      >
        <Plus size={12} />
      </button>
    )}
  </div>

  <div className="space-y-3">
    {data.experience.length === 0 && isEditing && (
      <EmptySectionPlaceholder 
        title="Experience" 
        onClick={() => actions?.add("experience")} 
      />
    )}
    
    {data.experience.map((exp, i) => (
      <div key={exp.id} className="relative group/item">
        {isEditing && (
          <SectionControls
            onMoveUp={i > 0 ? () => actions?.move("experience", i, "up") : undefined}
            onMoveDown={i < data.experience.length - 1 ? () => actions?.move("experience", i, "down") : undefined}
            onDelete={() => actions?.remove("experience", exp.id)}
          />
        )}
        
        <div className="flex justify-between">
          <EditableField
            value={exp.company}
            onChange={(v) => actions?.updateItem("experience", exp.id, "company", v)}
            isEditing={isEditing}
            placeholder="Company"
            className="font-bold"
          />
          <EditableField
            value={exp.duration}
            onChange={(v) => actions?.updateItem("experience", exp.id, "duration", v)}
            isEditing={isEditing}
            placeholder="Duration"
            className="text-sm text-gray-500"
          />
        </div>
        
        <EditableField
          value={exp.role}
          onChange={(v) => actions?.updateItem("experience", exp.id, "role", v)}
          isEditing={isEditing}
          placeholder="Role"
          className="italic"
        />
        
        <EditableBulletList
          items={exp.description ? exp.description.split('\n') : []}
          onChange={(items) => actions?.updateItem("experience", exp.id, "description", items.join('\n'))}
          isEditing={isEditing}
          showHighlights={showHighlights}
        />
      </div>
    ))}
  </div>
</section>
```

## Current Recommendation

**FOR IMMEDIATE USE:**
Users should use these fully functional, editable templates:
- **Tech Pro** - For software engineering roles ⭐ RECOMMENDED
- **Academic Pro** - For academic/research positions
- **Classic** - For general purpose

These templates support:
- ✅ Full inline editing
- ✅ Add/remove items
- ✅ Reorder items
- ✅ Real-time preview
- ✅ All validation features

**FOR FUTURE**: We'll incrementally add editing support to the remaining templates.

---

**Current Status:**  
✅ All templates accept editing props  
🚧 4 templates need field-level editing implementation  
✅ 3 templates fully functional for editing

**Priority**: Medium (users have functional alternatives)  
**Effort**: High (requires careful implementation per template)

