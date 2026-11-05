(function(){
'use strict';
let autoToken=0;

function cellAt(grid,unit){return unit&&grid?.children?.[unit.y*FIELD_W+unit.x]}
function scheduleAuto(r,b){
 const token=++autoToken;
 setTimeout(()=>{
  if(token!==autoToken||runState!==r||r.battle!==b||r.mode!=='ai'||b.inspectPaused)return;
  if(r.skipAICombat&&typeof resolveBattleInstant==='function')return resolveBattleInstant();
  if(b.turn==='heroes')return typeof aiBattleStep==='function'&&aiBattleStep();
  if(b.turn==='enemies'){
   if(!b.enemyQueue?.length)b.enemyQueue=b.foes.filter(foe=>foe.hp>0).map(foe=>foe.id);
   return typeof enemyBattleStep==='function'&&enemyBattleStep();
  }
 },120);
}

window.toggleBattleMode=function(){
 const r=runState,b=r?.battle;if(!b)return;
 if(b.deployment){
  finishDeployment();
  if(b.deployment)return;
 }
 const next=r.mode==='ai'?'manual':'ai';
 r.mode=next;
 b.inspectMode=false;
 b.pendingAbility=false;
 b.pendingJobSkill=null;
 b.pendingCustomAbility=null;
 if(!document.getElementById('enemyModalBack')?.classList.contains('open'))b.inspectPaused=false;
 recordBattleLog(next==='ai'?'AI pilot takes over the party.':'Manual orders restored.');
 renderRun();
 if(next==='ai')scheduleAuto(r,b);else autoToken++;
};

function markManualOptions(b,panel,grid){
 const actor=activeBattleHero?.(),h=actor&&heroes.find(hero=>hero.id===actor.id);
 if(!actor||!h||b.turn!=='heroes'||b.deployment||b.inspectPaused||runState.mode!=='manual')return;
 const actorCell=cellAt(grid,actor);actorCell?.classList.add('current-actor');
 if(moveActionsUsed(actor)<extraMoveActions(h)&&actor.ap>0){
  for(const tile of reachableTiles(actor)){
   const cell=cellAt(grid,tile);if(!cell||cell.classList.contains('void-cell')||fieldObstacleAt(b,tile.x,tile.y))continue;
   cell.classList.add('reachable','move-option');cell.disabled=false;
  }
 }
 if(attackActionsUsed(actor)<extraAttackActions(h)&&actor.ap>0){
  for(const foe of b.foes.filter(foe=>foe.hp>0)){
   if(!battleCanHit(actor,foe,h,b))continue;
   const cell=cellAt(grid,foe);if(!cell)continue;
   cell.classList.add('attack-option');cell.disabled=false;
  }
 }
 let legend=panel.querySelector('.combat-option-legend');
 if(!legend){legend=document.createElement('div');legend.className='combat-option-legend';panel.querySelector('.battle-toolbar')?.after(legend)}
 if(legend)legend.innerHTML='<span class="move-key">MOVE</span><span class="attack-key">ATTACK</span><small>Highlighted scenery tiles are legal choices for the active adventurer.</small>';
}

const stableRender=window.renderBattle;
window.renderBattle=function(...args){
 const result=stableRender.apply(this,args),r=runState,b=r?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');
 if(!b||!panel||!grid)return result;
 panel.classList.add('stable-combat-controls');
 grid.querySelectorAll('.move-option,.attack-option').forEach(cell=>cell.classList.remove('move-option','attack-option'));
 markManualOptions(b,panel,grid);
 const modeButton=panel.querySelector('.battle-toolbar button[onclick="toggleBattleMode()"]');
 if(modeButton){modeButton.disabled=false;modeButton.textContent=r.mode==='ai'?'Switch to Manual':'Switch to Auto'}
 if(r.mode==='ai')panel.querySelector('.combat-option-legend')?.remove();
 return result;
};
})();
