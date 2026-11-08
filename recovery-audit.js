(function(){
'use strict';
function snapshot(){
 const read=name=>{try{return typeof window[name]}catch{return'blocked'}};
 let lastError=null;
 try{lastError=JSON.parse(sessionStorage.getItem('wayfarer-last-error')||'null')}catch{}
 return {
  lastError,
  jobs:typeof jobs!=='undefined'?jobs.length:'missing',
  jobPool:typeof jobPool!=='undefined'?jobPool.length:'missing',
  contracts:read('acceptStoryContract'),
  prepareContract:read('prepareStoryContract'),
  expedition:read('startRun'),
  combat:read('beginBattle'),
  renderJobs:read('renderJobs'),
  engine:window.WayfarerEngine?.version||'missing',
  bodyTheme:document.body?.dataset.theme||'',
  runtime:window.WayfarerRuntime?.health?.()||null
 };
}
async function flow(){
 const results=[];const check=(name,pass,detail='')=>results.push({name,pass:!!pass,detail});
 try{
  document.querySelector('.founder-intro')?.remove();
  check('Engine boot',window.WayfarerEngine?.boot.phase==='ready',window.WayfarerEngine?.version||'missing');
  check('Five current job postings',typeof jobs!=='undefined'&&jobs.length===5,`count ${typeof jobs!=='undefined'?jobs.length:'missing'}`);
  check('Expanded job catalogue',typeof jobPool!=='undefined'&&jobPool.length>=20,`count ${typeof jobPool!=='undefined'?jobPool.length:'missing'}`);
  const before=activeJobs.length;takeJob(jobs[0].id);const pick=document.querySelector('#jobPicks input');if(pick)pick.checked=true;confirmJob();check('Job dispatch',activeJobs.length===before+1,`before ${before}, after ${activeJobs.length}`);activeJobs.splice(before);save();renderJobs();
  const contracts=window.WayfarerContracts?.list?.()||[];check('Contract catalogue',contracts.length>=10,`${contracts.length} missions`);
  acceptStoryContract('family-call');check('Contract acceptance',window.WayfarerContracts?.state?.().active==='family-call',window.WayfarerContracts?.state?.().active||'no active mission');beginNarrativeContract('family-call');check('Contract story launch',!!document.querySelector('.narrative-contract'),'opening narrative rendered');
  for(const contract of contracts){if(contract.mode==='narrative')check(`Mission handler: ${contract.id}`,typeof beginNarrativeContract==='function','narrative');else if(contract.mode==='expedition'){const special=contract.target==='sewer'?typeof selectSewerMission==='function':contract.target==='exile-ambush'?typeof selectExileAmbush==='function':typeof setDungeon==='function';check(`Mission route: ${contract.id}`,special,contract.target)}}
  const sample=window.WayfarerEngine.characters.createFounder({name:'Audit Founder'});check('Character creation',sample.stats&&sample.currentJob==='Squire'&&sample.jobProgress.Squire,'Squire founder');
  check('Class change mechanics',typeof setCharacterJob==='function'&&typeof learnJobSkill==='function'&&typeof setSubJob==='function','job, skill, and secondary-pool handlers');
  check('Expedition launch mechanics',typeof startRun==='function'&&typeof setDungeon==='function','route and launch handlers');
  check('Combat mechanics',typeof beginBattle==='function'&&typeof resolveBattleInstant==='function'&&!!window.WayfarerCombatV3,window.WayfarerCombatV3?.version||'missing');
  const team=heroes.slice(0,5);team.forEach(hero=>{hero.level=Math.max(10,hero.level||1);hero.hp=hero.maxHp});window.wayfarerTravel?.startLocal?.('greenway',team,'ai');resolveRoom('forward');if(runState?.battle)resolveBattleInstant();await new Promise(resolve=>setTimeout(resolve,1200));const combatFinished=!runState||(!runState.battle&&runState.step>=1);check('AI combat resolution',combatFinished,runState?`room ${runState.step}, battle ${!!runState.battle}`:'one-room encounter completed');runState=null;document.getElementById('run')?.classList.remove('show');
  check('Sewer ownership',window.WayfarerLocationThemes?.owned?.includes('sewer'),'location-owned terrain and enemies');
  const image=new Image();image.src='./assets/floodworks-terrain-atlas-v2.jpg';await new Promise(resolve=>{image.onload=resolve;image.onerror=resolve;setTimeout(resolve,2500)});check('Sewer terrain atlas',image.complete&&image.naturalWidth>0,`${image.naturalWidth} × ${image.naturalHeight}`);
 }catch(error){results.push({name:'Audit execution',pass:false,detail:error.stack||error.message})}
 return{passed:results.filter(item=>item.pass).length,failed:results.filter(item=>!item.pass).length,results,snapshot:snapshot()}
}
window.WayfarerRecoveryAudit={snapshot,flow};
if(new URLSearchParams(location.search).has('audit')){
 setTimeout(async()=>{
  const node=document.createElement('pre');
  node.id='wayfarerAudit';
  node.style.cssText='position:fixed;z-index:99999;inset:auto 10px 10px 10px;max-height:45vh;overflow:auto;background:#090d0a;color:#d8f5d0;padding:12px;white-space:pre-wrap';
  node.textContent=JSON.stringify(new URLSearchParams(location.search).get('audit')==='flow'?await flow():snapshot(),null,2);
  document.body.append(node);
 },250);
}
})();

