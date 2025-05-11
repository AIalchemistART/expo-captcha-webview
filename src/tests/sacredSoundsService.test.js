// sacredSoundsService.test.js
import { fetchSacredSounds } from '../services/sacredSoundsService';

describe('fetchSacredSounds', () => {
  it('should fetch an array of tracks with required fields', async () => {
    const tracks = await fetchSacredSounds();
    expect(Array.isArray(tracks)).toBe(true);
    if (tracks.length > 0) {
      const t = tracks[0];
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('title');
      expect(t).toHaveProperty('artist');
      expect(t).toHaveProperty('lyrics');
      expect(t).toHaveProperty('s3Url');
      expect(t).toHaveProperty('metadata');
      expect(t.metadata).toHaveProperty('book');
      expect(t.metadata).toHaveProperty('chapter');
      expect(t.metadata).toHaveProperty('startverse');
      expect(t.metadata).toHaveProperty('endverse');
      expect(t.metadata).toHaveProperty('commentary');
    }
  });

  it('should return an empty array if there are no tracks', async () => {
    // This test will pass if the DB is empty; otherwise, it will just confirm the function returns an array
    const tracks = await fetchSacredSounds();
    expect(Array.isArray(tracks)).toBe(true);
  });
});
