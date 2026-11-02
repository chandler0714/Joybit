const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleDelete(request,deps) {
 if(request.method!=='POST') return json({error:'METHOD_NOT_ALLOWED'},405);
 const authorization=request.headers.get('Authorization')??'';
 if(!authorization.startsWith('Bearer ') || authorization.length>12000) return json({error:'AUTH_REQUIRED'},401);
 try {
  // getUser validates the bearer with Supabase Auth; caller-supplied ids are never used.
  const user=await deps.getUser(authorization.slice(7));
  if(!user?.id) return json({error:'AUTH_REQUIRED'},401);
  const raw=await request.text();if(raw.length>16000) return json({error:'INVALID_REQUEST'},400);
  let body;try{body=JSON.parse(raw)}catch{return json({error:'INVALID_REQUEST'},400)}
  if(!body || typeof body!=='object' || Array.isArray(body)) return json({error:'INVALID_REQUEST'},400);
  const apple=user.identities?.find(identity=>identity.provider==='apple');
  if(apple || user.app_metadata?.providers?.includes('apple')) {
   const sub=apple?.identity_data?.sub ?? apple?.id;
   if(!sub || typeof body.appleAuthorizationCode!=='string' || !body.appleAuthorizationCode || body.appleAuthorizationCode.length>4096) return json({error:'REAUTH_REQUIRED'},403);
   await deps.revokeApple(body.appleAuthorizationCode,sub);
  } else {
   if(!user.email || typeof body.password!=='string' || !body.password || body.password.length>128) return json({error:'REAUTH_REQUIRED'},403);
   if(await deps.verifyPassword(user.email,body.password)!==user.id) return json({error:'REAUTH_REQUIRED'},403);
  }
  await deps.deleteUser(user.id);
  return json({deleted:true});
 } catch(error) {
  const code=error instanceof Error?error.message:'';
  if(code==='APPLE_SETUP_REQUIRED') return json({error:code},503);
  if(code==='REAUTH_REQUIRED') return json({error:code},403);
  return json({error:'DELETE_UNAVAILABLE'},503);
 }
}
