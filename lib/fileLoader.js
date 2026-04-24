import fs from 'fs/promises';
import path from 'path';

export async function loadContextFiles() {
  const rootDir = process.cwd();
  
  const readTrim = async (filename) => {
    try {
      const content = await fs.readFile(path.join(rootDir, filename), 'utf-8');
      return content.trim().substring(0, 4000); // Token optimization
    } catch (e) {
      console.error(`Failed to read ${filename}:`, e);
      return '';
    }
  };

  return {
    ats: await readTrim('ats.md'),
    profile: await readTrim('profile.md'),
    guidelines: await readTrim('resumeguidelines.md'),
    systemPrompt: await readTrim('systemprompt.md')
  };
}