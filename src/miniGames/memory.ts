import { translate, type LanguageCode } from '../i18n/translations.ts';
import { miniCopy, miniCopyScript } from './copy.ts';
import { escapeHtml, gamePage } from './page.ts';

export const memoryHtml = (locale: LanguageCode) => gamePage(locale, translate(locale, 'gameMemory'), '#7466BA', `
<p class="intro">${escapeHtml(miniCopy(locale, 'memoryIntro'))}</p>
<section class="panel"><div id="status" class="status" role="status">${escapeHtml(miniCopy(locale, 'memoryReady'))}</div>
<div class="stats"><span class="stat" id="moves">${escapeHtml(miniCopy(locale, 'memoryMoves', { count: 0 }))}</span><span class="stat" id="time">${escapeHtml(miniCopy(locale, 'elapsed', { count: 0 }))}</span></div>
<div id="board" class="memory-board" aria-label="${escapeHtml(miniCopy(locale, 'memoryBoard'))}"></div>
<p id="result" class="result"></p><button id="start" class="primary">${escapeHtml(miniCopy(locale, 'startGame'))}</button></section>`, `
${miniCopyScript(locale, ['memoryHidden','memoryMoves','elapsed','memoryMatched','memoryPair','memoryRemember','memoryContinue','memoryFind','memoryResult','playAgain'])}
const symbols=['★','●','▲','◆','♥','☀','☾','✿'];
const board=document.getElementById('board');
const status=document.getElementById('status');
const movesLabel=document.getElementById('moves');
const timeLabel=document.getElementById('time');
const result=document.getElementById('result');
const start=document.getElementById('start');
let deck=[], revealed=new Set(), matched=new Set(), first=null, locked=false, moves=0, startedAt=0, clock=null;
function shuffled(items){const copy=items.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function update(){
  [...board.children].forEach((card,index)=>{
    const open=revealed.has(index)||matched.has(index);
    card.classList.toggle('open',open);card.classList.toggle('matched',matched.has(index));
    card.textContent=open?deck[index]:'?';card.setAttribute('aria-label',open?deck[index]:tr('memoryHidden'));
  });
  movesLabel.textContent=tr('memoryMoves',{count:moves});
  if(startedAt) timeLabel.textContent=tr('elapsed',{count:Math.floor((Date.now()-startedAt)/1000)});
}
function flip(index){
  if(locked||matched.has(index)||revealed.has(index))return;
  revealed.add(index);update();
  if(first===null){first=index;return;}
  moves++;
  const previous=first;first=null;
  if(deck[previous]===deck[index]){
    matched.add(previous);matched.add(index);revealed.delete(previous);revealed.delete(index);
    if(matched.size===16){clearInterval(clock);status.textContent=tr('memoryMatched');result.textContent=tr('memoryResult',{moves,seconds:Math.floor((Date.now()-startedAt)/1000)});start.style.display='block';start.textContent=tr('playAgain');}
    else status.textContent=tr('memoryPair');
    update();return;
  }
  locked=true;status.textContent=tr('memoryRemember');update();
  setTimeout(()=>{revealed.delete(previous);revealed.delete(index);locked=false;status.textContent=tr('memoryContinue');update();},800);
}
function newGame(){
  clearInterval(clock);deck=shuffled(symbols.concat(symbols));revealed=new Set();matched=new Set();first=null;locked=false;moves=0;startedAt=Date.now();result.textContent='';status.textContent=tr('memoryFind');
  board.innerHTML='';deck.forEach((symbol,index)=>{const card=document.createElement('button');card.type='button';card.className='card';card.dataset.symbol=symbol;card.addEventListener('click',()=>flip(index));board.appendChild(card);});
  start.style.display='none';update();clock=setInterval(update,1000);
}
start.addEventListener('click',newGame);`, `
.memory-board{width:100%;max-width:332px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0 20px}
.card{aspect-ratio:1;border:0;border-radius:13px;background:#7869bd;color:white;font-size:25px;font-weight:900;box-shadow:0 4px 0 #594b9d;transition:transform .15s,background .15s}
.card.open{background:#fff0d4;color:#c45b78;transform:rotateY(10deg)}.card.matched{background:#d9f4e9;color:#25856e;box-shadow:0 4px 0 #a8dbc9}
#board:empty{display:none}.panel{min-height:420px}`);
