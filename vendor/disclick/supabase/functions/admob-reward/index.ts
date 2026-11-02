import { verifyReward } from './verify.mjs';

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
