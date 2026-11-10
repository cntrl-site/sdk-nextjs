import { scrollFadeProgress } from './useScrollFade';

describe('scrollFadeProgress', () => {
  it('has not faded while all of the element is on the screen', () => {
    expect(scrollFadeProgress(0, 600, 900)).toBe(0);
    expect(scrollFadeProgress(100, 700, 900)).toBe(0);
  });

  it('fades from the first pixel scrolled off the screen\'s top, all the way once it is gone', () => {
    expect(scrollFadeProgress(-150, 450, 900)).toBeCloseTo(0.25);
    expect(scrollFadeProgress(-300, 300, 900)).toBeCloseTo(0.5);
    expect(scrollFadeProgress(-600, 0, 900)).toBe(1);
    expect(scrollFadeProgress(-700, -100, 900)).toBe(1);
  });

  it('counts the screen an element taller than it fills, not the element', () => {
    expect(scrollFadeProgress(-1000, 1000, 900)).toBe(0);
    expect(scrollFadeProgress(-1100, 900, 900)).toBe(0);
    expect(scrollFadeProgress(-1550, 450, 900)).toBeCloseTo(0.5);
  });

  it('has not faded entering from below', () => {
    expect(scrollFadeProgress(800, 1400, 900)).toBe(0);
  });
});
