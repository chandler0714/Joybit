import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { verifyReward } from '../supabase/functions/admob-reward/verify.mjs';
const {publicKey,privateKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const keys=[{keyId:7,pem:publicKey.export({type:'spki',format:'pem'})}];
const ticket='8e50245b-334e-4df9-a535-fb0d14c66142';
const payload=`ad_unit=1234&custom_data=${ticket}&reward_amount=1&timestamp=${Date.now()}&transaction_id=abc123`;
function url(p=payload) { return 'https://example.invalid/?'+p+'&signature='+sign('sha256',Buffer.from(p),privateKey).toString('base64url')+'&key_id=7'; }
test('valid signed Google-style reward returns nonce and transaction',()=>{ assert.deepEqual(verifyReward(url(),keys,['1234']),{ticket,transaction:'abc123'}); });
test('tampered payload and wrong key rejected',()=>{ assert.throws(()=>verifyReward(url().replace('ad_unit=1234','ad_unit=5678'),keys,['5678'])); assert.throws(()=>verifyReward(url(),[],['1234'])); });
test('duplicate fields, unsigned tail and wrong unit rejected',()=>{ assert.throws(()=>verifyReward(url(payload+'&custom_data='+ticket),keys,['1234'])); assert.throws(()=>verifyReward(url()+'&custom_data='+ticket,keys,['1234'])); assert.throws(()=>verifyReward(url(),keys,['5678'])); });
test('expired and future callbacks rejected',()=>{ for(const timestamp of [Date.now()-7200000,Date.now()+3600000]) assert.throws(()=>verifyReward(url(payload.replace(/timestamp=\d+/,`timestamp=${timestamp}`)),keys,['1234'])); });
test('publisher ad unit matches full and numeric callback forms only',()=>{
 const full='ca-app-pub-3267856586189154/8507939079';
 const own=payload.replace('ad_unit=1234','ad_unit=8507939079');
 assert.equal(verifyReward(url(own),keys,[full]).ticket,ticket);
 assert.equal(verifyReward(url(own.replace('ad_unit=8507939079','ad_unit='+full)),keys,['8507939079']).ticket,ticket);
 assert.throws(()=>verifyReward(url(own.replace('8507939079','8507939080')),keys,[full]));
 assert.throws(()=>verifyReward(url(own.replace('ad_unit=8507939079','ad_unit=ca-app-pub-9999999999999999/8507939079')),keys,[full]));
});
test('signed console verification probe cannot produce a reward ticket',()=>{
 const probe=payload.replace(ticket,'ssv-verify');
 assert.deepEqual(verifyReward(url(probe),keys,['1234']),{ticket:null,transaction:'abc123'});
 assert.throws(()=>verifyReward(url(probe),keys,['5678']));
 assert.throws(()=>verifyReward(url(probe).replace('ssv-verify','invalid-data'),keys,['1234']));
});
test('AdMob console fixed sample unit verifies only as a no-reward probe',()=>{
 const probe=payload.replace('ad_unit=1234','ad_unit=1234567890').replace(ticket,'ssv-verify');
 const owner=['ca-app-pub-3267856586189154/8507939079'];
 assert.deepEqual(verifyReward(url(probe),keys,owner),{ticket:null,transaction:'abc123'});
 assert.throws(()=>verifyReward(url(probe.replace('ssv-verify',ticket)),keys,owner));
 assert.throws(()=>verifyReward(url(probe.replace('1234567890','1234567891')),keys,owner));
 assert.throws(()=>verifyReward(url(probe).replace('ssv-verify','not-verified'),keys,owner));
});
