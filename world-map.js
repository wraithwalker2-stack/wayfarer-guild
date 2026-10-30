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

