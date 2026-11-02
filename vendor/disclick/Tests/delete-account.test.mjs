import test from 'node:test';
import assert from 'node:assert/strict';
import { handleDelete } from '../supabase/functions/delete-account/handler.mjs';
const emailUser = {id:'self',email:'player@example.com',identities:[{provider:'email'}]};
function setup(user=emailUser) {
 const calls=[];
 const deps={getUser:async(token)=>{assert.equal(token,'valid');return user},
  verifyPassword:async(email,password)=>{calls.push('password');assert.equal(email,'player@example.com');return password==='correct'?'self':null},
  revokeApple:async(code,sub)=>{calls.push('apple');assert.equal(code,'fresh');assert.equal(sub,'apple-self')},
  deleteUser:async(id)=>{calls.push(id)}};
 return {calls,deps};
}
const req=(body={},token='valid')=>new Request('https://unit.invalid/delete-account',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('only caller account is deleted after password reauthentication',async()=>{
 const {deps,calls}=setup();const r=await handleDelete(req({password:'correct',user_id:'victim'}),deps); assert.equal(r.status,200);assert.deepEqual(calls,['password','self']);assert.deepEqual(await r.json(),{deleted:true});
});
test('invalid session cannot reach deletion',async()=>{const {deps,calls}=setup();deps.getUser=async()=>null;assert.equal((await handleDelete(req({password:'correct'}),deps)).status,401);assert.deepEqual(calls,[])});
test('wrong or missing password never deletes',async()=>{for(const body of [{},{password:'wrong'}]){const {deps,calls}=setup();assert.equal((await handleDelete(req(body),deps)).status,403);assert.ok(!calls.includes('self'))}});
test('Apple linked account cannot bypass revocation via email',async()=>{const {deps,calls}=setup({...emailUser,identities:[{provider:'email'},{provider:'apple',identity_data:{sub:'apple-self'}}]});assert.equal((await handleDelete(req({password:'correct'}),deps)).status,403);assert.deepEqual(calls,[])});
test('Apple revocation precedes deletion and missing config prevents partial deletion',async()=>{
 const apple={...emailUser,identities:[{provider:'apple',identity_data:{sub:'apple-self'}}]};
 const {deps,calls}=setup(apple);assert.equal((await handleDelete(req({appleAuthorizationCode:'fresh'}),deps)).status,200);assert.deepEqual(calls,['apple','self']);
 const failed=setup(apple);failed.deps.revokeApple=async()=>{throw new Error('APPLE_SETUP_REQUIRED')};const r=await handleDelete(req({appleAuthorizationCode:'fresh'}),failed.deps);assert.equal(r.status,503);assert.deepEqual(failed.calls,[]);
});
test('malformed body and unsupported methods are rejected',async()=>{const {deps,calls}=setup();assert.equal((await handleDelete(new Request('https://unit.invalid',{method:'GET'}),deps)).status,405);assert.equal((await handleDelete(new Request('https://unit.invalid',{method:'POST',headers:{Authorization:'Bearer valid'},body:'oops'}),deps)).status,400);assert.deepEqual(calls,[])});
test('upstream errors do not leak secrets or claim success',async()=>{const {deps}=setup();deps.deleteUser=async()=>{throw new Error('private-token')};const r=await handleDelete(req({password:'correct'}),deps);assert.equal(r.status,503);assert.ok(!(await r.text()).includes('private-token'))});
