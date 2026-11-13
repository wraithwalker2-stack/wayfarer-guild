/* Final recovery authority: save reset and release diagnostics. */
(function installRecoveryV4(global){
'use strict';
const VERSION='0.12.5-target-hints';
function gameKey(key){return typeof key==='string'&&(key.startsWith('wayfarer-')||key==='guild-sfx')}
function clearGameStorage(){
 const removed=[];
 if(global.WayfarerEngine?.save?.resetAll)return global.WayfarerEngine.save.resetAll();
 for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(gameKey(key)){removed.push(key);localStorage.removeItem(key)}}
 try{sessionStorage.removeItem('wayfarer-last-error')}catch{}
 return removed;
}
function freshUrl(){const url=new URL(global.location.href);url.search='';url.searchParams.set('build','v0111-terrain-rebuild');url.searchParams.set('fresh',Date.now().toString(36));return url.href}
function resetGameData({reload=true,confirm=true}={}){
 if(confirm&&!global.confirm('Start a completely new game? This permanently clears the guild, founder, characters, contracts, jobs, equipment, Codex discoveries, retainers, settings, and campaign progress on this device.'))return false;
 const removed=clearGameStorage();
 if(reload)global.location.replace(freshUrl());
 return removed;
}
global.resetGame=function(){return resetGameData({reload:true,confirm:true})};
global.WayfarerRecoveryV4=Object.freeze({version:VERSION,clearGameStorage,resetGameData,gameKey});
const release=document.querySelector('.release-version');if(release)release.textContent=`Public Alpha · v${VERSION}`;
global.WayfarerEngine?.modules?.register?.('recovery-v4',VERSION,global.WayfarerRecoveryV4);
})(window);



