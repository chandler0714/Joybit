import type { LanguageCode } from '../i18n/translations.ts';
import { escapeHtml, gamePage } from './page.ts';

const kinds = ['cup', 'book', 'leaf', 'key', 'clock', 'lamp', 'vase', 'pillow', 'apple', 'letter', 'candle', 'shell', 'bell', 'bow', 'mushroom', 'teapot', 'star', 'brush'] as const;
type Kind = typeof kinds[number];
export type HiddenObject = { kind: Kind; slot: number; x: number; y: number };
export type HiddenLevel = { number: number; objects: HiddenObject[]; targets: Kind[]; seconds: number; hints: number };

function randomFor(number: number): () => number {
  let state = (Math.imul(number, 0x9e3779b1) ^ 0x4e4f4f4b) >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function generateHiddenLevel(number: number): HiddenLevel {
  const n = Number.isSafeInteger(number) && number > 0 ? number : 1;
  const random = randomFor(n);
  const tier = Math.min(5, Math.floor((n - 1) / 20));
  const count = Math.min(18, 10 + tier * 2);
  const targetCount = Math.min(6, 3 + Math.floor(tier / 2) + (tier === 5 ? 1 : 0));
  const selectedKinds = shuffle(kinds, random).slice(0, count);
  const slots = shuffle(Array.from({ length: 25 }, (_, index) => index), random).slice(0, count);
  const targets = shuffle(selectedKinds, random).slice(0, targetCount);
  const objects = selectedKinds.map((kind, index) => ({ kind, slot: slots[index], x: 10 + (slots[index] % 5) * 20, y: 10 + Math.floor(slots[index] / 5) * 20 }));
  return { number: n, objects, targets, seconds: Math.max(95, 180 - tier * 17), hints: 2 };
}

const words: Record<LanguageCode, { ui: readonly string[]; objects: readonly string[] }> = {
  en: { ui: ['Hidden Nook', 'Find the little treasures tucked around this cozy room.', 'Level', 'Found', 'Time', 'Hints', 'Start', 'Pause', 'Resume', 'Restart', 'Hint', 'All treasures found!', 'Time is up. Try again!', 'Tap the objects in the tray.', 'The room is paused.', 'Look for'], objects: ['Cup','Book','Leaf','Key','Clock','Lamp','Vase','Pillow','Apple','Letter','Candle','Shell','Bell','Bow','Mushroom','Teapot','Star','Brush'] },
  ja: { ui: ['かくれた小部屋', '居心地のよい部屋に隠れた宝物を見つけよう。', 'レベル', '発見', '時間', 'ヒント', '開始', '一時停止', '再開', 'やり直す', 'ヒント', '宝物を全部発見！', '時間切れ。もう一度！', '下の一覧の物をタップしよう。', '一時停止中', '探してみよう'], objects: ['カップ','本','葉','鍵','時計','ランプ','花瓶','クッション','りんご','手紙','ろうそく','貝殻','ベル','リボン','きのこ','ティーポット','星','筆'] },
  ko: { ui: ['숨은 아늑한 방', '포근한 방에 숨은 작은 보물을 찾아보세요.', '레벨', '찾음', '시간', '힌트', '시작', '일시 정지', '계속', '다시 시작', '힌트', '보물을 모두 찾았어요!', '시간이 다 됐어요. 다시 해 보세요!', '아래 목록의 물건을 탭하세요.', '일시 정지됨', '찾아보세요'], objects: ['컵','책','잎','열쇠','시계','램프','꽃병','베개','사과','편지','양초','조개','종','리본','버섯','찻주전자','별','붓'] },
  fr: { ui: ['Le coin caché', 'Trouvez les petits trésors dans cette pièce douillette.', 'Niveau', 'Trouvés', 'Temps', 'Indices', 'Jouer', 'Pause', 'Reprendre', 'Recommencer', 'Indice', 'Tous les trésors sont trouvés !', 'Temps écoulé. Réessayez !', 'Touchez les objets de la liste.', 'La partie est en pause.', 'Cherchez'], objects: ['Tasse','Livre','Feuille','Clé','Horloge','Lampe','Vase','Coussin','Pomme','Lettre','Bougie','Coquillage','Cloche','Nœud','Champignon','Théière','Étoile','Pinceau'] },
  es: { ui: ['Rincón escondido', 'Encuentra los pequeños tesoros en esta acogedora habitación.', 'Nivel', 'Hallados', 'Tiempo', 'Pistas', 'Empezar', 'Pausa', 'Continuar', 'Reiniciar', 'Pista', '¡Encontraste todos los tesoros!', 'Se acabó el tiempo. ¡Inténtalo de nuevo!', 'Toca los objetos de la lista.', 'Juego en pausa.', 'Busca'], objects: ['Taza','Libro','Hoja','Llave','Reloj','Lámpara','Jarrón','Cojín','Manzana','Carta','Vela','Concha','Campana','Lazo','Seta','Tetera','Estrella','Pincel'] },
  ru: { ui: ['Уютный уголок', 'Найдите маленькие сокровища в уютной комнате.', 'Уровень', 'Найдено', 'Время', 'Подсказки', 'Начать', 'Пауза', 'Продолжить', 'Заново', 'Подсказка', 'Все сокровища найдены!', 'Время вышло. Попробуйте снова!', 'Нажимайте на предметы из списка.', 'Игра на паузе.', 'Ищите'], objects: ['Чашка','Книга','Лист','Ключ','Часы','Лампа','Ваза','Подушка','Яблоко','Письмо','Свеча','Ракушка','Колокол','Бант','Гриб','Чайник','Звезда','Кисть'] },
  de: { ui: ['Verstecktes Stübchen', 'Finde kleine Schätze in diesem gemütlichen Zimmer.', 'Level', 'Gefunden', 'Zeit', 'Hinweise', 'Starten', 'Pause', 'Weiter', 'Neustart', 'Hinweis', 'Alle Schätze gefunden!', 'Zeit abgelaufen. Versuch es erneut!', 'Tippe auf die Gegenstände in der Liste.', 'Das Spiel ist pausiert.', 'Suche'], objects: ['Tasse','Buch','Blatt','Schlüssel','Uhr','Lampe','Vase','Kissen','Apfel','Brief','Kerze','Muschel','Glocke','Schleife','Pilz','Teekanne','Stern','Pinsel'] },
};

// Every icon is an original SVG drawing. The click area is the full grid slot, not the drawing.
const icon: Record<Kind, string> = {
  cup: '<path d="M12 16h21v15a10 10 0 0 1-21 0z" fill="#e9a989"/><path d="M33 19h5a5 5 0 0 1 0 10h-5" fill="none" stroke="#9f615e" stroke-width="3"/><path d="M10 41h29" stroke="#714f58" stroke-width="3"/>',
  book: '<path d="M9 10h30v31H9z" fill="#806a9e"/><path d="M14 10v31M20 17h13M20 22h10" stroke="#e5c8ad" stroke-width="2"/>',
  leaf: '<path d="M10 37Q8 14 38 10Q41 36 19 40Q12 41 10 37" fill="#80ae82"/><path d="M12 38Q24 28 37 12" stroke="#426f64" stroke-width="2" fill="none"/>',
  key: '<circle cx="17" cy="19" r="8" fill="none" stroke="#dcb364" stroke-width="5"/><path d="M23 25l15 15m-6-6 5-5" stroke="#dcb364" stroke-width="5" fill="none"/>',
  clock: '<circle cx="24" cy="24" r="17" fill="#f4dbad" stroke="#826b75" stroke-width="3"/><path d="M24 13v12l8 5" fill="none" stroke="#826b75" stroke-width="3"/>',
  lamp: '<path d="M17 8h14l6 17H11z" fill="#f6d17d"/><path d="M24 25v14m-9 2h18" stroke="#876771" stroke-width="3"/>',
  vase: '<path d="M17 8h14v5l-4 5q13 9 8 21H13q-5-12 8-21l-4-5z" fill="#89b7ba" stroke="#597f88" stroke-width="2"/>',
  pillow: '<rect x="8" y="11" width="32" height="28" rx="9" fill="#d5a0b4" stroke="#a9778d" stroke-width="2"/><path d="M18 23h12" stroke="#fff1e9" stroke-width="2"/>',
  apple: '<path d="M24 17Q8 8 9 27q1 18 15 12 14 6 15-12Q40 8 24 17" fill="#d8796e"/><path d="M24 16q0-8 5-10m-4 8q6-8 12-5" stroke="#657d59" stroke-width="3" fill="none"/>',
  letter: '<rect x="7" y="13" width="34" height="25" rx="2" fill="#f3dfb9" stroke="#bd9d83" stroke-width="2"/><path d="M8 15l16 13 16-13" fill="none" stroke="#bd9d83" stroke-width="2"/>',
  candle: '<rect x="17" y="21" width="14" height="20" rx="2" fill="#f1dbb5"/><path d="M24 20q-8-8 0-15 8 8 0 15" fill="#f3ac6e"/><path d="M14 42h20" stroke="#8b7285" stroke-width="3"/>',
  shell: '<path d="M8 34q0-23 16-23t16 23q-16 14-32 0" fill="#eabfae" stroke="#9f7a88" stroke-width="2"/><path d="M24 12v27M17 15l3 24M31 15l-3 24" stroke="#bd8f98" stroke-width="2"/>',
  bell: '<path d="M13 34h22l-3-6V19q0-9-8-9t-8 9v9z" fill="#dfb86b"/><circle cx="24" cy="39" r="3" fill="#92705c"/>',
  bow: '<path d="M24 23Q5 5 7 25Q8 39 24 27Q40 39 41 25Q43 5 24 23" fill="#c48fa9" stroke="#906d8d" stroke-width="2"/><circle cx="24" cy="25" r="4" fill="#edc9cf"/>',
  mushroom: '<path d="M18 25h12v15H18z" fill="#e8d7b8"/><path d="M6 25Q8 5 24 5t18 20z" fill="#bb7776"/><circle cx="17" cy="15" r="3" fill="#f3d9c7"/><circle cx="29" cy="19" r="3" fill="#f3d9c7"/>',
  teapot: '<path d="M11 20h25v13q-2 9-12 9T11 33z" fill="#95b3aa"/><path d="M11 25L3 21v9l8-1M36 22h5q6 1 4 8-1 6-9 5M20 14h8M24 14v6" fill="none" stroke="#63877e" stroke-width="3"/>',
  star: '<path d="M24 5l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z" fill="#e7bd70" stroke="#aa8566" stroke-width="2"/>',
  brush: '<path d="M9 38L31 15l5 5-23 22z" fill="#a78670"/><path d="M30 16q0-11 11-11 2 12-6 15z" fill="#8aa7ba"/>',
};

export function hiddenHtml(locale: LanguageCode, level = 1): string {
  const c = words[locale] ?? words.en;
  const config = generateHiddenLevel(level);
  const names = Object.fromEntries(kinds.map((kind, index) => [kind, c.objects[index]]));
  const objectMarkup = config.objects.map(object => `<button type="button" class="object" data-kind="${object.kind}" style="left:${object.x}%;top:${object.y}%" aria-label="${escapeHtml(names[object.kind])}"><svg viewBox="0 0 48 48" aria-hidden="true">${icon[object.kind]}</svg></button>`).join('');
  const trayMarkup = config.targets.map(kind => `<span class="target" data-kind="${kind}">${escapeHtml(names[kind])}</span>`).join('');
  const data = JSON.stringify(config).replace(/</g, '\\u003c');
  const labels = JSON.stringify({ ui: c.ui, names }).replace(/</g, '\\u003c');
  return gamePage(locale, c.ui[0], '#a46f73', `
<p class="intro">${escapeHtml(c.ui[1])}</p><section class="hidden-panel">
<div class="hidden-hud"><span>${escapeHtml(c.ui[2])} <b>${config.number}</b></span><span>${escapeHtml(c.ui[3])} <b id="found">0 / ${config.targets.length}</b></span><span>${escapeHtml(c.ui[4])} <b id="time">${config.seconds}</b>s</span></div>
<div class="room" id="room" role="group" aria-label="${escapeHtml(c.ui[0])}">
<svg class="room-art" viewBox="0 0 360 360" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="wall" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M0 20h20" stroke="#f4e8d9" stroke-width="2"/></pattern></defs><rect width="360" height="360" fill="#f6e9dc"/><rect width="360" height="216" fill="url(#wall)"/><rect y="215" width="360" height="145" fill="#d9b99f"/><path d="M0 215h360" stroke="#b68d79" stroke-width="9"/><rect x="12" y="12" width="93" height="103" rx="12" fill="#b8d8da" stroke="#b88874" stroke-width="9"/><path d="M59 15v99M16 65h88" stroke="#b88874" stroke-width="6"/><circle cx="39" cy="38" r="10" fill="#f8dfa2"/><path d="M8 178h345M8 185h345" stroke="#a4786a" stroke-width="9"/><rect x="184" y="99" width="149" height="103" rx="20" fill="#b9a5a6"/><rect x="177" y="160" width="166" height="67" rx="17" fill="#ae8d93"/><rect x="195" y="224" width="12" height="27" fill="#826c72"/><rect x="314" y="224" width="12" height="27" fill="#826c72"/><ellipse cx="155" cy="298" rx="130" ry="42" fill="#f0d8b7" stroke="#c89f8b" stroke-width="5"/><path d="M0 350Q180 330 360 350" fill="none" stroke="#c19680" stroke-width="4"/></svg>
<svg class="room-decor" viewBox="0 0 360 360" preserveAspectRatio="none" aria-hidden="true"><path d="M105 16L220 235L92 234Z" fill="#ffe5a3" opacity=".22"/><path d="M12 148h116M22 151v55M117 151v55" fill="none" stroke="#93664e" stroke-width="8" stroke-linecap="round"/><rect x="20" y="116" width="24" height="31" rx="2" fill="#9676a1"/><rect x="46" y="112" width="14" height="35" rx="2" fill="#db9c77"/><rect x="63" y="121" width="22" height="26" rx="2" fill="#75a09a"/><rect x="90" y="115" width="19" height="32" rx="2" fill="#e3c37e"/><path d="M28 209q-22-20-14-49 22 10 23 32-3-39 19-48 8 35-15 60" fill="#66956e"/><path d="M17 204h35l-6 32H23z" fill="#c98165"/><path d="M225 185q-5-37 20-50-2 35-16 51 19-35 37-26-5 28-34 33" fill="#6a9974" opacity=".75"/><path d="M262 217h76" stroke="#8b675d" stroke-width="6"/><path d="M28 305q120-55 252-10" fill="none" stroke="#fff0d2" stroke-width="10" opacity=".6"/><circle cx="305" cy="48" r="19" fill="#ffe4a3" opacity=".55"/><path d="M305 66v51" stroke="#9b765f" stroke-width="3"/></svg>
${objectMarkup}<div id="veil" class="veil" hidden></div></div>
<div class="tray"><div class="tray-title">${escapeHtml(c.ui[13])}</div><div id="targets" class="targets">${trayMarkup}</div></div>
<p id="status" class="status" role="status"></p><div class="hidden-actions"><button id="start" class="primary">${escapeHtml(c.ui[6])}</button><button id="hint" class="small" disabled>${escapeHtml(c.ui[10])} · <span id="hints-left">${config.hints}</span></button><button id="pause" class="small" disabled>${escapeHtml(c.ui[7])}</button><button id="restart" class="small">${escapeHtml(c.ui[9])}</button></div></section>`, `
const level=${data}, copy=${labels};const room=document.getElementById('room'),status=document.getElementById('status'),foundEl=document.getElementById('found'),timeEl=document.getElementById('time'),start=document.getElementById('start'),hint=document.getElementById('hint'),pause=document.getElementById('pause'),restart=document.getElementById('restart'),veil=document.getElementById('veil'),hintsLeft=document.getElementById('hints-left');
let phase='ready',remaining=level.seconds,hints=level.hints,found=new Set(),timer=null;
function stopTimer(){if(timer!==null){clearInterval(timer);timer=null;}}
function render(){foundEl.textContent=found.size+' / '+level.targets.length;timeEl.textContent=String(remaining);hintsLeft.textContent=String(hints);room.querySelectorAll('.object').forEach(button=>{const done=found.has(button.dataset.kind);button.classList.toggle('found',done);button.disabled=done||phase!=='playing';button.classList.remove('glow');});document.querySelectorAll('.target').forEach(item=>item.classList.toggle('found',found.has(item.dataset.kind)));veil.hidden=phase!=='paused';start.hidden=phase!=='ready';hint.disabled=phase!=='playing'||hints===0;pause.disabled=phase!=='playing'&&phase!=='paused';pause.textContent=phase==='paused'?copy.ui[8]:copy.ui[7];}
function finish(won){stopTimer();phase=won?'won':'lost';status.textContent=copy.ui[won?11:12];render();if(won)window.ReactNativeWebView?.postMessage(JSON.stringify({type:'levelComplete',game:'hidden',level:level.number}));}
function tick(){if(phase!=='playing')return;remaining--;timeEl.textContent=String(remaining);if(remaining<=0)finish(false);}
function begin(){if(phase!=='ready'||document.hidden)return;phase='playing';status.textContent=copy.ui[13];timer=setInterval(tick,1000);render();}
start.addEventListener('click',begin);
room.querySelectorAll('.object').forEach(button=>button.addEventListener('click',()=>{if(phase!=='playing')return;const kind=button.dataset.kind;if(!level.targets.includes(kind)||found.has(kind))return;found.add(kind);status.textContent=copy.names[kind];if(found.size===level.targets.length)finish(true);else render();}));
hint.addEventListener('click',()=>{if(phase!=='playing'||hints===0)return;const kind=level.targets.find(value=>!found.has(value));if(!kind)return;hints--;status.textContent=copy.ui[15]+' '+copy.names[kind];render();const button=room.querySelector('.object[data-kind="'+kind+'"]');button.classList.add('glow');});
function pauseGame(){if(phase!=='playing')return;phase='paused';stopTimer();status.textContent=copy.ui[14];render();}
pause.addEventListener('click',()=>{if(phase==='playing')pauseGame();else if(phase==='paused'&&!document.hidden){phase='playing';status.textContent=copy.ui[13];timer=setInterval(tick,1000);render();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});
restart.addEventListener('click',()=>{stopTimer();phase='ready';remaining=level.seconds;hints=level.hints;found=new Set();status.textContent='';render();});
window.addEventListener('pagehide',stopTimer);render();`, `
.hidden-panel{background:#fff9ee;border:2px solid #eddfce;border-radius:26px;padding:12px;box-shadow:0 10px 35px #a4704f2b}.hidden-hud{display:flex;justify-content:space-between;gap:4px;margin-bottom:10px;font-size:12px;color:#7d6265;font-weight:700}.hidden-hud span{background:#f7efea;border-radius:10px;padding:7px 9px}.hidden-hud b{color:#58444e}.room{position:relative;width:100%;max-width:360px;aspect-ratio:1;margin:auto;overflow:hidden;border:7px solid #bc906f;border-radius:23px;background:#f6e9dc;box-shadow:inset 0 0 0 3px #fff4d9,0 8px 15px #76513e45}.room-art,.room-decor{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.object{position:absolute;transform:translate(-50%,-50%);width:16%;height:16%;min-width:42px;min-height:42px;border:0;border-radius:50%;background:#fff4d455;display:grid;place-items:center;padding:3px;box-shadow:0 3px 7px #694f4a33;z-index:2}.object:active{transform:translate(-50%,-50%) scale(.88)}.object svg{width:100%;height:100%;filter:drop-shadow(0 2px 2px #5547)}.object.found{opacity:.22;box-shadow:none}.object.glow{outline:4px solid #f9d066;box-shadow:0 0 0 8px #fff4aeaa;animation:pulse 1s ease-in-out infinite alternate}@keyframes pulse{to{box-shadow:0 0 0 13px #fff4ae55}}.veil{position:absolute;inset:0;z-index:3;background:#e9d5c9dc}.veil::after{content:'Ⅱ';position:absolute;inset:0;display:grid;place-items:center;font-size:75px;color:#876575}.tray{margin-top:12px;background:#fbf4ef;border-radius:17px;padding:10px}.tray-title{font-size:12px;color:#90767a;margin-bottom:6px}.targets{display:flex;flex-wrap:wrap;gap:6px}.target{padding:6px 10px;border-radius:12px;background:#fff;border:1px solid #d7b8ae;font-size:13px;font-weight:700;color:#73545d}.target.found{text-decoration:line-through;opacity:.45}.hidden-panel .status{font-size:15px;margin:10px 0}.hidden-actions{display:flex;flex-wrap:wrap;gap:8px}.hidden-actions .primary{flex:1;min-width:110px;max-width:none;font-size:15px;min-height:46px}.small{border:0;border-radius:14px;background:#eddcd8;color:#694e59;font-weight:800;min-height:46px;padding:0 12px}.small:disabled{opacity:.48}[hidden]{display:none!important}@media(max-width:360px){body{padding-left:12px;padding-right:12px}.hidden-panel{padding:9px}.object{min-width:40px;min-height:40px}}`);
}
