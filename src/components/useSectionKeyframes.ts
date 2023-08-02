import { KeyframeType, TKeyframe, TKeyframeAny, TLayout, getLayoutMediaQuery } from '@cntrl-site/sdk';
import groupBy from 'lodash.groupby';
import { AnimationLayout } from './SectionAnimations';

type AnimationStructure = {
  [layoutId: string]: {
    track: AnimationTrack;
    items: Record<string, KeyframeGroups>;
  };
}

type KeyframeStyleMap = {
  [T in KeyframeType]: (kf: TKeyframe<T>) => string;
};

interface AnimationTrack {
  start: number;
  end: number;
  readonly length: number;
  getKeyframePosition(pos: number): string;
}

interface KeyframeGroups {
  position: TKeyframeAny[];
  dimension: TKeyframeAny[];
  item: TKeyframeAny[];
  rotation: TKeyframe<KeyframeType.Rotation>[];
  scale: TKeyframe<KeyframeType.Scale>[];
}

const keyframeStyleMap: KeyframeStyleMap = {
  [KeyframeType.BorderColor]: kf => `border-color: ${kf.value.color};`,
  [KeyframeType.BorderRadius]: kf => `border-radius: ${kf.value.radius * 100}vw;`,
  [KeyframeType.BorderWidth]: kf => `border-width: ${kf.value.borderWidth * 100}vw;`,
  [KeyframeType.Color]: kf => `color: ${kf.value.color};`,
  [KeyframeType.Dimensions]: kf => `width: ${kf.value.width * 100}vw; height: ${kf.value.height * 100}vw;`,
  [KeyframeType.Opacity]: kf => `opacity: ${kf.value.opacity};`,
  [KeyframeType.Position]: kf => `top: ${kf.value.left * 100}vw; left: ${kf.value.left * 100}vw;`,
  [KeyframeType.Rotation]: kf => `transform: rotate(${kf.value.angle}deg);`,
  [KeyframeType.Scale]: kf => `transform: scale(${kf.value.scale});`,
};

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  usage: 'sort',
  numeric: true
});

interface UseSectionKeyframesReturn {
  // layout ID -> animation styles
  styles: string;
  getItemClass: (itemId: string) => string;
  getItemScaleClass: (itemId: string) => string;
  getItemRotateClass: (itemId: string) => string;
}

interface UseSectionKeyframesParams {
  keyframes?: TKeyframeAny[];
  layouts: TLayout[];
}

type SectionAnimations = [
  styles: string,
  layouts: AnimationLayout[]
];

export function getSectionAnimations({ keyframes, layouts }: UseSectionKeyframesParams): SectionAnimations | undefined {
  if (!keyframes) return undefined;
  const struct = getAnimationStructure(keyframes);
  const blocks: string[] = [];
  const animLayouts: AnimationLayout[] = [];
  const sortedLayouts = layouts.slice().sort((l1, l2) => l1.startsWith - l2.startsWith);
  for (const [layoutId, { track, items }] of Object.entries(struct)) {
    const layoutIndex = sortedLayouts.findIndex(l => l.id === layoutId);
    if (layoutIndex === -1) continue;
    const currlayout = layouts[layoutIndex];
    const nextLayout = layouts[layoutIndex + 1];
    const media = getLayoutMediaQuery(layoutId, layouts);
    animLayouts.push({
      startPosition: track.start,
      endPosition: track.end,
      minWidth: currlayout.startsWith,
      maxWidth: nextLayout?.startsWith ?? Number.MAX_SAFE_INTEGER
    });
    for (const [itemId, itemData] of Object.entries(items)) {
      blocks.push(`${media} {
        ${genItemAnimations(itemId, itemData, track)}
      }`);
    }
  }
  return [blocks.join('\n'), animLayouts];
}

function genItemAnimations(
  itemId: string,
  kfGroups: KeyframeGroups,
  track: AnimationTrack
): string {
  const blocks: string[] = [`
    .${getItemPositionClass(itemId)},
    .${getItemDimensionClass(itemId)},
    .${getItemClass(itemId)},
    .${getItemScaleClass(itemId)},
    .${getItemRotateClass(itemId)} {
      animation-duration: 1000s;
      animation-timing-function: linear;
      animation-play-state: paused;
      animation-delay: calc(var(--section-animation-position, 0) * 1s);
      animation-fill-mode: both;
      animation-iteration-count: 1;
    }
  `];
  if (kfGroups.position.length > 0) {
    const animationName = `item-${itemId}-area`;
    blocks.push(`.${getItemPositionClass(itemId)} { animation-name: ${animationName}; }`);
    blocks.push(`@keyframes ${animationName} {
      ${genKeyframesRuleContent(kfGroups.position, track)}
    }`);
  }
  if (kfGroups.dimension.length > 0) {
    const animationName = `item-${itemId}-area`;
    blocks.push(`.${getItemDimensionClass(itemId)} { animation-name: ${animationName}; }`);
    blocks.push(`@keyframes ${animationName} {
      ${genKeyframesRuleContent(kfGroups.dimension, track)}
    }`);
  }
  if (kfGroups.item.length > 0) {
    const animationName = `item-${itemId}-animation`;
    blocks.push(`.${getItemClass(itemId)} { animation-name: ${animationName}; }`);
    blocks.push(`@keyframes ${animationName} {
      ${genKeyframesRuleContent(kfGroups.item, track)}
    }`);
  }
  if (kfGroups.scale.length > 0) {
    const animationName = `item-${itemId}-scale`;
    blocks.push(`.${getItemScaleClass(itemId)} { animation-name: ${animationName}; }`);
    blocks.push(`@keyframes ${animationName} {
      ${genKeyframesRuleContent(kfGroups.scale, track)}
    }`);
  }
  if (kfGroups.rotation.length > 0) {
    const animationName = `item-${itemId}-rotation`;
    blocks.push(`.${getItemRotateClass(itemId)} { animation-name: ${animationName}; }`);
    blocks.push(`@keyframes ${animationName} {
      ${genKeyframesRuleContent(kfGroups.rotation, track)}
    }`);
  }
  return blocks.join('\n');
}

function genKeyframesRuleContent(kfs: TKeyframeAny[], track: AnimationTrack): string {
  const groups = Object.entries(groupBy(kfs, kf => track.getKeyframePosition(kf.position)))
    .sort(([p1], [p2]) => collator.compare(p1, p2));
  const first = groups[0];
  const last = groups[groups.length - 1];
  if (first[0] !== '0.00%') {
    groups.unshift(['0.00%', first[1]]);
  }
  if (last[0] !== '100.00%') {
    groups.unshift(['100.00%', last[1]]);
  }
  const blocks = groups.map(([pos, kfs]) => {
    // @ts-ignore redo TKeyframeAny as union
    return `${pos} { ${kfs.map(kf => keyframeStyleMap[kf.type](kf)).join(' ')} }`;
  });
  return blocks.join('\n');
}

function getAnimationStructure(kfs: TKeyframeAny[]): AnimationStructure {
  const byLayout = groupBy(kfs, kf => kf.layoutId);
  return Object.fromEntries(
    Object.entries(byLayout)
      .map<[string, AnimationStructure[string]]>(([layoutId, kfs]) => {
        return [layoutId, {
          track: getAnimationTrack(kfs),
          items: Object.fromEntries(
            Object.entries(groupBy(kfs, kf => kf.itemId))
              .map(([itemId, kfs]) => [itemId, getKeyframeGroups(kfs)])
          )
        }];
      })
  );
}

function getKeyframeGroups(kfs: TKeyframeAny[]): KeyframeGroups {
  const groups: KeyframeGroups = {
    position: [],
    dimension: [],
    item: [],
    rotation: [],
    scale: []
  };
  for (const kf of kfs) {
    if (isKeyframeOfType(kf, KeyframeType.Scale)) {
      groups.scale?.push(kf);
      continue;
    }
    if (isKeyframeOfType(kf, KeyframeType.Rotation)) {
      groups.rotation?.push(kf);
      continue;
    }
    if (isKeyframeOfType(kf, KeyframeType.Position)) {
      groups.position.push(kf);
      continue;
    }
    if (isKeyframeOfType(kf, KeyframeType.Dimensions)) {
      groups.dimension.push(kf);
      continue;
    }
    groups.item.push(kf);
  }
  return groups;
}

function getAnimationTrack([firstKf, ...kfs]: TKeyframeAny[]): AnimationTrack {
  let start = firstKf.position;
  let end = firstKf.position;
  for (const kf of kfs) {
    start = Math.min(start, kf.position);
    end = Math.max(end, kf.position);
  }
  const length = end - start;
  return {
    start,
    end,
    get length() { return length; },
    getKeyframePosition(pos) {
      const value = ((pos * 100 - start * 100) / (length * 100)) * 100;
      const normValue = Math.max(0, Math.min(value, 100));
      return `${normValue.toFixed(2)}%`;
    }
  };
}

export function getItemPositionClass(itemId: string): string {
  return `item-${itemId}-position`;
}

export function getItemDimensionClass(itemId: string): string {
  return `item-${itemId}-dimension`;
}

export function getItemClass(itemId: string): string {
  return `item-${itemId}`;
}

export function getItemScaleClass(itemId: string): string {
  return `item-${itemId}-scale`;
}

export function getItemRotateClass(itemId: string): string {
  return `item-${itemId}-rotate`;
}

function isKeyframeOfType<T extends KeyframeType>(kf: TKeyframeAny, type: T): kf is TKeyframe<T> {
  return kf.type === type;
}
