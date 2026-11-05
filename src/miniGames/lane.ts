import { LANGUAGE_CODES, translate, type LanguageCode } from '../i18n/translations.ts';
import { escapeHtml, gamePage } from './page.ts';

export type LaneSegment = { safe: number; blocks: number[]; glow: number | null };
export type LaneLevel = { level: number; durationMs: number; target: number; segments: LaneSegment[] };

// Kept as plain JavaScript so the native generator and the offline WebView run identical rules.
const generatorBody = `
  level = Number.isSafeInteger(level) && level > 0 ? level : 1;
  let seed = (Math.imul(level, 0x9e3779b1) ^ 0x6c616e65) >>> 0;
  function random() {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }
  const rank = Math.min(1, (level - 1) / 100);
  const count = 12 + Math.min(18, Math.floor((level - 1) / 5));
  const durationMs = Math.max(750, 1300 - Math.floor((level - 1) * 5.5));
  const segments = [];
  let safe = 1;
  let lastSwitch = -3;
  let target = 0;
  for (let index = 0; index < count; index++) {
    if (index > 0 && index - lastSwitch >= 2 && random() < 0.16 + rank * 0.32) {
      const choices = [safe - 1, safe + 1].filter(lane => lane >= 0 && lane < 3);
      safe = choices[Math.floor(random() * choices.length)];
      lastSwitch = index;
    }
    const blocks = [];
    for (let lane = 0; lane < 3; lane++) {
      if (lane !== safe && random() < 0.46 + rank * 0.28) blocks.push(lane);
    }
    // A switch is always visible and necessary, while no segment seals all three lanes.
    if (index === lastSwitch && !blocks.includes(segments[index - 1].safe)) blocks.push(segments[index - 1].safe);
    const glow = index % 3 === 1 ? safe : null;
    if (glow !== null) target++;
    segments.push({ safe, blocks: blocks.sort(), glow });
  }
  return { level, durationMs, target, segments };
`;

const generate = new Function('level', generatorBody) as (level: number) => LaneLevel;
export function generateLaneLevel(level: number): LaneLevel { return generate(level); }

type Seven = readonly [string, string, string, string, string, string, string];
const copy = {
  intro: ['Switch lanes to dodge gates and collect every glow. Swipe or use the arrows.', 'レーンを移動して障害物を避け、光をすべて集めよう。スワイプか矢印で操作。', '레인을 바꿔 장애물을 피하고 빛을 모두 모으세요. 스와이프 또는 화살표로 조작하세요.', 'Changez de voie pour éviter les barrières et ramasser toutes les lueurs. Glissez ou utilisez les flèches.', 'Cambia de carril para esquivar barreras y recoger todas las luces. Desliza o usa las flechas.', 'Меняйте дорожки, обходите преграды и собирайте все огни. Смахивайте или нажимайте стрелки.', 'Wechsle die Spur, weiche Hindernissen aus und sammle alle Lichter. Wische oder nutze die Pfeile.'],
  level: ['Level {level}', 'レベル {level}', '레벨 {level}', 'Niveau {level}', 'Nivel {level}', 'Уровень {level}', 'Level {level}'],
  ready: ['Ready to glow', '出発の準備完了', '출발 준비 완료', 'Prêt à briller', 'Listo para brillar', 'Готовы к старту', 'Bereit zum Leuchten'],
  running: ['Follow the clear lane', '空いたレーンを進もう', '빈 레인을 따라가세요', 'Suivez la voie libre', 'Sigue el carril libre', 'Следуйте по свободной дорожке', 'Folge der freien Spur'],
  paused: ['Paused', '一時停止', '일시정지', 'Pause', 'Pausado', 'Пауза', 'Pausiert'],
  crashed: ['Gate hit! Try again.', '障害物に衝突！もう一度。', '장애물에 부딪혔어요! 다시 도전하세요.', 'Barrière touchée ! Réessayez.', '¡Choque con barrera! Inténtalo de nuevo.', 'Столкновение! Попробуйте снова.', 'Hindernis getroffen! Versuch es erneut.'],
  missed: ['Collect more glow to finish.', 'ゴールにはもっと光が必要です。', '완주하려면 빛을 더 모으세요.', 'Ramassez plus de lueurs pour finir.', 'Recoge más luces para terminar.', 'Соберите больше огней для финиша.', 'Sammle mehr Lichter für das Ziel.'],
  complete: ['Level complete!', 'レベルクリア！', '레벨 완료!', 'Niveau terminé !', '¡Nivel completado!', 'Уровень пройден!', 'Level geschafft!'],
  start: ['Start run', 'スタート', '시작', 'Démarrer', 'Empezar', 'Старт', 'Starten'],
  pause: ['Pause', '一時停止', '일시정지', 'Pause', 'Pausar', 'Пауза', 'Pause'],
  resume: ['Resume', '再開', '계속', 'Reprendre', 'Continuar', 'Продолжить', 'Weiter'],
  retry: ['Retry', 'やり直す', '다시 하기', 'Réessayer', 'Reintentar', 'Повторить', 'Erneut'],
  left: ['Move left', '左へ', '왼쪽', 'À gauche', 'Izquierda', 'Влево', 'Nach links'],
  right: ['Move right', '右へ', '오른쪽', 'À droite', 'Derecha', 'Вправо', 'Nach rechts'],
  progress: ['{done} / {total} gates', '{done} / {total} ゲート', '{done} / {total} 관문', '{done} / {total} barrières', '{done} / {total} barreras', '{done} / {total} ворот', '{done} / {total} Tore'],
  collected: ['{got} / {target} glow', '光 {got} / {target}', '빛 {got} / {target}', '{got} / {target} lueurs', '{got} / {target} luces', '{got} / {target} огней', '{got} / {target} Lichter'],
} satisfies Record<string, Seven>;

function local(locale: LanguageCode) {
  return Object.fromEntries(Object.entries(copy).map(([key, values]) => [key, values[LANGUAGE_CODES.indexOf(locale)]])) as Record<keyof typeof copy, string>;
}

export function laneHtml(locale: LanguageCode, level = 1): string {
  const config = generateLaneLevel(level);
  const words = local(locale);
  return gamePage(locale, translate(locale, 'gameLane'), '#6C65E8', `
<p class="intro">${escapeHtml(words.intro)}</p>
<section class="panel lane-panel"><div class="lane-heading"><span id="level-label"></span><span id="progress"></span></div>
<div id="status" class="status" role="status">${escapeHtml(words.ready)}</div>
<div id="track" class="track" aria-label="${escapeHtml(translate(locale, 'gameLane'))}"></div>
<div class="lane-stats"><span id="collected"></span></div>
<div class="lane-controls"><button id="left" aria-label="${escapeHtml(words.left)}">◀</button><button id="right" aria-label="${escapeHtml(words.right)}">▶</button></div>
<div class="lane-actions"><button id="start" class="primary">${escapeHtml(words.start)}</button><button id="pause">${escapeHtml(words.pause)}</button><button id="restart">${escapeHtml(words.retry)}</button></div>
</section>`, `
const words=${JSON.stringify(words).replace(/</g, '\\u003c')};
function label(key,values={}){return words[key].replace(/\\{([a-zA-Z]+)\\}/g,(_,name)=>String(values[name]??'{'+name+'}'));}
const config=${JSON.stringify(config)};
let current=0,lane=1,got=0,mode='ready',timer=null,dueAt=0,remaining=config.durationMs,posted=false;
const track=document.getElementById('track'),status=document.getElementById('status');
const start=document.getElementById('start'),pause=document.getElementById('pause'),restart=document.getElementById('restart');
function clearClock(){if(timer!==null){clearTimeout(timer);timer=null;}}
function schedule(){if(mode!=='running')return;dueAt=Date.now()+remaining;timer=setTimeout(step,remaining);}
function render(){
  document.getElementById('level-label').textContent=label('level',{level:config.level});
  document.getElementById('progress').textContent=label('progress',{done:current,total:config.segments.length});
  document.getElementById('collected').textContent=label('collected',{got,target:config.target});
  track.replaceChildren();
  for(let offset=3;offset>=0;offset--){
    const segment=config.segments[current+offset];
    const row=document.createElement('div');row.className='lane-row'+(offset===0?' active':'');
    for(let index=0;index<3;index++){
      const cell=document.createElement('div');
      cell.className='lane-cell'+(segment&&segment.blocks.includes(index)?' blocked':'')+(segment&&segment.glow===index?' glow':'')+(offset===0&&lane===index?' rider':'');
      cell.textContent=offset===0&&lane===index?'◆':segment&&segment.blocks.includes(index)?'▰':segment&&segment.glow===index?'✦':'';
      row.appendChild(cell);
    }
    track.appendChild(row);
  }
  start.hidden=mode!=='ready';pause.hidden=mode!=='running'&&mode!=='paused';restart.hidden=mode==='ready';
  pause.textContent=label(mode==='paused'?'resume':'pause');
  document.getElementById('left').disabled=mode!=='running'||lane===0;
  document.getElementById('right').disabled=mode!=='running'||lane===2;
}
function finish(won,key){clearClock();mode=won?'won':'lost';status.textContent=label(key);render();
  if(won&&!posted){posted=true;window.ReactNativeWebView?.postMessage(JSON.stringify({type:'levelComplete',game:'lane',level:config.level}));}
}
function step(){timer=null;if(mode!=='running')return;
  const segment=config.segments[current];
  if(segment.blocks.includes(lane)){finish(false,'crashed');return;}
  if(segment.glow===lane)got++;
  current++;remaining=config.durationMs;
  if(current===config.segments.length){finish(got>=config.target,got>=config.target?'complete':'missed');return;}
  render();schedule();
}
function move(direction){if(mode!=='running')return;lane=Math.max(0,Math.min(2,lane+direction));render();}
function begin(){clearClock();current=0;lane=1;got=0;remaining=config.durationMs;mode='running';posted=false;status.textContent=label('running');render();schedule();}
start.addEventListener('click',begin);restart.addEventListener('click',begin);
pause.addEventListener('click',()=>{if(mode==='running'){remaining=Math.max(1,dueAt-Date.now());clearClock();mode='paused';status.textContent=label('paused');}else if(mode==='paused'){mode='running';status.textContent=label('running');schedule();}render();});
document.getElementById('left').addEventListener('click',()=>move(-1));
document.getElementById('right').addEventListener('click',()=>move(1));
document.addEventListener('keydown',event=>{if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1);});
let touchX=null;track.addEventListener('touchstart',event=>{touchX=event.changedTouches[0].clientX;},{passive:true});
track.addEventListener('touchend',event=>{if(touchX===null)return;const difference=event.changedTouches[0].clientX-touchX;if(Math.abs(difference)>24)move(difference>0?1:-1);touchX=null;},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='running')pause.click();});
window.addEventListener('pagehide',clearClock);render();`, `
.lane-panel{min-height:530px;justify-content:flex-start;padding:18px 15px 22px;background:linear-gradient(160deg,#fdfdff,#edf0ff)}
.lane-heading{width:100%;display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:#584fc3}.lane-panel .status{margin:10px 0}
.track{width:min(100%,330px);height:300px;border:6px solid #282752;border-radius:22px;background:radial-gradient(circle at 75% 26%,#ffb9a6 0 7%,transparent 8%),linear-gradient(#5b4d9b 0%,#aa75af 33%,#f2a4a3 51%,#668ca5 53%,#313966 100%);display:flex;flex-direction:column;overflow:hidden;touch-action:pan-y;box-shadow:0 12px 26px #1a1a5140;position:relative;isolation:isolate}.track::before{content:'';position:absolute;inset:28% 0 24%;background:linear-gradient(#505184,#3e5481);clip-path:polygon(0 66%,13% 20%,25% 70%,44% 12%,58% 66%,74% 25%,90% 75%,100% 36%,100% 100%,0 100%);opacity:.8}.track::after{content:'';position:absolute;inset:29% 0 0;background:linear-gradient(#35466e,#1d2049);clip-path:polygon(47% 0,53% 0,100% 100%,0 100%);z-index:0}
.lane-row{display:grid;grid-template-columns:repeat(3,1fr);flex:1;z-index:1;position:relative;border-bottom:1px solid #a3d7f450;margin:auto}.lane-row:nth-child(1){width:54%}.lane-row:nth-child(2){width:68%}.lane-row:nth-child(3){width:84%}.lane-row:nth-child(4){width:100%}.lane-row.active{background:#7d72f423}
.lane-cell{display:flex;align-items:center;justify-content:center;font-size:25px;color:#edeeff;border-right:2px dashed #71e7ef70;position:relative;text-shadow:0 0 8px #fff}.lane-cell:last-child{border-right:0}.lane-cell.blocked{font-size:0}.lane-cell.blocked::after{content:'';width:66%;height:30px;border-radius:5px;background:repeating-linear-gradient(135deg,#f98e86 0 9px,#ffd3b8 9px 16px);border:3px solid #ed6d77;box-shadow:0 5px 0 #8e4b68,0 0 17px #f77b8b}.lane-cell.glow{color:#ffe27b;text-shadow:0 0 13px #ffdc46}.lane-cell.rider{font-size:0}.lane-cell.rider::after{content:'';width:35px;height:35px;border-radius:50%;background:radial-gradient(circle at 30% 27%,#fff,#8cf7ff 30%,#33a7db 70%,#2169ba);border:3px solid #ddffff;box-shadow:0 0 0 5px #40e8ef44,0 0 23px #60f3ff}
.lane-stats{margin:13px 0 8px;font-size:14px;font-weight:800;color:#524ba0}.lane-controls{display:flex;gap:14px;width:100%;max-width:330px}.lane-controls button{flex:1;min-height:58px;border:0;border-radius:16px;background:#dbddff;color:#333273;font-size:26px;font-weight:900}.lane-controls button:disabled{opacity:.42}
.lane-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;width:100%;margin-top:13px}.lane-actions button:not(.primary){min-height:44px;padding:0 14px;border:1px solid #b7b6e6;border-radius:12px;background:white;color:#4d49a3;font-weight:800}.lane-actions .primary{min-height:50px}
[hidden]{display:none!important}`);
}
