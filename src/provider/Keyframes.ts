import { TKeyframeAny } from '@cntrl-site/sdk';

export class Keyframes {
  constructor(
    private keyframes: TKeyframeAny[] = []
  ) {}

  getItemKeyframes(itemId: string) {
    return this.keyframes.filter(kf => kf.itemId === itemId);
  }
}
