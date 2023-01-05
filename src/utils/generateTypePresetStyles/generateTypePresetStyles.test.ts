import { generateTypePresetStyles } from './generateTypePresetStyles';
import { presetMock } from './__mock__/presetMock';
import { layoutsMock } from './__mock__/layoutsMock';

describe('generateTypePresetStyles', () => {
  it('generates blocks of styles', () => {
    const styles = generateTypePresetStyles(presetMock, layoutsMock);
    const expectedMedia = (id: string) =>
`@media (min-width: 0px) and (max-width: 767px) {
  .cntrl-preset-${id} {
    font-size: 5.3332999999999995vw;
    line-height: 6.4vw;
    letter-spacing: 0.8vw;
    word-spacing: 0.8vw;
    color: rgba(0, 0, 0, 1);
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .cntrl-preset-${id} {
    font-size: 2.604vw;
    line-height: 3.125vw;
    letter-spacing: 0vw;
    word-spacing: 0vw;
    color: rgba(0, 0, 0, 1);
  }
}
@media (min-width: 1024px) {
  .cntrl-preset-${id} {
    font-size: 1.1111vw;
    line-height: 1.3888vw;
    letter-spacing: 0.06944vw;
    word-spacing: 0.06944vw;
    color: rgba(0, 0, 0, 1);
  }
}`;
    expect(styles).toBe(
`.cntrl-preset-heading01 {
  font-family: Aeonik;
  font-weight: 400;
}
${expectedMedia('heading01')}
.cntrl-preset-heading02 {
  font-family: Aeonik;
  font-style: italic;
  font-weight: 400;
}
${expectedMedia('heading02')}`);
  });
});
