(function bootstrapWayfarerEngine(global){
'use strict';
if(global.WayfarerEngine?.version==='3.0.0')return;
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const freeze=value=>{if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.values(value).forEach(freeze);return Object.freeze(value)};
const DATA=freeze({
 baseJobs:['Squire','Alchemist','Rogue'],
 originJobs:{Shepherd:'Squire','Caravan guard':'Squire','Street performer':'Rogue',Forester:'Rogue',Apothecary:'Alchemist',Blacksmith:'Squire','Minor noble adventurer':'Squire'},
 baseStats:{Squire:{strength:7,constitution:8,intelligence:4,wisdom:5,agility:5,dexterity:5,luck:5},Alchemist:{strength:4,constitution:5,intelligence:8,wisdom:8,agility:5,dexterity:5,luck:6},Rogue:{strength:6,constitution:5,intelligence:4,wisdom:5,agility:8,dexterity:8,luck:7}},
 equipmentSlots:['head','chest','hands','legs','feet','accessory1','accessory2','mainHand','offHand']
});
const modules=new Map(),errors=[],waiters=[],boot={phase:'loading',startedAt:Date.now(),readyAt:0};
function report(error,context='runtime'){const item={context,message:error?.message||String(error),stack:error?.stack||'',time:new Date().toISOString()};errors.push(item);if(errors.length>40)errors.shift();console.error('[Wayfarer Engine]',item);global.dispatchEvent(new CustomEvent('wayfarer:engine-error',{detail:item}));return item}
function read(key,fallback=null){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch(error){report(error,`read:${key}`);return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));global.dispatchEvent(new CustomEvent('wayfarer:save-changed',{detail:{key}}));return true}catch(error){report(error,`write:${key}`);return false}}
function transaction(work){const snapshot={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);snapshot[key]=localStorage.getItem(key)}try{return work()}catch(error){localStorage.clear();for(const [key,value]of Object.entries(snapshot))localStorage.setItem(key,value);report(error,'transaction');throw error}}
function baseJobFor(origin){return DATA.originJobs[origin]||'Squire'}
function statsFor(job){return clone(DATA.baseStats[job]||DATA.baseStats.Squire)}
function derive(stats){return{maxHp:20+stats.constitution*2,power:2+Math.floor(stats.strength/2)+Math.floor(stats.intelligence/4),armor:Math.floor(stats.constitution/4),staminaMax:3+Math.floor((stats.strength+stats.constitution)/12)}}
function equipment(input={}){return Object.fromEntries(DATA.equipmentSlots.map(slot=>[slot,input?.[slot]??null]))}
function initializeCharacter(hero,options={}){
 if(!hero||typeof hero!=='object')throw new TypeError('A character record is required.');
 const base=options.job||hero.currentJob||hero.cls||baseJobFor(hero.origin),names=[...new Set(options.jobNames||DATA.baseJobs)],stats=hero.stats?clone(hero.stats):statsFor(base),derived=derive(stats);
 hero.level=Math.max(1,Number(hero.level)||1);hero.xp=Math.max(0,Number(hero.xp)||0);hero.characterLevel=hero.level;hero.characterXp=hero.xp;hero.currentJob=base;hero.baseClass=base;hero.cls=base;hero.stats=stats;
 hero.jobProgress=hero.jobProgress||{};hero.jobSkills=hero.jobSkills||{};for(const name of names){hero.jobProgress[name]=hero.jobProgress[name]||{jp:0,earned:0};hero.jobSkills[name]=hero.jobSkills[name]||[]}
 hero.unlockedJobs=[...new Set([...(hero.unlockedJobs||[]),...DATA.baseJobs])];hero.equippedPassives=Array.isArray(hero.equippedPassives)?hero.equippedPassives.slice(0,2):[null,null];while(hero.equippedPassives.length<2)hero.equippedPassives.push(null);
 hero.equippedReaction=hero.equippedReaction||'';hero.subJob=hero.subJob||'';hero.skills=Array.isArray(hero.skills)?hero.skills:[];hero.jobView=hero.jobView||base;hero.equipment=equipment(hero.equipment);hero.baseMaxHp=Number(hero.baseMaxHp)||derived.maxHp;hero.maxHp=Number(hero.maxHp)||derived.maxHp;hero.hp=Math.min(hero.maxHp,Math.max(0,Number(hero.hp)||hero.maxHp));hero.power=Number(hero.power)||derived.power;hero.armor=Number(hero.armor)||derived.armor;hero.staminaMax=Number(hero.staminaMax)||derived.staminaMax;hero.staff=hero.staff||null;return hero
}
function createFounder(input={}){return initializeCharacter({id:Number(input.id)||Date.now(),name:String(input.name||'Elara Vale'),origin:'Minor noble adventurer',passive:'Guildmaster · inspires confidence',quirk:'Driven · accepts responsibility',level:1,xp:0,isGuildmaster:true,appearance:clone(input.appearance||{gender:'woman',tone:'fair'}),birthday:clone(input.birthday||{month:0,day:1}),starSign:input.starSign||'The Lantern'},{job:'Squire',jobNames:DATA.baseJobs})}
function register(name,version='1.0.0',api=null){if(!name)return false;modules.set(name,{name,version,api,registeredAt:Date.now()});return true}
function whenReady(){return boot.phase==='ready'?Promise.resolve(engine):new Promise(resolve=>waiters.push(resolve))}
function when(phase='ready'){return phase==='ready'?whenReady():Promise.resolve(engine)}
function setReady(){if(boot.phase==='ready')return;boot.phase='ready';boot.readyAt=Date.now();waiters.splice(0).forEach(resolve=>resolve(engine));global.dispatchEvent(new CustomEvent('wayfarer:engine-ready',{detail:{engine}}))}
const engine=Object.freeze({version:'3.0.0',build:'0.11.0-recovery-rebuild',data:DATA,characters:Object.freeze({baseJobFor,statsFor,derive,equipment,initialize:initializeCharacter,createFounder}),save:Object.freeze({read,write,transaction}),modules:Object.freeze({register,get:(name)=>modules.get(name)?.api||null,get list(){return[...modules.values()].map(({api,...item})=>item)}}),boot:Object.freeze({get phase(){return boot.phase},get startedAt(){return boot.startedAt},get readyAt(){return boot.readyAt},whenReady,when,register}),diagnostics:Object.freeze({report,get errors(){return clone(errors)}}),report});
global.WayfarerEngine=engine;global.WAYFARER_ORIGIN_JOBS=DATA.originJobs;global.WAYFARER_BASE_STATS=DATA.baseStats;
global.addEventListener('error',event=>report(event.error||event.message,'window'));global.addEventListener('unhandledrejection',event=>report(event.reason,'promise'));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setReady,{once:true});else queueMicrotask(setReady);
})(window);

