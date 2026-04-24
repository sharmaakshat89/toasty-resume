# Tech Resume App - PDF Template Styling Update

## Overview
Update the generated HTML output to visually match a specific traditional ATS resume layout (centered header, horizontal section dividers, right-aligned dates, serif font) while strictly adhering to `resumeguidelines.md`.

## Architecture & Implementation Strategy

We will use the **"CSS Injected into LLM Prompt"** approach to ensure the LLM returns HTML structured with classes that map to a predefined CSS block.

### Changes Required:

1. **`lib/orchestrator.js` Updates:**
   - Update `systemInstruction1` to include a strict CSS template block that the LLM MUST include at the top of the generated HTML.
   - The CSS template will include:
     - `body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; line-height: 1.2; }`
     - `.resume-header { text-align: center; margin-bottom: 15px; }`
     - `.resume-name { font-size: 24pt; font-weight: normal; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; }`
     - `.resume-contact { font-size: 10pt; }`
     - `.section-title { font-size: 12pt; font-weight: bold; text-transform: capitalize; border-bottom: 1px solid black; margin-top: 10px; margin-bottom: 5px; }`
     - `.item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; }`
     - `.item-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 10pt; margin-bottom: 3px; }`
     - `ul { margin: 0 0 10px 0; padding-left: 20px; }`
     - `li { margin-bottom: 3px; }`
     - `.skills-grid { display: grid; grid-template-columns: 150px 1fr; margin-bottom: 3px; }`
     - `.skill-category { font-weight: bold; }`
   - Instruct the LLM to apply these specific CSS classes to the HTML elements instead of using standard markdown syntax.

2. **Refinement Pass Maintenance (`lib/orchestrator.js`):**
   - Ensure `systemInstruction2` (the ATS refinement pass) preserves the CSS `<style>` block and class names while optimizing the text.

3. **`components/ResumePreview.js` Updates:**
   - Ensure the wrapper container does not override the injected `Times New Roman` font.
   - Adjust `DOMPurify` settings if necessary to ensure `<style>` tags are not stripped out (by default, DOMPurify might strip styles unless configured). We will need to set `{ FORCE_BODY: true, ADD_TAGS: ['style'] }` in DOMPurify.