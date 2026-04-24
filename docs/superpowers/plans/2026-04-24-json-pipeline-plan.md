# Structured JSON Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the orchestrator to request JSON from the LLM, sanitize it strictly using `profile.md` as the truth source, and build HTML programmatically to guarantee formatting and prevent hallucinated personal data.

**Architecture:** We will create `lib/profileParser.js` to extract `PROFILE`, `lib/sanitizer.js` to enforce ATS limits and inject real names, and `lib/htmlBuilder.js` to generate the final HTML string. The orchestrator will tie these together.

**Tech Stack:** Next.js Server Actions, JS ES6 Templates.

---

### Task 1: Profile Extraction Utility

**Files:**
- Create: `lib/profileParser.js`
- Test: `tests/profileParser.test.js`

- [ ] **Step 1: Write failing test**

```javascript
// tests/profileParser.test.js
import { getBaseProfile } from '../lib/profileParser';

describe('profileParser', () => {
  it('extracts the PROFILE object from the string', async () => {
    const profile = await getBaseProfile();
    expect(profile.personal.name).toBe("Akshat Sharma");
    expect(profile.experience.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test**
`npx jest tests/profileParser.test.js` (Expect fail)

- [ ] **Step 3: Implement Profile Parser**

```javascript
// lib/profileParser.js
import fs from 'fs/promises';
import path from 'path';

export async function getBaseProfile() {
  const rootDir = process.cwd();
  try {
    const content = await fs.readFile(path.join(rootDir, 'profile.md'), 'utf-8');
    // Extract the object part of `export const PROFILE = { ... };`
    const jsonStrMatch = content.match(/export const PROFILE = ([\s\S]+?);/);
    if (jsonStrMatch && jsonStrMatch[1]) {
      // Use Function constructor as a safer eval to parse JS object literal to JSON
      const profileData = new Function('return ' + jsonStrMatch[1])();
      return profileData;
    }
    throw new Error('Could not match PROFILE object');
  } catch (e) {
    console.error('Failed to parse profile.md:', e);
    // Fallback empty profile
    return { personal: { name: "User", email: "", phone: "", location: "" }, summary: "", skills: [], experience: [], education: [] };
  }
}
```

- [ ] **Step 4: Run test**
`npx jest tests/profileParser.test.js` (Expect pass)

- [ ] **Step 5: Commit**
`git add lib/profileParser.js tests/profileParser.test.js && git commit -m "feat: profile parser utility"`


### Task 2: Sanitization Logic

**Files:**
- Create: `lib/sanitizer.js`

- [ ] **Step 1: Implement Sanitizer**

```javascript
// lib/sanitizer.js
export function sanitizeResumeData(llmJson, baseProfile) {
  // 1. Personal Info ALWAYS comes from the base profile
  const personal = baseProfile.personal;
  
  // 2. Skills: cap at 12
  let skills = [];
  if (Array.isArray(llmJson.skills)) {
    skills = llmJson.skills.slice(0, 12);
  }

  // 3. Projects: map and cap bullets at 4
  let projects = [];
  if (Array.isArray(llmJson.projects)) {
    projects = llmJson.projects.map(p => ({
      ...p,
      points: Array.isArray(p.points) ? p.points.slice(0, 4) : []
    }));
  }

  // 4. Experience: heavily compress or fallback
  let experience = [];
  if (Array.isArray(llmJson.experience)) {
    experience = llmJson.experience.map(exp => ({
      ...exp,
      points: Array.isArray(exp.points) ? exp.points.slice(0, 2) : [] // Force 1-2 bullets max for experience as per constraints
    }));
  }

  // 5. Education: strictly from base profile
  const education = baseProfile.education;

  return { personal, skills, projects, experience, education };
}
```

- [ ] **Step 2: Commit**
`git add lib/sanitizer.js && git commit -m "feat: ats sanitization logic"`


### Task 3: HTML Builder

**Files:**
- Create: `lib/htmlBuilder.js`

- [ ] **Step 1: Implement Programmatic HTML Builder**

```javascript
// lib/htmlBuilder.js
export function buildResumeHTML(data) {
  const { personal, skills, projects, experience, education } = data;

  const headerHtml = `
    <div class="resume-header">
      <h1 class="resume-name">${personal.name}</h1>
      <div class="resume-contact">
        ${personal.email} | ${personal.phone} | ${personal.location}
      </div>
    </div>
  `;

  // Skills
  const skillsHtml = `
    <h2 class="section-title">Technical Skills</h2>
    <div style="font-size: 11pt; margin-bottom: 10px;">
      ${skills.map(s => `<b>${s.category || 'Skills'}:</b> ${Array.isArray(s.items) ? s.items.join(', ') : s}`).join('<br/>')}
    </div>
  `;

  // Projects
  let projectsHtml = '';
  if (projects && projects.length > 0) {
    projectsHtml += `<h2 class="section-title">Projects</h2>`;
    projects.forEach(p => {
      projectsHtml += `
        <div style="margin-bottom: 10px;">
          <div class="item-header">
            <span><b>${p.title || 'Project'}</b> ${p.link ? `(<a href="${p.link}">Link</a>)` : ''} | <i>${p.tech || ''}</i></span>
          </div>
          <ul>
            ${p.points.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      `;
    });
  }

  // Experience
  let expHtml = '';
  if (experience && experience.length > 0) {
    expHtml += `<h2 class="section-title">Experience</h2>`;
    experience.forEach(e => {
      expHtml += `
        <div style="margin-bottom: 5px;">
          <div class="item-header">
            <span><b>${e.company || ''}</b></span>
            <span>${e.duration || ''}</span>
          </div>
          <div class="item-sub">
            <span><i>${e.role || ''}</i></span>
            <span>${e.location || ''}</span>
          </div>
          ${e.points && e.points.length > 0 ? `<ul>${e.points.map(pt => `<li>${pt}</li>`).join('')}</ul>` : ''}
        </div>
      `;
    });
  }

  // Education
  let eduHtml = '';
  if (education && education.length > 0) {
    eduHtml += `<h2 class="section-title">Education</h2>`;
    education.forEach(e => {
      eduHtml += `
        <div style="margin-bottom: 5px;">
          <div class="item-header">
            <span><b>${e.institution}</b></span>
            <span>${e.year}</span>
          </div>
          <div class="item-sub">
            <span><i>${e.degree}</i></span>
            <span>${e.location}</span>
          </div>
        </div>
      `;
    });
  }

  const css = `
    <style>
      .resume-container { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; line-height: 1.2; max-width: 800px; margin: 0 auto; }
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

  return `${css}<div class="resume-container">${headerHtml}${skillsHtml}${projectsHtml}${expHtml}${eduHtml}</div>`;
}
```

- [ ] **Step 2: Commit**
`git add lib/htmlBuilder.js && git commit -m "feat: programmatic HTML builder"`


### Task 4: Refactor Orchestrator to JSON Pipeline

**Files:**
- Modify: `lib/orchestrator.js`

- [ ] **Step 1: Rewrite Orchestrator Logic**

```javascript
// lib/orchestrator.js
'use server'

import { loadContextFiles } from './fileLoader';
import { generateResumeAI } from './ai';
import { getBaseProfile } from './profileParser';
import { sanitizeResumeData } from './sanitizer';
import { buildResumeHTML } from './htmlBuilder';

function extractKeywords(jobDesc) {
  const commonTech = ['React', 'Node.js', 'Next.js', 'JavaScript', 'TypeScript', 'Python', 'AWS', 'SQL', 'CSS', 'HTML', 'Git', 'Docker'];
  return commonTech.filter(tech => jobDesc.toLowerCase().includes(tech.toLowerCase()));
}

export async function generateResumeAction(jobDescription, projects) {
  const context = await loadContextFiles();
  const baseProfile = await getBaseProfile();
  const keywords = extractKeywords(jobDescription);
  
  const systemInstruction = `
    You are an ATS expert. 
    \nGUIDELINES:\n${context.guidelines}
    \nATS RULES:\n${context.ats}
    
    STRICT RULES:
    1. Mode: "tech". Output MUST be ONLY valid JSON matching the structure requested. No markdown, no conversational text.
    2. Projects must be highly detailed and relevant to the Job Description.
    3. Skills must align with these extracted keywords: ${keywords.join(', ')}. Max 12 skills.
    4. Non-tech experience MUST be compressed to 1-2 lines maximum. Focus on impact.
    
    REQUIRED JSON STRUCTURE:
    {
      "skills": [ { "category": "Languages", "items": ["JS", "Python"] } ],
      "projects": [ { "title": "...", "tech": "...", "link": "...", "points": ["...", "..."] } ],
      "experience": [ { "role": "...", "company": "...", "duration": "...", "location": "...", "points": ["..."] } ]
    }
  `;

  const prompt = `
    BASE PROFILE:
    ${context.profile}
    
    DYNAMIC PROJECTS:
    ${JSON.stringify(projects, null, 2)}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Return the optimized JSON.
  `;

  let aiResult = await generateResumeAI(prompt, systemInstruction);
  
  // Clean potential markdown wrapper
  aiResult = aiResult.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
  
  let parsedJson;
  try {
    parsedJson = JSON.parse(aiResult);
  } catch (e) {
    console.error("Failed to parse JSON, falling back", e);
    // basic fallback
    parsedJson = { skills: [], projects: projects.map(p => ({ title: p.name, tech: p.stack, link: p.link, points: [p.description] })), experience: baseProfile.experience };
  }

  // Sanitize and Build
  const finalData = sanitizeResumeData(parsedJson, baseProfile);
  const finalHtml = buildResumeHTML(finalData);

  return finalHtml;
}
```

- [ ] **Step 2: Commit**
`git add lib/orchestrator.js && git commit -m "refactor: switch pipeline to structured JSON + programmatic HTML"`
