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
