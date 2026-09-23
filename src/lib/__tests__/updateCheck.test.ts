import { describe, expect, it } from 'vitest';
import { isNewerBuild } from '../version/updateCheck';

describe('isNewerBuild', () => {
  it('reports a different build number as newer', () => {
    expect(isNewerBuild('1758000000000', '1758000123456')).toBe(true);
  });

  it('reports an identical build number as not newer', () => {
    expect(isNewerBuild('1758000000000', '1758000000000')).toBe(false);
  });
});
