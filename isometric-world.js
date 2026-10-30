/* Appearance presets and real tile elevations; rendering never changes tile coordinates. */
'use strict';
const APPEARANCE_DEFAULTS=[['woman','fair'],['man','olive'],['man','fair'],['man','olive'],['woman','deep'],['man','fair']];
function characterAppearance(h){const defaults=APPEARANCE_DEFAULTS[Math.max(0,(h.id||1)-1)%APPEARANCE_DEFAULTS.length];h.appearance=h.appearance||{gender:defaults[0],tone:defaults[1]};if(!['woman','man'].includes(h.appearance.gender))h.appearance.gender=defaults[0];if(!['fair','olive','deep'].includes(h.appearance.tone))h.appearance.tone=defaults[1];return h.appearance}
function appearanceId(h){const a=characterAppearance(h);return a.gender+'-'+a.tone}
function heroPortraitMarkup(h){const index=Math.max(0,HERO_SPRITE_JOBS.indexOf(visualJobFor(h))),x=index%4,y=Math.floor(index/4);return `<span role="img" aria-label="${escapeGameText(h.name)}, ${h.currentJob} portrait" class="hero-portrait-art" style="--sprite-x:${x/3*100}%;--sprite-y:${y/2*100}%;background-image:url('./assets/portraits-${appearanceId(h)}.webp')"></span>`}
spriteMarkup=function(kind,index,extra='',hero=null){const cols=kind==='hero'?4:5,rows=kind==='hero'?3:2,x=index%cols,y=Math.floor(index/cols),source=kind==='hero'&&hero?`;background-image:url('./assets/hero-${appearanceId(hero)}.webp')`:'';return `<span aria-hidden="true" class="unit-sprite ${kind}-sprite ${extra}" style="--sprite-x:${x/(cols-1)*100}%;--sprite-y:${y/(rows-1)*100}%${source}"></span>`};
function setCharacterAppearance(id,key,value){const h=heroes.find(h=>h.id===id);if(!h||!['gender','tone'].includes(key))return;if(key==='gender'&&!['woman','man'].includes(value)||key==='tone'&&!['fair','olive','deep'].includes(value))return;characterAppearance(h)[key]=value;save();renderRoster();openHero(id,heroSheetPage||'overview');if(runState?.battle)renderRun()}
const appearanceOpenHero=openHero;openHero=function(id,...args){const result=appearanceOpenHero(id,...args),h=heroes.find(h=>h.id===id),page=document.querySelector('#heroDetails [data-sheet-page="overview"]');if(!h||!page)return result;const a=characterAppearance(h),portrait=page.querySelector('.detailportrait');if(portrait){portrait.innerHTML=heroPortraitMarkup(h);portrait.classList.add('painted-portrait')}page.insertAdjacentHTML('beforeend',`<div class="appearance-options"><div><b>Character appearance</b><small>Portrait and combat model follow this appearance in every class.</small></div><label>Gender<select onchange="setCharacterAppearance(${id},'gender',this.value)"><option value="woman" ${a.gender==='woman'?'selected':''}>Woman</option><option value="man" ${a.gender==='man'?'selected':''}>Man</option></select></label><label>Complexion<select onchange="setCharacterAppearance(${id},'tone',this.value)"><option value="fair" ${a.tone==='fair'?'selected':''}>Fair</option><option value="olive" ${a.tone==='olive'?'selected':''}>Olive / medium</option><option value="deep" ${a.tone==='deep'?'selected':''}>Deep</option></select></label></div>`);return result};
const appearanceRoster=renderRoster;renderRoster=function(...args){const result=appearanceRoster(...args);document.querySelectorAll('#roster .hero .portrait').forEach((el,i)=>{if(heroes[i]){el.innerHTML=heroPortraitMarkup(heroes[i]);el.classList.add('painted-portrait')}});return result};
const BATTLEFIELDS={
 mosslight:[
  {id:'mosslight-v2',name:'Moonwort Grotto',terrain:'A sheltered central floor with low mossy ledges.',height:(x,y)=>x>=8&&y>=2&&y<=6?1:0},
  {id:'moss-stream',name:'Glowstream Crossing',terrain:'A shallow stream depression separates raised banks; cross at the stone fords.',height:(x,y)=>x===6&&y!==2&&y!==6?0:1},
  {id:'moss-terraces',name:'Fungal Terraces',terrain:'Broad eastern terraces offer higher ground, reached one level at a time.',height:(x,y)=>x>=9?2:x>=5?1:0},
  {id:'moss-ruins',name:'The Broken Causeway',terrain:'An old raised causeway runs through the cavern; its approaches form ramps.',height:(x,y)=>y>=3&&y<=5?(x>=4&&x<=9?2:1):0},
  {id:'moss-crystals',name:'Emerald Shelf',terrain:'A raised central limestone shelf overlooks the crystal pools.',height:(x,y)=>x>=4&&x<=9&&y>=2&&y<=6?(x>=5&&x<=8&&y>=3&&y<=5?2:1):0}
 ],
 ashen:[
  {id:'ashen-v2',name:'The Shattered Hall',terrain:'The central marble floor is flanked by a low gallery.',height:(x,y)=>y<=1||y>=7?1:0},
  {id:'ashen-orrery',name:'Orrery of Cinders',terrain:'A broad stepped dais gives the center commanding elevation.',height:(x,y)=>x>=4&&x<=9&&y>=2&&y<=6?(x>=5&&x<=8&&y>=3&&y<=5?2:1):0},
  {id:'ashen-archives',name:'The Silent Archive',terrain:'Raised archive galleries overlook the central aisle.',height:(x,y)=>y<=2||y>=6?(x>=4&&x<=9?2:1):0},
  {id:'ashen-rooftop',name:'Stargazer Terrace',terrain:'A long stepped roof terrace rises toward the eastern parapet.',height:(x,y)=>x>=9?2:x>=5?1:0},
  {id:'ashen-rift',name:'The Fractured Meridian',terrain:'A shallow rift channel divides two raised galleries with stone crossings.',height:(x,y)=>x===6&&y!==2&&y!==6?0:y===0||y===8?2:1}
 ]
};
function terrainHeight(b,x,y){return b?.elevations?.[y*FIELD_W+x]||0}
function pathMovementCost(path){return path?.reduce((n,p)=>n+(p.stepCost||1),0)||0}
function movementPrefix(path,budget){const out=[];let spent=0;for(const p of path||[]){const cost=p.stepCost||1;if(spent+cost>budget)break;spent+=cost;out.push(p)}return out}
function movementStepCost(b,a,z){const climb=terrainHeight(b,z.x,z.y)-terrainHeight(b,a.x,a.y);return climb>1?Infinity:1+Math.max(0,climb)}
function terrainReach(b,unit,budget=Infinity){const occupied=new Set([...b.heroes.filter(u=>u!==unit&&heroes.find(h=>h.id===u.id)?.hp>0),...b.foes.filter(f=>f!==unit&&f.hp>0),...(b.obstacles||[])].map(u=>u.x+','+u.y)),q=[{x:unit.x,y:unit.y,cost:0,path:[]}],best=new Map([[unit.x+','+unit.y,0]]),out=[];while(q.length){q.sort((a,c)=>a.cost-c.cost);const p=q.shift();if(p.cost!==best.get(p.x+','+p.y))continue;out.push(p);for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,key=x+','+y,stepCost=movementStepCost(b,p,{x,y}),cost=p.cost+stepCost;if(x<0||x>=FIELD_W||y<0||y>=FIELD_H||(b.roomTiles&&!b.roomTiles[y*FIELD_W+x])||cost>budget||!Number.isFinite(cost)||occupied.has(key)||cost>=(best.get(key)??Infinity))continue;best.set(key,cost);q.push({x,y,cost,path:[...p.path,{x,y,stepCost}]})}}return out}
const flatLineOfSight=fieldLineOfSight;fieldLineOfSight=function(a,z,b){if(!flatLineOfSight(a,z,b))return false;const count=Math.max(Math.abs(z.x-a.x),Math.abs(z.y-a.y))*3,eyeA=terrainHeight(b,a.x,a.y)+1,eyeZ=terrainHeight(b,z.x,z.y)+1;for(let i=1;i<count;i++){const t=i/count,x=Math.round(a.x+(z.x-a.x)*t),y=Math.round(a.y+(z.y-a.y)*t);if((x===a.x&&y===a.y)||(x===z.x&&y===z.y))continue;if(terrainHeight(b,x,y)>eyeA+(eyeZ-eyeA)*t+.15)return false}return true};
battlePath=function(b,unit,target,range=1){const route=terrainReach(b,unit).find(p=>distance(p,target)<=range&&fieldLineOfSight(p,target,b));return route?route.path:null};
reachableTiles=function(actor){const b=runState?.battle,h=heroes.find(h=>h.id===actor.id);if(!b||!h)return [];return terrainReach(b,actor,moveRange(h)).filter(p=>p.path.length).map(p=>({x:p.x,y:p.y,cost:p.cost}))};
partyAttackRoutes=function(b,actor,range){const positions=terrainReach(b,actor);return b.foes.filter(f=>f.hp>0).map(foe=>({foe,route:positions.find(p=>distance(p,foe)<=range&&fieldLineOfSight(p,foe,b))}))};
partyPickTarget=function(b,actor,h,range,onlyInRange=false){const ready=b.foes.filter(f=>f.hp>0&&distance(actor,f)<=range&&fieldLineOfSight(actor,f,b));if(ready.length)return ready.sort((a,c)=>partyEnemyPriority(c,h,b)-partyEnemyPriority(a,h,b)||a.hp-c.hp||distance(actor,a)-distance(actor,c))[0];if(onlyInRange)return null;const plans=partyAttackRoutes(b,actor,range).filter(p=>p.route),move=Math.max(1,moveRange(h)),thisTurn=plans.filter(p=>p.route.cost<=move),choices=thisTurn.length?thisTurn:plans;choices.sort((a,c)=>(Math.ceil(a.route.cost/move)*14-partyEnemyPriority(a.foe,h,b))-(Math.ceil(c.route.cost/move)*14-partyEnemyPriority(c.foe,h,b))||a.route.cost-c.route.cost);return choices[0]?.foe||b.foes.find(f=>f.hp>0)};
const elevationDamage=damageToEnemy;damageToEnemy=function(actor,h,foe,skill={}){const hit=elevationDamage(actor,h,foe,skill),diff=terrainHeight(runState.battle,actor.x,actor.y)-terrainHeight(runState.battle,foe.x,foe.y);if(diff>0)hit.damage=Math.max(1,Math.round(hit.damage*(1+Math.min(2,diff)*.1)));hit.heightBonus=Math.max(0,Math.min(2,diff))*10;return hit};
const elevationTankDamage=tankDamage;tankDamage=function(unit,h,foe,base,guarded){const diff=terrainHeight(runState?.battle,foe.x,foe.y)-terrainHeight(runState?.battle,unit.x,unit.y);return elevationTankDamage(unit,h,foe,diff>0?Math.round(base*(1+Math.min(2,diff)*.1)):base,guarded)};
const worldBeginBattle=beginBattle;beginBattle=function(...args){const result=worldBeginBattle(...args),r=runState,b=r?.battle;if(!b)return result;const fields=BATTLEFIELDS[r.dungeon.id]||BATTLEFIELDS.mosslight,candidates=fields.filter(f=>f.id!==r.lastBattlefield),field=candidates[Math.floor(Math.random()*candidates.length)];b.battlefieldId=field.id;b.battlefieldName=field.name;b.terrainDescription=field.terrain;b.elevations=Array.from({length:FIELD_W*FIELD_H},(_,i)=>field.height(i%FIELD_W,Math.floor(i/FIELD_W)));r.lastBattlefield=field.id;r.fieldHistory=r.fieldHistory||[];r.fieldHistory.push({room:r.step+1,id:field.id,name:field.name});recordBattleLog(`Battlefield: ${field.name}. ${field.terrain}`);renderRun();return result};
function toggleBattlefieldZoom(){const b=runState?.battle;if(!b)return;b.zoomMode=b.zoomMode==='detail'?'fit':'detail';renderBattle()}
function toggleElevationLabels(){const b=runState?.battle;if(!b)return;b.showElevation=!b.showElevation;renderBattle()}
const BATTLE_VIEW={tileWidth:96,tileDepth:48,rise:18,margin:34,top:105,bottom:70};
let battleViewPreferences={rotation:0,zoom:'detail'};
try{const prefs=JSON.parse(localStorage.getItem('wayfarer-camera-v1')||'null');if(prefs){battleViewPreferences.rotation=((Number(prefs.rotation)||0)%4+4)%4;battleViewPreferences.zoom=prefs.zoom==='fit'?'fit':'detail'}}catch{}
function saveBattleView(){localStorage.setItem('wayfarer-camera-v1',JSON.stringify(battleViewPreferences))}
function battlefieldViewPoint(x,y,rotation=0){switch(rotation){case 1:return {x:FIELD_H-1-y,y:x,width:FIELD_H,height:FIELD_W};case 2:return {x:FIELD_W-1-x,y:FIELD_H-1-y,width:FIELD_W,height:FIELD_H};case 3:return {x:y,y:FIELD_W-1-x,width:FIELD_H,height:FIELD_W};default:return {x,y,width:FIELD_W,height:FIELD_H}}}
function battlefieldFacing(facing,rotation){let [x,y]=({E:[1,0],S:[0,1],W:[-1,0],N:[0,-1]})[facing]||[1,0];for(let i=0;i<rotation;i++)[x,y]=[-y,x];return {right:x-y>0,angle:Math.atan2((x+y)*BATTLE_VIEW.tileDepth,(x-y)*BATTLE_VIEW.tileWidth)*180/Math.PI}}
function centerBattlefieldOnParty(b,grid,wrap){const actor=activeBattleHero()||b.heroes.find(u=>heroes.find(h=>h.id===u.id)?.hp>0),cell=actor&&grid.children[actor.y*FIELD_W+actor.x];if(cell)wrap.scrollLeft=Math.max(0,cell.offsetLeft+cell.offsetWidth/2-wrap.clientWidth/2);b.cameraScrollLeft=wrap.scrollLeft;b.cameraNeedsCenter=false}
function rotateBattlefield(direction){const b=runState?.battle;if(!b)return;b.viewRotation=((b.viewRotation??battleViewPreferences.rotation)+(direction<0?-1:1)+4)%4;battleViewPreferences.rotation=b.viewRotation;saveBattleView();b.cameraNeedsCenter=true;renderBattle()}
toggleBattlefieldZoom=function(){const b=runState?.battle;if(!b)return;b.zoomMode=(b.zoomMode||battleViewPreferences.zoom)==='detail'?'fit':'detail';battleViewPreferences.zoom=b.zoomMode;saveBattleView();b.cameraNeedsCenter=true;renderBattle()};
const OBSTACLE_MODELS=[
 {name:'Moss-covered limestone',description:'A mushroom-covered cavern boulder.'},
 {name:'Ancient fallen root',description:'A thick mossy root trunk.'},
 {name:'Luminous fungus cluster',description:'Dense glowing cavern mushrooms.'},
 {name:'Cavern crystal outcrop',description:'A jagged crystal formation rooted in mossy stone.'},
 {name:'Broken runic column',description:'The remains of an observatory pillar.'},
 {name:'Collapsed bronze astrolabe',description:'Twisted celestial instruments and rubble.'},
 {name:'Ruined archive shelves',description:'Fallen books and broken stone shelving.'},
 {name:'Emberglass formation',description:'A cluster of arcane observatory crystals.'}
];
function obstacleModelIndex(obstacle,theme){const index=['ashen','sepulcher'].includes(theme)?({'rune-pillar':4,'ash-mound':5,'ruin-stone':6,emberglass:7}[obstacle.kind]):({'root-rock':0,'fallen-root':1,'fern-rock':2,'mossy-stone':3}[obstacle.kind]);return index??(['ashen','sepulcher'].includes(theme)?4:0)}
function obstacleModelMarkup(index){return `<span class="obstacle-model" aria-hidden="true" style="--obstacle-x:${index%4/3*100}%;--obstacle-y:${Math.floor(index/4)*100}%"></span>`}
const worldRenderBattle=renderBattle;
renderBattle=function(...args){
 const result=worldRenderBattle(...args),b=runState?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');
 if(!b||!grid)return result;
 const wrap=grid.parentElement;
 if(b.viewRotation===undefined)b.viewRotation=battleViewPreferences.rotation;
 if(!b.zoomMode)b.zoomMode=battleViewPreferences.zoom;
 const rotation=b.viewRotation,view=battlefieldViewPoint(0,0,rotation),baseWidth=(view.width+view.height)*BATTLE_VIEW.tileWidth/2+BATTLE_VIEW.margin*2,availableWidth=wrap.clientWidth||baseWidth;
 const zoom=b.zoomMode==='detail'?1:Math.max(.2,Math.min(1,(availableWidth-8)/baseWidth));
 const tileWidth=BATTLE_VIEW.tileWidth*zoom,tileDepth=BATTLE_VIEW.tileDepth*zoom,rise=BATTLE_VIEW.rise*zoom,origin=(view.height-1)*tileWidth/2+BATTLE_VIEW.margin*zoom,top=BATTLE_VIEW.top*zoom;
 panel.classList.add('isometric-combat','model-terrain-combat');panel.dataset.viewRotation=rotation;
 grid.style.setProperty('--iso-scale',zoom);grid.style.setProperty('--iso-tile-width',tileWidth+'px');grid.style.setProperty('--iso-tile-depth',tileDepth+'px');
 grid.style.width=baseWidth*zoom+'px';grid.style.height=((view.width+view.height)*tileDepth/2+(BATTLE_VIEW.top+BATTLE_VIEW.bottom)*zoom)+'px';
 for(let y=0;y<FIELD_H;y++)for(let x=0;x<FIELD_W;x++){
  const cell=grid.children[y*FIELD_W+x];if(!cell)continue;
  cell.querySelectorAll('.iso-ground,.elevation-label,.unit-facing,.obstacle-model').forEach(el=>el.remove());cell.title=cell.title.replace(/ · Elevation [\s\S]*$/,'');
  const p=battlefieldViewPoint(x,y,rotation),height=terrainHeight(b,x,y);
  cell.classList.add('iso-cell');cell.dataset.worldX=x;cell.dataset.worldY=y;cell.dataset.viewX=p.x;cell.dataset.viewY=p.y;cell.dataset.height=height;
  cell.style.left=origin+(p.x-p.y)*tileWidth/2+'px';cell.style.top=top+(p.x+p.y)*tileDepth/2-height*rise+'px';cell.style.zIndex=String((p.x+p.y)*10+height);cell.style.setProperty('--tile-height',height);
  cell.title+=' · Elevation '+height+' · uphill costs +1 movement';
  const heroUnit=b.heroes.find(u=>u.x===x&&u.y===y&&heroes.find(h=>h.id===u.id)?.hp>0),hero=heroUnit&&heroes.find(h=>h.id===heroUnit.id),foe=b.foes.find(f=>f.x===x&&f.y===y&&f.hp>0),unit=heroUnit||foe;
  if(unit){
   const facing=battlefieldFacing(unit.facing||(hero?'E':'W'),rotation),oldSprite=cell.querySelector('.unit-sprite');
   if(oldSprite){const markup=hero?spriteMarkup('hero',Math.max(0,HERO_SPRITE_JOBS.indexOf(visualJobFor(hero))),facing.right?'':'face-west',hero):spriteMarkup('enemy',enemyProfile(foe).sprite,facing.right?'face-east':'');oldSprite.outerHTML=markup}
   const hpUnit=hero||foe;cell.style.setProperty('--hp-width',56*zoom*hpUnit.hp/hpUnit.maxHp+'px');
   cell.insertAdjacentHTML('beforeend',`<span class="unit-facing ${hero?'party-facing':'foe-facing'}" aria-hidden="true" style="--facing-angle:${facing.angle}deg">➤</span>`);
  }
  const obstacle=(b.obstacles||[]).find(o=>o.x===x&&o.y===y);
  if(obstacle){
   const model=obstacleModelIndex(obstacle,runState.dungeon.id),profile=OBSTACLE_MODELS[model];obstacle.name=profile.name;
   cell.querySelector('.terrain-shape')?.remove();cell.querySelector('span:not(.unit-sprite):not(.unit-facing)')?.remove();cell.insertAdjacentHTML('beforeend',obstacleModelMarkup(model));cell.dataset.obstacleModel=model;
   cell.title=`${profile.name} · ${profile.description} Blocks movement and line of sight. Elevation ${height}.`;cell.setAttribute('aria-label',cell.title);
  }else if(cell.classList.contains('empty'))cell.querySelector('span:not(.unit-sprite):not(.unit-facing)')?.remove();
  cell.insertAdjacentHTML('beforeend',`<span class="iso-ground" aria-hidden="true"></span>${b.showElevation?`<span class="elevation-label" aria-hidden="true">${height}</span>`:''}`);
 }
 const scene=panel.querySelector('.dungeon-scene');if(scene){scene.style.backgroundImage=`linear-gradient(#0c172329,#0c172355),url('./assets/${runState.dungeon.id==='sepulcher'?'sepulcher-v1':b.battlefieldId||runState.dungeon.id+'-v2'}.webp')`;scene.style.backgroundPosition='center'}
 const header=panel.querySelector('.battlehead strong');if(header)header.textContent=`${b.battlefieldName||'TACTICAL ENCOUNTER'} · ROUND ${b.round}`;
 const controls=panel.querySelector('.battlehead .battleactions');if(controls){controls.querySelectorAll('.height-toggle,.zoom-toggle,.rotate-left,.rotate-right,.camera-angle').forEach(el=>el.remove());
  controls.insertAdjacentHTML('beforeend',`<button class="button secondary height-toggle" onclick="toggleElevationLabels()">Heights: ${b.showElevation?'On':'Off'}</button><button class="button secondary zoom-toggle" onclick="toggleBattlefieldZoom()">Board: ${b.zoomMode==='detail'?'Large':'Fit'}</button><button class="button secondary rotate-left" title="Rotate view left (Q)" aria-label="Rotate battlefield left" onclick="rotateBattlefield(-1)">↶ Rotate</button><button class="button secondary rotate-right" title="Rotate view right (E)" aria-label="Rotate battlefield right" onclick="rotateBattlefield(1)">Rotate ↷</button><span class="camera-angle">View ${rotation+1}/4</span>`);
 }
 const info=panel.querySelector('.battleinfo');if(info)info.querySelector('.terrain-guide')?.remove();if(info)info.insertAdjacentHTML('beforeend',`<div class="terrain-guide"><b>HIGH GROUND</b><p>${b.terrainDescription||'Terrain heights vary by battlefield.'}</p><small>Climb one level at a time. Uphill steps cost 2 movement; flat and downhill steps cost 1. Attacks from higher ground deal +10% damage per level, up to +20%. Higher terrain can block line of sight.</small><p class="camera-hint">Rotate with ↶ / ↷ or Q / E. Large view uses full-size tiles; Fit shows the whole board. Swipe sideways to pan a large board.</p></div>`);
 if(!wrap.dataset.cameraScroll){wrap.dataset.cameraScroll='true';wrap.addEventListener('scroll',()=>{if(wrap.isConnected&&runState?.battle===b)b.cameraScrollLeft=wrap.scrollLeft},{passive:true})}
 if(b.cameraNeedsCenter||b.cameraScrollLeft===undefined)centerBattlefieldOnParty(b,grid,wrap);else wrap.scrollLeft=b.cameraScrollLeft;
 return result;
};
document.addEventListener('keydown',event=>{if(!runState?.battle||!document.getElementById('dungeon')?.classList.contains('active')||document.querySelector('.modalback.open')||event.altKey||event.ctrlKey||event.metaKey||['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)||event.target.isContentEditable)return;const key=event.key.toLowerCase();if(key==='q'||key==='e'){event.preventDefault();rotateBattlefield(key==='q'?-1:1)}});

const worldCodexRender=renderCodex;renderCodex=function(...args){const result=worldCodexRender(...args),page=document.querySelector('[data-codex-panel="bestiary"] .bestiary-intro');if(page)page.insertAdjacentHTML('beforeend',`<p class="terrain-codex-note">Battlefields use elevation 0–2. Uphill steps cost 2 movement; high ground adds 10% damage per level, capped at 20%. ${Object.values(BATTLEFIELDS).reduce((n,a)=>n+a.length,0)} battlefield variants are available across the two dungeons.</p>`);return result};
const worldNewHero=newJobHero;newJobHero=function(h){worldNewHero(h);characterAppearance(h);syncJobStats(h,false)};
for(const h of heroes)characterAppearance(h);
const literalNewlineWalker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const strayNodes=[];while(literalNewlineWalker.nextNode()){const n=literalNewlineWalker.currentNode;if(!['SCRIPT','STYLE'].includes(n.parentElement?.tagName)&&/^(?:\s|\\n)+$/.test(n.nodeValue)&&n.nodeValue.includes('\n'))strayNodes.push(n)}for(const n of strayNodes)n.remove();
save();renderAll();
let worldResizeQueued=false;window.addEventListener('resize',()=>{if(worldResizeQueued||!runState?.battle)return;worldResizeQueued=true;requestAnimationFrame(()=>{worldResizeQueued=false;renderBattle()})});
const elevationEnemyCard=enemyCardMarkup;enemyCardMarkup=function(id,live){let html=elevationEnemyCard(id,live);if(live){const elevation=terrainHeight(runState?.battle,live.x,live.y);html=html.replace('<div class="enemy-notes">',`<p class="enemy-status">Current elevation: ${elevation}. Attacks from higher ground gain 10% damage per level, up to 20%.</p><div class="enemy-notes">`)}return html};
for(const job of ['Alchemist','Druid'])if(!EQUIP_JOB_RULES[job].weapons.includes('weapon:staff'))EQUIP_JOB_RULES[job].weapons.push('weapon:staff');
const readySkillRender=renderBattle;renderBattle=function(...args){const result=readySkillRender(...args),b=runState?.battle,panel=document.getElementById('battlePanel'),actor=activeBattleHero(),h=actor&&heroes.find(h=>h.id===actor.id);if(!b||!h||!panel)return result;panel.querySelector('button[onclick="castSpellbook()"]')?.remove();for(const s of activeJobSkills(h)){const button=[...panel.querySelectorAll('.battleactions button')].find(el=>el.textContent.startsWith(s.name+' ·'));if(!button)continue;const recovering=!combatSkillReady(actor,s);button.disabled=actor.ap<jobActionCost(s)||attackActionsUsed(actor)>=extraAttackActions(h)||recovering;button.title=s.desc+(recovering?' Still recovering.':'')}return result};

// Named fallen-target buttons also work when another model covers a fallen ally's tile.
const reviveTargetRender=renderBattle;
renderBattle=function(...args){const result=reviveTargetRender(...args),b=runState?.battle,actor=b&&activeBattleHero(),h=actor&&heroes.find(h=>h.id===actor.id),skill=h&&activeJobSkills(h).find(s=>s.id===b.pendingJobSkill),panel=document.querySelector('#battlePanel .battleinfo');if(skill?.type==='revive'&&panel){const box=document.createElement('div');box.className='revive-targets';const label=document.createElement('p');label.textContent='Revive: choose a downed teammate (4 tiles, line of sight).';box.append(label);for(const u of b.heroes){const ally=heroes.find(h=>h.id===u.id);if(!ally||ally.hp>0)continue;const button=document.createElement('button');button.className='button secondary skill-healing';button.textContent='Revive '+ally.name;button.disabled=distance(actor,u)>4||!fieldLineOfSight(actor,u,b)||!revivalPosition(b,u);button.onclick=()=>targetDownedHero(u.id);box.append(button)}panel.append(box)}return result};
