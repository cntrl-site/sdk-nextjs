import { ImageItem, KeyframeType, VideoItem } from '@cntrl-site/sdk';
import { useKeyframeValue } from './useKeyframeValue';
import { useMemo } from 'react';

const baseVariables = `precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_imgDimensions;
uniform float u_time;
uniform vec2 u_cursor;
varying vec2 v_texCoord;`;

export function useItemFXData(item: ImageItem | VideoItem, sectionId: string): FXData {
  const { fragmentShader: shaderBody, FXControls, FXTextures } = item.commonParams;
  const controls = FXControls ?? [];
  const texturesUrls: string[] = useMemo(() => (FXTextures ?? []), [FXTextures]);
  const controlsVariables = controls.map((c) => `uniform ${c.type} ${c.shaderParam};`)
    .join('\n');
  const patternsVariables = texturesUrls
    .map((_, i) => `uniform sampler2D ${mediaEffectPatternUniformNames(i).tex};\nuniform vec2 ${mediaEffectPatternUniformNames(i).dim};`)
    .join('\n');
  const fragmentShader = `${baseVariables}\n${controlsVariables}\n${patternsVariables}\n${shaderBody}`;
  const controlsValues = useKeyframeValue(
    item,
    KeyframeType.FXParams,
    () => {
      const defaultValue = controls.reduce<Record<string, ControlValue>>((acc, control) => {
        if (Array.isArray(control.value)) {
          acc[control.shaderParam] = control.value[0];
        } else {
          acc[control.shaderParam] = control.value;
        }
        return acc;
      }, {});
      return defaultValue;
    },
    (animator, scroll, value) => animator.getFXParams(value, scroll),
    sectionId,
  );
  return {
    fragmentShader,
    controlsValues,
    texturesUrls
  };
}

function mediaEffectPatternUniformNames(slotIndex: number): {
  tex: string;
  dim: string;
} {
  if (slotIndex === 0) {
    return { tex: 'u_pattern', dim: 'u_patternDimensions' };
  }
  const n = slotIndex + 1;
  return { tex: `u_pattern${n}`, dim: `u_pattern${n}Dimensions` };
}

type FXData = {
  fragmentShader: string;
  controlsValues: Record<string, ControlValue>;
  texturesUrls: string[];
}

type ControlValue = number;
