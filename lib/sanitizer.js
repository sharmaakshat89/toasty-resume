export function sanitizeResumeData(llmJson, baseProfile) {
  // 1. Personal Info ALWAYS comes from the base profile
  const personal = baseProfile.personal;
  
  // 2. Skills: cap at 12
  let skills = [];
  if (Array.isArray(llmJson.skills)) {
    skills = llmJson.skills.slice(0, 12);
  } else if (llmJson.skills && typeof llmJson.skills === 'object') {
     // sometimes LLMs return an object instead of array of objects
     skills = Object.entries(llmJson.skills).map(([k, v]) => ({ category: k, items: v }));
     skills = skills.slice(0, 12);
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