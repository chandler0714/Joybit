import {createPrivateKey,createPublicKey,sign,verify} from 'node:crypto';
// One fresh authorization code is exchanged only to verify ownership and revoke Apple tokens.
// Apple keys, codes, tokens and identity claims are never logged or returned to the app.
export async function revokeApple(code,subject,config,fetcher=fetch,now=()=>Date.now()) {
 const {clientID,teamID,keyID,privateKey}=config;
 if(!clientID || !teamID || !keyID || !privateKey) throw new Error('APPLE_SETUP_REQUIRED');
 const seconds=Math.floor(now()/1000);
 const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 const unsigned=b64({alg:'ES256',kid:keyID})+'.'+b64({iss:teamID,iat:seconds,exp:seconds+300,aud:'https://appleid.apple.com',sub:clientID});
 const secret=unsigned+'.'+sign('sha256',Buffer.from(unsigned),{key:createPrivateKey(privateKey.replace(/\\n/g,'\n')),dsaEncoding:'ieee-p1363'}).toString('base64url');
 const headers={'Content-Type':'application/x-www-form-urlencoded'};
 const exchanged=await fetcher('https://appleid.apple.com/auth/token',{method:'POST',headers,body:new URLSearchParams({client_id:clientID,client_secret:secret,code,grant_type:'authorization_code'}),signal:AbortSignal.timeout(10000)});
 if(!exchanged.ok) throw new Error('REAUTH_REQUIRED');
 const tokens=await exchanged.json();
 const parts=(tokens.id_token??'').split('.');if(parts.length!==3) throw new Error('REAUTH_REQUIRED');
 let header,payload;try{header=JSON.parse(Buffer.from(parts[0],'base64url'));payload=JSON.parse(Buffer.from(parts[1],'base64url'))}catch{throw new Error('REAUTH_REQUIRED')}
 if(header.alg!=='RS256' || payload.iss!=='https://appleid.apple.com' || payload.aud!==clientID || payload.sub!==subject || !Number.isFinite(payload.exp) || payload.exp<=seconds) throw new Error('REAUTH_REQUIRED');
 const keysResponse=await fetcher('https://appleid.apple.com/auth/keys',{signal:AbortSignal.timeout(10000)});
 if(!keysResponse.ok) throw new Error('APPLE_UNAVAILABLE');
 const keys=await keysResponse.json();const jwk=keys.keys?.find(k=>k.kid===header.kid && k.kty==='RSA' && k.alg==='RS256');
 if(!jwk || !verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key:jwk,format:'jwk'}),Buffer.from(parts[2],'base64url'))) throw new Error('REAUTH_REQUIRED');
 if(typeof tokens.refresh_token!=='string' || !tokens.refresh_token) throw new Error('APPLE_UNAVAILABLE');
 const revoked=await fetcher('https://appleid.apple.com/auth/revoke',{method:'POST',headers,body:new URLSearchParams({client_id:clientID,client_secret:secret,token:tokens.refresh_token,token_type_hint:'refresh_token'}),signal:AbortSignal.timeout(10000)});
 if(!revoked.ok) throw new Error('APPLE_UNAVAILABLE');
}
