import type { Game } from '../catalog/catalog.ts';
import { reactionHtml } from './reaction.ts';
import { memoryHtml } from './memory.ts';
import { puzzleHtml } from './puzzle.ts';
import { hexHtml } from './hex.ts';
import { starHtml } from './star.ts';
import { laneHtml } from './lane.ts';
import { kitchenHtml } from './kitchen.ts';
import { hiddenHtml } from './hidden.ts';
import type { LanguageCode } from '../i18n/translations.ts';

export function getMiniGameHtml(key: NonNullable<Game['offlineHtmlKey']>, locale: LanguageCode = 'en', level = 1): string {
  if (key === 'hex') return hexHtml(locale, level);
  if (key === 'star') return starHtml(locale, level);
  if (key === 'lane') return laneHtml(locale, level);
  if (key === 'kitchen') return kitchenHtml(locale, level);
  if (key === 'hidden') return hiddenHtml(locale, level);
  return { reaction: reactionHtml, memory: memoryHtml, puzzle: puzzleHtml }[key](locale);
}
