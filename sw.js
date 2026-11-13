const CACHE='wayfarer-public-alpha-0.11.6-hq-battlefields-1';
const SHELL=['./','./index.html','./wayfarer-core.js','./wayfarer-engine-v3.js','./wayfarer-runtime-v3.js','./wayfarer-recovery-v4.js','./chapter-one-release.css','./tactics-diorama-v3.css','./public-alpha.js','./runtime-stability.js','./music-system.js','./battle-sfx.js','./combat-control-stability.js','./class-change-stability.js','./custom-class-art.js','./tactical-terrain.js','./tactical-objectives.js','./sewer-mission.js','./sewer-mission.css','./campaign-consequences.js','./campaign-consequences.css','./location-theme-repair.js','./location-theme-repair.css','./assets/enemy-models-isometric-v3.png','./assets/sewer-floodworks-v1.jpg','./assets/floodworks-enemy-v3-0.png','./assets/floodworks-enemy-v3-1.png','./assets/floodworks-enemy-v3-2.png','./assets/floodworks-enemy-v3-3.png','./assets/floodworks-enemy-v3-4.png','./assets/floodworks-enemy-v3-5.png','./assets/floodworks-terrain-atlas-v2.jpg','./assets/floodworks-cobble-atlas-v3.jpg','./assets/floodworks-cobble-dry-v3.jpg','./assets/floodworks-cobble-wet-v3.jpg','./assets/floodworks-bridge-v3.jpg','./assets/floodworks-channel-v3.jpg','./assets/floodworks-diorama-v3.jpg','./assets/tactics-dioramas-v3.jpg','./assets/southgate-terrain-atlas-v1.png','./assets/southgate-obstacles-v1.png','./assets/southgate-ambush-v1.png','./holiday-system.js','./holiday-system.css','./holiday-observances.css','./veilwake-cathedral.js','./veilwake-cathedral.css','./assets/veilwake-enemies-v1.png','./assets/veilwake-midnight-court-v1.jpg','./assets/veilwake-cathedral-floor-v1.jpg','./assets/veilwake-cathedral-obstacles-v1.png','./assets/blackglass-cathedral-v1.jpg','./combat-lifecycle-guard.js','./guild-mark.svg','./manifest.webmanifest'];
SHELL.push('./assets/music-veilwake-haunted-masquerade.mp3','./assets/music-sepulcher-mist-forest.mp3','./authored-battlefields-v1.js','./authored-battlefields-v1.css','./battle-integrity-v1.js','./battle-integrity-v1.css');
for(const stage of [1,2,3])for(const file of ['brick.jpg','shallow-water.jpg','deep-water.jpg','bridge.jpg'])SHELL.push(`./assets/tilesets/sewer/stage-${stage}/${file}`);
for(const area of ['greenway','mosslight','ashen','sepulcher'])for(const file of ['floor.jpg','water.jpg','hazard.webp'])SHELL.push(`./assets/tilesets/${area}/${file}`);
SHELL.push('./assets/tilesets/southgate/floor-atlas.png','./assets/tilesets/southgate/obstacles.png','./assets/tilesets/veilwake/floor.jpg','./assets/tilesets/veilwake/obstacles.png');
for(const area of ['greenway','mosslight','ashen','sepulcher','southgate','veilwake'])SHELL.push(`./assets/tilesets/${area}/terrain-hq-v2.png`);
for(const stage of [1,2,3])SHELL.push(`./assets/tilesets/sewer/stage-${stage}/terrain-hq-v2.png`);
SHELL.push('./assets/sprites/battle/enemies/greenway-southgate-v1.png');
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
