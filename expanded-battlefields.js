/* 20x11 authored battlefields: 220 possible cells, over 50% more than the former 16x9 canvas. */
(function(){
'use strict';
const priorBeginBattle=window.beginBattle;
const layouts={
 chamber:{contains:(x,y)=>x<=17&&y>=1&&y<=9&&!((x===0||x===17)&&(y===1||y===9)),height:(x,y)=>x>=14?1:0,props:[[7,2,'root-rock'],[9,8,'fallen-root'],[13,5,'mossy-stone']]},
 crossing:{contains:(x,y)=>(y>=2&&y<=8)||(x>=7&&x<=13),height:(x,y)=>x>=15?1:0,props:[[8,2,'root-rock'],[12,8,'fallen-root'],[15,5,'mossy-stone']]},
 dogleg:{contains:(x,y)=>x<=7||(y>=5&&x<=19),height:(x,y)=>x>=15?1:0,props:[[3,5,'root-rock'],[12,8,'fallen-root'],[17,6,'mossy-stone']]},
 causeway:{contains:(x,y)=>y>=1&&y<=9&&(x<=7||x>=12||(y>=4&&y<=6)),height:(x,y)=>x>=14?1:0,props:[[4,2,'root-rock'],[15,8,'fallen-root'],[10,5,'mossy-stone']]},
 courtyard:{contains:(x,y)=>x<=19&&y<=10&&!(x>=8&&x<=12&&y>=4&&y<=6),height:(x,y)=>x>=16?1:0,props:[[5,5,'root-rock'],[15,5,'fallen-root'],[10,2,'mossy-stone']]},
 throne:{contains:(x,y)=>x>=1&&x<=18&&y>=1&&y<=9&&!((x===1||x===18)&&(y===1||y===9)),height:(x,y)=>x>=16?2:x>=13?1:0,props:[[8,2,'ruin-stone'],[8,8,'ruin-stone'],[14,5,'rune-pillar']]},
 greenway:{contains:(x,y)=>x>=0&&x<=19&&y>=1&&y<=9&&!((x===0||x===19)&&(y===1||y===9)),height:(x,y)=>(x>=16&&y<=3)||(x>=17&&y>=7)?1:0,props:[[7,2,'fallen-root'],[10,8,'root-rock'],[14,4,'fallen-root'],[16,7,'root-rock']]}
};
function points(b,test){const result=[];for(let y=0;y<FIELD_H;y++)for(let x=0;x<FIELD_W;x++)if(b.roomTiles[y*FIELD_W+x]&&test(x,y))result.push({x,y});return result}
function shuffled(list){return list.map(value=>({value,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(x=>x.value)}
function obstacleStyle(theme,kind){
 if(theme==='greenway')return kind==='fallen-root'?{kind:'fallen-root',name:'Fallen log'}:{kind:'root-rock',name:'Forest boulder'};
 if(theme==='mosslight')return kind==='fallen-root'?{kind:'fallen-root',name:'Fallen root'}:kind==='mossy-stone'?{kind:'mossy-stone',name:'Mossbound stone'}:{kind:'root-rock',name:'Rootbound stone'};
 if(theme==='ashen')return kind==='rune-pillar'?{kind:'rune-pillar',name:'Aether pillar'}:kind==='fallen-root'?{kind:'ash-mound',name:'Ashen rubble'}:{kind:'ruin-stone',name:'Observatory masonry'};
 return kind==='rune-pillar'?{kind:'rune-pillar',name:'Funerary pillar'}:{kind:'ruin-stone',name:'Sepulcher masonry'};
}
function applyLayout(b,theme){
 const id=theme==='greenway'?'greenway':b.finalBossRoom?'throne':b.roomTemplateId;
 const layout=layouts[id]||layouts.chamber,entrance=b.roomEntrance||'west';
 b.width=FIELD_W;b.height=FIELD_H;b.expandedBattlefield=true;b.roomTemplateId=id;
 b.roomTiles=Array.from({length:FIELD_W*FIELD_H},(_,i)=>layout.contains(i%FIELD_W,Math.floor(i/FIELD_W)));
 b.elevations=b.roomTiles.map((exists,i)=>exists?layout.height(i%FIELD_W,Math.floor(i/FIELD_W)):0);
 b.roomTileCount=b.roomTiles.filter(Boolean).length;
 const inStart=(x,y)=>entrance==='north'?y<=2:entrance==='south'?y>=FIELD_H-3:x<=3;
 let starts=points(b,inStart);
 starts.sort((a,c)=>entrance==='north'?a.y-c.y||Math.abs(a.x-4)-Math.abs(c.x-4):entrance==='south'?c.y-a.y||Math.abs(a.x-4)-Math.abs(c.x-4):a.x-c.x||Math.abs(a.y-5)-Math.abs(c.y-5));
 const ranked=b.heroes.slice().sort((a,c)=>{const rank=u=>{const h=heroes.find(hero=>hero.id===u.id);return hasJobRole(h,'tank')?0:hasJobRole(h,'frontline')?1:hasJobRole(h,'healer')?3:2};return rank(a)-rank(c)});
 const occupied=new Set();
 ranked.forEach((unit,index)=>{const spot=starts.find(p=>!occupied.has(`${p.x},${p.y}`))||starts[index];if(spot){Object.assign(unit,spot);occupied.add(`${spot.x},${spot.y}`)}});
 b.deploymentTiles=starts.map(p=>`${p.x},${p.y}`);
 b.obstacles=layout.props.filter(([x,y])=>b.roomTiles[y*FIELD_W+x]&&!inStart(x,y)).map(([x,y,kind])=>({x,y,...obstacleStyle(theme,kind),icon:'◆'}));
 for(const obstacle of b.obstacles)occupied.add(`${obstacle.x},${obstacle.y}`);
 const enemyZone=(x,y)=>entrance==='north'?y>=FIELD_H-3:entrance==='south'?y<=2:x>=FIELD_W-4;
 const enemySpots=shuffled(points(b,enemyZone)),fallback=shuffled(points(b,(x,y)=>!inStart(x,y)));
 for(const foe of b.foes.filter(f=>f.hp>0)){
  const spot=[...enemySpots,...fallback].find(p=>!occupied.has(`${p.x},${p.y}`));
  if(spot){Object.assign(foe,spot);occupied.add(`${spot.x},${spot.y}`)}
 }
 if(typeof addTacticalTerrain==='function')addTacticalTerrain(b);
 b.cameraNeedsCenter=true;delete b.cameraScrollLeft;delete b.cameraScrollTop;
}
window.beginBattle=function(...args){const result=priorBeginBattle.apply(this,args),r=runState,b=r?.battle;if(!b)return result;applyLayout(b,r.dungeon?.id||'mosslight');recordBattleLog(`Expanded battlefield: ${b.roomTileCount} traversable tiles across a 20 × 11 tactical canvas.`);renderRun();return result};
/* All tactical pathing respects the authored room silhouette instead of crossing empty gaps. */
function walkable(b,x,y){return x>=0&&x<FIELD_W&&y>=0&&y<FIELD_H&&(!b.roomTiles||!!b.roomTiles[y*FIELD_W+x])&&!fieldObstacleAt(b,x,y)}
function occupiedSet(b,skip){return new Set([...b.heroes.filter(u=>u!==skip&&heroes.find(h=>h.id===u.id)?.hp>0),...b.foes.filter(f=>f!==skip&&f.hp>0)].map(u=>`${u.x},${u.y}`))}
battlePath=function(b,unit,target,range=1){const blocked=occupiedSet(b,unit),queue=[{x:unit.x,y:unit.y,path:[]}],seen=new Set([`${unit.x},${unit.y}`]);for(let i=0;i<queue.length;i++){const point=queue[i];if(distance(point,target)<=range&&fieldLineOfSight(point,target,b))return point.path;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=point.x+dx,y=point.y+dy,key=`${x},${y}`;if(seen.has(key)||blocked.has(key)||!walkable(b,x,y))continue;seen.add(key);queue.push({x,y,path:[...point.path,{x,y}]})}}return null};
reachableTiles=function(actor){const b=runState?.battle,h=heroes.find(hero=>hero.id===actor.id);if(!b||!h)return[];const max=Math.max(0,moveRange(h)),blocked=occupiedSet(b,actor),queue=[{x:actor.x,y:actor.y,d:0}],seen=new Set([`${actor.x},${actor.y}`]),result=[];for(let i=0;i<queue.length;i++){const point=queue[i];if(point.d>=max)continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=point.x+dx,y=point.y+dy,key=`${x},${y}`;if(seen.has(key)||blocked.has(key)||!walkable(b,x,y))continue;seen.add(key);const next={x,y,d:point.d+1};queue.push(next);result.push({x,y})}}return result};
enemyRouteToAdjacent=function(foe,target,b){return battlePath(b,foe,target,1)||[]};
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args),panel=document.getElementById('battlePanel');if(runState?.battle?.expandedBattlefield&&panel){panel.classList.add('expanded-battlefield');panel.dataset.fieldSize='20x11'}return result};
})();

