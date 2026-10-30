/* One complete catalogue feeds the Forge and randomized gear sources. */
const ARMOR_COVERAGE={
 head:{light:[['Sage Hood',1,0],['Linen Cowl',0,1]],medium:[['Leather Cap',0,1],['Scout Leather Helm',0,2]],heavy:[['Iron Circlet',0,2],['Steel Greathelm',0,3]]},
 chest:{light:[['Traveler Coat',0,2],['Runed Robe',1,1]],medium:[['Brigandine Vest',0,3],['Leather Jerkin',0,2]],heavy:[['Iron Breastplate',0,4],['Steel Plate Cuirass',0,5]]},
 hands:{light:[['Spellweave Gloves',1,0],['Linen Handwraps',0,1]],medium:[['Leather Gloves',0,1],['Reinforced Leather Bracers',0,2]],heavy:[['Iron Gauntlets',0,2],['Steel Gauntlets',0,3]]},
 legs:{light:[['Wool Trousers',0,1],['Runed Leggings',1,1]],medium:[['Leather Legguards',0,2],['Brigandine Leggings',0,3]],heavy:[['Reinforced Greaves',0,2],['Steel Plate Legguards',0,3]]},
 feet:{light:[['Softstep Shoes',1,0],['Cloth Slippers',0,1]],medium:[['Leather Boots',0,2],['Ranger Leather Treads',0,2]],heavy:[['Iron Sabatons',0,2],['Steel Sabatons',0,3]]}
};
const EQUIPMENT_BASE_CATALOG=new Map();
function addCoveredRecipe(name,slot,type,power,armor,armorClass=null){let recipe=FORGE_RECIPES.find(r=>r.name===name);if(!recipe){recipe={id:'catalog-'+FORGE_RECIPES.length,name,slot,type,power,armor};FORGE_RECIPES.push(recipe)}if(armorClass)recipe.armorClass=armorClass;EQUIPMENT_BASE_CATALOG.set(name,recipe);return recipe}
for(const [slot,weights]of Object.entries(ARMOR_COVERAGE))for(const [weight,bases]of Object.entries(weights))for(const [name,power,armor]of bases){addCoveredRecipe(name,slot,null,power,armor,weight);if(!gearBases[slot].some(b=>b[0]===name))gearBases[slot].push([name,power,armor])}
for(const [type,bases]of [
 ['one-hand',[['Iron Sword',2,0],['Steel Shortsword',3,0],['Guild Mace',1,1],['Iron Mace',2,1],['Iron Dagger',2,0],['Stiletto Knife',2,0],['Woodsman Axe',3,0],['Ranger’s Hatchet',2,0]]],
 ['two-hand',[['Greatsword',4,0],['Claymore Sword',4,0],['Battle Axe',4,0],['Executioner Axe',5,0],['Warhammer',3,1],['Maul Hammer',4,1],['Cavalry Lance',4,0],['War Lance',5,0]]],
 ['dual-wield',[['Twin Daggers',3,0],['Paired Knives',2,0]]],
 ['ranged',[['Longbow',3,0],['Recurve Bow',2,0],['Hunting Crossbow',3,0],['Steel Crossbow',4,0]]],
 ['wand',[['Ash Wand',2,0],['Crystal Wand',3,0]]],['staff',[['Oak Staff',3,0],['Willow Staff',3,0]]],
 ['spellbook',[['Elemental Spellbook',0,0],['Runic Grimoire',0,0]]],['holy-focus',[['Consecrated Focus',0,1],['Sunstone Reliquary',0,1]]],
 ['shield',[['Kite Shield',0,3],['Bulwark Shield',0,4]]],['hand-crossbow',[['Dazing Hand Crossbow',1,0],['Sleeve Dart Launcher',1,0]]],
 ['instrument',[['Traveler Lute',2,0],['Silver Flute',2,0]]]
])for(const [name,power,armor]of bases)addCoveredRecipe(name,'weapon',type,power,armor);
for(const recipe of FORGE_RECIPES)if(!EQUIPMENT_BASE_CATALOG.has(recipe.name))EQUIPMENT_BASE_CATALOG.set(recipe.name,recipe);
function equipmentBaseRecipe(item){if(item?.baseName&&EQUIPMENT_BASE_CATALOG.has(item.baseName))return EQUIPMENT_BASE_CATALOG.get(item.baseName);return [...EQUIPMENT_BASE_CATALOG.values()].filter(r=>r.slot===item?.slot&&(item.name||'').includes(r.name)).sort((a,b)=>b.name.length-a.name.length)[0]}
const catalogueArmorWeight=armorWeight;armorWeight=function(item){return equipmentBaseRecipe(item)?.armorClass||item?.armorClass||catalogueArmorWeight(item)};
const catalogueMakeItem=makeForgeItem;makeForgeItem=function(recipe,...args){const item=catalogueMakeItem(recipe,...args);if(recipe.armorClass){item.armorClass=recipe.armorClass;item.tags=(item.tags||[]).filter(t=>!t.startsWith('armor:'));itemEquipTags(item)}return item};
function recipeDropGroup(recipe){if(recipe.slot!=='weapon')return recipe.slot;const type=recipe.type;if(type==='one-hand')return /dagger|knife/i.test(recipe.name)?'dagger':/sword/i.test(recipe.name)?'sword':/mace/i.test(recipe.name)?'mace':'one-hand-other';if(type==='two-hand')return /lance/i.test(recipe.name)?'lance':/sword/i.test(recipe.name)?'greatsword':/axe/i.test(recipe.name)?'great-axe':'two-hand-other';if(type==='ranged')return /crossbow/i.test(recipe.name)?'crossbow':'bow';return type}
function recipePartyWeight(recipe,party){const sample={name:recipe.name,slot:recipe.slot,weaponType:recipe.type,armorClass:recipe.armorClass},tags=itemEquipTags(sample);return 1+party.reduce((n,h)=>{const rules=currentEquipRule(h);return n+(recipe.slot==='accessory'||(recipe.slot==='weapon'?rules.weapons.some(t=>tags.includes(t)):rules.armor.includes('armor:'+armorWeight(sample)))?2:0)},0)}
function weightedRecipePick(entries,weight){let roll=Math.random()*entries.reduce((n,e)=>n+weight(e),0);for(const entry of entries){roll-=weight(entry);if(roll<0)return entry}return entries[entries.length-1]}
generateGear=function(run,room){const party=(run?.ids||heroes.map(h=>h.id)).map(id=>heroes.find(h=>h.id===id)).filter(Boolean),roll=Math.random(),kind=roll<.58?'weapon':roll<.9?'armor':'accessory',pool=FORGE_RECIPES.filter(r=>kind==='weapon'?r.slot==='weapon':kind==='armor'?['head','chest','hands','legs','feet'].includes(r.slot):r.slot==='accessory'),groups=[...new Set(pool.map(recipeDropGroup))],group=weightedRecipePick(groups,g=>Math.max(...pool.filter(r=>recipeDropGroup(r)===g).map(r=>recipePartyWeight(r,party)))),recipe=weightedRecipePick(pool.filter(r=>recipeDropGroup(r)===group),r=>recipePartyWeight(r,party)),item=makeForgeItem(recipe,Math.max(1,run?.scale||forgeLevel())),quality=rollGearRank(run,room),rank=FORGE_RARITIES.indexOf(quality);for(let i=0;i<Math.min(rank,3);i++)promoteForgeItem(item);if(rank===4){item.rarity='Legendary';if(item.stats.power)item.stats.power+=2;else if(item.stats.armor)item.stats.armor+=2;else item.stats.maxHp+=6}return item};
// Treasure rooms now award an actual item, using the same pool as combat drops.
const catalogueResolveRoom=resolveRoom;resolveRoom=function(...args){const r=runState,step=r?.step,room=r?.rooms[step],treasure=room&&['◇','✧'].includes(room.type),result=catalogueResolveRoom(...args);if(treasure&&runState===r&&r.step>step){const item=generateGear(r,room.type),s=window.wayfarerGearState;s.items.push(item);s.inventory.push(item.id);rememberCodexItem(item);recordBattleLog(`Treasure found: ${item.name} (${item.rarity}) · ${gearStatLine(item)}.`);save();renderRun()}return result};
for(const item of window.wayfarerGearState.items){const recipe=equipmentBaseRecipe(item);if(recipe?.armorClass){item.armorClass=recipe.armorClass;item.tags=(item.tags||[]).filter(t=>!t.startsWith('armor:'));itemEquipTags(item)}}
save();renderForgePage();renderMarketPage();
