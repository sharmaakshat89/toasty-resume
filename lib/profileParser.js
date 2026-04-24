import fs from 'fs/promises';
import path from 'path';

export async function getBaseProfile() {
  const rootDir = process.cwd();
  try {
    const content = await fs.readFile(path.join(rootDir, 'profile.md'), 'utf-8');
    // Extract the object part of `export const PROFILE = { ... };`
    const jsonStrMatch = content.match(/export const PROFILE = ([\s\S]+?);/);
    if (jsonStrMatch && jsonStrMatch[1]) {
      // Use Function constructor as a safer eval to parse JS object literal to JSON
      const profileData = new Function('return ' + jsonStrMatch[1])();
      return profileData;
    }
    throw new Error('Could not match PROFILE object');
  } catch (e) {
    console.error('Failed to parse profile.md:', e);
    // Fallback empty profile
    return { personal: { name: "User", email: "", phone: "", location: "" }, summary: "", skills: [], experience: [], education: [] };
  }
}