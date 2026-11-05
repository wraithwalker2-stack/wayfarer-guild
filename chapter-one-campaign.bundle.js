/* ===== founder-intro.js ===== */
(function(){
'use strict';
const FOUNDER_KEY='wayfarer-founder-v1';
const POLITICS_KEY='wayfarer-politics-v1';
const origins={
 ward:{house:'House Asterfell',title:'The Border Ward',icon:'🛡',patron:'valcrest',boon:'+80 starting gold · +5 House Valcrest standing',gold:80,renown:0,relation:5,legacy:'Raised among lonely keeps and hard promises, you learned that a leader eats last and stands first.'},
 court:{house:'House Bellune',title:'The Courtly Secondborn',icon:'☀',patron:'solarius',boon:'+3 starting renown · +5 House Solarius standing',gold:0,renown:3,relation:5,legacy:'Too far from inheritance to rule, you learned names, favors, and how power moves behind a courteous smile.'},
 scholar:{house:'House Rowanward',title:'The Wandering Scholar',icon:'📜',patron:'thornmere',boon:'+40 starting gold · founding roster gains 10 XP · +5 House Thornmere standing',gold:40,renown:0,relation:5,xp:10,legacy:'Your family guarded old maps instead of armies. You left the archive to learn which legends were warnings.'},
 freeblade:{house:'House Cindervale',title:'The Disinherited Freeblade',icon:'⚔',patron:'veyrath',boon:'+50 starting gold · +2 renown · +5 House Veyrath standing',gold:50,renown:2,relation:5,legacy:'You refused an order that would have sacrificed hired blades for noble pride. Your inheritance paid the price.'}
};
let founder=null;
try{founder=JSON.parse(localStorage.getItem(FOUNDER_KEY)||'null')}catch{}
let chapter=0,chosen='ward',draft={name:'',guild:'',gender:'woman',tone:'fair',month:0,day:1};
const chapters=[
 {label:'PROLOGUE · I',title:'A Name Too Small for History',copy:`Solaris is a city built to make people feel small. Sunlit towers rise above crowded wards, noble banners hang over streets they seldom walk, and every road in Lumara seems to end beneath the royal palace.<br><br>You came to the capital bearing a lesser name: the child of a minor house with old obligations, thinning lands, and no seat on the Council of the Sun. Noble enough to understand privilege. Unimportant enough to see what it costs everyone else.`,quote:'“A great house inherits its place. A worthy one earns it.”'},
 {label:'PROLOGUE · II',title:'The Expedition That Changed Everything',copy:`You spent your youth on the road rather than waiting for an inheritance. You guarded caravans, crossed forgotten ruins, and fought beside people whose courage would never appear in a noble chronicle.<br><br>Then an expedition beneath Solaris went wrong. When the retreat was called, the patron ordered the hired adventurers to hold the passage while his household escaped with the relic. You broke the order, brought the survivors home, and discovered that saving lives earns fewer invitations than obeying power.`,quote:'You returned with no relic, a damaged reputation, and the loyalty of people who remembered who came back for them.'},
 {label:'PROLOGUE · III',title:'A Charter in the Capital',copy:`Months later, a forgotten guild charter appeared at a royal auction: a narrow hall in an unfashionable Solaris ward, six weathered beds, and the legal right to take contracts under your own banner.<br><br>It was not the future your family intended. It was better. Here, a shepherd might become a knight, an apothecary might command magic, and no adventurer would be treated as an expendable name on a ledger.<br><br>At dawn, you unlock the hall for the first time. Four adventurers wait outside, ready to follow you into the field.`,quote:'The sign above the door is still blank.'}
];
function safe(value,max){return String(value||'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max)}
function attr(value){return String(value||'').replace(/[&"']/g,c=>({'&':'&amp;','"':'&quot;',"'":'&#39;'}[c]))}
function introMarkup(){const c=chapters[chapter];if(chapter<chapters.length)return `<div class="founder-intro-progress">${[0,1,2,3].map((_,i)=>`<i class="${i<=chapter?'active':''}"></i>`).join('')}</div><span class="founder-intro__chapter">${c.label}</span><h2>${c.title}</h2><p>${c.copy}</p><div class="founder-intro__quote">${c.quote}</div><div class="founder-intro__actions"><button class="founder-intro__button" data-intro-back ${chapter===0?'disabled':''}>Back</button><button class="founder-intro__button primary" data-intro-next>${chapter===2?'Create your character':'Continue'}</button></div>`;
const calendar=window.WayfarerCalendar,months=calendar?.months||[],birth=calendar?.birthday(draft.month,draft.day);return `<div class="founder-intro-progress">${[0,1,2,3].map(()=>'<i class="active"></i>').join('')}</div><span class="founder-intro__chapter">YOUR BEGINNING</span><h2>Create the Guildmaster</h2><div class="founder-setup"><div class="founder-fields"><label class="founder-field"><span>YOUR NAME</span><input id="founderName" maxlength="30" autocomplete="name" value="${attr(draft.name)}" placeholder="Elara Vale"></label><label class="founder-field"><span>GUILD NAME</span><input id="founderGuild" maxlength="36" value="${attr(draft.guild)}" placeholder="The Wayfarer Guild"></label><label class="founder-field"><span>GENDER</span><select id="founderGender"><option value="woman" ${draft.gender==='woman'?'selected':''}>Woman</option><option value="man" ${draft.gender==='man'?'selected':''}>Man</option></select></label><label class="founder-field"><span>COMPLEXION / SKIN TONE</span><select id="founderTone"><option value="fair" ${draft.tone==='fair'?'selected':''}>Fair</option><option value="olive" ${draft.tone==='olive'?'selected':''}>Olive / medium</option><option value="deep" ${draft.tone==='deep'?'selected':''}>Deep</option></select></label><label class="founder-field"><span>BIRTH MONTH</span><select id="founderBirthMonth">${months.map((m,i)=>`<option value="${i}" ${draft.month===i?'selected':''}>${m.name} · ${m.sign}</option>`).join('')}</select></label><label class="founder-field"><span>BIRTH DAY</span><select id="founderBirthDay">${Array.from({length:30},(_,i)=>`<option value="${i+1}" ${draft.day===i+1?'selected':''}>Day ${i+1}</option>`).join('')}</select></label><p class="founder-birth-preview" id="founderBirthPreview">${birth?`${birth.icon} Born under ${birth.sign}`:'Choose a birthday'}</p></div><div><span class="founder-intro__chapter">CHOOSE YOUR BACKGROUND</span><div class="founder-origins">${Object.entries(origins).map(([id,o])=>`<button class="founder-origin ${id===chosen?'selected':''}" data-origin="${id}"><b>${o.icon} ${o.title}</b><small>${o.house}<br>${o.legacy}</small><em>${o.boon}</em></button>`).join('')}</div></div><div id="founderError" class="founder-error"></div></div><div class="founder-intro__actions"><button class="founder-intro__button" data-intro-back>Back</button><button class="founder-intro__button primary" data-intro-begin>Open the Guild Hall</button></div>`}
function renderIntro(){const body=document.querySelector('.founder-intro__body');if(!body)return;body.innerHTML=introMarkup();body.querySelector('[data-intro-back]')?.addEventListener('click',()=>{chapter=Math.max(0,chapter-1);renderIntro()});body.querySelector('[data-intro-next]')?.addEventListener('click',()=>{chapter++;renderIntro()});body.querySelectorAll('[data-origin]').forEach(button=>button.addEventListener('click',()=>{chosen=button.dataset.origin;body.querySelectorAll('[data-origin]').forEach(option=>option.classList.toggle('selected',option.dataset.origin===chosen))}));const bind=(id,key,event='input')=>body.querySelector(id)?.addEventListener(event,e=>{draft[key]=['month','day'].includes(key)?Number(e.target.value):e.target.value;updateBirthPreview()});bind('#founderName','name');bind('#founderGuild','guild');bind('#founderGender','gender','change');bind('#founderTone','tone','change');bind('#founderBirthMonth','month','change');bind('#founderBirthDay','day','change');body.querySelector('[data-intro-begin]')?.addEventListener('click',completeIntro);updateBirthPreview()}
function updateBirthPreview(){const preview=document.getElementById('founderBirthPreview'),birth=window.WayfarerCalendar?.birthday(draft.month,draft.day);if(preview&&birth)preview.textContent=`${birth.icon} ${birth.monthName} ${birth.day} · Born under ${birth.sign}`}
function showIntro(){const modal=document.createElement('section');modal.className='founder-intro';modal.innerHTML=`<div class="founder-intro__frame"><header class="founder-intro__art"><div><small>SOLARIS · CAPITAL OF LUMARA</small><h1>Founding a Legacy</h1></div></header><div class="founder-intro__body"></div></div>`;document.body.append(modal);renderIntro()}
function createFounderHero(name,appearance,birth){if(!Array.isArray(heroes))return null;const existing=heroes.find(h=>h.isGuildmaster);if(existing)return existing;heroes.splice(4);const hero={id:Math.max(0,...heroes.map(h=>Number(h.id)||0))+1,name,origin:'Minor noble adventurer',passive:'Guildmaster · inspires confidence',quirk:'Driven · accepts responsibility',level:1,xp:0,hp:36,maxHp:36,power:5,staff:null,isGuildmaster:true,appearance:{gender:appearance.gender,tone:appearance.tone},birthday:{month:birth.month,day:birth.day},starSign:birth.sign};if(typeof newJobHero==='function')newJobHero(hero);hero.appearance={gender:appearance.gender,tone:appearance.tone};hero.birthday={month:birth.month,day:birth.day};hero.starSign=birth.sign;hero.isGuildmaster=true;hero.passive='Guildmaster · inspires confidence';hero.quirk='Driven · accepts responsibility';heroes.unshift(hero);return hero}
function completeIntro(){const name=safe(document.getElementById('founderName')?.value,30),guild=safe(document.getElementById('founderGuild')?.value,36),error=document.getElementById('founderError');draft={...draft,name,guild,gender:document.getElementById('founderGender')?.value||draft.gender,tone:document.getElementById('founderTone')?.value||draft.tone,month:Number(document.getElementById('founderBirthMonth')?.value??draft.month),day:Number(document.getElementById('founderBirthDay')?.value??draft.day)};if(name.length<2||guild.length<3){if(error)error.textContent='Enter your name and a guild name before opening the hall.';return}const origin=origins[chosen],birth=window.WayfarerCalendar?.birthday(draft.month,draft.day)||{month:draft.month,day:draft.day,sign:'The Lantern'};const player=createFounderHero(name,{gender:draft.gender,tone:draft.tone},birth);founder={name,guild,origin:chosen,house:origin.house,title:origin.title,icon:origin.icon,legacy:origin.legacy,boon:origin.boon,gender:draft.gender,tone:draft.tone,birthday:{month:birth.month,day:birth.day},starSign:birth.sign,heroId:player?.id||null,createdAt:new Date().toISOString()};localStorage.setItem(FOUNDER_KEY,JSON.stringify(founder));localStorage.setItem('wayfarer-tour-v1','prompt');if(typeof gold==='number')gold+=origin.gold||0;if(typeof renown==='number')renown+=origin.renown||0;if(origin.xp&&Array.isArray(window.heroes||heroes))for(const hero of heroes){hero.xp=(hero.xp||0)+origin.xp;hero.characterXp=hero.xp}try{const politics=JSON.parse(localStorage.getItem(POLITICS_KEY)||'{"relations":{},"history":[]}');politics.relations=politics.relations||{};politics.history=politics.history||[];politics.relations[origin.patron]=(politics.relations[origin.patron]||0)+origin.relation;politics.history.unshift({id:origin.patron,amount:origin.relation,reason:`Founding ties of ${origin.house}`,date:window.WayfarerCalendar?.formatCampaignDay(1)||'Year 1'});localStorage.setItem(POLITICS_KEY,JSON.stringify(politics))}catch{}try{if(typeof save==='function')save()}catch(error){console.warn('Founder save adapter skipped during initialization.',error)}window.location.reload()}
function renderFounder(){if(!founder)return;const brand=document.querySelector('.brand');if(brand){const small=brand.querySelector('small');brand.childNodes[0].nodeValue=founder.guild.toUpperCase()+' ';if(small)small.textContent='Adventurer’s guild · Solaris'}const home=document.getElementById('home');if(!home)return;let panel=document.getElementById('founderRecord');if(!panel){panel=document.createElement('section');panel.id='founderRecord';panel.className='founder-record';const anchor=document.getElementById('guildRankPanel')||home.firstElementChild;anchor?.insertAdjacentElement('afterend',panel)}const born=founder.birthday&&window.WayfarerCalendar?window.WayfarerCalendar.formatBirthday(founder.birthday):'';panel.innerHTML=`<div class="founder-record__seal">${founder.icon}</div><div><small>GUILD FOUNDER · ${founder.house.toUpperCase()}</small><h3>${founder.name}</h3><p>${founder.title} · Guildmaster and field commander of ${founder.guild}${born?` · Born ${born}`:''}</p></div><div class="founder-record__legacy">${founder.legacy}</div>`}
const priorRenderAll=window.renderAll;window.renderAll=function(...args){const result=priorRenderAll.apply(this,args);renderFounder();return result};
window.WAYFARER_FOUNDER_KEY=FOUNDER_KEY;
window.WayfarerFounderIntro=Object.freeze({version:'2.0.0',createFounderHero});
if(founder)renderFounder();else showIntro();
})();


/* ===== guild-tour.js ===== */
(function(){
'use strict';
const TOUR_KEY='wayfarer-tour-v1',FOUNDER_KEY='wayfarer-founder-v1';
let stepIndex=0,active=false;
const steps=[
 {selector:'.nav button[data-page="home"]',title:'Guild Hall',copy:'This is your headquarters. Review the roster, expand capacity, build rooms, and assign idle adventurers to staff guild facilities.',open:true},
 {selector:'#guildRoomsDropdown summary',title:'Guild Operations',copy:'Open this menu for the Retainer Office and shared Storeroom. Retainers slowly gather materials while equipment and crafting services are provided by independent locations around Solaris.'},
 {selector:'.nav button[data-page="contracts"]',title:'Contracts',copy:'Story contracts form the main campaign. Accept one mission at a time, complete its expedition, and review its lasting consequences in the mission archive and timeline.',open:true},
 {selector:'.nav button[data-page="jobs"]',title:'Job Board',copy:'Five rotating assignments are shown at a time. Postings that require locked jobs remain hidden. Send one to three available adventurers; matching their current jobs to the assignment improves JP. Noble work also alters house relations.',open:true},
 {selector:'.nav button[data-page="world"]',fallback:'.nav button:nth-of-type(3)',title:'World Map',copy:'Expeditions begin with travel from Solaris. Roads connect settlements and dungeons. Crossing marked battlefields can trigger encounters; Sure Footed reduces that chance.',open:true},
 {selector:'.nav button[data-page="solarisCity"]',title:'Solaris',copy:'The capital holds independent services, political landmarks, and your Guild Hall. Select a city location to enter it and use the services offered there.',open:true},
 {selector:'.nav button[data-page="dungeon"]',title:'Expeditions',copy:'Choose exactly five available adventurers, then travel to a destination. Combat can run under AI or manual control. Terrain, elevation, hazards, branching rooms, bosses, and randomized loot make each run different.',open:true},
 {selector:'.nav button[data-page="characters"]',fallback:'.nav button:nth-last-of-type(2)',title:'Characters',copy:'Manage primary and secondary jobs, spend earned JP on active abilities, and equip learned passives and reactions. Character stat growth comes from the primary job held when that character gains a level.',open:true},
 {selector:'.nav button[data-page="codex"]',fallback:'.nav button:last-of-type',title:'Codex',copy:'Reference class growth and equipment rules, discovered items, expedition statistics, enemy dossiers, and the kingdom’s noble houses. It records more information as the guild explores.',open:true}
];
function founderExists(){return !!localStorage.getItem(FOUNDER_KEY)}
function findTarget(step){return document.querySelector(step.selector)||document.querySelector(step.fallback||'')}
function clearFocus(){document.querySelectorAll('.guild-tour-focus').forEach(el=>el.classList.remove('guild-tour-focus'))}
function closeLayers(){clearFocus();document.querySelector('.guild-tour-overlay')?.remove();document.querySelector('.guild-tour-card')?.remove();active=false}
function saveStatus(status){localStorage.setItem(TOUR_KEY,status)}
function addReplayButton(){if(!founderExists()||document.querySelector('.guild-tour-replay'))return;const reset=document.querySelector('.reset-game'),host=reset?.parentElement||document.querySelector('.side-bottom');if(!host)return;const button=document.createElement('button');button.className='guild-tour-replay';button.type='button';button.innerHTML='? Guild tour';button.addEventListener('click',startGuildTour);reset?reset.insertAdjacentElement('beforebegin',button):host.append(button)}
function positionCard(card,target){const box=target.getBoundingClientRect(),width=Math.min(390,innerWidth-28),left=Math.min(innerWidth-width-14,Math.max(14,box.right+18));let top=Math.min(innerHeight-card.offsetHeight-14,Math.max(14,box.top));if(box.right+width+18>innerWidth)top=Math.min(innerHeight-card.offsetHeight-14,Math.max(14,box.bottom+14));card.style.left=left+'px';card.style.top=top+'px'}
function showStep(){clearFocus();document.querySelector('.guild-tour-card')?.remove();const step=steps[stepIndex],target=findTarget(step);if(!target){if(stepIndex<steps.length-1){stepIndex++;showStep()}else finishGuildTour();return}if(step.open&&target.matches('button'))target.click();if(step.selector==='#guildRoomsDropdown summary'&&!target.parentElement?.open)target.click();target.classList.add('guild-tour-focus');target.scrollIntoView({block:'nearest',inline:'nearest'});const card=document.createElement('section');card.className='guild-tour-card';card.setAttribute('role','dialog');card.setAttribute('aria-live','polite');card.innerHTML=`<small>GUILD TOUR · ${stepIndex+1} OF ${steps.length}</small><h3>${step.title}</h3><p>${step.copy}</p><div class="guild-tour-card__progress">${'◆'.repeat(stepIndex+1)}${'◇'.repeat(steps.length-stepIndex-1)}</div><div class="guild-tour-card__actions"><button class="tour-button" data-tour-exit>End tour</button><div>${stepIndex?'<button class="tour-button" data-tour-back>Back</button>':''}<button class="tour-button primary" data-tour-next>${stepIndex===steps.length-1?'Finish':'Next'}</button></div></div>`;document.body.append(card);positionCard(card,target);card.querySelector('[data-tour-exit]').addEventListener('click',finishGuildTour);card.querySelector('[data-tour-back]')?.addEventListener('click',()=>{stepIndex--;showStep()});card.querySelector('[data-tour-next]').addEventListener('click',()=>{if(stepIndex===steps.length-1)finishGuildTour();else{stepIndex++;showStep()}})}
function startGuildTour(){document.querySelector('.tour-prompt')?.remove();closeLayers();active=true;stepIndex=0;document.body.insertAdjacentHTML('beforeend','<div class="guild-tour-overlay" aria-hidden="true"></div>');showStep()}
function finishGuildTour(){closeLayers();saveStatus('complete');document.querySelector('.nav button[data-page="home"]')?.click();addReplayButton();if(typeof toast==='function')toast('Guild tour complete. You can replay it from the sidebar.')}
function declineTour(){document.querySelector('.tour-prompt')?.remove();saveStatus('dismissed');addReplayButton()}
function askForTour(){if(document.querySelector('.tour-prompt'))return;document.body.insertAdjacentHTML('beforeend',`<div class="tour-prompt"><section class="tour-prompt__card" role="dialog" aria-modal="true"><small>WELCOME, GUILDMASTER</small><h2>Would you like a tour?</h2><p>A short guided tour will introduce the Guild Hall, assignments, travel, character development, expeditions, and reference tools. You can replay it later from the bottom of the sidebar.</p><div class="tour-prompt__actions"><button class="tour-button" data-tour-no>No, enter the guild</button><button class="tour-button primary" data-tour-yes>Yes, show me around</button></div></section></div>`);document.querySelector('[data-tour-no]').addEventListener('click',declineTour);document.querySelector('[data-tour-yes]').addEventListener('click',startGuildTour)}
window.startGuildTour=startGuildTour;window.finishGuildTour=finishGuildTour;
if(founderExists()){addReplayButton();const status=localStorage.getItem(TOUR_KEY);if(!status||status==='prompt')setTimeout(askForTour,250)}
window.addEventListener('resize',()=>{if(!active)return;const card=document.querySelector('.guild-tour-card'),target=document.querySelector('.guild-tour-focus');if(card&&target)positionCard(card,target)});
})();


/* ===== guild-icons.js ===== */
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
function decorateJobs(){document.querySelectorAll('#joblist .job').forEach((card,i)=>{const job=jobs[i],old=card.querySelector('.jobicon');if(!job||!old)return;old.className='jobicon art-emblem guild';old.style.backgroundImage="url('./assets/guild-emblems-v1.png')";old.style.backgroundSize='600% 300%';old.style.backgroundPosition=spritePosition(job.houseId?Math.max(0,houses.indexOf(job.houseId)):guildIcons.contract,6);old.textContent='';const sponsor=card.querySelector('.house-sponsor');if(job.houseId&&sponsor&&!sponsor.querySelector('.art-emblem'))sponsor.insertAdjacentHTML('afterbegin',houseArt(job.houseId,'small'))})}
function decorateHouses(){document.querySelectorAll('.house-card').forEach((card,i)=>{const old=card.querySelector('header>span');if(old&&!old.classList.contains('art-emblem'))old.outerHTML=houseArt(houses[i],'large')})}
function decorateGuild(){const tools=document.querySelectorAll('.guild-tools button');if(tools[0])tools[0].querySelector('span')?.replaceWith(htmlNode(guildArt('mining')));if(tools[1])tools[1].querySelector('span')?.replaceWith(htmlNode(guildArt('gold')));document.querySelectorAll('#rooms .room').forEach(room=>{const name=room.querySelector('strong')?.textContent.toLowerCase()||'',old=room.querySelector('.roomicon');if(!old||old.classList.contains('art-emblem'))return;old.outerHTML=guildArt(name.includes('apothecary')?'apothecary':name.includes('tavern')?'retainer':name.includes('forge')?'mining':'storeroom')})}
function htmlNode(markup){const t=document.createElement('template');t.innerHTML=markup.trim();return t.content.firstChild}
function decorateAll(){decorateClasses();decorateJobs();decorateHouses();decorateGuild()}
for(const fn of ['renderRoster','renderTeam','renderJobs','renderRooms','renderCodex'])if(typeof window[fn]==='function'){const old=window[fn];window[fn]=function(...args){const result=old.apply(this,args);decorateAll();return result}}
const oldOpenHero=window.openHero;if(typeof oldOpenHero==='function')window.openHero=function(...args){const result=oldOpenHero.apply(this,args);setTimeout(decorateAll,0);return result};
window.decorateGuildArt=decorateAll;decorateAll();
})();


/* ===== retainers.js ===== */
(function(){
'use strict';
const KEY='wayfarer-retainers-v1';
const PEOPLE=[
 {id:'mira',name:'Mira Fen',trade:'Herbalist',cost:225,desc:'A patient forager trained to identify medicinal plants.'},
 {id:'bran',name:'Bran Irons',trade:'Miner',cost:250,desc:'A quarry hand who knows safe seams and useful ore.'},
 {id:'ori',name:'Orin Vale',trade:'Spirit seeker',cost:275,desc:'A quiet dowser who gathers residue near old shrines.'},
 {id:'tess',name:'Tessa Reed',trade:'Scavenger',cost:220,desc:'A practical salvager of timber, cloth, and trail supplies.'},
 {id:'hal',name:'Halden Moss',trade:'Herbalist',cost:260,desc:'An experienced apothecary runner from the western forest.'},
 {id:'nara',name:'Nara Flint',trade:'Miner',cost:285,desc:'A volcanic prospector with an eye for refined mineral salts.'},
 {id:'selka',name:'Selka Venn',trade:'Apothecary aide',cost:300,desc:'A careful provisioner who tests reagents and occasionally prepares field supplies.'}
];
const WORK={
 herbalism:{name:'Herbalism',icon:'herbalism',minutes:10,desc:'Medicinal herbs; small chance to prepare a potion.'},
 mining:{name:'Mining',icon:'mining',minutes:12,desc:'Mineral salts and ore for the forge.'},
 essence:{name:'Spirit gathering',icon:'essence',minutes:15,desc:'Spirit essence from old roads and shrines.'},
 scavenging:{name:'Trail scavenging',icon:'timber',minutes:12,desc:'Timber and cloth from safe salvage routes.'},
 provisioning:{name:'Apothecary provisioning',icon:'apothecary',minutes:18,desc:'Reagents with a low chance to produce potions, tonics, or bombs.'}
};
let state={hired:[],assignments:{},nextAt:{},goods:{ore:0,timber:0,cloth:0},log:[]};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)state={...state,...saved,assignments:{...state.assignments,...saved.assignments},nextAt:{...state.nextAt,...saved.nextAt},goods:{...state.goods,...saved.goods},log:Array.isArray(saved.log)?saved.log:[]}}catch{}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state))}
function cap(){return Math.min(7,3+(Number(guildExpansion)||0))}
function interval(work){return (WORK[work]?.minutes||12)*60000}
function addLog(text,qty){state.log.unshift({text,qty,at:new Date().toLocaleString()});state.log=state.log.slice(0,20)}
function produce(work,cycles){if(cycles<1)return;let text='',qty=cycles;if(work==='herbalism'){apothecary.materials.herb=(apothecary.materials.herb||0)+cycles;let potions=0;for(let i=0;i<cycles;i++)if(Math.random()<.1)potions++;if(potions)apothecary.items.potion=(apothecary.items.potion||0)+potions;text='Medicinal herbs'+(potions?` and ${potions} potion${potions===1?'':'s'}`:'')}else if(work==='mining'){apothecary.materials.mineral=(apothecary.materials.mineral||0)+cycles;state.goods.ore+=Math.floor(cycles/2);text='Mineral salts and ore'}else if(work==='essence'){apothecary.materials.essence=(apothecary.materials.essence||0)+cycles;text='Spirit essence'}else if(work==='provisioning'){let made={potion:0,ether:0,bomb:0};for(let i=0;i<cycles;i++){const roll=Math.random(),reagent=roll<.5?'herb':roll<.82?'mineral':'essence';apothecary.materials[reagent]=(apothecary.materials[reagent]||0)+1;if(Math.random()<.15)made.potion++;if(Math.random()<.07)made.ether++;if(Math.random()<.04)made.bomb++}for(const id of Object.keys(made))apothecary.items[id]=(apothecary.items[id]||0)+made[id];const finished=Object.entries(made).filter(([,n])=>n).map(([id,n])=>`${n} ${id==='potion'?'potion':id==='ether'?'tonic':'bomb'}${n===1?'':'s'}`);text='Apothecary reagents'+(finished.length?' and '+finished.join(', '):'')}else{state.goods.timber+=cycles;state.goods.cloth+=Math.floor(cycles/3);text='Timber and cloth'}addLog(text,qty)}
function processRetainers(showNotice=false){const now=Date.now();let total=0;for(const id of state.hired){const work=state.assignments[id];if(!WORK[work]){delete state.nextAt[id];continue}const wait=interval(work);if(!state.nextAt[id])state.nextAt[id]=now+wait;if(now>=state.nextAt[id]){const cycles=Math.min(48,Math.floor((now-state.nextAt[id])/wait)+1);produce(work,cycles);total+=cycles;state.nextAt[id]=cycles>=48?now+wait:state.nextAt[id]+cycles*wait}}if(total){saveApothecary();saveState();if(showNotice&&typeof toast==='function')toast(`Retainers delivered ${total} gathered bundle${total===1?'':'s'} to the Storeroom.`)}else saveState();return total}
function hire(id){const p=PEOPLE.find(x=>x.id===id);if(!p||state.hired.includes(id))return;if(state.hired.length>=cap())return toast('Expand the guild to add another retainer position.');if(gold<p.cost)return toast('Not enough gold to hire this retainer.');gold-=p.cost;state.hired.push(id);save();saveState();renderResources();renderRetainers();toast(`${p.name} joined the guild staff.`)}
function assign(id,work){if(!state.hired.includes(id))return;state.assignments[id]=WORK[work]?work:'';state.nextAt[id]=WORK[work]?Date.now()+interval(work):null;saveState();renderRetainers()}
function eta(id){const work=state.assignments[id];if(!WORK[work])return 'Awaiting assignment';const seconds=Math.max(0,Math.ceil(((state.nextAt[id]||Date.now()+interval(work))-Date.now())/1000));const minutes=Math.floor(seconds/60),rest=seconds%60;return `Next delivery in ${minutes}m ${String(rest).padStart(2,'0')}s`}
function retainerMarkup(){const available=PEOPLE.filter(p=>!state.hired.includes(p.id));return `<div class="retainer-heading">${guildArt('retainer','large')}<div><h3>Retainer Office</h3><p>Hire noncombat staff and assign them to slow, reliable gathering work.</p></div><div class="retainer-summary">${state.hired.length} / ${cap()} POSITIONS<br>${state.hired.filter(id=>WORK[state.assignments[id]]).length} ACTIVE</div></div><div class="retainer-grid">${state.hired.map(id=>{const p=PEOPLE.find(x=>x.id===id),work=state.assignments[id]||'';return `<article class="retainer-card">${guildArt(work?WORK[work].icon:'retainer')}<div><h4>${p.name}</h4><p>${p.trade} · ${p.desc}</p><small>GUILD RETAINER</small></div><select aria-label="Assignment for ${p.name}" onchange="assignGuildRetainer('${id}',this.value)"><option value="">Awaiting assignment</option>${Object.entries(WORK).map(([key,w])=>`<option value="${key}" ${key===work?'selected':''}>${w.name} · ${w.minutes} min</option>`).join('')}</select><small class="retainer-next" data-retainer-eta="${id}">${eta(id)}</small></article>`}).join('')||'<p class="store-empty">No retainers hired yet. Choose a candidate below to begin gathering.</p>'}</div><div class="store-section"><h4>AVAILABLE CANDIDATES</h4><div class="retainer-grid">${available.map(p=>`<article class="retainer-card">${guildArt(p.trade==='Miner'?'mining':p.trade==='Herbalist'?'herbalism':p.trade==='Spirit seeker'?'essence':p.trade==='Apothecary aide'?'apothecary':'timber')}<div><h4>${p.name}</h4><p>${p.trade} · ${p.desc}</p><small>${p.cost} GOLD</small></div><button onclick="hireGuildRetainer('${p.id}')" ${state.hired.length>=cap()||gold<p.cost?'disabled':''}>Hire retainer · ${p.cost}g</button></article>`).join('')||'<p class="store-empty">Every available retainer has joined the guild.</p>'}</div></div><p class="retainer-balance-note">Gathering takes 10–18 real minutes per bundle. Apothecary provisioning always delivers a reagent and has low chances to add finished battle supplies. Offline progress is capped.</p>`}
function inventoryGear(){const gs=window.wayfarerGearState;if(!gs)return[];return (gs.inventory||[]).map(id=>typeof gearItem==='function'?gearItem(id):gs.items?.find(x=>x.id===id)).filter(Boolean)}
function storeroomMarkup(){const mats=apothecary?.materials||{},items=apothecary?.items||{},gear=inventoryGear();const bins=[['herbalism','Medicinal herbs',mats.herb||0],['mining','Mineral salts',mats.mineral||0],['essence','Spirit essence',mats.essence||0],['timber','Timber',state.goods.timber||0],['retainer','Cloth bundles',state.goods.cloth||0],['mining','Raw ore',state.goods.ore||0],['apothecary','Healing potions',items.potion||0],['apothecary','Stamina tonics',items.ether||0],['apothecary','Alchemical bombs',items.bomb||0]];return `<div class="retainer-heading">${guildArt('storeroom','large')}<div><h3>Guild Storeroom</h3><p>One ledger for gathered materials, battle supplies, and unequipped dungeon loot.</p></div><div class="retainer-summary">${gear.length} GEAR PIECES<br>${Object.values(items).reduce((a,b)=>a+(Number(b)||0),0)} BATTLE SUPPLIES</div></div><div class="store-summary">${bins.map(([icon,name,count])=>`<div class="store-bin">${guildArt(icon)}<div><b>${count}</b><small>${name}</small></div></div>`).join('')}</div><section class="store-section"><h4>UNEQUIPPED DUNGEON &amp; MARKET GEAR</h4>${gear.length?`<div class="store-gear">${gear.map(item=>`<article class="rarity-${(item.rarity||'common').toLowerCase()}"><b>${item.name}</b><small>${item.rarity||'Common'} · ${item.slot||item.weaponType||'Gear'} · ${typeof gearStatLine==='function'?gearStatLine(item):''}</small></article>`).join('')}</div>`:'<p class="store-empty">No unequipped gear is stored. Equipment found in expeditions will appear here automatically.</p>'}</section><section class="store-section"><h4>RECENT RETAINER DELIVERIES</h4>${state.log.length?`<div class="store-log">${state.log.map(x=>`<div><span>+${x.qty} ${x.text}</span><small>${x.at}</small></div>`).join('')}</div>`:'<p class="store-empty">No deliveries recorded yet.</p>'}</section>`}
function roomServicesPanel(){const roomsNode=document.getElementById('rooms');return roomsNode&&roomsNode.parentElement?.closest('#guildRoomsDropdown')?roomsNode.parentElement:null}
function ensurePanels(){const menu=document.getElementById('guildRoomsDropdown'),layout=roomServicesPanel();if(!menu||!layout)return;layout.hidden=true;menu.querySelector('summary span').textContent='Guild operations';menu.querySelector('summary small').textContent='Retainers · gathered goods · expedition loot';menu.querySelector('.guild-tools')?.remove();if(!menu.querySelector('.guild-section-tabs')){const tabs=document.createElement('div');tabs.className='guild-section-tabs';tabs.innerHTML='<button class="selected" data-guild-section="retainers" onclick="showGuildSection(\'retainers\')">Retainers</button><button data-guild-section="storeroom" onclick="showGuildSection(\'storeroom\')">Storeroom</button>';layout.before(tabs);for(const id of ['retainers','storeroom']){const panel=document.createElement('section');panel.id='guildSection-'+id;panel.className='guild-section-panel';panel.hidden=id!=='retainers';layout.after(panel)}}}
function showSection(name){ensurePanels();const menu=document.getElementById('guildRoomsDropdown'),layout=roomServicesPanel();if(!menu||!layout)return;menu.open=true;layout.hidden=true;name=name==='storeroom'?'storeroom':'retainers';menu.querySelectorAll('.guild-section-panel').forEach(p=>p.hidden=p.id!==`guildSection-${name}`);menu.querySelectorAll('.guild-section-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.guildSection===name));if(name==='retainers')renderRetainers();if(name==='storeroom')renderStoreroom()}
function renderRetainers(){processRetainers();ensurePanels();const panel=document.getElementById('guildSection-retainers');if(panel)panel.innerHTML=retainerMarkup()}
function renderStoreroom(){processRetainers();ensurePanels();const panel=document.getElementById('guildSection-storeroom');if(panel)panel.innerHTML=storeroomMarkup()}
window.showGuildSection=showSection;window.hireGuildRetainer=hire;window.assignGuildRetainer=assign;window.renderRetainers=renderRetainers;window.renderStoreroom=renderStoreroom;
let clearedRoomStaff=false;for(const room of rooms)if(room.staff){room.staff=null;clearedRoomStaff=true}for(const hero of heroes)if(hero.staff){hero.staff=null;clearedRoomStaff=true}if(clearedRoomStaff)save();
ensurePanels();processRetainers(true);renderRetainers();renderStoreroom();showSection('retainers');
setInterval(()=>{processRetainers(true);document.querySelectorAll('[data-retainer-eta]').forEach(n=>n.textContent=eta(n.dataset.retainerEta));if(!document.getElementById('guildSection-storeroom')?.hidden)renderStoreroom()},30000);
const oldRenderAll=window.renderAll;if(typeof oldRenderAll==='function')window.renderAll=function(...args){const result=oldRenderAll.apply(this,args);renderRetainers();renderStoreroom();return result};
const oldReset=window.resetGame;if(typeof oldReset==='function')window.resetGame=function(){if(!window.confirm('Start a fresh guild? This clears your founder story, tutorial progress, characters, retainers, gear, jobs, Codex records, and noble-house relations.'))return;for(const key of Object.keys(localStorage))if(key.startsWith('wayfarer-')||key==='guild-sfx')localStorage.removeItem(key);window.location.reload()};
})();


/* ===== lumara-codex.js ===== */
(function(){
'use strict';
const LORE_VISIBILITY_MODE='all';
const LOCATIONS=[
 {id:'lumara',name:'Kingdom of Lumara',icon:'✦',region:'The Sunlit Isles',kind:'Kingdom',unlock:'prologue',summary:'A prosperous island monarchy of fertile plains, ancient forests, volcanic mountains, and southeastern wetlands. Four centuries of peace conceal a widening divide between inherited privilege and commoner representation.'},
 {id:'solaris',name:'Solaris',icon:'☀',region:'Central Plains',kind:'Capital city',unlock:'prologue',summary:'Lumara’s political, economic, and cultural heart. The capital stands where the kingdom’s principal roads meet, surrounded by farms, villages, orchards, and grazing land.'},
 {id:'sunspire',name:'Sunspire Palace',icon:'♜',region:'Solaris',kind:'Royal seat',unlock:'prologue',summary:'Seat of House Solarius and the royal court. The Council of the Sun meets here to settle taxation, trade, infrastructure, defense, and disputes among the Great Houses.'},
 {id:'basilica',name:'Grand Basilica of the Dawn',icon:'✺',region:'Solaris',kind:'High Church seat',unlock:'prologue',summary:'The foremost sanctuary of the Church of the Eternal Dawn. Its clergy become a major political force as disaster relief expands the church’s wealth, reach, and public authority.'},
 {id:'briar-glen',name:'Briar Glen',icon:'◆',region:'Central Plains',kind:'Road town',unlock:'prologue',summary:'A modest agricultural and trading settlement between Solaris and the Elderwood. During the Long Rains it serves as an early guild hub; after the eruption it becomes a transit and resupply center for refugees.'},
 {id:'bellwick',name:'Bellwick',icon:'◇',region:'Northern Plains',kind:'Market town',unlock:'prologue',summary:'A farming community where livestock seizures and debt disputes become symbols of unequal estate law. Its later uprising may transform a reform movement into open resistance.'},
 {id:'rivermeet',name:'Kristian’s Rest',icon:'◇',region:'Northeastern River Junction',kind:'Road and river town',unlock:'prologue',summary:'A growing trade town where the northeastern road crosses the meeting of two rivers. The main road continues toward Ironhold while a smaller branch turns north for Bellwick.'},
 {id:'goldhaven',name:'Goldhaven Estate',icon:'♜',region:'Southern Plains',kind:'Great estate',unlock:'prologue',summary:'The ancestral seat of House Valcrest and the center of Lumara’s largest grain reserves. Decisions made here affect food prices, rents, relief policy, and the survival of the capital.'},
 {id:'elderwood',name:'The Elderwood',icon:'♣',region:'Western Lumara',kind:'Ancient forest',unlock:'prologue',summary:'An immense woodland containing old settlements, protected groves, hunting grounds, and timber camps. House Thornmere balances regional customs and conservation against rising demand for lumber.'},
 {id:'greenwatch',name:'Greenwatch',icon:'❧',region:'The Elderwood',kind:'Large town · noble seat',unlock:'prologue',summary:'Seat of House Thornmere and the Elderwood’s principal settlement. It is a center of forest administration, local diplomacy, and resistance to outside control.'},
 {id:'mosslight',name:'Mosslight Warrens',icon:'🍄',region:'The Elderwood',kind:'Dungeon',unlock:'prologue',summary:'Luminous caverns beneath the Elderwood. Missing travelers and abandoned timber camps draw the guild here as heavy rain and social disruption alter the forest roads.'},
 {id:'ashen-peaks',name:'The Ashen Peaks',icon:'▲',region:'Northeastern Lumara',kind:'Volcanic mountain range',unlock:'prologue',summary:'Mineral-rich highlands controlled by House Veyrath. Iron, copper, stone, and rare ores sustain Lumara’s industry, while unstable terrain makes the region vulnerable to disaster.'},
 {id:'vaelkor',name:'Mount Vaelkor',icon:'🌋',region:'The Ashen Peaks',kind:'Active volcanic complex',unlock:'prologue',summary:'A broad active volcano above mines, settlements, and fertile lower valleys. Earthquake swarms and ground deformation during the Long Rains precede the eruption that begins the Ashen Years.'},
 {id:'ironhold',name:'Ironhold',icon:'⚒',region:'The Ashen Peaks',kind:'Large mountain town · noble seat',unlock:'prologue',summary:'Seat of House Veyrath and center of mountain administration, foundries, and defense. Displaced miners later gather here to demand compensation and safer work.'},
 {id:'cinderfall',name:'Cinderfall',icon:'⛏',region:'The Ashen Peaks',kind:'Mining town',unlock:'prologue',summary:'A productive mining settlement near Mount Vaelkor. The 412 AU eruption severely damages the town and makes its people central to the kingdom’s refugee and reconstruction crisis.'},
 {id:'ashen-observatory',name:'Ashen Observatory',icon:'◉',region:'The Ashen Peaks',kind:'Dungeon · research complex',unlock:'prologue',summary:'An old astronomical and geological complex near Mount Vaelkor. The eruption damages its access roads and destabilizes the structure, leaving valuable records and a missing research expedition inside.'},
 {id:'mirelands',name:'The Mirelands',icon:'♒',region:'Southeastern Lumara',kind:'Wetland region',unlock:'prologue',summary:'A network of marshes, waterways, fishing settlements, and medicinal wetlands. Its isolated communities value independence and rely on knowledge that outside officials rarely possess.'},
 {id:'mistwatch',name:'Mistwatch',icon:'◆',region:'The Mirelands',kind:'Large town · noble seat',unlock:'prologue',summary:'Seat of House Duskmere and the Mirelands’ center of administration, alchemy, and waterborne trade. Royal surveys and inspectors are viewed here with suspicion.'},
 {id:'hollow-sepulcher',name:'Hollow Sepulcher',icon:'☠',region:'The Mirelands',kind:'Dungeon · royal crypt',unlock:'prologue',summary:'An ancient crypt beneath the tidal wetlands, associated with necromantic power. Its secrets may intersect the political crisis, though its role in the main history remains uncertain.'},
 {id:'dawnrest',name:'Dawnrest Monastery',icon:'✦',region:'West of Solaris',kind:'Monastery',unlock:'prologue',summary:'A respected religious house led by Prior Selwyn Ardent. Dawnrest offers a quieter tradition of service and scholarship as the High Church becomes increasingly political.'},
 {id:'seabright',name:'Seabright',icon:'⚓',region:'Western Coast',kind:'Port city · noble seat',unlock:'prologue',summary:'House Marivelle’s principal port and the kingdom’s gateway to foreign markets. Food imports, tariffs, shipping, and smuggling make Seabright essential during the recovery years.'}
];
const EVENTS=[
 {id:'long-rains',year:'412 AU · Spring',name:'The Long Rains',icon:'☂',status:'Fixed history',unlock:'prologue',summary:'Persistent rain floods fields, damages roads and mines, and makes travel increasingly dangerous. Lumara remains peaceful, and most citizens expect a difficult harvest rather than a national catastrophe.'},
 {id:'eruption',year:'412 AU · Early summer',name:'The Eruption of Mount Vaelkor',icon:'🌋',status:'Fixed history',unlock:'eruption',summary:'Earthquakes, fissures, lava, gas, and collapsing infrastructure devastate northeastern settlements and disrupt the mining economy. The guild cannot prevent the eruption, but it can influence rescues and local survival.'},
 {id:'open-doors',year:'413 AU',name:'The Winter of Open Doors',icon:'✺',status:'Fixed history',unlock:'open_doors',summary:'Church shelters remain open long after the immediate disaster. Royal relief, noble logistics, and religious charities sustain displaced families while establishing the church as an enduring public institution.'},
 {id:'reconstruction',year:'414 AU',name:'The Reconstruction Disputes',icon:'⚒',status:'Fixed history',unlock:'reconstruction',summary:'Arguments over compensation, damaged property, rents, timber, mine safety, and food prices reveal that recovery is benefiting regions and social classes unevenly.'},
 {id:'treasury',year:'415 AU',name:'The Burden of the Treasury',icon:'⚖',status:'Fixed history',unlock:'treasury',summary:'The crown proposes a recovery levy on large estates and commerce. The Great Houses dispute who has already contributed enough, while relief organizations seek permanent funding.'},
 {id:'petition',year:'416 AU',name:'The Petition of the Displaced',icon:'▤',status:'Fixed history',unlock:'petition',summary:'Mining communities, tenant farmers, refugees, and craft associations submit coordinated demands to Solaris. The movement remains lawful and largely loyal to King Edric.'},
 {id:'fellowship',year:'417 AU',name:'The Dawnward Fellowship',icon:'🛡',status:'Fixed history',unlock:'fellowship',summary:'Sir Corvin Thornmere’s religious volunteer organization expands from protecting shelters and pilgrims into an armed institution whose loyalty to civil authority becomes uncertain.'},
 {id:'assembly',year:'418 AU',name:'The Assembly of the Ashen Years',icon:'◎',status:'Fixed history',unlock:'assembly',summary:'Civilian groups establish a representative body later known as the Common Assembly. Lumara now has three organized centers of influence: crown, church, and reform movement.'},
 {id:'shelter',year:'419 AU',name:'The Shelter Confrontation',icon:'⚔',status:'Fixed turning point',unlock:'shelter',summary:'A Dawnward chapter refuses a royal order to vacate an unauthorized refugee shelter. The resulting dispute tests whether religious protection can supersede royal law.'},
 {id:'schism',year:'420 AU',name:'The Schism of the Dawn',icon:'✺',status:'Fixed history',unlock:'schism',summary:'The Convocation of Solaris divides the Church of the Eternal Dawn over Sacred Guardianship and clerical authority. Rival church factions openly conflict with one another and the crown.'},
 {id:'bellwick-rising',year:'421 AU',name:'The Bellwick Rising',icon:'⚑',status:'Conditional escalation',unlock:'bellwick_rising',summary:'Economic pressure, arrests, and estate disputes may push Bellwick into armed resistance. Guild actions shape civilian safety and negotiations, while regional decisions determine whether the revolt spreads.'},
 {id:'three-authorities',year:'422 AU',name:'The Crisis of Three Authorities',icon:'♜',status:'Conditional escalation',unlock:'three_authorities',summary:'The crown, Common Assembly, and divided church each claim legitimate authority. The Great Houses remain formally loyal but lose unity among their relatives, retainers, and local communities.'},
 {id:'unsettled-dawn',year:'423 AU',name:'The Unsettled Dawn',icon:'◒',status:'Variable outcome',unlock:'unsettled_dawn',summary:'Lumara reaches several plausible settlements: negotiated reform, prolonged regional unrest, religious retrenchment, or wider civil conflict. The guild influences outcomes without controlling the kingdom alone.'}
];
const PEOPLE=[
 {id:'aldren',name:'King Aldren Solarius',icon:'♛',group:'Royal House',role:'Founder of unified Lumara',unlock:'prologue',summary:'United the island roughly four centuries ago through diplomacy, strategic marriages, and limited war, then founded Solaris where the major trade routes met.'},
 {id:'edric',name:'King Edric IV Solarius',icon:'♛',group:'Royal House',role:'Reigning monarch · The Steadfast King',unlock:'prologue',summary:'Patient, intelligent, and pragmatic. He protects Lumara’s unity and lawful institutions, but hesitates to challenge noble privilege when reform could destabilize the realm.'},
 {id:'elara',name:'Queen Elara Solarius',icon:'♕',group:'Royal House',role:'Queen consort · Patron of charities',unlock:'prologue',summary:'Warm in public and politically perceptive in private. She funds healers, schools, shelters, and reform through careful influence inside the royal court.'},
 {id:'caelan',name:'Crown Prince Caelan Solarius',icon:'♚',group:'Royal House',role:'Heir apparent · The Golden Prince',unlock:'prologue',summary:'Charismatic, disciplined, and confident. He believes noble education prepares aristocrats to rule and seeks to preserve the monarchy’s established order.'},
 {id:'lyriana',name:'Princess Lyriana Solarius',icon:'♕',group:'Royal House',role:'The People’s Princess',unlock:'prologue',summary:'Empathetic, outspoken, and stubborn. She supports legal reform and commoner representation, but can underestimate the crown’s dependence on noble cooperation.'},
 {id:'arwell',name:'Lord Benedict Arwell',icon:'⚖',group:'Royal Government',role:'High Chancellor',unlock:'prologue',summary:'A meticulous minor noble respected for refusing improper favors. He investigates abuses and works to apply royal law consistently even when powerful houses object.'},
 {id:'garrick',name:'Duke Garrick Veyrath',icon:'⚒',group:'House Veyrath',role:'The Iron Duke',unlock:'prologue',summary:'A stern veteran who values hierarchy, preparedness, and duty. His evacuation leadership earns respect, though he firmly defends the noble order.'},
 {id:'seraphine',name:'Lady Seraphine Veyrath',icon:'⚙',group:'House Veyrath',role:'Heir of Ironhold',unlock:'prologue',summary:'An ambitious and capable administrator who modernizes industry and recognizes skilled workers regardless of birth, while showing little interest in equality itself.'},
 {id:'darius',name:'Lord Darius Veyrath',icon:'🛡',group:'House Veyrath',role:'Commander of the Ashguard',unlock:'prologue',summary:'An honorable, direct commander respected by common-born soldiers. He wants a professional force serving the kingdom rather than private noble interests.'},
 {id:'evelyne',name:'Duchess Evelyne Thornmere',icon:'❧',group:'House Thornmere',role:'The Lady of Greenwatch',unlock:'prologue',summary:'Reserved, patient, and fiercely protective of the Elderwood. She mediates local disputes while resisting outsiders who threaten forest customs or protected groves.'},
 {id:'rowan',name:'Lord Rowan Thornmere',icon:'♣',group:'House Thornmere',role:'Heir of Greenwatch',unlock:'prologue',summary:'A practical heir caught between the forest’s old obligations and increasing royal demand for timber, transport, and regional cooperation.'},
 {id:'corvin',name:'Sir Corvin Thornmere',icon:'🛡',group:'Church and Faith',role:'Commander of the Dawnward Fellowship',unlock:'fellowship',summary:'A zealous noble relative who transforms a religious volunteer guard into a national force. His followers range from disciplined protectors to militants.'},
 {id:'malrec',name:'Duke Malrec Duskmere',icon:'♒',group:'House Duskmere',role:'The Marsh Lord',unlock:'prologue',summary:'A guarded regionalist who maintains formal loyalty to the crown while defending Mireland autonomy from surveys, tolls, inspectors, and outside control.'},
 {id:'vespera',name:'Lady Vespera Duskmere',icon:'⚗',group:'House Duskmere',role:'Mistress of the Reeds',unlock:'prologue',summary:'An expert in medicinal plants and wetland commerce who wants the Mirelands recognized as Lumara’s center of alchemy and healing.'},
 {id:'alistair',name:'Duke Alistair Valcrest',icon:'🌾',group:'House Valcrest',role:'The Golden Lord',unlock:'prologue',summary:'A reliable steward of Lumara’s food supply and a firm defender of estate authority. He considers hierarchy essential to agricultural order.'},
 {id:'matthias',name:'Lord Matthias Valcrest',icon:'🌾',group:'House Valcrest',role:'Master of the Granaries',unlock:'prologue',summary:'A reform-minded estate administrator who favors incentives, safer tenancy, and greater farmer control without rejecting the noble system.'},
 {id:'lucien',name:'Lord Lucien Valcrest',icon:'✺',group:'Church and Faith',role:'Dawnward patron',unlock:'fellowship',summary:'A younger Valcrest son whose religious devotion draws him toward clerical supremacy and into conflict with his family’s loyalty to the crown.'},
 {id:'adriana',name:'Duchess Adriana Marivelle',icon:'⚓',group:'House Marivelle',role:'The Sea Duchess',unlock:'prologue',summary:'A commercially astute leader who protects open trade and secures emergency food imports, while ensuring her house profits from the kingdom’s recovery.'},
 {id:'cassian',name:'Lord Cassian Marivelle',icon:'⚓',group:'House Marivelle',role:'Heir of Seabright',unlock:'prologue',summary:'A disciplined maritime administrator focused on reliable ports, contracts, and trade routes during a period of growing political uncertainty.'},
 {id:'mirelle',name:'Lady Mirelle Marivelle',icon:'◈',group:'House Marivelle',role:'The Silver Tongue',unlock:'prologue',summary:'A persuasive advocate for merchant and town representation who supports moderate reform while resisting threats to commerce and private property.'},
 {id:'severian',name:'High Luminary Severian',icon:'✺',group:'Church and Faith',role:'Head of the Church of the Eternal Dawn',unlock:'open_doors',summary:'A cautious senior cleric whose cooperation with the crown during the disaster gives way to a struggle over the church’s independence and public authority.'},
 {id:'malachor',name:'Prelate Malachor',icon:'☼',group:'Church and Faith',role:'Master of Doctrine',unlock:'reconstruction',summary:'An ambitious theologian who argues that rulers must answer to religious principles. He converts moral authority and relief work into a claim for political power.'},
 {id:'althea',name:'Mother Althea Renn',icon:'✦',group:'Church and Faith',role:'Leader of the Order of the Gentle Flame',unlock:'eruption',summary:'A prominent organizer of refugee relief who defends charity and commoner dignity while warning that the church is replacing service with political ambition.'},
 {id:'belis',name:'Archcanon Oren Belis',icon:'☀',group:'Church and Faith',role:'Senior moderate cleric',unlock:'schism',summary:'An influential opponent of binding clerical authority over civil government. He joins Mother Althea in resisting the most political church faction.'},
 {id:'selwyn',name:'Prior Selwyn Ardent',icon:'◇',group:'Church and Faith',role:'Abbot of Dawnrest Monastery',unlock:'prologue',summary:'A respected scholar and administrator whose monastery preserves a quieter tradition of faith, hospitality, and service outside the capital’s struggle for power.'},
 {id:'mara-bellwick',name:'Mara Bellwick',icon:'⚑',group:'Civic Movement',role:'Petitioner and local organizer',unlock:'petition',summary:'A practical advocate who gains influence by organizing legal appeals after the Bellwick dispute. She seeks durable reforms and fears revolutionary excess.'},
 {id:'joren',name:'Captain Joren Ashford',icon:'🛡',group:'Guild Contacts',role:'Commander of the Briar Glen Watch',unlock:'prologue',summary:'A common-born veteran responsible for Briar Glen and its roads. He values public safety and stability above political ideology.'},
 {id:'alden',name:'Master Alden Kest',icon:'▤',group:'Guild Contacts',role:'Senior Guild Registrar',unlock:'prologue',summary:'An experienced registrar who connects independent guild work to royal law, local contracts, and the kingdom’s changing political needs.'},
 {id:'renna',name:'Captain Renna Vale',icon:'⚓',group:'Underworld and Trade',role:'Leader of the Salt Brotherhood',unlock:'reconstruction',summary:'A former legitimate trader with extensive contacts. She profits from restricted goods and tariffs while avoiding chaos that would destroy stable commerce.'}
];
function visible(entry){if(LORE_VISIBILITY_MODE==='all')return true;const unlocked=JSON.parse(localStorage.getItem('wayfarer-lore-unlocks')||'[]');return entry.unlock==='prologue'||unlocked.includes(entry.unlock)}
const LOCATION_ICONS={lumara:0,solaris:1,sunspire:2,basilica:3,'briar-glen':4,bellwick:4,rivermeet:4,goldhaven:4,elderwood:5,greenwatch:5,mosslight:6,'ashen-peaks':7,vaelkor:8,ironhold:9,cinderfall:10,'ashen-observatory':11,mirelands:12,mistwatch:12,'hollow-sepulcher':13,dawnrest:14,seabright:15};
const PEOPLE_ICONS={'Royal House':0,'Royal Government':1,'House Veyrath':2,'House Thornmere':3,'House Duskmere':4,'House Valcrest':5,'House Marivelle':6,'Church and Faith':7,'Civic Movement':8,'Guild Contacts':9,'Underworld and Trade':10};
function iconIndex(entry,type){if(type==='location')return LOCATION_ICONS[entry.id]??0;if(type==='event')return Math.max(0,EVENTS.findIndex(x=>x.id===entry.id));if(entry.id==='joren')return 11;if(entry.id==='althea')return 12;if(entry.id==='corvin'||entry.id==='lucien')return 13;if(entry.id==='renna')return 14;if(entry.id==='selwyn')return 15;return PEOPLE_ICONS[entry.group]??9}
function iconMarkup(entry,type){const index=iconIndex(entry,type),x=(index%4)*33.333,y=Math.floor(index/4)*33.333;return `<span class="lore-icon lore-icon-${type}" style="background-position:${x}% ${y}%" role="img" aria-label="${entry.name} emblem"></span>`}
function card(entry,type){return `<article class="lore-card" data-lore-id="${entry.id}" data-lore-unlock="${entry.unlock}"><header>${iconMarkup(entry,type)}<div><h3>${entry.name}</h3><small>${type==='event'?entry.year:entry.region||entry.group}</small></div></header><div class="lore-tags"><i>${type==='event'?entry.status:entry.kind||entry.role}</i>${type==='person'?`<i>${entry.group}</i>`:''}</div><p>${entry.summary}</p></article>`}
function locationMarkup(){return `<div class="lore-intro"><span>ATLAS OF LUMARA</span><h2>Known Locations</h2><p>Regions, settlements, institutions, and expedition sites that shape the kingdom.</p></div><div class="lore-grid">${LOCATIONS.filter(visible).map(x=>card(x,'location')).join('')}</div>`}
function eventMarkup(){return `<div class="lore-intro"><span>CAMPAIGN CHRONICLE</span><h2>The Ashen Years</h2><p>The present campaign begins during the Long Rains. Fixed events preserve the historical arc; conditional events depend on the accumulated state of Lumara.</p></div><div class="lore-timeline">${EVENTS.filter(visible).map(x=>card(x,'event')).join('')}</div>`}
function peopleMarkup(){const groups=[...new Set(PEOPLE.map(x=>x.group))];return `<div class="lore-intro"><span>DRAMATIS PERSONAE</span><h2>Important People</h2><p>The leaders, reformers, clergy, officials, and guild contacts whose decisions shape Lumara.</p></div>${groups.map(group=>`<section class="people-group"><h3>${group}</h3><div class="lore-grid">${PEOPLE.filter(x=>x.group===group&&visible(x)).map(x=>card(x,'person')).join('')}</div></section>`).join('')}`}
function ensureTabs(){const tabs=document.querySelector('#codex .codex-tabs');if(!tabs)return;for(const [id,label] of [['locations','Locations'],['events','Major events'],['people','Important people']])if(!tabs.querySelector(`[data-codex-tab="${id}"]`))tabs.insertAdjacentHTML('beforeend',`<button data-codex-tab="${id}" onclick="codexTab('${id}')">${label}</button>`)}
function ensurePanels(){const content=document.getElementById('codexContent');if(!content)return;const panels={locations:locationMarkup(),events:eventMarkup(),people:peopleMarkup()};for(const [id,html] of Object.entries(panels)){let panel=content.querySelector(`[data-codex-panel="${id}"]`);if(!panel){panel=document.createElement('section');panel.dataset.codexPanel=id;panel.hidden=true;content.append(panel)}panel.innerHTML=html}}
const baseRenderCodex=renderCodex;renderCodex=function(...args){const selected=document.querySelector('#codex [data-codex-tab].selected')?.dataset.codexTab||'classes',result=baseRenderCodex(...args);ensureTabs();ensurePanels();codexTab(selected);return result};
window.WAYFARER_LORE={locations:LOCATIONS,events:EVENTS,people:PEOPLE,visibility:LORE_VISIBILITY_MODE};
ensureTabs();ensurePanels();
})();


/* ===== codex-supplies.js ===== */
(function(){
'use strict';
let selectedItemTab='gear';
const CONSUMABLES=[
 {id:'potion',icon:'⚗',name:'Healing Potion',desc:'Restores 35% maximum vigor plus 10 to a living ally within 4 tiles and line of sight.',recipe:'3 Medicinal Herbs + 1 Mineral Salt + 8 gold',sources:[['shop','Verdant Measure Apothecary'],['job','Job board bonus drop · 15%'],['retainer','Herbalism · 10%'],['retainer','Apothecary provisioning · 15%']]},
 {id:'ether',icon:'✧',name:'Stamina Tonic',desc:'Restores 3 stamina to a living ally within 4 tiles and line of sight.',recipe:'2 Medicinal Herbs + 1 Spirit Essence + 12 gold',sources:[['shop','Verdant Measure Apothecary'],['retainer','Apothecary provisioning · 7%']]},
 {id:'bomb',icon:'✹',name:'Alchemical Bomb',desc:'A single-target magical attack with +6 power at up to 4 tiles and line of sight.',recipe:'2 Mineral Salts + 1 Spirit Essence + 10 gold',sources:[['shop','Verdant Measure Apothecary'],['retainer','Apothecary provisioning · 4%']]}
];
const MATERIALS=[
 {id:'herb',store:'apothecary',icon:'❧',name:'Medicinal Herbs',desc:'Restorative plants used in potions and stamina tonics.',sources:[['job','Forest, garden, herb, mushroom, brew, and shrine jobs'],['retainer','Herbalism · 1 each cycle'],['retainer','Apothecary provisioning · common'],['shop','Verdant Measure Apothecary']]},
 {id:'mineral',store:'apothecary',icon:'◆',name:'Mineral Salts',desc:'Stable alchemical base used in healing mixtures and bombs.',sources:[['job','Mine, tunnel, iron, stone, culvert, and bridge jobs'],['retainer','Mining · 1 each cycle'],['retainer','Apothecary provisioning · uncommon'],['shop','Verdant Measure Apothecary']]},
 {id:'essence',store:'apothecary',icon:'◈',name:'Spirit Essence',desc:'Magical residue used in stamina tonics and alchemical bombs.',sources:[['job','Rune, wisp, spirit, magic, and ward jobs'],['retainer','Spirit gathering · 1 each cycle'],['retainer','Apothecary provisioning · rare'],['shop','Verdant Measure Apothecary']]},
 {id:'ore',store:'retainer',icon:'⛏',name:'Raw Ore',desc:'Unrefined metal gathered for future forge work.',sources:[['retainer','Mining · 1 per 2 completed cycles']]},
 {id:'timber',store:'retainer',icon:'♣',name:'Timber',desc:'Salvaged and harvested wood reserved for guild projects.',sources:[['retainer','Trail scavenging · 1 each cycle']]},
 {id:'cloth',store:'retainer',icon:'▧',name:'Cloth Bundles',desc:'Recovered fabric suitable for supplies and future light equipment.',sources:[['retainer','Trail scavenging · 1 per 3 completed cycles']]}
];
function readRetainers(){try{return JSON.parse(localStorage.getItem('wayfarer-retainers-v1')||'null')||{goods:{}}}catch{return{goods:{}}}}
function supplyState(){let saved;try{saved=JSON.parse(localStorage.getItem('wayfarer-apothecary-v1')||'null')}catch{}return saved||{materials:{},items:{}}}
function sourceMarkup(sources){return `<div class="codex-source-list">${sources.map(([kind,text])=>`<span class="codex-source source-${kind}"><b>${kind==='retainer'?'RETAINER':kind==='job'?'JOB BOARD':kind==='shop'?'CITY SHOP':'DUNGEON'}</b>${text}</span>`).join('')}<span class="codex-source source-dungeon unavailable"><b>DUNGEON</b>No direct dungeon drop currently</span></div>`}
function supplyCard(item,count,kind){return `<article class="codex-supply"><div class="codex-supply-icon">${item.icon}</div><div class="codex-supply-copy"><header><div><h3>${item.name}</h3><small>${kind} · Owned ${count}</small></div><span class="codex-owned ${count?'discovered':'empty'}">${count?'IN STORAGE':'NOT HELD'}</span></header><p>${item.desc}</p>${item.recipe?`<div class="codex-recipe"><b>GUILD RECIPE</b>${item.recipe}</div>`:''}${sourceMarkup(item.sources)}</div></article>`}
function gearMarkup(panel){const current=panel.querySelector('.codex-item-list,.codex-empty');return current?current.outerHTML:'<p class="codex-empty">No gear discovered yet.</p>'}
function renderItemTabs(){const panel=document.querySelector('#codexContent [data-codex-panel="items"]');if(!panel)return;const oldGear=panel.querySelector('[data-item-panel="gear"]')||panel;const gear=oldGear.dataset.itemPanel==='gear'?oldGear.innerHTML:gearMarkup(panel),supply=supplyState(),retainers=readRetainers(),goods=retainers.goods||{};
 panel.innerHTML=`<div class="codex-item-tabs" role="tablist" aria-label="Discovered item categories"><button data-item-tab="gear" onclick="codexItemTab('gear')">Gear</button><button data-item-tab="consumables" onclick="codexItemTab('consumables')">Consumables</button><button data-item-tab="materials" onclick="codexItemTab('materials')">Materials</button></div><section data-item-panel="gear">${gear}</section><section data-item-panel="consumables" hidden><div class="codex-supply-intro"><b>BATTLE CONSUMABLES</b><p>Consumables are carried into manual combat. Their cards list every current acquisition method.</p></div><div class="codex-supply-list">${CONSUMABLES.map(x=>supplyCard(x,Number(supply.items?.[x.id])||0,'Consumable')).join('')}</div></section><section data-item-panel="materials" hidden><div class="codex-supply-intro"><b>GUILD MATERIALS</b><p>Materials come from contracts, city merchants, or slow retainer assignments. Direct dungeon material drops have not been introduced yet.</p></div><div class="codex-supply-list">${MATERIALS.map(x=>supplyCard(x,x.store==='retainer'?Number(goods[x.id])||0:Number(supply.materials?.[x.id])||0,'Material')).join('')}</div></section>`;
 codexItemTab(selectedItemTab);
}
window.codexItemTab=function(id){selectedItemTab=['gear','consumables','materials'].includes(id)?id:'gear';document.querySelectorAll('#codexContent [data-item-panel]').forEach(x=>x.hidden=x.dataset.itemPanel!==selectedItemTab);document.querySelectorAll('#codexContent [data-item-tab]').forEach(x=>x.classList.toggle('selected',x.dataset.itemTab===selectedItemTab))};
const baseRenderCodex=renderCodex;renderCodex=function(...args){const result=baseRenderCodex(...args);renderItemTabs();return result};
renderItemTabs();
})();


/* ===== contracts.js ===== */
(function(){
'use strict';
const STORAGE_KEY='wayfarer-contracts-v1';
const CONTRACTS=[
 {id:'family-call',type:'main',mode:'narrative',act:'PROLOGUE',title:'An Obligation of Blood',issuer:'Your Minor House',icon:'contract',target:'solaris',targetName:'Solaris',days:1,reward:{gold:45,renown:1},prerequisites:[],brief:'A sealed letter from your family arrives before the guild has taken its first public contract. Someone has stolen household funds and planted evidence against a longtime servant. Your family needs a discreet investigator who understands both noble duty and life beyond the manor walls.',objective:'Investigate the missing household funds, decide whose testimony to trust, and determine how justice should be served.',resolution:'The guild resolved its first family dispute and established the principles by which its founder intends to lead.',changes:['Your family becomes the guild’s first patron.','Solaris begins to hear what kind of leader commands the new guild.','Your decisions begin shaping how future allies and rivals approach you.']},
 {id:'crown-seal',type:'main',mode:'narrative',act:'CHAPTER I',title:'The Crown’s Missing Seal',issuer:'Office of the Royal Chancellor',icon:'contract',target:'solaris',targetName:'Solaris',days:2,reward:{gold:80,renown:2},prerequisites:['family-call','greenway-patrol','sunmarket-ledger'],brief:'After three successful contracts, the Royal Chancellor has taken notice of your guild. A courier vanished carrying a seal used to authenticate Crown orders, and your growing reputation has earned an invitation to investigate.',objective:'Question the courier office, inspect the abandoned dispatch cart, and decide which dangerous lead deserves the Crown’s attention.',resolution:'The guild traced the courier through Solaris, recovered the abandoned dispatch case, and found a wax impression taken from the missing seal. The seal itself was gone, and a false escort order pointed toward the Elderwood.',changes:['The Royal Chancellor recognizes the guild as a trusted field agent.','Rumors of forged Crown orders begin circulating among the six houses.','The stolen seal’s first field order points toward the Mosslight Warrens.']},
 {id:'mosslight-bloom',type:'main',mode:'expedition',act:'CHAPTER I FINALE',title:'The Forged Road',issuer:'Office of the Royal Chancellor',icon:'travel',target:'mosslight',targetName:'Mosslight Warrens',days:3,reward:{gold:110,renown:3},prerequisites:['crown-seal'],brief:'The stolen royal seal authorized a false patrol to clear witnesses from the Elderwood road. The surviving roadwarden traced the order to a courier who vanished inside the Mosslight Warrens. Recover the dispatch satchel before the forgery’s author can erase the trail.',objective:'Enter the Mosslight Warrens, defeat its guardian, and recover the forged dispatches hidden in its nesting chamber.',resolution:'The guild broke the ambush network inside the warrens and recovered a dispatch satchel bearing payments from a dead trading company. The guild’s first chapter closes with proof that the missing seal is part of a wider conspiracy.',changes:['The Mosslight road becomes a secured guild route.','Solaris recognizes the guild as a proven independent company.','The cipher in the recovered ledger points toward Mount Vaelkor and the Ashen Observatory.']},
 {id:'vaelkor-cipher',type:'main',mode:'expedition',act:'ACT II',title:'Embers Beneath Vaelkor',issuer:'Solaris Grand Academy',icon:'travel',target:'ashen',targetName:'Ashen Observatory',days:5,reward:{gold:140,renown:4},prerequisites:['mosslight-bloom'],brief:'The recovered ledger bears a cipher once used by astronomers at the Ashen Observatory. The Academy believes its ruined lens chamber may still contain the key—and that another expedition is already climbing Mount Vaelkor.',objective:'Reach the Ashen Observatory, secure its cipher lens, and learn who commissioned the forged orders.',resolution:'The cipher lens revealed payments routed through dead companies and forgotten titles. One mark appeared repeatedly: a bell enclosed by a broken crown, an emblem erased from modern royal histories.',changes:['The Academy opens sealed records concerning the Broken Crown conspiracy.','The guild’s investigation draws the quiet attention of every noble house.','The next lead points to the drowned crypts of the Mirelands.']},
 {id:'mire-bell',type:'main',mode:'expedition',act:'ACT III',title:'The Bell Below the Mire',issuer:'The Crown and the Church of the Dawn',icon:'essence',target:'sepulcher',targetName:'Hollow Sepulcher',days:7,reward:{gold:250,renown:7},prerequisites:['vaelkor-cipher'],brief:'Church records identify the bell-and-crown emblem as the funerary mark of a royal claimant buried in the Hollow Sepulcher. The tide is receding, and voices in Solaris are already moving to keep the tomb closed.',objective:'Enter the Hollow Sepulcher, survive its guardians, and recover the claimant’s testament.',resolution:'The guild returned with a testament bearing a royal bloodline the kingdom had been taught to forget. Its final page named living heirs—and proved that the struggle over Lumara’s future had already begun.',changes:['The hidden succession crisis becomes part of the active campaign timeline.','Future political contracts may force the guild to favor or oppose noble houses.','The first campaign arc is complete.']},
 {id:'greenway-patrol',type:'side',mode:'expedition',act:'FIELD CONTRACT',title:'Trouble at Greenway Crossing',issuer:'Briar Glen Roadwarden',icon:'travel',target:'greenway',targetName:'Greenway Crossing',days:1,reward:{gold:55,renown:1},prerequisites:['family-call'],brief:'Merchants report goblin scouts and frightened beasts along the Elderwood road. A field patrol will secure the crossing and prove that the new guild can protect people beyond its own family affairs.',objective:'Travel to Greenway Crossing, defeat the force blocking the road, and return with the roadwarden’s report.',resolution:'The crossing was secured in battle, and travelers carried word of the guild’s discipline back to Solaris.',changes:['Greenway Crossing is secured for guild travel.','The roadwarden provides evidence of forged patrol orders.','The guild gains enough field knowledge to chart its first dungeon route.']},
 {id:'sunmarket-ledger',type:'side',mode:'narrative',act:'CITY CONTRACT',title:'The Sunmarket Dispute',issuer:'Solaris Merchants’ Circle',icon:'contract',target:'solaris',targetName:'Solaris',days:1,reward:{gold:65,renown:1},prerequisites:['family-call'],brief:'Three caravan masters are feuding over a disputed cargo and require a neutral guild to mediate. Success would prove that your judgment extends beyond family loyalties.',objective:'Investigate the conflicting manifests, identify who altered the cargo ledger, and produce a settlement the Sunmarket will honor.',resolution:'The guild exposed the altered manifest and produced a workable settlement, gaining contacts among the capital’s merchants.',changes:['Solaris merchants begin sharing rumors with the guild.','The Gilded Compact records how the guild balanced law, mercy, and commercial power.','The Royal Chancellor hears favorable reports about the guild’s judgment.']}
];
let selectedTab='available';
function fresh(){return{version:1,active:null,completed:[],day:1}}
function load(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return raw&&Array.isArray(raw.completed)?{...fresh(),...raw}:fresh()}catch{return fresh()}}
let state=load();
// Save migration: campaigns that had already reached the Observatory before the
// authored Mosslight finale was introduced keep their route and archive progress.
if((state.active==='vaelkor-cipher'||state.completed.some(x=>['vaelkor-cipher','mire-bell'].includes(x.id)))&&!state.completed.some(x=>x.id==='mosslight-bloom')){
 state.completed.push({id:'mosslight-bloom',day:state.day,calendar:`Autumn · Year 1 · Day ${Math.max(1,state.day)}`,title:'The Forged Road',issuer:'Office of the Royal Chancellor',resolution:'The guild had already secured the Elderwood trail before this chapter was added to the campaign archive.',choices:['Legacy campaign progress preserved.'],party:[],migrated:true,completedAt:new Date().toISOString()});
 localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mission(id){return CONTRACTS.find(x=>x.id===id)}
function completed(id){return state.completed.some(x=>x.id===id)}
function unlocked(c){return c.prerequisites.every(completed)}
function calendar(day=state.day){return window.WayfarerCalendar?.formatCampaignDay(day)||`Dawnsreach ${Math.max(1,day)} · Year 1`}
function status(c){if(completed(c.id))return'complete';if(state.active===c.id)return'active';if(unlocked(c))return'available';return'locked'}
function rewardText(c){return `${c.reward.gold} gold · ${c.reward.renown} renown · ${c.days} day${c.days===1?'':'s'} pass`}
function availableMarkup(){
 const active=mission(state.active),next=CONTRACTS.find(c=>!completed(c.id)&&unlocked(c)),visible=CONTRACTS.filter(c=>['active','available'].includes(status(c)));
 return `<div class="contract-summary"><div>${typeof guildArt==='function'?guildArt('contract','large'):'✦'}<div><small>CAMPAIGN LEDGER</small><h3>${active?'One mission is active':next?'A story mission awaits':'Current campaign arc complete'}</h3><p>${active?`The guild is committed to <b>${safe(active.title)}</b>. Complete its objectives to advance the timeline.`:next?'Accepting a contract records it as the guild’s active story mission. Ordinary jobs and expeditions do not advance campaign time.':'Every currently written story mission has been completed. The archive preserves the guild’s decisions and discoveries.'}</p></div></div><span>${calendar()}</span></div><div class="contract-list">${visible.map(contractCard).join('')}</div>`
}
function contractCard(c){
 const s=status(c),requirement=c.prerequisites.map(id=>mission(id)?.title).filter(Boolean).join(', ');
 const kind=c.type==='side'?'side':'main',label=kind==='side'?'SIDE MISSION':'MAIN STORY';
 const action=s==='active'?(c.mode==='narrative'?`<button class="button green" onclick="beginNarrativeContract('${c.id}')">Continue the investigation →</button>`:c.mode==='local'?`<button class="button green" onclick="completeLocalContract('${c.id}')">Complete ${safe(c.targetName)} assignment →</button>`:`<button class="button green" onclick="prepareStoryContract('${c.id}')">Open route to ${safe(c.targetName)} →</button>`):s==='available'?`<button class="button" onclick="acceptStoryContract('${c.id}')">Accept ${kind} mission</button>`:'';
 return `<article data-contract-id="${c.id}" class="contract-card ${s} contract-${kind}"><header><div>${typeof guildArt==='function'?guildArt(c.icon,'large'):'✦'}<div><small><span class="contract-kind">${label}</span> · ${c.act} · ${s.toUpperCase()}</small><h3>${safe(c.title)}</h3><p>${safe(c.issuer)}</p></div></div><span>${safe(c.targetName)}</span></header><div class="contract-card-body"><p>${safe(c.brief)}</p><div class="contract-objective"><b>MISSION OBJECTIVE</b><span>${safe(c.objective)}</span></div><div class="contract-reward"><span>REWARD</span><b>${rewardText(c)}</b></div>${action}</div></article>`
}
function archiveMarkup(focus){
 if(!state.completed.length)return '<div class="contract-empty"><b>No completed story contracts</b><p>Completed timeline missions will be preserved here with their narrative outcome and lasting world changes.</p></div>';
 return `<div class="contract-archive">${[...state.completed].reverse().map(entry=>{const c=mission(entry.id);if(!c)return'';return `<article id="contractArchive-${c.id}" class="contract-record ${focus===c.id?'focused':''}"><div class="contract-record-date"><b>${safe(c.act)}</b><span>${safe(entry.calendar||calendar(entry.day))}</span></div><div><small>COMPLETED · ${safe(entry.issuer||c.issuer)}</small><h3>${safe(entry.title||c.title)}</h3><p>${safe(entry.resolution||c.resolution)}</p>${entry.choices?.length?`<h4>DECISIONS</h4><ul>${entry.choices.map(x=>`<li>${safe(x)}</li>`).join('')}</ul>`:''}<h4>WORLD CHANGES</h4><ul>${c.changes.map(x=>`<li>${safe(x)}</li>`).join('')}</ul><footer>${entry.party?.length?`Field team: ${entry.party.map(safe).join(', ')} · `:''}${safe(c.targetName)}</footer></div></article>`}).join('')}</div>`
}
function timelineMarkup(){
 const markers=[{title:'The Guild Opens Its Doors',copy:'A minor noble adventurer establishes an independent guild in Solaris.',day:1,done:true},...CONTRACTS.map(c=>{const record=state.completed.find(x=>x.id===c.id);return{title:c.title,copy:record?c.changes[0]:status(c)==='active'?`Active mission at ${c.targetName}.`:'The outcome has not yet entered the historical record.',day:record?.day,done:!!record,active:state.active===c.id}})];
 return `<div class="campaign-timeline">${markers.map((m,i)=>`<article class="${m.done?'done':m.active?'active':'future'}"><i>${m.done?'✓':m.active?'◆':i+1}</i><div><small>${m.day?calendar(m.day):'DATE UNWRITTEN'}</small><h3>${safe(m.title)}</h3><p>${safe(m.copy)}</p></div></article>`).join('')}</div>`
}
function pageMarkup(){return `<section class="page contracts-page" id="contracts"><div class="contracts-hero"><div><small>THE GUILD’S MAIN STORY</small><h2>Contracts</h2><p>Storyline missions reveal Lumara’s central conflict and move the campaign calendar forward. Their consequences remain in the archive.</p></div><div><b>${state.completed.length}</b><span>CHAPTERS COMPLETE</span></div></div><nav class="contracts-tabs" aria-label="Contract records"><button data-contract-tab="available" onclick="contractTab('available')">Current missions</button><button data-contract-tab="archive" onclick="contractTab('archive')">Mission archive</button><button data-contract-tab="timeline" onclick="contractTab('timeline')">Timeline</button></nav><div id="contractsContent"></div></section>`}
function render(focus){
 const root=document.getElementById('contractsContent');if(!root)return;
 document.querySelectorAll('.contracts-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.contractTab===selectedTab));
 root.innerHTML=selectedTab==='archive'?archiveMarkup(focus):selectedTab==='timeline'?timelineMarkup():availableMarkup();
 if(focus)setTimeout(()=>document.getElementById(`contractArchive-${focus}`)?.scrollIntoView({behavior:'smooth',block:'center'}),0)
}
window.contractTab=function(tab){selectedTab=['available','archive','timeline'].includes(tab)?tab:'available';render()};
window.showContractsPage=function(){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('contracts')?.classList.add('active');document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='contracts'));document.getElementById('pageTitle').textContent='Contracts';render();scrollTo({top:0,behavior:'smooth'})};
window.acceptStoryContract=function(id){const c=mission(id);if(!c||completed(id)||!unlocked(c))return;if(state.active&&state.active!==id)return toast('Complete the active story contract before accepting another.');state.active=id;saveState();render();toast(`${c.title} accepted. The campaign timeline will advance when the mission is completed.`)};
window.prepareStoryContract=function(id){const c=mission(id);if(!c||state.active!==id||c.mode!=='expedition')return;window.openWorldMap?.();setTimeout(()=>{const pin=document.querySelector(`[data-location="${c.target}"]`);if(pin){pin.click();pin.scrollIntoView({behavior:'smooth',block:'center'})}toast(`Mission destination marked: ${c.targetName}.`)},30)};
window.completeLocalContract=function(id){const c=mission(id);if(!c||state.active!==id||c.mode!=='local')return;completeContract(c,{party:[]});showContractsPage();toast(`${c.title} complete.`)};
window.completeNarrativeContract=function(id,snapshot={}){const c=mission(id);if(!c||state.active!==id||c.mode!=='narrative')return false;completeContract(c,{party:[],...snapshot});showContractsPage();return true};
window.showContractArchive=function(id){selectedTab='archive';render(id)};
function completeContract(c,snapshot){
 state.day+=c.days;state.completed.push({id:c.id,day:state.day,calendar:calendar(state.day),...snapshot,party:snapshot.party||[],completedAt:new Date().toISOString()});state.active=null;saveState();
 if(typeof gold==='number')gold+=c.reward.gold;if(typeof renown==='number')renown+=c.reward.renown;if(typeof save==='function')save();if(typeof renderResources==='function')renderResources();
 const report=document.querySelector('#run .report');if(report)report.insertAdjacentHTML('afterbegin',`<section class="contract-complete"><small>${c.act} COMPLETE · ${calendar()}</small><h3>${safe(c.title)}</h3><p>${safe(c.resolution)}</p><b>Story reward: ${c.reward.gold} gold · ${c.reward.renown} renown</b><button class="button secondary" onclick="showContractsPage();contractTab('archive')">Read mission archive</button></section>`);
 toast(`${c.title} complete. The campaign timeline advances ${c.days} days.`);render()
}
const priorFinish=finishRun;
if(typeof priorFinish==='function')finishRun=function(...args){const r=runState,c=mission(state.active),snapshot=r&&c&&r.dungeon?.id===c.target&&!r.failed?{party:(r.ids||[]).map(id=>heroes.find(h=>h.id===id)?.name||'Unknown adventurer')}:null;const result=priorFinish.apply(this,args);if(c&&snapshot&&!completed(c.id))completeContract(c,snapshot);return result};
window.wayfarerContractProgress=function(){return{active:state.active,completed:state.completed.map(x=>x.id),count:state.completed.length}};
function install(){const main=document.querySelector('main.main'),nav=document.querySelector('.nav');if(!main||!nav||document.getElementById('contracts'))return;main.insertAdjacentHTML('beforeend',pageMarkup());const button=document.createElement('button');button.dataset.page='contracts';button.innerHTML=`<span>${typeof guildArt==='function'?guildArt('contract','small'):'◆'}</span> Contracts`;button.onclick=showContractsPage;const jobs=nav.querySelector('[data-page="jobs"]');nav.insertBefore(button,jobs||nav.firstChild);render()}
install();
})();


/* ===== contract-narrative.js ===== */
(function(){
'use strict';
const STORY_KEY='wayfarer-family-story-v1',PROFILE_KEY='wayfarer-player-profile-v1',FOUNDER_KEY='wayfarer-founder-v1';
const familyStories={
 ward:{caseTitle:'The Empty Strongbox',problem:'Your family’s winter levy has vanished from a locked strongbox. The keys point to Garran, an aging household guard who once trained you, but the account book contains entries written after he was confined.',accused:'Garran, the veteran guard',clue:'a quartermaster’s seal pressed into fresh wax',pressure:'the border villages will go without winter grain'},
 court:{caseTitle:'The Unwelcome Signature',problem:'Funds reserved for your younger cousin’s diplomatic household have disappeared. A secretary’s signature appears on every withdrawal, although she insists the orders came from a relative with influence at court.',accused:'Lysa, the household secretary',clue:'a copied signet hidden inside a court invitation',pressure:'the scandal could destroy a carefully negotiated marriage'},
 scholar:{caseTitle:'The Vanished Folio',problem:'A valuable map folio has disappeared from the family archive, along with the coin entrusted to restore it. The junior archivist is blamed, but a false catalogue entry points toward someone who knew the collection before she was born.',accused:'Tomas, the junior archivist',clue:'scraped ink revealing an older catalogue number',pressure:'the maps may expose forgotten claims to Elderwood land'},
 freeblade:{caseTitle:'The Captain’s Due',problem:'Your family’s remaining mercenary payroll has vanished. The company clerk is accused of desertion, yet the roster includes soldiers who never existed and payments approved by the relative who disinherited you.',accused:'Mara, the company clerk',clue:'three invented soldiers sharing one bank mark',pressure:'unpaid veterans are gathering outside the family estate'}
};
function read(key,fallback){try{return{...fallback,...JSON.parse(localStorage.getItem(key)||'null')}}catch{return{...fallback}}}
function founder(){return read(FOUNDER_KEY,{name:'the guildmaster',guild:'the new guild',origin:'ward',house:'your family'})}
function story(){return read(STORY_KEY,{step:0,choices:[]})}
function saveStory(value){localStorage.setItem(STORY_KEY,JSON.stringify(value))}
function profile(){return read(PROFILE_KEY,{traits:{},decisions:[]})}
function family(){const f=founder();return familyStories[f.origin]||familyStories.ward}
function title(){const f=founder(),s=family();return `${s.caseTitle} of ${f.house}`}
function decorate(){const card=document.querySelector('[data-contract-id="family-call"]');if(card){const f=founder(),s=family(),headings=card.querySelectorAll('h3'),issuer=card.querySelector('header p'),brief=card.querySelector('.contract-card-body>p');if(headings[0])headings[0].textContent=title();if(issuer)issuer.textContent=`A private appeal from ${f.house}`;if(brief)brief.textContent=`${s.problem} Meanwhile, ${s.pressure}. ${f.house} has asked the guild to uncover the truth before the crisis worsens.`}}
function sceneCopy(data){const f=founder(),s=family(),first=data.choices[0];if(data.step===0)return{eyebrow:`A LETTER FROM ${f.house.toUpperCase()}`,heading:s.caseTitle,copy:`The letter reaches ${f.guild} before sunrise. ${s.problem} Your family asks for silence, speed, and loyalty—but does not say whether loyalty means protecting the household or exposing whoever is responsible.`};if(data.step===1){const lead=first?.id==='listen'?`${s.accused} gives you a frightened but precise account and names a witness the family ignored.`:first?.id==='ledger'?`You seal the accounts before anyone can alter them and discover ${s.clue}.`: `Your sudden confrontation unsettles the household factor, who contradicts the official timeline and tries to leave Solaris.`;return{eyebrow:'THE SECOND THREAD',heading:'What the Household Hid',copy:`${lead} The evidence now implicates a well-connected cousin who diverted the money to cover private debts. Your family offers to restore the missing funds quietly if you keep the culprit’s name outside the public record.`}}return{eyebrow:'THE FIRST PRINCIPLE',heading:'A Reputation Begins',copy:`Your decision will settle the immediate crisis and become the first story told about ${f.name}, guildmaster of ${f.guild}. Future allies will remember whether you favored truth, mercy, order, or results when those values came into conflict.`}}
const firstChoices=[
 {id:'listen',title:'Hear the accused before touching the evidence',copy:'Give the blamed servant a fair chance to tell the story in their own words.',trait:'Compassion',result:'You listened to the accused before accepting the household’s judgment.'},
 {id:'ledger',title:'Seal the ledgers and preserve every scrap',copy:'Treat the manor as a crime scene and let the evidence establish the truth.',trait:'Methodical',result:'You secured the evidence before confronting anyone.'},
 {id:'confront',title:'Confront the family factor immediately',copy:'Apply pressure before the guilty party has time to coordinate another lie.',trait:'Boldness',result:'You forced the household’s agent into an early mistake.'}
];
const finalChoices=[
 {id:'public',title:'Demand a public accounting',copy:'Return the money, clear the accused servant’s name, and let the family endure the embarrassment.',trait:'Justice',result:'You required a public accounting and restored the accused servant’s name.',resolution:'The guilty relative confessed before the household. The missing funds were restored, the accused servant was publicly cleared, and your family learned that your loyalty would never require concealing injustice.'},
 {id:'mercy',title:'Accept restitution and exile the culprit quietly',copy:'Protect the innocent and recover the funds without destroying another branch of the family.',trait:'Mercy',result:'You chose restitution and quiet exile over public punishment.',resolution:'The missing funds were restored and the accused servant was compensated. The culprit left Solaris under a private family judgment, owing your guild a debt that may matter later.'},
 {id:'leverage',title:'Keep the secret as leverage',copy:'Restore the money, protect the servant, and retain proof that can secure future cooperation.',trait:'Pragmatism',result:'You kept the truth in reserve and turned it into political leverage.',resolution:'The funds returned without scandal, the accused servant was protected, and your guild kept the evidence. Your family is grateful, uneasy, and newly aware that you understand how power is traded.'}
];
function choose(id){const data=story(),options=data.step===0?firstChoices:finalChoices,choice=options.find(x=>x.id===id);if(!choice)return;data.choices[data.step]=choice;data.step++;saveStory(data);renderNarrative()}
function finish(){const data=story();if(data.choices.length<2)return;const p=profile();for(const choice of data.choices)p.traits[choice.trait]=(p.traits[choice.trait]||0)+1;p.decisions.push({contract:'family-call',choices:data.choices.map(x=>x.id),at:new Date().toISOString()});localStorage.setItem(PROFILE_KEY,JSON.stringify(p));const f=founder(),last=data.choices[1];if(last.id==='public'){window.changeFactionReputation?.('free_companies',3,'Publicly defended an innocent household servant');window.changeFactionReputation?.('solarius',1,'Upheld a transparent noble accounting')}else if(last.id==='mercy'){window.changeFactionReputation?.('luminous_church',3,'Chose restitution and mercy in a family judgment')}else if(last.id==='leverage'){window.changeFactionReputation?.('gloam_court',3,'Demonstrated a talent for secrets and leverage');window.changeFactionReputation?.('solarius',-1,'Kept noble evidence outside official channels')}if(window.completeNarrativeContract?.('family-call',{title:title(),issuer:`${f.house} family council`,resolution:last.resolution,choices:data.choices.map(x=>x.result)})){localStorage.removeItem(STORY_KEY);window.toast?.('Your decision has been recorded.')}}
function renderNarrative(){const root=document.getElementById('contractsContent');if(!root)return;const data=story(),f=founder(),scene=sceneCopy(data),options=data.step===0?firstChoices:data.step===1?finalChoices:[];root.innerHTML=`<section class="narrative-contract"><header class="narrative-banner"><div><small>${scene.eyebrow}</small><h2>${scene.heading}</h2><p>${f.name} · ${f.guild}</p></div></header><div class="narrative-body"><div class="narrative-progress">${[0,1,2].map((_,i)=>`<i class="${i<=data.step?'done':''}"></i>`).join('')}</div><article class="narrative-scene"><h3>${scene.heading}</h3><p>${scene.copy}</p></article>${options.length?`<div class="narrative-choices">${options.map(x=>`<button class="narrative-choice" onclick="chooseFamilyStory('${x.id}')"><b>${x.title}</b><small>${x.copy}</small></button>`).join('')}</div>`:`<div class="narrative-profile-preview"><b>Your decision is ready</b><p>${data.choices.map(x=>x.result).join(' ')}</p></div>`}<div class="narrative-actions"><button class="button secondary" onclick="showContractsPage()">Return to contracts</button>${data.step>=2?'<button class="button green" onclick="finishFamilyStory()">Record this resolution</button>':''}</div></div></section>`;window.scrollTo({top:0,behavior:'smooth'})}
window.beginNarrativeContract=function(id){if(id==='family-call')renderNarrative()};window.chooseFamilyStory=choose;window.finishFamilyStory=finish;
const originalShowContracts=window.showContractsPage;
if(typeof originalShowContracts==='function'){
  window.showContractsPage=function(){
    const result=originalShowContracts.apply(this,arguments);
    requestAnimationFrame(decorate);
    return result;
  };
}
document.addEventListener('click',function(event){
  if(event.target.closest('[data-page="contracts"], [onclick*="showContractsPage"]')){
    requestAnimationFrame(decorate);
  }
});
decorate();
})();


/* ===== campaign-flow.js ===== */
(function(){
'use strict';
const LOCATION_KEY='wayfarer-map-location-v1';
function progress(){try{const raw=JSON.parse(localStorage.getItem('wayfarer-contracts-v1')||'null');return Array.isArray(raw?.completed)?raw.completed.length:0}catch{return 0}}
function guildHallActive(){return document.getElementById('home')?.classList.contains('active')}
function syncGuildOperations(){const panel=document.getElementById('guildRoomsDropdown');if(panel)panel.hidden=!guildHallActive()}
function routeNeeded(id){return id==='greenway'?1:id==='mosslight'?4:id==='ashen'?5:id==='sepulcher'?6:0}
function routeUnlocked(id){return progress()>=routeNeeded(id)}
function syncRoutes(){document.querySelectorAll('.map-location[data-location]').forEach(pin=>{const id=pin.dataset.location,hidden=id!=='solaris'&&!routeUnlocked(id);pin.classList.toggle('route-hidden',hidden);pin.setAttribute('aria-hidden',hidden?'true':'false')});const expedition=document.querySelector('.nav button[data-page="dungeon"]');if(expedition)expedition.hidden=progress()<2;const count=document.querySelector('.world-scale strong');if(count)count.textContent=String(1+['mosslight','ashen','sepulcher'].filter(routeUnlocked).length)}
function stage(){return document.querySelector('.map-stage')||document.querySelector('.continent-canvas')}
function currentLocation(){return localStorage.getItem(LOCATION_KEY)||'solaris'}
function markerTarget(id){return document.querySelector(`[data-location="${id}"]`)||document.querySelector(`[data-new-place="${id}"]`)}
function moveMarker(id,notify=true){const target=markerTarget(id),map=stage();if(!target||!map)return;let marker=map.querySelector('.map-player-location');if(!marker){marker=document.createElement('div');marker.className='map-player-location';marker.innerHTML='♙';map.append(marker)}marker.style.left=target.style.left;marker.style.top=target.style.top;localStorage.setItem(LOCATION_KEY,id);if(notify){const label=target.querySelector('span')?.childNodes?.[0]?.textContent?.trim()||id;window.toast?.(`Party location: ${label}`)}document.querySelectorAll('.mapped-location,.map-location').forEach(node=>node.classList.toggle('party-here',node===target))}
function installMapTravel(){const map=stage();if(!map||map.dataset.partyTravelInstalled)return;map.dataset.partyTravelInstalled='1';syncRoutes();moveMarker(currentLocation(),false);const solaris=map.querySelector('[data-location="solaris"]');if(solaris)solaris.onclick=()=>{moveMarker('solaris');const card=document.getElementById('routeCard');if(card)card.insertAdjacentHTML('afterbegin','<div class="location-arrival">Your party is in Solaris. Use the location button below to enter the capital.</div>')};map.querySelectorAll('[data-location]').forEach(pin=>{if(pin.dataset.location==='solaris')return;const prior=pin.onclick;pin.onclick=e=>{const id=pin.dataset.location;if(!routeUnlocked(id))return;moveMarker(id);if(typeof prior==='function')prior.call(pin,e)}});map.querySelectorAll('[data-new-place]').forEach(pin=>pin.onclick=()=>moveMarker(pin.dataset.newPlace))}
const previousOpen=window.openWorldMap;window.openWorldMap=function(...args){const result=previousOpen?.apply(this,args);syncGuildOperations();syncRoutes();installMapTravel();moveMarker(currentLocation(),false);return result};
document.addEventListener('click',()=>setTimeout(()=>{syncGuildOperations();syncRoutes()},0));
syncGuildOperations();syncRoutes();installMapTravel();
})();


/* ===== chapter-one.js ===== */
(function(){
'use strict';
const KEY='wayfarer-chapter-one-v1';
const PROFILE_KEY='wayfarer-player-profile-v1';
const CONTRACT_KEY='wayfarer-contracts-v1';
const FOUNDER_KEY='wayfarer-founder-v1';

const STORIES={
 sunmarket:{
  contract:'sunmarket-ledger',
  scenes:[
   {eyebrow:'THE GRAND SUNMARKET',title:'Three Claims, One Cargo',copy:'A rain-swollen caravan has arrived with forty bolts of Elderwood silk, but three masters carry manifests naming them as the lawful owner. The Compact wants the market reopened before dusk. Porters whisper that one seal was replaced after the wagon entered Solaris.'},
   {eyebrow:'BENEATH THE INK',title:'The Altered Manifest',copy:'Your inquiry reveals that the smallest caravan paid the road toll and protected the cargo, the wealthiest factor financed it, and the third claimant bribed a clerk to replace the receiving page. The fraud is clear; ownership is not.'},
   {eyebrow:'A MARKET REMEMBERS',title:'Terms of Settlement',copy:'Every merchant in the gallery is watching. Your ruling will decide more than the fate of one wagon—it will tell Solaris whether your guild serves written law, practical fairness, or those with the least power.'}
  ],
  choices:[
   [
    {id:'ledgers',title:'Audit every manifest and toll receipt',copy:'Let documents and timestamps establish the fraud.',trait:'Methodical'},
    {id:'porters',title:'Question the porters away from their employers',copy:'Protect the witnesses and compare what they actually saw.',trait:'Compassion'},
    {id:'sting',title:'Announce a false discovery and watch the claimants react',copy:'Force the guilty party to reveal what only the forger would know.',trait:'Boldness'}
   ],
   [
    {id:'letter',title:'Enforce the financing contract',copy:'The factor receives the silk, but must pay the caravan that protected it.',trait:'Order',reps:{gilded_compact:5,marivelle:2}},
    {id:'equity',title:'Divide profit by risk and contribution',copy:'Each party receives a documented share; the bribing claimant forfeits theirs.',trait:'Justice',reps:{gilded_compact:4,free_companies:3}},
    {id:'smallfolk',title:'Award the cargo to the working caravan',copy:'The people who risked their lives receive ownership; the financier recovers only the original loan.',trait:'Compassion',reps:{free_companies:5,gilded_compact:1}}
   ]
  ]
 },
 crown:{
  contract:'crown-seal',
  scenes:[
   {eyebrow:'THE CHANCELLOR’S ANTECHAMBER',title:'A Seal That Commands Armies',copy:'The Chancellor does not ask whether your guild can find the missing courier. She asks whether it can do so without alarming the six houses. A royal seal can open gates, redirect patrols, and turn a lie into law.'},
   {eyebrow:'THE ABANDONED CART',title:'Wax, Ash, and One Survivor',copy:'The dispatch cart was staged to resemble a robbery. No valuables were taken. Emberglass dust clings to the axle, a market token lies beneath the seat, and the wounded outrider insists the attackers wore legitimate patrol colors.'},
   {eyebrow:'THE FIRST ROYAL TRUST',title:'What the Crown Should Know',copy:'You recover a forged road order directing witnesses away from the Elderwood. Someone used the stolen seal to clear a path into the Mosslight Warrens. The evidence is real, but deciding who receives it may determine who moves first.'}
  ],
  choices:[
   [
    {id:'official',title:'Work through the Crown investigators',copy:'Preserve authority and chain of custody, even if the inquiry moves slowly.',trait:'Order'},
    {id:'grey-mantle',title:'Ask a Conclave Grey Mantle to test the wax',copy:'Determine whether the seal was copied with magical assistance.',trait:'Methodical'},
    {id:'street',title:'Quietly consult the Free Companies',copy:'Find who saw the courier without alerting noble offices.',trait:'Pragmatism'}
   ],
   [
    {id:'chancellor',title:'Give the complete evidence to the Chancellor',copy:'Trust the Crown to contain the forgery and authorize pursuit.',trait:'Loyalty',reps:{solarius:7,gloam_court:-2}},
    {id:'conclave',title:'Provide the magical evidence to the Conclave as well',copy:'Independent oversight may prevent the truth from disappearing.',trait:'Accountability',reps:{solarius:4,arcane_conclave:5}},
    {id:'copies',title:'Keep a sealed copy in the guild archive',copy:'Assist the Crown, but ensure no institution can erase the evidence.',trait:'Pragmatism',reps:{solarius:3,free_companies:3,gloam_court:1}}
   ]
  ]
 }
};

function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value&&typeof value==='object'?value:fallback}catch{return fallback}}
function founder(){return read(FOUNDER_KEY,{name:'the guildmaster',guild:'the new guild',house:'a minor house'})}
function allState(){return read(KEY,{stories:{},chapterCelebrated:false})}
function saveAll(value){localStorage.setItem(KEY,JSON.stringify(value))}
function stateFor(id){const all=allState();all.stories[id]=all.stories[id]||{step:0,choices:[]};saveAll(all);return all.stories[id]}
function persistStory(id,value){const all=allState();all.stories[id]=value;saveAll(all)}
function profile(){return read(PROFILE_KEY,{traits:{},decisions:[]})}
function safe(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function activeContract(){return read(CONTRACT_KEY,{active:null}).active}
function storyByContract(id){return Object.values(STORIES).find(x=>x.contract===id)}
function storyId(story){return Object.keys(STORIES).find(id=>STORIES[id]===story)}

function choose(storyName,choiceId){
 const story=STORIES[storyName],data=stateFor(storyName),options=story.choices[data.step]||[],choice=options.find(x=>x.id===choiceId);
 if(!choice)return;
 data.choices[data.step]={...choice};data.step=Math.min(story.scenes.length-1,data.step+1);persistStory(storyName,data);renderStory(storyName)
}
function outcomeCopy(storyName,data){
 const final=data.choices[1];
 if(storyName==='sunmarket')return final?.id==='letter'?'The Compact accepts a strict commercial ruling. The working caravan is paid, the financier takes possession, and the forger is barred from bonded trade.':final?.id==='equity'?'The market adopts your division of risk and contribution. None receive everything, but every honest party leaves with a defensible share.':'The working caravan receives the silk. Powerful factors protest, while porters and guards repeat the ruling throughout the lower market.';
 return final?.id==='chancellor'?'The Chancellor seals the evidence and gives your guild a royal writ to pursue the forged order into the Elderwood.':final?.id==='conclave'?'Crown and Conclave witnesses verify the evidence together. Neither institution can quietly bury the magical trace.':'The Chancellor receives the original evidence. A witnessed copy remains beneath the guild hall, insurance against a truth that powerful people may wish forgotten.'
}
function repChanges(choice,reason){for(const [id,amount] of Object.entries(choice?.reps||{}))window.changeFactionReputation?.(id,amount,reason)}
function finish(storyName){
 const story=STORIES[storyName],data=stateFor(storyName);if(data.choices.length<2||activeContract()!==story.contract)return;
 const p=profile();for(const choice of data.choices)p.traits[choice.trait]=(p.traits[choice.trait]||0)+1;p.decisions.push({contract:story.contract,choices:data.choices.map(x=>x.id),at:new Date().toISOString()});localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
 const final=data.choices[1],resolution=outcomeCopy(storyName,data);repChanges(final,storyName==='sunmarket'?'Resolved the Sunmarket dispute':'Recovered evidence of the missing royal seal');
 if(storyName==='crown'){const first=data.choices[0];if(first.id==='grey-mantle')window.changeFactionReputation?.('arcane_conclave',2,'Consulted the Conclave during the seal inquiry');if(first.id==='street')window.changeFactionReputation?.('free_companies',2,'Trusted field witnesses during the seal inquiry')}
 if(window.completeNarrativeContract?.(story.contract,{resolution,choices:data.choices.map(x=>`${x.title} — ${x.copy}`)})){const all=allState();delete all.stories[storyName];saveAll(all);window.toast?.(`${story.scenes.at(-1).title} recorded in the campaign archive.`)}
}
function renderStory(storyName){
 const story=STORIES[storyName],data=stateFor(storyName),scene=story.scenes[data.step],options=story.choices[data.step]||[],root=document.getElementById('contractsContent'),f=founder();if(!root)return;
 const ready=data.step===story.scenes.length-1&&data.choices.length===2;
 root.innerHTML=`<section class="chapter-story"><header><div><small>${safe(scene.eyebrow)}</small><h2>${safe(scene.title)}</h2><p>${safe(f.name)} · ${safe(f.guild)}</p></div><span>SCENE ${data.step+1} / ${story.scenes.length}</span></header><div class="chapter-story-body"><div class="chapter-progress">${story.scenes.map((_,i)=>`<i class="${i<=data.step?'done':''}"></i>`).join('')}</div><article><p>${safe(scene.copy)}</p>${data.choices[0]?`<blockquote>${safe(data.choices[0].title)}</blockquote>`:''}</article>${options.length?`<div class="chapter-choices">${options.map(x=>`<button onclick="chooseChapterStory('${storyName}','${x.id}')"><b>${safe(x.title)}</b><span>${safe(x.copy)}</span></button>`).join('')}</div>`:`<section class="chapter-outcome"><small>YOUR RULING</small><p>${safe(outcomeCopy(storyName,data))}</p></section>`}<footer><button class="button secondary" onclick="showContractsPage()">Return to contracts</button>${ready?`<button class="button green" onclick="finishChapterStory('${storyName}')">Record outcome →</button>`:''}</footer></div></section>`;
 window.scrollTo({top:0,behavior:'smooth'})
}

const priorBegin=window.beginNarrativeContract;
window.beginNarrativeContract=function(id){const story=storyByContract(id);if(story)return renderStory(storyId(story));return priorBegin?.apply(this,arguments)};
window.chooseChapterStory=choose;
window.finishChapterStory=finish;

function chapterComplete(){return read(CONTRACT_KEY,{completed:[]}).completed?.some(x=>x.id==='mosslight-bloom')}
function addChapterEpilogue(){
 const all=allState();if(all.chapterCelebrated||!chapterComplete())return;const report=document.querySelector('#run .report');if(!report)return;
 all.chapterCelebrated=true;saveAll(all);const f=founder();report.insertAdjacentHTML('afterbegin',`<section class="chapter-finale"><small>CHAPTER I COMPLETE</small><h2>A Guild Worth Naming</h2><p>${safe(f.guild)} returns to Solaris with the forged dispatches, the Chancellor’s recognition, and its first hard-won place in the politics of Lumara.</p><div><b>The Elderwood road is open.</b><span>The Ashen Observatory campaign route is now available.</span></div><button class="button" onclick="showContractsPage();contractTab('timeline')">Review Chapter I timeline</button></section>`)
}
const priorFinish=window.finishRun;
if(typeof priorFinish==='function')window.finishRun=function(...args){const result=priorFinish.apply(this,args);setTimeout(addChapterEpilogue,0);return result};

// Existing saves that finished the former one-click versions keep their records.
// New or active contracts automatically use the authored scenes above.
})();


/* ===== faction-effects.js ===== */
(function(){
'use strict';
const POLITICS_KEY='wayfarer-politics-v1',PROFILE_KEY='wayfarer-player-profile-v1';
function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value&&typeof value==='object'?value:fallback}catch{return fallback}}
function rep(id){return Number(read(POLITICS_KEY,{relations:{}}).relations?.[id])||0}
function tier(value){return value>=60?'Allied':value>=25?'Trusted':value>=10?'Favored':value<=-60?'Hostile':value<=-25?'Disfavored':value<=-10?'Wary':'Neutral'}
function primaryTrait(){const traits=read(PROFILE_KEY,{traits:{}}).traits||{};return Object.entries(traits).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||'Unwritten'}
function identity(trait){return({Compassion:['Steward','Merciful decisions improve recovery and supplies.'],Mercy:['Peacemaker','Merciful decisions improve recovery and supplies.'],Justice:['Arbiter','Principled resolutions earn additional renown.'],Order:['Magistrate','Orderly resolutions earn additional renown.'],Loyalty:['Crownward','Loyal resolutions earn additional renown.'],Methodical:['Investigator','Careful resolutions return additional contract gold.'],Pragmatism:['Operator','Practical resolutions return additional contract gold.'],Boldness:['Vanguard','Bold resolutions earn additional renown.'],Accountability:['Witness','Transparent resolutions earn additional renown.']}[trait]||['Unproven Founder','Campaign choices will shape the guild’s public identity.'])}
function signed(n){return `${n>0?'+':''}${n}`}

function marketRate(){const value=rep('gilded_compact');return value>=60?.85:value>=25?.92:value<=-60?1.2:value<=-25?1.1:1}
function healingCost(){const value=rep('luminous_church'),trait=primaryTrait();let rate=value>=60?.75:value>=25?.9:value<=-60?1.3:value<=-25?1.15:1;if(['Compassion','Mercy'].includes(trait))rate-=.08;return Math.max(15,Math.round(25*rate))}
function factionEffect(id,value){
 const good=value>=25,bad=value<=-25;
 const effects={solarius:good?'Royal story and house contracts grant bonus renown.':bad?'Royal scrutiny reduces contract rewards.':'Royal contracts respond to the guild’s record.',luminous_church:`Cathedral healing costs ${healingCost()} gold.`,arcane_conclave:good?'The Sunmarket guarantees an arcane focus in each stock rotation.':bad?'Rare licensed magical stock is restricted.':'Arcane stock follows ordinary market availability.',gilded_compact:`Sunmarket purchase prices are ${Math.round(Math.abs(1-marketRate())*100)}% ${marketRate()<1?'lower':marketRate()>1?'higher':'unchanged'}.`,free_companies:good?'Recruitment reviews include one additional candidate.':bad?'Independent companies withhold field recommendations.':'Recruitment uses the standard candidate list.',verdant_covenant:good?'Nature-aligned campaign rewards include bonus medicinal herbs.':bad?'Rare herbal support is unavailable.':'Herbal support follows normal availability.',gloam_court:good?'Certain secretive choices may reveal covert advantages.':bad?'The underworld is actively hostile to the guild.':'The Court watches without committing.',ashen_ledger:good?'Campaign salvage may include an extra forging material.':bad?'Contraband suppliers avoid the guild.':'No illicit supply arrangement is active.',blackwake:good?'Coastal rewards may include foreign equipment.':bad?'Coastal shipments face increased interference.':'The Syndicate has no active arrangement with the guild.'};
 return effects[id]||'Standing may alter future contracts and services.'
}
function activeRelations(){const relations=read(POLITICS_KEY,{relations:{}}).relations||{};return Object.entries(relations).filter(([,value])=>Math.abs(Number(value)||0)>=10).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))}
function renderInfluence(){
 const home=document.getElementById('home');if(!home)return;let panel=document.getElementById('guildInfluencePanel');if(!panel){panel=document.createElement('section');panel.id='guildInfluencePanel';panel.className='guild-influence-panel';home.querySelector('.welcome')?.after(panel)}
 const trait=primaryTrait(),identityData=identity(trait),relations=activeRelations();
 panel.innerHTML=`<header><div><small>GUILD IDENTITY</small><h2>${identityData[0]}</h2><p>${identityData[1]}</p></div><button class="button secondary" onclick="showCodexPage();setTimeout(()=>codexTab('politics'),0)">Political records →</button></header><div class="guild-influence-grid"><article><b>Founder’s strongest tendency</b><span>${trait}</span><small>Shaped quietly by campaign decisions. It never changes the wording of choices before you make them.</small></article>${relations.length?relations.slice(0,4).map(([id,value])=>{const faction=window.WAYFARER_FACTIONS?.[id];return `<article style="--faction:${faction?.color||'#b79b63'}">${typeof factionArt==='function'?factionArt(id,'medium'):''}<div><b>${faction?.short||id}</b><span>${tier(value)} · ${signed(value)}</span><small>${factionEffect(id,value)}</small></div></article>`}).join(''):'<article class="neutral"><b>No committed alliances</b><span>Neutral</span><small>Campaign decisions and faction contracts will create visible advantages and penalties here.</small></article>'}</div>`
}

function ensureArcaneStock(){
 if(rep('arcane_conclave')<25||!window.wayfarerGearState||typeof guildRankInfo!=='function')return;
 const s=window.wayfarerGearState;if((s.market||[]).some(id=>['wand','spellbook','staff'].includes(gearItem(id)?.weaponType)))return;
 const level=Math.max(1,guildRankInfo().tier+1),id='conclave-'+Date.now().toString(36),item={id,name:'Conclave-Inspected Spellbook',slot:'weapon',slotKey:'offHand',weaponType:'spellbook',rarity:rep('arcane_conclave')>=60?'Rare':'Uncommon',level,stats:{power:1,armor:0,maxHp:0,critChance:0,elementDamage:2},element:['Fire','Frost','Storm'][Math.floor(Math.random()*3)],effect:null};s.items.push(item);s.market.push(id);typeof gearPersist==='function'&&gearPersist()
}
const priorEnsure=window.ensureMarketStock;
if(typeof priorEnsure==='function')window.ensureMarketStock=function(...args){const result=priorEnsure.apply(this,args);ensureArcaneStock();return result};
const priorMarketRender=window.renderMarketPage;
if(typeof priorMarketRender==='function')window.renderMarketPage=function(...args){ensureArcaneStock();const result=priorMarketRender.apply(this,args),rate=marketRate(),page=document.getElementById('market');if(!page)return result;let note=page.querySelector('.faction-market-note');if(!note){note=document.createElement('div');note.className='faction-market-note';page.querySelector('.welcome')?.after(note)}const compact=rep('gilded_compact');note.innerHTML=`<b>Gilded Compact standing: ${tier(compact)} ${signed(compact)}</b><span>${rate===1?'Standard purchase prices.':`${Math.round(Math.abs(1-rate)*100)}% ${rate<1?'discount':'surcharge'} applied to purchases.`}${rep('arcane_conclave')>=25?' Conclave standing guarantees inspected arcane stock.':''}</span>`;for(const id of window.wayfarerGearState.market||[]){const item=gearItem(id),button=page.querySelector(`button[onclick="buyMarketGear('${id}')"]`);if(item&&button)button.textContent=`Buy · ${Math.max(1,Math.round(gearMarketPrice(item)*rate))}g`}return result};
const priorBuy=window.buyMarketGear;
if(typeof priorBuy==='function')window.buyMarketGear=function(id){const s=window.wayfarerGearState,item=gearItem(id);if(!item||!s.market.includes(id))return;const price=Math.max(1,Math.round(gearMarketPrice(item)*marketRate()));if(gold<price)return toast('Not enough gold.');gold-=price;s.market=s.market.filter(x=>x!==id);s.inventory.push(id);save();renderMarketPage();renderResources();toast(`${item.name} added to the guild stash for ${price} gold.`)};

const priorCityService=window.cityService;
if(typeof priorCityService==='function')window.cityService=function(action){if(action!=='heal')return priorCityService.apply(this,arguments);const cost=healingCost();if(gold<cost)return toast(`The cathedral requests a ${cost} gold offering.`);gold-=cost;for(const h of heroes)if(h.hp>0)h.hp=typeof gearEffectiveMaxHp==='function'?gearEffectiveMaxHp(h):h.maxHp;if(typeof persistBuild==='function')persistBuild();else save();renderResources();typeof renderAll==='function'&&renderAll();toast(`Church standing applied: the roster was restored for ${cost} gold.`)};

const priorShowRecruits=window.showRecruits;
if(typeof priorShowRecruits==='function')window.showRecruits=function(...args){const result=priorShowRecruits.apply(this,args);if(rep('free_companies')>=25&&Array.isArray(recruitOffers)&&recruitOffers.length===3){const origins=Object.keys(backgroundClass),origin=origins[Math.floor(Math.random()*origins.length)],cls=backgroundClass[origin];recruitOffers.push({name:recruitNames[Math.floor(Math.random()*recruitNames.length)],origin,cls,perk:classProfiles[cls].perk,id:Date.now()+4});typeof renderGuildExpansion==='function'&&renderGuildExpansion();typeof persistBuild==='function'&&persistBuild()}return result};

const priorNarrativeComplete=window.completeNarrativeContract;
if(typeof priorNarrativeComplete==='function')window.completeNarrativeContract=function(id,snapshot){const beforeGold=Number(gold)||0,beforeRenown=Number(renown)||0,result=priorNarrativeComplete.apply(this,arguments);if(!result)return result;const trait=primaryTrait(),goldGain=Math.max(0,(Number(gold)||0)-beforeGold);let message='';if(['Methodical','Pragmatism'].includes(trait)&&goldGain){const bonus=Math.max(2,Math.round(goldGain*.1));gold+=bonus;message=`${identity(trait)[0]}: +${bonus} bonus gold.`}else if(['Justice','Order','Loyalty','Boldness','Accountability'].includes(trait)){renown=Math.max(Number(renown)||0,beforeRenown)+1;message=`${identity(trait)[0]}: +1 bonus renown.`}else if(['Compassion','Mercy'].includes(trait)&&typeof apothecary!=='undefined'){apothecary.items.potion=(apothecary.items.potion||0)+1;typeof saveApothecary==='function'&&saveApothecary();message=`${identity(trait)[0]}: the Church provides 1 healing potion.`}if(message){typeof save==='function'&&save();renderResources();toast(message)}renderInfluence();return result};

const priorRenderAll=window.renderAll;
if(typeof priorRenderAll==='function')window.renderAll=function(...args){const result=priorRenderAll.apply(this,args);renderInfluence();return result};
window.wayfarerFactionEffect=function(id){return factionEffect(id,rep(id))};
window.renderGuildInfluence=renderInfluence;
renderInfluence();
})();


/* ===== tactical-objectives.js ===== */
(function(){
'use strict';
const CONTRACT_KEY='wayfarer-contracts-v1';
function contract(){try{return JSON.parse(localStorage.getItem(CONTRACT_KEY)||'null')?.active||null}catch{return null}}
function aliveHeroes(b){return b.heroes.filter(u=>heroes.find(h=>h.id===u.id)?.hp>0)}
function openEnemyTile(b){const occupied=new Set([...b.heroes,...b.foes,...(b.obstacles||[])].filter(x=>x&&Number.isFinite(x.x)).map(x=>`${x.x},${x.y}`));for(let x=FIELD_W-2;x>=Math.max(1,FIELD_W-5);x--)for(let y=1;y<FIELD_H-1;y++)if((!b.roomTiles||b.roomTiles[y*FIELD_W+x]!==false)&&!occupied.has(`${x},${y}`))return{x,y};return{x:FIELD_W-2,y:1}}
function reinforcement(b,label='Enemy reinforcement'){
 const source=b.foes.find(f=>f.maxHp>0)||{},spot=openEnemyTile(b),n=(b.reinforcementCount||0)+1;b.reinforcementCount=n;
 const foe={...source,id:`objective-wave-${b.round}-${n}`,name:label,role:n%2?'skirmisher':'ranged',boss:false,hp:Math.max(12,Math.round((source.maxHp||20)*.8)),maxHp:Math.max(12,Math.round((source.maxHp||20)*.8)),power:Math.max(3,(source.power||5)-1),attackRange:n%2?1:4,move:n%2?4:3,x:spot.x,y:spot.y,facing:'W',team:'enemy',revived:false};b.foes.push(foe);return foe
}
function priorityTarget(b){return b.foes.find(f=>f.role==='support'&&f.hp>0)||b.foes.find(f=>f.role==='ranged'&&f.hp>0)||b.foes.find(f=>f.hp>0)}
function assignObjective(r,b){
 const active=contract(),boss=!!(b.finalBossRoom||b.roomType==='☠');let objective;
 if(active==='greenway-patrol'&&r.dungeon.id==='greenway')objective={id:'hold',title:'Hold Greenway Crossing',description:'Break four assault waves and keep the road in guild hands.',targetRound:4,reward:'15 bonus gold · roadwarden commendation'};
 else if(active==='mosslight-bloom'&&r.dungeon.id==='mosslight'&&boss){const leader=b.foes.find(f=>f.boss)||b.foes[0];objective={id:'commander',title:'Recover the Forged Dispatches',description:`Defeat ${leader?.name||'the chamber guardian'}. Its remaining allies will break when their leader falls.`,leaderId:leader?.id,reward:'1 bonus find · recovered royal evidence'};}
 else if(boss){const leader=b.foes.find(f=>f.boss)||b.foes[0];objective={id:'boss-tempo',title:'Break the Guardian’s Momentum',description:`Defeat ${leader?.name||'the guardian'} by the end of round 6 for a flawless assault bonus.`,leaderId:leader?.id,targetRound:6,reward:'20 bonus gold'};}
 else if(r.step%3===0){const target=priorityTarget(b);objective={id:'priority',title:'Priority Target',description:`Defeat ${target?.name||'the enemy specialist'} before the end of round 4.`,leaderId:target?.id,targetRound:4,reward:'12 bonus gold'};}
 else if(r.step%3===1)objective={id:'reinforcement',title:'Weather the Counterattack',description:'A reinforcement wave will enter on round 3. Win without any adventurer being downed.',targetRound:3,reward:'1 bonus find'};
 else objective={id:'clean',title:'Keep the Formation Intact',description:'Win the room without any adventurer being downed.',reward:'15 bonus gold'};
 b.missionObjective=objective;b.objectiveStartedHp=Object.fromEntries(r.ids.map(id=>[id,heroes.find(h=>h.id===id)?.hp||0]));b.objectiveDowned=false;recordBattleLog(`Objective: ${objective.title} — ${objective.description}`)
}
function objectiveMet(r,b){const o=b.missionObjective;if(!o)return false;if(aliveHeroes(b).length<b.heroes.length)b.objectiveDowned=true;if(o.id==='hold')return b.round>=o.targetRound;if(o.id==='commander')return (b.foes.find(f=>f.id===o.leaderId)?.hp||0)<=0;if(o.id==='boss-tempo'||o.id==='priority')return (b.foes.find(f=>f.id===o.leaderId)?.hp||0)<=0&&b.round<=o.targetRound;if(o.id==='reinforcement'||o.id==='clean')return !b.objectiveDowned&&b.heroes.every(u=>(heroes.find(h=>h.id===u.id)?.hp||0)>0);return false}
function statusText(b){const o=b.missionObjective;if(!o)return'';if(o.id==='hold')return `Wave ${Math.min(b.objectiveWave||1,o.targetRound)} / ${o.targetRound}`;if(o.id==='priority'||o.id==='boss-tempo'||o.id==='commander'){const target=b.foes.find(f=>f.id===o.leaderId);return target?.hp>0?`${target.name}: ${target.hp}/${target.maxHp}`:'Target defeated'}if(o.id==='reinforcement')return b.reinforcementArrived?'Reinforcements engaged':'Wave arrives round 3';return b.objectiveDowned?'Formation broken':'No adventurers downed'}

const priorBegin=window.beginBattle;
window.beginBattle=function(...args){const result=priorBegin.apply(this,args),r=runState,b=r?.battle;if(b&&!b.missionObjective){assignObjective(r,b);renderRun()}return result};
const priorRound=window.startHeroRound;
window.startHeroRound=function(...args){const result=priorRound.apply(this,args),b=runState?.battle,o=b?.missionObjective;if(!b||!o)return result;if(aliveHeroes(b).length<b.heroes.length)b.objectiveDowned=true;if(o.id==='reinforcement'&&b.round>=3&&!b.reinforcementArrived){b.reinforcementArrived=true;const foe=reinforcement(b,'Enemy Reserve');recordBattleLog(`${foe.name} enters from the far edge of the field.`);renderRun()}return result};
const priorWin=window.winBattle;
window.winBattle=function(...args){const r=runState,b=r?.battle,o=b?.missionObjective;if(!r||!b)return priorWin.apply(this,args);if(o?.id==='hold'){b.objectiveWave=b.objectiveWave||1;if(b.objectiveWave<o.targetRound){b.objectiveWave++;b.round++;const foe=reinforcement(b,`Greenway Raider · Wave ${b.objectiveWave}`);recordBattleLog(`${foe.name} rushes in. ${o.targetRound-b.objectiveWave} assault wave${o.targetRound-b.objectiveWave===1?' remains':'s remain'}.`);b.turn='heroes';b.heroes.forEach(u=>{u.done=false;u.ap=heroes.find(h=>h.id===u.id)?.staminaMax||3;u.moved=false;u.acted=false;u.moveActions=0;u.attackActions=0});renderRun();if(r.mode==='ai')setTimeout(aiBattleStep,250);return}}const met=objectiveMet(r,b),title=o?.title,kind=o?.id,result=priorWin.apply(this,args);if(title&&met&&!b.objectivePaid){b.objectivePaid=true;let message='';if(['commander','reinforcement'].includes(kind)){r.loot=(r.loot||0)+1;message=`Objective complete: ${title}. +1 bonus find.`}else{const amount=kind==='boss-tempo'?20:kind==='hold'||kind==='clean'?15:12;gold+=amount;message=`Objective complete: ${title}. +${amount} gold.`}r.objectiveRewards=r.objectiveRewards||[];r.objectiveRewards.push(message);typeof save==='function'&&save();recordBattleLog(message);renderResources();renderRun()}return result};
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args),b=runState?.battle,o=b?.missionObjective,panel=document.getElementById('battlePanel');if(!b||!o||!panel)return result;if(b.heroes.some(u=>(heroes.find(h=>h.id===u.id)?.hp||0)<=0))b.objectiveDowned=true;let banner=panel.querySelector('.mission-objective-banner');if(!banner){banner=document.createElement('section');banner.className='mission-objective-banner';panel.querySelector('.battlehead')?.after(banner)}banner.classList.toggle('failed',b.objectiveDowned&&['clean','reinforcement'].includes(o.id));banner.innerHTML=`<div><small>ROOM OBJECTIVE</small><b>${o.title}</b><span>${o.description}</span></div><strong>${statusText(b)}<small>${o.reward}</small></strong>`;if(o.id==='commander'){const leader=b.foes.find(f=>f.id===o.leaderId);if(leader&&leader.hp<=0&&!b.objectiveResolving&&b.foes.some(f=>f.hp>0)){b.objectiveResolving=true;for(const foe of b.foes)foe.hp=0;recordBattleLog(`${leader.name} falls. The remaining enemies break and flee.`);setTimeout(()=>window.winBattle(),0)}}return result};
})();


/* ===== combat-consolidation.js ===== */
(function(){
'use strict';
const ENGINE_VERSION='1.0.0',STALL_MS=5000,MAX_RECOVERIES=4;
let serial=0,last={battle:null,signature:'',at:Date.now()};
function battle(){return window.runState?.battle||null}
function livingHeroes(b){return (b?.heroes||[]).filter(u=>(heroes.find(h=>h.id===u.id)?.hp||0)>0)}
function livingFoes(b){return (b?.foes||[]).filter(f=>(f.hp||0)>0)}
function signature(b){return b?[b.engineSessionId,b.round,b.turn,activeBattleHero?.()?.id||'',livingHeroes(b).map(u=>`${u.id}:${heroes.find(h=>h.id===u.id)?.hp||0}`).join(','),livingFoes(b).map(f=>`${f.id}:${f.hp}`).join(','),(b.enemyQueue||[]).join(',')].join('|'):'no-battle'}
function markProgress(b=battle()){const next=signature(b);if(last.battle!==b||last.signature!==next)last={battle:b,signature:next,at:Date.now()};return next}
function normalize(b){
 if(!b)return[];const repairs=[];b.round=Math.max(1,Number(b.round)||1);if(!['heroes','enemies'].includes(b.turn)){b.turn='heroes';repairs.push('turn')}
 for(const foe of b.foes||[]){foe.maxHp=Math.max(1,Number(foe.maxHp)||Number(foe.hp)||1);foe.hp=Math.max(0,Math.min(foe.maxHp,Number(foe.hp)||0));foe.move=Math.max(1,Number(foe.move)||1);foe.attackRange=Math.max(1,Number(foe.attackRange)||1)}
 for(const unit of b.heroes||[]){const h=heroes.find(hero=>hero.id===unit.id);if(!h)continue;h.maxHp=Math.max(1,Number(h.maxHp)||1);h.hp=Math.max(0,Math.min(h.maxHp,Number(h.hp)||0));unit.ap=Math.max(0,Number(unit.ap)||0)}
 if(b.turn==='enemies'){const alive=new Set(livingFoes(b).map(f=>f.id)),seen=new Set();const clean=(b.enemyQueue||[]).filter(id=>alive.has(id)&&!seen.has(id)&&seen.add(id));if(clean.length!==(b.enemyQueue||[]).length){b.enemyQueue=clean;repairs.push('queue')}}
 return repairs
}
function audit(b=battle()){
 if(!b)return{engine:ENGINE_VERSION,state:'idle',healthy:true,issues:[]};const issues=[];
 if(!['heroes','enemies'].includes(b.turn))issues.push('invalid-turn');
 if(!livingHeroes(b).length)issues.push('party-defeated');
 if(!livingFoes(b).length)issues.push('enemies-defeated');
 if(b.turn==='enemies'&&(b.enemyQueue||[]).some(id=>!livingFoes(b).some(f=>f.id===id)))issues.push('stale-enemy-queue');
 if(b.turn==='heroes'&&runState.mode==='ai'&&!activeBattleHero())issues.push('hero-phase-complete');
 return{engine:ENGINE_VERSION,session:b.engineSessionId||null,state:b.turn,round:b.round,healthy:!issues.length,issues,recoveries:b.engineRecoveries||0}
}
function resolveTerminal(b){if(!b||b!==battle())return true;if(!livingHeroes(b).length){window.loseBattle();return true}if(!livingFoes(b).length){window.winBattle();return true}return false}
const priorBegin=window.beginBattle;
window.beginBattle=function(...args){const result=priorBegin.apply(this,args),b=battle();if(b){b.engineSessionId=`battle-${Date.now().toString(36)}-${++serial}`;b.engineRecoveries=0;b.engineStartedAt=Date.now();normalize(b);markProgress(b);window.Wayfarer?.emit?.('combat:started',audit(b))}return result};
const priorWin=window.winBattle;
window.winBattle=function(...args){const b=battle();if(!b)return priorWin.apply(this,args);if(b.engineResolutionLock)return;b.engineResolutionLock='win';try{return priorWin.apply(this,args)}finally{if(battle()===b){delete b.engineResolutionLock;normalize(b);markProgress(b)}else window.Wayfarer?.emit?.('combat:ended',{session:b.engineSessionId,outcome:'victory'})}};
const priorLose=window.loseBattle;
window.loseBattle=function(...args){const b=battle();if(!b)return priorLose.apply(this,args);if(b.engineResolutionLock)return;b.engineResolutionLock='loss';try{return priorLose.apply(this,args)}finally{if(battle()===b){delete b.engineResolutionLock;normalize(b);markProgress(b)}else window.Wayfarer?.emit?.('combat:ended',{session:b.engineSessionId,outcome:'defeat'})}};
const priorHeroRound=window.startHeroRound;
window.startHeroRound=function(...args){const b=battle();if(b&&resolveTerminal(b))return;const result=priorHeroRound.apply(this,args);normalize(battle());markProgress();return result};
const priorEnemyRound=window.startEnemyRound;
window.startEnemyRound=function(...args){const b=battle();if(b&&resolveTerminal(b))return;const result=priorEnemyRound.apply(this,args),current=battle();if(current){normalize(current);if(current.turn==='enemies'&&!current.enemyQueue?.length)current.enemyQueue=livingFoes(current).map(f=>f.id)}markProgress(current);return result};
const priorEnemyStep=window.enemyBattleStep;
window.enemyBattleStep=function(...args){const b=battle();if(!b||resolveTerminal(b))return;normalize(b);const result=priorEnemyStep.apply(this,args);normalize(battle());markProgress();return result};
const priorAiStep=window.aiBattleStep;
window.aiBattleStep=function(...args){const b=battle();if(!b||resolveTerminal(b))return;normalize(b);const result=priorAiStep.apply(this,args);normalize(battle());markProgress();return result};
const priorLog=window.recordBattleLog;
window.recordBattleLog=function(...args){const result=priorLog.apply(this,args);markProgress();return result};
function recover(){
 const b=battle();if(!b||b.inspectPaused||document.hidden)return;if(resolveTerminal(b))return;const now=Date.now(),sig=signature(b);if(last.battle!==b||last.signature!==sig){last={battle:b,signature:sig,at:now};return}if(now-last.at<STALL_MS)return;
 b.engineRecoveries=(b.engineRecoveries||0)+1;if(b.engineRecoveries>MAX_RECOVERIES){last.at=now;return}
 normalize(b);recordBattleLog(`Combat flow recovered automatically (${b.engineRecoveries}/${MAX_RECOVERIES}).`);
 if(b.turn==='enemies'){if(!b.enemyQueue?.length)b.enemyQueue=livingFoes(b).map(f=>f.id);if(b.enemyQueue.length)setTimeout(()=>window.enemyBattleStep(),40);else setTimeout(()=>window.startHeroRound(),40)}
 else if(runState.mode==='ai'){if(activeBattleHero())setTimeout(()=>window.aiBattleStep(),40);else setTimeout(()=>window.startEnemyRound(),40)}
 markProgress(b);window.Wayfarer?.emit?.('combat:recovered',audit(b))
}
setInterval(recover,1250);
window.WayfarerCombat=Object.freeze({version:ENGINE_VERSION,audit,normalize:()=>normalize(battle()),recover});
})();


/* ===== combat-polish.js ===== */
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
window.recordBattleLog=function(message,...args){const result=priorLog.call(this,message,...args),kind=classifyLog(message);if(kind){visualFx(kind);richSfx(kind)}return result};
const priorRender=window.renderBattle;
window.renderBattle=function(...args){const result=priorRender.apply(this,args),panel=document.getElementById('battlePanel'),b=runState?.battle;if(!panel||!b)return result;panel.classList.add('combat-polish');panel.dataset.turn=b.turn;const actor=activeBattleHero?.();if(actor){const grid=panel.querySelector('.battlegrid'),cell=grid?.children?.[actor.y*FIELD_W+actor.x];cell?.classList.add('current-actor')}return result};
document.addEventListener('pointerdown',event=>{if(event.target.closest?.('#battlePanel button')&&audioContext?.state==='suspended')audioContext.resume?.().catch(()=>{})},{passive:true});
window.WayfarerCombatFx=Object.freeze({version:'1.0.0',play:richSfx,flash:visualFx});
})();


/* ===== battle-models.js ===== */
(function(){
'use strict';
let lastVisualEvent='';
const staticSprite=window.spriteMarkup;
function coreModel(h){return h&&!CUSTOM_ART_JOBS?.includes?.(h.currentJob)}
function modelIndex(h,fallback=0){const index=HERO_SPRITE_JOBS.indexOf(visualJobFor(h));return index>=0?index:Math.max(0,fallback)}
function tacticalMarkup(h,index,extra=''){const i=modelIndex(h,index),x=i%4,y=Math.floor(i/4);return `<span aria-hidden="true" class="unit-sprite hero-sprite tactical-model ${extra}" style="--sprite-x:${x/3*100}%;--sprite-y:${y/2*100}%;background-image:url('./assets/tactical-${appearanceId(h)}-v1.webp');background-size:400% 300%"></span>`}
window.spriteMarkup=function(kind,index,extra='',h=null){if(kind==='hero'&&h&&coreModel(h))return tacticalMarkup(h,index,extra);return staticSprite(kind,index,extra,h)};
function cellAt(grid,u){return u&&grid?.children?.[u.y*FIELD_W+u.x]}
function livingHero(b,id){const u=b.heroes.find(u=>u.id===id);return u&&(heroes.find(h=>h.id===u.id)?.hp||0)>0?u:null}
function livingFoe(b,id){return b.foes.find(f=>f.id===id&&f.hp>0)||null}
function markEvent(b,grid){const event=b.visualEvent;if(!event?.at)return;const key=`${b.engineSessionId||''}:${event.at}:${event.kind}`;if(key===lastVisualEvent)return;lastVisualEvent=key;const source=livingHero(b,event.sourceId)||livingFoe(b,event.sourceId),target=livingHero(b,event.targetId)||livingFoe(b,event.targetId),sourceCell=cellAt(grid,source),targetCell=cellAt(grid,target);if(sourceCell){sourceCell.classList.add(event.kind==='hit'?'model-attacking-enemy':'model-acting');setTimeout(()=>sourceCell.classList.remove('model-acting','model-attacking-enemy'),520)}if(targetCell){targetCell.classList.add('model-struck');setTimeout(()=>targetCell.classList.remove('model-struck'),520)}}
function addDownedModels(b,grid){for(const unit of b.heroes){const h=heroes.find(h=>h.id===unit.id);if(!h||h.hp>0)continue;const cell=cellAt(grid,unit);if(!cell||cell.querySelector('.unit-sprite')||cell.classList.contains('void-cell'))continue;cell.classList.add('downed-model-cell');cell.insertAdjacentHTML('beforeend',window.spriteMarkup('hero',modelIndex(h),'model-downed',h))}}
const modelRender=window.renderBattle;
window.renderBattle=function(...args){const result=modelRender.apply(this,args),b=runState?.battle,panel=document.getElementById('battlePanel'),grid=panel?.querySelector('.battlegrid');if(!b||!grid)return result;panel.classList.add('living-model-combat');b.heroes.forEach((u,i)=>{const h=heroes.find(h=>h.id===u.id),cell=cellAt(grid,u),model=cell?.querySelector('.unit-sprite');if(!h||h.hp<=0||!model)return;cell.classList.add('hero-model-cell');model.classList.add('battle-model-live');model.style.setProperty('--model-delay',`${-(i*.31)%2.4}s`)});b.foes.forEach((f,i)=>{const cell=f.hp>0&&cellAt(grid,f),model=cell?.querySelector('.unit-sprite');if(!model)return;cell.classList.add('enemy-model-cell');model.classList.add('battle-model-live','enemy-battle-model');model.style.setProperty('--model-delay',`${-((i+.5)*.27)%2.4}s`)});addDownedModels(b,grid);markEvent(b,grid);return result};
})();
