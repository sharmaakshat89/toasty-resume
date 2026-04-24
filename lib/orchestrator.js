'use server'

import { loadContextFiles } from './fileLoader';
import { generateResumeAI } from './ai';

function extractKeywords(jobDesc) {
  const commonTech = ['React', 'Node.js', 'Next.js', 'JavaScript', 'TypeScript', 'Python', 'AWS', 'SQL', 'CSS', 'HTML', 'Git', 'Docker'];
  return commonTech.filter(tech => jobDesc.toLowerCase().includes(tech.toLowerCase()));
}

export async function generateResumeAction(jobDescription, projects) {
  const context = await loadContextFiles();
  const keywords = extractKeywords(jobDescription);
  
  // First Pass: Structure and tech mode injection
  const systemInstruction1 = `
    ${context.systemPrompt}
    \nGUIDELINES:\n${context.guidelines}
    
    STRICT RULES:
    1. Mode: "tech".
    2. Projects must be listed FIRST and highly detailed.
    3. Skills must align with these extracted keywords: ${keywords.join(', ')}.
    4. Non-tech experience (e.g., banking) MUST be compressed to strictly 1-2 lines.
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

  const prompt1 = `
    PROFILE:
    ${context.profile}
    
    DYNAMIC PROJECTS:
    ${JSON.stringify(projects, null, 2)}
    
    JOB DESCRIPTION:
    ${jobDescription}
  `;

  let firstPassHtml = await generateResumeAI(prompt1, systemInstruction1);
  
  // Second Pass: ATS Refinement
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
  
  let finalHtml = await generateResumeAI(firstPassHtml, systemInstruction2);

  // Validation & Cleanup
  finalHtml = finalHtml.replace(/```html/gi, '').replace(/```/g, '').trim();
  
  if (!finalHtml.startsWith('<')) {
    console.log("HTML validation failed, retrying once...");
    finalHtml = await generateResumeAI(`Fix this to be ONLY valid HTML, no conversational text:\n${finalHtml}`, "Return ONLY valid HTML starting with <div> or <section>. No markdown wrappers.");
    finalHtml = finalHtml.replace(/```html/gi, '').replace(/```/g, '').trim();
  }

  return finalHtml;
}