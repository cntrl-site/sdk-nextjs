import { KeyframeType, TArticleItemAny } from '@cntrl-site/sdk/src/index';
import { DependencyList, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { useCurrentLayout } from './useCurrentLayout';
import { KeyframesContext } from '../provider/KeyframesContext';
import { AnimationData, Animator } from '../utils/Animator/Animator';

export type AnimatorGetter<T> = (animator: Animator, scroll: number, value: T) => T;
type ItemParamGetter<T> = (item: TArticleItemAny, layoutId: string | undefined) => T;
const emptyDeps: DependencyList = [];

export const useKeyframeValue = <T>(
  item: TArticleItemAny,
  itemParamsGetter: ItemParamGetter<T>,
  animatorGetter: AnimatorGetter<T>,
  deps: DependencyList = emptyDeps
) => {
  const animatorGetterRef = useRef(animatorGetter);
  const itemParamsGetterRef = useRef(itemParamsGetter);

  animatorGetterRef.current = animatorGetter;
  itemParamsGetterRef.current = itemParamsGetter;

  const articleRectObserver = useContext(ArticleRectContext);
  const layoutId = useCurrentLayout();
  const keyframesRepo = useContext(KeyframesContext);
  const keyframes = keyframesRepo.getItemKeyframes(item.id);
  const paramValue = useMemo<T>(() => {
    return itemParamsGetterRef.current(item, layoutId);
  }, [item, layoutId, ...deps]);
  const [adjustedValue, setAdjustedValue] = useState<T>(paramValue);
  const animator = useMemo(() => {
    if (!layoutId || !keyframes.length) return;
    const animationData = keyframes
      .filter(k => k.layoutId === layoutId)
      .map<AnimationData<KeyframeType>>(({ position, type, value }) => ({
        position,
        type,
        value
      }));
    return new Animator(animationData);
  }, [keyframes, layoutId]);

  useEffect(() => {
    setAdjustedValue(paramValue);
  }, [paramValue]);

  useEffect(() => {
    if (!animator || !articleRectObserver) return;
    return articleRectObserver.on('resize', () => {
      const scroll = articleRectObserver.scroll;
      const newValue = animatorGetterRef.current(animator, scroll, paramValue);
      setAdjustedValue(newValue);
    });
  }, [animator, articleRectObserver]);

  useEffect(() => {
    if (!animator || !articleRectObserver) return;
    return articleRectObserver.on('scroll', () => {
      const scroll = articleRectObserver.scroll;
      const newValue = animatorGetterRef.current(animator, scroll, paramValue);
      setAdjustedValue(newValue);
    });
  }, [animator, articleRectObserver]);
  return adjustedValue;
};
