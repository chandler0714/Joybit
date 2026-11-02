from pathlib import Path
root = Path(__file__).resolve().parents[1]
verify = (root / 'supabase/functions/admob-reward/verify.mjs').read_text()
entry = (root / 'supabase/functions/admob-reward/index.ts').read_text().replace("import { verifyReward } from './verify.mjs';\n", '')
output = root / 'supabase/deploy/admob-reward.ts'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text('// Generated dashboard entrypoint. Regenerate with scripts/bundle-admob.py.\n// @ts-nocheck\n' + verify + '\n' + entry)
