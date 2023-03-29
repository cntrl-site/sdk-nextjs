import { generateTypePresetStyles } from './generateTypePresetStyles';
import { presetMock } from './__mock__/presetMock';
import { layoutsMock } from './__mock__/layoutsMock';

describe('generateTypePresetStyles', () => {
  it('generates blocks of styles', () => {
    const styles = generateTypePresetStyles(presetMock, layoutsMock);
    const expectedMedia = (id: string) =>
`@media (min-width: 0px) and (max-width: 767px) {
  .cntrl-preset-${id} {
    font-size: 6.4vw;
    line-height: 9.6vw;
    letter-spacing: 0.26666666666666666vw;
    word-spacing: 0.26666666666666666vw;
    color: rgba(0, 0, 0, 1);
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .cntrl-preset-${id} {
    font-size: 3.125vw;
    line-height: 4.6875vw;
    letter-spacing: 0.13020833333333331vw;
    word-spacing: 0.13020833333333331vw;
    color: rgba(0, 0, 0, 1);
  }
}
@media (min-width: 1024px) {
  .cntrl-preset-${id} {
    font-size: 1.6666666666666667vw;
    line-height: 2.5vw;
    letter-spacing: 0.06944444444444445vw;
    word-spacing: 0.06944444444444445vw;
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
