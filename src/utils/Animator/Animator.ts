import { KeyframeType, KeyframeValueMap } from '@cntrl-site/sdk';
import { CntrlColor } from '@cntrl-site/color';
import { binSearchInsertAt, createInsert } from '../binSearchInsertAt';
import { rangeMap } from '../rangeMap';

export interface AnimationData<T extends KeyframeType> {
  position: number;
  value: KeyframeValueMap[T];
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

  getFXParams(
    valuesMap: Record<string, number>,
    pos: number
  ): KeyframeValueMap[KeyframeType.FXParams] {
    const keyframes = this.keyframesMap[KeyframeType.FXParams];
    if (!keyframes.length) return valuesMap;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return Object.entries(valuesMap).reduce<Record<string, number>>((acc, [key, fallbackValue]) => {
        acc[key] = keyframe.value[key] ?? fallbackValue;
        return acc;
      }, {});
    }
    const { start, end } = this.getStartEnd<KeyframeType.FXParams>(pos, keyframes);
    return Object.entries(valuesMap).reduce<Record<string, number>>((acc, [key, fallbackValue]) => {
      acc[key] = rangeMap(pos, start.position, end.position, start.value[key] ?? fallbackValue, end.value[key] ?? fallbackValue, true);
      return acc;
    }, {});
  }

  getDimensions(
    values: KeyframeValueMap[KeyframeType.Dimensions],
    pos: number
  ): KeyframeValueMap[KeyframeType.Dimensions] {
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
    values: KeyframeValueMap[KeyframeType.Position],
    pos: number
  ): KeyframeValueMap[KeyframeType.Position] {
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
    values: KeyframeValueMap[KeyframeType.Color],
    pos: number
  ): KeyframeValueMap[KeyframeType.Color] {
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
      color: this.getRangeColor(start, end, pos)
    };
  }

  getBorderColor(
    values: KeyframeValueMap[KeyframeType.BorderColor],
    pos: number
  ): KeyframeValueMap[KeyframeType.BorderColor] {
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
      color: this.getRangeColor(start, end, pos)
    };
  }

  getRadius(
    values: KeyframeValueMap[KeyframeType.BorderRadius],
    pos: number
  ): KeyframeValueMap[KeyframeType.BorderRadius] {
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
    values: KeyframeValueMap[KeyframeType.BorderWidth],
    pos: number
  ): KeyframeValueMap[KeyframeType.BorderWidth] {
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
    values: KeyframeValueMap[KeyframeType.Rotation],
    pos: number
  ): KeyframeValueMap[KeyframeType.Rotation] {
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
    values: KeyframeValueMap[KeyframeType.Opacity],
    pos: number
  ): KeyframeValueMap[KeyframeType.Opacity] {
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

  getScale(
    values: KeyframeValueMap[KeyframeType.Scale],
    pos: number
  ): KeyframeValueMap[KeyframeType.Scale] {
    const keyframes = this.keyframesMap[KeyframeType.Scale];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        scale: keyframe.value.scale
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Scale>(pos, keyframes);
    return {
      scale: rangeMap(pos, start.position, end.position, start.value.scale, end.value.scale, true)
    };
  }

  getBlur(
    values: KeyframeValueMap[KeyframeType.Blur],
    pos: number
  ): KeyframeValueMap[KeyframeType.Blur] {
    const keyframes = this.keyframesMap[KeyframeType.Blur];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        blur: keyframe.value.blur
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Blur>(pos, keyframes);
    return {
      blur: rangeMap(pos, start.position, end.position, start.value.blur, end.value.blur, true)
    };
  }

  getBackdropBlur(
    values: KeyframeValueMap[KeyframeType.BackdropBlur],
    pos: number
  ): KeyframeValueMap[KeyframeType.BackdropBlur] {
    const keyframes = this.keyframesMap[KeyframeType.BackdropBlur];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        backdropBlur: keyframe.value.backdropBlur
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BackdropBlur>(pos, keyframes);
    return {
      backdropBlur: rangeMap(pos, start.position, end.position, start.value.backdropBlur, end.value.backdropBlur, true)
    };
  }

  getTextColor(
    values: KeyframeValueMap[KeyframeType.TextColor],
    pos: number
  ): KeyframeValueMap[KeyframeType.TextColor] {
    const keyframes = this.keyframesMap[KeyframeType.TextColor];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        color: keyframe.value.color
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.TextColor>(pos, keyframes);
    return {
      color: this.getRangeColor(start, end, pos)
    };
  }

  getLetterSpacing(
    values: KeyframeValueMap[KeyframeType.LetterSpacing],
    pos: number
  ): KeyframeValueMap[KeyframeType.LetterSpacing] {
    const keyframes = this.keyframesMap[KeyframeType.LetterSpacing];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        letterSpacing: keyframe.value.letterSpacing
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.LetterSpacing>(pos, keyframes);
    return {
      letterSpacing: rangeMap(
        pos,
        start.position,
        end.position,
        start.value.letterSpacing,
        end.value.letterSpacing,
        true
      )
    };
  }

  getWordSpacing(
    values: KeyframeValueMap[KeyframeType.WordSpacing],
    pos: number
  ): KeyframeValueMap[KeyframeType.WordSpacing] {
    const keyframes = this.keyframesMap[KeyframeType.WordSpacing];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        wordSpacing: keyframe.value.wordSpacing
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.WordSpacing>(pos, keyframes);
    return {
      wordSpacing: rangeMap(
        pos,
        start.position,
        end.position,
        start.value.wordSpacing,
        end.value.wordSpacing,
        true
      )
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

  private getRangeColor(
    start: AnimationData<KeyframeType.Color | KeyframeType.BorderColor | KeyframeType.TextColor>,
    end: AnimationData<KeyframeType.Color | KeyframeType.BorderColor | KeyframeType.TextColor>,
    position: number
  ): string {
    const rangeAmount = rangeMap(position, start.position, end.position, 0, 1, true);
    const startColor = CntrlColor.parse(start.value.color);
    const endColor = CntrlColor.parse(end.value.color);
    const mixedColor = startColor.mix(endColor, rangeAmount);
    return mixedColor.fmt('oklch');
  }
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
    [KeyframeType.Opacity]: [],
    [KeyframeType.Scale]: [],
    [KeyframeType.Blur]: [],
    [KeyframeType.BackdropBlur]: [],
    [KeyframeType.LetterSpacing]: [],
    [KeyframeType.WordSpacing]: [],
    [KeyframeType.TextColor]: [],
    [KeyframeType.FXParams]: []
  };
}
