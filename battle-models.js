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
