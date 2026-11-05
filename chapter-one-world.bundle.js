/* ===== world-map.js ===== */
(function(){
const sites={solaris:{name:'Solaris',region:'The Sunward Heartlands',kind:'Capital City · Guild Headquarters',description:'The radiant capital and seat of the Wayfarer Guild. Every expedition begins beneath its golden walls.',travel:'Guild home',danger:'Safe',icon:'♜'},mosslight:{name:'Mosslight Warrens',region:'The Elderwood',kind:'Forest Dungeon',description:'Old roads disappear beneath the ancient Elderwood before descending into the mossy caverns of the Warrens.',travel:'2 days by forest road',danger:'Low danger · 3 battles',icon:'♣'},ashen:{name:'Ashen Observatory',region:'The Cinderpeak Range',kind:'Volcanic Mountain Dungeon',description:'A steep imperial road climbs through black volcanic ridges toward Mount Vaelkor and a ruined observatory above the caldera.',travel:'4 days by mountain road',danger:'High danger · 5 battles',icon:'▲'},sepulcher:{name:'Hollow Sepulcher',region:'The Mirelands',kind:'Coastal Swamp Dungeon',description:'The southern road follows the sea into the Mirelands, where an ancient royal crypt waits below the tide.',travel:'5 days by coast road',danger:'Very high danger · 7 battles',icon:'☠'}};
let selected='solaris';
function unlocked(id){if(id==='ashen')return heroes.filter(h=>h.level>=5).length>=5;if(id==='sepulcher')return heroes.filter(h=>h.level>=10).length>=5;return true}
function requirement(id){return id==='ashen'?'Requires five adventurers at level 5':id==='sepulcher'?'Requires five adventurers at level 10':''}
function markup(){return `<section class="page world-page" id="world"><div class="world-intro"><div><span>THE AURELINE CONTINENT</span><h2>Roads from the Golden Capital</h2><p>Plan expeditions from Solaris across forest, mountain, and coastal roads.</p></div><div class="world-scale"><strong>3</strong><small>OPEN ROUTES</small></div></div><div class="world-layout"><div class="world-map-card"><div class="continent-canvas"><svg class="continent-art" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet" aria-label="Map of the Aureline Continent"><defs><linearGradient id="worldOcean" x2="0" y2="1"><stop stop-color="#193b4c"/><stop offset="1" stop-color="#0c2634"/></linearGradient><linearGradient id="worldLand" x2="1" y2="1"><stop stop-color="#a7ad79"/><stop offset=".55" stop-color="#747f54"/><stop offset="1" stop-color="#a1845b"/></linearGradient></defs><rect width="1200" height="760" fill="url(#worldOcean)"/><path class="continent" d="M171 134Q263 54 387 76Q499 24 613 91Q751 48 893 113Q1029 178 1047 304Q1128 384 1050 482Q1015 610 888 639Q763 732 616 663Q496 713 384 640Q232 633 184 510Q77 444 139 338Q79 230 171 134Z" fill="url(#worldLand)"/><path class="forest-region" d="M139 213Q234 102 405 107Q452 181 389 305Q281 347 155 302Z"/><path class="mountain-region" d="M681 93Q856 58 1002 187L1044 326Q899 347 756 282Z"/><path class="swamp-region" d="M711 489Q867 444 1056 482Q1007 624 873 646Q756 716 651 646Z"/><g class="mountains"><path d="M742 208l49-87 50 87zM813 222l58-111 67 111zM903 248l43-82 52 82z"/><path class="snow" d="M769 159l22-38 21 38-13-7-9 10-9-10zM843 164l28-53 32 53-17-8-12 14-13-13z"/></g><g class="forest-symbols"><circle cx="217" cy="176" r="25"/><circle cx="262" cy="151" r="32"/><circle cx="313" cy="186" r="28"/><circle cx="357" cy="149" r="23"/><path d="M217 197v43M262 177v55M313 207v42M357 168v48"/></g><g class="swamp-water"><path d="M733 562q61-35 119 0t119 0M701 603q72-34 144 0t144 0"/><circle cx="790" cy="535" r="8"/><circle cx="930" cy="586" r="7"/></g><g class="roads"><path d="M559 397C462 347 375 289 286 237"/><path d="M582 373C676 292 753 246 851 204"/><path d="M600 418C718 466 793 516 881 558"/></g><g class="road-stations"><circle cx="449" cy="340" r="5"/><circle cx="696" cy="296" r="5"/><circle cx="721" cy="477" r="5"/></g><path class="river" d="M421 90Q494 210 446 326T381 565"/><g class="compass" transform="translate(1080 92)"><circle r="45"/><path d="M0-39L10-8 0 0-10-8zM0 39L10 8 0 0-10 8zM-39 0L-8-10 0 0-8 10zM39 0L8-10 0 0 8 10z"/><text x="0" y="-50">N</text></g></svg><button class="map-location capital" data-location="solaris" style="left:48%;top:53%"><i>♜</i><span>Solaris<small>Guild capital</small></span></button><button class="map-location" data-location="mosslight" style="left:24%;top:31%"><i>♣</i><span>Mosslight Warrens<small>The Elderwood</small></span></button><button class="map-location" data-location="ashen" style="left:72%;top:27%"><i>▲</i><span>Ashen Observatory<small>Cinderpeak Range</small></span></button><button class="map-location" data-location="sepulcher" style="left:74%;top:74%"><i>☠</i><span>Hollow Sepulcher<small>The Mirelands</small></span></button><div class="map-place future" style="left:24%;top:72%"><i>⚓</i><span>Westreach Port<small>Uncharted</small></span></div><div class="map-place future" style="left:49%;top:16%"><i>◇</i><span>Northwatch Ruins<small>Uncharted</small></span></div><div class="map-key"><span><i class="road-key"></i> Imperial road</span><span><i class="site-key"></i> Expedition site</span></div></div></div><aside class="route-card" id="routeCard"></aside></div><div class="route-network"><div><strong>THE SOLARIS ROAD NETWORK</strong><p>All current expeditions return to the guild capital. More routes will appear as the Wayfarers chart the continent.</p></div><div class="route-chips"><span>Forest Road · West</span><span>Cinder Road · Northeast</span><span>Tideway · Southeast</span></div></div></section>`}
function renderRoute(){const d=sites[selected],open=unlocked(selected),card=document.getElementById('routeCard');if(!card)return;document.querySelectorAll('.map-location').forEach(b=>{const locked=!unlocked(b.dataset.location);b.classList.toggle('selected',b.dataset.location===selected);b.classList.toggle('locked',locked);b.setAttribute('aria-label',sites[b.dataset.location].name+(locked?' locked':''))});card.innerHTML=`<div class="route-region">${d.region}</div><div class="route-icon">${d.icon}</div><h3>${d.name}</h3><span class="route-kind">${d.kind}</span><p>${d.description}</p><dl><div><dt>Travel</dt><dd>${d.travel}</dd></div><div><dt>Threat</dt><dd>${d.danger}</dd></div></dl>${selected==='solaris'?'<button class="button green" onclick="worldTravel(\'solaris\')">Enter Solaris</button>':open?`<button class="button" onclick="worldTravel('${selected}')">Prepare Expedition</button>`:`<div class="route-locked">◆ ROUTE LOCKED<br><span>${requirement(selected)}</span></div>`}`}
window.openWorldMap=function(){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('world').classList.add('active');document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='world'));document.getElementById('pageTitle').textContent='World Map';renderRoute();scrollTo({top:0,behavior:'smooth'})};
window.worldTravel=function(id){if(id==='solaris'){document.querySelector('.nav button[data-page="home"]').click();return}if(!unlocked(id)){toast(requirement(id));return}setDungeon(id);document.querySelector('.nav button[data-page="dungeon"]').click();scrollTo({top:0,behavior:'smooth'})};
function install(){const main=document.querySelector('main.main'),nav=document.querySelector('.nav');if(!main||!nav||document.getElementById('world'))return;main.insertAdjacentHTML('beforeend',markup());const btn=document.createElement('button');btn.dataset.page='world';btn.innerHTML='<span>⌖</span> World Map';btn.onclick=window.openWorldMap;nav.insertBefore(btn,nav.querySelector('[data-page="dungeon"]'));document.querySelectorAll('.map-location').forEach(b=>b.onclick=()=>{const id=b.dataset.location;if(id==='solaris'&&typeof window.openSolarisMap==='function'){window.openSolarisMap();return}selected=id;renderRoute()});const eyebrow=document.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='The capital city of Solaris';renderRoute()}
install();
const routeLabel=document.querySelector('.world-scale small');if(routeLabel)routeLabel.textContent='CHARTED ROUTES';
})();

(function installContinentalRoadNetwork(){
 const stage=document.querySelector('.map-stage')||document.querySelector('.continent-canvas');if(!stage||stage.querySelector('.real-road-network'))return;
 const routes=[
  {kind:'main',d:'M600 350 C570 365 520 355 480 330 C460 315 448 306 438 304 C430 285 425 268 414 250 C402 228 388 207 372 190 C330 178 270 190 216 205'},
  {kind:'main',d:'M600 350 C560 370 525 365 492 357 C440 365 390 390 330 405 C280 418 238 425 204 418'},
  {kind:'main',d:'M600 350 C632 330 655 300 690 285 C716 274 738 270 756 266 C805 248 830 220 855 198 C885 170 910 150 936 144'},
  {kind:'minor',d:'M756 266 C735 238 720 200 690 170 C670 146 650 122 636 106'},
  {kind:'mountain',d:'M936 144 C948 165 952 185 948 205 C980 215 1010 230 1044 236'},
  {kind:'main',d:'M600 350 C610 400 625 460 648 509 C735 525 810 548 888 562 C950 565 1000 558 1044 547'},
  {kind:'main',d:'M648 509 C520 500 390 462 300 438 C260 425 230 418 204 418'}
 ];
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','real-road-network');svg.setAttribute('viewBox','0 0 1200 760');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-label','Road network connecting the named locations of Lumara');
 svg.innerHTML=`<defs><filter id="roadRough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="17" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8"/></filter></defs><g filter="url(#roadRough)">${routes.map(route=>`<path class="real-road-shadow ${route.kind}" d="${route.d}"/><path class="real-road-verge ${route.kind}" d="${route.d}"/><path class="real-road-bed ${route.kind}" d="${route.d}"/><path class="real-road-light ${route.kind}" d="${route.d}"/>`).join('')}</g>`;
 stage.prepend(svg);
 const description=document.querySelector('.route-network p');if(description)description.textContent='Solaris anchors a continental road network linking every charted settlement and expedition site.';
 const chips=document.querySelector('.route-chips');if(chips)chips.innerHTML='<span>King’s Road · West</span><span>Kristian’s Rest Road · Northeast</span><span>Bellwick Branch</span><span>Southern Grainway</span><span>Seabright Trade Route</span><span>Reedwater Passage</span>';
 const key=document.querySelector('.map-key .road-key')?.parentElement;if(key)key.lastChild.textContent=' Continental road';
})();

(function installExpandedContinentLocations(){
 const stage=document.querySelector('.map-stage')||document.querySelector('.continent-canvas');if(!stage||stage.querySelector('[data-new-place="mistwatch"]'))return;
 stage.querySelectorAll('.map-place.future').forEach(node=>node.remove());
 const regions=[
  {name:'The Elderwood',left:25,top:14,kind:'forest'},
  {name:'The Mirelands',left:83,top:64,kind:'mire'},
  {name:'Mount Vaelkor',left:84,top:13,kind:'volcano'}
 ];
 const places=[
  {id:'mistwatch',name:'Mistwatch',detail:'Large mireland town',icon:'◆',left:74,top:74,size:'large'},
  {id:'greenwatch',name:'Greenwatch',detail:'Large Elderwood town',icon:'◆',left:31,top:25,size:'large'},
  {id:'ironhold',name:'Ironhold',detail:'Large mountain town',icon:'◆',left:78,top:19,size:'large'},
  {id:'cinderfall',name:'Cinderfall',detail:'Mining town',icon:'◈',left:87,top:31,size:'small'},
  {id:'bellwick',name:'Bellwick',detail:'Northern plains town',icon:'◇',left:53,top:14,size:'medium'},
  {id:'rivermeet',name:'Kristian’s Rest',detail:'River junction town',icon:'◇',left:63,top:35,size:'medium'},
  {id:'goldhaven',name:'Goldhaven Estate',detail:'Large southern estate town',icon:'◆',left:54,top:67,size:'large'},
  {id:'dawnrest',name:'Dawnrest',detail:'Sunward monastery',icon:'✦',left:41,top:47,size:'medium'},
  {id:'seabright',name:'Seabright',detail:'Large western coast town',icon:'⚓',left:17,top:55,size:'large'}
 ];
 for(const region of regions){const label=document.createElement('div');label.className=`world-region-label ${region.kind}`;label.style.left=region.left+'%';label.style.top=region.top+'%';label.textContent=region.name;stage.append(label)}
 for(const place of places){const marker=document.createElement('div');marker.className=`map-place mapped-location new-map-label settlement-${place.size}`;marker.dataset.newPlace=place.id;marker.style.left=place.left+'%';marker.style.top=place.top+'%';marker.title=`${place.name} — ${place.detail}`;marker.innerHTML=`<i>${place.icon}</i><span>${place.name}<small>${place.detail}</small></span>`;stage.append(marker)}
})();

(function refineForestRoad(){
 const stage=document.querySelector('.map-stage')||document.querySelector('.continent-canvas');if(!stage)return;
 const positions={solaris:['50%','46%'],mosslight:['18%','27%'],ashen:['79%','27%'],sepulcher:['87%','72%']};
 Object.entries(positions).forEach(([id,[left,top]])=>{const pin=stage.querySelector(`[data-location="${id}"]`);if(pin){pin.style.left=left;pin.style.top=top}});
 const roads=stage.querySelectorAll('.roads path');if(roads[0])roads[0].setAttribute('d','M600 350 C570 365 520 355 480 330 C460 315 448 306 438 304 C430 285 425 268 414 250 C402 228 388 207 372 190 C330 178 270 190 216 205');if(roads[1])roads[1].setAttribute('d','M600 350 C632 330 655 300 690 285 C716 274 738 270 756 266 C805 248 830 220 855 198 C885 170 910 150 936 144 C948 165 952 185 948 205');if(roads[2])roads[2].setAttribute('d','M600 350 C610 400 625 460 648 509 C735 525 810 548 888 562 C950 565 1000 558 1044 547');
 const town=document.createElement('div');town.className='map-place mapped-location town-location';town.style.left='36.5%';town.style.top='40%';town.title='Briar Glen — forest road settlement';town.innerHTML='<i>◆</i><span>Briar Glen<small>Forest road town</small></span>';
 const battle=document.createElement('div');battle.className='map-place mapped-location battle-location';battle.style.left='33.5%';battle.style.top='33%';battle.title='Greenway Crossing — forest road battlefield';battle.innerHTML='<i>⚔</i><span>Greenway Crossing<small>Forest road battlefield</small></span>';
 stage.append(town,battle);
 const key=stage.querySelector('.map-key');if(key)key.insertAdjacentHTML('beforeend','<span><i class="planned-key"></i> Planned location</span>');
})();

(function(){
 const canvas=document.querySelector('.continent-canvas');if(!canvas||canvas.querySelector('.map-stage'))return;
 const stage=document.createElement('div');stage.className='map-stage';while(canvas.firstChild)stage.appendChild(canvas.firstChild);canvas.appendChild(stage);
 const controls=document.createElement('div');controls.className='map-zoom-controls';controls.innerHTML='<button type="button" data-zoom="in" aria-label="Zoom map in">＋</button><button type="button" data-zoom="out" aria-label="Zoom map out">−</button><button type="button" data-zoom="reset" aria-label="Reset map view">⌂</button>';canvas.appendChild(controls);
 let scale=1,x=0,y=0,drag=false,lastX=0,lastY=0;
 function apply(){if(scale===1){x=0;y=0}const limitX=canvas.clientWidth*(scale-1)/2,limitY=canvas.clientHeight*(scale-1)/2;x=Math.max(-limitX,Math.min(limitX,x));y=Math.max(-limitY,Math.min(limitY,y));stage.style.transform=`translate(${x}px,${y}px) scale(${scale})`;controls.querySelector('[data-zoom="out"]').disabled=scale<=1}
 function zoom(delta){scale=Math.max(1,Math.min(3,Math.round((scale+delta)*10)/10));apply()}
 controls.addEventListener('click',e=>{const action=e.target.closest('button')?.dataset.zoom;if(action==='in')zoom(.35);if(action==='out')zoom(-.35);if(action==='reset'){scale=1;x=0;y=0;apply()}});
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.2:-.2)},{passive:false});
 canvas.addEventListener('pointerdown',e=>{if(e.target.closest('button,.mapped-location'))return;drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging')});
 canvas.addEventListener('pointermove',e=>{if(!drag||scale===1)return;x+=e.clientX-lastX;y+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;apply()});
 canvas.addEventListener('pointerup',()=>{drag=false;canvas.classList.remove('dragging')});canvas.addEventListener('pointercancel',()=>{drag=false;canvas.classList.remove('dragging')});
 apply();
})();



/* ===== greenway-crossing.js ===== */
(function(){
'use strict';
const GREENWAY_ENEMIES={
 greenway_wolf:{name:'Greyfang Wolf',race:'Beast',family:'Beast',dungeon:'greenway',role:'skirmisher',sprite:30,range:1,move:5,armor:0,resistance:0,description:'A swift pack hunter that circles exposed travelers.',ability:'Pack Rush',behavior:'Uses its high movement to pressure isolated targets and prefers wounded opponents.',habitat:'Forest edge and trade road',elements:'Physical',weakness:'Armor and focused attacks',threat:'Standard'},
 greenway_badger:{name:'Ironclaw Badger',race:'Beast',family:'Beast',dungeon:'greenway',role:'bruiser',sprite:31,range:1,move:3,armor:3,resistance:0,description:'A huge territorial badger with a hide thick enough to turn a weak blade.',ability:'Burrow Charge',behavior:'Advances directly and absorbs attacks while faster beasts flank.',habitat:'Rocky forest verge',elements:'Physical',weakness:'Magic',threat:'High'},
 greenway_viper:{name:'Briar Viper',race:'Beast',family:'Beast',dungeon:'greenway',role:'skirmisher',sprite:32,range:1,move:4,armor:0,resistance:1,description:'A patient forest serpent whose venom weakens careless travelers.',ability:'Venom Fang',behavior:'Slips around obstacles and attacks vulnerable rear positions.',habitat:'Warm stones and fallen timber',elements:'Poison',weakness:'Ranged attacks',threat:'Priority'},
 greenway_raven:{name:'Carrion Raven',race:'Beast',family:'Beast',dungeon:'greenway',role:'ranged',sprite:33,range:3,move:5,armor:0,resistance:1,description:'An unnaturally large hunting bird that dives from the forest canopy.',ability:'Raking Dive',behavior:'Keeps distance until it finds an exposed target, then strikes from above.',habitat:'Forest canopy',elements:'Physical',weakness:'Accurate ranged attacks',threat:'Standard'},
 greenway_skirmisher:{name:'Greenway Skirmisher',race:'Goblin',family:'Goblin',dungeon:'greenway',role:'skirmisher',sprite:34,range:1,move:4,armor:1,resistance:0,description:'A road raider armed with a chipped blade and more courage than discipline.',ability:'Low Slash',behavior:'Closes quickly and attacks exposed party members.',habitat:'Roadside camps',elements:'Physical',weakness:'Formation fighting',threat:'Standard'},
 greenway_slinger:{name:'Greenway Slinger',race:'Goblin',family:'Goblin',dungeon:'greenway',role:'ranged',sprite:35,range:5,move:3,armor:0,resistance:0,description:'A practiced ambusher who attacks from behind rocks and fallen trees.',ability:'Crippling Stone',behavior:'Claims a clear firing lane and targets healers or other vulnerable adventurers.',habitat:'Rocky forest verge',elements:'Physical',weakness:'Melee pressure',threat:'Priority'},
 greenway_trapper:{name:'Greenway Trapper',race:'Goblin',family:'Goblin',dungeon:'greenway',role:'support',sprite:36,range:2,move:3,armor:1,resistance:1,description:'A cautious hunter carrying snares, rope, and stolen supplies.',ability:'Snaring Toss',behavior:'Supports its hunting party and stays behind tougher allies.',habitat:'Trade road ambush sites',elements:'Physical',weakness:'Focused attacks',threat:'Priority'},
 greenway_tamer:{name:'Goblin Beast Tamer',race:'Goblin',family:'Goblin',dungeon:'greenway',role:'bruiser',sprite:37,range:2,move:3,armor:2,resistance:1,description:'A scarred handler who drives wild beasts toward chosen prey.',ability:'Handler’s Mark',behavior:'Advances with beasts and pressures the party front line with its hooked staff.',habitat:'Hidden forest camps',elements:'Physical',weakness:'Magic',threat:'High'}
};
Object.assign(ENEMY_CATALOG,GREENWAY_ENEMIES);for(const [id,p] of Object.entries(GREENWAY_ENEMIES))enemyKeyByName[p.name]=id;
dungeons.push({id:'greenway',name:'Greenway Crossing',intro:'The forest road narrows between old boulders and fallen timber. Something waits just beyond the tree line.'});
BATTLEFIELDS.greenway=[{id:'greenway-crossing-v1',name:'Greenway Crossing',terrain:'A sunlit forest edge where the old road bends between boulders and fallen logs.',height:(x,y)=>(x>=11&&y<=2)||(x>=12&&y>=6)?1:0}];
const greenwayGenerate=generateDungeon;generateDungeon=function(d,...args){if(d.id==='greenway')return [{type:'⚔',branch:false,finalBoss:false,greenwayEncounter:true}];return greenwayGenerate(d,...args)};
const greenwayBegin=beginBattle;beginBattle=function(room,...args){const result=greenwayBegin(room,...args),r=runState,b=r?.battle;if(r?.dungeon.id!=='greenway'||!b)return result;
 const compositions=[{name:'Wild Beast Pack',keys:['greenway_wolf','greenway_wolf','greenway_badger','greenway_viper','greenway_raven']},{name:'Goblin Road Ambush',keys:['greenway_skirmisher','greenway_skirmisher','greenway_slinger','greenway_trapper','greenway_tamer']},{name:'Goblin Hunting Party',keys:['greenway_tamer','greenway_wolf','greenway_wolf','greenway_slinger','greenway_trapper']}],formation=compositions[Math.floor(Math.random()*compositions.length)],level=Math.max(1,Math.round(r.ids.reduce((n,id)=>n+(heroes.find(h=>h.id===id)?.level||1),0)/r.ids.length));
 b.finalBossRoom=false;b.battlefieldId='greenway-crossing-v1';b.battlefieldName='Greenway Crossing';b.compositionName=formation.name;b.terrainDescription='The open road is bordered by a dense forest edge. Fallen logs and large boulders block movement and line of sight.';b.roomTiles=Array.from({length:FIELD_W*FIELD_H},(_,i)=>{const x=i%FIELD_W,y=Math.floor(i/FIELD_W);return x>=0&&x<=15&&y>=1&&y<=7&&!((x===0||x===15)&&(y===1||y===7))});b.elevations=b.roomTiles.map((v,i)=>v&&((i%FIELD_W>=12&&Math.floor(i/FIELD_W)<=2)||(i%FIELD_W>=13&&Math.floor(i/FIELD_W)>=6))?1:0);b.tileTerrain={};b.enemyWarnings=[];b.sporeClouds=[];
 b.obstacles=[{x:5,y:2,kind:'fallen-root',name:'Fallen log',icon:'▬'},{x:7,y:6,kind:'fallen-root',name:'Fallen log',icon:'▬'},{x:9,y:3,kind:'mossy-stone',name:'Large boulder',icon:'◆'},{x:11,y:6,kind:'mossy-stone',name:'Large boulder',icon:'◆'}];
 const spots=[[14,2],[13,4],[14,6],[11,2],[12,6]];b.foes=formation.keys.map((key,i)=>{const p=ENEMY_CATALOG[key],foe={id:'greenway-'+i,archetype:key,name:p.name,icon:p.race==='Goblin'?'👺':'🐾',role:p.role,hp:20,maxHp:20,power:5,armor:p.armor,resistance:p.resistance,attackRange:p.range,move:p.move,magic:false,level,x:spots[i][0],y:spots[i][1],facing:'W',team:'enemy'};if(typeof scaleFftEnemy==='function')scaleFftEnemy('greenway',foe,b);rememberEnemy(foe);return foe});
 b.feedbackReady=true;recordBattleLog(`${formation.name} blocks the road at Greenway Crossing.`);renderRun();return result};
const greenwaySprite=spriteMarkup;spriteMarkup=function(kind,index,extra='',...args){if(kind==='enemy'&&index>=30&&index<=37){const n=index-30,x=n%4,y=Math.floor(n/4);return `<span aria-hidden="true" class="unit-sprite enemy-sprite greenway-enemy-sprite ${extra}" style="--greenway-x:${x/3*100}%;--greenway-y:${y*100}%"></span>`}return greenwaySprite(kind,index,extra,...args)};
const greenwayRender=renderBattle;renderBattle=function(...args){const result=greenwayRender(...args),b=runState?.battle,panel=document.getElementById('battlePanel');if(b&&runState.dungeon.id==='greenway'&&panel){panel.dataset.dungeon='greenway';const scene=panel.querySelector('.dungeon-scene');if(scene){scene.style.backgroundImage="linear-gradient(#1321161f,#1321163b),url('./assets/greenway-crossing-v1.png')";scene.style.backgroundPosition='center';scene.style.backgroundSize='cover'}panel.querySelectorAll('.obstacle-model').forEach((el,i)=>el.classList.add(i%2?'greenway-boulder':'greenway-log'))}return result};
const greenwayChoices=updateDungeonChoices;updateDungeonChoices=function(...args){const result=greenwayChoices(...args),button=document.querySelector('[data-dungeon="greenway"]');if(button){button.disabled=false;button.classList.toggle('selected',selectedDungeon==='greenway');button.querySelector('small').textContent='Road encounter · 1 battle · scales to party'}return result};
function chooseGreenway(){selectedDungeon='greenway';const d=dungeons.find(x=>x.id==='greenway');document.querySelector('.dungeonhero h2').textContent=d.name;document.querySelector('.dungeonhero p').textContent='A single forest-edge battle against beasts, goblin raiders, or a mixed hunting party.';document.querySelector('.dungeonhero .difficulty').textContent='✦ ROAD ENCOUNTER · VARIABLE DANGER';updateDungeonChoices()}
const choice=document.createElement('button');choice.className='dungeonchoice';choice.dataset.dungeon='greenway';choice.innerHTML='🌲 <b>Greenway Crossing</b><small>Road encounter · 1 battle · scales to party</small>';choice.onclick=chooseGreenway;document.querySelector('.dungeonchoices')?.prepend(choice);
const marker=document.querySelector('.battle-location');if(marker){marker.classList.add('greenway-active');marker.title='Greenway Crossing — playable road encounter';marker.addEventListener('click',()=>{chooseGreenway();document.querySelector('.nav button[data-page="dungeon"]')?.click();scrollTo({top:0,behavior:'smooth'})})}
const greenwayCodex=renderCodex;renderCodex=function(...args){const result=greenwayCodex(...args),groups=document.querySelectorAll('.bestiary-filter-group');if(groups[0]&&!groups[0].querySelector('[data-greenway-filter]'))groups[0].insertAdjacentHTML('beforeend',`<button data-greenway-filter class="${typeof bestiaryFilters!=='undefined'&&bestiaryFilters.dungeon==='greenway'?'selected':''}" onclick="setBestiaryFilter('dungeon','greenway')">Greenway</button>`);return result};
const greenwayHdObstacles=renderBattle;renderBattle=function(...args){const result=greenwayHdObstacles(...args),b=runState?.battle,panel=document.getElementById('battlePanel');if(!b||runState.dungeon.id!=='greenway'||!panel)return result;for(const model of panel.querySelectorAll('.obstacle-model')){const cell=model.closest('.iso-cell'),x=Number(cell?.dataset.worldX),y=Number(cell?.dataset.worldY),obstacle=b.obstacles.find(o=>o.x===x&&o.y===y);model.classList.remove('greenway-log','greenway-boulder','log-a','log-b','boulder-a','boulder-b');if(obstacle?.kind==='fallen-root')model.classList.add('greenway-log',(x+y)%2?'log-a':'log-b');else model.classList.add('greenway-boulder',(x+y)%2?'boulder-a':'boulder-b')}return result};
updateDungeonChoices();renderCodex();
})();


/* ===== expedition-loot.js ===== */
(function(){
'use strict';
function safe(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function itemType(item){if(item.slot==='weapon')return item.weaponType?item.weaponType.replaceAll('-',' '):'Weapon';if(item.slot==='accessory')return 'Accessory';return ({head:'Head armor',chest:'Chest armor',hands:'Hand armor',legs:'Leg armor',feet:'Foot armor'})[item.slot]||item.slot||'Item'}
function lootMarkup(items,finds){if(!items.length)return `<section class="expedition-loot"><header><div><small>RECOVERED EQUIPMENT</small><h4>No equipment recovered</h4></div><span>0 items</span></header><p class="loot-empty">The party recorded ${finds} field ${finds===1?'find':'finds'}, but no usable equipment was recovered on this run.</p></section>`;return `<section class="expedition-loot"><header><div><small>RECOVERED EQUIPMENT</small><h4>Items found during the expedition</h4></div><span>${items.length} ${items.length===1?'item':'items'}</span></header><div class="expedition-loot-list">${items.map(item=>`<article class="expedition-loot-item rarity-border-${safe((item.rarity||'Common').toLowerCase())}"><div class="loot-rarity rarity-${safe((item.rarity||'Common').toLowerCase())}">${safe(item.rarity||'Common')}</div><div><b>${safe(item.name)}</b><small>Lv ${Number(item.level)||1} · ${safe(itemType(item))}${item.element?` · ${safe(item.element)}`:''}</small><p>${safe(typeof gearStatLine==='function'?gearStatLine(item):'Equipment')}${item.effect?` · ${safe((typeof gearEffects!=='undefined'&&gearEffects[item.effect])||item.effect)}`:''}</p></div></article>`).join('')}</div><p class="loot-footnote">All recovered equipment has been placed in the guild inventory.</p></section>`}
const lootStartRun=startRun;startRun=function(...args){const result=lootStartRun(...args);if(runState){runState.foundItems=[];runState.foundItemIds=[]}return result};
const lootWinBattle=winBattle;winBattle=function(...args){const r=runState,state=window.wayfarerGearState,before=new Set(state?.inventory||[]),result=lootWinBattle(...args);if(r&&runState===r&&state){r.foundItems=r.foundItems||[];r.foundItemIds=r.foundItemIds||[];for(const id of state.inventory){if(before.has(id)||r.foundItemIds.includes(id))continue;const item=gearItem(id);if(item){r.foundItems.push({...item,stats:{...(item.stats||{})}});r.foundItemIds.push(id)}}}return result};
const lootFinishRun=finishRun;finishRun=function(...args){const r=runState,items=(r?.foundItems||[]).map(item=>({...item,stats:{...(item.stats||{})}})),finds=r?.loot||0,result=lootFinishRun(...args),report=document.querySelector('#run .report');if(report){const close=report.querySelector('button');const box=document.createElement('div');box.innerHTML=lootMarkup(items,finds);if(close)report.insertBefore(box.firstElementChild,close);else report.append(box.firstElementChild)}return result};
})();


/* ===== world-travel.js ===== */
(function(){
'use strict';
let traveling=false,skipTravel=false;
const routes={mosslight:{id:'mosslight',road:0,ratio:1,label:'Mosslight Warrens',region:'The Elderwood',days:2,crossing:{id:'greenway',ratio:.52,label:'Greenway Crossing'}},ashen:{id:'ashen',road:1,ratio:1,label:'Ashen Observatory',region:'Cinderpeak Range',days:4},sepulcher:{id:'sepulcher',road:2,ratio:1,label:'Hollow Sepulcher',region:'The Mirelands',days:5},greenway:{id:'greenway',road:0,ratio:.52,label:'Greenway Crossing',region:'Forest Road',days:1}};
const directStart=startRun;
function selectedParty(){return [...document.querySelectorAll('#team input:checked')].map(x=>heroes.find(h=>h.id===Number(x.value))).filter(Boolean)}
function valid(party,id){if(party.length!==5){toast(`Choose exactly 5 adventurers (${party.length} selected).`);return false}if(id==='ashen'&&party.some(h=>h.level<5)){toast('Every Ashen Observatory adventurer must be character level 5 or higher.');return false}if(id==='sepulcher'&&party.some(h=>h.level<10)){toast('Every Sepulcher adventurer must be character level 10 or higher.');return false}return true}
function sureFooted(party){return party.some(h=>[...(h.skills||[]),...(h.equippedPassives||[]),...(h.jobSkills?Object.values(h.jobSkills).flat():[]),h.passive].filter(Boolean).some(x=>/sure\W*(footed|step)/i.test(String(x).replaceAll('_',' '))))}
function chooseParty(party,mode){const ids=new Set(party.map(h=>h.id));document.querySelectorAll('#team input').forEach(x=>x.checked=ids.has(Number(x.value)));const input=document.querySelector(`input[name="mode"][value="${mode}"]`);if(input)input.checked=true}
function removeTravel(){document.querySelector('.world-party-marker')?.remove();document.querySelector('.world-travel-card')?.remove();document.querySelector('.world-page')?.classList.remove('traveling')}
function markup(route,party,back){return `<div class="world-travel-card"><div><small>${back?'RETURNING TO SOLARIS':'EXPEDITION UNDERWAY'}</small><h3>${back?route.label+' → Solaris':'Solaris → '+route.label}</h3><p>${back?'Bringing the expedition home':'Following the road through '+route.region}</p></div><div class="travel-party">${party.map(h=>`<span title="${h.name}">${classIcon(h.currentJob||h.cls)}</span>`).join('')}</div><div class="travel-progress"><i></i></div><div class="travel-status"><span>On the road</span><b>Day 0 of ${route.days}</b></div><button type="button" onclick="skipWorldTravel()">Skip travel</button></div>`}
window.skipWorldTravel=()=>{skipTravel=true};
function launch(id,party,mode,road){selectedDungeon=id;setDungeon(id);document.querySelector('.nav button[data-page="dungeon"]')?.click();chooseParty(party,mode);directStart();if(runState&&road)runState.roadEncounter=road;setTimeout(()=>document.getElementById('run')?.scrollIntoView({behavior:'smooth',block:'start'}),80)}
function animate(route,party,mode,from,to,back,onArrive){
 if(traveling)return;traveling=true;skipTravel=false;openWorldMap();const stage=document.querySelector('.map-stage'),path=stage?.querySelector('.continent-art')?.querySelectorAll('.roads path')[route.road];if(!stage||!path){traveling=false;onArrive();return}
 document.querySelector('.world-page').classList.add('traveling');stage.insertAdjacentHTML('beforeend',`<div class="world-party-marker">${party.map(h=>`<span>${classIcon(h.currentJob||h.cls)}</span>`).join('')}</div>`);document.querySelector('.world-layout').insertAdjacentHTML('afterend',markup(route,party,back));
 const marker=stage.querySelector('.world-party-marker'),card=document.querySelector('.world-travel-card'),bar=card.querySelector('.travel-progress i'),status=card.querySelector('.travel-status span'),day=card.querySelector('.travel-status b'),length=path.getTotalLength(),duration=Math.max(900,3600*Math.abs(to-from)/route.ratio),started=performance.now();
 function frame(now){let p=Math.min(1,(now-started)/duration);if(skipTravel)p=1;const ease=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,pos=from+(to-from)*ease,point=path.getPointAtLength(length*pos);marker.style.left=point.x/12+'%';marker.style.top=point.y/7.6+'%';bar.style.width=p*100+'%';day.textContent=`Day ${p?Math.min(route.days,Math.max(1,Math.ceil(p*route.days))):0} of ${route.days}`;status.textContent=back?(p<.75?'Traveling toward Solaris':p<1?'Approaching the capital':'Arrived in Solaris'):(p<.18?'Leaving Solaris':p<.75?'Traveling the open road':p<1?'Approaching the destination':'Arrived');if(p<1)return requestAnimationFrame(frame);marker.classList.add('arrived');setTimeout(()=>{removeTravel();traveling=false;onArrive()},skipTravel?80:650)}requestAnimationFrame(frame)
}
startRun=function(){if(traveling)return;const party=selectedParty(),destination=selectedDungeon;if(!valid(party,destination))return;const route=routes[destination]||routes.mosslight,mode=document.querySelector('input[name="mode"]:checked')?.value||'manual',hasSure=sureFooted(party),baseChance=hasSure?.25:.5,chance=route.crossing&&window.wayfarerWorldState?wayfarerWorldState.encounterChance(route.crossing.id,.5,hasSure):baseChance,hit=route.crossing&&Math.random()<chance;if(hit){animate(route,party,mode,0,route.crossing.ratio,false,()=>{toast(`${route.crossing.label}: enemies block the road.`);launch('greenway',party,mode,{destination,partyIds:party.map(h=>h.id),mode,crossingRatio:route.crossing.ratio,sureFooted:hasSure})})}else animate(route,party,mode,0,route.ratio,false,()=>launch(destination,party,mode,null));return mode};
window.wayfarerTravel={repeat(s){launch(s.dungeonId,s.partyIds.map(id=>heroes.find(h=>h.id===id)).filter(Boolean),s.mode,null)},returnToCity(s){const party=s.partyIds.map(id=>heroes.find(h=>h.id===id)).filter(Boolean),route=routes[s.dungeonId]||routes.mosslight;animate(route,party,s.mode,route.ratio,0,true,()=>{document.querySelector('.nav button[data-page="home"]')?.click();toast('The expedition has returned to Solaris.')})},continueJourney(s){const party=s.partyIds.map(id=>heroes.find(h=>h.id===id)).filter(Boolean),route=routes[s.destination]||routes.mosslight;animate(route,party,s.mode,s.crossingRatio||0,route.ratio,false,()=>launch(s.destination,party,s.mode,null))}};
})();


/* ===== expedition-return.js ===== */
(function(){
'use strict';
let completed=null;
const previousFinish=finishRun;
finishRun=function(...args){const r=runState;if(!r)return previousFinish(...args);const road=r.roadEncounter?{...r.roadEncounter}:null,snapshot={dungeonId:r.dungeon.id,partyIds:[...r.ids],mode:r.mode||'manual'};const result=previousFinish(...args),report=document.querySelector('#run .report');if(!report)return result;report.querySelector('button')?.remove();const actions=document.createElement('div');actions.className='expedition-end-actions';if(road){completed={kind:'road',...road};actions.innerHTML='<button class="button green" onclick="continueRoadJourney()">Continue journey →</button><button class="button secondary" onclick="returnAfterExpedition()">Return to Solaris</button>';report.insertAdjacentHTML('afterbegin',`<p class="road-encounter-note">Road encounter cleared at Greenway Crossing${road.sureFooted?' · Sure Footed reduced the encounter chance to 25%':''}.</p>`)}else{completed={kind:'site',...snapshot};actions.innerHTML='<button class="button green" onclick="repeatExpedition()">Repeat expedition</button><button class="button secondary" onclick="returnAfterExpedition()">Return to Solaris</button>'}report.append(actions);return result};
window.repeatExpedition=function(){if(completed?.kind!=='site')return;document.getElementById('run')?.classList.remove('show');wayfarerTravel.repeat(completed)};
window.returnAfterExpedition=function(){if(!completed)return;const data=completed.kind==='road'?{dungeonId:'greenway',partyIds:completed.partyIds,mode:completed.mode}:completed;document.getElementById('run')?.classList.remove('show');wayfarerTravel.returnToCity(data)};
window.continueRoadJourney=function(){if(completed?.kind!=='road')return;document.getElementById('run')?.classList.remove('show');wayfarerTravel.continueJourney(completed)};
})();


/* ===== guild-rank-display.js ===== */
(function(){
'use strict';
function rankCard(){return [...document.querySelectorAll('#home .stat')].find(card=>card.querySelector('span')?.textContent.trim()==='Guild rank')}
function updateGuildRankCard(){const card=rankCard();if(!card||typeof guildRankInfo!=='function')return;const info=guildRankInfo(),next=[10,25,50,null][info.tier],name=card.querySelector('strong'),progress=card.querySelector('em');if(name)name.textContent=info.name;if(progress)progress.textContent=next===null?'Maximum rank':`${renown} / ${next} renown`}
const previousRenderResources=renderResources;renderResources=function(...args){const result=previousRenderResources(...args);updateGuildRankCard();return result};
updateGuildRankCard();
})();


/* ===== guild-progression.js ===== */
(function(){
'use strict';
const rankDetails=[
 {name:'Fledgling Guild',at:0,seal:'◇',reward:0,perks:['8 base roster beds','Standard contracts','Item level 1 crafting']},
 {name:'Established Guild',at:10,seal:'◆',reward:150,perks:['+2 permanent roster beds','5% more job gold','Expanded market stock','Item level 4 crafting']},
 {name:'Renowned Company',at:25,seal:'✦',reward:300,perks:['+2 additional roster beds','10% more job gold','Improved rare and epic loot','Item level 7 crafting']},
 {name:'Grand Company',at:50,seal:'♜',reward:600,perks:['+2 additional roster beds','20% more job gold','Best market and loot tables','Item level 10 crafting']}
];
const stateKey='wayfarer-rank-progression-v1';
function rankState(){try{return JSON.parse(localStorage.getItem(stateKey))||{claimed:0}}catch{return {claimed:0}}}
function saveRankState(state){localStorage.setItem(stateKey,JSON.stringify(state))}
function currentTier(){return Math.max(0,Math.min(3,guildRankInfo().tier))}
function renderRankPanel(){const home=document.getElementById('home');if(!home)return;let panel=document.getElementById('guildRankPanel');if(!panel){panel=document.createElement('section');panel.id='guildRankPanel';panel.className='guild-rank-panel';home.querySelector('.stats')?.after(panel)}const tier=currentTier(),current=rankDetails[tier],next=rankDetails[tier+1],pct=next?Math.max(0,Math.min(100,(renown-current.at)/(next.at-current.at)*100)):100;panel.innerHTML=`<div class="guild-rank-summary"><div><small>GUILD RENOWN</small><h3>${current.seal} ${current.name}</h3><p>${next?`${renown} renown · ${next.at-renown} until ${next.name}`:`${renown} renown · maximum guild rank achieved`}</p></div><div class="guild-rank-seal">${current.seal}</div></div><div class="guild-rank-track"><i style="width:${pct}%"></i></div><div class="guild-rank-perks">${rankDetails.map((rank,i)=>`<article class="${i<=tier?'reached':''}"><b>${rank.name} · ${rank.at}</b><small>${rank.perks.join('<br>')}</small></article>`).join('')}</div>`}
function showPromotion(tier){if(document.querySelector('.guild-promotion-backdrop'))return;const rank=rankDetails[tier],earned=rankDetails.slice(1,tier+1),reward=earned.reduce((sum,x)=>sum+x.reward,0);document.body.insertAdjacentHTML('beforeend',`<div class="guild-promotion-backdrop"><section class="guild-promotion"><div class="seal">${rank.seal}</div><small>GUILD PROMOTION</small><h2>${rank.name}</h2><p>Word of the Wayfarers has spread. Solaris recognizes the guild's growing influence.</p><ul>${earned.flatMap(x=>x.perks).map(x=>`<li>${x}</li>`).join('')}</ul><p class="reward">Promotion grant · ${reward} gold</p><button class="button" onclick="claimGuildPromotion(${tier},${reward})">Accept promotion</button></section></div>`)}
window.claimGuildPromotion=function(tier,reward){const state=rankState();if(tier<=state.claimed){document.querySelector('.guild-promotion-backdrop')?.remove();return}gold+=reward;state.claimed=tier;saveRankState(state);save();document.querySelector('.guild-promotion-backdrop')?.remove();renderAll();renderRankPanel();toast(`${rankDetails[tier].name}: +${reward} gold promotion grant.`)};
const oldCapacity=rosterCapacity;rosterCapacity=function(){return oldCapacity()+currentTier()*2};
const oldConfirmJob=confirmJob;confirmJob=function(...args){const before=new Set(activeJobs.map(j=>j.id)),result=oldConfirmJob(...args),bonus=[0,.05,.10,.20][currentTier()];for(const job of activeJobs)if(!before.has(job.id)&&bonus)job.gold=Math.ceil(job.gold*(1+bonus));if(bonus)save();return result};
const oldEnsureMarket=ensureMarketStock;ensureMarketStock=function(...args){const result=oldEnsureMarket(...args),state=window.wayfarerGearState,target=12+currentTier()*2;let added=false;if(state?.market&&state.items)while(state.market.length<target){const item=generateGear({ids:heroes.map(h=>h.id),scale:typeof forgeLevel==='function'?forgeLevel():currentTier()+1,dungeon:{id:'market'}},'');state.items.push(item);state.market.push(item.id);added=true}if(added&&typeof gearPersist==='function')gearPersist();return result};
const oldRenderResources=renderResources;renderResources=function(...args){const result=oldRenderResources(...args);renderRankPanel();const state=rankState(),tier=currentTier();if(tier>state.claimed)setTimeout(()=>showPromotion(tier),80);return result};
renderRankPanel();setTimeout(()=>{const state=rankState(),tier=currentTier();if(tier>state.claimed)showPromotion(tier)},250);
})();


/* ===== expedition-prep.js ===== */
(function(){
'use strict';
const prepData={greenway:{travel:1,rooms:1,level:0,threat:'Variable road encounter',route:'Forest Road',loot:'Forest gear, common materials, Beast and Goblin discoveries'},mosslight:{travel:2,rooms:3,level:1,threat:'Low danger',route:'Crosses Greenway Crossing',loot:'General equipment, medicinal herbs, luminous cavern finds'},ashen:{travel:4,rooms:5,level:5,threat:'High danger',route:'Cinderpeak mountain road',loot:'Rare equipment, magical materials, ember and aether gear'},sepulcher:{travel:5,rooms:7,level:13,threat:'Very high danger',route:'Coastal road through the Drowned March',loot:'Rare to legendary equipment, spirit essence, undead discoveries'}};
function party(){return [...document.querySelectorAll('#team input:checked')].map(x=>heroes.find(h=>h.id===Number(x.value))).filter(Boolean)}
function hasTravelPassive(team){return team.some(h=>[...(h.skills||[]),...(h.equippedPassives||[]),...(h.jobSkills?Object.values(h.jobSkills).flat():[])].some(x=>/sure\W*(footed|step)/i.test(String(x).replaceAll('_',' '))))}
function roleName(h){const roles=JOBS[h.currentJob||h.cls]?.roles||[];return roles.slice(0,2).map(x=>JOB_ROLE_LABELS[x]||x).join(' · ')||'Adventurer'}
function rarityText(id){if(typeof dungeonRarityRates!=='function')return 'Equipment quality scales with guild rank.';const rates=dungeonRarityRates({dungeon:{id}},id==='sepulcher'||id==='ashen'?'☠':'');return Object.entries(rates).filter(([,n])=>n>0).map(([name,n])=>`${name[0].toUpperCase()+name.slice(1)} ${n}%`).join(' · ')}
function expectedLevels(id,team){const d=prepData[id]||prepData.mosslight,avg=team.length?Math.round(team.reduce((n,h)=>n+(h.level||1),0)/team.length):d.level||1,base=Math.max(d.level||1,avg+(id==='sepulcher'?3:0));return `${base}–${base+2}`}
function renderPrep(){const box=document.getElementById('expeditionPrep');if(!box)return;const team=party(),id=selectedDungeon,d=prepData[id]||prepData.mosslight,mode=document.querySelector('input[name="mode"]:checked')?.value||'manual',roles=[['Tank',team.some(h=>hasJobRole(h,'tank'))],['Healer',team.some(h=>hasJobRole(h,'healer'))],['Ranged',team.some(h=>hasJobRole(h,'ranged')||hasJobRole(h,'caster'))],['Frontline',team.some(h=>hasJobRole(h,'frontline')||hasJobRole(h,'striker'))]],levelReady=id==='ashen'?team.every(h=>h.level>=5):id==='sepulcher'?team.every(h=>h.level>=10):true,ready=team.length===5&&levelReady,sure=hasTravelPassive(team),supplies=typeof apothecary!=='undefined'?apothecary.items:{potion:0,ether:0,bomb:0};box.innerHTML=`<div class="prep-header"><div><small>DEPARTURE BRIEFING</small><h3>${d.threat} · ${d.rooms} combat ${d.rooms===1?'room':'rooms'}</h3></div><span class="prep-readiness ${ready?'ready':''}">${ready?'READY TO DEPART':team.length!==5?`${team.length} / 5 SELECTED`:'LEVEL REQUIREMENT NOT MET'}</span></div><div class="prep-grid"><section class="prep-section"><h4>SELECTED PARTY</h4><div class="prep-party-list">${team.length?team.map(h=>`<div class="prep-member"><i>${classIcon(h.currentJob||h.cls)}</i><div><b>${h.name}</b><small>${h.currentJob||h.cls} · ${roleName(h)}</small></div><span>Lv ${h.level}</span></div>`).join(''):'<p class="prep-empty">Select five adventurers above to build the departure plan.</p>'}</div></section><section class="prep-section"><h4>FORMATION COVERAGE</h4><div class="prep-role-list">${roles.map(([name,ok])=>`<div class="prep-role"><span>${name}</span><b class="${ok?'good':'missing'}">${ok?'Covered':'Missing'}</b></div>`).join('')}</div><div class="prep-loot"><h4>EXPECTED REWARDS</h4><p>${d.loot}</p><p>${rarityText(id)}</p></div></section><section class="prep-section"><h4>ROUTE & SUPPLIES</h4><div class="prep-detail-list"><div class="prep-detail"><span>Travel</span><b>${d.travel} ${d.travel===1?'day':'days'} each way</b></div><div class="prep-detail"><span>Route</span><b>${d.route}</b></div><div class="prep-detail"><span>Enemy levels</span><b>${expectedLevels(id,team)}</b></div><div class="prep-detail"><span>Control</span><b>${mode==='ai'?'AI pilot':'Manual'}</b></div>${id==='mosslight'?`<div class="prep-detail"><span>Greenway battle</span><b>${sure?'25% · Sure Footed':'50%'}</b></div>`:''}</div><h4 style="margin-top:14px">BATTLE SUPPLIES</h4><div class="prep-supply-list"><div class="prep-supply"><span>Healing Potions</span><b>${supplies.potion||0}</b></div><div class="prep-supply"><span>Stamina Tonics</span><b>${supplies.ether||0}</b></div><div class="prep-supply"><span>Alchemical Bombs</span><b>${supplies.bomb||0}</b></div></div></section></div><div class="prep-footer"><p>${ready?'The party is prepared. Supplies remain in the shared guild inventory until used.':'Resolve the readiness warning before departure.'}</p><button class="button green" onclick="startRun()" ${ready?'':'disabled'}>Begin journey →</button></div>`}
function install(){const dungeon=document.getElementById('dungeon'),run=document.getElementById('run');if(!dungeon||!run)return;const box=document.createElement('section');box.id='expeditionPrep';box.className='expedition-prep';run.before(box);const top=dungeon.querySelector('.dungeonhero .button');if(top){top.textContent='Review departure →';top.onclick=()=>{renderPrep();box.scrollIntoView({behavior:'smooth',block:'start'})}}dungeon.addEventListener('change',e=>{if(e.target.matches('#team input,input[name="mode"]'))renderPrep()});dungeon.addEventListener('click',e=>{if(e.target.closest('[data-dungeon]'))setTimeout(renderPrep,0)});renderPrep()}
const oldRenderTeam=renderTeam;renderTeam=function(...args){const result=oldRenderTeam(...args);renderPrep();return result};
const oldSetDungeon=setDungeon;setDungeon=function(...args){const result=oldSetDungeon(...args);renderPrep();return result};
install();
})();


/* ===== expedition-attrition.js ===== */
(function(){
'use strict';
let lastParty=[];
function fatigue(h){return Math.max(0,Math.min(100,Number(h?.expeditionFatigue)||0))}
function staminaAfterTravel(h){return Math.max(2,(h?.staminaMax||3)-Math.floor(fatigue(h)/35))}
const oldFinish=finishRun;finishRun=function(...args){const r=runState;if(!r)return oldFinish(...args);const condition=r.ids.map(id=>{const h=heroes.find(x=>x.id===id);return {id,hp:Math.max(1,h?.hp||1),downed:!h||h.hp<=0}}),wear=Math.min(35,8+(r.cleared||0)*4+(r.failed?10:0));lastParty=[...r.ids];const result=oldFinish(...args);for(const entry of condition){const h=heroes.find(x=>x.id===entry.id);if(!h)continue;h.hp=Math.max(1,Math.min(h.maxHp,entry.hp));h.expeditionFatigue=Math.min(100,fatigue(h)+wear+(entry.downed?10:0))}save();return result};
const oldBegin=beginBattle;beginBattle=function(...args){const result=oldBegin(...args),b=runState?.battle;if(!b)return result;for(const unit of b.heroes){const h=heroes.find(x=>x.id===unit.id);unit.ap=Math.min(unit.ap??99,staminaAfterTravel(h))}if(b.heroes.some(u=>fatigue(heroes.find(h=>h.id===u.id))>=35))recordBattleLog('Travel fatigue reduces the available stamina of tired adventurers.');renderRun();return result};
const oldRound=startHeroRound;startHeroRound=function(...args){const result=oldRound(...args),b=runState?.battle;if(b)for(const unit of b.heroes){const h=heroes.find(x=>x.id===unit.id);unit.ap=Math.min(unit.ap??99,staminaAfterTravel(h))}return result};
const oldReturn=returnAfterExpedition;returnAfterExpedition=function(...args){for(const id of lastParty){const h=heroes.find(x=>x.id===id);if(!h)continue;h.hp=h.maxHp;h.expeditionFatigue=Math.max(0,fatigue(h)-60)}save();const result=oldReturn(...args);toast('The return journey provides rest: vigor restored and fatigue reduced.');return result};
window.expeditionCondition={fatigue,staminaAfterTravel};
})();


/* ===== combat-strategy.js ===== */
(function(){
'use strict';
const key='wayfarer-ai-supply-policy-v1';let policy=localStorage.getItem(key)||'balanced';
window.wayfarerAiPolicy={get mode(){return policy}};
window.setAiSupplyPolicy=function(value){if(!['conserve','balanced','aggressive'].includes(value))return;policy=value;localStorage.setItem(key,value);document.querySelector('#expeditionPrep')?.dispatchEvent(new Event('wayfarer-prep-refresh'));toast(`AI supply policy: ${value}.`)};
function useAiSupply(b,actor,h){if(runState?.mode!=='ai'||typeof apothecary==='undefined'||attackActionsUsed(actor)>=extraAttackActions(h)||actor.ap<1)return false;const threshold={conserve:.2,balanced:.32,aggressive:.45}[policy],allies=b.heroes.map(u=>({u,h:heroes.find(x=>x.id===u.id)})).filter(x=>x.h?.hp>0&&x.h.hp<x.h.maxHp*threshold&&distance(actor,x.u)<=4&&fieldLineOfSight(actor,x.u,b)).sort((a,c)=>a.h.hp/a.h.maxHp-c.h.hp/c.h.maxHp),patient=allies[0];if(patient&&apothecary.items.potion>0){const healer=typeof supportBestHealer==='function'?supportBestHealer(b,patient.u):null;if(!healer||healer.h.id===h.id||patient.h.hp<patient.h.maxHp*.2){const amount=Math.min(patient.h.maxHp-patient.h.hp,Math.ceil(patient.h.maxHp*.35)+10);patient.h.hp+=amount;apothecary.items.potion--;actor.ap--;actor.attackActions=attackActionsUsed(actor)+1;actor.acted=true;ensureRunStats();runState.stats[h.id].healing+=amount;recordBattleLog(`${h.name} uses a Healing Potion on ${patient.h.name}, restoring ${amount} vigor.`);saveApothecary();playSfx('heal');return true}}if(policy==='aggressive'&&apothecary.items.bomb>1){const target=b.foes.filter(f=>f.hp>0&&distance(actor,f)<=4&&fieldLineOfSight(actor,f,b)).sort((a,c)=>(c.boss?1:0)-(a.boss?1:0)||c.hp-a.hp)[0];if(target?.boss){combatStrike(h,actor,target,{name:'Alchemical Bomb',power:6,magic:true});apothecary.items.bomb--;actor.ap--;actor.attackActions=attackActionsUsed(actor)+1;actor.acted=true;saveApothecary();return true}}return false}
const oldAI=aiHeroAction;aiHeroAction=function(b,actor){const h=heroes.find(x=>x.id===actor.id);if(h&&useAiSupply(b,actor,h)){advanceBattleTurn();return}return oldAI(b,actor)};
})();


/* ===== prep-condition-bridge.js ===== */
(function(){
'use strict';
function selected(){return [...document.querySelectorAll('#team input:checked')].map(x=>heroes.find(h=>h.id===Number(x.value))).filter(Boolean)}
function enhance(){const box=document.getElementById('expeditionPrep');if(!box)return;const team=selected(),cards=box.querySelectorAll('.prep-member');cards.forEach((card,i)=>{const h=team[i];if(!h||card.querySelector('.condition'))return;const fatigue=window.expeditionCondition?.fatigue(h)||0,condition=document.createElement('small');condition.className='condition '+(fatigue>=70?'exhausted':fatigue>=35?'tired':'');condition.textContent=`Vigor ${h.hp}/${h.maxHp} · Fatigue ${fatigue}% · ${window.expeditionCondition?.staminaAfterTravel(h)||h.staminaMax} battle stamina`;card.querySelector('div')?.append(condition)});const road=[...box.querySelectorAll('.prep-detail')].find(x=>x.querySelector('span')?.textContent==='Greenway battle');if(road&&window.wayfarerWorldState){const sure=team.some(h=>[...(h.skills||[]),...(h.equippedPassives||[]),...(h.jobSkills?Object.values(h.jobSkills).flat():[])].some(x=>/sure\W*(footed|step)/i.test(String(x).replaceAll('_',' ')))),chance=wayfarerWorldState.encounterChance('greenway',.5,sure);road.querySelector('b').textContent=`${Math.round(chance*100)}%${sure?' · Sure Footed':''} · ${wayfarerWorldState.status('greenway')}`}const supply=box.querySelector('.prep-supply-list');if(supply&&!box.querySelector('#aiSupplyPolicy')){const mode=window.wayfarerAiPolicy?.mode||'balanced';supply.insertAdjacentHTML('afterend',`<label class="prep-ai-policy">AI supply use <select id="aiSupplyPolicy" onchange="setAiSupplyPolicy(this.value)"><option value="conserve" ${mode==='conserve'?'selected':''}>Conserve · emergencies only</option><option value="balanced" ${mode==='balanced'?'selected':''}>Balanced</option><option value="aggressive" ${mode==='aggressive'?'selected':''}>Aggressive · use against bosses</option></select></label>`)}const footer=box.querySelector('.prep-footer p');if(footer&&!box.querySelector('.fatigue-note'))footer.insertAdjacentHTML('afterend','<small class="fatigue-note">Repeating an expedition retains injuries and adds fatigue. Returning to Solaris restores vigor and removes 60 fatigue.</small>')}
const box=document.getElementById('expeditionPrep');if(box){new MutationObserver(enhance).observe(box,{childList:true,subtree:true});box.addEventListener('wayfarer-prep-refresh',enhance);enhance()}
})();


/* ===== enemy-identity.js ===== */
(function(){
'use strict';
function profile(foe){return typeof ENEMY_CATALOG!=='undefined'?ENEMY_CATALOG[foe.archetype]||{}:{}}
function finishSpecial(b){if(typeof enemyRoleFinishTurn==='function')enemyRoleFinishTurn(b);else{b.enemyQueue.shift();renderRun();if(b.enemyQueue.length)setTimeout(enemyBattleStep,350);else startHeroRound()}}
function hitHero(foe,target,bonus,label){const r=runState,b=r.battle,hit=tankDamage(target.u,target.h,foe,foe.power+bonus,target.u.guarded),actual=Math.min(target.h.hp,hit.damage);target.u.guarded=false;target.u.attackedThisRound=true;target.h.hp=Math.max(0,target.h.hp-hit.damage);r.stats[target.h.id].taken+=actual;b.flash={x:target.u.x,y:target.u.y,type:'impact'};recordBattleLog(`${foe.name} uses ${label} on ${target.h.name} for ${actual} damage.`);playSfx('hit')}
const oldEnemyStep=enemyBattleStep;enemyBattleStep=function(...args){const b=runState?.battle,foe=b?.foes.find(f=>f.id===b.enemyQueue?.[0]&&f.hp>0);if(!b||!foe)return oldEnemyStep(...args);const p=profile(foe),family=p.family||p.race||'',living=b.heroes.map(u=>({u,h:heroes.find(h=>h.id===u.id)})).filter(x=>x.h?.hp>0);if(!living.length)return oldEnemyStep(...args);if(foe.boss&&!foe.phaseTwo&&foe.hp<=foe.maxHp*.5){foe.phaseTwo=true;foe.power+=2;foe.move=(foe.move||3)+1;recordBattleLog(`${foe.name} enters a second phase: power and movement increase.`)}if((family==='Undead'||runState.dungeon?.id==='sepulcher')&&p.role==='support'&&foe.specialRound!==b.round){const fallen=b.foes.find(f=>f!==foe&&f.hp<=0&&!f.revived);if(fallen){fallen.revived=true;fallen.hp=Math.max(1,Math.ceil(fallen.maxHp*.35));foe.specialRound=b.round;recordBattleLog(`${foe.name} invokes Unquiet Return; ${fallen.name} rises with ${fallen.hp} vitality.`);finishSpecial(b);return}}if((family==='Goblin'||p.race==='Goblin')&&/trapper/i.test(foe.archetype||foe.name)&&b.round%3===0&&foe.specialRound!==b.round){const target=living.sort((a,c)=>a.h.hp/a.h.maxHp-c.h.hp/c.h.maxHp)[0];foe.specialRound=b.round;hitHero(foe,target,0,'Snaring Toss');target.u.snaredUntil=b.round+1;recordBattleLog(`${target.h.name} is snared and will lose 1 movement next round.`);finishSpecial(b);return}if((family==='Beast'||p.race==='Beast')){const target=living.sort((a,c)=>distance(foe,a.u)-distance(foe,c.u))[0],pack=b.foes.filter(f=>f!==foe&&f.hp>0&&distance(f,target.u)<=2).length;if(pack){foe.power+=2;const result=oldEnemyStep(...args);foe.power-=2;return result}}if(runState.dungeon?.id==='ashen'&&foe.magic&&b.round%3===0&&foe.specialRound!==b.round){const target=living.sort((a,c)=>a.h.hp/a.h.maxHp-c.h.hp/c.h.maxHp)[0];if(distance(foe,target.u)<=4&&fieldLineOfSight(foe,target.u,b)){foe.specialRound=b.round;hitHero(foe,target,2,'Aether Flare');finishSpecial(b);return}}return oldEnemyStep(...args)};
const oldMoveRange=moveRange;moveRange=function(h,...args){const unit=runState?.battle?.heroes.find(u=>u.id===h?.id),penalty=unit?.snaredUntil>=runState?.battle?.round?1:0;return Math.max(1,oldMoveRange(h,...args)-penalty)};
})();


/* ===== reward-balance.js ===== */
(function(){
'use strict';
const oldFinish=finishRun;finishRun=function(...args){const r=runState;if(!r)return oldFinish(...args);const s={id:r.dungeon.id,cleared:r.cleared||0,loot:r.loot||0,failed:!!r.failed,avg:r.ids.reduce((n,id)=>n+(heroes.find(h=>h.id===id)?.level||1),0)/r.ids.length},goldBefore=gold,renownBefore=renown,result=oldFinish(...args);if(s.failed)return result;const bases={greenway:12,mosslight:45,ashen:90,sepulcher:180},room={greenway:4,mosslight:8,ashen:12,sepulcher:15},find={greenway:4,mosslight:10,ashen:14,sepulcher:18},target=Math.round((bases[s.id]||45)+(room[s.id]||8)*s.cleared+(find[s.id]||10)*s.loot+s.avg*2),wanted={greenway:1,mosslight:2,ashen:4,sepulcher:6}[s.id]||2;gold+=target-(gold-goldBefore);renown+=wanted-(renown-renownBefore);save();renderResources();const report=document.querySelector('#run .report');if(report)report.insertAdjacentHTML('beforeend',`<p>Balanced expedition reward: <b>${target} gold</b> · <b>${wanted} renown</b>. Rewards reflect route length, combat rooms, finds, and party level.</p>`);return result};
})();


/* ===== world-state.js ===== */
(function(){
'use strict';
const key='wayfarer-world-state-v1';let state;try{state=JSON.parse(localStorage.getItem(key))||{clears:{}}}catch{state={clears:{}}}state.clears=state.clears||{};function saveState(){localStorage.setItem(key,JSON.stringify(state))}function status(id){const n=state.clears[id]||0;return n>=6?'Secured':n>=3?'Patrolled':n>0?'Explored':'Uncleared'}
window.wayfarerWorldState={clears:state.clears,status,encounterChance(id,base,sure){const n=state.clears[id]||0,reduction=n>=6?.25:n>=3?.15:0;return Math.max(.05,(sure?.25:base)-reduction)}};
const oldFinish=finishRun;finishRun=function(...args){const r=runState,s=r&&{id:r.dungeon.id,failed:!!r.failed};const result=oldFinish(...args);if(s&&!s.failed){const before=state.clears[s.id]||0;state.clears[s.id]=before+1;saveState();const after=state.clears[s.id];if((after===3||after===6)&&s.id==='greenway')toast(`Greenway Crossing is now ${status('greenway')}. Future road encounter chances are reduced.`)}return result};
function enhanceMap(){const card=document.getElementById('routeCard');if(!card||card.querySelector('.world-state-note'))return;const selected=document.querySelector('.map-location.selected')?.dataset.location||'solaris';if(selected==='solaris')return;const n=state.clears[selected]||0;card.insertAdjacentHTML('beforeend',`<div class="world-state-note"><b>REGIONAL STATUS · ${status(selected).toUpperCase()}</b><br>${n} successful clear${n===1?'':'s'} recorded.${selected==='greenway'?` Road encounter reduction: ${n>=6?'25%':n>=3?'15%':'0%'}.`:''}</div>`)}
const card=document.getElementById('routeCard');if(card)new MutationObserver(enhanceMap).observe(card,{childList:true});document.querySelectorAll('.map-location,.mapped-location').forEach(x=>x.addEventListener('click',()=>setTimeout(enhanceMap,0)));setTimeout(enhanceMap,100);
})();


/* ===== political-system.js ===== */
(function(){
'use strict';
const POLITICAL_KEY='wayfarer-politics-v1';
const HOUSES={
 solarius:{name:'House Solarius',icon:'☀',seat:'Solaris',domain:'Royal house · crown and central administration',color:'#e4b94d',rival:'duskmere',leader:'King Edric IV',summary:'The royal dynasty founded by Aldren Solarius rules from Solaris. It prizes stability, consistent law, maintained roads, and the careful balance between crown and nobility.',perk:'Royal favor improves renown earned from noble contracts.',penalty:'Royal scrutiny reduces gold paid by all job-board contracts.'},
 veyrath:{name:'House Veyrath',icon:'⚒',seat:'The volcanic northeast',domain:'Mountains · mining and defense',color:'#b86f4b',rival:'thornmere',leader:'Duke Garrick Veyrath',summary:'Veyrath controls Lumara’s mineral-rich mountains, mines, and much of its military industry. The house favors expansion, strong defenses, and reliable access to timber and trade roads.',perk:'Mining contacts add salvage to completed noble contracts.',penalty:'Closed mountain suppliers reduce noble-contract gold.'},
 thornmere:{name:'House Thornmere',icon:'❧',seat:'The western forests',domain:'Forests · timber and preservation',color:'#5c9c67',rival:'veyrath',leader:'Duchess Evelyne Thornmere',summary:'Thornmere administers the ancient western woodlands. Its nobles protect old forest customs and oppose harvesting that threatens the long-term health of the realm.',perk:'Woodland guides increase experience from job-board work.',penalty:'Lost access to safe woodland routes lengthens contracts.'},
 duskmere:{name:'House Duskmere',icon:'♒',seat:'The southeastern mirelands',domain:'Swamps · waterways and regional autonomy',color:'#688f91',rival:'solarius',leader:'Duke Malrec Duskmere',summary:'Duskmere governs the swamps, waterways, and isolated settlements of the southeast. It values local knowledge and resists central projects that might weaken regional independence.',perk:'Mireland apothecaries add useful materials to noble contracts.',penalty:'Mireland tolls lengthen noble contracts.'},
 valcrest:{name:'House Valcrest',icon:'♜',seat:'The central plains',domain:'Plains · agriculture and grain reserves',color:'#b3924f',rival:'marivelle',leader:'Duke Alistair Valcrest',summary:'Valcrest’s broad estates feed Solaris and much of Lumara. The house champions agricultural order, traditional obligations, and firm protection of noble privilege.',perk:'Provisioned crews complete job-board contracts more quickly.',penalty:'Withheld provisions lengthen all job-board contracts.'},
 marivelle:{name:'House Marivelle',icon:'⚓',seat:'The coast',domain:'Coast · maritime trade and commerce',color:'#5d85aa',rival:'valcrest',leader:'Duchess Adriana Marivelle',summary:'Marivelle commands coastal trade, ships, and commercial policy. Its wealth depends on open markets and the steady movement of timber, metal, and grain.',perk:'Trade connections increase gold from job-board contracts.',penalty:'Unfavorable tariffs reduce gold from all job-board contracts.'}
};
const HOUSE_QUESTS=[
 {id:'house-solarius-petition',houseId:'solarius',icon:'☀',name:'Petitions for the Crown',desc:'Escort sealed petitions from the outer wards to the Council of the Sun.',time:60,gold:82,xp:25,item:'Royal writ'},
 {id:'house-solarius-road',houseId:'solarius',icon:'🛡',name:'The King’s Road',desc:'Patrol a damaged stretch of royal road and report threats to travelers.',time:70,gold:94,xp:29,item:'Sun-stamped badge'},
 {id:'house-veyrath-ore',houseId:'veyrath',icon:'⛏',name:'Ore Under Guard',desc:'Protect a valuable ore shipment descending from the volcanic mines.',time:75,gold:105,xp:30,item:'Refined iron'},
 {id:'house-veyrath-survey',houseId:'veyrath',icon:'⚒',name:'Survey the Old Cut',desc:'Map an abandoned mountain passage for Veyrath engineers.',time:65,gold:92,xp:28,item:'Surveyor’s pick'},
 {id:'house-thornmere-grove',houseId:'thornmere',icon:'🌲',name:'Ward the Elder Grove',desc:'Drive poachers away without harming the protected woodland.',time:70,gold:88,xp:32,item:'Elderwood sprig'},
 {id:'house-thornmere-trail',houseId:'thornmere',icon:'🦌',name:'The Vanished Trail',desc:'Find why a familiar forest path has disappeared beneath new growth.',time:60,gold:80,xp:30,item:'Ranger’s token'},
 {id:'house-duskmere-survey',houseId:'duskmere',icon:'🛶',name:'Lanterns in the Mire',desc:'Guide Duskmere surveyors through flooded channels before nightfall.',time:75,gold:98,xp:31,item:'Mireglass vial'},
 {id:'house-duskmere-reeds',houseId:'duskmere',icon:'🌾',name:'Reeds for the Healers',desc:'Gather medicinal reeds from a dangerous stretch of wetland.',time:60,gold:78,xp:29,item:'Medicinal reeds'},
 {id:'house-valcrest-grain',houseId:'valcrest',icon:'🌾',name:'Guard the Grain Train',desc:'Protect wagons carrying the royal grain reserve toward Solaris.',time:70,gold:96,xp:28,item:'Golden grain seal'},
 {id:'house-valcrest-irrigation',houseId:'valcrest',icon:'💧',name:'Broken Irrigation Gate',desc:'Clear and repair a blocked canal before the lower fields flood.',time:55,gold:76,xp:27,item:'Valcrest field kit'},
 {id:'house-marivelle-ledger',houseId:'marivelle',icon:'⚓',name:'The Missing Ledger',desc:'Recover a trade ledger stolen between the docks and the capital.',time:65,gold:102,xp:27,item:'Merchant ledger'},
 {id:'house-marivelle-caravan',houseId:'marivelle',icon:'📦',name:'Coastal Consignment',desc:'Escort delicate imported goods from the coast to a Solaris factor.',time:70,gold:108,xp:28,item:'Foreign trade token'}
];
let politicalState;
try{politicalState=JSON.parse(localStorage.getItem(POLITICAL_KEY))||{relations:{},history:[]}}catch{politicalState={relations:{},history:[]}}
politicalState.relations=politicalState.relations||{};politicalState.history=politicalState.history||[];
for(const id of Object.keys(HOUSES))if(!Number.isFinite(politicalState.relations[id]))politicalState.relations[id]=0;
function savePolitics(){localStorage.setItem(POLITICAL_KEY,JSON.stringify(politicalState))}
function relation(id){return politicalState.relations[id]||0}
function relationTier(value){return value>=60?'Allied':value>=25?'Trusted':value>=10?'Favored':value<=-60?'Hostile':value<=-25?'Disfavored':value<=-10?'Wary':'Neutral'}
function relationClass(value){return value>=25?'positive':value<=-25?'negative':'neutral'}
function changeRelation(id,amount,reason){if(!HOUSES[id]||!amount)return;const before=relation(id),after=Math.max(-100,Math.min(100,before+amount));politicalState.relations[id]=after;politicalState.history.unshift({id,amount:after-before,reason,date:new Date().toLocaleDateString()});politicalState.history=politicalState.history.slice(0,30);savePolitics()}
function trusted(id){return relation(id)>=25}
function hostile(id){return relation(id)<=-25}
function politicalContractModifiers(job){let goldRate=1,xpRate=1,timeRate=1,renownBonus=0,scrap=0,materials=0;if(trusted('marivelle'))goldRate+=.1;if(hostile('marivelle'))goldRate-=.1;if(trusted('valcrest'))timeRate-=.1;if(hostile('valcrest'))timeRate+=.15;if(trusted('thornmere'))xpRate+=.1;if(hostile('thornmere'))timeRate+=.1;if(hostile('solarius'))goldRate-=.05;if(job.houseId){const r=relation(job.houseId);if(r>=60){goldRate+=.25;renownBonus++}else if(r>=25)goldRate+=.15;else if(r<=-25)goldRate-=.15;if(trusted('solarius'))renownBonus++;if(trusted('veyrath'))scrap++;if(hostile('veyrath'))goldRate-=.05;if(trusted('duskmere'))materials++}return{goldRate:Math.max(.6,goldRate),xpRate,timeRate:Math.max(.7,timeRate),renownBonus,scrap,materials}}
function houseCodexMarkup(){return `<div class="politics-overview"><article><small>THE KINGDOM OF</small><h2>Lumara</h2><p>Lumara is a prosperous island monarchy of fertile plains, ancient forests, volcanic mountains, and southeastern swamps. King Edric IV rules from Solaris with the Council of the Sun. The realm is peaceful and competently governed, but inherited privilege and unequal political influence create a growing divide between nobles and commoners.</p><div class="kingdom-facts"><span><b>Capital</b>Solaris</span><span><b>Government</b>Hereditary monarchy</span><span><b>Industries</b>Agriculture · mining · forestry · trade</span><span><b>Present tension</b>Tradition · reform · noble privilege</span></div></article><aside><b>Guild political standing</b><p>Complete noble contracts to gain standing with their sponsor. Each success grants <strong>+6</strong> with that house and <strong>−2</strong> with its political rival.</p><small>Relations range from −100 to +100. Trusted begins at +25; Allied at +60. Disfavored begins at −25.</small></aside></div><div class="house-grid">${Object.entries(HOUSES).map(([id,h])=>{const r=relation(id),tier=relationTier(r);return `<article class="house-card ${relationClass(r)}" style="--house:${h.color}"><header><span>${h.icon}</span><div><h3>${h.name}</h3><small>${h.domain}</small></div><strong>${r>0?'+':''}${r}</strong></header><div class="relation-track"><i style="width:${Math.abs(r)}%;left:${r<0?50-Math.abs(r)/2:50}%"></i></div><p class="relation-label">${tier} · ${h.leader}</p><p>${h.summary}</p><dl><div><dt>At Trusted</dt><dd>${h.perk}</dd></div><div><dt>At Disfavored</dt><dd>${h.penalty}</dd></div></dl></article>`}).join('')}</div>${politicalState.history.length?`<section class="political-history"><h3>Recent changes</h3>${politicalState.history.slice(0,8).map(e=>`<div><span>${HOUSES[e.id]?.icon} ${HOUSES[e.id]?.name}</span><b class="${e.amount>=0?'gain':'loss'}">${e.amount>=0?'+':''}${e.amount}</b><small>${e.reason}</small></div>`).join('')}</section>`:''}`}
function ensurePoliticsTab(){const tabs=document.querySelector('#codex .codex-tabs');if(tabs&&!tabs.querySelector('[data-codex-tab="politics"]'))tabs.insertAdjacentHTML('beforeend','<button data-codex-tab="politics" onclick="codexTab(\'politics\')">Politics</button>')}
const oldRenderCodex=renderCodex;renderCodex=function(...args){const result=oldRenderCodex(...args);ensurePoliticsTab();const content=document.getElementById('codexContent');if(content&&!content.querySelector('[data-codex-panel="politics"]'))content.insertAdjacentHTML('beforeend',`<section data-codex-panel="politics" hidden>${houseCodexMarkup()}</section>`);return result};
if(typeof jobPool!=='undefined')for(const quest of HOUSE_QUESTS)if(!jobPool.some(j=>j.id===quest.id))jobPool.push(quest);
function ensureHousePosting(){if(jobs.some(j=>j.houseId))return;const choices=HOUSE_QUESTS.filter(q=>relation(q.houseId)>-60),pick=choices[Math.floor(Math.random()*choices.length)];if(pick)jobs[Math.floor(Math.random()*jobs.length)]={...pick}}
const oldRollJobBoard=rollJobBoard;rollJobBoard=function(...args){const result=oldRollJobBoard(...args);ensureHousePosting();saveJobBoard();return result};
function decorateHouseJobs(){document.querySelectorAll('#joblist .job').forEach((card,i)=>{const job=jobs[i];if(!job?.houseId)return;const house=HOUSES[job.houseId],r=relation(job.houseId),mods=politicalContractModifiers(job);card.classList.add('house-contract');card.style.setProperty('--house',house.color);card.querySelector('.jobicon')?.insertAdjacentHTML('afterend',`<div class="house-sponsor">${house.icon} Offered by ${house.name} · ${relationTier(r)} ${r>0?'+':''}${r}</div>`);const meta=card.querySelector('.jobmeta');if(meta)meta.insertAdjacentHTML('afterend',`<div class="house-preview"><span>Success: +6 ${house.name}</span><span>Rival: −2 ${HOUSES[house.rival].name}</span>${mods.goldRate!==1?`<span>Standing modifiers: ${Math.round((mods.goldRate-1)*100)>0?'+':''}${Math.round((mods.goldRate-1)*100)}% gold</span>`:''}</div>`)});document.querySelectorAll('#activeJobs .jobrow').forEach((row,i)=>{const job=activeJobs[i];if(job?.houseId)row.querySelector('strong')?.insertAdjacentHTML('afterend',` <span class="active-house">${HOUSES[job.houseId].icon} ${HOUSES[job.houseId].name}</span>`)})}
const oldRenderJobs=renderJobs;renderJobs=function(...args){const result=oldRenderJobs(...args);decorateHouseJobs();return result};
const oldConfirmJob=confirmJob;confirmJob=function(...args){const source=pendingJob?{...pendingJob}:null,before=new Set(activeJobs.map(j=>j.id)),result=oldConfirmJob(...args),created=activeJobs.find(j=>!before.has(j.id));if(created&&source){created.houseId=source.houseId||null;const m=politicalContractModifiers(created);created.gold=Math.max(1,Math.round(created.gold*m.goldRate));created.xp=Math.max(1,Math.round(created.xp*m.xpRate));const remaining=Math.max(1000,created.ends-Date.now()),adjusted=Math.round(remaining*m.timeRate);created.ends=Date.now()+adjusted;created.duration=adjusted;created.politicalRewards=m;save();renderJobs()}return result};
const oldClaimJob=claimJob;claimJob=function(id,...args){const job=activeJobs.find(j=>j.id===id),houseId=job?.houseId,mods=job?.politicalRewards||politicalContractModifiers(job||{}),result=oldClaimJob(id,...args);if(job&&houseId){const house=HOUSES[houseId];changeRelation(houseId,6,`Completed ${job.name}`);changeRelation(house.rival,-2,`Favored rival ${house.name}`);if(mods.renownBonus){renown+=mods.renownBonus;toast(`Political rewards: +${mods.renownBonus} bonus renown.`)}if(mods.scrap&&window.wayfarerGearState){window.wayfarerGearState.scrap=(window.wayfarerGearState.scrap||0)+mods.scrap;if(typeof gearPersist==='function')gearPersist()}if(mods.materials&&typeof apothecary!=='undefined'){apothecary.materials.herb=(apothecary.materials.herb||0)+mods.materials;if(typeof saveApothecary==='function')saveApothecary()}save();renderAll()}return result};
resetGame=function(){if(!window.confirm('Start a fresh guild? This clears your founder story, tutorial progress, character progress, gear, jobs, Codex records, and noble-house relations.'))return;['wayfarer-v1','wayfarer-build-v2','wayfarer-gear-v1','wayfarer-job-board-v2','wayfarer-codex-v1','wayfarer-jobs-v1','wayfarer-founder-v1','wayfarer-tour-v1',POLITICAL_KEY].forEach(k=>localStorage.removeItem(k));window.location.reload()};
ensureHousePosting();saveJobBoard();savePolitics();ensurePoliticsTab();
})();


/* ===== solaris-city.js ===== */
(function(){
'use strict';
function savedGuildName(){try{const record=JSON.parse(localStorage.getItem('wayfarer-founder-v1')||'null');return String(record?.guild||'').trim()||'Guild Hall'}catch{return'Guild Hall'}}
const CITY_LOCATIONS={
 guild:{name:savedGuildName(),district:'Southgate Ward',icon:'⚔',pos:[38,66],scene:0,summary:'Headquarters of your adventurer guild and home to its roster, retainers, contract board, and expedition stores.',services:['Manage the guild roster','Hire and assign retainers','Review stored materials and expedition loot','Expand the guild and recruit adventurers'],actions:[['Enter Guild Hall','guild']]},
 forge:{name:'Solaris Ironworks',district:'Forge Quarter',icon:'⚒',pos:[16,43],scene:1,summary:'An independent master forge serving guilds, guards, and private customers. Its smiths salvage unwanted equipment and craft dependable arms and armor.',services:['Salvage unwanted equipment','Craft common equipment','Improve gear through epic quality'],actions:[['Enter the Ironworks','forge']]},
 market:{name:'Grand Sunmarket',district:'Merchant Ward',icon:'◈',pos:[23,54],scene:2,summary:'Solaris’s largest public market. Coastal imports, mountain ironwork, farm goods, and adventuring equipment change hands beneath its bright awnings.',services:['Buy equipment scaled to guild rank','Sell items from the guild stash','Refresh available merchant stock'],actions:[['Browse the Sunmarket','market']]},
 church:{name:'Cathedral of the Dawn',district:'Radiant Ward',icon:'✦',pos:[72,24],scene:3,summary:'The principal church of Solaris offers sanctuary, healing, and counsel beneath an enormous stained-glass sun.',services:['Restore injured adventurers','Seek blessings and spiritual counsel','Future cleric and paladin story quests'],actions:[['Restore the party · 25 gold','heal']]},
 tavern:{name:'The Gilded Wayfarer',district:'Southgate Ward',icon:'♬',pos:[26,78],scene:4,summary:'A warm, crowded tavern favored by travelers, performers, and adventurers looking for work. Rumors arrive here before they reach the job board.',services:['Rest and restore the guild roster','Meet potential recruits','Future rumors and companion events'],actions:[['Rest the roster · 15 gold','rest'],['Look for recruits','recruit']]},
 palace:{name:'Sunspire Palace',district:'Crown Heights',icon:'♜',pos:[50,19],scene:5,summary:'Royal residence of King Edric IV and the ceremonial heart of Lumara. The palace overlooks the city from gardens surrounding the Plaza of the Sun.',services:['Review royal affairs','Track relations with the six houses','Future audiences and royal commissions'],actions:[['Review political affairs','politics']]},
 barracks:{name:'Solaris Crown Barracks',district:'Eastwall Ward',icon:'🛡',pos:[78,65],scene:6,summary:'The capital guard trains here and maintains Solaris’s walls, gates, and public order. Guild adventurers are sometimes invited to observe drills.',services:['Review adventurer records','Plan future training services','Future guard contracts and tournaments'],actions:[['Review characters','characters']]},
 apothecary:{name:'Verdant Measure Apothecary',district:'Canal Ward',icon:'⚗',pos:[55,65],scene:7,summary:'A respected independent supplier of herbs, reagents, and field medicine for Solaris adventurers.',services:['Buy potions, tonics, and alchemical bombs','Purchase medicinal herbs and magical reagents','Review the guild’s current supply stock'],actions:[['Browse apothecary stock','apothecary']]},
 academy:{name:'Solaris Grand Academy',district:'Scholar’s Rise',icon:'✧',pos:[77,43],scene:8,summary:'A combined library, academy, and observatory preserving the kingdom’s histories, magical studies, maps, and bestiaries.',services:['Study known classes and skills','Review discovered items and enemies','Consult expedition records'],actions:[['Open the Guild Codex','codex']]},
 council:{name:'Council of the Sun',district:'Crown Heights',icon:'☀',pos:[25,24],scene:5,summary:'The royal council coordinates law, commerce, defense, forestry, waterways, and the harvest alongside representatives of Lumara’s great houses.',services:['Review kingdom government','Inspect noble-house relations','Track political rewards and penalties'],actions:[['Open political records','politics']]}
};
let citySelected='guild';
const APOTHECARY_STOCK={
 potion:{kind:'item',name:'Healing Potion',desc:'Restores vigor to an injured ally during battle.',price:30},
 ether:{kind:'item',name:'Stamina Tonic',desc:'Restores stamina to an ally during battle.',price:38},
 bomb:{kind:'item',name:'Alchemical Bomb',desc:'A throwable magical attack for manual combat.',price:46},
 herb:{kind:'material',name:'Medicinal Herbs',desc:'Field medicine and restorative reagent.',price:7},
 mineral:{kind:'material',name:'Mineral Salts',desc:'Stable base for tonics and explosive mixtures.',price:9},
 essence:{kind:'material',name:'Spirit Essence',desc:'Concentrated magical reagent from old shrines.',price:14}
};
function apothecaryShopMarkup(){return `<div class="city-shop-heading"><div><small>VERDANT MEASURE STOCK</small><h3>Field Supplies &amp; Reagents</h3><p>Purchases are delivered directly to the Guild Storeroom.</p></div><b>${gold} GOLD</b></div><div class="city-apothecary-stock">${Object.entries(APOTHECARY_STOCK).map(([id,x])=>{const owned=x.kind==='item'?(apothecary.items[id]||0):(apothecary.materials[id]||0);return `<article><span>${x.kind==='item'?'⚗':'✦'}</span><div><h4>${x.name}</h4><p>${x.desc}</p><small>Owned: ${owned}</small></div><button class="button" onclick="buyCityApothecary('${id}')" ${gold<x.price?'disabled':''}>Buy · ${x.price}g</button></article>`}).join('')}</div>`}
window.buyCityApothecary=function(id){const stock=APOTHECARY_STOCK[id];if(!stock)return;if(gold<stock.price)return toast('Not enough gold.');gold-=stock.price;if(stock.kind==='item')apothecary.items[id]=(apothecary.items[id]||0)+1;else apothecary.materials[id]=(apothecary.materials[id]||0)+1;saveApothecary();save();renderResources();if(typeof renderStoreroom==='function')renderStoreroom();const shop=document.getElementById('cityApothecaryShop');if(shop)shop.innerHTML=apothecaryShopMarkup();toast(`${stock.name} delivered to the Guild Storeroom.`)};
function cityMarkup(){return `<section class="page city-page" id="solarisCity"><div class="city-heading"><div><small>CAPITAL OF LUMARA</small><h2>Solaris</h2><p>Select a landmark to visit its services, people, and records.</p></div><button class="button secondary" onclick="openWorldMap()">← World map</button></div><div class="city-layout"><div class="city-map"><img data-src="./assets/solaris-city-map-v1.webp" alt="Illustrated map of Solaris"><div class="city-pins">${Object.entries(CITY_LOCATIONS).map(([id,l])=>`<button class="city-pin" data-city-location="${id}" style="left:${l.pos[0]}%;top:${l.pos[1]}%" onclick="visitCityLocation('${id}')"><i>${l.icon}</i><span>${l.name}<small>${l.district}</small></span></button>`).join('')}</div><div class="city-map-key">☀ CROWN HEIGHTS · ⚔ GUILD SERVICES · ◈ PUBLIC BUSINESSES</div></div><aside class="city-summary" id="citySummary"></aside></div></section>`}
function renderCitySummary(){const l=CITY_LOCATIONS[citySelected],box=document.getElementById('citySummary');if(!box)return;document.querySelectorAll('.city-pin').forEach(x=>x.classList.toggle('selected',x.dataset.cityLocation===citySelected));box.innerHTML=`<div class="city-summary-icon">${l.icon}</div><small>${l.district}</small><h3>${l.name}</h3><p>${l.summary}</p><h4>Available here</h4><ul>${l.services.map(s=>`<li>${s}</li>`).join('')}</ul><button class="button" onclick="visitCityLocation('${citySelected}')">Visit location</button>`}
window.selectCityLocation=function(id){if(!CITY_LOCATIONS[id])return;citySelected=id;renderCitySummary()};
window.openSolarisMap=function(){const page=document.getElementById('solarisCity'),image=page?.querySelector('.city-map img');if(image&&!image.src)image.src=image.dataset.src;document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));page?.classList.add('active');document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='solarisCity'));document.getElementById('pageTitle').textContent='Solaris City Map';if(typeof syncRoomsDropdown==='function')syncRoomsDropdown();renderCitySummary();scrollTo({top:0,behavior:'smooth'})};
function showLocationPage(id){const l=CITY_LOCATIONS[id],page=document.getElementById('cityLocation');if(!l||!page)return;page.dataset.scene=l.scene;page.querySelector('.city-location-copy').innerHTML=`<small>${l.district.toUpperCase()}</small><h2>${l.icon} ${l.name}</h2><p>${l.summary}</p><div class="location-services"><b>SERVICES</b>${l.services.map(s=>`<span>${s}</span>`).join('')}</div><div class="location-actions">${l.actions.map(([label,action])=>`<button class="button" onclick="cityService('${action}')">${label}</button>`).join('')}<button class="button secondary" onclick="openSolarisMap()">← Return to Solaris map</button></div>`;document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));page.classList.add('active');document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));document.getElementById('pageTitle').textContent=l.name;if(typeof syncRoomsDropdown==='function')syncRoomsDropdown();scrollTo({top:0,behavior:'smooth'})}
function openGuildHallFromCity(){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('home')?.classList.add('active');document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='home'));document.getElementById('pageTitle').textContent='Guild Hall';if(typeof syncRoomsDropdown==='function')syncRoomsDropdown();scrollTo({top:0,behavior:'auto'})}
function persistCityServiceChanges(){if(typeof persistBuild==='function')persistBuild();else if(typeof save==='function')save();if(window.wayfarerGearState&&typeof gearPersist==='function')gearPersist()}
function refreshCityServiceDisplay(){const goldNode=document.getElementById('gold');if(goldNode)goldNode.textContent=gold;for(const rootId of ['roster','characterRoster']){document.querySelectorAll(`#${rootId} .hero`).forEach((card,index)=>{const hero=heroes[index],vigor=card.querySelector('.hero-roster-stats span');if(hero&&vigor)vigor.textContent=`Vigor ${hero.hp}/${hero.maxHp}`})}}
window.visitCityLocation=function(id){if(id==='guild'){openGuildHallFromCity();return}if(['forge','market'].includes(id)){showGuildPage(id);return}citySelected=id;showLocationPage(id)};
window.cityService=function(action){if(action==='guild'){openGuildHallFromCity();return}if(action==='forge'||action==='market'){showGuildPage(action);return}if(action==='heal'){if(gold<25)return toast('The cathedral requests a 25 gold offering.');gold-=25;for(const h of heroes){if(h.hp>0)h.hp=typeof gearEffectiveMaxHp==='function'?gearEffectiveMaxHp(h):h.maxHp}persistCityServiceChanges();refreshCityServiceDisplay();toast('The cathedral healers restore every standing adventurer.');return}if(action==='rest'){if(gold<15)return toast('A full guild meal and rest costs 15 gold.');gold-=15;for(const h of heroes)h.hp=typeof gearEffectiveMaxHp==='function'?gearEffectiveMaxHp(h):h.maxHp;persistCityServiceChanges();refreshCityServiceDisplay();toast('The roster rests at the Gilded Wayfarer.');return}if(action==='recruit'){openGuildHallFromCity();setTimeout(()=>{showRecruits();document.getElementById('guildExpansionPanel')?.scrollIntoView({block:'start'})},0);return}if(action==='characters'){showCharactersPage();return}if(action==='codex'){showCodexPage();return}if(action==='politics'){showCodexPage();setTimeout(()=>codexTab('politics'),0);return}if(action==='apothecary'){citySelected='apothecary';showLocationPage('apothecary');setTimeout(()=>{document.getElementById('apothecaryWorkshop')?.remove();const shop=document.createElement('section');shop.id='cityApothecaryShop';shop.className='city-apothecary-shop';shop.innerHTML=apothecaryShopMarkup();document.querySelector('#cityLocation .city-location-copy')?.append(shop);shop.scrollIntoView({behavior:'smooth',block:'start'})},0)}};
function installCity(){const main=document.querySelector('main.main'),nav=document.querySelector('.nav');if(!main||document.getElementById('solarisCity'))return;main.insertAdjacentHTML('beforeend',cityMarkup()+`<section class="page city-location-page" id="cityLocation" data-scene="0"><div class="city-location-art"><div class="city-location-copy"></div></div></section>`);const button=document.createElement('button');button.dataset.page='solarisCity';button.innerHTML='<span>☀</span> Solaris';button.onclick=openSolarisMap;const world=nav.querySelector('[data-page="world"]');world?.after(button);renderCitySummary();document.querySelector('.guild-tools')?.remove();for(const [id,title]of [['forge','Solaris Ironworks'],['market','Grand Sunmarket']]){const page=document.getElementById(id);if(!page)continue;page.classList.add('city-business-page');page.dataset.scene=id==='forge'?1:2;const h=page.querySelector('.welcome h2');if(h)h.textContent=title;const p=page.querySelector('.welcome p');if(p)p.textContent=id==='forge'?'Independent smiths salvage, craft, and improve equipment for Solaris adventurers.':'Browse independent merchants whose stock reflects guild rank and the classes in your roster.';page.insertAdjacentHTML('afterbegin','<button class="city-back-button" onclick="openSolarisMap()">← Solaris map</button>')}}
function applyTavernRecoveryCredit(){const key='wayfarer-tavern-recovery-v1';if(localStorage.getItem(key)||!localStorage.getItem('wayfarer-build-v2'))return;localStorage.setItem(key,'1');gold+=30;if(typeof persistBuild==='function')persistBuild()}
applyTavernRecoveryCredit();
installCity();
const priorWorldTravel=window.worldTravel;window.worldTravel=function(id){if(id==='solaris'){openSolarisMap();return}return priorWorldTravel(id)};
const priorShowGuildPage=showGuildPage;showGuildPage=function(id,...args){const result=priorShowGuildPage(id,...args);if(id==='forge'||id==='market'){document.getElementById('pageTitle').textContent=id==='forge'?'Solaris Ironworks':'Grand Sunmarket';document.getElementById(id)?.classList.add('city-business-page')}return result};
})();


/* ===== faction-politics.js ===== */
(function () {
'use strict';
const KEY='wayfarer-politics-v1';
const FACTIONS={
 solarius:{name:'The Royal House of Solarius',short:'Royal House',icon:'☀',kind:'Crown',color:'#e4b94d',seat:'Sunspire Palace, Solaris',leader:'King Edric IV',founded:'At the unification of Lumara',motto:'One realm beneath the sun.',summary:'The ruling dynasty maintains the roads, courts, army, and uneasy balance between Lumara’s great houses. Its authority is broad, though never completely free of noble negotiation.',history:['Aldren Solarius united the heartland and established Solaris as the capital.','The Council of the Sun was created to bind the crown and six great houses into one government.','Recent reforms have widened access to royal courts while angering traditional nobles.'],facts:['Controls royal charters and crown contracts','Commands the standing army and capital guard','Depends on the six houses for regional administration'],perk:'Trusted: Crown contracts grant +1 bonus renown.',penalty:'Disfavored: Royal scrutiny reduces contract gold by 5%.'},
 luminous_church:{name:'The Church of the Dawn',short:'Church of the Dawn',icon:'✦',kind:'Faith',color:'#e7cf7b',seat:'Cathedral of the Dawn, Solaris',leader:'Archcanon Belis Ardent',founded:'Early Solarian era',motto:'Carry light where fear gathers.',summary:'Lumara’s largest faith tends shrines, hospitals, orphanages, and burial grounds. The Church teaches that power creates a duty to protect, but its wealth and influence have produced competing reformist and traditional wings.',history:['Dawnrest Monastery preserved healing lore during the wars of unification.','The first monarch granted the Church authority over sanctified burial and dangerous undead remains.','A recent debate over noble tithes has divided senior clergy from parish priests.'],facts:['Operates hospitals and sanctuaries across Lumara','Certifies clerics and holy relics','Investigates undead activity and corrupted sacred sites'],perk:'Trusted: Healing supplies cost 10% less and recovery services are improved.',penalty:'Disfavored: Church services and sanctified supplies cost 15% more.'},
 arcane_conclave:{name:'The Conclave of Mages',short:'Arcane Conclave',icon:'✧',kind:'Arcane authority',color:'#9986d9',seat:'The Celestial Athenaeum, Solaris',leader:'First Magister Seraphine Voss',founded:'After the Glassfire Catastrophe',motto:'Power measured. Knowledge preserved.',summary:'An officially apolitical body created to govern dangerous magic. The Conclave licenses high-circle practitioners, secures volatile relics, investigates magical disasters, and can restrict spellcasters judged to be a public risk.',history:['The Glassfire Catastrophe destroyed three city wards and proved that noble patronage could not safely regulate powerful mages.','The Crown and Church jointly chartered an independent Conclave with authority over magical licensing.','Its neutrality is respected publicly and questioned privately whenever a powerful family faces sanction.'],facts:['Maintains the registry of high-powered magic users','Controls sealed archives and hazardous relic vaults','Fields neutral arbiters known as the Grey Mantles'],perk:'Trusted: Arcane items appear more often in shops and magical research costs 10% less.',penalty:'Disfavored: Restricted licensing raises magical service costs and limits rare spell stock.'},
 veyrath:{name:'House Veyrath',short:'House Veyrath',icon:'⚒',kind:'Great house',color:'#b86f4b',seat:'Ironhold',leader:'Duke Garrick Veyrath',founded:'Before unification',motto:'From stone, strength.',summary:'Veyrath controls the volcanic northeast, its mines, foundries, and much of the kingdom’s military industry.',history:['Veyrath forges armed both sides before the kingdom was unified.','The house accepted Solarian rule in exchange for control of the royal armories.'],facts:['Controls iron, rare ore, and military foundries','Maintains the strongest private defensive force'],perk:'Trusted: Noble contracts can award additional salvage.',penalty:'Disfavored: Closed suppliers reduce contract rewards.'},
 thornmere:{name:'House Thornmere',short:'House Thornmere',icon:'❧',kind:'Great house',color:'#5c9c67',seat:'Greenwatch',leader:'Duchess Evelyne Thornmere',founded:'Before unification',motto:'What grows must endure.',summary:'Thornmere protects the Elderwood, its settlements, and old customs that predate the crown.',history:['The Elderwood compact ended generations of conflict between foresters and old woodland circles.','Thornmere joined Lumara after receiving permanent stewardship of the western forests.'],facts:['Controls timber and western roads','Sponsors rangers and wardens'],perk:'Trusted: Job-board experience rewards increase.',penalty:'Disfavored: Woodland travel and contracts take longer.'},
 duskmere:{name:'House Duskmere',short:'House Duskmere',icon:'♒',kind:'Great house',color:'#688f91',seat:'Mistwatch',leader:'Duke Malrec Duskmere',founded:'Before unification',motto:'The deep water remembers.',summary:'Duskmere governs the Mirelands through local alliances, waterway tolls, and knowledge outsiders rarely possess.',history:['Mireland clans selected the first Duskmere duke as their speaker to the crown.','Repeated attempts at central drainage projects hardened regional resistance.'],facts:['Controls southeastern waterways','Produces rare medicines and alchemical materials'],perk:'Trusted: Contracts can award additional reagents.',penalty:'Disfavored: Mireland tolls lengthen contracts.'},
 valcrest:{name:'House Valcrest',short:'House Valcrest',icon:'♜',kind:'Great house',color:'#b3924f',seat:'Goldhaven Estate',leader:'Duke Alistair Valcrest',founded:'Early Solarian era',motto:'Order feeds the realm.',summary:'Valcrest’s estates and tenant farms supply most of the grain consumed by Solaris and the royal army.',history:['The crown elevated Valcrest after its granaries sustained Solaris through a decade of poor harvests.','Modern labor reforms have strained relations between the house and rural workers.'],facts:['Controls grain reserves and irrigation networks','Holds extensive influence over rural courts'],perk:'Trusted: Provisioned crews finish contracts faster.',penalty:'Disfavored: Withheld provisions delay contracts.'},
 marivelle:{name:'House Marivelle',short:'House Marivelle',icon:'⚓',kind:'Great house',color:'#5d85aa',seat:'Seabright',leader:'Duchess Adriana Marivelle',founded:'Early Solarian era',motto:'Every horizon is a road.',summary:'Marivelle commands the coast, merchant fleet, foreign trade, and the customs offices that make that trade profitable.',history:['Marivelle navigators opened the western sea lanes.','The house purchased its first council seat before being elevated into the nobility.'],facts:['Controls major ports and customs houses','Maintains contacts beyond Lumara'],perk:'Trusted: Trade connections increase job-board gold.',penalty:'Disfavored: Tariffs reduce job-board gold.'},
 gilded_compact:{name:'The Gilded Compact',short:'Merchant Compact',icon:'◇',kind:'Commercial power',color:'#c39b58',seat:'Grand Sunmarket, Solaris',leader:'Factor-General Ilyra Quill',founded:'Two centuries ago',motto:'Trust is the first currency.',summary:'A league of caravan masters, bankers, craftspeople, and market factors that standardizes trade across the kingdom.',history:['The Compact introduced reliable weights and letters of credit.','It survived three royal investigations by proving the crown depended on its ledgers.'],facts:['Controls major trade credit and bonded warehouses','Influences market stock and regional prices'],perk:'Trusted: Market prices improve by 8%.',penalty:'Disfavored: Market purchases cost 10% more.'},
 free_companies:{name:'The Assembly of Free Companies',short:'Free Companies',icon:'⚔',kind:'Adventurer network',color:'#bb795e',seat:'The Gilded Wayfarer, Solaris',leader:'Speaker Joren Hale',founded:'After the Barrow March',motto:'No blade stands alone.',summary:'A loose association of adventurer guilds, caravan guards, monster hunters, and independent companies that negotiates fair contracts and burial rights.',history:['The Assembly formed after dozens of hired companies were abandoned during the Barrow March.','Its common charter inspired many modern adventurer guilds.'],facts:['Shares threat reports between member guilds','Arbitrates disputes over contracts and salvage'],perk:'Trusted: Recruitment and expedition information improve.',penalty:'Disfavored: Rival companies withhold useful field intelligence.'},
 verdant_covenant:{name:'The Verdant Covenant',short:'Verdant Covenant',icon:'☘',kind:'Old-world custodians',color:'#64a978',seat:'Hidden circles throughout the Elderwood',leader:'The Seasonal Circle',founded:'Unknown',motto:'Nothing living stands alone.',summary:'Druids, hedge healers, and ancient wardens who protect natural sites that neither crown nor noble house fully understands.',history:['Covenant records describe the Elderwood before any current noble line.','Its circles helped contain the first Mosslight bloom.'],facts:['Guards primal wells and sealed groves','Possesses rare knowledge of beasts and natural magic'],perk:'Trusted: Herbal gathering and nature magic gain improved yields.',penalty:'Disfavored: Rare herbs and druidic services become scarce.'},
 gloam_court:{name:'The Gloam Court',short:'Gloam Court',icon:'♠',kind:'Underworld',color:'#8c6a9e',seat:'Unknown · active in Solaris',leader:'The Veiled Regent',founded:'Unknown',motto:'Every secret has a shadow.',summary:'A refined criminal network trading in secrets, blackmail, forged identities, and discreet theft. Its members imitate noble ceremony and never reveal the Regent’s identity.',history:['The name first appeared in court records after a sealed succession document vanished.','Several supposed leaders have been exposed, all later proven to be decoys.'],facts:['Specializes in information and infiltration','Maintains agents in noble households'],perk:'Trusted: Black-market intelligence reveals hidden opportunities.',penalty:'Disfavored: Guild secrets can be sold to political rivals.'},
 ashen_ledger:{name:'The Ashen Ledger',short:'Ashen Ledger',icon:'▧',kind:'Underworld',color:'#a26050',seat:'Cinderfall and the mountain roads',leader:'Bookkeeper Nine',founded:'During the Iron Famine',motto:'Every debt leaves a mark.',summary:'Smugglers and illicit quartermasters who move ore, weapons, relic fragments, and restricted alchemical goods through coded debts.',history:['The Ledger began by feeding mining families during a crown embargo.','It later expanded into contraband arms and relic trafficking.'],facts:['Controls mountain smuggling routes','Uses debt marks instead of names'],perk:'Trusted: Rare crafting materials sometimes appear through illicit suppliers.',penalty:'Disfavored: Salvage shipments face theft and interference.'},
 blackwake:{name:'The Blackwake Syndicate',short:'Blackwake Syndicate',icon:'☠',kind:'Underworld',color:'#477f8c',seat:'The western coast and hidden coves',leader:'Captain Veyra Sable',founded:'Within living memory',motto:'The sea keeps no chains.',summary:'Pirates, wreckers, dock thieves, and smugglers bound by profit and resistance to Marivelle customs law.',history:['Blackwake grew from privateers dismissed after a brief foreign conflict.','Its captains now feud over whether to remain smugglers or become an open revolutionary fleet.'],facts:['Controls hidden coastal routes','Deals in foreign goods and stolen cargo'],perk:'Trusted: Foreign and ranged equipment can appear in covert trade.',penalty:'Disfavored: Coastal shipments risk reduced rewards.'}
};
let selected='overview';
const FACTION_ORDER=['solarius','luminous_church','arcane_conclave','veyrath','thornmere','duskmere','valcrest','marivelle','gilded_compact','free_companies','verdant_covenant','gloam_court','ashen_ledger','blackwake','future_compass','future_shield'];
function spritePosition(index){const x=index%4,y=Math.floor(index/4);return `${x/3*100}% ${y/3*100}%`}
function factionArt(id,size=''){const index=Math.max(0,FACTION_ORDER.indexOf(id));const label=FACTIONS[id]?.short||'Faction';return `<span class="faction-art ${size}" style="background-position:${spritePosition(index)}" role="img" aria-label="${label} emblem"></span>`}
function state(){let value;try{value=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}value=value&&typeof value==='object'?value:{relations:{},history:[]};value.relations=value.relations||{};value.history=Array.isArray(value.history)?value.history:[];for(const id of Object.keys(FACTIONS))if(!Number.isFinite(value.relations[id]))value.relations[id]=0;localStorage.setItem(KEY,JSON.stringify(value));return value}
function rep(id){return state().relations[id]||0}
function tier(value){return value>=60?'Allied':value>=25?'Trusted':value>=10?'Favored':value<=-60?'Hostile':value<=-25?'Disfavored':value<=-10?'Wary':'Neutral'}
function signed(value){return `${value>0?'+':''}${value}`}
function track(value){const marker=Math.max(0,Math.min(100,(value+100)/2));return `<div class="faction-track"><i style="left:${marker}%"></i></div>`}
function factionButton(id,f){return `<button class="faction-index-card ${selected===id?'selected':''}" style="--faction:${f.color}" onclick="showFactionPage('${id}')">${factionArt(id,'medium')}<div><b>${f.short}</b><small>${f.kind}</small></div><strong>${signed(rep(id))}</strong></button>`}
function overview(){const groups={Crown:[],Faith:[],'Arcane authority':[],'Great house':[],Other:[],Underworld:[]};for(const [id,f] of Object.entries(FACTIONS)){const group=groups[f.kind]||((f.kind==='Commercial power'||f.kind==='Adventurer network'||f.kind==='Old-world custodians')?groups.Other:groups.Underworld);group.push([id,f])}return `<section class="faction-intro"><div><small>POLITICAL POWERS OF</small><h2>Lumara</h2><p>The guild’s choices shape how institutions, noble houses, and hidden powers respond. Reputation ranges from −100 to +100. Dedicated records show the benefits and risks of every relationship.</p></div><aside><b>Standing thresholds</b><span>Favored +10 · Trusted +25 · Allied +60</span><span>Wary −10 · Disfavored −25 · Hostile −60</span></aside></section>${Object.entries(groups).filter(([,list])=>list.length).map(([name,list])=>`<section class="faction-group"><h3>${name==='Other'?'Independent powers':name}</h3><div class="faction-index">${list.map(([id,f])=>factionButton(id,f)).join('')}</div></section>`).join('')}`}
function page(id){const f=FACTIONS[id]||FACTIONS.solarius,value=rep(id),s=state();const history=s.history.filter(entry=>entry.id===id).slice(0,8);return `<button class="faction-back" onclick="showFactionPage('overview')">← All political powers</button><article class="faction-page" style="--faction:${f.color}"><header>${factionArt(id,'large')}<div><small>${f.kind.toUpperCase()}</small><h2>${f.name}</h2><p>${f.motto}</p></div><strong>${signed(value)}<small>${tier(value)}</small></strong></header>${track(value)}<div class="faction-page-grid"><section><h3>Overview</h3><p>${f.summary}</p><dl><div><dt>Seat</dt><dd>${f.seat}</dd></div><div><dt>Leader</dt><dd>${f.leader}</dd></div><div><dt>Founded</dt><dd>${f.founded}</dd></div></dl></section><section><h3>Known facts</h3><ul>${f.facts.map(x=>`<li>${x}</li>`).join('')}</ul></section><section><h3>History</h3>${f.history.map(x=>`<p class="faction-history-note">${x}</p>`).join('')}</section><section><h3>Guild relationship</h3><div class="faction-effect positive"><b>${f.perk.split(':')[0]}</b><span>${f.perk.split(':').slice(1).join(':')}</span></div><div class="faction-effect negative"><b>${f.penalty.split(':')[0]}</b><span>${f.penalty.split(':').slice(1).join(':')}</span></div></section></div>${history.length?`<footer><h3>Recent reputation changes</h3>${history.map(x=>`<div><b class="${x.amount>=0?'gain':'loss'}">${signed(x.amount)}</b><span>${x.reason}</span><small>${x.date||''}</small></div>`).join('')}</footer>`:''}</article>`}
function render(){const panel=document.querySelector('[data-codex-panel="politics"]');if(!panel)return;panel.innerHTML=`<div class="faction-politics">${selected==='overview'?overview():page(selected)}</div>`}
window.showFactionPage=function(id){selected=id==='overview'||FACTIONS[id]?id:'overview';render();document.getElementById('codexContent')?.scrollTo({top:0,behavior:'smooth'})};
window.changeFactionReputation=function(id,amount,reason='Guild action'){if(!FACTIONS[id]||!Number.isFinite(Number(amount)))return 0;const s=state(),before=s.relations[id]||0,after=Math.max(-100,Math.min(100,before+Number(amount)));s.relations[id]=after;s.history.unshift({id,amount:after-before,reason,date:new Date().toLocaleDateString()});s.history=s.history.slice(0,60);localStorage.setItem(KEY,JSON.stringify(s));render();return after};
window.WAYFARER_FACTIONS=Object.freeze(FACTIONS);
window.factionArt=factionArt;
const oldRender=window.renderCodex;window.renderCodex=function(...args){const result=oldRender.apply(this,args);state();render();return result};
state();render();
})();


/* ===== runtime-stability.js ===== */
(function(){
'use strict';
// Keep timers live without rebuilding the decorated job board every second. The
// board is wrapped by several feature modules, so repeated full renders can
// saturate slower embedded browsers.
if(jobTimer!==null){clearInterval(jobTimer);jobTimer=null}
let lastCompletionSignature='';
tick=function(){
 const now=Date.now();
 for(const job of activeJobs)if(now>=job.ends)job.done=true;
 const signature=activeJobs.map(job=>`${job.id}:${job.done?1:0}`).join('|');
 const jobsVisible=document.getElementById('jobs')?.classList.contains('active');
 const completionChanged=signature!==lastCompletionSignature;
 const boardExpired=jobsVisible&&typeof boardNextRefresh==='number'&&now>=boardNextRefresh;
 if(completionChanged||boardExpired){
  lastCompletionSignature=signature;
  save();
  if(jobsVisible)renderJobs();
  else renderResources();
 }else if(jobsVisible){
  const left=Math.max(0,(typeof boardNextRefresh==='number'?boardNextRefresh:now)-now);
  const status=document.getElementById('jobBoardStatus');
  if(status)status.innerHTML=`<span>Next board refresh in <b>${Math.floor(left/60000)}:${String(Math.floor(left%60000/1000)).padStart(2,'0')}</b></span><small>New postings arrive every five minutes</small>`;
  document.querySelectorAll('#activeJobs .jobrow').forEach((row,index)=>{
   const job=activeJobs[index];
   if(!job)return;
   const small=row.querySelector('small'),bar=row.querySelector('.progress i');
   const who=job.heroIds.map(id=>heroes.find(h=>h.id===id)?.name.split(' ')[0]).filter(Boolean).join(', ');
   const remaining=Math.max(1,Math.ceil((job.ends-now)/1000));
   if(small)small.textContent=`${who} · ${job.done?'Complete! Collect your reward':'Finishes in '+remaining+' sec'}`;
   if(bar)bar.style.width=`${job.done?100:Math.max(0,Math.min(100,(1-(job.ends-now)/job.duration)*100))}%`;
  });
 }
 const clock=document.getElementById('clock');
 if(clock)clock.textContent=activeJobs.length?activeJobs.filter(job=>!job.done).length+' working':'Ready';
 const active=document.getElementById('activeCount');
 if(active)active.textContent=heroes.filter(h=>h.staff||activeJobs.some(job=>job.heroIds.includes(h.id))).length;
};
jobTimer=setInterval(()=>tick(),1000);
})();


/* ===== public-alpha.js ===== */
(function () {
  'use strict';

  const RELEASE = Object.freeze({
    name: 'Wayfarer Guild',
  version: '0.9.0-alpha',
    saveFormat: 1
  });
  const SAVE_PREFIXES = ['wayfarer-', 'guild-sfx'];
  const BACKUP_KEY = 'wayfarer-save-backup-v1';

  function isGameKey(key) {
    return key !== BACKUP_KEY && SAVE_PREFIXES.some(prefix => key.startsWith(prefix));
  }

  function collectSave() {
    const storage = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && isGameKey(key)) storage[key] = localStorage.getItem(key);
    }
    return {
      game: RELEASE.name,
      version: RELEASE.version,
      saveFormat: RELEASE.saveFormat,
      exportedAt: new Date().toISOString(),
      storage
    };
  }

  function download(name, contents) {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  window.exportWayfarerSave = function () {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`wayfarer-guild-save-${stamp}.json`, JSON.stringify(collectSave(), null, 2));
    if (typeof toast === 'function') toast('Save exported. Keep this file as a backup.');
  };

  window.chooseWayfarerSave = function () {
    document.getElementById('wayfarerSaveInput')?.click();
  };

  async function importSave(file) {
    const parsed = JSON.parse(await file.text());
    if (parsed?.game !== RELEASE.name || !parsed.storage || typeof parsed.storage !== 'object') {
      throw new Error('This is not a Wayfarer Guild save file.');
    }
    const entries = Object.entries(parsed.storage).filter(([key, value]) => isGameKey(key) && typeof value === 'string');
    if (!entries.length) throw new Error('The save file does not contain game progress.');
    localStorage.setItem(BACKUP_KEY, JSON.stringify(collectSave()));
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && isGameKey(key)) localStorage.removeItem(key);
    }
    for (const [key, value] of entries) localStorage.setItem(key, value);
    window.location.reload();
  }

  window.restoreWayfarerBackup = function () {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return typeof toast === 'function' && toast('No import backup is available.');
    const parsed = JSON.parse(backup);
    for (const [key, value] of Object.entries(parsed.storage || {})) {
      if (isGameKey(key) && typeof value === 'string') localStorage.setItem(key, value);
    }
    window.location.reload();
  };

  function installReleaseTools() {
    document.title = `${RELEASE.name} — Public Alpha`;
    const versionText = document.querySelector('.side-bottom');
    if (versionText) {
      versionText.innerHTML = `AUTUMN, YEAR 01<br><strong>“Fortune favors the prepared.”</strong><br><br><span class="release-version">Public Alpha · v${RELEASE.version}</span>`;
      const tools = document.createElement('section');
      tools.className = 'release-tools';
      tools.innerHTML = `
        <b>YOUR SAVE</b>
        <button onclick="exportWayfarerSave()">⇩ Export backup</button>
        <button onclick="chooseWayfarerSave()">⇧ Import save</button>
        <button class="restore-save" onclick="restoreWayfarerBackup()">↶ Restore last import backup</button>
        <input id="wayfarerSaveInput" type="file" accept="application/json,.json" hidden>
        <button class="reset-game" type="button" onclick="resetGame()">↻ Reset game</button>
      `;
      versionText.append(tools);
      document.getElementById('wayfarerSaveInput').addEventListener('change', async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          await importSave(file);
        } catch (error) {
          if (typeof toast === 'function') toast(error.message || 'That save could not be imported.');
          event.target.value = '';
        }
      });
    }
    const loader = document.getElementById('appLoader');
    if (loader) {
      loader.classList.add('complete');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  }

  window.addEventListener('error', event => {
    try {
      sessionStorage.setItem('wayfarer-last-error', JSON.stringify({
        time: new Date().toISOString(),
        message: event.message,
        source: event.filename?.split('/').pop() || '',
        line: event.lineno || 0
      }));
    } catch (_) {}
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  window.WAYFARER_RELEASE = RELEASE;
  installReleaseTools();
})();
