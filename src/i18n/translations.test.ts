import assert from 'node:assert/strict';
import test from 'node:test';
import { LANGUAGE_CODES, LANGUAGE_NAMES, resolveLocale, translate, translations } from './translations.ts';

test('supports exactly seven release languages and falls back to English', () => {
  assert.deepEqual(LANGUAGE_CODES, ['en', 'ja', 'ko', 'fr', 'es', 'ru', 'de']);
  assert.equal(resolveLocale('fr-CA'), 'fr');
  assert.equal(resolveLocale('JA_jp'), 'ja');
  assert.equal(resolveLocale('zh-CN'), 'en');
  assert.equal(resolveLocale(''), 'en');
  assert.deepEqual(Object.keys(LANGUAGE_NAMES), LANGUAGE_CODES);
});

test('every released language has complete nonempty copy and substitutions', () => {
  for (const values of Object.values(translations)) {
    assert.equal(values.length, 7);
    for (const value of values) assert.ok(value.trim().length > 0);
  }
  assert.equal(translate('en', 'emptyCatalog'), 'No games available');
  assert.equal(translate('fr', 'settingsTitle'), 'Paramètres');
  assert.equal(translate('de', 'language'), 'Sprache');
});
