/* Location ownership repair: local battles never borrow Mosslight routes, terrain, obstacles, or enemies. */
(function(){
'use strict';
const SOUTHGATE='exile-ambush',FLOODWORKS='sewer';
const profiles=[
 {name:'Southgate stone wall',description:'A mossy roadside wall native to the Southgate road.'},
 {name:'Southgate fallen oak',description:'A rain-dark fallen oak beside the capital road.'},
 {name:'Southgate hedgerow',description:'A dense wet hedge offering hard cover.'},
 {name:'Southgate wagon barricade',description:'A broken roadside wagon used as a barricade.'},
 {name:'Floodworks masonry',description:'Collapsed stonework from the Solaris flood channels.'},
 {name:'Floodworks rubble',description:'A marked blockage in a forgotten sewer passage.'}
];
while(OBSTACLE_MODELS.length<8)OBSTACLE_MODELS.push({name:'Reserved terrain',description:'Location-owned scenery.'});
for(let i=0;i<profiles.length;i++)OBSTACLE_MODELS[8+i]=profiles[i];
const themeObstacleIndex=obstacleModelIndex;
obstacleModelIndex=function(obstacle,theme){
 const map=theme===SOUTHGATE?{'southgate-wall':8,'southgate-tree':9,'southgate-hedge':10,'southgate-wagon':11}:theme===FLOODWORKS?{'sewer-masonry':12,'sewer-rubble':13}:null;
 return map?.[obstacle.kind]??(theme===SOUTHGATE?8:theme===FLOODWORKS?12:themeObstacleIndex(obstacle,theme));
};
BATTLEFIELDS[SOUTHGATE]=[{id:'southgate-ambush-v2',name:'Southgate Kill Zone',terrain:'Rain-dark meadow, wagon road, tall grass, and roadside cover.',height:(x,y)=>y<=2&&x>=10?1:0}];
BATTLEFIELDS[FLOODWORKS]=[
 {id:'floodworks-intake-v2',name:'The Rainward Intake',terrain:'Cobblestone walks cross a stone-lined flood channel.',height:(x,y)=>x>=13?1:0},
 {id:'floodworks-gallery-v2',name:'The Drowned Gallery',terrain:'Wet brick galleries and timber bridges flank the swollen channel.',height:(x,y)=>y<=2&&x>=8?1:0},
 {id:'floodworks-sluice-v2',name:'The Main Sluice',terrain:'Raised maintenance platforms overlook the main stone channel.',height:(x,y)=>x>=12?2:x>=9?1:0}
];
function key(x,y){return x+','+y}
const locationBeginBattle=beginBattle;
beginBattle=function(room,...args){
 const result=locationBeginBattle(room,...args),b=runState?.battle,theme=runState?.dungeon?.id;if(!b)return result;
 if(theme===SOUTHGATE){
  const kinds=['southgate-wall','southgate-hedge','southgate-tree'];
  b.obstacles.forEach((o,i)=>Object.assign(o,{kind:kinds[i%kinds.length],name:['Roadside wall','Rain-dark hedgerow','Felled oak'][i%3]}));
  b.battlefieldId='southgate-ambush-v2';
 }
 if(theme===FLOODWORKS){
  const stage=room?.sewerStage||Math.min(3,(runState.step||0)+1);
  b.battlefieldId=['floodworks-intake-v2','floodworks-gallery-v2','floodworks-sluice-v2'][stage-1];
  b.obstacles.forEach(o=>{if(o.optionalObjective)Object.assign(o,{kind:'sewer-rubble',name:o.name||'Marked rubble pile'});else Object.assign(o,{kind:'sewer-masonry',name:'Floodworks masonry'})});
  for(const [i,position] of (b.sewerChannel||[]).entries())if(i%6===3&&b.tileTerrain?.[position])b.tileTerrain[position]={type:'bridge',name:'Wooden channel bridge'};
  b.foes.forEach(foe=>{const profile=ENEMY_CATALOG[foe.archetype];if(profile?.dungeon===FLOODWORKS){foe.sprite=profile.sprite;foe.locationTheme=FLOODWORKS}});
 }
 renderRun();return result;
};
const locationRenderBattle=renderBattle;
renderBattle=function(...args){
 const result=locationRenderBattle(...args),b=runState?.battle,panel=document.getElementById('battlePanel'),theme=runState?.dungeon?.id;if(!b||!panel||![SOUTHGATE,FLOODWORKS].includes(theme))return result;
 panel.dataset.dungeon=theme;
 for(const cell of panel.querySelectorAll('.iso-cell')){
  const x=Number(cell.dataset.worldX),y=Number(cell.dataset.worldY),terrain=b.tileTerrain?.[key(x,y)];
  cell.classList.remove('terrain-water','terrain-hazard','terrain-tall-grass','terrain-bridge');if(terrain)cell.classList.add('terrain-'+terrain.type);
  if(terrain?.type==='bridge'){cell.querySelectorAll('.terrain-marker').forEach(marker=>marker.remove());cell.title=cell.title.replace(/ · Wooden channel bridge[^·]*/g,'')+' · Wooden channel bridge'}
 }
 if(theme===FLOODWORKS)for(const foe of b.foes.filter(f=>f.hp>0)){
  const profile=ENEMY_CATALOG[foe.archetype];if(profile?.dungeon!==FLOODWORKS)continue;
  const cell=panel.querySelector(`[data-world-x="${foe.x}"][data-world-y="${foe.y}"]`),sprite=cell?.querySelector('.enemy-sprite');if(!sprite)continue;
  sprite.className=`unit-sprite enemy-sprite sewer-enemy-sprite ${foe.facing==='E'?'face-east':''}`;sprite.style.backgroundImage=`url('./assets/floodworks-enemy-v2-${profile.sprite-40}.png')`;sprite.style.backgroundSize='contain';sprite.style.backgroundPosition='center bottom';
 }
 return result;
};
window.WayfarerLocationThemes=Object.freeze({version:'1.0.0',owned:[SOUTHGATE,FLOODWORKS]});
})();
