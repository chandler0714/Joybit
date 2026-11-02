import {handleDelete} from './handler.mjs';
import {revokeApple} from './apple.mjs';
const base=Deno.env.get('SUPABASE_URL')!;
const admin=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const publicKey=Deno.env.get('SUPABASE_ANON_KEY')!;
const adminHeaders={apikey:admin,Authorization:'Bearer '+admin,'Content-Type':'application/json'};
Deno.serve((request:Request)=>handleDelete(request,{
 async getUser(token:string){
  const r=await fetch(base+'/auth/v1/user',{headers:{apikey:publicKey,Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});
  if(r.status===401 || r.status===403)return null;
  if(!r.ok)throw new Error('AUTH_UNAVAILABLE');return await r.json();
 },
 async verifyPassword(email:string,password:string){
  const r=await fetch(base+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(10000)});
  if(!r.ok)return null;const value=await r.json();
  // End only this short-lived verification session; do not affect unrelated sessions on failure.
  if(value.access_token) {
   const logout=await fetch(base+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:publicKey,Authorization:'Bearer '+value.access_token},signal:AbortSignal.timeout(10000)});
   if(!logout.ok)throw new Error('AUTH_UNAVAILABLE');
  }
  return value.user?.id??null;
 },
 revokeApple:(code:string,subject:string)=>revokeApple(code,subject,{
  clientID:Deno.env.get('APPLE_CLIENT_ID'),teamID:Deno.env.get('APPLE_TEAM_ID'),keyID:Deno.env.get('APPLE_KEY_ID'),privateKey:Deno.env.get('APPLE_PRIVATE_KEY')
 }),
 async deleteUser(id:string){
  const r=await fetch(base+'/auth/v1/admin/users/'+encodeURIComponent(id),{method:'DELETE',headers:adminHeaders,body:JSON.stringify({should_soft_delete:false}),signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error('DELETE_UNAVAILABLE');
 }
}));
