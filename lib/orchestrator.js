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
    ${JSON.stringify(baseProfile, null, 2)}
    
    DYNAMIC PROJECTS:
    ${JSON.stringify(projects, null, 2)}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    Return the optimized JSON matching the structure perfectly.
  `;

  let aiResult = await generateResumeAI(prompt, systemInstruction);
  
  // Clean potential markdown wrapper
  aiResult = aiResult.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
  // Ensure it starts with '{' and ends with '}'
  const startIdx = aiResult.indexOf('{');
  const endIdx = aiResult.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
      aiResult = aiResult.substring(startIdx, endIdx + 1);
  }
  
  let parsedJson;
  try {
    parsedJson = JSON.parse(aiResult);
  } catch (e) {
    console.error("Failed to parse JSON, falling back", e);
    // basic fallback
    parsedJson = { 
      skills: baseProfile.skills.map(s => ({category: 'Skill', items: [s]})), 
      projects: projects.map(p => ({ title: p.name, tech: p.stack, link: p.link, points: [p.description] })), 
      experience: baseProfile.experience 
    };
  }

  // Sanitize and Build
  const finalData = sanitizeResumeData(parsedJson, baseProfile);
  const finalHtml = buildResumeHTML(finalData);

  return finalHtml;
}