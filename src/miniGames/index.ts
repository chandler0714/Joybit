import type { Game } from '../catalog/catalog.ts';
import { reactionHtml } from './reaction.ts';
import { memoryHtml } from './memory.ts';
import { puzzleHtml } from './puzzle.ts';

export function getMiniGameHtml(key: NonNullable<Game['offlineHtmlKey']>): string {
  return { reaction: reactionHtml, memory: memoryHtml, puzzle: puzzleHtml }[key];
}
