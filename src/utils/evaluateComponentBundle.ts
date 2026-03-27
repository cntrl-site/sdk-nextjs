import React from 'react';
import ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import { Component as TComponent } from '@cntrl-site/components';
import * as componentUtils from '@cntrl-site/components/utils';

let globalsInitialized = false;

function ensureGlobals() {
  if (globalsInitialized) return;
  (globalThis as any).__CNTRL_REACT__ = React;
  (globalThis as any).__CNTRL_REACT_DOM__ = ReactDOM;
  (globalThis as any).__CNTRL_JSX_RUNTIME__ = jsxRuntime;
  (globalThis as any).__CNTRL_COMPONENT_UTILS__ = componentUtils;
  globalsInitialized = true;
}

function transformEsmToEvaluatable(code: string): string {
  let transformed = code;
  let hasDefault = false;

  transformed = transformed.replace(
    /export\s*\{\s*(\w+)\s+as\s+default\s*\}\s*;?/g,
    (_, name) => { hasDefault = true; return `var __cntrl_default_export__ = ${name};`; }
  );

  transformed = transformed.replace(
    /export\s+default\s+/g,
    () => { hasDefault = true; return 'var __cntrl_default_export__ = '; }
  );

  transformed = transformed.replace(
    /export\s*\{\s*([^}]*)\}\s*;?/g,
    (_, names) => {
      if (!hasDefault) {
        const firstName = names.split(',')[0].trim().split(/\s+/)[0];
        if (firstName) {
          hasDefault = true;
          return `var __cntrl_default_export__ = ${firstName};`;
        }
      }
      return '';
    }
  );

  return `${transformed}\nreturn __cntrl_default_export__;`;
}

export function evaluateComponentBundle(
  bundleCode: string
): (props: any) => React.ReactElement {
  ensureGlobals();
  const evaluatable = transformEsmToEvaluatable(bundleCode);
  const fn = new Function(evaluatable);
  return fn();
}

const resolvedCache = new Map<string, (props: any) => React.ReactElement>();

export function resolveCustomComponents(
  bundles: Record<string, string>,
  schemas?: Record<string, Record<string, unknown>>
): Map<string, TComponent> {
  const result = new Map<string, TComponent>();
  for (const [id, code] of Object.entries(bundles)) {
    try {
      let element = resolvedCache.get(id);
      if (!element) {
        element = evaluateComponentBundle(code);
        resolvedCache.set(id, element);
      }
      result.set(id, {
        id,
        name: id,
        element,
        schema: schemas?.[id] ?? {}
      } as TComponent);
    } catch (err) {
      console.error(`Failed to evaluate custom component bundle "${id}":`, err);
    }
  }
  return result;
}
