import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../vendor/disclick/SteadyDrop/', import.meta.url));
const destination = fileURLToPath(new URL('../modules/steady-drop/ios/Upstream/', import.meta.url));
if (!existsSync(source)) throw new Error('Missing vendored disClick snapshot');
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'Resources') walk(path); continue; }
    if (!entry.name.endsWith('.swift') || entry.name === 'SteadyDropApp.swift') continue;
    const output = join(destination, relative(source, path));
    mkdirSync(dirname(output), { recursive: true });
    let content = readFileSync(path, 'utf8');
    if (entry.name === 'ContentView.swift') {
      const begin = content.indexOf('                Section(model.t("authAccount")) {');
      const end = content.indexOf('                Section(model.t("privacyAndSupport")) {', begin);
      if (begin < 0 || end < 0) throw new Error('disClick account settings changed; review the Joybit boundary');
      content = content.slice(0, begin) + content.slice(end);
    }
    if (entry.name === 'AuthModel.swift') {
      const marker = '    func restore() async {';
      if (!content.includes(marker)) throw new Error('disClick auth model changed; review the Joybit boundary');
      content = content.replace(marker, `    func acceptExternalSession(_ value: AuthSession) {
        // Joybit already validated the token; avoid rotating its refresh token on mount.
        session = value
        checking = false
        errorKey = nil
    }
${marker}`);
    }
    writeFileSync(output, content);
  }
}
walk(source);
console.log('Synchronized disClick Swift sources; standalone entry and in-game account menu omitted.');
