(function(){
'use strict';
function rankCard(){return [...document.querySelectorAll('#home .stat')].find(card=>card.querySelector('span')?.textContent.trim()==='Guild rank')}
function updateGuildRankCard(){const card=rankCard();if(!card||typeof guildRankInfo!=='function')return;const info=guildRankInfo(),next=[10,25,50,null][info.tier],name=card.querySelector('strong'),progress=card.querySelector('em');if(name)name.textContent=info.name;if(progress)progress.textContent=next===null?'Maximum rank':`${renown} / ${next} renown`}
const previousRenderResources=renderResources;renderResources=function(...args){const result=previousRenderResources(...args);updateGuildRankCard();return result};
updateGuildRankCard();
})();
