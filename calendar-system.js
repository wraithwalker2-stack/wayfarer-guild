/* Lumara's 360-day calendar, birthdays, and twelve narrative star signs. */
(function(){
'use strict';
const MONTHS=[
 {name:'Dawnsreach',sign:'The Lantern',icon:'✦',trait:'Guidance',calling:'Travelers, teachers, and founders',lore:'Born beneath the returning light, Lanterns are said to find roads where others see walls.'},
 {name:'Rainmoot',sign:'The River',icon:'≈',trait:'Adaptability',calling:'Healers, diplomats, and navigators',lore:'River-born are associated with patience, changing fortunes, and strength that yields without breaking.'},
 {name:'Bloomtide',sign:'The Stag',icon:'♜',trait:'Resolve',calling:'Wardens, rangers, and protectors',lore:'The Stag represents quiet authority, renewal, and the courage to stand between danger and the vulnerable.'},
 {name:'Suncrest',sign:'The Lark',icon:'❧',trait:'Expression',calling:'Bards, heralds, and messengers',lore:'Larks are believed to carry truth farther through wit, beauty, and an instinct for the right words.'},
 {name:'Highsun',sign:'The Lion',icon:'☀',trait:'Courage',calling:'Commanders, champions, and public servants',lore:'Lion-born are traditionally described as bold, generous, and most alive when responsibility finds them.'},
 {name:'Emberwane',sign:'The Forge',icon:'⚒',trait:'Industry',calling:'Smiths, architects, and disciplined mages',lore:'The Forge favors patient makers who turn pressure, repetition, and failure into enduring work.'},
 {name:'Goldfall',sign:'The Scales',icon:'⚖',trait:'Judgment',calling:'Magistrates, merchants, and mediators',lore:'Those of the Scales are expected to notice imbalance and to weigh consequences before promises.'},
 {name:'Harvestmere',sign:'The Raven',icon:'◆',trait:'Insight',calling:'Scholars, investigators, and occultists',lore:'Ravens are linked to secrets, sharp memory, and the uncomfortable question everyone else avoided.'},
 {name:'Leafturn',sign:'The Hearth',icon:'⌂',trait:'Loyalty',calling:'Stewards, cooks, and community leaders',lore:'The Hearth signifies hospitality, durable loyalties, and the gift of making strangers into companions.'},
 {name:'Frostwane',sign:'The Wolf',icon:'◇',trait:'Independence',calling:'Scouts, hunters, and freeblades',lore:'Wolf-born value chosen bonds over inherited duties and are thought to thrive beyond familiar roads.'},
 {name:'Longnight',sign:'The Crown',icon:'♛',trait:'Ambition',calling:'Strategists, nobles, and reformers',lore:'The Crown promises influence but warns that authority reveals character more often than it changes it.'},
 {name:'Starwake',sign:'The Star',icon:'✧',trait:'Imagination',calling:'Dreamers, summoners, and explorers',lore:'Star-born are associated with visions, improbable plans, and faith in futures no one else can yet see.'}
];
const FIXED={
 'Mira Ashdown':[2,8],'Tomas Reed':[7,19],'Pip Thistle':[3,27],'Oren Flint':[8,12],'Sable Venn':[0,23],'Bram Copperpot':[5,6]
};
function clampMonth(value){return Math.max(0,Math.min(11,Number(value)||0))}
function clampDay(value){return Math.max(1,Math.min(30,Number(value)||1))}
function signFor(month){return MONTHS[clampMonth(month)]}
function birthday(month,day){const m=clampMonth(month),d=clampDay(day),sign=signFor(m);return{month:m,day:d,monthName:MONTHS[m].name,sign:sign.sign,icon:sign.icon}}
function formatBirthday(value){const b=birthday(value?.month,value?.day);return`${b.monthName} ${b.day} · ${b.sign}`}
function formatCampaignDay(day=1){const zero=Math.max(0,(Number(day)||1)-1),year=Math.floor(zero/360)+1,within=zero%360,month=Math.floor(within/30),date=within%30+1;return`${MONTHS[month].name} ${date} · Year ${year}`}
function ensureBirthday(hero,index=0){
 if(hero.birthday&&Number.isFinite(Number(hero.birthday.month))&&Number.isFinite(Number(hero.birthday.day))){const b=birthday(hero.birthday.month,hero.birthday.day);hero.birthday={month:b.month,day:b.day};hero.starSign=b.sign;return hero.birthday}
 const fixed=FIXED[hero.name],seed=[...String(hero.name||'')].reduce((n,c)=>n+c.charCodeAt(0),Number(hero.id)||index+1),month=fixed?.[0]??seed%12,day=fixed?.[1]??seed*7%30+1,b=birthday(month,day);hero.birthday={month:b.month,day:b.day};hero.starSign=b.sign;return hero.birthday;
}
function currentCampaignDay(){try{return JSON.parse(localStorage.getItem('wayfarer-contracts-v1')||'null')?.day||1}catch{return 1}}
function signMarkup(){return`<div class="calendar-intro"><span class="calendar-sun" aria-hidden="true"></span><div><small>THE LUMARAN CALENDAR</small><h3>Twelve months beneath twelve signs</h3><p>Each year contains twelve 30-day months, for 360 days total. Star signs are cultural traditions rather than combat bonuses; they can shape future dialogue, birthdays, and personal stories without deciding a character’s fate.</p></div></div><div class="sign-grid">${MONTHS.map((m,i)=>`<article class="sign-card"><div class="sign-seal sign-seal-${i}" role="img" aria-label="${m.sign} emblem"></div><div><small>${String(i+1).padStart(2,'0')} · ${m.name.toUpperCase()}</small><h3>${m.sign}</h3><b>${m.trait}</b><p>${m.lore}</p><em>${m.calling}</em></div></article>`).join('')}</div>`}
function ensureCodex(){const tabs=document.querySelector('#codex .codex-tabs'),content=document.getElementById('codexContent');if(!tabs||!content)return;if(!tabs.querySelector('[data-codex-tab="signs"]'))tabs.insertAdjacentHTML('beforeend','<button data-codex-tab="signs" onclick="codexTab(\'signs\')">Star signs</button>');let panel=content.querySelector('[data-codex-panel="signs"]');if(!panel){panel=document.createElement('section');panel.dataset.codexPanel='signs';panel.hidden=true;content.append(panel)}panel.innerHTML=signMarkup()}
function renderDate(){const side=document.querySelector('.side-bottom'),date=formatCampaignDay(currentCampaignDay());if(side?.firstChild?.nodeType===Node.TEXT_NODE)side.firstChild.nodeValue=date+'\n';const weather=document.querySelector('#home .weather');if(weather){const nodes=[...weather.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);if(nodes.length)nodes[nodes.length-1].nodeValue=date.toUpperCase()}}
for(const [index,hero]of heroes.entries())ensureBirthday(hero,index);
if(typeof persistBuild==='function')persistBuild();
const priorOpenHero=window.openHero;window.openHero=function(id,...args){const result=priorOpenHero.apply(this,[id,...args]),hero=heroes.find(h=>h.id===id),overview=document.querySelector('#heroDetails [data-sheet-page="overview"] .detailtop>div:nth-child(2)');if(hero&&overview){ensureBirthday(hero);let line=overview.querySelector('.character-birthday');if(!line){line=document.createElement('p');line.className='character-birthday';overview.append(line)}line.textContent=`Born ${formatBirthday(hero.birthday)}`}return result};
const priorRenderCodex=window.renderCodex;window.renderCodex=function(...args){const selected=document.querySelector('#codex [data-codex-tab].selected')?.dataset.codexTab||'classes',result=priorRenderCodex.apply(this,args);ensureCodex();codexTab(selected);return result};
const priorRenderAll=window.renderAll;window.renderAll=function(...args){const result=priorRenderAll.apply(this,args);renderDate();return result};
window.WayfarerCalendar=Object.freeze({version:'1.1.0',months:MONTHS,birthday,signFor,formatBirthday,formatCampaignDay,ensureBirthday,currentCampaignDay});
ensureCodex();renderDate();
})();
