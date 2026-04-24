import { getBaseProfile } from '../lib/profileParser';

describe('profileParser', () => {
  it('extracts the PROFILE object from the string', async () => {
    const profile = await getBaseProfile();
    expect(profile.personal.name).toBe("Akshat Sharma");
    expect(profile.experience.length).toBeGreaterThan(0);
  });
});
