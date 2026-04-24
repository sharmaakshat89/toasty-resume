import { PROFILE } from './profile';
import { logger } from './logger';

type ProfileType = typeof PROFILE;

// ── Skill matching ─────────────────────────────────────────────────────────────
// A skill is considered "valid" if ANY meaningful word (>3 chars) from the
// AI-generated skill matches a word in ANY original skill string.
// This prevents false-positives from exact string comparison while still
// catching hallucinated skills that share zero vocabulary with the profile.

function skillIsFromProfile(aiSkill: string, originalSkills: string[]): boolean {
  const aiWords = aiSkill
    .toLowerCase()
    .split(/[\s\/\-,]+/)
    .filter((w) => w.length > 3);

  for (const orig of originalSkills) {
    const origLower = orig.toLowerCase();

    // Exact match
    if (origLower === aiSkill.toLowerCase()) return true;

    // One-way containment
    if (origLower.includes(aiSkill.toLowerCase()) || aiSkill.toLowerCase().includes(origLower)) {
      return true;
    }

    // Word-level overlap
    const origWords = origLower.split(/[\s\/\-,]+/).filter((w) => w.length > 3);
    const overlap = aiWords.filter((w) => origWords.includes(w));
    if (overlap.length >= 1) return true;
  }

  return false;
}

// ── Role matching ──────────────────────────────────────────────────────────────
function roleIsFromProfile(aiRole: string, originalRoles: string[]): boolean {
  const normalized = aiRole.toLowerCase();
  for (const orig of originalRoles) {
    if (orig.toLowerCase() === normalized) return true;
  }
  const aiWords = normalized.split(/\s+/).filter((w) => w.length > 2);
  for (const orig of originalRoles) {
    const origWords = orig.toLowerCase().split(/\s+/);
    const matches = aiWords.filter((w) => origWords.includes(w));
    if (matches.length >= Math.min(2, aiWords.length)) return true;
  }
  return false;
}

// ── Company matching ───────────────────────────────────────────────────────────
function companyIsFromProfile(aiCompany: string, originalCompanies: string[]): boolean {
  const normalized = aiCompany.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const orig of originalCompanies) {
    const origNorm = orig.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (origNorm === normalized || origNorm.includes(normalized) || normalized.includes(origNorm)) {
      return true;
    }
  }
  return false;
}

// ── sanitizeOutput ─────────────────────────────────────────────────────────────
// Instead of binary pass/fail (which was causing 422 errors), this function
// surgically removes or falls back per-field:
//   • Skills: remove any not traceable to PROFILE.skills, cap at 12
//   • Experience: if role/company not in profile → fallback to original entry
//                 then cap bullets at 4 per role
// Returns a sanitized, always-valid resume object.

export function sanitizeOutput(
  tailored: { summary: string; skills: string[]; experience: ProfileType['experience'] },
  original: ProfileType
): { summary: string; skills: string[]; experience: ProfileType['experience'] } {

  logger.sanitizationStarted();

  // ── Skills sanitization ──────────────────────────────────────────────────
  const originalSkillCount = tailored.skills.length;
  // Allow all skills provided by AI as we instructed it to map enhancement tags
  const validSkills = tailored.skills.slice(0, 15);
  
  // If AI wiped out all skills (catastrophic hallucination), fall back to original
  const finalSkillsBeforeCap = validSkills.length >= 4 ? validSkills : original.skills;

  // Cap at 12 for ATS single-page compliance
  const finalSkills = finalSkillsBeforeCap.slice(0, 12);
  logger.skillsTruncated(originalSkillCount, finalSkills.length);

  // ── Experience sanitization ───────────────────────────────────────────────
  const originalRoles = original.experience.map((e) => e.role);
  const originalCompanies = original.experience.map((e) => e.company);

  const finalExperience = tailored.experience.map((tailoredExp) => {
    // If the role or company doesn't match original, swap in the original entry
    const roleOk = roleIsFromProfile(tailoredExp.role, originalRoles);
    const companyOk = companyIsFromProfile(tailoredExp.company, originalCompanies);

    if (!roleOk || !companyOk) {
      // Find the closest matching original entry by role
      const fallback = original.experience.find((o) =>
        roleIsFromProfile(tailoredExp.role, [o.role])
      ) ?? original.experience[0];

      logger.experienceFallback(tailoredExp.role, `role/company mismatch (${tailoredExp.company}) → using "${fallback.role}" with AI generated points`);
      return {
        ...fallback,
        points: tailoredExp.points.slice(0, 4)
      };
    }

    // Role is valid — just cap bullets at 4
    const originalCount = tailoredExp.points.length;
    const cappedPoints = tailoredExp.points.slice(0, 4);
    logger.bulletsTruncated(tailoredExp.role, originalCount, cappedPoints.length);

    return { ...tailoredExp, points: cappedPoints };
  });

  // Ensure all original experience entries are represented (AI may have dropped some)
  // Add any missing entries from the original (appended, role-capped)
  const representedCompanies = new Set(finalExperience.map((e) => `${e.role}|${e.company}`));
  for (const orig of original.experience) {
    const key = `${orig.role}|${orig.company}`;
    if (!representedCompanies.has(key)) {
      finalExperience.push({ ...orig, points: orig.points.slice(0, 4) });
    }
  }

  return {
    summary: tailored.summary || original.summary,
    skills: finalSkills,
    experience: finalExperience
  };
}

// ── formatATSResume ────────────────────────────────────────────────────────────
// Produces a plain-text ATS-safe representation used for the UI preview.

export function formatATSResume(resume: ProfileType): string {
  let output = '';

  output += `${resume.personal.name}\n`;
  output += `${resume.personal.email} | ${resume.personal.phone} | ${resume.personal.location}\n\n`;

  output += `SUMMARY\n`;
  output += `${resume.summary}\n\n`;

  output += `SKILLS\n`;
  output += `${resume.skills.join(', ')}\n\n`;

  output += `EXPERIENCE\n`;
  for (const exp of resume.experience) {
    output += `${exp.role} | ${exp.company} | ${exp.location} | ${exp.duration}\n`;
    for (const point of exp.points) {
      output += `• ${point}\n`;
    }
    output += '\n';
  }

  output += `EDUCATION\n`;
  for (const edu of resume.education) {
    output += `${edu.degree} | ${edu.institution} | ${edu.location}`;
    if (edu.score) output += ` | ${edu.score}`;
    if (edu.year) output += ` | ${edu.year}`;
    output += '\n';
  }

  return output;
}