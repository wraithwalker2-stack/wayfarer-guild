(function(){
'use strict';
let lastParty=[];
function fatigue(h){return Math.max(0,Math.min(100,Number(h?.expeditionFatigue)||0))}
function staminaAfterTravel(h){return Math.max(2,(h?.staminaMax||3)-Math.floor(fatigue(h)/35))}
const oldFinish=finishRun;finishRun=function(...args){const r=runState;if(!r)return oldFinish(...args);const condition=r.ids.map(id=>{const h=heroes.find(x=>x.id===id);return {id,hp:Math.max(1,h?.hp||1),downed:!h||h.hp<=0}}),wear=Math.min(35,8+(r.cleared||0)*4+(r.failed?10:0));lastParty=[...r.ids];const result=oldFinish(...args);for(const entry of condition){const h=heroes.find(x=>x.id===entry.id);if(!h)continue;h.hp=Math.max(1,Math.min(h.maxHp,entry.hp));h.expeditionFatigue=Math.min(100,fatigue(h)+wear+(entry.downed?10:0))}save();return result};
const oldBegin=beginBattle;beginBattle=function(...args){const result=oldBegin(...args),b=runState?.battle;if(!b)return result;for(const unit of b.heroes){const h=heroes.find(x=>x.id===unit.id);unit.ap=Math.min(unit.ap??99,staminaAfterTravel(h))}if(b.heroes.some(u=>fatigue(heroes.find(h=>h.id===u.id))>=35))recordBattleLog('Travel fatigue reduces the available stamina of tired adventurers.');renderRun();return result};
const oldRound=startHeroRound;startHeroRound=function(...args){const result=oldRound(...args),b=runState?.battle;if(b)for(const unit of b.heroes){const h=heroes.find(x=>x.id===unit.id);unit.ap=Math.min(unit.ap??99,staminaAfterTravel(h))}return result};
const oldReturn=returnAfterExpedition;returnAfterExpedition=function(...args){for(const id of lastParty){const h=heroes.find(x=>x.id===id);if(!h)continue;h.hp=h.maxHp;h.expeditionFatigue=Math.max(0,fatigue(h)-60)}save();const result=oldReturn(...args);toast('The return journey provides rest: vigor restored and fatigue reduced.');return result};
window.expeditionCondition={fatigue,staminaAfterTravel};
})();
