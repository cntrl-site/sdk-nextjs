import { KeyframeAny } from '@cntrl-site/sdk';

export class Keyframes {
  constructor(
    private keyframes: KeyframeAny[] = []
  ) {}

  getItemKeyframes(itemId: string) {
    return this.keyframes.filter(kf => kf.itemId === itemId);
  }
}
