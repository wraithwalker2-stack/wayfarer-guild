/* Final battle invariant pass: five party members, unique positions, and one model per unit. */
(function(){
'use strict';
const PARTY_STARTS={
 greenway:[[2,5],[2,7],[3,4],[3,6],[3,8]],
 'exile-ambush':[[2,5],[2,7],[3,4],[3,6],[3,8]],
 sewer:[[4,2],[5,3],[6,4],[4,6],[6,7]],
 default:[[2,3],[2,5],[2,7],[3,4],[3,6]]
};
function open(b,x,y){return x>=0&&y>=0&&x<FIELD_W&&y<FIELD_H&&(!b.roomTiles||!!b.roomTiles[y*FIELD_W+x])&&!(b.obstacles||[]).some(o=>o.x===x&&o.y===y)}
function nearestOpen(b,start,used){for(let radius=0;radius<FIELD_W+FIELD_H;radius++)for(let y=0;y<FIELD_H;y++)for(let x=0;x<FIELD_W;x++)if(Math.abs(x-start[0])+Math.abs(y-start[1])===radius&&open(b,x,y)&&!used.has(`${x},${y}`))return{x,y};return{x:start[0],y:start[1]}}
function repairParty(r,b){
 const ids=(r.ids||[]).slice(0,5),current=new Map((b.heroes||[]).map(u=>[u.id,u])),starts=PARTY_STARTS[r.dungeon?.id]||PARTY_STARTS.default,used=new Set();
 b.heroes=ids.map((id,index)=>{const old=current.get(id)||{},oldKey=`${old.x},${old.y}`,preferred=Number.isFinite(old.x)&&Number.isFinite(old.y)&&open(b,old.x,old.y)&&!used.has(oldKey)?{x:old.x,y:old.y}:null,spot=preferred||nearestOpen(b,starts[index]||PARTY_STARTS.default[index],used);used.add(`${spot.x},${spot.y}`);return{...old,id,x:spot.x,y:spot.y,ap:Number.isFinite(old.ap)?old.ap:(heroes.find(h=>h.id===id)?.staminaMax||3),done:false,guarded:!!old.guarded,facing:'E',team:'party'}}).filter(u=>heroes.some(h=>h.id===u.id));
 if(b.heroes.length!==ids.length)recordBattleLog(`Battle integrity restored ${b.heroes.length}/${ids.length} valid party members.`);
}
const priorBegin=window.beginBattle;
window.beginBattle=function(...args){const result=priorBegin.apply(this,args),r=runState,b=r?.battle;if(b&&r?.ids?.length){repairParty(r,b);renderRun()}return result};
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args),r=runState,b=r?.battle,panel=document.getElementById('battlePanel');if(!b||!panel)return result;panel.dataset.partyCount=String(b.heroes.filter(u=>heroes.find(h=>h.id===u.id)?.hp>0).length);panel.dataset.enemyCount=String(b.foes.filter(f=>f.hp>0).length);window.WayfarerAuthoredBattlefields?.render?.();return result};
window.WayfarerBattleIntegrity=Object.freeze({version:'1.0.0',repair(){const r=runState,b=r?.battle;if(r&&b){repairParty(r,b);renderRun()}},audit(){const r=runState,b=r?.battle;return!b?{state:'idle'}:{dungeon:r.dungeon.id,requested:r.ids?.length||0,party:b.heroes.length,uniquePartyTiles:new Set(b.heroes.map(u=>`${u.x},${u.y}`)).size,enemies:b.foes.filter(f=>f.hp>0).length,tileset:document.getElementById('battlePanel')?.dataset.tileset||null}}});
})();
