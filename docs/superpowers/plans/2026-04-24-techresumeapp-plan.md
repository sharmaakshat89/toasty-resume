# Tech Resume App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user Next.js application that generates ATS-optimized, job-specific tech resumes using an LLM pipeline.

**Architecture:** Next.js App Router (JS), Server Actions for LLM generation, strict Neobrutalist plain CSS, fetch-based OpenRouter client.

**Tech Stack:** Next.js (App Router), JavaScript (No TS), Plain CSS (No Tailwind).

---

### Task 1: Scaffold Next.js App

**Files:**
- Create: `package.json`, Next.js defaults.

- [ ] **Step 1: Initialize Next.js**

Run: `npx create-next-app@14 . --js --app --no-tailwind --eslint --src-dir false --import-alias "@/*" --use-npm`
*(Note: If prompted to overwrite, approve. Since we have `.md` files, we might need to create in a temp dir and move, or just forcefully run it. Assuming `npm install` works.)*

- [ ] **Step 2: Install additional dependencies**

Run: `npm install marked dompurify`

- [ ] **Step 3: Setup Unit Testing (Jest)**

Run: `npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`
Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}
module.exports = createJestConfig(customJestConfig)
```
Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Commit**

```bash
git init
git add package.json jest.config.js jest.setup.js
git commit -m "chore: scaffold Next.js app and testing setup"
```

### Task 2: Global CSS (Neobrutalism)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Implement global styles**

```css
:root {
  --bg-yellow: #FFF000;
  --bg-blue: #0055FF;
  --bg-red: #FF3333;
  --bg-black: #000000;
  --text-main: #000000;
  --font-mono: 'Courier New', Courier, monospace;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  background-color: var(--bg-yellow);
  color: var(--text-main);
}

.neo-box {
  border: 4px solid var(--bg-black);
  box-shadow: 6px 6px 0px var(--bg-black);
  background: white;
  padding: 1rem;
}

.neo-button {
  border: 4px solid var(--bg-black);
  box-shadow: 4px 4px 0px var(--bg-black);
  background: var(--bg-blue);
  color: white;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-family: var(--font-mono);
}

.neo-button:active {
  box-shadow: 0px 0px 0px var(--bg-black);
  transform: translate(4px, 4px);
}

.neo-input {
  border: 3px solid var(--bg-black);
  padding: 0.5rem;
  font-family: var(--font-mono);
  width: 100%;
  box-sizing: border-box;
}

@media print {
  body {
    background: white;
  }
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  .neo-box {
    border: none;
    box-shadow: none;
    padding: 0;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add neobrutalism global css"
```

### Task 3: File Loader Utility

**Files:**
- Create: `lib/fileLoader.js`
- Test: `tests/fileLoader.test.js`

- [ ] **Step 1: Write failing test**

```javascript
// tests/fileLoader.test.js
import { loadContextFiles } from '../lib/fileLoader';

describe('fileLoader', () => {
  it('loads markdown files and trims them', async () => {
    const data = await loadContextFiles();
    expect(data.ats).toBeDefined();
    expect(data.profile).toBeDefined();
    expect(data.guidelines).toBeDefined();
    expect(data.systemPrompt).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test**
`npx jest tests/fileLoader.test.js` (Expect fail)

- [ ] **Step 3: Implement minimal code**

```javascript
// lib/fileLoader.js
import fs from 'fs/promises';
import path from 'path';

export async function loadContextFiles() {
  const rootDir = process.cwd();
  
  const readTrim = async (filename) => {
    try {
      const content = await fs.readFile(path.join(rootDir, filename), 'utf-8');
      return content.trim().substring(0, 4000); // Token optimization
    } catch (e) {
      return '';
    }
  };

  return {
    ats: await readTrim('ats.md'),
    profile: await readTrim('profile.md'),
    guidelines: await readTrim('resumeguidelines.md'),
    systemPrompt: await readTrim('systemprompt.md')
  };
}
```

- [ ] **Step 4: Run test**
`npx jest tests/fileLoader.test.js` (Expect pass)

- [ ] **Step 5: Commit**
`git add lib/fileLoader.js tests/fileLoader.test.js && git commit -m "feat: context file loader"`


### Task 4: OpenRouter Client Wrapper

**Files:**
- Create: `lib/ai.js`

- [ ] **Step 1: Implement AI Wrapper**
*(Skipping strict TDD here to mock fetch, just implement the wrapper)*

```javascript
// lib/ai.js
export async function generateResumeAI(prompt, systemInstruction) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.5:free',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]
    })
  });
  
  const data = await res.json();
  if (!data.choices || !data.choices[0]) throw new Error('AI generation failed');
  return data.choices[0].message.content;
}
```

- [ ] **Step 2: Commit**
`git add lib/ai.js && git commit -m "feat: openrouter ai client"`


### Task 5: Pipeline Orchestrator (Server Action)

**Files:**
- Create: `lib/orchestrator.js`

- [ ] **Step 1: Implement Orchestrator Logic**

```javascript
// lib/orchestrator.js
'use server'

import { loadContextFiles } from './fileLoader';
import { generateResumeAI } from './ai';

function extractKeywords(jobDesc) {
  const commonTech = ['React', 'Node.js', 'Next.js', 'JavaScript', 'TypeScript', 'Python', 'AWS', 'SQL'];
  return commonTech.filter(tech => jobDesc.toLowerCase().includes(tech.toLowerCase()));
}

export async function generateResumeAction(jobDescription, projects) {
  const context = await loadContextFiles();
  const keywords = extractKeywords(jobDescription);
  
  // Enforce mode: tech rules
  const systemInstruction = `
    ${context.systemPrompt}
    \nGUIDELINES:\n${context.guidelines}
    \nATS RULES:\n${context.ats}
    
    STRICT RULES:
    1. Mode: "tech".
    2. Projects must be listed FIRST and highly detailed.
    3. Skills must align with these keywords: ${keywords.join(', ')}.
    4. Non-tech experience (e.g., banking) MUST be compressed to strictly 1-2 lines.
    5. Output MUST be ONLY valid HTML. No markdown formatting. Must start with <div> or <section>.
    6. Lock structure: Header -> Projects -> Skills -> Education -> Experience.
  `;

  let prompt = `
    PROFILE:
    ${context.profile}
    
    DYNAMIC PROJECTS:
    ${JSON.stringify(projects, null, 2)}
    
    JOB DESCRIPTION:
    ${jobDescription}
  `;

  let htmlOutput = await generateResumeAI(prompt, systemInstruction);
  
  // Basic validation & second pass (retry) if not HTML
  if (!htmlOutput.trim().startsWith('<')) {
    htmlOutput = await generateResumeAI(`Fix this to be ONLY valid HTML: ${htmlOutput}`, "Return ONLY valid HTML starting with <div> or <section>.");
  }

  // Fallback cleanup
  htmlOutput = htmlOutput.replace(/```html/g, '').replace(/```/g, '');
  
  return htmlOutput;
}
```

- [ ] **Step 2: Commit**
`git add lib/orchestrator.js && git commit -m "feat: resume orchestrator pipeline"`


### Task 6: Project Form Component

**Files:**
- Create: `components/ProjectForm.js`

- [ ] **Step 1: Implement Form Component**

```javascript
// components/ProjectForm.js
'use client'

export default function ProjectForm({ projects, setProjects }) {
  const addProject = () => {
    if (projects.length < 3) {
      setProjects([...projects, { name: '', description: '', stack: '', link: '' }]);
    }
  };

  const updateProject = (index, field, value) => {
    const newP = [...projects];
    newP[index][field] = value;
    setProjects(newP);
  };

  return (
    <div className="neo-box" style={{ marginTop: '1rem' }}>
      <h3>Projects (Max 3)</h3>
      {projects.map((proj, i) => (
        <div key={i} style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <input className="neo-input" placeholder="Project Name" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} />
          <textarea className="neo-input" placeholder="Description" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} style={{ marginTop: '0.5rem' }} />
          <input className="neo-input" placeholder="Tech Stack" value={proj.stack} onChange={e => updateProject(i, 'stack', e.target.value)} style={{ marginTop: '0.5rem' }} />
          <input className="neo-input" placeholder="Link" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} style={{ marginTop: '0.5rem' }} />
        </div>
      ))}
      {projects.length < 3 && <button type="button" className="neo-button" onClick={addProject}>+ Add Project</button>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
`git add components/ProjectForm.js && git commit -m "feat: project form component"`


### Task 7: Resume Preview Component

**Files:**
- Create: `components/ResumePreview.js`

- [ ] **Step 1: Implement Preview Component**

```javascript
// components/ResumePreview.js
'use client'
import DOMPurify from 'dompurify';

export default function ResumePreview({ htmlContent }) {
  if (!htmlContent) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(document.getElementById('resume-content').innerText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="neo-box print-full-width" style={{ marginTop: '2rem' }}>
      <div className="no-print" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button className="neo-button" onClick={() => window.print()}>Download PDF</button>
        <button className="neo-button" onClick={copyToClipboard}>Copy Text</button>
      </div>
      <div 
        id="resume-content"
        contentEditable 
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
        style={{ padding: '2rem', background: 'white', minHeight: '800px', border: '1px solid #ccc' }}
        className="resume-document"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**
`git add components/ResumePreview.js && git commit -m "feat: resume preview component"`


### Task 8: The Home Page (Gate)

**Files:**
- Modify: `app/page.js`

- [ ] **Step 1: Implement Gate Logic**

```javascript
// app/page.js
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEnter = () => {
    if (['akshatresume', 'soupyresume', '220394'].includes(token)) {
      router.push('/tech-resume');
    } else {
      setError('Invalid Token');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="neo-box" style={{ width: '300px', textAlign: 'center' }}>
        <h2>Enter Access Token</h2>
        <input 
          className="neo-input" 
          value={token} 
          onChange={e => setToken(e.target.value)} 
          type="password"
        />
        {error && <p style={{ color: 'var(--bg-red)' }}>{error}</p>}
        <button className="neo-button" onClick={handleEnter} style={{ marginTop: '1rem', width: '100%' }}>Enter App</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
`git add app/page.js && git commit -m "feat: landing page token gate"`


### Task 9: Main Tech Resume Page

**Files:**
- Create: `app/tech-resume/page.js`

- [ ] **Step 1: Implement Main View**

```javascript
// app/tech-resume/page.js
'use client'
import { useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import ResumePreview from '../../components/ResumePreview';
import { generateResumeAction } from '../../lib/orchestrator';

export default function TechResume() {
  const [jobDesc, setJobDesc] = useState('');
  const [projects, setProjects] = useState([]);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateResumeAction(jobDesc, projects);
      setHtmlOutput(result);
    } catch (e) {
      alert("Error generating resume");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="no-print">Tech Resume Generator</h1>
      
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="neo-box">
            <h3>Job Description</h3>
            <textarea 
              className="neo-input" 
              rows={6}
              value={jobDesc} 
              onChange={e => setJobDesc(e.target.value)} 
            />
          </div>
          
          <ProjectForm projects={projects} setProjects={setProjects} />
          
          <button 
            className="neo-button" 
            style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.2rem', background: 'var(--bg-red)' }} 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Resume'}
          </button>
        </div>
        
        <div>
          {htmlOutput ? (
             <ResumePreview htmlContent={htmlOutput} />
          ) : (
             <div className="neo-box" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
               Preview will appear here
             </div>
          )}
        </div>
      </div>

      {/* For Print Layout */}
      <div className="print-only" style={{ display: 'none' }}>
        <ResumePreview htmlContent={htmlOutput} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
`git add app/tech-resume/page.js && git commit -m "feat: main tech resume generator view"`
