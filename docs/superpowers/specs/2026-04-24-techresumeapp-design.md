# Tech Resume App - Design Specification

## 1. Architecture & Data Flow

- **Framework:** Next.js App Router (JavaScript, no TypeScript).
- **Routing:**
  - `app/page.js`: Access gate. Checks input token against hardcoded values (`akshatresume`, `soupyresume`, `220394`). Matches redirect to `/tech-resume` via `next/navigation`.
  - `app/tech-resume/page.js`: Main application view. Contains Job Description textarea, dynamic Project form (max 3), and form state management.
- **Backend / Actions:**
  - `lib/orchestrator.js`: Defines Server Action `generateResumeAction(formData)` called by the client form.
  - `lib/fileLoader.js`: Uses Node.js `fs` to read `.md` context files at runtime (`ats.md`, `profile.md`, `resumeguidelines.md`, `systemprompt.md`).
  - `lib/ai.js`: Wraps `fetch` logic for OpenRouter API using `minimax/minimax-m2.5:free`.

## 2. Components & UI Styling (Neobrutalism)

- **CSS Strategy:** 100% Plain CSS (`styles/global.css`), NO Tailwind.
- **Visual Theme:**
  - **Colors:** Bright Yellow (`#FFF000`), Blue (`#0055FF`), Red (`#FF3333`), Black (`#000000`).
  - **Borders:** 3px-5px solid black on all inputs, buttons, and containers.
  - **Shadows:** Hard offset shadows (e.g., `box-shadow: 6px 6px 0px #000`).
  - **Fonts:** Monospace for technical feel (e.g., `'Courier New', Courier, monospace`).
  - **Edges:** Sharp, no border-radius.
- **Components:**
  - `ProjectForm.js`: Renders dynamic project inputs (Name, Description, Tech Stack, Link) + Add/Remove buttons.
  - `ResumePreview.js`: Displays AI-generated HTML string in a `contentEditable` div for inline editing.
- **Print CSS:** Uses `@media print` to hide the left-side forms/buttons, strips Neobrutalist styling from the preview, and formats the resume cleanly for native PDF generation (`window.print()`).

## 3. Orchestration & Pipeline

1. **Payload:** The client submits Job Description and an array of Projects to the `generateResumeAction` Server Action.
2. **Context & Token Optimization:** `fileLoader.js` reads `ats.md`, `profile.md`, `resumeguidelines.md`, and `systemprompt.md`. `PROFILE.md` and inputs are trimmed to reduce token load and improve stability.
3. **Keyword Extraction:** Extract job keywords from the Job Description pre-AI to derive skills and reorder/remove irrelevant skills accordingly.
4. **Data Injection & Enforced Mode:** The orchestrator enforces `mode: "tech"`. It merges the dynamic projects, instructing the AI to list projects first (detailed), skills derived from the job description, and compress non-tech (e.g., banking) experience strictly to 1-2 lines.
5. **AI Generation (First Pass):** Constructs the system prompt with strict rules. Calls OpenRouter (`minimax/minimax-m2.5:free`).
6. **ATS Refinement (Second Pass):** A second LLM pass using `ats.md` logic to inject missing keywords and remove remaining irrelevant content.
7. **Output Constraints & Locking:** 
   - Force strict AI output: valid HTML only, no markdown/explanations, must start with `<div>` or `<section>`.
   - Lock resume structure: Header → Projects → Skills → Education → Experience.
8. **Validation:** Validate output to ensure it's valid HTML. Retry once if the structure is violated or broken HTML is returned; otherwise, fallback to plain text.
9. **Editing & Export:** The returned HTML is injected into the `ResumePreview.js` component. The user can tweak text (`contentEditable`), use a "Copy" button, or use "Download PDF" (`window.print()`).
