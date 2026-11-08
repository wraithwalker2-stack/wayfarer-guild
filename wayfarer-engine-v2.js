(function bootstrapWayfarerEngine(global){
'use strict';
if(global.WayfarerEngine?.version==='2.0.0')return;
const deepFreeze=value=>{if(!value||typeof value!=='object'||Object.isFrozen(value))return value;for(const child of Object.values(value))deepFreeze(child);return Object.freeze(value)};
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const DATA=deepFreeze({
 baseJobs:['Squire','Alchemist','Rogue'],
 originJobs:{Shepherd:'Squire','Caravan guard':'Squire','Street performer':'Rogue',Forester:'Rogue',Apothecary:'Alchemist',Blacksmith:'Squire','Minor noble adventurer':'Squire'},
 baseStats:{Squire:{strength:7,constitution:8,intelligence:4,wisdom:5,agility:5,dexterity:5,luck:5},Alchemist:{strength:4,constitution:5,intelligence:8,wisdom:8,agility:5,dexterity:5,luck:6},Rogue:{strength:6,constitution:5,intelligence:4,wisdom:5,agility:8,dexterity:8,luck:7}},
 equipmentSlots:['head','chest','hands','legs','feet','accessory1','accessory2','mainHand','offHand']
});
const modules=new Map(),waiters=new Map(),bootState={phase:'loading',startedAt:Date.now(),readyAt:0};
let engine;
function resolvePhase(phase){bootState.phase=phase;if(phase==='ready')bootState.readyAt=Date.now();for(const resolve of waiters.get(phase)||[])resolve(engine);waiters.delete(phase);global.dispatchEvent(new CustomEvent('wayfarer:engine-phase',{detail:{phase,engine}}))}
function when(phase='ready'){if(bootState.phase===phase||phase==='ready'&&bootState.phase==='ready')return Promise.resolve(engine);return new Promise(resolve=>{if(!waiters.has(phase))waiters.set(phase,[]);waiters.get(phase).push(resolve)})}
function register(name,version='1.0.0'){if(!name)return false;modules.set(name,{name,version,registeredAt:Date.now()});return true}
function baseJobFor(origin){return DATA.originJobs[origin]||'Squire'}
function statsFor(job){return clone(DATA.baseStats[job]||DATA.baseStats.Squire)}
function derive(stats){return {maxHp:20+stats.constitution*2,power:2+Math.floor(stats.strength/2)+Math.floor(stats.intelligence/4),armor:Math.floor(stats.constitution/4),staminaMax:3+Math.floor((stats.strength+stats.constitution)/12)}}
function equipment(input={}){return Object.fromEntries(DATA.equipmentSlots.map(slot=>[slot,input[slot]??null]))}
function initializeCharacter(hero,options={}){
 if(!hero||typeof hero!=='object')throw new TypeError('A character record is required.');
 const base=options.job||hero.currentJob||baseJobFor(hero.origin),jobNames=[...new Set(options.jobNames||DATA.baseJobs)],stats=hero.stats?clone(hero.stats):statsFor(base),derived=derive(stats);
 hero.level=Math.max(1,Number(hero.level)||1);hero.xp=Math.max(0,Number(hero.xp)||0);hero.characterLevel=hero.level;hero.characterXp=hero.xp;hero.currentJob=base;hero.baseClass=base;hero.cls=base;hero.evolved=false;hero.stats=stats;
 hero.jobProgress=hero.jobProgress||{};hero.jobSkills=hero.jobSkills||{};for(const job of jobNames){hero.jobProgress[job]=hero.jobProgress[job]||{jp:0,earned:0};hero.jobSkills[job]=hero.jobSkills[job]||[]}
 hero.unlockedJobs=[...new Set([...(hero.unlockedJobs||[]),...DATA.baseJobs])];hero.equippedPassives=hero.equippedPassives||[null,null];hero.equippedReaction=hero.equippedReaction||'';hero.subJob=hero.subJob||'';hero.skills=[];hero.jobView=base;hero.equipment=equipment(hero.equipment);
 hero.baseMaxHp=derived.maxHp;hero.maxHp=derived.maxHp;hero.hp=Math.min(hero.maxHp,Math.max(0,Number(hero.hp)||hero.maxHp));hero.power=derived.power;hero.armor=derived.armor;hero.staminaMax=derived.staminaMax;hero.staff=hero.staff||null;return hero
}
function createFounder(input={}){return initializeCharacter({id:Number(input.id)||Date.now(),name:String(input.name||'Elara Vale'),origin:'Minor noble adventurer',passive:'Guildmaster · inspires confidence',quirk:'Driven · accepts responsibility',level:1,xp:0,isGuildmaster:true,appearance:clone(input.appearance||{gender:'woman',tone:'fair'}),birthday:clone(input.birthday||{month:0,day:1}),starSign:input.starSign||'The Lantern'},{job:'Squire',jobNames:DATA.baseJobs})}
function read(key,fallback=null){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch(error){console.error('[Engine:read]',key,error);return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(error){console.error('[Engine:write]',key,error);return false}}
function resetAll(){for(const key of Object.keys(localStorage))if(key.startsWith('wayfarer-')||key==='guild-sfx')localStorage.removeItem(key)}
function transaction(work){const snapshot={};for(const key of Object.keys(localStorage))snapshot[key]=localStorage.getItem(key);try{return work()}catch(error){localStorage.clear();for(const [key,value]of Object.entries(snapshot))localStorage.setItem(key,value);throw error}}
function report(error,context='runtime'){const detail={context,message:error?.message||String(error),stack:error?.stack||'',time:new Date().toISOString()};console.error('[WayfarerEngine]',detail);global.dispatchEvent(new CustomEvent('wayfarer:engine-error',{detail}));return detail}
engine=Object.freeze({version:'2.0.0',build:'0.10.0-engine-rebuild',data:DATA,boot:Object.freeze({get phase(){return bootState.phase},get startedAt(){return bootState.startedAt},get readyAt(){return bootState.readyAt},when,register,get modules(){return[...modules.values()]}}),characters:Object.freeze({baseJobFor,statsFor,derive,equipment,initialize:initializeCharacter,createFounder}),save:Object.freeze({read,write,resetAll,transaction}),report});
global.WayfarerEngine=engine;global.WAYFARER_ORIGIN_JOBS=DATA.originJobs;global.WAYFARER_BASE_STATS=DATA.baseStats;global.addEventListener('error',event=>report(event.error||event.message,'window'));global.addEventListener('unhandledrejection',event=>report(event.reason,'promise'));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>resolvePhase('ready'),{once:true});else queueMicrotask(()=>resolvePhase('ready'));
})(window);

