const CACHE='wayfarer-public-alpha-0.9.14-road-and-floodworks-1';
const SHELL=['./','./index.html','./wayfarer-core.js','./chapter-one-release.css','./public-alpha.js','./runtime-stability.js','./music-system.js','./battle-sfx.js','./tactical-terrain.js','./tactical-objectives.js','./sewer-mission.js','./sewer-mission.css','./campaign-consequences.js','./campaign-consequences.css','./assets/sewer-floodworks-v1.jpg','./assets/sewer-enemy-0.png','./assets/sewer-enemy-1.png','./assets/sewer-enemy-2.png','./assets/sewer-enemy-3.png','./assets/sewer-enemy-4.png','./assets/southgate-ambush-v1.png','./holiday-system.js','./holiday-system.css','./holiday-observances.css','./veilwake-cathedral.js','./veilwake-cathedral.css','./assets/veilwake-enemies-v1.png','./assets/veilwake-midnight-court-v1.jpg','./assets/veilwake-cathedral-floor-v1.jpg','./assets/veilwake-cathedral-obstacles-v1.png','./assets/blackglass-cathedral-v1.jpg','./combat-lifecycle-guard.js','./guild-mark.svg','./manifest.webmanifest'];
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
