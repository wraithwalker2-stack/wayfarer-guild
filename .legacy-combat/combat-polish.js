(function(){
'use strict';
let audioContext=null,lastFx={kind:'',at:0};
function context(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;audioContext=audioContext||new Audio();if(audioContext.state==='suspended')audioContext.resume?.().catch(()=>{});return audioContext}
function tone(c,frequency,start,duration,type='sine',volume=.035,endFrequency=null){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,start);if(endFrequency)o.frequency.exponentialRampToValueAtTime(Math.max(35,endFrequency),start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+duration+.02)}
function richSfx(kind){
 if(typeof soundEnabled!=='undefined'&&!soundEnabled)return;try{const c=context();if(!c)return;const now=c.currentTime+.005;
  if(kind==='move'){tone(c,370,now,.055,'sine',.018,470);tone(c,250,now+.035,.07,'triangle',.012,330)}
  else if(kind==='attack'){tone(c,230,now,.13,'sawtooth',.035,82);tone(c,110,now+.045,.11,'triangle',.026,62)}
  else if(kind==='hit'){tone(c,130,now,.16,'triangle',.045,48);tone(c,75,now+.02,.12,'sawtooth',.022,42)}
  else if(kind==='heal'){tone(c,523,now,.18,'sine',.033,659);tone(c,784,now+.08,.24,'sine',.026,1046)}
  else if(kind==='ability'){tone(c,330,now,.14,'triangle',.025,494);tone(c,660,now+.07,.22,'sine',.03,880)}
  else if(kind==='win'){[523,659,784,1046].forEach((f,i)=>tone(c,f,now+i*.075,.28,'sine',.03))}
  else if(kind==='lose'){[330,247,196,147].forEach((f,i)=>tone(c,f,now+i*.08,.25,'triangle',.027,f*.82))}
  else tone(c,480,now,.08,'sine',.018,560)
 }catch(_){}}
window.playSfx=richSfx;
function visualFx(kind){const panel=document.getElementById('battlePanel');if(!panel||!runState?.battle)return;const now=Date.now();if(lastFx.kind===kind&&now-lastFx.at<90)return;lastFx={kind,at:now};const cls=`combat-fx-${kind}`;panel.classList.remove(cls);void panel.offsetWidth;panel.classList.add(cls);setTimeout(()=>panel.classList.remove(cls),520)}
function classifyLog(message){const text=String(message||'');if(/victory|objective complete|wins the encounter/i.test(text))return'win';if(/overwhelmed|retreats|defeat/i.test(text))return'lose';if(/restore|heals?|reviv|rises with|mending|vigor to/i.test(text))return'heal';if(/unleashes|uses |invokes|prepares|warning:|casts?/i.test(text))return'ability';if(/takes? \d+|strikes?|hits?|damage|cleave|pounce|flare|ray/i.test(text))return'hit';return''}
const priorLog=window.recordBattleLog;
window.recordBattleLog=function(message,...args){const result=priorLog.call(this,message,...args),kind=classifyLog(message);if(kind){visualFx(kind);if(kind!=='win'&&kind!=='lose')richSfx(kind)}return result};
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args),panel=document.getElementById('battlePanel'),b=runState?.battle;if(!panel||!b)return result;panel.classList.add('combat-polish');panel.dataset.turn=b.turn;const actor=activeBattleHero?.();if(actor){const grid=panel.querySelector('.battlegrid'),cell=grid?.children?.[actor.y*FIELD_W+actor.x];cell?.classList.add('current-actor')}return result};
document.addEventListener('pointerdown',event=>{if(event.target.closest?.('#battlePanel button')&&audioContext?.state==='suspended')audioContext.resume?.().catch(()=>{})},{passive:true});
window.WayfarerCombatFx=Object.freeze({version:'1.1.0',play:richSfx,flash:visualFx});
})();
