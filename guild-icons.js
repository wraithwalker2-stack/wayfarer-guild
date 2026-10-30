(function(){
'use strict';
const core=['Squire','Alchemist','Rogue','Fighter','Knight','Lancer','Wizard','Cleric','Druid','Archer','Thief','Bard'];
const advanced=['Sentinel','Runeblade','Ninja','Summoner','Assassin','Monk','Paladin','Warlock','Engineer'];
const houses=['solarius','veyrath','thornmere','duskmere','valcrest','marivelle'];
const guildIcons={contract:6,herbalism:7,mining:8,essence:9,apothecary:10,timber:11,storeroom:12,retainer:13,gold:14,renown:15,travel:16,loot:17};
function spritePosition(index,cols){const x=index%cols,y=Math.floor(index/cols);return `${cols===1?0:x/(cols-1)*100}% ${y/2*100}%`}
window.classArt=function(name,size=''){let index=core.indexOf(name),atlas='core',cols=4;if(index<0){index=advanced.indexOf(name);atlas='advanced';cols=3}if(index<0)return '<span class="art-emblem guild '+size+'" style="background-position:'+spritePosition(guildIcons.retainer,6)+'" aria-hidden="true"></span>';return '<span class="art-emblem '+atlas+' '+size+'" style="background-position:'+spritePosition(index,cols)+'" title="'+name+'" aria-label="'+name+' class emblem"></span>'};
window.houseArt=function(id,size=''){const index=houses.indexOf(id);return '<span class="art-emblem guild '+size+'" style="background-position:'+spritePosition(Math.max(0,index),6)+'" aria-hidden="true"></span>'};
window.guildArt=function(name,size=''){return '<span class="art-emblem guild '+size+'" style="background-position:'+spritePosition(guildIcons[name]??guildIcons.retainer,6)+'" aria-hidden="true"></span>'};
function decorateClasses(){
 document.querySelectorAll('#roster .hero').forEach((card,i)=>{const h=heroes[i],name=card.querySelector('.hero-name');if(h&&name&&!name.classList.contains('with-class-art')){name.classList.add('with-class-art');name.insertAdjacentHTML('afterbegin',classArt(h.currentJob||h.cls,'small'))}});
 document.querySelectorAll('#codex .codex-class').forEach(card=>{const name=card.querySelector('h3')?.textContent.trim(),old=card.querySelector('header>span');if(name&&old&&!old.classList.contains('art-emblem'))old.outerHTML=classArt(name,'large')});
 document.querySelectorAll('#jobPicks .jobpick').forEach(label=>{const name=label.querySelector('small')?.textContent.split(' · ')[0],old=label.querySelector(':scope>span');if(name&&old)old.innerHTML=classArt(name)});
 document.querySelectorAll('#team .memberpick').forEach((label,i)=>{const h=heroes[i],old=label.querySelector(':scope>span');if(h&&old)old.innerHTML=classArt(h.currentJob||h.cls)});
}
function decorateJobs(){document.querySelectorAll('#joblist .job').forEach((card,i)=>{const job=jobs[i],old=card.querySelector('.jobicon');if(!job||!old)return;old.className='jobicon art-emblem guild';old.style.backgroundImage="url('./assets/guild-emblems-v1.webp')";old.style.backgroundSize='600% 300%';old.style.backgroundPosition=spritePosition(job.houseId?Math.max(0,houses.indexOf(job.houseId)):guildIcons.contract,6);old.textContent='';const sponsor=card.querySelector('.house-sponsor');if(job.houseId&&sponsor&&!sponsor.querySelector('.art-emblem'))sponsor.insertAdjacentHTML('afterbegin',houseArt(job.houseId,'small'))})}
function decorateHouses(){document.querySelectorAll('.house-card').forEach((card,i)=>{const old=card.querySelector('header>span');if(old&&!old.classList.contains('art-emblem'))old.outerHTML=houseArt(houses[i],'large')})}
function decorateGuild(){const tools=document.querySelectorAll('.guild-tools button');if(tools[0])tools[0].querySelector('span')?.replaceWith(htmlNode(guildArt('mining')));if(tools[1])tools[1].querySelector('span')?.replaceWith(htmlNode(guildArt('gold')));document.querySelectorAll('#rooms .room').forEach(room=>{const name=room.querySelector('strong')?.textContent.toLowerCase()||'',old=room.querySelector('.roomicon');if(!old||old.classList.contains('art-emblem'))return;old.outerHTML=guildArt(name.includes('apothecary')?'apothecary':name.includes('tavern')?'retainer':name.includes('forge')?'mining':'storeroom')})}
function htmlNode(markup){const t=document.createElement('template');t.innerHTML=markup.trim();return t.content.firstChild}
function decorateAll(){decorateClasses();decorateJobs();decorateHouses();decorateGuild()}
for(const fn of ['renderRoster','renderTeam','renderJobs','renderRooms','renderCodex'])if(typeof window[fn]==='function'){const old=window[fn];window[fn]=function(...args){const result=old.apply(this,args);decorateAll();return result}}
const oldOpenHero=window.openHero;if(typeof oldOpenHero==='function')window.openHero=function(...args){const result=oldOpenHero.apply(this,args);setTimeout(decorateAll,0);return result};
window.decorateGuildArt=decorateAll;decorateAll();
})();
