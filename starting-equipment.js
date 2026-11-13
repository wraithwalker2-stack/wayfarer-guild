/* Equip the player guildmaster and four founding companions on a fresh save. */
(function(){
'use strict';
const KEY='wayfarer-starting-loadouts-v3';
function common(id,name,slot,weaponType,armorClass,stats){return{id,name,slot,slotKey:slot==='weapon'?'mainHand':slot,weaponType:weaponType||null,armorClass:armorClass||null,rarity:'Common',level:1,stats:{power:0,armor:0,maxHp:0,critChance:0,elementDamage:0,...stats},element:null,effect:null}}
function loadout(job,heroId){
 const stem=`starter-${heroId}`;
 if(job==='Alchemist')return[
  common(`${stem}-weapon`,'Apprentice Oak Staff','weapon','staff',null,{power:1}),
  common(`${stem}-chest`,'Apprentice Robe','chest',null,'light',{armor:1}),
  common(`${stem}-feet`,'Softstep Shoes','feet',null,'light',{maxHp:1})
 ];
 if(job==='Rogue')return[
  common(`${stem}-weapon`,`Scout's Dagger`,'weapon','one-hand',null,{power:1,critChance:.02}),
  common(`${stem}-chest`,'Trail Leather Vest','chest',null,'medium',{armor:1}),
  common(`${stem}-feet`,`Scout's Boots`,'feet',null,'medium',{maxHp:1})
 ];
 return[
  common(`${stem}-weapon`,'Guild Training Sword','weapon','one-hand',null,{power:1}),
  common(`${stem}-chest`,'Padded Guild Jack','chest',null,'light',{armor:1}),
  common(`${stem}-feet`,'Marching Boots','feet',null,'light',{maxHp:1})
 ];
}
function needsLoadout(hero){return !hero?.equipment?.mainHand&&!hero?.equipment?.chest&&!hero?.equipment?.feet}
function install(){
 const state=window.wayfarerGearState;if(!state?.items||!state?.inventory)return false;
 const obsolete=new Set(['starter-blade','starter-coat']);state.items=state.items.filter(item=>!obsolete.has(item.id));state.inventory=state.inventory.filter(id=>!obsolete.has(id));
 let equipped=0;heroes.slice(0,5).forEach((hero,index)=>{
  if(!needsLoadout(hero))return;
  const items=loadout(hero.currentJob||hero.cls,hero.id);items.forEach(item=>{if(typeof itemEquipTags==='function')itemEquipTags(item)});
  const ids=new Set(items.map(item=>item.id));
  state.items=state.items.filter(item=>!ids.has(item.id));
  state.inventory=state.inventory.filter(id=>!ids.has(id));
  state.items.push(...items);
  hero.equipment=hero.equipment||{};for(const slot of Object.keys(gearSlotLabels))if(!(slot in hero.equipment))hero.equipment[slot]=null;
  hero.equipment.mainHand=items[0].id;hero.equipment.chest=items[1].id;hero.equipment.feet=items[2].id;
  if(typeof gearRecalculateHero==='function')gearRecalculateHero(hero,hero.maxHp);
  equipped++;
 });
 localStorage.setItem(KEY,equipped?`equipped-${equipped}`:'already-equipped');if(typeof gearPersist==='function')gearPersist();if(typeof persistBuild==='function')persistBuild();else if(typeof save==='function')save();
 if(equipped&&typeof renderAll==='function')renderAll();return equipped>0;
}
const installed=install();
window.WayfarerStartingEquipment=Object.freeze({version:'3.0.0',installed,audit(){const roster=heroes.slice(0,5).map(h=>({id:h.id,job:h.currentJob||h.cls,weapon:gearItem(h.equipment?.mainHand)?.name||null,chest:gearItem(h.equipment?.chest)?.name||null,feet:gearItem(h.equipment?.feet)?.name||null}));return{installed:roster.length===5&&roster.every(h=>h.weapon&&h.chest&&h.feet),heroes:roster}}});
})();
