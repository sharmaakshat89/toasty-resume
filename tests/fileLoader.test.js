import { loadContextFiles } from '../lib/fileLoader';

describe('fileLoader', () => {
  it('loads markdown files and trims them', async () => {
    const data = await loadContextFiles();
    expect(data.ats).toBeDefined();
    expect(data.profile).toBeDefined();
    expect(data.guidelines).toBeDefined();
    expect(data.systemPrompt).toBeDefined();
  });
});
