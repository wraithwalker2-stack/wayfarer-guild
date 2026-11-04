/* Keep the tactical board fixed in the viewport while combat redraws its controls and log. */
(function(){
'use strict';
const priorRenderRun=window.renderRun,priorRenderBattle=window.renderBattle;
let interactionAnchor=null;
function state(){return typeof runState!=='undefined'?runState:window.runState}
function battle(){return state()?.battle||null}
function board(){return document.querySelector('#battlePanel .battlegrid-wrap')||document.querySelector('#battlePanel .battlegrid')}
function capture(){
 const b=battle(),el=board(),rect=el?.getBoundingClientRect();
 return b?{battle:b,session:b.v3Session||null,pageY:window.scrollY,top:Number.isFinite(rect?.top)?rect.top:null}:null;
}
function valid(anchor){const b=battle();return !!anchor&&b===anchor.battle&&(!anchor.session||!b.v3Session||anchor.session===b.v3Session)}
function restore(anchor){
 if(!valid(anchor))return;
 const el=board(),rect=el?.getBoundingClientRect();
 let target=anchor.pageY;
 if(anchor.top!==null&&Number.isFinite(rect?.top))target=window.scrollY+rect.top-anchor.top;
 if(Number.isFinite(target))window.scrollTo(0,Math.max(0,target));
}
function settle(anchor){
 if(!anchor)return;
 restore(anchor);
 requestAnimationFrame(()=>{restore(anchor);requestAnimationFrame(()=>restore(anchor))});
 setTimeout(()=>restore(anchor),0);
 setTimeout(()=>restore(anchor),90);
}
function releaseFocus(){
 const active=document.activeElement;
 if(active?.closest?.('#battlePanel'))try{active.blur({preventScroll:true})}catch{active.blur()}
}
window.renderRun=function(...args){const anchor=capture();releaseFocus();const result=priorRenderRun.apply(this,args);settle(anchor);return result};
window.renderBattle=function(...args){const anchor=capture();releaseFocus();const result=priorRenderBattle.apply(this,args);settle(anchor);return result};
document.addEventListener('pointerdown',event=>{if(event.target.closest?.('#battlePanel'))interactionAnchor=capture()},{capture:true,passive:true});
document.addEventListener('click',event=>{if(!event.target.closest?.('#battlePanel')||!interactionAnchor)return;const anchor=interactionAnchor;interactionAnchor=null;settle(anchor)},{capture:false,passive:true});
window.WayfarerCombatViewport=Object.freeze({version:'1.0.0',capture,restore});
})();

