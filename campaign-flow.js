(function(){
'use strict';
function completedContracts(){try{const data=JSON.parse(localStorage.getItem('wayfarer-contracts-v1')||'null');return Array.isArray(data?.completed)?data.completed.length:0}catch{return 0}}
function syncCampaignNavigation(){const home=document.getElementById('home')?.classList.contains('active');const panel=document.getElementById('guildRoomsDropdown');if(panel)panel.hidden=!home;const expedition=document.querySelector('.nav button[data-page="dungeon"]');if(expedition)expedition.hidden=completedContracts()<2;window.wayfarerMap?.sync()}
document.addEventListener('click',()=>queueMicrotask(syncCampaignNavigation));
window.addEventListener('storage',syncCampaignNavigation);
window.syncCampaignNavigation=syncCampaignNavigation;
syncCampaignNavigation();
})();

