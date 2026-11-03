import { gamePage } from './page.ts';

export const puzzleHtml = gamePage('数字拼图', '#4DA7A7', `
<p class="intro">移动空格旁边的数字，让 1 到 8 依次排好。每一局都能解开。</p>
<section class="panel"><div id="status" class="status" role="status">准备拼图</div>
<div class="stats"><span class="stat" id="steps">0 步</span><span class="stat" id="time">用时 0 秒</span></div>
<div id="board" class="puzzle-board" aria-label="数字拼图棋盘"></div>
<p id="result" class="result"></p><button id="start" class="primary">开始游戏</button></section>`, `
const board=document.getElementById('board');
const status=document.getElementById('status');
const stepsLabel=document.getElementById('steps');
const timeLabel=document.getElementById('time');
const result=document.getElementById('result');
const start=document.getElementById('start');
const solved=[1,2,3,4,5,6,7,8,0];
let cells=solved.slice(),steps=0,startedAt=0,clock=null,won=false;
function neighbors(empty){return [empty-3,empty+3,empty%3>0?empty-1:-1,empty%3<2?empty+1:-1].filter(index=>index>=0&&index<9);}
function isSolved(values){return values.every((value,index)=>value===solved[index]);}
function shuffle(){
  cells=solved.slice();let previous=-1;
  for(let turn=0;turn<100;turn++){
    const empty=cells.indexOf(0);let options=neighbors(empty).filter(index=>index!==previous);
    if(!options.length)options=neighbors(empty);
    const selected=options[Math.floor(Math.random()*options.length)];
    [cells[empty],cells[selected]]=[cells[selected],cells[empty]];previous=empty;
  }
  if(isSolved(cells)){const empty=cells.indexOf(0),selected=neighbors(empty)[0];[cells[empty],cells[selected]]=[cells[selected],cells[empty]];}
}
function updateTime(){if(startedAt)timeLabel.textContent='用时 '+Math.floor((Date.now()-startedAt)/1000)+' 秒';}
function draw(){
  board.innerHTML='';cells.forEach((value,index)=>{
    const tile=document.createElement('button');tile.type='button';tile.className='tile'+(value===0?' empty':'');tile.dataset.value=String(value);tile.textContent=value===0?'':String(value);tile.setAttribute('aria-label',value===0?'空格':'数字 '+value);tile.addEventListener('click',()=>move(index));board.appendChild(tile);
  });
  stepsLabel.textContent=steps+' 步';
  updateTime();
}
function move(index){
  if(won)return;const empty=cells.indexOf(0);if(!neighbors(empty).includes(index))return;
  [cells[empty],cells[index]]=[cells[index],cells[empty]];steps++;draw();
  if(isSolved(cells)){won=true;clearInterval(clock);status.textContent='拼图完成！';result.textContent='共用 '+steps+' 步 · '+Math.floor((Date.now()-startedAt)/1000)+' 秒';start.style.display='block';start.textContent='再玩一局';}
}
function newGame(){clearInterval(clock);shuffle();steps=0;won=false;startedAt=Date.now();status.textContent='点击空格旁的数字';result.textContent='';start.style.display='none';draw();clock=setInterval(updateTime,1000);}
start.addEventListener('click',newGame);`, `
.puzzle-board{width:min(100%,320px);aspect-ratio:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:7px;padding:8px;background:#c5e5e2;border-radius:20px;margin:7px 0 20px}
.tile{border:0;border-radius:13px;background:#fffefa;color:#277483;font-size:33px;font-weight:900;box-shadow:0 4px 0 #a5c8c5}.tile.empty{background:#b8dad7;box-shadow:none}
#board:empty{display:none}.panel{min-height:440px}`);
