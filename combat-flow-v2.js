/* One final turn coordinator for manual handoff, auto combat, and enemy queue recovery. */
(function(){
'use strict';
let aiTimer=null,aiBusy=false,lastAiAt=0,lastEnemyAt=0;
function battle(){return runState?.battle||null}
function livingFoes(b){return (b?.foes||[]).filter(foe=>foe.hp>0)}
function livingHeroes(b){return (b?.heroes||[]).filter(unit=>(heroes.find(h=>h.id===unit.id)?.hp||0)>0)}
function actorSignature(b,actor){return [actor?.id,actor?.x,actor?.y,actor?.ap,moveActionsUsed(actor||{}),attackActionsUsed(actor||{}),actor?.done,livingFoes(b).map(f=>`${f.id}:${f.hp}:${f.x}:${f.y}`).join('|'),livingHeroes(b).map(u=>`${u.id}:${heroes.find(h=>h.id===u.id)?.hp}`).join('|')].join(';')}
function requestAi(delay=160){clearTimeout(aiTimer);aiTimer=setTimeout(()=>window.aiBattleStep(),delay)}
function phaseReady(b){return b&&runState?.battle===b&&!b.deployment&&!b.inspectPaused}
function finishActorIfSpent(actor){const h=actor&&heroes.find(hero=>hero.id===actor.id);if(h&&moveActionsUsed(actor)>=extraMoveActions(h)&&attackActionsUsed(actor)>=extraAttackActions(h))actor.done=true}
const priorEnemyStep=window.enemyBattleStep;
window.enemyBattleStep=function(...args){const b=battle();if(!phaseReady(b)||b.turn!=='enemies')return;lastEnemyAt=Date.now();return priorEnemyStep.apply(this,args)};
const priorEnemyRound=window.startEnemyRound;
window.startEnemyRound=function(...args){const b=battle();if(!b||b.deployment)return;clearTimeout(aiTimer);const result=priorEnemyRound.apply(this,args),current=battle();if(current?.turn==='enemies'){current.inspectPaused=false;current.enemyQueue=(current.enemyQueue||[]).filter(id=>livingFoes(current).some(f=>f.id===id));if(!current.enemyQueue.length)current.enemyQueue=livingFoes(current).map(f=>f.id);lastEnemyAt=Date.now()}return result};
const priorHeroRound=window.startHeroRound;
window.startHeroRound=function(...args){const result=priorHeroRound.apply(this,args),b=battle();if(b?.turn==='heroes'&&runState.mode==='ai')requestAi(120);return result};
window.aiBattleStep=function(){
 const r=runState,b=r?.battle;if(!phaseReady(b)||b.turn!=='heroes'||r.mode!=='ai'||aiBusy)return;
 const now=Date.now();if(now-lastAiAt<80){requestAi(90);return}lastAiAt=now;
 const actor=activeBattleHero();if(!actor){window.startEnemyRound();return}
 aiBusy=true;const before=actorSignature(b,actor);
 try{aiHeroAction(b,actor)}catch(error){console.error('AI action recovered',error);actor.done=true;recordBattleLog(`${heroes.find(h=>h.id===actor.id)?.name||'An adventurer'} loses the action after an invalid order.`)}finally{aiBusy=false}
 if(battle()!==b)return;
 finishActorIfSpent(actor);
 if(b.turn==='heroes'&&actorSignature(b,actor)===before){actor.done=true;recordBattleLog(`${heroes.find(h=>h.id===actor.id)?.name||'An adventurer'} has no legal action and ends the turn.`)}
 if(b.turn==='heroes'&&r.mode==='ai')requestAi(180)
};
const priorAdvance=window.advanceBattleTurn;
window.advanceBattleTurn=function(...args){const before=activeBattleHero();finishActorIfSpent(before);const result=priorAdvance.apply(this,args),b=battle();if(!b||b.deployment)return result;if(b.turn==='heroes'&&!activeBattleHero())window.startEnemyRound();else if(b.turn==='heroes'&&runState.mode==='ai')requestAi(120);return result};
const priorEndHero=window.endBattleHero;
window.endBattleHero=function(...args){const result=priorEndHero.apply(this,args),b=battle();if(b?.turn==='heroes'&&!activeBattleHero())window.startEnemyRound();return result};
window.endPartyPhase=function(){const b=battle();if(!phaseReady(b)||b.turn!=='heroes'||runState.mode!=='manual')return;for(const unit of livingHeroes(b))unit.done=true;recordBattleLog('The party ends its phase. Enemy actions begin.');window.startEnemyRound()};
const priorToggle=window.toggleBattleMode;
window.toggleBattleMode=function(...args){const result=priorToggle.apply(this,args),b=battle();if(b&&!b.deployment&&runState.mode==='ai'){b.inspectPaused=false;requestAi(40)}return result};
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args),b=battle(),panel=document.getElementById('battlePanel');if(!b||!panel)return result;const bar=panel.querySelector('.battle-toolbar');if(bar&&b.turn==='heroes'&&!b.deployment&&runState.mode==='manual'&&!bar.querySelector('.end-party-phase'))bar.insertAdjacentHTML('beforeend','<button class="button secondary end-party-phase" onclick="endPartyPhase()">End party phase</button>');return result};
setInterval(()=>{const b=battle();if(!phaseReady(b))return;if(!livingFoes(b).length){winBattle();return}if(!livingHeroes(b).length){loseBattle();return}if(b.turn==='heroes'){if(!activeBattleHero())window.startEnemyRound();else if(runState.mode==='ai'&&!aiBusy)requestAi(20)}else if(b.turn==='enemies'){b.enemyQueue=(b.enemyQueue||[]).filter(id=>livingFoes(b).some(f=>f.id===id));if(!b.enemyQueue.length)window.startHeroRound();else if(Date.now()-lastEnemyAt>700)window.enemyBattleStep()}},450);
})();

