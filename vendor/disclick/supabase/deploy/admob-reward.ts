// Generated dashboard entrypoint. Regenerate with scripts/bundle-admob.py.
// @ts-nocheck
import { Buffer } from 'node:buffer';
import { createPublicKey, verify } from 'node:crypto';

// Keep the exact raw query bytes. Decoding/re-encoding before verification changes the signature.
export function verifyReward(requestURL, keys, allowedUnits, now = Date.now()) {
  const raw = new URL(requestURL).search.slice(1);
  if (raw.length > 8192) throw new Error('query too long');
  const match = /^(.*)&signature=([A-Za-z0-9_%=-]+)&key_id=(\d+)$/.exec(raw);
  if (!match) throw new Error('invalid signature fields');
  const [, content, signature, keyID] = match;
  const params = new URLSearchParams(content);
  if ([...params.keys()].some(k => params.getAll(k).length !== 1 || k === 'signature' || k === 'key_id')) throw new Error('duplicate fields');
  const entry = keys.find(k => String(k.keyId) === keyID);
  if (!entry) throw new Error('unknown key');
  const publicKey = entry.pem ? createPublicKey(entry.pem) : createPublicKey({key:Buffer.from(entry.base64,'base64'),format:'der',type:'spki'});
  if (!verify('sha256',Buffer.from(content),publicKey,Buffer.from(decodeURIComponent(signature),'base64url'))) throw new Error('invalid signature');
  const timestamp = Number(params.get('timestamp'));
  if (!Number.isFinite(timestamp) || now - timestamp > 3600000 || timestamp - now > 300000) throw new Error('expired callback');
  const actual = params.get('ad_unit') ?? '';
  const validUnit = /^(?:ca-app-pub-[0-9]+\/)?[0-9]+$/;
  const numeric = /^[0-9]+$/;
  const matches = validUnit.test(actual) && allowedUnits.some(unit => validUnit.test(unit) &&
    (unit === actual || ((numeric.test(unit) || numeric.test(actual)) && unit.split('/').at(-1) === actual.split('/').at(-1))));
  const ticket = params.get('custom_data');
  // The AdMob console uses its fixed sample unit even when testing an owner's unit.
  // This exception is signature-checked and cannot yield a redeemable ticket.
  const consoleProbe = actual === '1234567890' && ticket === 'ssv-verify';
  if (!matches && !consoleProbe) throw new Error('unknown ad unit');
  const transaction = params.get('transaction_id');
  if (!/^[a-zA-Z0-9_-]{1,256}$/.test(transaction ?? '')) throw new Error('invalid transaction');
  // AdMob's signed console probe verifies reachability only; it never mints a life.
  if (ticket === 'ssv-verify') return {ticket:null,transaction};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket ?? '') || !/^[a-zA-Z0-9_-]{1,256}$/.test(transaction ?? '')) throw new Error('invalid reward');
  // One accepted completed-video transaction always grants exactly one life.
  return {ticket,transaction};
}


let cache: { keys: unknown[]; expires: number } | undefined;
Deno.serve(async (request: Request) => {
  if (request.method !== 'GET') return new Response('Method not allowed',{status:405});
  const allowed = (Deno.env.get('ADMOB_REWARDED_UNITS') ?? 'ca-app-pub-3267856586189154/8507939079').split(',').map(s=>s.trim()).filter(Boolean);
  if (!allowed.length) return new Response('Reward service not configured',{status:503});
  try {
    if (!cache || cache.expires < Date.now()) {
      const response = await fetch('https://www.gstatic.com/admob/reward/verifier-keys.json',{signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('key service unavailable');
      const data = await response.json();
      if (!Array.isArray(data.keys) || !data.keys.length) throw new Error('invalid keys');
      cache = {keys:data.keys,expires:Date.now()+3600000};
    }
    // Google rotates keys independently of our cache lifetime. Retry an unknown key once.
    let reward;
    try { reward = verifyReward(request.url,cache.keys,allowed); }
    catch (error) {
      if (!(error instanceof Error) || error.message !== 'unknown key') throw error;
      const response = await fetch('https://www.gstatic.com/admob/reward/verifier-keys.json',{signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('key service unavailable');
      const data = await response.json();
      if (!Array.isArray(data.keys)) throw new Error('invalid keys');
      cache = {keys:data.keys,expires:Date.now()+3600000};
      reward = verifyReward(request.url,cache.keys,allowed);
    }
    if (reward.ticket === null) return new Response('Verified. No reward issued.');
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const response = await fetch(url+'/rest/v1/rpc/life_ad_grant',{
      method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({p_ticket:reward.ticket,p_transaction:reward.transaction}),signal:AbortSignal.timeout(10000)
    });
    if (!response.ok) return new Response('Reward unavailable',{status:503});
    return new Response('OK');
  } catch {
    // No tokens, query strings or user data in logs or error responses.
    return new Response('Unable to verify reward',{status:400});
  }
});
