import { KeyframeType, TKeyframeValueMap } from '@cntrl-site/sdk';
import { binSearchInsertAt, createInsert } from '../binSearchInsertAt';

export interface AnimationData<T extends KeyframeType> {
  position: number;
  value: TKeyframeValueMap[T];
  type: T;
}

interface PositionKeyframes<T extends KeyframeType> {
  start: AnimationData<T>;
  end: AnimationData<T>;
}

export type KeyframesMap = {
  [T in KeyframeType]: AnimationData<T>[];
};

const compare = (lhs: { position: number }, rhs: { position: number }) => lhs.position - rhs.position;
const insertBin = createInsert(binSearchInsertAt, compare);

export class Animator {
  private static pushKeyframeToMap<T extends KeyframeType>(keyframe: AnimationData<T>, map: KeyframesMap): void {
    insertBin(map[keyframe.type], keyframe);
  }
  private keyframesMap: KeyframesMap = createKeyframesMap();
  constructor(
    private keyframes: AnimationData<KeyframeType>[]
  ) {
    this.fillKeyframesMap();
  }

  getDimensions(
    values: TKeyframeValueMap[KeyframeType.Dimensions],
    pos: number
  ): TKeyframeValueMap[KeyframeType.Dimensions] {
    const keyframes = this.keyframesMap[KeyframeType.Dimensions];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        width: keyframe.value.width,
        height: keyframe.value.height
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Dimensions>(pos, keyframes);
    return {
      width: rangeMap(pos, start.position, end.position, start.value.width, end.value.width, true),
      height: rangeMap(pos, start.position, end.position, start.value.height, end.value.height, true)
    };
  }

  getPositions(
    values: TKeyframeValueMap[KeyframeType.Position],
    pos: number
  ): TKeyframeValueMap[KeyframeType.Position] {
    const keyframes = this.keyframesMap[KeyframeType.Position];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        left: keyframe.value.left,
        top: keyframe.value.top
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Position>(pos, keyframes);
    return {
      left: rangeMap(pos, start.position, end.position, start.value.left, end.value.left, true),
      top: rangeMap(pos, start.position, end.position, start.value.top, end.value.top, true)
    };
  }

  getColor(
    values: TKeyframeValueMap[KeyframeType.Color],
    pos: number
  ): TKeyframeValueMap[KeyframeType.Color] {
    const keyframes = this.keyframesMap[KeyframeType.Color];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        color: keyframe.value.color
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Color>(pos, keyframes);
    return {
      color: this.getRgba(start, end, pos)
    };
  }

  getBorderColor(
    values: TKeyframeValueMap[KeyframeType.BorderColor],
    pos: number
  ): TKeyframeValueMap[KeyframeType.BorderColor] {
    const keyframes = this.keyframesMap[KeyframeType.BorderColor];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        color: keyframe.value.color
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BorderColor>(pos, keyframes);
    return {
      color: this.getRgba(start, end, pos)
    };
  }

  getRadius(
    values: TKeyframeValueMap[KeyframeType.BorderRadius],
    pos: number
  ): TKeyframeValueMap[KeyframeType.BorderRadius] {
    const keyframes = this.keyframesMap[KeyframeType.BorderRadius];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        radius: keyframe.value.radius
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BorderRadius>(pos, keyframes);
    return {
      radius: rangeMap(pos, start.position, end.position, start.value.radius, end.value.radius, true)
    };
  }

  getBorderWidth(
    values: TKeyframeValueMap[KeyframeType.BorderWidth],
    pos: number
  ): TKeyframeValueMap[KeyframeType.BorderWidth] {
    const keyframes = this.keyframesMap[KeyframeType.BorderWidth];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        borderWidth: keyframe.value.borderWidth
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BorderWidth>(pos, keyframes);
    return {
      borderWidth: rangeMap(pos, start.position, end.position, start.value.borderWidth, end.value.borderWidth, true)
    };
  }

  getRotation(
    values: TKeyframeValueMap[KeyframeType.Rotation],
    pos: number
  ): TKeyframeValueMap[KeyframeType.Rotation] {
    const keyframes = this.keyframesMap[KeyframeType.Rotation];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        angle: keyframe.value.angle
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Rotation>(pos, keyframes);
    return {
      angle: rangeMap(pos, start.position, end.position, start.value.angle, end.value.angle, true)
    };
  }

  getOpacity(
    values: TKeyframeValueMap[KeyframeType.Opacity],
    pos: number
  ): TKeyframeValueMap[KeyframeType.Opacity] {
    const keyframes = this.keyframesMap[KeyframeType.Opacity];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        opacity: keyframe.value.opacity
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Opacity>(pos, keyframes);
    return {
      opacity: rangeMap(pos, start.position, end.position, start.value.opacity, end.value.opacity, true)
    };
  }

  getStartEnd<T extends KeyframeType>(position: number, keyframes: AnimationData<T>[]): PositionKeyframes<T> {
    const index = binSearchInsertAt(keyframes, { position }, compare);
    const end = index === keyframes.length ? index - 1 : index;
    const start = end === 0 ? end : end - 1;
    return { start: keyframes[start], end: keyframes[end] };
  }

  private fillKeyframesMap() {
    this.keyframesMap = createKeyframesMap();
    for (const keyframe of this.keyframes) {
      Animator.pushKeyframeToMap(keyframe, this.keyframesMap);
    }
  }

  private getRgba(
    start: AnimationData<KeyframeType.Color | KeyframeType.BorderColor>,
    end: AnimationData<KeyframeType.Color | KeyframeType.BorderColor>,
    position: number
  ): string {
    const [startR, startG, startB, startA] = parseRgba(start.value.color);
    const [endR, endG, endB, endA] = parseRgba(end.value.color);
    const r = rangeMap(position, start.position, end.position, startR, endR, true);
    const g = rangeMap(position, start.position, end.position, startG, endG, true);
    const b = rangeMap(position, start.position, end.position, startB, endB, true);
    const a = rangeMap(position, start.position, end.position, startA, endA, true);
    return `rgba(${r},${g},${b},${a})`;
  }
}

const reRgba = /^rgba?\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *(\d+(?:\.\d+)?))? *\)$/i;

function parseRgba(color: string): [r: number, g: number, b: number, a: number] {
  const match = reRgba.exec(color);
  if (!match) return [0, 0, 0, 1];
  const [, r, g, b, a] = match;
  return [parseInt(r, 10), parseInt(g, 10), parseInt(b, 10), a ? parseFloat(a) : NaN];
}

function createKeyframesMap(): KeyframesMap {
  return {
    [KeyframeType.Dimensions]: [],
    [KeyframeType.Position]: [],
    [KeyframeType.BorderWidth]: [],
    [KeyframeType.BorderRadius]: [],
    [KeyframeType.Color]: [],
    [KeyframeType.Rotation]: [],
    [KeyframeType.BorderColor]: [],
    [KeyframeType.Opacity]: []
  };
}

function rangeMap(
  n: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  withinBounds: boolean = false
): number {
  const mapped = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if (withinBounds && n < start1) return start2;
  if (withinBounds && n > stop1) return stop2;
  return mapped;
}
