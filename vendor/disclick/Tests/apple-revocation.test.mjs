import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {revokeApple} from '../supabase/functions/delete-account/apple.mjs';
const ec=generateKeyPairSync('ec',{namedCurve:'P-256'}),rsa=generateKeyPairSync('rsa',{modulusLength:2048});
const cfg={clientID:'com.unit.app',teamID:'TEAM',keyID:'KEY',privateKey:ec.privateKey.export({format:'pem',type:'pkcs8'})};
const now=1700000000000;
function token(claims={},tamper=false){
 const enc=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const body=enc({alg:'RS256',kid:'apple-key'})+'.'+enc({iss:'https://appleid.apple.com',aud:cfg.clientID,sub:'self',exp:now/1000+300,...claims});
 return body+'.'+sign('RSA-SHA256',Buffer.from(tamper?body+'x':body),rsa.privateKey).toString('base64url');
}
const jwk={...rsa.publicKey.export({format:'jwk'}),kid:'apple-key',alg:'RS256'};
function stub(idToken){const calls=[];return {calls,fetcher:async(url,options)=>{
 calls.push(url);if(url.endsWith('/token')){assert.equal(options.body.get('grant_type'),'authorization_code');return Response.json({id_token:idToken,refresh_token:'private-refresh'})}
 if(url.endsWith('/keys'))return Response.json({keys:[jwk]});
 assert.ok(url.endsWith('/revoke'));assert.equal(options.body.get('token'),'private-refresh');return new Response('');
}}}
test('signed Apple code exchange verifies owner before revoking',async()=>{const s=stub(token());await revokeApple('fresh','self',cfg,s.fetcher,()=>now);assert.equal(s.calls.length,3)});
test('other owner, wrong audience, expired and tampered tokens never revoke',async()=>{
 for(const value of [token({sub:'victim'}),token({aud:'other'}),token({exp:now/1000-1}),token({},true)]){
  const s=stub(value);await assert.rejects(()=>revokeApple('fresh','self',cfg,s.fetcher,()=>now),/REAUTH_REQUIRED/);assert.ok(!s.calls.some(url=>url.endsWith('/revoke')));
 }
});
test('missing signing credentials fail before any external request',async()=>{let called=false;await assert.rejects(()=>revokeApple('fresh','self',{},async()=>{called=true}),/APPLE_SETUP_REQUIRED/);assert.equal(called,false)});
test('failed Apple revocation is not treated as success',async()=>{const s=stub(token());await assert.rejects(()=>revokeApple('fresh','self',cfg,async(u,o)=>u.endsWith('/revoke')?new Response('',{status:503}):s.fetcher(u,o),()=>now),/APPLE_UNAVAILABLE/)});
