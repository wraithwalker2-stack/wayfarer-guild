/* Solaris Floodworks story expedition, sewer terrain, enemies, and Ashen Ledger objective. */
(function(){
'use strict';
const CONTRACT_ID='sewer-deluge',DUNGEON_ID='sewer',RUBBLE_TOTAL=2;
const profiles={
 sewer_rat:{name:'Flood Rat',race:'Vermin',family:'Rat',dungeon:DUNGEON_ID,role:'skirmisher',sprite:40,range:1,move:5,armor:0,resistance:0,description:'A rain-driven sewer rat grown bold on refuse and alchemical runoff.',ability:'Scurrying Bite',behavior:'Rushes exposed and wounded adventurers, using its high movement to slip around the front line.',habitat:'Solaris flood channels',elements:'Physical',weakness:'Armor and area attacks',threat:'Standard'},
 plague_rat:{name:'Plague Rat',race:'Vermin',family:'Rat',dungeon:DUNGEON_ID,role:'skirmisher',sprite:41,range:1,move:4,armor:1,resistance:1,description:'A gaunt rat carrying fever from the drowned fields into the lower wards.',ability:'Fever Fang',behavior:'Pressures vulnerable targets and survives slightly longer than ordinary vermin.',habitat:'Blocked side drains',elements:'Physical · Disease',weakness:'Cleansing and focused attacks',threat:'Priority'},
 sewer_slime:{name:'Sewer Slime',race:'Ooze',family:'Slime',dungeon:DUNGEON_ID,role:'bruiser',sprite:42,range:1,move:2,armor:3,resistance:2,description:'A translucent ooze fed by reagents washed from workshops above.',ability:'Engulf',behavior:'Advances slowly, absorbs physical attacks, and pins down the front line.',habitat:'Main sluice channels',elements:'Water · Acid',weakness:'Magic',threat:'High'},
 caustic_slime:{name:'Caustic Slime',race:'Ooze',family:'Slime',dungeon:DUNGEON_ID,role:'ranged',sprite:43,range:3,move:2,armor:1,resistance:3,description:'A luminous ochre slime whose surface spits corrosive droplets.',ability:'Caustic Spit',behavior:'Keeps behind tougher oozes and attacks priority targets across the channel.',habitat:'Alchemical runoff basins',elements:'Acid',weakness:'Fast melee pressure',threat:'Priority'},
 sludge_devourer:{name:'Sludge Devourer',race:'Ooze',family:'Slime',dungeon:DUNGEON_ID,role:'boss',sprite:44,range:2,move:2,armor:5,resistance:5,description:'A vast living mass of floodwater, refuse, and alchemical waste nesting beneath the main sluice.',ability:'Deluge Maw',behavior:'Every third round it threatens a cluster of tiles, then crashes through the marked area with corrosive force.',habitat:'Solaris main sluice',elements:'Water · Acid',weakness:'Sustained magical damage',threat:'Boss'}
};
Object.assign(ENEMY_CATALOG,profiles);for(const [id,p] of Object.entries(profiles))enemyKeyByName[p.name]=id;
if(!dungeons.some(d=>d.id===DUNGEON_ID))dungeons.push({id:DUNGEON_ID,name:'Solaris Floodworks',intro:'Rain pounds the streets above. Beneath Solaris, the swollen channels carry vermin, living sludge, and something much larger toward the lower wards.'});
ROOM_THEME_NAMES.sewer=['The Rainward Intake','Sluice Junction','The Drowned Galleries','The Alchemist’s Drain','The Lower Spillway'];
ROOM_ENEMY_FAMILIES.sewer=['sewer_rat','caustic_slime','sewer_slime','plague_rat'];
FINAL_ROOM_BOSSES.sewer={id:'sludge_devourer',name:'Sludge Devourer',room:'The Main Sluice',sprite:44,armor:5,resistance:5,range:2,move:2,magic:true,ability:'Deluge Maw',description:profiles.sludge_devourer.description,behavior:profiles.sludge_devourer.behavior};
COMBAT_ROOM_LIMITS.sewer=3;
if(typeof FFT_DUNGEON_LEVEL_BONUS!=='undefined')FFT_DUNGEON_LEVEL_BONUS.sewer=1;
if(typeof BATTLEFIELDS!=='undefined')BATTLEFIELDS.sewer=[{id:'solaris-floodworks-v1',name:'The Rainward Intake',terrain:'Flooded stone channels, raised maintenance walks, caustic runoff, and blocked side drains.',height:(x,y)=>x>=12?2:x>=9?1:0}];

function contractProgress(){return window.wayfarerContractProgress?.()||{active:null,completed:[]}}
function contractActive(){return contractProgress().active===CONTRACT_ID}
function unlocked(){const p=contractProgress();return p.active===CONTRACT_ID||p.completed.includes(CONTRACT_ID)}
function key(x,y){return `${x},${y}`}
function safeText(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function livingUnitAt(b,x,y){return b.heroes.some(u=>u.x===x&&u.y===y&&heroes.find(h=>h.id===u.id)?.hp>0)||b.foes.some(f=>f.x===x&&f.y===y&&f.hp>0)}
function rubble(b){return (b?.obstacles||[]).filter(o=>o.optionalObjective&&o.hp>0)}
function objectiveCount(){return Math.min(RUBBLE_TOTAL,runState?.sewerRubbleDestroyed||0)}

function chooseSewer(){
 if(!unlocked())return toast('The Solaris Floodworks become available after accepting Below the Rainline.');
 selectedDungeon=DUNGEON_ID;const d=dungeons.find(x=>x.id===DUNGEON_ID),hero=document.querySelector('.dungeonhero');
 if(hero){hero.querySelector('h2').textContent=d.name;hero.querySelector('p').textContent='Three flooded combat rooms culminate at the main sluice. Water slows movement and caustic patches punish careless positioning.';hero.querySelector('.difficulty').textContent='✦ STORY EXPEDITION · LOW–MODERATE DANGER'}
 updateDungeonChoices();window.WayfarerMusic?.sync?.();
}
window.selectSewerMission=chooseSewer;

const choice=document.createElement('button');choice.className='dungeonchoice sewer-choice';choice.dataset.dungeon=DUNGEON_ID;choice.innerHTML=`<span class="sewer-choice-art" aria-hidden="true"></span><b>Solaris Floodworks</b><small>Story expedition · 3 battles · rats and slimes</small>`;choice.onclick=chooseSewer;document.querySelector('.dungeonchoices')?.prepend(choice);
const priorChoices=updateDungeonChoices;updateDungeonChoices=function(...args){const result=priorChoices(...args),button=document.querySelector('[data-dungeon="sewer"]');if(button){button.hidden=!unlocked();button.disabled=!unlocked();button.classList.toggle('selected',selectedDungeon===DUNGEON_ID);const small=button.querySelector('small');if(small)small.textContent='Story expedition · 3 battles · rats and slimes'}return result};

function showContact(continueRun){
 let modal=document.getElementById('sewerContactModal');if(modal)modal.remove();modal=document.createElement('div');modal.id='sewerContactModal';modal.className='sewer-contact-modal';modal.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="sewerContactTitle"><small>AN UNOFFICIAL VISITOR · THE ASHEN LEDGER</small><h2 id="sewerContactTitle">Two passages the city forgot</h2><p>A rain-darkened clerk intercepts the guild at the Floodworks gate. Their brass tally bears no city seal—only the scorched page used by the Ashen Ledger.</p><blockquote>“The infestation is your contract. Our concern is two collapsed side passages. Break both rubble piles while you are below and certain useful routes reopen. Leave them blocked, and the Ledger will remember the wasted opportunity.”</blockquote><div class="sewer-contact-terms"><span><b>Optional:</b> destroy 2 marked rubble piles</span><span><b>Success:</b> +3 Ashen Ledger favor</span><span><b>Failure:</b> −2 Ashen Ledger favor</span><span>This objective never prevents mission victory.</span></div><button class="button green" id="acceptSewerContact">Take the marked diagram →</button></section>`;document.body.append(modal);modal.querySelector('button').onclick=()=>{modal.remove();continueRun()};
}
let contactAccepted=false;const priorStart=startRun;startRun=function(...args){if(selectedDungeon!==DUNGEON_ID||!contractActive()||contactAccepted)return priorStart.apply(this,args);const selected=document.querySelectorAll('#team input:checked').length;if(selected!==5)return priorStart.apply(this,args);showContact(()=>{contactAccepted=true;priorStart.apply(this,args)});};

function channelPath(b){
 const points=templatePoints(()=>true,b),left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),starts=points.filter(p=>p.x===left).sort((a,c)=>Math.abs(a.y-4)-Math.abs(c.y-4)),goals=new Set(points.filter(p=>p.x===right).map(p=>key(p.x,p.y))),queue=starts.map(p=>({p,path:[p]})),seen=new Set(starts.map(p=>key(p.x,p.y)));
 while(queue.length){const cur=queue.shift();if(goals.has(key(cur.p.x,cur.p.y)))return cur.path;for(const [dx,dy] of [[1,0],[0,1],[0,-1],[-1,0]]){const n={x:cur.p.x+dx,y:cur.p.y+dy},k=key(n.x,n.y);if(!seen.has(k)&&roomTileExists(b,n.x,n.y)){seen.add(k);queue.push({p:n,path:[...cur.path,n]})}}}return points.filter(p=>p.y===4);
}
function applySewerTerrain(b){
 b.tileTerrain={};b.enemyWarnings=b.enemyWarnings||[];b.sporeClouds=b.sporeClouds||[];const path=channelPath(b),occupied=new Set((b.obstacles||[]).map(o=>key(o.x,o.y)));
 for(const p of path)if(!occupied.has(key(p.x,p.y)))b.tileTerrain[key(p.x,p.y)]={type:'water',name:'Flooded sewer channel'};
 for(const p of path.filter((_,i)=>i%4===2)){const n={x:p.x,y:p.y+(p.y<4?1:-1)};if(roomTileExists(b,n.x,n.y)&&!occupied.has(key(n.x,n.y)))b.tileTerrain[key(n.x,n.y)]={type:'water',name:'Overflowing sewer channel'}}
 const candidates=shuffledRoomPoints(templatePoints((x,y)=>!b.tileTerrain[key(x,y)]&&!occupied.has(key(x,y))&&!livingUnitAt(b,x,y)&&path.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)===1),b));for(const p of candidates.slice(0,4))b.tileTerrain[key(p.x,p.y)]={type:'hazard',name:'Caustic runoff',damage:4};b.sewerChannel=path.map(p=>key(p.x,p.y));
}
function installRubble(b){
 if(!contractActive()||runState.step!==0||runState.sewerRubblePlaced)return;runState.sewerRubblePlaced=true;runState.sewerRubbleDestroyed=runState.sewerRubbleDestroyed||0;
 let candidates=(b.obstacles||[]).slice(0,RUBBLE_TOTAL);if(candidates.length<RUBBLE_TOTAL)candidates.push(...shuffledRoomPoints(templatePoints((x,y)=>x>4&&!livingUnitAt(b,x,y)&&!fieldObstacleAt(b,x,y),b)).slice(0,RUBBLE_TOTAL-candidates.length));
 candidates.slice(0,RUBBLE_TOTAL).forEach((o,i)=>{if(!b.obstacles.includes(o))b.obstacles.push(o);Object.assign(o,{id:`ledger-rubble-${i+1}`,kind:'sewer-rubble',name:`Marked rubble pile ${i+1}`,icon:'◆',hp:14,maxHp:14,destructible:true,optionalObjective:true})});
 b.sewerSappers=b.heroes.map(u=>heroes.find(h=>h.id===u.id)).filter(h=>h&&!hasJobRole(h,'healer')&&!hasJobRole(h,'caster')).slice(0,2).map(h=>h.id);recordBattleLog('Ashen Ledger objective: destroy both marked rubble piles before the battle ends.');
}

const priorBegin=beginBattle;beginBattle=function(room,...args){const result=priorBegin(room,...args),b=runState?.battle;if(!b||runState.dungeon.id!==DUNGEON_ID)return result;b.battlefieldId='solaris-floodworks-v1';b.terrainDescription='A continuous flooded channel divides the sewer. Water costs extra movement; caustic runoff damages units that remain on it.';installRubble(b);applySewerTerrain(b);recordBattleLog('Floodwater forms a continuous channel through the room. Caustic runoff marks hazardous ground.');renderRun();return result};

function strikeRubble(b,actor,h,target,ai=false){
 if(!target||target.hp<=0)return false;if(attackActionsUsed(actor)>=extraAttackActions(h)||actor.ap<1){if(!ai)toast(`${h.name} has already attacked this round.`);return false}if(distance(actor,target)>battleRange(h)){if(!ai)toast('That rubble pile is outside attack range.');return false}
 const damage=Math.max(5,Math.floor((h.power||6)*.7)+Math.floor(Math.random()*3));target.hp=Math.max(0,target.hp-damage);actor.attackActions=attackActionsUsed(actor)+1;actor.acted=true;actor.ap=Math.max(0,actor.ap-1);faceToward(actor,target);recordBattleLog(`${h.name} strikes ${target.name} for ${damage} structural damage.`);playSfx?.('attack');
 if(target.hp<=0){b.obstacles=b.obstacles.filter(o=>o!==target);runState.sewerRubbleDestroyed=objectiveCount()+1;recordBattleLog(`${target.name} collapses. Ashen Ledger objective: ${objectiveCount()}/${RUBBLE_TOTAL}.`);toast(`Ashen Ledger passage cleared · ${objectiveCount()}/${RUBBLE_TOTAL}`)}advanceBattleTurn();return true;
}
const priorClick=battleClick;battleClick=function(x,y){const b=runState?.battle,target=b&&runState.dungeon.id===DUNGEON_ID?(b.obstacles||[]).find(o=>o.x===x&&o.y===y&&o.destructible&&o.hp>0):null;if(target){if(runState.mode==='ai')return;const actor=activeBattleHero(),h=actor&&heroes.find(h=>h.id===actor.id);if(!actor||!h||b.turn!=='heroes')return;return strikeRubble(b,actor,h,target,false)}return priorClick(x,y)};

const priorHeroAi=aiHeroAction;aiHeroAction=function(b,actor){if(runState?.dungeon.id===DUNGEON_ID&&b?.sewerSappers?.includes(actor.id)){const h=heroes.find(h=>h.id===actor.id),targets=rubble(b).sort((a,c)=>distance(actor,a)-distance(actor,c)),target=targets[0],foeInRange=b.foes.some(f=>f.hp>0&&distance(actor,f)<=battleRange(h)&&fieldLineOfSight(actor,f,b));if(target&&!foeInRange){if(strikeRubble(b,actor,h,target,true))return;const dest=reachableTiles(actor).filter(p=>!fieldObstacleAt(b,p.x,p.y)).sort((a,c)=>distance(a,target)-distance(c,target)||a.cost-c.cost)[0];if(dest&&distance(dest,target)<distance(actor,target)){movePartyActor(actor,h,dest,dest.cost||distance(actor,dest),'advance toward the Ashen Ledger blockage');return}}}return priorHeroAi(b,actor)};

const priorSprite=spriteMarkup;spriteMarkup=function(kind,index,extra='',...args){if(kind==='enemy'&&index>=40&&index<=44)return `<span aria-hidden="true" class="unit-sprite enemy-sprite sewer-enemy-sprite ${extra}" style="background-image:url('./assets/sewer-enemy-${index-40}.png')"></span>`;return priorSprite(kind,index,extra,...args)};
const priorRenderBattle=renderBattle;renderBattle=function(...args){const result=priorRenderBattle(...args),b=runState?.battle,panel=document.getElementById('battlePanel');if(!b||runState.dungeon.id!==DUNGEON_ID||!panel)return result;panel.dataset.dungeon=DUNGEON_ID;const scene=panel.querySelector('.dungeon-scene');if(scene){scene.style.backgroundImage="linear-gradient(#07141438,#06101365),url('./assets/sewer-floodworks-v1.jpg')";scene.style.backgroundPosition='center';scene.style.backgroundSize='cover'}for(const o of rubble(b)){const cell=panel.querySelector(`[data-world-x="${o.x}"][data-world-y="${o.y}"]`)||panel.querySelector('.battlegrid')?.children[o.y*FIELD_W+o.x];if(cell){cell.disabled=false;cell.classList.add('sewer-rubble-tile');cell.title=`${o.name} · ${o.hp}/${o.maxHp} integrity · optional Ashen Ledger objective`;cell.setAttribute('aria-label',cell.title);cell.querySelector('.obstacle-model')?.classList.add('sewer-rubble-model');if(!cell.querySelector('.rubble-hp'))cell.insertAdjacentHTML('beforeend',`<small class="rubble-hp">${o.hp}</small>`);else cell.querySelector('.rubble-hp').textContent=o.hp}}
 const head=panel.querySelector('.battlehead');if(head&&!head.querySelector('.sewer-objective'))head.insertAdjacentHTML('beforeend',`<div class="sewer-objective"><small>ASHEN LEDGER · OPTIONAL</small><b>${objectiveCount()} / ${RUBBLE_TOTAL} RUBBLE CLEARED</b></div>`);return result};

const priorFinish=finishRun;finishRun=function(...args){const r=runState,isMission=r?.dungeon?.id===DUNGEON_ID&&contractActive(),destroyed=isMission?Math.min(RUBBLE_TOTAL,r.sewerRubbleDestroyed||0):0;if(isMission&&!r.sewerLedgerResolved){r.sewerLedgerResolved=true;const success=destroyed===RUBBLE_TOTAL;window.changeFactionReputation?.('ashen_ledger',success?3:-2,success?'Reopened two forgotten sewer passages for the Ashen Ledger':'Left the Ashen Ledger passages blocked beneath Solaris')}const result=priorFinish.apply(this,args);if(isMission){const report=document.querySelector('#run .report');report?.insertAdjacentHTML('afterbegin',`<section class="sewer-ledger-result ${destroyed===RUBBLE_TOTAL?'success':'failed'}"><small>ASHEN LEDGER · OPTIONAL OBJECTIVE</small><h3>${destroyed===RUBBLE_TOTAL?'Both hidden passages reopened':'The marked passages remain blocked'}</h3><p>${destroyed}/${RUBBLE_TOTAL} rubble piles destroyed · ${destroyed===RUBBLE_TOTAL?'+3':'−2'} Ashen Ledger favor.</p></section>`)}contactAccepted=false;return result};

const priorCodex=renderCodex;renderCodex=function(...args){const result=priorCodex(...args),groups=document.querySelectorAll('.bestiary-filter-group');if(groups[0]&&!groups[0].querySelector('[data-sewer-filter]'))groups[0].insertAdjacentHTML('beforeend',`<button data-sewer-filter class="${typeof bestiaryFilters!=='undefined'&&bestiaryFilters.dungeon==='sewer'?'selected':''}" onclick="setBestiaryFilter('dungeon','sewer')">Floodworks</button>`);return result};
updateDungeonChoices();renderCodex();
})();

