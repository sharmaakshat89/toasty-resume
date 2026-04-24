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