import type { Game } from '../catalog/catalog.ts';
import { reactionHtml } from './reaction.ts';
import { memoryHtml } from './memory.ts';
import { puzzleHtml } from './puzzle.ts';
import type { LanguageCode } from '../i18n/translations.ts';

export function getMiniGameHtml(key: NonNullable<Game['offlineHtmlKey']>, locale: LanguageCode = 'en'): string {
  return { reaction: reactionHtml, memory: memoryHtml, puzzle: puzzleHtml }[key](locale);
}
