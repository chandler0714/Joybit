import { gamePage } from './page.ts';

export const reactionHtml = gamePage('反应挑战', '#EF765F', `
<p class="intro">等颜色变绿，立刻点击。连续完成 5 次，看看你的反应有多快。</p>
<section class="panel" id="arena"><div class="orb"><div class="orb-inner">⚡</div></div>
<div id="status" class="status" role="status">准备好了吗？</div><p class="hint" id="progress">0 / 5 次</p>
<p id="result" class="result"></p><button id="action" class="primary">开始挑战</button></section>`, `
const arena=document.getElementById('arena');
const action=document.getElementById('action');
const status=document.getElementById('status');
const progress=document.getElementById('progress');
const result=document.getElementById('result');
let phase='idle', times=[], readyAt=0, waitTimer=null;
function render(){
  arena.dataset.phase=phase;
  progress.textContent=times.length+' / 5 次';
  if(phase==='idle'){status.textContent='准备好了吗？';action.textContent='开始挑战';result.textContent='';}
  if(phase==='waiting'){status.textContent='等待变绿…';action.textContent='耐心等待';result.textContent='';}
  if(phase==='ready'){status.textContent='现在点击！';action.textContent='立即点击';}
  if(phase==='falseStart'){status.textContent='抢跑了，再试一次';action.textContent='重新开始本轮';}
  if(phase==='next'){status.textContent='不错，继续下一次';action.textContent='下一次';}
  if(phase==='done'){
    const average=Math.round(times.reduce((sum,value)=>sum+value,0)/times.length);
    status.textContent='挑战完成！';action.textContent='再玩一局';
    result.textContent='平均 '+average+' 毫秒 · 最佳 '+Math.min(...times)+' 毫秒';
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
