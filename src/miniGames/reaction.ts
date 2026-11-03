import { translate, type LanguageCode } from '../i18n/translations.ts';
import { miniCopy, miniCopyScript } from './copy.ts';
import { escapeHtml, gamePage } from './page.ts';

export const reactionHtml = (locale: LanguageCode) => gamePage(locale, translate(locale, 'gameReaction'), '#EF765F', `
<p class="intro">${escapeHtml(miniCopy(locale, 'reactionIntro'))}</p>
<section class="panel" id="arena"><div class="orb"><div class="orb-inner">⚡</div></div>
<div id="status" class="status" role="status">${escapeHtml(miniCopy(locale, 'reactionReady'))}</div><p class="hint" id="progress">${escapeHtml(miniCopy(locale, 'reactionProgress', { count: 0 }))}</p>
<p id="result" class="result"></p><button id="action" class="primary">${escapeHtml(miniCopy(locale, 'reactionStart'))}</button></section>`, `
${miniCopyScript(locale, ['reactionReady','reactionStart','reactionWaiting','reactionBePatient','reactionTapNow','reactionTap','reactionFalseStart','reactionRetryRound','reactionKeepGoing','reactionNext','reactionDone','playAgain','reactionProgress','reactionResult'])}
const arena=document.getElementById('arena');
const action=document.getElementById('action');
const status=document.getElementById('status');
const progress=document.getElementById('progress');
const result=document.getElementById('result');
let phase='idle', times=[], readyAt=0, waitTimer=null;
function render(){
  arena.dataset.phase=phase;
  progress.textContent=tr('reactionProgress',{count:times.length});
  if(phase==='idle'){status.textContent=tr('reactionReady');action.textContent=tr('reactionStart');result.textContent='';}
  if(phase==='waiting'){status.textContent=tr('reactionWaiting');action.textContent=tr('reactionBePatient');result.textContent='';}
  if(phase==='ready'){status.textContent=tr('reactionTapNow');action.textContent=tr('reactionTap');}
  if(phase==='falseStart'){status.textContent=tr('reactionFalseStart');action.textContent=tr('reactionRetryRound');}
  if(phase==='next'){status.textContent=tr('reactionKeepGoing');action.textContent=tr('reactionNext');}
  if(phase==='done'){
    const average=Math.round(times.reduce((sum,value)=>sum+value,0)/times.length);
    status.textContent=tr('reactionDone');action.textContent=tr('playAgain');
    result.textContent=tr('reactionResult',{average,best:Math.min(...times)});
  }
}
function startRound(){
  if(phase==='done') times=[];
  phase='waiting';render();
  waitTimer=setTimeout(()=>{phase='ready';readyAt=Date.now();render();},1200+Math.round(Math.random()*1800));
}
action.addEventListener('click',()=>{
  if(phase==='idle'||phase==='next'||phase==='falseStart'||phase==='done'){startRound();return;}
  if(phase==='waiting'){clearTimeout(waitTimer);phase='falseStart';render();return;}
  if(phase==='ready'){
    times.push(Math.max(1,Date.now()-readyAt));
    phase=times.length===5?'done':'next';render();
  }
});
render();`, `
.orb{width:162px;height:162px;border-radius:50%;background:#fff1e8;display:grid;place-items:center;margin-bottom:18px;box-shadow:0 0 0 12px #fbeae4}
.orb-inner{width:112px;height:112px;border-radius:50%;background:#ef765f;color:white;display:grid;place-items:center;font-size:52px}
#arena[data-phase="waiting"] .orb-inner{background:#ec9a63}#arena[data-phase="ready"] .orb-inner{background:#45b88e}#arena[data-phase="falseStart"] .orb-inner{background:#7c83a2}
#arena[data-phase="ready"] .primary{background:#45b88e}`);
