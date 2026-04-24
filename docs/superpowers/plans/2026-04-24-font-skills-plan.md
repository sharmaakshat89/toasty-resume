# Font Update & Missing Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the resume font to sans-serif with dynamic weight adjustments, and implement a missing skills extractor that injects skills directly into the `contentEditable` preview.

**Architecture:** We update `htmlBuilder` CSS, update `orchestrator` to request `missingSkillsFromJD`, and update the UI to render the Font Weight dropdown and Skill Buttons with DOM manipulation handlers.

**Tech Stack:** Next.js Server Actions, vanilla DOM API for safe injection.

---

### Task 1: Update HTML Builder Font

**Files:**
- Modify: `lib/htmlBuilder.js`

- [ ] **Step 1: Modify CSS block font family and add skills ID**

```javascript
// In lib/htmlBuilder.js
// Change the skillsHtml div to have an ID:
  let skillsHtml = '';
  if (skills && skills.length > 0) {
    skillsHtml += `<h2 class="section-title">Technical Skills</h2>`;
    skillsHtml += `<div id="resume-skills-content" style="font-size: 11pt; margin-bottom: 10px;">`;
    skills.forEach(s => {
      let itemsStr = Array.isArray(s.items) ? s.items.join(', ') : (s.items || '');
      skillsHtml += `<b>${s.category || 'Skills'}:</b> ${itemsStr}<br/>`;
    });
    skillsHtml += `</div>`;
  }

// Change the CSS block:
// Replace 'font-family: "Times New Roman", Times, serif;' with 'font-family: Arial, Helvetica, sans-serif;'
// Add 'font-weight: inherit;'
  const css = `
    <style>
      .resume-container { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; line-height: 1.2; max-width: 800px; margin: 0 auto; font-weight: inherit; }
      .resume-header { text-align: center; margin-bottom: 15px; }
      .resume-name { font-size: 24pt; font-weight: normal; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; }
      .resume-contact { font-size: 10pt; }
      .section-title { font-size: 12pt; font-weight: bold; text-transform: capitalize; border-bottom: 1px solid black; margin-top: 10px; margin-bottom: 5px; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; }
      .item-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 10pt; margin-bottom: 3px; }
      ul { margin: 0 0 10px 0; padding-left: 20px; }
      li { margin-bottom: 3px; }
      a { color: blue; text-decoration: none; }
    </style>
  `;
```

- [ ] **Step 2: Commit**

```bash
git add lib/htmlBuilder.js
git commit -m "feat: change resume font to sans-serif and add skills id"
```

### Task 2: Orchestrator JSON Schema Update

**Files:**
- Modify: `lib/orchestrator.js`

- [ ] **Step 1: Add missingSkillsFromJD to prompt and return signature**

```javascript
// In lib/orchestrator.js:
// Update systemInstruction JSON structure request:
    REQUIRED JSON STRUCTURE:
    {
      "skills": [ { "category": "Languages", "items": ["JS", "Python"] } ],
      "projects": [ { "title": "...", "tech": "...", "link": "...", "points": ["...", "..."] } ],
      "experience": [ { "role": "...", "company": "...", "duration": "...", "location": "...", "points": ["..."] } ],
      "missingSkillsFromJD": ["Skill1", "Skill2"]
    }

// At the bottom of generateResumeAction, update the return statement:
  return {
    html: finalHtml,
    missingSkills: parsedJson.missingSkillsFromJD || []
  };
```

- [ ] **Step 2: Commit**

```bash
git add lib/orchestrator.js
git commit -m "feat: extract missing skills from JD in orchestrator"
```

### Task 3: Resume Preview Dynamic Weight & Skill DOM Injection

**Files:**
- Modify: `components/ResumePreview.js`

- [ ] **Step 1: Add fontWeight prop and apply it to style**

```javascript
export default function ResumePreview({ htmlContent, fontWeight = 'normal' }) {
// ...
        style={{ 
          padding: '2rem', 
          background: 'white', 
          color: 'black',
          minHeight: '800px', 
          border: '4px solid black',
          fontWeight: fontWeight
        }}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResumePreview.js
git commit -m "feat: add fontWeight support to preview component"
```

### Task 4: UI integration (Font Adjuster & Skill Buttons)

**Files:**
- Modify: `app/tech-resume/page.js`

- [ ] **Step 1: Update State and UI layout**

```javascript
// In app/tech-resume/page.js
  const [htmlOutput, setHtmlOutput] = useState('');
  const [missingSkills, setMissingSkills] = useState([]);
  const [fontWeight, setFontWeight] = useState('normal');

// Update handleGenerate to match new return signature:
    try {
      const result = await generateResumeAction(jobDesc, projects);
      setHtmlOutput(result.html);
      setMissingSkills(result.missingSkills || []);
    }

// Add handleSkillAdd function:
  const handleSkillAdd = (skillName) => {
    const skillsDiv = document.getElementById('resume-skills-content');
    if (skillsDiv) {
      // Find the first line break or append to end
      const firstCategory = skillsDiv.innerHTML.indexOf('<br');
      if (firstCategory !== -1) {
        skillsDiv.innerHTML = skillsDiv.innerHTML.substring(0, firstCategory) + ', ' + skillName + skillsDiv.innerHTML.substring(firstCategory);
      } else {
        skillsDiv.innerHTML += ', ' + skillName;
      }
      setMissingSkills(prev => prev.filter(s => s !== skillName));
    }
  };

// In the JSX, add the Font Weight selector and Missing Skills pills:
// Add above the <ResumePreview htmlContent={htmlOutput} fontWeight={fontWeight} />:
          <div className="no-print" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold' }}>Font Weight:</label>
              <select className="neo-input" style={{ width: 'auto' }} value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="500">Medium</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            
            {missingSkills.length > 0 && (
              <div className="neo-box" style={{ background: 'var(--bg-yellow)', padding: '0.5rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Missing Skills from JD (Click to add):</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {missingSkills.map((skill, idx) => (
                    <button 
                      key={idx} 
                      className="neo-button" 
                      style={{ background: 'white', color: 'black', padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      onClick={() => handleSkillAdd(skill)}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
```

- [ ] **Step 2: Commit**

```bash
git add app/tech-resume/page.js
git commit -m "feat: add font weight selector and missing skills injection ui"
```