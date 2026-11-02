import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const host = readFileSync(process.argv[2] ?? new URL('../modules/steady-drop/ios/SteadyDropHostView.swift', import.meta.url), 'utf8');
const module = readFileSync(process.argv[3] ?? new URL('../modules/steady-drop/ios/SteadyDropModule.swift', import.meta.url), 'utf8');
for (const step of ['addChild(', 'didMove(toParent:', 'willMove(toParent: nil)', 'removeFromParent()']) {
  assert.ok(host.includes(step), `native host missing containment step: ${step}`);
}
assert.match(module, /Prop\("sessionJson"\)/, 'native bridge must accept one atomic session payload');
console.log('Native hosting containment and atomic prop contract passed');
