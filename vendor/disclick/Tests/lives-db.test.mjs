// Run: node Tests/lives-db.test.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.argv[2]);
const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
insert into auth.users values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`);
await db.exec(await readFile(new URL('../supabase/migrations/202610290001_lives.sql',import.meta.url),'utf8'));
const user='00000000-0000-0000-0000-000000000001';
const other='00000000-0000-0000-0000-000000000002';
async function login(u=user) { await db.query("select set_config('request.jwt.claim.sub',$1,false)",[u]); }
await login();
async function action(a,id=null,l=1) { const r=await db.query('select public.life_action($1,$2,$3,$4) as s',[a,'Asia/Shanghai',id,l]); return r.rows[0].s; }
let n=0;
function round() { n++; return '10000000-0000-0000-0000-'+String(n).padStart(12,'0'); }
let s=await action('status'); assert.equal(s.lives,5); assert.equal(s.points,0);
for(let i=0;i<5;i++) { const id=round(); await action('begin',id); s=await action('loss',id); const twice=await action('loss',id); assert.equal(s.lives,twice.lives); }
assert.equal(s.lives,0); await assert.rejects(()=>action('begin',round()),/NO_LIVES/);
await db.exec("update public.player_lives set topup_day=topup_day-1,points=90");
s=await action('status'); assert.equal(s.lives,5); assert.equal(s.points,90);
let id=round(); await action('begin',id); s=await action('win',id); assert.equal(s.lives,6); assert.equal(s.points,0); assert.equal(s.rewarded,true);
s=await action('win',id); assert.equal(s.lives,6); assert.equal(s.points,0); assert.equal(s.rewarded,false);
await assert.rejects(()=>action('loss',id),/ROUND_CLOSED/);
await db.exec("update public.player_lives set lives=99,points=90,topup_day=topup_day-1");
s=await action('status'); assert.equal(s.lives,99); id=round(); await action('begin',id); s=await action('win',id); assert.equal(s.lives,99); assert.equal(s.points,0); assert.equal(s.rewarded,false);
id=round(); await action('begin',id); const replacement=round(); await action('begin',replacement); await assert.rejects(()=>action('win',id),/ROUND_CLOSED/);
await action('abandon',replacement); s=await action('status'); assert.equal(s.lives,99);
const ticket=(await action('ad_ticket')).ticket_id;
await assert.rejects(()=>action('test_reward',ticket),/TEST_REWARDS_DISABLED/);
await db.exec('update public.player_lives set lives=0');
await db.query('select public.life_ad_grant($1,$2)',[ticket,'tx1']);
await db.query('select public.life_ad_grant($1,$2)',[ticket,'tx1']); s=await action('status'); assert.equal(s.lives,1);
const t2=(await action('ad_ticket')).ticket_id; await assert.rejects(()=>db.query('select public.life_ad_grant($1,$2)',[t2,'tx1']),/unique/); s=await action('status'); assert.equal(s.lives,1);
const midnightTicket=(await action('ad_ticket')).ticket_id;
await db.exec("update public.player_lives set lives=0,topup_day=topup_day-1");
await db.query('select public.life_ad_grant($1,$2)',[midnightTicket,'midnight-tx']);
s=await action('status'); assert.equal(s.lives,6,'midnight top-up must occur before an ad reward');
await login(other); s=await action('status'); assert.equal(s.lives,5); await assert.rejects(()=>action('ad_status',ticket),/TICKET_NOT_FOUND/);
await db.exec('set role authenticated'); s=await action('status'); assert.equal(s.lives,5);
await assert.rejects(()=>db.exec('update public.player_lives set lives=99'),/permission denied/);
await assert.rejects(()=>db.query('select public.life_ad_grant($1,$2)',[ticket,'tx2']),/permission denied/);
await db.exec('reset role; set role anon'); await assert.rejects(()=>action('status'),/permission denied/);
console.log('PostgreSQL ledger passed: daily top-up, loss floor, duplicate settlement, win conversion, cap, abandonment, nonce/transaction replay, account isolation, RPC/table permissions');
await db.exec('reset role');
await db.query('delete from auth.users where id=$1',[user]);
for(const table of ['player_lives','life_rounds','life_ad_tickets']) {
 const count=await db.query('select count(*)::int as n from public.'+table+' where user_id=$1',[user]);
 assert.equal(count.rows[0].n,0,'account deletion cascades through '+table);
}
const survivor=await db.query('select lives from public.player_lives where user_id=$1',[other]);assert.equal(survivor.rows[0].lives,5);
await login(user);await assert.rejects(()=>action('status'),/foreign key/);
console.log('Account deletion passed: own ledger cascades, other account retained, deleted identity cannot recreate ledger');
await db.close();
