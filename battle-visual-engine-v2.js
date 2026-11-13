/* Wayfarer Battle Visual Engine v2 — one authored scene, one logical overlay, one animation owner. */
(function(){
'use strict';
document.documentElement.classList.add('bv2-ready');
const ROOT='./assets/battle-v2/';
const SCENES=Object.freeze({
 greenway:'scenes/greenway.png',mosslight:'scenes/mosslight.png',ashen:'scenes/ashen.png',sepulcher:'scenes/sepulcher.png',
 'exile-ambush':'scenes/southgate.png','veilwake-crypt':'scenes/veilwake.png'
});
const HERO_CELLS=Object.freeze({squire:0,alchemist:1,rogue:2,fighter:3,knight:4,lancer:5,wizard:6,cleric:7,druid:8,archer:9,thief:10,bard:11,sentinel:12,runeblade:13,ninja:14,assassin:15,summoner:16,monk:17,engineer:18,nightbound:19});
const REGIONAL_CELLS=Object.freeze({
 sewer_rat:0,dire_rat:1,sewer_slime:2,caustic_slime:2,sludge_devourer:3,rat_king:4,
 greenway_wolf:5,greenway_badger:6,greenway_viper:7,greenway_raven:8,greenway_skirmisher:9,greenway_slinger:9,greenway_trapper:9,greenway_tamer:9,
 rootbound_brute:10,moss_archer:11,spore_tender:12,grotto_stalker:13,fungal_guardian:14,
 observatory_guard:15,lens_wraith:16,archive_acolyte:17,rift_stalker:18,astral_construct:19,
 crypt_revenant:20,bone_archer:21,grave_priest:22,hungry_ghoul:23,drowned_monarch:24
});
let lastEvent='';
function slug(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'')}
function sceneFor(run,battle){if(run.dungeon?.id==='sewer')return`scenes/sewer-stage-${Math.max(1,Math.min(3,Number(battle.sewerStage)||1))}.png`;return SCENES[run.dungeon?.id]||SCENES.mosslight}
function scenePosition(scene){return scene.endsWith('greenway.png')?'100% 62%':'50% 62%'}
function position(cell,cols,rows){const col=cell%cols,row=Math.floor(cell/cols);return{x:cols===1?0:col/(cols-1)*100,y:rows===1?0:row/(rows-1)*100}}
function makeUnit(kind,cell,atlas,cols,rows,extra=''){const p=position(cell,cols,rows),node=document.createElement('span');node.className=`bv2-unit bv2-${kind} ${extra}`;node.setAttribute('aria-hidden','true');node.style.setProperty('--bv2-atlas',`url('${ROOT}${atlas}')`);node.style.setProperty('--bv2-cols',String(cols));node.style.setProperty('--bv2-rows',String(rows));node.style.setProperty('--bv2-x',`${p.x}%`);node.style.setProperty('--bv2-y',`${p.y}%`);return node}
function gridCell(grid,unit,battle){const width=Number(battle?.width)||Number(window.FIELD_W)||18;return unit&&grid.children?.[unit.y*width+unit.x]}
function heroCell(hero){const key=slug(hero?.currentJob);return HERO_CELLS[key]??HERO_CELLS.squire}
function foeVisual(run,foe,index){
 const catalog=typeof ENEMY_CATALOG==='object'&&ENEMY_CATALOG?ENEMY_CATALOG:{};
 if(run.dungeon?.id==='veilwake-crypt'){const sprite=Number(catalog[foe.archetype]?.sprite);return{cell:Number.isFinite(sprite)?Math.abs(sprite-70)%10:index%10,atlas:'units/veilwake-enemies.png',cols:5,rows:2,extra:'bv2-veilwake'}}
 if(run.dungeon?.id==='exile-ambush'){const job=slug(foe.archetype).replace(/^exile/,'');return{cell:HERO_CELLS[job]??HERO_CELLS.fighter,atlas:'units/heroes.png',cols:5,rows:4,extra:'bv2-human-enemy'}}
 return{cell:REGIONAL_CELLS[foe.archetype]??((Number(catalog[foe.archetype]?.sprite)||index)%25),atlas:'units/regional-enemies.png',cols:5,rows:5,extra:'bv2-regional'};
}
function clearLegacyModels(grid){for(const node of grid.querySelectorAll('.unit-sprite,.bv2-unit'))node.remove()}
function renderUnits(run,battle,grid){
 clearLegacyModels(grid);
 battle.heroes.forEach((unit,index)=>{const hero=heroes.find(h=>h.id===unit.id),cell=gridCell(grid,unit,battle);if(!hero||!cell)return;const model=makeUnit('hero',heroCell(hero),'units/heroes.png',5,4,`bv2-job-${slug(hero.currentJob)} ${hero.hp<=0?'bv2-downed':''}`);model.style.setProperty('--bv2-delay',`${-index*.27}s`);cell.append(model)});
 battle.foes.forEach((foe,index)=>{if(foe.hp<=0)return;const cell=gridCell(grid,foe,battle);if(!cell)return;const visual=foeVisual(run,foe,index),model=makeUnit('enemy',visual.cell,visual.atlas,visual.cols,visual.rows,visual.extra);model.style.setProperty('--bv2-delay',`${-(index+.5)*.23}s`);if(foe.boss||foe.dedicatedBoss)model.classList.add('bv2-boss');cell.append(model)});
}
function renderEvent(battle,grid){const event=battle.visualEvent;if(!event?.at)return;const key=`${event.at}:${event.kind}:${event.sourceId}:${event.targetId}`;if(key===lastEvent)return;lastEvent=key;const all=[...battle.heroes,...battle.foes],source=all.find(u=>u.id===event.sourceId),target=all.find(u=>u.id===event.targetId),sourceCell=gridCell(grid,source,battle),targetCell=gridCell(grid,target,battle);if(sourceCell){sourceCell.classList.add('bv2-acting');setTimeout(()=>sourceCell.classList.remove('bv2-acting'),560)}if(targetCell){targetCell.classList.add('bv2-struck');const effect=document.createElement('span');effect.className=`bv2-effect bv2-effect-${event.kind||'hit'}`;effect.setAttribute('aria-hidden','true');targetCell.append(effect);setTimeout(()=>{targetCell.classList.remove('bv2-struck');effect.remove()},650)}}
function renderScene(){
 const run=runState,battle=run?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');if(!battle||!panel||!grid)return;
 const scene=sceneFor(run,battle);panel.classList.add('battle-visual-v2');panel.dataset.bv2Scene=scene.replace(/^scenes\//,'').replace(/\.png$/,'');grid.style.setProperty('--bv2-scene',`url('${ROOT}${scene}')`);grid.style.setProperty('--bv2-scene-scale','165% 165%');grid.style.setProperty('--bv2-scene-position',scenePosition(scene));grid.setAttribute('data-bv2-scene',panel.dataset.bv2Scene);
 [...grid.children].forEach(cell=>{cell.classList.add('bv2-logical-cell');const ground=cell.querySelector('.iso-ground');if(ground){ground.removeAttribute('style');ground.classList.add('bv2-hit-surface')}});
 renderUnits(run,battle,grid);renderEvent(battle,grid);
}
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args);renderScene();return result};
window.WayfarerBattleVisuals=Object.freeze({version:'2.0.0',render:renderScene,audit(){const panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');return!runState?.battle?{state:'idle'}:{state:'active',scene:panel?.dataset.bv2Scene||null,heroes:grid?.querySelectorAll('.bv2-hero').length||0,enemies:grid?.querySelectorAll('.bv2-enemy').length||0,legacyModels:grid?.querySelectorAll('.unit-sprite').length||0}}});
renderScene();
})();
