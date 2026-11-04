/* A single, guarded job dispatch path replaces the accumulated prototype wrappers. */
(function(){
'use strict';
let dispatching=false;

function relations(){
 try{return JSON.parse(localStorage.getItem('wayfarer-politics-v1')||'{}').relations||{}}
 catch{return {}}
}
function politicalModifiers(job){
 const r=relations(),standing=id=>Number(r[id])||0,trusted=id=>standing(id)>=25,hostile=id=>standing(id)<=-25;
 let goldRate=1,xpRate=1,timeRate=1,renownBonus=0,scrap=0,materials=0;
 if(trusted('marivelle'))goldRate+=.1;if(hostile('marivelle'))goldRate-=.1;
 if(trusted('valcrest'))timeRate-=.1;if(hostile('valcrest'))timeRate+=.15;
 if(trusted('thornmere'))xpRate+=.1;if(hostile('thornmere'))timeRate+=.1;
 if(hostile('solarius'))goldRate-=.05;
 if(job.houseId){
  const value=standing(job.houseId);
  if(value>=60){goldRate+=.25;renownBonus++}else if(value>=25)goldRate+=.15;else if(value<=-25)goldRate-=.15;
  if(trusted('solarius'))renownBonus++;
  if(trusted('veyrath'))scrap++;if(hostile('veyrath'))goldRate-=.05;
  if(trusted('duskmere'))materials++;
 }
 return {goldRate:Math.max(.6,goldRate),xpRate,timeRate:Math.max(.7,timeRate),renownBonus,scrap,materials};
}
function guildGoldRate(){
 const tier=typeof guildRankInfo==='function'?Math.max(0,Math.min(3,Number(guildRankInfo().tier)||0)):0;
 return [1,1.05,1.10,1.20][tier];
}
function requiredJob(job){
 const legacy={Tank:'Knight',Summoner:'Druid',Witch:'Druid',Scholar:'Alchemist','Apprentice Mage':'Alchemist'};
 return legacy[job.requiredClass]||job.requiredClass||'';
}
function isQualified(hero,required){
 if(!required)return true;
 return (hero.currentJob||hero.cls)===required||(hero.unlockedJobs||[]).includes(required);
}
function refreshAfterDispatch(){
 requestAnimationFrame(()=>{
  for(const fn of [renderJobs,renderResources,renderTeam]){
   try{typeof fn==='function'&&fn()}catch(error){console.warn('Job dispatch refresh skipped.',error)}
  }
 });
}

window.confirmJob=function(){
 if(dispatching)return toast('The guild is already recording that assignment.');
 const source=pendingJob?{...pendingJob}:null;
 if(!source)return toast('Choose a contract before sending a team.');
 const ids=[...new Set([...document.querySelectorAll('#jobPicks input:checked')].map(node=>Number(node.value)).filter(Number.isFinite))];
 if(ids.length<1||ids.length>3)return toast('Choose one to three available adventurers.');
 const team=ids.map(id=>heroes.find(hero=>hero.id===id));
 if(team.some(hero=>!hero||!available(hero)))return toast('One of those adventurers is no longer available. Choose the team again.');
 const required=requiredJob(source);
 if(required&&!team.some(hero=>isQualified(hero,required)))return toast(`This contract requires a ${required}.`);

 dispatching=true;
 const previousLength=activeJobs.length;
 try{
  const teamBonus=Math.min(ids.length-1,2),politics=politicalModifiers(source);
  const baseDuration=Math.max(1000,(Number(source.time)||1)*1000);
  const duration=Math.max(1000,Math.round(baseDuration*politics.timeRate));
  const assignedJobs=Object.fromEntries(team.map(hero=>[hero.id,hero.currentJob||hero.cls]));
  const assignment={
   ...source,
   jobTypeId:source.jobTypeId||source.id,
   id:`run-${source.id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
   heroIds:ids,
   jobClasses:assignedJobs,
   ends:Date.now()+duration,
   duration,
   done:false,
   gold:Math.max(1,Math.round(((Number(source.gold)||0)+teamBonus*14)*politics.goldRate*guildGoldRate())),
   xp:Math.max(1,Math.round(((Number(source.xp)||0)+teamBonus*5)*politics.xpRate)),
   houseId:source.houseId||null,
   politicalRewards:politics
  };
  activeJobs.push(assignment);
  document.getElementById('jobModalBack')?.classList.remove('open');
  pendingJob=null;
  save();
  toast(`${ids.length} adventurer${ids.length>1?'s':''} sent on ${source.name}.`);
  refreshAfterDispatch();
 }catch(error){
  activeJobs.splice(previousLength);
  console.error('Job dispatch failed safely.',error);
  toast('The assignment could not be recorded. Your team remains available.');
 }finally{
  dispatching=false;
 }
};
})();

