/* Recorded CC0 battle feedback for Wayfarer Guild. */
(function(){
'use strict';
const sources={
  move:['./assets/sfx-footstep.ogg'],
  attack:['./assets/sfx-sword-swish-a.wav','./assets/sfx-sword-swish-b.wav'],
  hit:['./assets/sfx-impact.wav'],
  heal:['./assets/sfx-heal.wav'],
  ability:['./assets/sfx-magic.ogg'],
  win:['./assets/sfx-victory.ogg']
};
const bank=Object.fromEntries(Object.entries(sources).map(([kind,files])=>[kind,files.map(src=>{const audio=new Audio(src);audio.preload='auto';return audio})]));
let sequence=0,lastTerminalFx=0;
function enabled(){return typeof soundEnabled==='undefined'||soundEnabled}
function emit(kind,{delay=0,volume=.28,rate=1}={}){
  if(!enabled())return;
  const choices=bank[kind]||bank.ability;
  const base=choices[sequence++%choices.length];
  const play=()=>{try{const audio=base.cloneNode();audio.volume=Math.max(0,Math.min(1,volume));audio.playbackRate=rate;audio.play().catch(()=>{})}catch{}};
  if(delay)setTimeout(play,delay);else play();
}
function play(kind){
  if(!enabled())return;
  if(kind==='win'||kind==='defeat'){
    const now=Date.now();if(now-lastTerminalFx<1200)return;lastTerminalFx=now;
    window.WayfarerMusic?.duck?.(kind==='win'?1700:1200);
  }
  if(kind==='attack'){emit('attack',{volume:.34,rate:.96+Math.random()*.09});emit('hit',{delay:105,volume:.24,rate:.94+Math.random()*.08});return}
  if(kind==='hit'){emit('hit',{volume:.34,rate:.9+Math.random()*.12});return}
  if(kind==='move'){emit('move',{volume:.2,rate:.93+Math.random()*.14});return}
  if(kind==='heal'){emit('heal',{volume:.31,rate:.98+Math.random()*.05});return}
  if(kind==='win'){emit('win',{volume:.4});return}
  if(kind==='defeat'){emit('hit',{volume:.32,rate:.72});emit('ability',{delay:140,volume:.2,rate:.72});return}
  emit('ability',{volume:.28,rate:.95+Math.random()*.1});
}
window.playSfx=play;
for(const group of Object.values(bank))for(const audio of group)audio.load();
const priorLose=window.loseBattle;
if(typeof priorLose==='function')window.loseBattle=function(...args){play('defeat');return priorLose.apply(this,args)};
window.WayfarerSfx=Object.freeze({version:'1.1.0',play,get enabled(){return enabled()}});
})();
