import { LANGUAGE_CODES, translate, type LanguageCode } from '../i18n/translations.ts';
import { escapeHtml, gamePage } from './page.ts';

export type KitchenOrder = { id: number; recipe: string; steps: string[] };
export type KitchenLevel = { level: number; timeLimitSec: number; activeSlots: number; actions: string[]; orders: KitchenOrder[] };

const recipes = [
  { key: 'toast', steps: ['bread', 'cheese', 'grill'] },
  { key: 'soup', steps: ['water', 'mushroom', 'simmer'] },
  { key: 'salad', steps: ['lettuce', 'tomato', 'mix'] },
  { key: 'riceDish', steps: ['rice', 'egg', 'stir'] },
  { key: 'dumpling', steps: ['dough', 'mushroom', 'steam'] },
  { key: 'garden', steps: ['bread', 'lettuce', 'tomato', 'mix'] },
] as const;

// The same JavaScript generator runs in native and the offline WebView.
const generatorBody = `
  level = Number.isSafeInteger(level) && level > 0 ? level : 1;
  const recipes = ${JSON.stringify(recipes)};
  let seed = (Math.imul(level, 0x9e3779b1) ^ 0x6b697463) >>> 0;
  function random() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }
  const count = Math.min(6, 2 + Math.floor((level - 1) / 20));
  const activeSlots = Math.min(3, 1 + Math.floor((level - 1) / 35));
  const available = Math.min(recipes.length, 2 + Math.floor((level - 1) / 15));
  const orders = [];
  for (let id = 0; id < count; id++) {
    const recipe = recipes[Math.floor(random() * available)];
    orders.push({ id, recipe: recipe.key, steps: [...recipe.steps] });
  }
  const actions = [...new Set(recipes.slice(0, available).flatMap(recipe => recipe.steps))];
  const minimum = orders.reduce((sum, order) => sum + order.steps.length * 5 + 4, 0);
  const timeLimitSec = Math.min(180, Math.max(45, minimum + Math.max(8, 26 - Math.floor(level / 8))));
  return { level, timeLimitSec, activeSlots, actions, orders };
`;

const generate = new Function('level', generatorBody) as (level: number) => KitchenLevel;
export function generateKitchenLevel(level: number): KitchenLevel { return generate(level); }

type Seven = readonly [string, string, string, string, string, string, string];
const copy = {
  intro: ['Tap the recipe steps in order, then deliver every dish before time runs out.', 'レシピの順にタップして、時間内にすべて届けよう。', '레시피 순서대로 누르고 시간이 끝나기 전에 모두 전달하세요.', 'Touchez les étapes dans l’ordre, puis servez tous les plats à temps.', 'Toca los pasos en orden y entrega todos los platos a tiempo.', 'Нажимайте шаги по порядку и подайте все блюда вовремя.', 'Tippe die Schritte der Reihe nach und serviere alle Gerichte rechtzeitig.'],
  level: ['Level {level}', 'レベル {level}', '레벨 {level}', 'Niveau {level}', 'Nivel {level}', 'Уровень {level}', 'Level {level}'],
  ready: ['Kitchen is ready', 'キッチンの準備完了', '주방 준비 완료', 'Cuisine prête', 'Cocina lista', 'Кухня готова', 'Küche bereit'],
  cooking: ['Follow the ticket', '注文票の順に作ろう', '주문서 순서대로 만드세요', 'Suivez le ticket', 'Sigue la comanda', 'Следуйте заказу', 'Folge dem Bon'],
  paused: ['Paused', '一時停止', '일시정지', 'Pause', 'Pausado', 'Пауза', 'Pausiert'],
  wrong: ['Check the next step', '次の手順を確認', '다음 단계를 확인하세요', 'Vérifiez la prochaine étape', 'Revisa el siguiente paso', 'Проверьте следующий шаг', 'Prüfe den nächsten Schritt'],
  timeup: ['Time is up! Try again.', '時間切れ！もう一度。', '시간 종료! 다시 해 보세요.', 'Temps écoulé ! Réessayez.', '¡Se acabó el tiempo! Inténtalo de nuevo.', 'Время вышло! Попробуйте снова.', 'Zeit um! Versuch es erneut.'],
  complete: ['Level complete!', 'レベルクリア！', '레벨 완료!', 'Niveau terminé !', '¡Nivel completado!', 'Уровень пройден!', 'Level geschafft!'],
  start: ['Open kitchen', 'キッチンを開く', '주방 열기', 'Ouvrir la cuisine', 'Abrir cocina', 'Открыть кухню', 'Küche öffnen'],
  pause: ['Pause', '一時停止', '일시정지', 'Pause', 'Pausar', 'Пауза', 'Pause'],
  resume: ['Resume', '再開', '계속', 'Reprendre', 'Continuar', 'Продолжить', 'Weiter'],
  retry: ['Retry', 'やり直す', '다시 하기', 'Réessayer', 'Reintentar', 'Повторить', 'Erneut'],
  deliver: ['Deliver dish', '料理を届ける', '요리 전달', 'Servir le plat', 'Entregar plato', 'Подать блюдо', 'Gericht servieren'],
  tickets: ['Orders', '注文', '주문', 'Commandes', 'Pedidos', 'Заказы', 'Bestellungen'],
  steps: ['Recipe', 'レシピ', '레시피', 'Recette', 'Receta', 'Рецепт', 'Rezept'],
  actions: ['Ingredients & tools', '食材と調理', '재료와 조리', 'Ingrédients et outils', 'Ingredientes y utensilios', 'Ингредиенты и инструменты', 'Zutaten und Werkzeuge'],
  toast: ['Cheese toast', 'チーズトースト', '치즈 토스트', 'Toast au fromage', 'Tostada de queso', 'Тост с сыром', 'Käsetoast'],
  soup: ['Mushroom soup', 'きのこスープ', '버섯 수프', 'Soupe aux champignons', 'Sopa de champiñones', 'Грибной суп', 'Pilzsuppe'],
  salad: ['Garden salad', 'ガーデンサラダ', '가든 샐러드', 'Salade du jardin', 'Ensalada de huerta', 'Садовый салат', 'Gartensalat'],
  riceDish: ['Egg rice', 'たまごライス', '달걀밥', 'Riz aux œufs', 'Arroz con huevo', 'Рис с яйцом', 'Eierreis'],
  dumpling: ['Mushroom dumpling', 'きのこ点心', '버섯 만두', 'Ravioli aux champignons', 'Empanadilla de setas', 'Пельмени с грибами', 'Pilzteigtasche'],
  garden: ['Garden sandwich', 'ガーデンサンド', '가든 샌드위치', 'Sandwich du jardin', 'Sándwich de huerta', 'Садовый сэндвич', 'Gartensandwich'],
  bread: ['Bread', 'パン', '빵', 'Pain', 'Pan', 'Хлеб', 'Brot'], cheese: ['Cheese', 'チーズ', '치즈', 'Fromage', 'Queso', 'Сыр', 'Käse'], grill: ['Grill', '焼く', '굽기', 'Griller', 'Asar', 'Обжарить', 'Grillen'],
  water: ['Water', '水', '물', 'Eau', 'Agua', 'Вода', 'Wasser'], mushroom: ['Mushroom', 'きのこ', '버섯', 'Champignon', 'Champiñón', 'Грибы', 'Pilze'], simmer: ['Simmer', '煮る', '끓이기', 'Mijoter', 'Hervir', 'Варить', 'Köcheln'],
  lettuce: ['Lettuce', 'レタス', '상추', 'Laitue', 'Lechuga', 'Салат', 'Salat'], tomato: ['Tomato', 'トマト', '토마토', 'Tomate', 'Tomate', 'Помидор', 'Tomate'], mix: ['Mix', '混ぜる', '섞기', 'Mélanger', 'Mezclar', 'Смешать', 'Mischen'],
  rice: ['Rice', 'ごはん', '밥', 'Riz', 'Arroz', 'Рис', 'Reis'], egg: ['Egg', '卵', '달걀', 'Œuf', 'Huevo', 'Яйцо', 'Ei'], stir: ['Stir', '炒める', '볶기', 'Remuer', 'Saltear', 'Обжарить', 'Rühren'],
  dough: ['Dough', '生地', '반죽', 'Pâte', 'Masa', 'Тесто', 'Teig'], steam: ['Steam', '蒸す', '찌기', 'Cuire vapeur', 'Cocer al vapor', 'На пару', 'Dämpfen'],
} satisfies Record<string, Seven>;

function local(locale: LanguageCode) {
  return Object.fromEntries(Object.entries(copy).map(([key, values]) => [key, values[LANGUAGE_CODES.indexOf(locale)]])) as Record<keyof typeof copy, string>;
}

export function kitchenHtml(locale: LanguageCode, level = 1): string {
  const config = generateKitchenLevel(level);
  const words = local(locale);
  return gamePage(locale, translate(locale, 'gameKitchen'), '#DA7151', `
<p class="intro">${escapeHtml(words.intro)}</p>
<section class="panel kitchen-panel">
  <div class="kitchen-top"><span id="level-label"></span><span class="clock-wrap">◷ <span id="clock"></span>s</span><span id="done"></span></div>
  <div id="status" class="status" role="status">${escapeHtml(words.ready)}</div>
  <div class="kitchen-controls"><button id="start" class="primary">${escapeHtml(words.start)}</button><button id="pause">${escapeHtml(words.pause)}</button><button id="restart">${escapeHtml(words.retry)}</button></div>
  <div class="counter-art" aria-hidden="true"><div class="tile-wall"></div><div class="shelf"><i></i><i></i><i></i></div><div id="customer-queue" class="customer-queue"></div><div class="chef">👩‍🍳</div><div class="plate"><div id="food-display" class="food-display">🍳</div></div><div class="counter-front"></div></div>
  <h2>${escapeHtml(words.tickets)}</h2><div id="orders" class="orders"></div>
  <h2>${escapeHtml(words.steps)} <span id="step-progress"></span></h2><div id="recipe" class="recipe"></div>
  <h2>${escapeHtml(words.actions)}</h2><div id="actions" class="actions"></div>
  <button id="deliver" class="primary deliver">${escapeHtml(words.deliver)}</button>
</section>`, `
const words=${JSON.stringify(words).replace(/</g, '\\u003c')};
const config=${JSON.stringify(config)};
const label=(key,values={})=>words[key].replace(/\\{([a-zA-Z]+)\\}/g,(_,name)=>String(values[name]??'{'+name+'}'));
const orderBox=document.getElementById('orders'),recipeBox=document.getElementById('recipe'),actionsBox=document.getElementById('actions');
const foodDisplay=document.getElementById('food-display'),customerQueue=document.getElementById('customer-queue');
const marks={bread:'🍞',cheese:'🧀',grill:'🔥',water:'💧',mushroom:'🍄',simmer:'♨️',lettuce:'🥬',tomato:'🍅',mix:'🥣',rice:'🍚',egg:'🥚',stir:'🥄',dough:'🥟',steam:'♨️'};
const dishes={toast:'🥪',soup:'🍲',salad:'🥗',riceDish:'🍳',dumpling:'🥟',garden:'🥪'};
const guests=['👩','👨','👵','👨‍🦱','👩‍🦰','👴'];
const start=document.getElementById('start'),pause=document.getElementById('pause'),restart=document.getElementById('restart'),deliver=document.getElementById('deliver');
const status=document.getElementById('status');
let mode='ready',seconds=config.timeLimitSec,timer=null,selected=0,progress=0,done=new Set(),posted=false;
function clearClock(){if(timer!==null){clearTimeout(timer);timer=null;}}
function schedule(){if(mode==='running')timer=setTimeout(tick,1000);}
function tick(){timer=null;if(mode!=='running')return;seconds--;if(seconds<=0){seconds=0;mode='lost';status.textContent=words.timeup;}render();schedule();}
function activeOrders(){return config.orders.filter(order=>!done.has(order.id)).slice(0,config.activeSlots);}
function render(){
  document.getElementById('level-label').textContent=label('level',{level:config.level});
  document.getElementById('clock').textContent=String(seconds);
  document.getElementById('done').textContent=done.size+' / '+config.orders.length;
  const active=activeOrders();
  if(active.length&&!active.some(order=>order.id===selected)){selected=active[0].id;progress=0;}
  orderBox.replaceChildren();
  customerQueue.textContent=active.map(order=>guests[order.id%guests.length]).join(' ');
  for(const order of active){const button=document.createElement('button');button.type='button';button.className='ticket'+(order.id===selected?' selected':'');button.dataset.order=String(order.id);button.disabled=mode!=='running';button.innerHTML='<span class="ticket-guest" aria-hidden="true">'+guests[order.id%guests.length]+'</span><span class="ticket-num">#'+(order.id+1)+'</span><strong>'+words[order.recipe]+'</strong><span class="ticket-count">'+order.steps.length+' ●</span>';
    button.addEventListener('click',()=>{if(mode!=='running')return;selected=order.id;progress=0;status.textContent=words.cooking;render();});orderBox.appendChild(button);}
  const order=active.find(item=>item.id===selected);
  foodDisplay.textContent=!order?'🍽️':progress===order.steps.length?dishes[order.recipe]:progress>0?marks[order.steps[progress-1]]:'🍳';
  document.getElementById('step-progress').textContent=order?progress+' / '+order.steps.length:'0 / 0';
  recipeBox.replaceChildren();
  if(order)for(const [index,step] of order.steps.entries()){const chip=document.createElement('span');chip.className='recipe-chip'+(index<progress?' checked':'')+(index===progress?' next-step':'');chip.textContent=(index+1)+'. '+words[step];recipeBox.appendChild(chip);}
  actionsBox.replaceChildren();
  for(const action of config.actions){const button=document.createElement('button');button.type='button';button.className='action action-'+action;button.dataset.action=action;button.disabled=mode!=='running';const mark=document.createElement('span');mark.className='action-mark';mark.textContent=marks[action];mark.setAttribute('aria-hidden','true');const title=document.createElement('span');title.textContent=words[action];button.append(mark,title);button.addEventListener('click',()=>useAction(action));actionsBox.appendChild(button);}
  deliver.disabled=mode!=='running'||!order||progress!==order.steps.length;
  start.hidden=mode!=='ready';pause.hidden=mode!=='running'&&mode!=='paused';restart.hidden=mode==='ready';deliver.hidden=mode==='ready'||mode==='won';
  pause.textContent=mode==='paused'?words.resume:words.pause;
}
function useAction(action){if(mode!=='running')return;const order=config.orders.find(item=>item.id===selected);if(!order)return;
  if(order.steps[progress]===action){progress++;status.textContent=words.cooking;}else{progress=0;status.textContent=words.wrong;}render();}
function begin(){clearClock();mode='running';seconds=config.timeLimitSec;selected=0;progress=0;done=new Set();posted=false;status.textContent=words.cooking;render();schedule();}
start.addEventListener('click',begin);restart.addEventListener('click',begin);
pause.addEventListener('click',()=>{if(mode==='running'){clearClock();mode='paused';status.textContent=words.paused;}else if(mode==='paused'){mode='running';status.textContent=words.cooking;schedule();}render();});
deliver.addEventListener('click',()=>{if(mode!=='running')return;const order=config.orders.find(item=>item.id===selected);if(!order||progress!==order.steps.length)return;done.add(order.id);progress=0;
  if(done.size===config.orders.length){clearClock();mode='won';status.textContent=words.complete;if(!posted){posted=true;window.ReactNativeWebView?.postMessage(JSON.stringify({type:'levelComplete',game:'kitchen',level:config.level}));}}
  render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='running')pause.click();});
window.addEventListener('pagehide',clearClock);render();`, `
.kitchen-panel{min-height:610px;justify-content:flex-start;align-items:stretch;padding:18px 15px 24px;background:#fffaf4}
.kitchen-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#7b463c;font-size:13px;font-weight:800}.clock-wrap{background:#ffe6d7;padding:8px 12px;border-radius:15px;font-size:17px;font-variant-numeric:tabular-nums}
.kitchen-panel .status{margin:12px 0 6px;color:#8e513d;font-size:16px}.kitchen-panel h2{font-size:13px;text-transform:uppercase;letter-spacing:1.3px;color:#9a6b5b;margin:16px 0 9px;display:flex;justify-content:space-between}.kitchen-panel h2 span{letter-spacing:0}
.counter-art{height:158px;position:relative;overflow:hidden;border-radius:18px;background:#eec9ab;border:4px solid #e7b892;box-shadow:0 8px 17px #a7704c36}.counter-art::before{content:'';position:absolute;inset:0 0 auto;height:32px;background:repeating-linear-gradient(90deg,#e76861 0 29px,#fff8e5 29px 58px);clip-path:polygon(0 0,100% 0,100% 75%,96% 100%,92% 75%,88% 100%,84% 75%,80% 100%,76% 75%,72% 100%,68% 75%,64% 100%,60% 75%,56% 100%,52% 75%,48% 100%,44% 75%,40% 100%,36% 75%,32% 100%,28% 75%,24% 100%,20% 75%,16% 100%,12% 75%,8% 100%,4% 75%,0 100%);z-index:3;filter:drop-shadow(0 3px 2px #a35249)}.tile-wall{position:absolute;inset:30px 0 20px;background:repeating-linear-gradient(0deg,transparent 0 23px,#ffffff70 24px 25px),repeating-linear-gradient(90deg,#f9e5cb 0 35px,#f3d8bc 36px 37px)}.shelf{position:absolute;top:76px;left:8%;right:8%;height:7px;border-radius:5px;background:#985e48;display:flex;justify-content:space-around;box-shadow:0 3px 4px #8a533d55}.shelf i{width:23px;height:26px;transform:translateY(-26px);background:#cb764d;border-radius:5px 5px 2px 2px}.shelf i:nth-child(2){background:#8aa66c}.shelf i:nth-child(3){background:#e9a74d}.chef{position:absolute;right:8%;bottom:5px;font-size:65px;line-height:1;filter:drop-shadow(0 4px 3px #85543b55);z-index:2}.plate{position:absolute;left:40%;bottom:7px;transform:translateX(-50%);width:128px;height:57px;border-radius:50%;background:#fffefa;border:6px solid #e3dcd1;box-shadow:0 4px 4px #704c3b40;z-index:2}.plate-inner{position:absolute;inset:7px 16px;border-radius:50%;border:2px solid #e8ddd3;background:radial-gradient(ellipse,#f4d38c 0 35%,#92bf6f 36% 58%,#fff9e7 60%)}.plate-inner i{position:absolute;width:11px;height:11px;border-radius:50%;background:#e6725c;left:20%;top:30%}.plate-inner i:nth-child(2){left:53%;top:48%}.plate-inner i:nth-child(3){left:72%;top:22%}.counter-front{position:absolute;bottom:0;left:0;right:0;height:20px;background:linear-gradient(#b97951,#8d523e)}
.customer-queue{position:absolute;top:35px;left:18%;right:34%;height:48px;display:flex;align-items:flex-end;justify-content:center;font-size:35px;letter-spacing:3px;text-shadow:0 3px 3px #8c574966;z-index:1;white-space:nowrap;overflow:hidden}.food-display{position:absolute;inset:-5px 0 0;display:grid;place-items:center;font-size:35px;filter:drop-shadow(0 3px 2px #79553c55)}.orders{display:flex;gap:8px;min-height:82px}.ticket{flex:1;min-width:0;min-height:82px;border:2px dashed #cfad8e;border-radius:12px;background:#fffdf4;color:#714938;padding:8px;display:flex;flex-direction:column;align-items:flex-start;text-align:left;position:relative}.ticket.selected{border:2px solid #da7151;background:#fff2df}.ticket strong{font-size:12px;line-height:1.2;max-width:100%;padding-right:23px}.ticket-num,.ticket-count{font-size:10px;color:#9d7361}.ticket-guest{position:absolute;right:4px;top:4px;font-size:23px}.ticket:disabled{opacity:.7}
.recipe{display:flex;flex-wrap:wrap;gap:6px;min-height:36px}.recipe-chip{padding:7px 8px;border-radius:9px;background:#f5e8dc;color:#765b4c;font-size:12px;font-weight:700}.recipe-chip.next-step{outline:2px solid #d6764a}.recipe-chip.checked{background:#d7eac8;color:#43654a}
.actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.action{min-height:66px;border:1px solid #e3c8b3;border-radius:13px;background:#fff;color:#6d4636;font-size:11px;font-weight:800;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3px;padding:4px}.action:disabled{opacity:.48}.action-mark{width:35px;height:35px;border-radius:12px;background:#fff4e4;border:1px solid #f1d3a2;box-shadow:0 2px 3px #9b6b5040;display:grid;place-items:center;font-size:23px;line-height:1}.action:active:not(:disabled){transform:scale(.94);background:#fff0d8}
.deliver{margin:14px auto 0;min-height:48px;font-size:15px}.deliver:disabled{opacity:.48}.kitchen-controls{position:sticky;top:0;z-index:2;align-self:stretch;display:flex;gap:8px;justify-content:center;margin:4px 0 10px;padding:5px 0 8px;background:#fffaf4}.kitchen-controls .primary{min-height:49px;font-size:16px}.kitchen-controls button:not(.primary){min-height:44px;padding:0 15px;border:1px solid #d4af99;border-radius:12px;background:#fff;color:#915b46;font-weight:800}[hidden]{display:none!important}`);
}
