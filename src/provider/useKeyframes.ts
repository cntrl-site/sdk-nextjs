import { TKeyframeAny } from '@cntrl-site/sdk';
import { Keyframes } from './Keyframes';

export const useKeyframes = (keyframes: TKeyframeAny[]) => {
  return new Keyframes(keyframes);
};
