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
function cellPoint(cell,index){return{x:Number.isFinite(Number(cell.dataset.worldX))?Number(cell.dataset.worldX):index%FIELD_W,y:Number.isFinite(Number(cell.dataset.worldY))?Number(cell.dataset.worldY):Math.floor(index/FIELD_W)}}
function isWaterCell(cell){return cell.classList.contains('terrain-water')||cell.classList.contains('terrain-shallow-water')||cell.classList.contains('terrain-deep-water')}
function markWaterConnections(grid){
 const cells=[...grid.children],byPoint=new Map();
 cells.forEach((cell,index)=>{const p=cellPoint(cell,index);byPoint.set(`${p.x},${p.y}`,cell);for(const c of [...cell.classList])if(c.startsWith('water-links-')||c.startsWith('water-shape-'))cell.classList.remove(c)});
 cells.forEach((cell,index)=>{if(!isWaterCell(cell)||cell.classList.contains('void-cell'))return;const {x,y}=cellPoint(cell,index),links=['n','e','s','w'].filter((d,i)=>{const delta=[[0,-1],[1,0],[0,1],[-1,0]][i],other=byPoint.get(`${x+delta[0]},${y+delta[1]}`);return other&&isWaterCell(other)}),key=links.join('')||'pool';cell.dataset.waterLinks=key;cell.classList.add(`water-links-${key}`);const shape=links.length===0?'pool':links.length===1?'end':links.length===2&&((links.includes('n')&&links.includes('s'))||(links.includes('e')&&links.includes('w')))?'straight':links.length===2?'corner':links.length===3?'junction':'cross';cell.classList.add(`water-shape-${shape}`)});
}
function renderSewer(b,panel,grid){
 const set=sewerSet(b.sewerStage);panel.dataset.tileset=set.folder;
 panel.dataset.dungeon='sewer';panel.classList.add('authored-sewer-final');
 [...grid.children].forEach((cell,index)=>{
  const x=Number.isFinite(Number(cell.dataset.worldX))?Number(cell.dataset.worldX):index%FIELD_W;
  const y=Number.isFinite(Number(cell.dataset.worldY))?Number(cell.dataset.worldY):Math.floor(index/FIELD_W);
  if(!b.roomTiles?.[y*FIELD_W+x])return;
  const terrain=b.tileTerrain?.[`${x},${y}`],type=terrain?.type||'brick',ground=cell.querySelector('.iso-ground');
  clearTerrainClasses(cell);cell.classList.add('terrain-'+type);cell.dataset.authoredTerrain=type;
  const positions={brick:'0% 0%','deep-water':'100% 0%',bridge:'0% 100%','shallow-water':'100% 100%'};
  important(ground,'background-image',asset(set.folder,'terrain-hq-v2.png'));important(ground,'background-size','200% 200%');important(ground,'background-position',positions[type]||positions.brick);important(ground,'background-repeat','no-repeat');important(ground,'background-blend-mode','normal');
  important(ground,'background-color',type==='deep-water'?'#123f47':type==='shallow-water'?'#33433f':type==='bridge'?'#5b3825':'#51453d');
  important(ground,'filter',type.includes('water')?'brightness(.9) saturate(1.08)':'brightness(var(--stone-shade,1)) saturate(.9) contrast(1.05)');
  cell.title=`${terrain?.name||'Raised stone-brick walk'} · elevation ${b.elevations?.[y*FIELD_W+x]||0}`;
 });
 markWaterConnections(grid);
}
function renderVeilwake(b,panel,grid){
 panel.dataset.dungeon='veilwake-crypt';panel.dataset.tileset='veilwake';panel.classList.add('veilwake-cathedral-field','authored-room','authored-veilwake-final');
 for(const sprite of grid.querySelectorAll('.veilwake-enemy-sprite')){
  important(sprite,'background-image',"url('./assets/veilwake-enemies-v1.png')");important(sprite,'background-size','200% 200%');important(sprite,'background-position','var(--sprite-x) var(--sprite-y)');important(sprite,'background-repeat','no-repeat');
 }
 if(window.WayfarerVeilwakeCathedral?.decorate)window.WayfarerVeilwakeCathedral.decorate();
 renderRegional('veilwake-crypt',panel,grid);
}
function renderRegional(id,panel,grid){
 const set=TILESETS[id];if(!set)return;panel.dataset.tileset=set.folder;
 [...grid.children].forEach((cell,index)=>{if(cell.classList.contains('void-cell'))return;const ground=cell.querySelector('.iso-ground');if(!ground)return;const p=cellPoint(cell,index),height=Number(runState?.battle?.elevations?.[p.y*FIELD_W+p.x]||0),water=isWaterCell(cell),hazard=cell.classList.contains('terrain-hazard')||cell.classList.contains('terrain-tall-grass'),position=water?'0% 100%':hazard?'100% 100%':height>0?'100% 0%':'0% 0%';important(ground,'background-image',asset(set.folder,'terrain-hq-v2.png'));important(ground,'background-size','200% 200%');important(ground,'background-position',position);important(ground,'background-repeat','no-repeat');important(ground,'background-blend-mode','normal');cell.dataset.authoredTerrain=water?'water':hazard?'hazard':height>0?'raised':'floor'});
 markWaterConnections(grid);
}
function renderAuthoredBattlefield(){
 const b=runState?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid'),id=runState?.dungeon?.id;
 if(!b||!panel||!grid)return;
 if(id==='sewer')renderSewer(b,panel,grid);else if(id==='veilwake-crypt')renderVeilwake(b,panel,grid);else renderRegional(id,panel,grid);
}
const prior=window.renderBattle;
window.renderBattle=function(...args){const result=prior.apply(this,args);renderAuthoredBattlefield();return result};
window.WayfarerAuthoredBattlefields=Object.freeze({version:'1.2.0',tilesets:TILESETS,render:renderAuthoredBattlefield,audit(){const p=document.getElementById('battlePanel'),b=runState?.battle;if(!p||!b)return{state:'idle'};return{dungeon:runState?.dungeon?.id,tileset:p.dataset.tileset||null,stage:b.sewerStage||null,tiles:[...p.querySelectorAll('.iso-cell[data-authored-terrain]')].reduce((a,c)=>(a[c.dataset.authoredTerrain]=(a[c.dataset.authoredTerrain]||0)+1,a),{}),water:[...p.querySelectorAll('[data-water-links]')].map(c=>c.dataset.waterLinks),veilwakeSprites:p.querySelectorAll('.veilwake-enemy-sprite').length}}});
renderAuthoredBattlefield();
})();
