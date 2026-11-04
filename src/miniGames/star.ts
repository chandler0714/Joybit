import { LANGUAGE_CODES, type LanguageCode } from '../i18n/translations.ts';
import { escapeHtml, gamePage } from './page.ts';

type Star = { row: number; lane: number };
export type StarLevel = { number: number; start: number; gates: number[]; stars: Star[]; exit: number };

// This transition is embedded verbatim in the WebView and used by the verifier.
export function advanceStar(lane: number, direction: number): number {
  return Math.max(0, Math.min(3, lane + direction));
}

export function routeStarLevel(level: StarLevel, directions: number[]): { won: boolean; collected: number; lane: number } {
  if (directions.length !== level.gates.length || directions.some(direction => direction !== -1 && direction !== 1)) {
    return { won: false, collected: 0, lane: level.start };
  }
  let lane = level.start;
  let collected = 0;
  for (let row = 0; row < directions.length; row++) {
    lane = advanceStar(lane, directions[row]);
    if (level.stars.some(star => star.row === row && star.lane === lane)) collected++;
  }
  return { won: collected === level.stars.length && lane === level.exit, collected, lane };
}

export function solveStarLevel(level: StarLevel): number[] | null {
  for (let mask = 0; mask < 2 ** level.gates.length; mask++) {
    const directions = level.gates.map((_, row) => (mask & (1 << row)) ? -1 : 1);
    if (routeStarLevel(level, directions).won) return directions;
  }
  return null;
}

export function generateStarLevel(number: number): StarLevel {
  const n = Number.isSafeInteger(number) && number > 0 ? number : 1;
  let seed = (Math.imul(n, 0x9e3779b1) ^ 0x51a7c3e5) >>> 0;
  const next = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
  const rows = Math.min(7, 3 + Math.floor((n - 1) / 20));
  const starCount = Math.min(3, 1 + Math.floor((n - 1) / 30));
  const start = 1 + next() % 2;
  const route = Array.from({ length: rows }, () => next() % 2 ? -1 : 1);
  const paths: number[] = [];
  let lane = start;
  for (const direction of route) { lane = advanceStar(lane, direction); paths.push(lane); }
  const starRows = [0];
  while (starRows.length < starCount) {
    const row = 1 + next() % (rows - 1);
    if (!starRows.includes(row)) starRows.push(row);
  }
  starRows.sort((a, b) => a - b);
  const candidate: StarLevel = {
    number: n, start, gates: Array.from({ length: rows }, (_, row) => row),
    stars: starRows.map(row => ({ row, lane: paths[row] })), exit: lane,
  };
  // The route used to construct the board must also pass the real rule checker.
  if (!routeStarLevel(candidate, route).won) throw new Error('Invalid Star Trail level');
  return candidate;
}

const labels = {
  title: ['Star Trail', '星の軌道', '별빛 궤도', 'Piste des étoiles', 'Ruta estelar', 'Звёздный путь', 'Sternenpfad'],
  intro: ['Tap ramps to tilt them. Guide the falling orb through every star and into the glowing exit.', '坂をタップして傾きを変え、球をすべての星と出口へ導こう。', '경사로를 눌러 방향을 바꾸고 공으로 모든 별을 모아 출구로 보내세요.', 'Touchez les rampes pour les incliner. Guidez la bille vers toutes les étoiles et la sortie.', 'Toca las rampas para inclinarlas. Guía la bola por todas las estrellas hasta la salida.', 'Нажимайте на скаты, меняя наклон. Проведите шар через все звёзды к выходу.', 'Tippe auf die Rampen und neige sie. Führe die Kugel durch alle Sterne zum Ausgang.'],
  level: ['Level', 'レベル', '레벨', 'Niveau', 'Nivel', 'Уровень', 'Level'],
  ready: ['Set the ramps, then launch!', '坂を決めてからスタート！', '경사로를 정하고 출발!', 'Réglez les rampes, puis lancez !', 'Ajusta las rampas y lanza.', 'Настройте скаты и запускайте!', 'Rampen einstellen, dann starten!'],
  running: ['Orb in motion', '球が移動中', '공이 움직이는 중', 'Bille en mouvement', 'Bola en movimiento', 'Шар движется', 'Kugel rollt'],
  paused: ['Paused', '一時停止', '일시 정지', 'Pause', 'Pausa', 'Пауза', 'Pausiert'],
  won: ['Complete! Every star found.', 'クリア！星をすべて集めたよ。', '완료! 모든 별을 모았어요.', 'Terminé ! Toutes les étoiles sont trouvées.', '¡Completado! Recogiste todas las estrellas.', 'Готово! Все звёзды собраны.', 'Geschafft! Alle Sterne gesammelt.'],
  missed: ['The orb missed its path. Try new ramp angles!', '道を外れたよ。坂の向きを変えてみよう！', '공이 경로를 벗어났어요. 경사로를 바꿔 보세요!', 'La bille a raté sa route. Essayez d’autres inclinaisons !', 'La bola se desvió. ¡Prueba otros ángulos!', 'Шар сбился с пути. Поменяйте наклон скатов!', 'Die Kugel ist abgekommen. Versuche andere Rampen!'],
  launch: ['Launch orb', '球を出す', '공 출발', 'Lancer la bille', 'Lanzar bola', 'Запустить шар', 'Kugel starten'],
  restart: ['Restart', 'やり直す', '다시 시작', 'Recommencer', 'Reiniciar', 'Заново', 'Neustart'],
  pause: ['Pause', '一時停止', '일시 정지', 'Pause', 'Pausa', 'Пауза', 'Pause'],
  resume: ['Resume', '再開', '계속', 'Reprendre', 'Continuar', 'Продолжить', 'Weiter'],
  gate: ['Ramp', '坂', '경사로', 'Rampe', 'Rampa', 'Скат', 'Rampe'],
  stars: ['Stars', '星', '별', 'Étoiles', 'Estrellas', 'Звёзды', 'Sterne'],
} as const;

export function starHtml(locale: LanguageCode, level = 1): string {
  const language = Math.max(0, LANGUAGE_CODES.indexOf(locale));
  const t = (key: keyof typeof labels) => labels[key][language];
  const board = generateStarLevel(level);
  const copy = Object.fromEntries(Object.keys(labels).map(key => [key, t(key as keyof typeof labels)]));
  const data = JSON.stringify(board).replace(/</g, '\\u003c');
  const words = JSON.stringify(copy).replace(/</g, '\\u003c');
  return gamePage(locale, t('title'), '#8260b7', `
<p class="intro">${escapeHtml(t('intro'))}</p>
<div class="star-top"><span>${escapeHtml(t('level'))} ${board.number}</span><span>${escapeHtml(t('stars'))} <b id="collected">0 / ${board.stars.length}</b></span></div>
<section class="star-panel" aria-label="${escapeHtml(t('title'))}">
<div class="star-sky"><svg id="sky" viewBox="0 0 320 600" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(t('title'))}"></svg><div id="gate-controls"></div></div>
<p id="status" class="status" role="status">${escapeHtml(t('ready'))}</p>
<div class="star-actions"><button id="launch" class="primary">${escapeHtml(t('launch'))}</button><button id="pause" class="star-small" disabled>${escapeHtml(t('pause'))}</button><button id="restart" class="star-small">${escapeHtml(t('restart'))}</button></div>
</section>`, `
const level=${data}; const copy=${words}; const advanceStar=${advanceStar.toString()};
const svg=document.getElementById('sky'),controls=document.getElementById('gate-controls');
const status=document.getElementById('status'),collected=document.getElementById('collected');
const launch=document.getElementById('launch'),pause=document.getElementById('pause'),restart=document.getElementById('restart');
const x=lane=>40+lane*80, y=row=>85+row*(430/level.gates.length);
let directions=level.gates.map(()=>1), lane=level.start,row=0, found=new Set(),phase='ready',timer=null;
function draw(){
  const stars=level.stars.map((star,index)=>'<text x="'+x(star.lane)+'" y="'+(y(star.row)+28)+'" text-anchor="middle" font-size="29" fill="'+(found.has(index)?'#a5b3c9':'#ffd271')+'">★</text>').join('');
  const ramps=directions.map((dir,i)=>'<path d="M '+(x(1)-10)+' '+(y(i)+7)+' L '+(x(2)+10)+' '+(y(i)+7+dir*24)+'" stroke="#bd9ff0" stroke-width="7" stroke-linecap="round" opacity=".75"/>').join('');
  svg.innerHTML='<defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="#152443"/><stop offset="1" stop-color="#353060"/></linearGradient></defs><rect width="320" height="600" rx="24" fill="url(#s)"/>'+
    '<g stroke="#ffffff20" stroke-width="2">'+[0,1,2,3].map(i=>'<path d="M '+x(i)+' 25 V 550"/>').join('')+'</g>'+ramps+stars+
    '<path d="M '+(x(level.exit)-23)+' 560 h 46" stroke="#79edca" stroke-width="11" stroke-linecap="round"/><text x="'+x(level.exit)+'" y="585" text-anchor="middle" font-size="23" fill="#79edca">◇</text>'+
    '<circle cx="'+x(lane)+'" cy="'+(row===0?40:row===level.gates.length?555:y(row-1)+28)+'" r="16" fill="#fff8db" stroke="#f0b5d5" stroke-width="5"/>';
  collected.textContent=found.size+' / '+level.stars.length;
  controls.innerHTML=''; directions.forEach((dir,i)=>{const button=document.createElement('button');button.type='button';button.className='gate';button.style.top=((y(i)-9)/600*100)+'%';button.textContent=dir===1?'↘':'↙';button.setAttribute('aria-label',copy.gate+' '+(i+1));button.setAttribute('aria-pressed',dir===-1?'true':'false');button.addEventListener('click',()=>{if(phase==='paused'||phase==='won')return;directions[i]*=-1;draw();});controls.appendChild(button);});
}
function clear(){if(timer!==null){clearTimeout(timer);timer=null;}}
function finish(){clear();pause.disabled=true;launch.disabled=true;const won=found.size===level.stars.length&&lane===level.exit;phase=won?'won':'lost';status.textContent=copy[won?'won':'missed'];if(won)window.ReactNativeWebView?.postMessage(JSON.stringify({type:'levelComplete',game:'star',level:level.number}));}
function step(){timer=null;if(phase!=='running')return;lane=advanceStar(lane,directions[row]);level.stars.forEach((star,index)=>{if(star.row===row&&star.lane===lane)found.add(index);});row++;draw();if(row===level.gates.length)finish();else schedule();}
function schedule(){timer=setTimeout(step,Math.max(310,630-row*45));}
function autoPause(){if(phase!=='running')return;phase='paused';clear();status.textContent=copy.paused;pause.textContent=copy.resume;}
launch.addEventListener('click',()=>{if(phase!=='ready')return;phase='running';status.textContent=copy.running;launch.disabled=true;pause.disabled=false;schedule();});
pause.addEventListener('click',()=>{if(phase==='running'){autoPause();}else if(phase==='paused'){phase='running';status.textContent=copy.running;pause.textContent=copy.pause;schedule();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});
window.addEventListener('pagehide',autoPause);
restart.addEventListener('click',()=>{clear();directions=level.gates.map(()=>1);lane=level.start;row=0;found=new Set();phase='ready';status.textContent=copy.ready;launch.disabled=false;pause.disabled=true;pause.textContent=copy.pause;draw();});
draw();`, `
.star-top{display:flex;justify-content:space-between;color:#605887;font-weight:800;font-size:14px;margin:0 2px 11px}.star-top span{background:#ede7f7;padding:8px 13px;border-radius:12px}
.star-panel{background:white;border-radius:26px;padding:12px 12px 20px;box-shadow:0 10px 35px #183b4410}.star-sky{width:min(100%,350px);height:min(53dvh,450px);min-height:300px;position:relative;margin:auto}.star-sky svg{width:100%;height:100%;display:block}.star-sky #gate-controls{position:absolute;inset:0;pointer-events:none}.gate{position:absolute;right:3%;width:46px;height:46px;border:2px solid #e6d9ff;border-radius:50%;background:#674e9e;color:#fff;font-size:25px;font-weight:900;pointer-events:auto;box-shadow:0 4px 10px #1116}.gate:active{transform:scale(.94)}.star-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.star-actions .primary{width:auto;min-width:135px;flex:1}.star-small{border:0;border-radius:15px;background:#ede7f7;color:#554581;font-weight:800;min-height:56px;padding:0 15px}.star-small:disabled{opacity:.45}.star-panel .status{font-size:15px;margin:12px 0}`);
}
