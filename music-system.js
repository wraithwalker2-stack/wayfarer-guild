/* Location-aware CC0 orchestral-fantasy score for Wayfarer Guild. */
(function(){
'use strict';
const KEY='wayfarer-music-v1';
let settings={enabled:true,volume:.58};try{settings={...settings,...JSON.parse(localStorage.getItem(KEY)||'null')}}catch{}
const themes={
  guild:{name:'Orchestra Loop · Brandon Morris',src:'https://opengameart.org/sites/default/files/rpg.ogg'},
  road:{name:'Fantasy Orchestral Theme · Joth / extenz',src:'https://opengameart.org/sites/default/files/fantasyorchestralthememix2.ogg'},
  battle:{name:'Hope · MintoDog',src:'https://opengameart.org/sites/default/files/hope_orchestral_battle_music_bpm165.ogg'},
  greenway:{name:'Beautiful Forest · nene',src:'https://opengameart.org/sites/default/files/beautiful_forest_16bit_44.1khz.ogg'},
  mosslight:{name:'Mysterious Orchestral Theme · nihilocrat',src:'https://opengameart.org/sites/default/files/mystery.ogg'},
  ashen:{name:'Dungeon of Qetzyl · Ragnar Random',src:'https://opengameart.org/sites/default/files/11_-_dungeon_of_qetzyl.ogg'},
  sepulcher:{name:'Great Labyrinth · MintoDog',src:'https://opengameart.org/sites/default/files/great_labyrinth_bpm160.ogg'}
};
const player=new Audio();player.loop=true;player.preload='auto';player.volume=0;let currentMood='guild',started=false,timer=null,fadeTimer=null;
function saveSettings(){localStorage.setItem(KEY,JSON.stringify(settings))}
function locationTheme(){
  const activeRun=typeof runState!=='undefined'?runState:null;
  const dungeon=activeRun?.dungeon;
  const battlefield=activeRun?.battle;
  const selected=typeof selectedDungeon!=='undefined'?selectedDungeon:'';
  const key=String(dungeon?.id||dungeon?.name||battlefield?.battlefieldId||battlefield?.battlefieldName||selected||'').toLowerCase();
  if(key.includes('mosslight')||key.includes('warren'))return'mosslight';
  if(key.includes('ashen')||key.includes('observatory'))return'ashen';
  if(key.includes('sepulcher')||key.includes('hollow'))return'sepulcher';
  if(key.includes('greenway')||key.includes('crossing'))return'greenway';
  return null;
}
function mood(){const activeRun=typeof runState!=='undefined'?runState:null;if(activeRun?.battle)return'battle';const location=locationTheme();if(location&&activeRun)return location;const active=document.querySelector('.page.active')?.id;return['dungeon','worldMap','world','run'].includes(active)?'road':'guild'}
function targetVolume(){return Math.max(0,Math.min(.42,settings.volume*.42))}
function fade(to,duration=650,done){clearInterval(fadeTimer);const from=player.volume,start=performance.now();fadeTimer=setInterval(()=>{const p=Math.min(1,(performance.now()-start)/duration);player.volume=from+(to-from)*(1-(1-p)**2);if(p>=1){clearInterval(fadeTimer);fadeTimer=null;done?.()}},32)}
function loadTheme(next,autoplay=true){currentMood=next;const theme=themes[next];const finish=()=>{player.src=theme.src;player.load();if(autoplay&&settings.enabled)player.play().then(()=>{started=true;fade(targetVolume(),900);updateUi()}).catch(()=>{started=false;updateUi()});else updateUi()};if(!player.paused&&player.volume>.01)fade(0,420,finish);else finish()}
function syncMood(){const next=mood();if(next!==currentMood)loadTheme(next,started)}
function start(){if(!settings.enabled)return;const next=mood(),matches=player.src.endsWith(themes[next].src.replace('./','/'));if(!player.src||!matches)return loadTheme(next,true);currentMood=next;player.play().then(()=>{started=true;fade(targetVolume(),700);if(!timer)timer=setInterval(syncMood,800);updateUi()}).catch(()=>{started=false;updateUi()})}
function stop(){fade(0,260,()=>player.pause());started=false;updateUi()}
function toggle(){settings.enabled=!settings.enabled;saveSettings();settings.enabled?start():stop();updateUi()}
function control(){if(settings.enabled&&!started)start();else toggle()}
function setVolume(value){settings.volume=Math.max(0,Math.min(1,Number(value)||0));saveSettings();if(started)fade(targetVolume(),180);updateUi()}
function duck(duration=1400){if(!started||player.paused)return;fade(Math.min(.08,targetVolume()*.24),120);setTimeout(()=>{if(started&&!player.paused&&settings.enabled)fade(targetVolume(),420)},Math.max(300,duration))}
function mount(){const side=document.querySelector('.side-bottom');if(!side||document.getElementById('musicConsole'))return;side.insertAdjacentHTML('beforeend',`<section class="music-console" id="musicConsole"><button class="music-toggle" id="musicToggle" type="button" aria-label="Start or mute music">♫</button><b>ORCHESTRAL SCORE</b><small class="music-now" id="musicNow"></small><input class="music-volume" id="musicVolume" type="range" min="0" max="1" step=".05" value="${settings.volume}" aria-label="Music volume"></section>`);document.getElementById('musicToggle').addEventListener('click',control);document.getElementById('musicVolume').addEventListener('input',e=>setVolume(e.target.value));updateUi()}
function updateUi(){const box=document.getElementById('musicConsole'),button=document.getElementById('musicToggle'),now=document.getElementById('musicNow');if(!box)return;box.classList.toggle('muted',!settings.enabled);box.classList.toggle('waiting',settings.enabled&&!started);if(button){button.textContent=settings.enabled?'♫':'♩';button.title=!settings.enabled?'Play music':started?'Mute music':'Start music'}if(now)now.textContent=!settings.enabled?'Music muted':started?themes[currentMood].name:'Click ♫ to start the score'}
function unlock(event){if(event.target?.closest?.('#musicToggle'))return;if(settings.enabled&&!started)start()}
mount();document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true,passive:true});
if(!timer)timer=setInterval(syncMood,800);
const previousRenderAll=window.renderAll;window.renderAll=function(...args){const result=previousRenderAll.apply(this,args);mount();syncMood();return result};
player.addEventListener('error',()=>{started=false;updateUi()});
window.WayfarerMusic=Object.freeze({version:'3.3.0',start,toggle,setVolume,duck,sync:syncMood,get enabled(){return settings.enabled},get volume(){return settings.volume},get mood(){return currentMood},get state(){return started&&!player.paused?'playing':'paused'},get started(){return started}});
})();

