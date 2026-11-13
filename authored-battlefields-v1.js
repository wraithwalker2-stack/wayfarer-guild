/* Final, authoritative rendering pass for battlefields with bespoke authored terrain. */
(function(){
'use strict';
const TILESETS=Object.freeze({
 greenway:{folder:'greenway'},mosslight:{folder:'mosslight'},ashen:{folder:'ashen'},sepulcher:{folder:'sepulcher'},
 'exile-ambush':{folder:'southgate'},'veilwake-crypt':{folder:'veilwake'},
 sewer:{stage:1,folder:'sewer/stage-1'}
});
function asset(folder,file){return `url('./assets/tilesets/${folder}/${file}')`}
function sewerSet(stage){const n=Math.max(1,Math.min(3,Number(stage)||1));return{stage:n,folder:`sewer/stage-${n}`}}
function important(node,name,value){node?.style.setProperty(name,value,'important')}
function clearTerrainClasses(cell){for(const name of [...cell.classList])if(name.startsWith('terrain-'))cell.classList.remove(name)}
function renderSewer(b,panel,grid){
 const set=sewerSet(b.sewerStage);panel.dataset.tileset=set.folder;
 panel.dataset.dungeon='sewer';panel.classList.add('authored-sewer-final');
 [...grid.children].forEach((cell,index)=>{
  const x=Number.isFinite(Number(cell.dataset.worldX))?Number(cell.dataset.worldX):index%FIELD_W;
  const y=Number.isFinite(Number(cell.dataset.worldY))?Number(cell.dataset.worldY):Math.floor(index/FIELD_W);
  if(!b.roomTiles?.[y*FIELD_W+x])return;
  const terrain=b.tileTerrain?.[`${x},${y}`],type=terrain?.type||'brick',ground=cell.querySelector('.iso-ground');
  clearTerrainClasses(cell);cell.classList.add('terrain-'+type);cell.dataset.authoredTerrain=type;
  important(ground,'background-image',asset(set.folder,(type==='brick'?'brick':type)+'.jpg'));important(ground,'background-size','cover');important(ground,'background-position','center');important(ground,'background-repeat','no-repeat');important(ground,'background-blend-mode','normal');
  important(ground,'background-color',type==='deep-water'?'#123f47':type==='shallow-water'?'#33433f':type==='bridge'?'#5b3825':'#51453d');
  important(ground,'filter',type.includes('water')?'brightness(.9) saturate(1.08)':'brightness(var(--stone-shade,1)) saturate(.9) contrast(1.05)');
  cell.title=`${terrain?.name||'Raised stone-brick walk'} · elevation ${b.elevations?.[y*FIELD_W+x]||0}`;
 });
}
function renderVeilwake(b,panel,grid){
 panel.dataset.dungeon='veilwake-crypt';panel.dataset.tileset='veilwake';panel.classList.add('veilwake-cathedral-field','authored-room','authored-veilwake-final');
 for(const sprite of grid.querySelectorAll('.veilwake-enemy-sprite')){
  important(sprite,'background-image',"url('./assets/veilwake-enemies-v1.png')");important(sprite,'background-size','200% 200%');important(sprite,'background-position','var(--sprite-x) var(--sprite-y)');important(sprite,'background-repeat','no-repeat');
 }
 if(window.WayfarerVeilwakeCathedral?.decorate)window.WayfarerVeilwakeCathedral.decorate();
}
function renderRegional(id,panel,grid){
 const set=TILESETS[id];if(!set)return;panel.dataset.tileset=set.folder;
 for(const cell of grid.children){if(cell.classList.contains('void-cell'))continue;const ground=cell.querySelector('.iso-ground');if(!ground)continue;const file=cell.classList.contains('terrain-water')?'water.jpg':cell.classList.contains('terrain-hazard')?'hazard.webp':id==='exile-ambush'?'floor-atlas.png':'floor.jpg';important(ground,'background-image',asset(set.folder,file));important(ground,'background-repeat','no-repeat')}
}
function renderAuthoredBattlefield(){
 const b=window.runState?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid'),id=window.runState?.dungeon?.id;
 if(!b||!panel||!grid)return;
 if(id==='sewer')renderSewer(b,panel,grid);else if(id==='veilwake-crypt')renderVeilwake(b,panel,grid);else renderRegional(id,panel,grid);
}
const prior=window.renderBattle;
window.renderBattle=function(...args){const result=prior.apply(this,args);renderAuthoredBattlefield();return result};
window.WayfarerAuthoredBattlefields=Object.freeze({version:'1.1.0',tilesets:TILESETS,render:renderAuthoredBattlefield,audit(){const p=document.getElementById('battlePanel'),b=window.runState?.battle;if(!p||!b)return{state:'idle'};return{dungeon:window.runState?.dungeon?.id,tileset:p.dataset.tileset||null,stage:b.sewerStage||null,tiles:[...p.querySelectorAll('.iso-cell[data-authored-terrain]')].reduce((a,c)=>(a[c.dataset.authoredTerrain]=(a[c.dataset.authoredTerrain]||0)+1,a),{}),veilwakeSprites:p.querySelectorAll('.veilwake-enemy-sprite').length}}});
renderAuthoredBattlefield();
})();
