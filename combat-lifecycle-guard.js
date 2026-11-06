/* Final combat lifecycle owner: keeps a living battle, its page, and its viewport in sync. */
(function(){
'use strict';
if(window.WayfarerCombatLifecycle)return;
const VERSION='1.0.0';
let enforcing=false,recoverQueued=false,lastBattle=null;
function state(){return typeof runState!=='undefined'?runState:window.runState||null}
function battle(){return state()?.battle||null}
function activateDungeon(){
 const page=document.getElementById('dungeon');if(!page)return;
 document.querySelectorAll('.page').forEach(node=>node.classList.toggle('active',node===page));
 document.querySelectorAll('.nav button[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page==='dungeon'));
 const title=document.getElementById('pageTitle');if(title)title.textContent='Expeditions';
 document.getElementById('run')?.classList.add('show');
}
function lockParty(r){
 document.querySelectorAll('#team input,#expeditionPrep button[onclick*="startRun"],#expeditionPrep button[onclick*="journey"]').forEach(control=>{
  if(!control.dataset.combatGuardPrevious)control.dataset.combatGuardPrevious=control.disabled?'disabled':'enabled';
  control.disabled=true;
 });
 document.getElementById('team')?.setAttribute('aria-disabled','true');
 if(r)document.getElementById('team')?.setAttribute('inert','');
}
function unlockParty(){
 document.querySelectorAll('[data-combat-guard-previous]').forEach(control=>{
  control.disabled=control.dataset.combatGuardPrevious==='disabled';delete control.dataset.combatGuardPrevious;
 });
 const team=document.getElementById('team');team?.removeAttribute('aria-disabled');team?.removeAttribute('inert');
}
function releaseViewport(){
 document.body.classList.remove('combat-immersive');document.documentElement.classList.remove('combat-immersive');
 document.querySelectorAll('#battlePanel.combat-immersive-panel').forEach(panel=>panel.classList.remove('combat-immersive-panel'));
}
function queueRecovery(r,b){
 if(recoverQueued||!r||!b||document.getElementById('battlePanel'))return;
 recoverQueued=true;queueMicrotask(()=>{recoverQueued=false;if(state()!==r||battle()!==b||document.getElementById('battlePanel'))return;try{window.renderRun?.()}catch(error){console.error('Combat lifecycle recovery failed',error)}});
}
function enforce(){
 if(enforcing)return;enforcing=true;
 try{
  const r=state(),b=r?.battle||null;
  if(r)lockParty(r);else unlockParty();
  if(b){
   activateDungeon();queueRecovery(r,b);
   document.body.classList.add('combat-immersive');document.documentElement.classList.add('combat-immersive');
   const panel=document.getElementById('battlePanel');if(panel)panel.classList.add('combat-immersive-panel');
   if(lastBattle!==b){lastBattle=b;window.WayfarerMusic?.sync?.()}
  }else{
   if(lastBattle){lastBattle=null;window.WayfarerMusic?.sync?.()}
   releaseViewport();
  }
 }finally{enforcing=false}
}
function wrap(name){const prior=window[name];if(typeof prior!=='function')return;window[name]=function(...args){const result=prior.apply(this,args);queueMicrotask(enforce);return result}}
['renderRun','renderBattle','renderAll','beginBattle','winBattle','loseBattle','finishRun'].forEach(wrap);
document.addEventListener('click',event=>{
 const button=event.target.closest?.('.nav button[data-page]');if(!button||!battle()||button.dataset.page==='dungeon')return;
 event.preventDefault();event.stopImmediatePropagation();activateDungeon();window.toast?.('Finish the active battle before leaving the expedition.');
},{capture:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)enforce()});
window.addEventListener('focus',enforce);
setInterval(enforce,250);
enforce();
window.WayfarerCombatLifecycle=Object.freeze({version:VERSION,sync:enforce,get active(){return !!battle()}});
})();

