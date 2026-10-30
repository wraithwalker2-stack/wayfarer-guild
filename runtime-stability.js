(function(){
'use strict';
// Keep timers live without rebuilding the decorated job board every second. The
// board is wrapped by several feature modules, so repeated full renders can
// saturate slower embedded browsers.
if(jobTimer!==null){clearInterval(jobTimer);jobTimer=null}
let lastCompletionSignature='';
tick=function(){
 const now=Date.now();
 for(const job of activeJobs)if(now>=job.ends)job.done=true;
 const signature=activeJobs.map(job=>`${job.id}:${job.done?1:0}`).join('|');
 const jobsVisible=document.getElementById('jobs')?.classList.contains('active');
 const completionChanged=signature!==lastCompletionSignature;
 const boardExpired=jobsVisible&&typeof boardNextRefresh==='number'&&now>=boardNextRefresh;
 if(completionChanged||boardExpired){
  lastCompletionSignature=signature;
  save();
  if(jobsVisible)renderJobs();
  else renderResources();
 }else if(jobsVisible){
  const left=Math.max(0,(typeof boardNextRefresh==='number'?boardNextRefresh:now)-now);
  const status=document.getElementById('jobBoardStatus');
  if(status)status.innerHTML=`<span>Next board refresh in <b>${Math.floor(left/60000)}:${String(Math.floor(left%60000/1000)).padStart(2,'0')}</b></span><small>New postings arrive every five minutes</small>`;
  document.querySelectorAll('#activeJobs .jobrow').forEach((row,index)=>{
   const job=activeJobs[index];
   if(!job)return;
   const small=row.querySelector('small'),bar=row.querySelector('.progress i');
   const who=job.heroIds.map(id=>heroes.find(h=>h.id===id)?.name.split(' ')[0]).filter(Boolean).join(', ');
   const remaining=Math.max(1,Math.ceil((job.ends-now)/1000));
   if(small)small.textContent=`${who} · ${job.done?'Complete! Collect your reward':'Finishes in '+remaining+' sec'}`;
   if(bar)bar.style.width=`${job.done?100:Math.max(0,Math.min(100,(1-(job.ends-now)/job.duration)*100))}%`;
  });
 }
 const clock=document.getElementById('clock');
 if(clock)clock.textContent=activeJobs.length?activeJobs.filter(job=>!job.done).length+' working':'Ready';
 const active=document.getElementById('activeCount');
 if(active)active.textContent=heroes.filter(h=>h.staff||activeJobs.some(job=>job.heroIds.includes(h.id))).length;
};
jobTimer=setInterval(()=>tick(),1000);
})();
