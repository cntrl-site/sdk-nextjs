import { TKeyframeAny } from '@cntrl-site/sdk';

export class Keyframes {
  constructor(
    private keyframes: TKeyframeAny[] = []
  ) {}

  getItemKeyframes(itemId: string) {
    return this.keyframes.filter(kf => kf.itemId === itemId);
  }

  getItemsKeyframes(itemIds: string[]): TKeyframeAny[] {
    const itemIdsSet = new Set(itemIds);
    return this.keyframes.filter(kf => itemIdsSet.has(kf.itemId));
  }
}
