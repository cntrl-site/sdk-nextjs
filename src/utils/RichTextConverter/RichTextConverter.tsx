import { ReactElement, ReactNode } from 'react';
import {
  getLayoutMediaQuery,
  RichText,
  TextTransform,
  TLayout,
  TRichTextItem,
  VerticalAlign
} from '@cntrl-site/sdk';
import { LinkWrapper } from '../../components/LinkWrapper';

interface StyleGroup {
  start: number;
  end: number;
  styles: Style[];
}

interface EntitiesGroup {
  link?: string;
  stylesGroup: StyleGroup[];
  start: number;
  end: number;
}

interface Style {
  name: string;
  value?: string;
}

export const FontStyles: Record<string, Record<string, string>> = {
  'normal': {},
  'bold': { 'font-weight': 'bold' },
  'italic': { 'font-style': 'italic' }
};

export class RichTextConverter {
  toHtml(
    richText: TRichTextItem,
    layouts: TLayout[],
    hasPreset: boolean
  ): [ReactNode[], string] {
    const { text: rawText, blocks = [] } = richText.commonParams;
    const text = Array.from(rawText); // because of emoji
    const root: ReactElement[] = [];
    const styleRules = layouts.reduce<Record<string, string[]>>((rec, layout) => {
      rec[layout.id] = [];
      return rec;
    }, {});
    let currentLineHeight = layouts.reduce<Record<string, string>>((rec, layout) => {
      const styles = richText.layoutParams[layout.id].styles;
      rec[layout.id] = styles?.find(s => s.style === 'LINEHEIGHT')?.value ?? '0';
      return rec;
    }, {});

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex];
      const content = text.slice(block.start, block.end);
      const entities = block.entities!.sort((a, b) => a.start - b.start) ?? [];
      if (content.length === 0) {
        root.push(<div className={`rt_${richText.id}_br_${blockIndex}`}><br /></div>);
        layouts.forEach(l => {
          const lh = RichTextConverter.fromDraftToInline({
            name: 'LINEHEIGHT',
            value: currentLineHeight[l.id]
          });
          styleRules[l.id].push(`.rt_${richText.id}_br_${blockIndex} {${lh}}`);
        });
        continue;
      }
      const newStylesGroup = layouts.map(({ id: layoutId }) => {
        const params = richText.layoutParams[layoutId];
        const styles = params.styles!
          .filter(s => s.start >= block.start && s.end <= block.end)
          .map(s => ({ ...s, start: s.start - block.start, end: s.end - block.start }));
        return ({
          layout: layoutId,
          styles: this.normalizeStyles(styles, entities)
        });
      });
      const sameLayouts = groupBy(newStylesGroup, (item) => this.serializeRanges(item.styles ?? []));
      for (const group of Object.values(sameLayouts)) {
        const blockClass = `rt_${richText.id}-b${blockIndex}_${layouts.map(l => group.some(g => g.layout === l.id) ? '1' : '0').join('')}`;
        const kids: ReactNode[] = [];
        layouts.forEach(l => {
          const ta = richText.layoutParams[l.id].textAlign;
          styleRules[l.id].push(`
            .${blockClass} {
              display: ${group.some(g => g.layout === l.id) ? 'block' : 'none'};
              text-align: ${ta};
              ${hasPreset ? '' : 'line-height: 0;'}
              white-space: normal;
              overflow-wrap: break-word;
            }
          `);
        });
        const item = group[0];
        const entitiesGroups = this.groupEntities(entities, item.styles) ?? [];
        let offset = 0;
        for (const entity of entitiesGroups) {
          const entityKids: ReactNode[] = [];
          if (offset < entity.start) {
            kids.push(content.slice(offset, entity.start).join(''));
            offset = entity.start;
          }
          for (const style of entity.stylesGroup) {
            if (offset < style.start) {
              entityKids.push(content.slice(offset, style.start).join(''));
            }
            entityKids.push(<span key={style.start} className={`s-${style.start}-${style.end}`}>{content.slice(style.start, style.end).join('')}</span>);
            offset = style.end;
          }
          if (offset < entity.end) {
            entityKids.push(content.slice(offset, entity.end).join(''));
            offset = entity.end;
          }
          if (entity.link) {
            kids.push(<LinkWrapper key={entity.start} url={entity.link} >{entityKids}</LinkWrapper>);
            continue;
          }
          kids.push(...entityKids);
        }
        if (offset < content.length) {
          kids.push(content.slice(offset).join(''));
        }
        for (const item of group) {
          const entitiesGroups = this.groupEntities(entities, item.styles) ?? [];
          for (const entitiesGroup of entitiesGroups) {
            if (!entitiesGroup.stylesGroup) continue;
            for (const styleGroup of entitiesGroup.stylesGroup) {
              const lineHeight = styleGroup.styles.find(s => s.name === 'LINEHEIGHT');
              if (lineHeight?.value) {
                currentLineHeight[item.layout] = lineHeight.value;
              }
              styleRules[item.layout].push(`
                .${blockClass} .s-${styleGroup.start}-${styleGroup.end} {
                  ${styleGroup.styles.map(s => RichTextConverter.fromDraftToInline(s)).join('\n')}
                }
              `);
            }
          }
        }
        root.push(<div key={blockClass} className={blockClass}>{kids}</div>);
      }
    }
    const styles = layouts.map(l => `
      ${getLayoutMediaQuery(l.id, layouts)} {
        ${styleRules[l.id].join('\n')}
      }
    `).join('\n');
    return [
      root,
      styles
    ];
  }

  private serializeRanges(ranges: { start: number; end: number; }[]): string {
    return ranges.map(r => `${r.start},${r.end}`).join(' ');
  }

  private normalizeStyles(styles: RichText.Style[], entities: RichText.Entity[]): StyleGroup[] | undefined {
    const styleGroups: StyleGroup[] = [];
    const dividers = [...styles, ...entities].reduce((ds, s) => {
      ds.add(s.start);
      ds.add(s.end);
      return ds;
    }, new Set<number>());
    if (dividers.size === 0) return;
    const edges = Array.from(dividers).sort((a, b) => a - b);
    for (let i = 0; i < edges.length - 1; i += 1) {
      const start = edges[i];
      const end = edges[i + 1];
      const applied = styles.filter(s => Math.max(s.start, start) < Math.min(s.end, end));
      if (applied.length === 0) continue;
      styleGroups.push({
        start,
        end,
        styles: applied.map(s => ({ name: s.style, value: s.value }))
      })
    }

    return styleGroups;
  }

  private groupEntities(entities: RichText.Entity[], styleGroups?: StyleGroup[]): EntitiesGroup[] | undefined {
    const entitiesGroups: EntitiesGroup[] = [];
    if (!styleGroups) return;
    if (entities.length === 0) {
      entitiesGroups.push({
        stylesGroup: styleGroups,
        start: styleGroups[0].start,
        end: styleGroups[styleGroups.length - 1].end
      });
      return entitiesGroups;
    }
    const start = entities[0].start < styleGroups[0].start ? entities[0].start : styleGroups[0].start;
    const end = entities[entities.length - 1].end > styleGroups[styleGroups.length - 1].end ? entities[entities.length - 1].end : styleGroups[styleGroups.length - 1].end;
    const entitiesDividers = entities.reduce((ds, s) => {
      ds.add(s.start);
      ds.add(s.end);
      return ds;
    }, new Set<number>([start, end]));
    const entityDividers = Array.from(entitiesDividers).sort((a, b) => a - b);

    for (let i = 0; i < entityDividers.length - 1; i += 1) {
      const start = entityDividers[i];
      const end = entityDividers[i + 1];
      const entity = entities.find(e => e.start === start);
      entitiesGroups.push({
        stylesGroup: styleGroups.filter(s => s.start >= start && s.end <= end),
        start,
        end,
        ...(entity && { link: entity.data.url })
      });
    }

    return entitiesGroups;
  }

  private static fromDraftToInline(draftStyle: Style): string {
    const { value, name } = draftStyle;
    const map: Record<string, Record<string, string | undefined>> = {
      'COLOR': { 'color': value },
      'TYPEFACE': { 'font-family': `${value}` },
      'FONTSTYLE': value ? { ...FontStyles[value] } : {},
      'FONTWEIGHT': { 'font-weight': value },
      'FONTSIZE': { 'font-size': `${parseFloat(value!) * 100}vw` },
      'LINEHEIGHT': { 'line-height': `${parseFloat(value!) * 100}vw` },
      'LETTERSPACING': { 'letter-spacing': `${parseFloat(value!) * 100}vw` },
      'WORDSPACING': { 'word-spacing': `${parseFloat(value!) * 100}vw` },
      'TEXTTRANSFORM': value ? { 'text-transform': value as TextTransform } : { 'text-transform': TextTransform.None },
      'VERTICALALIGN': value ? { 'vertical-align': value as VerticalAlign } : { 'vertical-align': VerticalAlign.Unset },
      'TEXTDECORATION': { 'text-decoration': value }
    };
    const css = map[name];
    if (!css) {
      return '';
    }
    return Object.entries(css).filter(([, value]) => !!value).map(([prop, value]) => `${prop}: ${value};`).join('\n');
  }
}

function groupBy<I>(items: I[], getKey: (item: I) => PropertyKey): Record<PropertyKey, I[]> {
  const groups: Record<PropertyKey, I[]> = {};
  for (const item of items) {
    const key = getKey(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key]!.push(item);
  }
  return groups;
}
