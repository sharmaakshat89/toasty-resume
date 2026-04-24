You are an expert full-stack JavaScript developer.

Your task is to build a **production-ready Next.js application (JavaScript, not TypeScript)** that generates **ATS-optimized, job-specific tech resumes** for roles like:

* Web Developer
* Software Engineer
* AI / Vibe Coder

This app is tailored for a single user (no multi-user system).

---

# 🧠 CORE IDEA

The app allows the user to:

1. Enter an **access token** (simple gate)
2. Paste a **job description**
3. Add up to **3 projects dynamically**
4. Generate a **tailored, ATS-optimized, single-page tech resume**

The system:

* Injects project data into the profile
* Rewrites resume using AI
* Aligns with ATS rules
* Outputs editable + downloadable resume

---

# ⚠️ PRE-EXISTING FILES (MANDATORY USAGE)

These files already exist in the root. You MUST read and use them dynamically:

1. `ATS.md`
   → Contains ATS optimization logic (JS-style logic inside markdown)

2. `PROFILE.md`
   → Base user profile (includes banking experience etc.)

3. `RESUMEGUIDELINES.md`
   → Rules for single-page resume writing

4. `SYSTEMPROMPT.md`
   → Core AI instruction prompt

DO NOT hardcode their content. Read them at runtime using Node.js fs.

---

# 🏗️ TECH STACK

* Next.js (App Router)
* JavaScript (NO TypeScript)
* Plain CSS (NO Tailwind)
* Fetch-based LLM API (OpenRouter compatible)
* No database

---

# 🌐 ROUTES (ONLY TWO)

## 1. `/` (Landing Page)

Purpose:

* Acts as access gate

UI:

* Input field → "Enter Access Token"
* Button → "Enter App"

Valid tokens (HARDCODE):

* `akshatresume`
* `soupyresume`
* `220394`

Behavior:

* If token matches → redirect to `/tech-resume`
* Else → show error

NO authentication system. Just string matching.

---

## 2. `/tech-resume` (MAIN APP)

---

# 🧩 USER FLOW (STRICT)

### Step 1:

User pastes:
→ Job Description (textarea)

Click:
→ "Next"

---

### Step 2:

Dynamically render a form to add **up to 3 projects**

Each project must have:

* Project Name (input)
* Description (textarea)
* Tech Stack (input)
* Deployed Link / GitHub (input)

Controls:

* "Add Project" (max 3)
* "Generate Resume"

---

### Step 3:

On submit → trigger pipeline

---

# 🧠 PIPELINE (CRITICAL LOGIC)

Create a reusable orchestration function:

`runResumePipeline({ jobDescription, projects, mode: "tech" })`

---

## Step 1: Load Context Files

Read:

* PROFILE.md
* ATS.md
* RESUMEGUIDELINES.md
* SYSTEMPROMPT.md

---

## Step 2: Inject Projects

* Merge projects into profile
* PRIORITIZE projects over experience
* Banking experience must be:
  → minimized
  → compressed into 1–2 lines

---

## Step 3: AI GENERATION

Construct prompt using:

* SYSTEMPROMPT.md
* PROFILE.md (modified with projects)
* Job description
* Resume guidelines

Add strict rules:

* Projects MUST be top section
* Strong action verbs
* Quantify impact where possible
* Skills must align with job description
* Remove irrelevant content
* Keep resume within 1 page

---

## Step 4: ATS OPTIMIZATION

* Apply ATS.md logic
* Ensure:

  * Keyword matching
  * Proper section ordering
  * Clean formatting

---

## Step 5: OUTPUT

Return:

* Structured resume (HTML or formatted JSON)

---

# 🎨 UI DESIGN (VERY IMPORTANT)

Style:
→ **Neobrutalism UI**

Requirements:

* Bright, high-contrast colors (yellow, blue, red, black)
* Thick borders (3px–5px solid black)
* Sharp edges (no rounded corners)
* Pixel-style or monospace fonts
* Box shadows (hard offsets, no blur)
* Slight “raw” aesthetic (intentionally bold and loud)

---

## UI COMPONENTS

### Landing Page

* Centered box
* Bold typography
* Thick border input
* Vibrant button

---

### Tech Resume Page

Sections:

1. Job Description Input
2. Dynamic Project Form
3. Generate Button
4. Resume Preview

---

### Resume Preview Component

* Clean but still slightly brutalist
* Must look like a **real ATS resume**
* Sections:

  * Header
  * Projects (top priority)
  * Skills
  * Education
  * Experience (compressed)

---

# ⚙️ FILE STRUCTURE

app/
page.js
tech-resume/page.js

lib/
orchestrator.js
ai.js
ats.js
fileLoader.js

components/
ProjectForm.js
ResumePreview.js

styles/
global.css

---

# 🔁 ORCHESTRATOR DESIGN

Central function:

`runResumePipeline()`

Responsibilities:

* Call AI
* Apply ATS
* Return final result

DO NOT duplicate logic.

---

# 🧠 AI RULES

* Do NOT hallucinate
* Do NOT invent experience
* ALWAYS prioritize relevance
* COMPRESS irrelevant roles (banking)
* EXPAND strong projects
* Maintain professional tone

---

# 🚫 CONSTRAINTS

* Only 2 pages total
* No auth system (just token check)
* No Tailwind
* No TypeScript
* No duplication of pipeline logic
* Must be modular

---

# 🚀 OUTPUT FEATURES

* Editable resume preview
* Copy to clipboard
* Download as PDF (basic implementation acceptable)

---

# 🔚 FINAL INSTRUCTION

Write clean, modular, production-quality JavaScript.

This app should feel like:
→ A focused, high-leverage tool for generating **job-winning tech resumes**

Avoid unnecessary complexity, but design for future extensibility (agents, LangGraph, etc.).

---

