/* Full-window tactical presentation and compact enemy dossier rail. */
(function(){
'use strict';
const priorRenderRun=window.renderRun,priorRenderBattle=window.renderBattle;
let savedScroll=0,immersive=false;
function battle(){return window.runState?.battle||null}
function enemyPortrait(foe){
 const profile=typeof ENEMY_CATALOG!=='undefined'?ENEMY_CATALOG[foe.archetype]||{}:{};
 const sprite=Number.isFinite(profile.sprite)?profile.sprite:0;
 const hp=Math.max(0,Math.min(100,foe.hp/Math.max(1,foe.maxHp)*100));
 const label=`${foe.name}, level ${foe.level||1}, ${foe.hp} of ${foe.maxHp} vigor. Open dossier.`;
 const art=typeof window.spriteMarkup==='function'?window.spriteMarkup('enemy',sprite):`<span class="enemy-portrait-fallback">${foe.icon||'◆'}</span>`;
 return `<button class="enemy-portrait-button ${foe.hp<=0?'defeated':''}" type="button" title="${label}" aria-label="${label}" onclick="openEnemyCard('${foe.id}')">${art}<i><b style="width:${hp}%"></b></i><small>${foe.hp}</small></button>`;
}
function enhance(){
 const b=battle(),panel=document.getElementById('battlePanel');if(!b||!panel)return;
 panel.classList.add('combat-immersive-panel');
 panel.querySelector('.battleinfo')?.remove();
 const body=panel.querySelector('.battlebody');if(!body)return;
 body.querySelector('.enemy-portrait-rail')?.remove();
 const rail=document.createElement('aside');rail.className='enemy-portrait-rail';rail.setAttribute('aria-label','Enemy dossiers');
 rail.innerHTML=`<div class="enemy-rail-mark" aria-hidden="true">⚔</div>${b.foes.map(enemyPortrait).join('')}`;
 body.append(rail);
}
function sync(){
 const active=!!battle();
 if(active&&!immersive){savedScroll=window.scrollY;immersive=true;document.body.classList.add('combat-immersive');document.documentElement.classList.add('combat-immersive')}
 else if(!active&&immersive){immersive=false;document.body.classList.remove('combat-immersive');document.documentElement.classList.remove('combat-immersive');requestAnimationFrame(()=>window.scrollTo({top:savedScroll,behavior:'auto'}))}
 if(active)enhance();
}
window.renderBattle=function(...args){const result=priorRenderBattle.apply(this,args);enhance();sync();return result};
window.renderRun=function(...args){const result=priorRenderRun.apply(this,args);sync();return result};
sync();
window.WayfarerCombatImmersive=Object.freeze({version:'1.0.0',sync,get active(){return immersive}});
})();

