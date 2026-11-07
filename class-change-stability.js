/* Stable job changes: one equipment pass, one save, one character-sheet refresh. */
(function(){
'use strict';
let changing=false;
function clone(value){return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value))}
function compatible(hero,item,slot){
 if(!item)return true;
 if(typeof equipmentRuleError==='function')return !equipmentRuleError(hero,item,slot);
 if(item.slot==='weapon'&&typeof weaponRestriction==='function'&&weaponRestriction(hero,item))return false;
 if(item.slot!=='weapon'&&typeof armorRestriction==='function'&&armorRestriction(hero,item))return false;
 return true;
}
function twoHands(item){if(!item)return false;const tags=typeof itemEquipTags==='function'?itemEquipTags(item):[];return ['weapon:two-hand','weapon:ranged','weapon:staff','weapon:dual-wield'].some(tag=>tags.includes(tag))||['two-hand','ranged','staff','dual-wield'].includes(item.weaponType)}
function bestBy(items){return items.slice().sort((a,b)=>gearScore(b)-gearScore(a))[0]||null}
function stableAutoEquip(hero){
 const state=window.wayfarerGearState;hero.equipment=hero.equipment||{};
 const oldMax=hero.maxHp,ownedIds=[...new Set([...(state.inventory||[]),...Object.values(hero.equipment).filter(Boolean)])],owned=ownedIds.map(gearItem).filter(Boolean),next={};
 for(const slot of ['head','chest','hands','legs','feet']){const best=bestBy(owned.filter(item=>item.slot===slot&&compatible(hero,item,slot)));next[slot]=best?.id||null}
 const accessories=owned.filter(item=>item.slot==='accessory').sort((a,b)=>gearScore(b)-gearScore(a));next.accessory1=accessories[0]?.id||null;next.accessory2=accessories[1]?.id||null;
 const weapons=owned.filter(item=>item.slot==='weapon'),options=[{main:null,off:null,score:0}];
 for(const main of weapons){
  hero.equipment.mainHand=main.id;hero.equipment.offHand=null;
  if(!compatible(hero,main,'mainHand'))continue;
  options.push({main,off:null,score:gearScore(main)});
  if(twoHands(main))continue;
  for(const off of weapons){if(off.id===main.id)continue;hero.equipment.offHand=off.id;if(compatible(hero,off,'offHand'))options.push({main,off,score:gearScore(main)+gearScore(off)})}
 }
 const weaponSet=options.sort((a,b)=>b.score-a.score)[0];next.mainHand=weaponSet.main?.id||null;next.offHand=weaponSet.off?.id||null;
 for(const slot of Object.keys(gearSlotLabels))if(!(slot in next))next[slot]=null;
 hero.equipment=next;const used=new Set(Object.values(next).filter(Boolean));state.inventory=ownedIds.filter(id=>!used.has(id));gearRecalculateHero(hero,oldMax);
 return next;
}
window.setCharacterJob=function(id,job){
 if(changing)return;
 const hero=heroes.find(character=>character.id===id);if(!hero||!hero.unlockedJobs.includes(job))return toast('That job is not unlocked yet.');
 if(runState?.battle)return toast('Wait until the battle ends to change jobs.');
 if(typeof available==='function'&&!available(hero))return toast('Change jobs when this adventurer is available at the guild.');
 if(hero.currentJob===job)return;
 changing=true;const page=heroSheetPage||'overview',snapshot=clone(hero),inventory=[...(window.wayfarerGearState?.inventory||[])],previous={...(hero.equipment||{})};
 try{
   hero.currentJob=job;hero.baseClass=jobUnlocks[job]||job;hero.evolved=!!jobUnlocks[job];if(hero.subJob===job||!hero.jobSkills?.[job]?.length)hero.subJob='';
  syncJobStats(hero,true);stableAutoEquip(hero);
  const changes=Object.keys(gearSlotLabels).filter(slot=>previous[slot]!==hero.equipment?.[slot]).map(slot=>({slot:gearSlotLabels[slot],before:gearItem(previous[slot])?.name||'Empty',after:gearItem(hero.equipment?.[slot])?.name||'Empty'}));
   if(typeof persistBuild==='function')persistBuild();else save();if(typeof gearPersist==='function')gearPersist();
   if(typeof refreshCharacterPanels==='function')refreshCharacterPanels();else if(typeof renderRoster==='function')renderRoster();
   if(typeof openHero==='function')openHero(id,page);
   if(changes.length)showJobGearNotice(hero,changes);toast(`${hero.name} changed jobs to ${job}. The ${page==='skills'?'JP and skills':'character'} page remains open.`);
 }catch(error){
   for(const key of Object.keys(hero))delete hero[key];Object.assign(hero,snapshot);window.wayfarerGearState.inventory=inventory;console.error('Job change recovered safely',error);if(typeof persistBuild==='function')persistBuild();else save();if(typeof gearPersist==='function')gearPersist();toast('The job change could not be completed safely.');
 }finally{changing=false}
};
window.WayfarerClassChange=Object.freeze({version:'1.2.0',stableAutoEquip});
})();
