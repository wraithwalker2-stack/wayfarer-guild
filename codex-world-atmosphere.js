(function(){
'use strict';
const labels={classes:['ADVENTURER ARCHIVES','Jobs and disciplines'],items:['GUILD COLLECTION','Discovered equipment'],runs:['EXPEDITION LEDGER','Recorded dungeon runs'],bestiary:['FIELD NATURALIST’S RECORD','Creatures and enemies'],politics:['POWERS OF LUMARA','Houses and factions'],signs:['THE CELESTIAL WHEEL','Lumaran star signs'],locations:['ATLAS OF LUMARA','Known places and roads'],events:['THE KINGDOM’S MEMORY','Major events'],people:['DRAMATIS PERSONAE','Important people']};
function decorate(tab){const codex=document.getElementById('codex'),content=document.getElementById('codexContent');if(!codex||!content)return;const selected=tab||document.querySelector('#codex [data-codex-tab].selected')?.dataset.codexTab||'classes';codex.dataset.codexScene=selected;let head=content.querySelector('.codex-head-scene');if(!head){head=document.createElement('header');head.className='codex-head-scene';content.prepend(head)}const copy=labels[selected]||labels.classes;head.innerHTML=`<div><small>${copy[0]}</small><h2>${copy[1]}</h2></div>`}
const previousCodexTab=window.codexTab;window.codexTab=function(tab,...args){const result=previousCodexTab.apply(this,[tab,...args]);decorate(tab);return result};
const previousRenderCodex=window.renderCodex;window.renderCodex=function(...args){const result=previousRenderCodex.apply(this,args);decorate();return result};
const previousRoute=window.renderRoute;document.addEventListener('click',event=>{const pin=event.target.closest?.('.map-location');if(pin)setTimeout(()=>{const card=document.getElementById('routeCard');if(card)card.dataset.location=pin.dataset.location||'solaris'},0)});
const routeCard=document.getElementById('routeCard');if(routeCard)routeCard.dataset.location=document.querySelector('.map-location.selected')?.dataset.location||'solaris';decorate();
})();

