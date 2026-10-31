(function(){
'use strict';
const LOCATION_KEY='wayfarer-map-location-v1';
function progress(){try{const raw=JSON.parse(localStorage.getItem('wayfarer-contracts-v1')||'null');return Array.isArray(raw?.completed)?raw.completed.length:0}catch{return 0}}
function guildHallActive(){return document.getElementById('home')?.classList.contains('active')}
function syncGuildOperations(){const panel=document.getElementById('guildRoomsDropdown');if(panel)panel.hidden=!guildHallActive()}
function routeNeeded(id){return id==='mosslight'?2:id==='ashen'?3:id==='sepulcher'?4:0}
function routeUnlocked(id){return progress()>=routeNeeded(id)}
function syncRoutes(){document.querySelectorAll('.map-location[data-location]').forEach(pin=>{const id=pin.dataset.location,hidden=id!=='solaris'&&!routeUnlocked(id);pin.classList.toggle('route-hidden',hidden);pin.setAttribute('aria-hidden',hidden?'true':'false')});const expedition=document.querySelector('.nav button[data-page="dungeon"]');if(expedition)expedition.hidden=progress()<2;const count=document.querySelector('.world-scale strong');if(count)count.textContent=String(1+['mosslight','ashen','sepulcher'].filter(routeUnlocked).length)}
function stage(){return document.querySelector('.map-stage')||document.querySelector('.continent-canvas')}
function currentLocation(){return localStorage.getItem(LOCATION_KEY)||'solaris'}
function markerTarget(id){return document.querySelector(`[data-location="${id}"]`)||document.querySelector(`[data-new-place="${id}"]`)}
function moveMarker(id,notify=true){const target=markerTarget(id),map=stage();if(!target||!map)return;let marker=map.querySelector('.map-player-location');if(!marker){marker=document.createElement('div');marker.className='map-player-location';marker.innerHTML='♙';map.append(marker)}marker.style.left=target.style.left;marker.style.top=target.style.top;localStorage.setItem(LOCATION_KEY,id);if(notify){const label=target.querySelector('span')?.childNodes?.[0]?.textContent?.trim()||id;window.toast?.(`Party location: ${label}`)}document.querySelectorAll('.mapped-location,.map-location').forEach(node=>node.classList.toggle('party-here',node===target))}
function installMapTravel(){const map=stage();if(!map||map.dataset.partyTravelInstalled)return;map.dataset.partyTravelInstalled='1';syncRoutes();moveMarker(currentLocation(),false);const solaris=map.querySelector('[data-location="solaris"]');if(solaris)solaris.onclick=()=>{moveMarker('solaris');const card=document.getElementById('routeCard');if(card)card.insertAdjacentHTML('afterbegin','<div class="location-arrival">Your party is in Solaris. Use the location button below to enter the capital.</div>')};map.querySelectorAll('[data-location]').forEach(pin=>{if(pin.dataset.location==='solaris')return;const prior=pin.onclick;pin.onclick=e=>{const id=pin.dataset.location;if(!routeUnlocked(id))return;moveMarker(id);if(typeof prior==='function')prior.call(pin,e)}});map.querySelectorAll('[data-new-place]').forEach(pin=>pin.onclick=()=>moveMarker(pin.dataset.newPlace))}
const previousOpen=window.openWorldMap;window.openWorldMap=function(...args){const result=previousOpen?.apply(this,args);syncGuildOperations();syncRoutes();installMapTravel();moveMarker(currentLocation(),false);return result};
document.addEventListener('click',()=>setTimeout(()=>{syncGuildOperations();syncRoutes()},0));
syncGuildOperations();syncRoutes();installMapTravel();
})();

