const CACHE='wayfarer-public-alpha-0.13.0-combat-reset-9';
const SHELL=[
  './','./index.html','./wayfarer-core.js','./wayfarer-engine-v3.js','./wayfarer-runtime-v3.js','./wayfarer-recovery-v4.js',
  './chapter-one-release.css','./public-alpha.js','./runtime-stability.js','./music-system.js',
  './class-change-stability.js','./custom-class-art.js',
  './sewer-mission.js','./sewer-mission.css','./campaign-consequences.js','./campaign-consequences.css',
  './holiday-system.js','./holiday-system.css','./guild-mark.svg','./manifest.webmanifest','./combat-engine-rebuild.js','./combat-engine-rebuild.css',
  './assets/music-veilwake-haunted-masquerade.mp3','./assets/music-sepulcher-mist-forest.mp3',
  './assets/battle-v2/scenes/greenway.png','./assets/battle-v2/scenes/mosslight.png','./assets/battle-v2/scenes/ashen.png',
  './assets/battle-v2/scenes/sepulcher.png','./assets/battle-v2/scenes/southgate.png','./assets/battle-v2/scenes/veilwake.png',
  './assets/battle-v2/scenes/sewer-stage-1.png','./assets/battle-v2/scenes/sewer-stage-2.png','./assets/battle-v2/scenes/sewer-stage-3.png',
  './assets/battle-v2/sprites/combat-sprite-atlas-v1.png','./deployment-bridge.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('wayfarer-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  const type=event.request.destination;
  if(type==='image'||type==='font'){
    event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response})));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
});



