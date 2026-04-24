# Template Styling Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inject a strict CSS template block into the LLM orchestration pipeline to visually match a traditional ATS serif-font resume structure.

**Architecture:** Update Next.js Server Action (`lib/orchestrator.js`) LLM system prompts and configure `components/ResumePreview.js` `DOMPurify` to allow the injected `<style>` block.

**Tech Stack:** Next.js App Router (JS), DOMPurify.

---

### Task 1: Update Orchestrator System Prompts

**Files:**
- Modify: `lib/orchestrator.js`

- [ ] **Step 1: Modify `generateResumeAction` system instructions**

Update `lib/orchestrator.js` to include the CSS block in both passes.

```javascript
// Replace the systemInstruction1 definition with this:
  const systemInstruction1 = `
    ${context.systemPrompt}
    \nGUIDELINES:\n${context.guidelines}
    
    STRICT RULES:
    1. Mode: "tech".
    2. Projects must be listed FIRST and highly detailed.
    3. Skills must align with these extracted keywords: ${keywords.join(', ')}.
    4. Non-tech experience MUST be compressed to strictly 1-2 lines.
    5. Output MUST be ONLY valid HTML. No markdown formatting. Must start with <div> or <section>.
    6. Lock structure: Header -> Projects -> Skills -> Education -> Experience.
    7. CRITICAL STYLING RULE: You MUST wrap your HTML output with this exact CSS block at the very top:
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
      .skills-grid { display: grid; grid-template-columns: 150px 1fr; margin-bottom: 3px; }
      .skill-category { font-weight: bold; }
      a { color: blue; text-decoration: none; }
    </style>
    Wrap the entire resume content inside <div class="resume-container">.
    Use the classes defined in the style block (e.g., <h1 class="resume-name">, <h2 class="section-title">).
  `;
```

```javascript
// Replace the systemInstruction2 definition with this:
  const systemInstruction2 = `
    ATS REFINE MODE:
    \nATS RULES:\n${context.ats}
    
    You are an ATS optimization engine. Take the user's HTML resume and apply keyword optimization to match this Job Description:
    ${jobDescription}
    
    RULES:
    1. Output MUST be valid HTML, exactly like the input but with optimized text.
    2. Remove irrelevant content.
    3. Do NOT wrap in markdown \`\`\`html codeblocks. Return raw HTML.
    4. CRITICAL: Preserve the exact <style> block and class attributes from the input. DO NOT alter the CSS or layout structure.
  `;
```

- [ ] **Step 2: Commit**

```bash
git add lib/orchestrator.js
git commit -m "feat: inject strict ATS css template into LLM pipeline"
```

### Task 2: Configure DOMPurify to Allow Styles

**Files:**
- Modify: `components/ResumePreview.js`

- [ ] **Step 1: Update DOMPurify settings**

Update the `dangerouslySetInnerHTML` call to explicitly allow `<style>` tags so they aren't stripped by DOMPurify. Also remove the inline font-family so the injected styles take over.

```javascript
// Change the dangerouslySetInnerHTML line to this:
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent, { FORCE_BODY: true, ADD_TAGS: ['style'] }) }}
```

```javascript
// Change the inline style on the #resume-content div:
// Replace this:
// style={{ 
//   padding: '2rem', 
//   background: 'white', 
//   color: 'black',
//   minHeight: '800px', 
//   border: '4px solid black',
//   fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
// }}
// With this:
        style={{ 
          padding: '2rem', 
          background: 'white', 
          color: 'black',
          minHeight: '800px', 
          border: '4px solid black'
        }}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResumePreview.js
git commit -m "fix: allow style tags in DOMPurify and remove wrapper fonts"
```