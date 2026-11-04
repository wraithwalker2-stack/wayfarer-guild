/* Deterministic painterly floor and water variants for authored tactical rooms. */
'use strict';
(function(){
 const previousRenderBattle=renderBattle;
 const rows={greenway:0,mosslight:1,ashen:2,sepulcher:3};
 const seeds={greenway:3,mosslight:11,ashen:19,sepulcher:29};
 const atlasPosition=value=>`${value*100/3}%`;
 function variantFor(theme,x,y,roomId){
  const seed=seeds[theme]||7;
  const roomSeed=String(roomId||'field').split('').reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
  return Math.abs(x*17+y*31+x*y*7+seed+roomSeed)%4;
 }
 renderBattle=function(...args){
  const result=previousRenderBattle(...args),b=runState?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');
  if(!b||!grid)return result;
  const theme=panel.dataset.dungeon||runState?.dungeon?.id||'mosslight',row=rows[theme]??1;
  [...grid.children].forEach((cell,index)=>{
   if(!cell.classList.contains('scenery-tile')||cell.classList.contains('void-cell'))return;
   const x=index%FIELD_W,y=Math.floor(index/FIELD_W),variant=variantFor(theme,x,y,b.roomTemplateId||b.battlefieldId);
   cell.style.setProperty('--floor-x',atlasPosition(variant));
   cell.style.setProperty('--floor-y',atlasPosition(row));
   cell.style.setProperty('--water-x',atlasPosition(variant));
   cell.style.setProperty('--water-y',atlasPosition(row));
   cell.style.setProperty('--water-phase',`${-((x*.41+y*.67+variant*.23)%4).toFixed(2)}s`);
   cell.dataset.floorVariant=String(variant+1);
   cell.dataset.terrainArt='v2';
   const ground=cell.querySelector('.iso-ground');
   if(ground&&!cell.classList.contains('terrain-hazard')){
    const water=cell.classList.contains('terrain-water');
    ground.style.setProperty('background-image',`url('./assets/${water?'tactical-water-atlas-v2.jpg':'tactical-floor-atlas-v2.jpg'}')`,'important');
    ground.style.setProperty('background-size','400% 400%','important');
    ground.style.setProperty('background-position',`${atlasPosition(variant)} ${atlasPosition(row)}`,'important');
    ground.style.setProperty('background-repeat','no-repeat','important');
   }
  });
  const cells=[...grid.children];
  [...grid.querySelectorAll('.scenery-tile.terrain-water')].forEach(cell=>{
   const index=cells.indexOf(cell),x=index%FIELD_W,y=Math.floor(index/FIELD_W);
   const touchesLand=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{
    const nx=x+dx,ny=y+dy;
    return nx<0||ny<0||nx>=FIELD_W||ny>=FIELD_H||!grid.children[ny*FIELD_W+nx]?.classList.contains('terrain-water');
   });
   cell.dataset.waterEdge=String(touchesLand);
  });
  return result;
 };
})();

