/* Dedicated Veilwake cathedral battlefield presentation and enemy identity. */
(function(){
'use strict';
const DUNGEON_ID='veilwake-crypt';
const ENEMY_ORDER=['veil_thrall','dusk_stalker','grave_courtier'];
const OBSTACLES=[
 {kind:'cathedral-angel',name:'Broken marble angel'},
 {kind:'cathedral-candelabrum',name:'Black iron candelabrum'},
 {kind:'cathedral-sarcophagus',name:'Cracked noble sarcophagus'},
 {kind:'cathedral-column',name:'Collapsed gothic column'}
];
function profileFor(foe,index,b){
 const key=(b.finalBossRoom&&(foe.dedicatedBoss||index===0))?'crimson_baron':ENEMY_ORDER[index%ENEMY_ORDER.length];
 return {key,profile:ENEMY_CATALOG[key]};
}
function rebuildEnemies(b){
 b.foes.forEach((foe,index)=>{
  const {key,profile}=profileFor(foe,index,b),hpRatio=foe.maxHp?foe.hp/foe.maxHp:1;
  Object.assign(foe,{archetype:key,name:profile.name,role:profile.role,attackRange:profile.range,move:profile.move,magic:['dusk_stalker','grave_courtier','crimson_baron'].includes(key),armor:Math.max(foe.armor||0,profile.armor),resistance:Math.max(foe.resistance||0,profile.resistance),team:'enemy'});
  foe.hp=Math.max(1,Math.round(foe.maxHp*hpRatio));
  rememberEnemy?.(foe);
 });
}
function rebuildObstacles(b){
 b.obstacles=(b.obstacles||[]).map((obstacle,index)=>({...obstacle,...OBSTACLES[index%OBSTACLES.length],cathedralModel:index%OBSTACLES.length,icon:'◆'}));
}
function elevationAt(b,x,y){return b.elevations?.[y*FIELD_W+x]||0}
function stairDirection(b,x,y){
 const here=elevationAt(b,x,y),neighbors=[[1,0,'east'],[0,1,'south'],[-1,0,'west'],[0,-1,'north']];
 const lower=neighbors.find(([dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>=0&&ny>=0&&nx<FIELD_W&&ny<FIELD_H&&b.roomTiles?.[ny*FIELD_W+nx]&&here-elevationAt(b,nx,ny)===1});
 return lower?.[2]||'';
}
function floorVariant(b,x,y){
 const seed=String(b.roomTemplateId||b.battlefieldId||'cathedral').split('').reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
 return Math.abs(x*19+y*37+x*y*5+seed)%4;
}
function decorate(){
 const b=runState?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');
 if(!b||runState?.dungeon?.id!==DUNGEON_ID||!panel||!grid)return;
 panel.dataset.dungeon=DUNGEON_ID;panel.classList.add('veilwake-cathedral-field','authored-room');
 const scene=panel.querySelector('.dungeon-scene');if(scene)scene.dataset.dungeon=DUNGEON_ID;
 [...grid.children].forEach((cell,index)=>{
  const x=index%FIELD_W,y=Math.floor(index/FIELD_W),open=!b.roomTiles||!!b.roomTiles[index];
  cell.classList.toggle('veilwake-open-tile',open);cell.classList.remove('veilwake-stairs');delete cell.dataset.stairDirection;
  if(!open)return;
  let ground=cell.querySelector('.iso-ground');
  if(!ground){cell.insertAdjacentHTML('beforeend','<span class="iso-ground" aria-hidden="true"></span>');ground=cell.querySelector('.iso-ground')}
  const variant=floorVariant(b,x,y),vx=variant%2,vy=Math.floor(variant/2);
  ground.classList.add('veilwake-marble-ground');
  ground.style.setProperty('--cathedral-floor-x',`${vx*100}%`);
  ground.style.setProperty('--cathedral-floor-y',`${vy*100}%`);
  const direction=stairDirection(b,x,y);
  cell.querySelector('.cathedral-stairs')?.remove();
  if(direction){cell.classList.add('veilwake-stairs');cell.dataset.stairDirection=direction;cell.insertAdjacentHTML('beforeend',`<span class="cathedral-stairs stair-${direction}" aria-hidden="true"></span>`)}
  const terrain=b.tileTerrain?.[`${x},${y}`];
  if(terrain?.type==='water')terrain.name='Blackglass reflecting pool';
  if(terrain?.type==='hazard')terrain.name='Crimson ritual seal';
  const label=`Veilwake cathedral marble · elevation ${elevationAt(b,x,y)}${direction?' · staircase '+direction:''}`;
  ground.title=label;if(!cell.classList.contains('obstacle')){cell.title=label;cell.setAttribute('aria-label',label)}
 });
 for(const obstacle of b.obstacles||[]){
  const cell=grid.children[obstacle.y*FIELD_W+obstacle.x],model=cell?.querySelector('.obstacle-model');if(!cell||!model)continue;
  const variant=Number.isFinite(obstacle.cathedralModel)?obstacle.cathedralModel:0;
  Object.assign(obstacle,OBSTACLES[variant]);
  cell.classList.add('veilwake-cathedral-obstacle');cell.dataset.cathedralObstacle=String(variant);
  model.classList.add('cathedral-obstacle-model');model.style.setProperty('--cathedral-obstacle-x',`${variant%2*100}%`);model.style.setProperty('--cathedral-obstacle-y',`${Math.floor(variant/2)*100}%`);
  cell.title=`${obstacle.name}. Blocks movement and line of sight. Elevation ${elevationAt(b,obstacle.x,obstacle.y)}.`;cell.setAttribute('aria-label',cell.title);
 }
}
const previousBegin=window.beginBattle;
window.beginBattle=function(...args){
 const result=previousBegin.apply(this,args),b=runState?.battle;
 if(!b||runState?.dungeon?.id!==DUNGEON_ID)return result;
 b.cathedralTerrain=true;b.battlefieldId=b.finalBossRoom?'veilwake-midnight-court':`veilwake-${b.roomTemplateId||'gallery'}`;
 b.terrainDescription=b.finalBossRoom?'A marble stair rises above black reflecting pools to the Crimson Baron’s midnight court.':'Moonlit marble galleries, gothic monuments, and stepped cathedral terraces shape the approach.';
 rebuildEnemies(b);rebuildObstacles(b);recordBattleLog('The Bloodbound court gathers across the marble cathedral terraces.');renderRun();return result;
};
const previousRender=window.renderBattle;
window.renderBattle=function(...args){const result=previousRender.apply(this,args);decorate();return result};
window.WayfarerVeilwakeCathedral=Object.freeze({version:'1.0.0',decorate,audit(){const b=runState?.battle;if(!b||runState?.dungeon?.id!==DUNGEON_ID)return{state:'idle'};return{state:'active',enemies:b.foes.map(f=>f.archetype),openTiles:b.roomTiles?.filter(Boolean).length||0,stairs:[...document.querySelectorAll('#battlePanel .veilwake-stairs')].length,obstacles:b.obstacles?.map(o=>o.kind)||[]}}});
decorate();
})();
