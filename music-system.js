/* Original procedural score for Wayfarer Guild. No external audio files or copyrighted music. */
(function(){
'use strict';
const KEY='wayfarer-music-v1',Audio=window.AudioContext||window.webkitAudioContext;
let settings={enabled:true,volume:.42};try{settings={...settings,...JSON.parse(localStorage.getItem(KEY)||'null')}}catch{}
let context=null,master=null,timer=null,nextBar=0,step=0,currentMood='guild',started=false;
const themes={
 guild:{name:'Solaris at First Light',tempo:72,root:146.83,scale:[0,2,3,7,9,12],chords:[[0,3,7],[2,7,10],[3,7,12],[0,5,9]]},
 road:{name:'Roads of Lumara',tempo:82,root:130.81,scale:[0,2,5,7,9,12],chords:[[0,5,9],[2,7,10],[5,9,12],[0,7,10]]},
 battle:{name:'Steel Beneath the Stars',tempo:104,root:110,scale:[0,3,5,7,10,12],chords:[[0,3,7],[0,5,10],[3,7,10],[0,3,10]]}
};
function saveSettings(){localStorage.setItem(KEY,JSON.stringify(settings))}
function mood(){if(window.runState?.battle)return'battle';const active=document.querySelector('.page.active')?.id;return['dungeon','worldMap','run'].includes(active)?'road':'guild'}
function createContext(){if(!Audio)return null;if(!context){context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination)}return context}
function hz(root,semitones){return root*Math.pow(2,semitones/12)}
function voice(freq,start,duration,type,level,attack=.04){const o=context.createOscillator(),g=context.createGain(),filter=context.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(freq,start);filter.type='lowpass';filter.frequency.value=type==='sine'?900:1500;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(level,start+attack);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(filter);filter.connect(g);g.connect(master);o.start(start);o.stop(start+duration+.05)}
function bar(at,theme,index){const beat=60/theme.tempo,chord=theme.chords[index%theme.chords.length];for(const n of chord)voice(hz(theme.root,n-12),at,beat*3.8,'sine',.055,.5);const pattern=currentMood==='battle'?[0,2,1,4,3,1,5,2]:[0,2,4,3,1,3,5,2];pattern.forEach((pick,i)=>{const note=theme.scale[(pick+index)%theme.scale.length],when=at+i*beat*.5,bright=currentMood==='battle'&&i%2===0;voice(hz(theme.root,note+(i>5?12:0)),when,beat*(bright ? .32 : .7),bright?'sawtooth':'triangle',bright ? .018 : .028,.018)});if(currentMood==='battle')for(let i=0;i<4;i++)voice(hz(theme.root,-24),at+i*beat,beat*.18,'square',.012,.008)}
function schedule(){if(!context||!settings.enabled||context.state!=='running')return;const nextMood=mood();if(nextMood!==currentMood){currentMood=nextMood;step=0;updateUi()}const theme=themes[currentMood],barLength=60/theme.tempo*4;while(nextBar<context.currentTime+1.4){bar(nextBar,theme,step++);nextBar+=barLength}}
function start(){if(!settings.enabled||!Audio)return;createContext();context.resume().then(()=>{started=true;master.gain.cancelScheduledValues(context.currentTime);master.gain.linearRampToValueAtTime(settings.volume*.16,context.currentTime+.7);nextBar=Math.max(nextBar,context.currentTime+.08);if(!timer)timer=setInterval(schedule,500);schedule();updateUi()}).catch(()=>{})}
function stop(){if(master&&context){master.gain.cancelScheduledValues(context.currentTime);master.gain.linearRampToValueAtTime(0,context.currentTime+.25)}if(timer){clearInterval(timer);timer=null}started=false;updateUi()}
function toggle(){settings.enabled=!settings.enabled;saveSettings();settings.enabled?start():stop();updateUi()}
function setVolume(value){settings.volume=Math.max(0,Math.min(1,Number(value)||0));saveSettings();if(master&&context)master.gain.setTargetAtTime(settings.volume*.16,context.currentTime,.08);updateUi()}
function mount(){const side=document.querySelector('.side-bottom');if(!side||document.getElementById('musicConsole'))return;side.insertAdjacentHTML('beforeend',`<section class="music-console" id="musicConsole"><button class="music-toggle" id="musicToggle" type="button" aria-label="Toggle music">♫</button><b>ORIGINAL SCORE</b><small class="music-now" id="musicNow"></small><input class="music-volume" id="musicVolume" type="range" min="0" max="1" step=".05" value="${settings.volume}" aria-label="Music volume"></section>`);document.getElementById('musicToggle').addEventListener('click',toggle);document.getElementById('musicVolume').addEventListener('input',e=>setVolume(e.target.value));updateUi()}
function updateUi(){const box=document.getElementById('musicConsole'),button=document.getElementById('musicToggle'),now=document.getElementById('musicNow');if(!box)return;box.classList.toggle('muted',!settings.enabled);if(button){button.textContent=settings.enabled?'♫':'♩';button.title=settings.enabled?'Mute music':'Play music'}if(now)now.textContent=!Audio?'Audio unavailable':!settings.enabled?'Music muted':started?themes[currentMood].name:'Begins with your next click'}
mount();document.addEventListener('pointerdown',()=>{if(settings.enabled&&!started)start()},{once:true,capture:true});document.addEventListener('keydown',()=>{if(settings.enabled&&!started)start()},{once:true,capture:true});
const previousRenderAll=window.renderAll;window.renderAll=function(...args){const result=previousRenderAll.apply(this,args);mount();return result};
window.WayfarerMusic=Object.freeze({version:'1.0.0',toggle,setVolume,get enabled(){return settings.enabled},get volume(){return settings.volume},get mood(){return currentMood}});
})();

