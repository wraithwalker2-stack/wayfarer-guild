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
   {eyebrow:'THE GRAND SUNMARKET',title:'Three Claims, One Cargo',copy:'A rain-soaked caravan has arrived with forty bolts of Elderwood silk, but three masters carry manifests naming them as the lawful owner. The Compact wants the market reopened before dusk. Porters whisper that one seal was replaced after the wagon entered Solaris.'},
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
 data.choices[data.step]={...choice};data.step=Math.min(story.scenes.length-1,data.step+1);persistStory(storyName,data);renderStory(storyName,true)
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
function renderStory(storyName,preserveScroll=false){
 const pageY=window.scrollY;
 const story=STORIES[storyName],data=stateFor(storyName),scene=story.scenes[data.step],options=story.choices[data.step]||[],root=document.getElementById('contractsContent'),f=founder();if(!root)return;
 const ready=data.step===story.scenes.length-1&&data.choices.length===2;
 root.innerHTML=`<section class="chapter-story"><header><div><small>${safe(scene.eyebrow)}</small><h2>${safe(scene.title)}</h2><p>${safe(f.name)} · ${safe(f.guild)}</p></div><span>SCENE ${data.step+1} / ${story.scenes.length}</span></header><div class="chapter-story-body"><div class="chapter-progress">${story.scenes.map((_,i)=>`<i class="${i<=data.step?'done':''}"></i>`).join('')}</div><article><p>${safe(scene.copy)}</p>${data.choices[0]?`<blockquote>${safe(data.choices[0].title)}</blockquote>`:''}</article>${options.length?`<div class="chapter-choices">${options.map(x=>`<button onclick="chooseChapterStory('${storyName}','${x.id}')"><b>${safe(x.title)}</b><span>${safe(x.copy)}</span></button>`).join('')}</div>`:`<section class="chapter-outcome"><small>YOUR RULING</small><p>${safe(outcomeCopy(storyName,data))}</p></section>`}<footer><button class="button secondary" onclick="showContractsPage()">Return to contracts</button>${ready?`<button class="button green" onclick="finishChapterStory('${storyName}')">Record outcome →</button>`:''}</footer></div></section>`;
 requestAnimationFrame(()=>window.scrollTo({top:preserveScroll?pageY:0,behavior:preserveScroll?'auto':'smooth'}))
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

