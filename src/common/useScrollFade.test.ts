import { scrollFadeProgress } from './useScrollFade';

describe('scrollFadeProgress', () => {
  it('has not faded while a third of the element or more is left under the screen\'s top', () => {
    expect(scrollFadeProgress(0, 600, 900)).toBe(0);
    expect(scrollFadeProgress(-400, 200, 900)).toBe(0);
  });

  it('fades as the last third leaves, all the way once it is gone', () => {
    expect(scrollFadeProgress(-500, 100, 900)).toBeCloseTo(0.5);
    expect(scrollFadeProgress(-450, 150, 900)).toBeCloseTo(0.25);
    expect(scrollFadeProgress(-600, 0, 900)).toBe(1);
    expect(scrollFadeProgress(-700, -100, 900)).toBe(1);
  });

  it('counts the screen an element taller than it fills, not the element', () => {
    expect(scrollFadeProgress(-1000, 1000, 900)).toBe(0);
    expect(scrollFadeProgress(-1700, 300, 900)).toBe(0);
    expect(scrollFadeProgress(-1850, 150, 900)).toBeCloseTo(0.5);
  });

  it('has not faded entering from below', () => {
    expect(scrollFadeProgress(800, 1400, 900)).toBe(0);
  });
});
