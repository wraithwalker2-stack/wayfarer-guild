(function(){
'use strict';
const ENGINE_VERSION='1.0.0',STALL_MS=5000,MAX_RECOVERIES=4;
let serial=0,last={battle:null,signature:'',at:Date.now()};
function battle(){return window.runState?.battle||null}
function livingHeroes(b){return (b?.heroes||[]).filter(u=>(heroes.find(h=>h.id===u.id)?.hp||0)>0)}
function livingFoes(b){return (b?.foes||[]).filter(f=>(f.hp||0)>0)}
function signature(b){return b?[b.engineSessionId,b.round,b.turn,activeBattleHero?.()?.id||'',livingHeroes(b).map(u=>`${u.id}:${heroes.find(h=>h.id===u.id)?.hp||0}`).join(','),livingFoes(b).map(f=>`${f.id}:${f.hp}`).join(','),(b.enemyQueue||[]).join(',')].join('|'):'no-battle'}
function markProgress(b=battle()){const next=signature(b);if(last.battle!==b||last.signature!==next)last={battle:b,signature:next,at:Date.now()};return next}
function normalize(b){
 if(!b)return[];const repairs=[];b.round=Math.max(1,Number(b.round)||1);if(!['heroes','enemies'].includes(b.turn)){b.turn='heroes';repairs.push('turn')}
 for(const foe of b.foes||[]){foe.maxHp=Math.max(1,Number(foe.maxHp)||Number(foe.hp)||1);foe.hp=Math.max(0,Math.min(foe.maxHp,Number(foe.hp)||0));foe.move=Math.max(1,Number(foe.move)||1);foe.attackRange=Math.max(1,Number(foe.attackRange)||1)}
 for(const unit of b.heroes||[]){const h=heroes.find(hero=>hero.id===unit.id);if(!h)continue;h.maxHp=Math.max(1,Number(h.maxHp)||1);h.hp=Math.max(0,Math.min(h.maxHp,Number(h.hp)||0));unit.ap=Math.max(0,Number(unit.ap)||0)}
 if(b.turn==='enemies'){const alive=new Set(livingFoes(b).map(f=>f.id)),seen=new Set();const clean=(b.enemyQueue||[]).filter(id=>alive.has(id)&&!seen.has(id)&&seen.add(id));if(clean.length!==(b.enemyQueue||[]).length){b.enemyQueue=clean;repairs.push('queue')}}
 return repairs
}
function audit(b=battle()){
 if(!b)return{engine:ENGINE_VERSION,state:'idle',healthy:true,issues:[]};const issues=[];
 if(!['heroes','enemies'].includes(b.turn))issues.push('invalid-turn');
 if(!livingHeroes(b).length)issues.push('party-defeated');
 if(!livingFoes(b).length)issues.push('enemies-defeated');
 if(b.turn==='enemies'&&(b.enemyQueue||[]).some(id=>!livingFoes(b).some(f=>f.id===id)))issues.push('stale-enemy-queue');
 if(b.turn==='heroes'&&runState.mode==='ai'&&!activeBattleHero())issues.push('hero-phase-complete');
 return{engine:ENGINE_VERSION,session:b.engineSessionId||null,state:b.turn,round:b.round,healthy:!issues.length,issues,recoveries:b.engineRecoveries||0}
}
function resolveTerminal(b){if(!b||b!==battle())return true;if(!livingHeroes(b).length){window.loseBattle();return true}if(!livingFoes(b).length){window.winBattle();return true}return false}
const priorBegin=window.beginBattle;
window.beginBattle=function(...args){const result=priorBegin.apply(this,args),b=battle();if(b){b.engineSessionId=`battle-${Date.now().toString(36)}-${++serial}`;b.engineRecoveries=0;b.engineStartedAt=Date.now();normalize(b);markProgress(b);window.Wayfarer?.emit?.('combat:started',audit(b))}return result};
const priorWin=window.winBattle;
window.winBattle=function(...args){const b=battle();if(!b)return priorWin.apply(this,args);if(b.engineResolutionLock)return;b.engineResolutionLock='win';try{return priorWin.apply(this,args)}finally{if(battle()===b){delete b.engineResolutionLock;normalize(b);markProgress(b)}else window.Wayfarer?.emit?.('combat:ended',{session:b.engineSessionId,outcome:'victory'})}};
const priorLose=window.loseBattle;
window.loseBattle=function(...args){const b=battle();if(!b)return priorLose.apply(this,args);if(b.engineResolutionLock)return;b.engineResolutionLock='loss';try{return priorLose.apply(this,args)}finally{if(battle()===b){delete b.engineResolutionLock;normalize(b);markProgress(b)}else window.Wayfarer?.emit?.('combat:ended',{session:b.engineSessionId,outcome:'defeat'})}};
const priorHeroRound=window.startHeroRound;
window.startHeroRound=function(...args){const b=battle();if(b&&resolveTerminal(b))return;const result=priorHeroRound.apply(this,args);normalize(battle());markProgress();return result};
const priorEnemyRound=window.startEnemyRound;
window.startEnemyRound=function(...args){const b=battle();if(b&&resolveTerminal(b))return;const result=priorEnemyRound.apply(this,args),current=battle();if(current){normalize(current);if(current.turn==='enemies'&&!current.enemyQueue?.length)current.enemyQueue=livingFoes(current).map(f=>f.id)}markProgress(current);return result};
const priorEnemyStep=window.enemyBattleStep;
window.enemyBattleStep=function(...args){const b=battle();if(!b||resolveTerminal(b))return;normalize(b);const result=priorEnemyStep.apply(this,args);normalize(battle());markProgress();return result};
const priorAiStep=window.aiBattleStep;
window.aiBattleStep=function(...args){const b=battle();if(!b||resolveTerminal(b))return;normalize(b);const result=priorAiStep.apply(this,args);normalize(battle());markProgress();return result};
const priorLog=window.recordBattleLog;
window.recordBattleLog=function(...args){const result=priorLog.apply(this,args);markProgress();return result};
function recover(){
 const b=battle();if(!b||b.inspectPaused||document.hidden)return;if(resolveTerminal(b))return;const now=Date.now(),sig=signature(b);if(last.battle!==b||last.signature!==sig){last={battle:b,signature:sig,at:now};return}if(now-last.at<STALL_MS)return;
 b.engineRecoveries=(b.engineRecoveries||0)+1;if(b.engineRecoveries>MAX_RECOVERIES){last.at=now;return}
 normalize(b);recordBattleLog(`Combat flow recovered automatically (${b.engineRecoveries}/${MAX_RECOVERIES}).`);
 if(b.turn==='enemies'){if(!b.enemyQueue?.length)b.enemyQueue=livingFoes(b).map(f=>f.id);if(b.enemyQueue.length)setTimeout(()=>window.enemyBattleStep(),40);else setTimeout(()=>window.startHeroRound(),40)}
 else if(runState.mode==='ai'){if(activeBattleHero())setTimeout(()=>window.aiBattleStep(),40);else setTimeout(()=>window.startEnemyRound(),40)}
 markProgress(b);window.Wayfarer?.emit?.('combat:recovered',audit(b))
}
setInterval(recover,1250);
window.WayfarerCombat=Object.freeze({version:ENGINE_VERSION,audit,normalize:()=>normalize(battle()),recover});
})();
