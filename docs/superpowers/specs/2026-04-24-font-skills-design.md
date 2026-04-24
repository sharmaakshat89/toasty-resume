# Tech Resume App - Font Adjustments & Skill Injection Design

## 1. Sans-Serif & Font Weight Update
**Goal:** Switch the base template font and allow dynamic visual weight adjustments without disrupting user manual edits.

- **`lib/htmlBuilder.js`**: Update CSS template from `Times New Roman` to `Arial, Helvetica, sans-serif`. Update `.resume-container` to use `font-weight: inherit;` so it inherits from its React wrapper.
- **`app/tech-resume/page.js`**: Add a `<select>` or radio buttons for `Font Weight: Normal | Medium | Semi-Bold`. Pass this `fontWeight` state down to `<ResumePreview>`.
- **`components/ResumePreview.js`**: Apply the `fontWeight` inline style to the `resume-document` container div.

## 2. Missing Skills Extraction & DOM Injection
**Goal:** Extract skills from the JD missing in the profile, present them as clickable buttons, and inject them into the preview safely.

- **`lib/orchestrator.js`**: 
  - Update the LLM system prompt to demand `"missingSkillsFromJD": ["Skill1", "Skill2"]` in the returned JSON.
  - Update the server action return signature from `string` to `{ html: string, missingSkills: string[] }`.
- **`app/tech-resume/page.js`**:
  - Store `missingSkills` in state. Render them as small neobrutalist pill buttons above the preview.
  - Pass a handler `onSkillAdd={handleSkillAdd}` down to `ResumePreview` (or execute DOM query directly in the parent component).
- **`components/ResumePreview.js` & `lib/htmlBuilder.js`**:
  - Add `<div id="resume-skills-content">` inside the generated skills section HTML.
  - Implement the DOM manipulation: `document.getElementById('resume-skills-content').insertAdjacentText('beforeend', ', ' + skill)`. This ensures `contentEditable` cursor states and manual edits are preserved instead of wiped by a full React string re-render.