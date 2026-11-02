import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const {publicKey,privateKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
let handler, grants=0;
globalThis.Deno={env:{get:k=>({SUPABASE_URL:'https://rpc.invalid',SUPABASE_SERVICE_ROLE_KEY:'fixture-service-key'})[k]},serve:h=>handler=h};
const originalFetch=globalThis.fetch;
globalThis.fetch=async (url,options)=>{
 if(String(url)==='https://www.gstatic.com/admob/reward/verifier-keys.json') return Response.json({keys:[{keyId:7,pem:publicKey.export({type:'spki',format:'pem'})}]});
 assert.equal(String(url),'https://rpc.invalid/rest/v1/rpc/life_ad_grant');
 const body=JSON.parse(options.body); assert.match(body.p_ticket,/^[0-9a-f-]{36}$/i); assert.equal(body.p_transaction,'handler-fixture');
 grants++; return new Response(null,{status:204});
};
await import('../supabase/deploy/admob-reward.ts');
function callback(data,unit='8507939079') {
 const payload=`ad_unit=${unit}&custom_data=${data}&reward_amount=1&timestamp=${Date.now()}&transaction_id=handler-fixture`;
 const signature=sign('sha256',Buffer.from(payload),privateKey).toString('base64url');
 return new Request(`https://callback.invalid/?${payload}&signature=${signature}&key_id=7`);
}
test('console verification returns 200 and cannot call grant RPC',async()=>{
 const before=grants; const response=await handler(callback('ssv-verify','1234567890'));
 assert.equal(response.status,200); assert.equal(grants,before);
});
test('signed owner unit ticket reaches backend; wrong unit or unsigned query cannot',async()=>{
 const before=grants;
 assert.equal((await handler(callback('8e50245b-334e-4df9-a535-fb0d14c66142'))).status,200);
 assert.equal(grants,before+1);
 assert.equal((await handler(callback('ssv-verify','1234'))).status,400);
 assert.equal((await handler(new Request('https://callback.invalid/?custom_data=ssv-verify'))).status,400);
 assert.equal(grants,before+1);
});
test('dashboard bundle exactly matches canonical verifier and handler',async()=>{
 const root=new URL('../',import.meta.url);
 const verifier=await readFile(new URL('supabase/functions/admob-reward/verify.mjs',root),'utf8');
 const index=(await readFile(new URL('supabase/functions/admob-reward/index.ts',root),'utf8')).replace("import { verifyReward } from './verify.mjs';\n",'');
 const bundle=await readFile(new URL('supabase/deploy/admob-reward.ts',root),'utf8');
 assert.equal(bundle,'// Generated dashboard entrypoint. Regenerate with scripts/bundle-admob.py.\n// @ts-nocheck\n'+verifier+'\n'+index);
});
process.on('exit',()=>{globalThis.fetch=originalFetch;delete globalThis.Deno;});
