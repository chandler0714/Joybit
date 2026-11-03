import assert from 'node:assert/strict';
import test from 'node:test';
import { isEmail, isEmailCode, isPassword, normalizeEmail } from './emailInput.ts';

test('normalizes only the email domain and surrounding whitespace', () => {
  assert.equal(normalizeEmail('  Player.Name@EXAMPLE.COM  '), 'Player.Name@example.com');
  assert.equal(normalizeEmail('bad-address'), 'bad-address');
});

test('validates email format and maximum length', () => {
  assert.equal(isEmail('Player@example.com'), true);
  assert.equal(isEmail(' a@b.co '), true);
  assert.equal(isEmail('a b@c.com'), false);
  assert.equal(isEmail('a@b'), false);
  assert.equal(isEmail(`${'a'.repeat(250)}@b.co`), false);
});

test('password length uses UTF-8 bytes, and code accepts ASCII digits only', () => {
  assert.equal(isPassword('12345678'), true);
  assert.equal(isPassword('1234567'), false);
  assert.equal(isPassword('あ'.repeat(42) + 'ab'), true);
  assert.equal(isPassword('あ'.repeat(43)), false);
  assert.equal(isEmailCode('123456'), true);
  assert.equal(isEmailCode('1234567890'), true);
  assert.equal(isEmailCode('12345'), false);
  assert.equal(isEmailCode('１２３４５６'), false);
  assert.equal(isEmailCode('12345678901'), false);
});
