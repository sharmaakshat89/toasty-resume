# Tech Resume App - Structured JSON Pipeline

## 1. Architecture & Data Flow
Transition from relying on the LLM to write raw HTML (prone to hallucination) to a structured JSON data pipeline that programmatically builds the final HTML.

## 2. Approach

1. **Extract Profile Data Safely (`lib/profileParser.js`):**
   - The current `profile.md` is actually a JS/TS export (`export const PROFILE = {...}`). 
   - We will write a utility to extract this object (e.g., using `eval` safely or importing it directly) so we have guaranteed access to the user's real name ("Akshat Sharma") and contact info, completely bypassing the LLM.

2. **JSON-First LLM Prompting (`lib/orchestrator.js`):**
   - Modify the OpenRouter API call to instruct the LLM to output a JSON object representing the optimized resume data.
   - Required JSON structure:
     ```json
     {
       "skills": [{ "category": "Languages", "items": ["JS", "Python"] }],
       "projects": [{ "title": "...", "tech": "...", "link": "...", "points": ["..."] }],
       "experience": [{ "role": "...", "company": "...", "duration": "...", "points": ["..."] }]
     }
     ```
   - (Education is static and appended from the profile).

3. **Sanitization Logic (`lib/sanitizer.js`):**
   - Implement logic based on `ats.md`:
   - Hard cap skills at 12 items total.
   - Ensure projects have a max of 4 bullets.
   - For non-tech experience (e.g., banking roles from the profile), compress to 1-2 bullets max or strip points entirely if instructed.

4. **Programmatic HTML Builder (`lib/htmlBuilder.js`):**
   - Write a function `buildResumeHTML(profile, sanitizedData)` that constructs the exact strict HTML structure with the CSS block we designed previously.
   - This guarantees the "John Doe" hallucination is impossible because the header data comes straight from the local file, and the layout cannot break.