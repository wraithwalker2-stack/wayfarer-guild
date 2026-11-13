/* Wayfarer tactical board v4 — an authored 21x21 FFT-style block board.
   The painted scene is a backdrop only. Every floor, water, height, spawn,
   bridge, and obstacle decision comes from this board. */
(function () {
  'use strict';

  const WIDTH = 21;
  const HEIGHT = 21;
  const SCENE = { greenway: 'greenway', mosslight: 'mosslight', ashen: 'ashen', sepulcher: 'sepulcher', 'exile-ambush': 'southgate', 'veilwake-crypt': 'veilwake' };
  const key = (x, y) => `${x},${y}`;
  const inside = (x, y) => x >= 1 && x <= 19 && y >= 1 && y <= 19;
  const rect = (x, y, x1, y1, x2, y2) => x >= x1 && x <= x2 && y >= y1 && y <= y2;

  /* Keep the complete 21x21 board inside the painted scene. The same
     projection is used for cells, sprites, health bars, and effects. */
  function projected(x, y, height = 0) {
    const nx = x / (WIDTH - 1), ny = y / (HEIGHT - 1);
    return { sx: 50 + (nx - ny) * 38, sy: 8 + (nx + ny) * 42 - height * 4.4 };
  }

  const mapBase = (tile = () => '.', terrain = () => null, height = () => 0, deploy = null, enemy = null) => ({
    tile, terrain, height,
    deploy: deploy || ((x, y) => inside(x, y) && x <= 6 && y >= 13),
    enemy: enemy || ((x, y) => inside(x, y) && x >= 14 && y <= 7)
  });

  const MAPS = {
    greenway: mapBase(
      (x, y) => !inside(x, y) ? '#' : (rect(x, y, 8, 7, 10, 10) || rect(x, y, 13, 12, 15, 15) ? '#' : (x >= 4 && x <= 8 && y >= 4 && y <= 8 ? '^' : '.')),
      (x, y) => y === 10 && x >= 5 && x <= 16 ? { type: 'water', name: 'Greenway stream' } : (x >= 4 && x <= 8 && y >= 4 && y <= 8 ? { type: 'raised', name: 'Raised forest bank' } : null),
      (x, y) => x >= 4 && x <= 8 && y >= 4 && y <= 8 ? 2 : (x >= 11 && x <= 16 && y <= 6 ? 1 : 0)
    ),
    mosslight: mapBase(
      (x, y) => !inside(x, y) ? '#' : (rect(x, y, 8, 5, 11, 7) || rect(x, y, 13, 14, 16, 16) ? '#' : (y === 10 && x >= 3 && x <= 17 ? '~' : '.')),
      (x, y) => y === 10 && x >= 3 && x <= 17 ? { type: 'water', name: 'Glowstream shallows' } : (x >= 3 && x <= 5 && y >= 5 && y <= 7 ? { type: 'hazard', name: 'Caustic fungus', damage: 4 } : null),
      (x, y) => x >= 8 && x <= 11 && y <= 7 ? 1 : 0
    ),
    ashen: mapBase(
      (x, y) => !inside(x, y) ? '#' : (rect(x, y, 9, 8, 11, 11) || rect(x, y, 4, 12, 6, 15) ? '#' : (x >= 13 && x <= 18 && y >= 3 && y <= 7 ? '^' : '.')),
      (x, y) => x === 10 && y >= 2 && y <= 18 ? { type: 'hazard', name: 'Lava fracture', damage: 5 } : (x >= 13 && x <= 18 && y >= 3 && y <= 7 ? { type: 'raised', name: 'Observatory terrace' } : null),
      (x, y) => x >= 13 && x <= 18 && y >= 3 && y <= 7 ? 2 : (x >= 7 && x <= 11 && y <= 8 ? 1 : 0)
    ),
    sepulcher: mapBase(
      (x, y) => !inside(x, y) ? '#' : (rect(x, y, 8, 6, 11, 8) || rect(x, y, 13, 13, 16, 16) ? '#' : (x >= 8 && x <= 13 && y >= 9 && y <= 13 ? '~' : '.')),
      (x, y) => x >= 8 && x <= 13 && y >= 9 && y <= 13 ? { type: 'shallow-water', name: 'Gravewater' } : (x >= 15 && y >= 15 ? { type: 'hazard', name: 'Soulfire', damage: 6 } : null),
      (x, y) => x >= 4 && x <= 8 && y <= 7 ? 1 : (x >= 13 && y <= 6 ? 2 : 0)
    ),
    southgate: mapBase(
      (x, y) => !inside(x, y) ? '#' : (rect(x, y, 9, 8, 11, 12) ? '#' : (y >= 4 && y <= 7 && x >= 5 && x <= 16 ? '^' : '.')),
      (x, y) => y >= 4 && y <= 7 && x >= 5 && x <= 16 ? { type: 'tall-grass', name: 'Tall grass', evasion: .5 } : null,
      (x, y) => y >= 4 && y <= 7 && x >= 5 && x <= 16 ? 1 : 0
    ),
    veilwake: mapBase(
      (x, y) => !inside(x, y) ? '#' : (rect(x, y, 7, 5, 9, 8) || rect(x, y, 13, 13, 16, 16) ? '#' : (x >= 15 && x <= 17 && y >= 3 && y <= 5 ? '^' : '.')),
      (x, y) => (x >= 3 && x <= 5 && y >= 3 && y <= 5) || (x >= 15 && x <= 17 && y >= 15 && y <= 17) ? { type: 'water', name: 'Blackglass reflecting pool' } : (x >= 10 && x <= 12 && y >= 9 && y <= 11 ? { type: 'hazard', name: 'Crimson ritual seal', damage: 6 } : null),
      (x, y) => x >= 15 && x <= 17 && y >= 3 && y <= 5 ? 2 : (x >= 10 && x <= 14 && y <= 7 ? 1 : 0)
    ),
    /* Stage 1: long stone lanes separated by a lower canal. */
    sewer1: mapBase(
      (x, y) => { if (!inside(x, y)) return '#'; if (x >= 9 && x <= 11 && y >= 1 && y <= 19 && y !== 6 && y !== 14) return 'D'; if (x >= 9 && x <= 11 && (y === 6 || y === 14)) return '='; return y === 10 && ((x >= 2 && x <= 8) || (x >= 12 && x <= 18)) ? '~' : '.'; },
      (x, y) => x >= 9 && x <= 11 && y !== 6 && y !== 14 ? { type: 'deep-water', name: 'Flood channel' } : (x >= 9 && x <= 11 ? { type: 'bridge', name: 'Wooden bridge' } : (y === 10 && x <= 8 ? { type: 'shallow-water', name: 'Side tunnel runoff' } : null)),
      (x) => x < 9 || x > 11 ? 1 : 0,
      (x, y) => inside(x, y) && x <= 6 && y >= 13,
      (x, y) => inside(x, y) && x >= 14 && y <= 7
    ),
    /* Stage 2: plus-shaped chamber with a non-walkable deep central pit. */
    sewer2: mapBase(
      (x, y) => { if (!inside(x, y)) return '#'; const arm = x >= 1 && x <= 19 && y >= 9 && y <= 11, stem = x >= 9 && x <= 11 && y >= 1 && y <= 19, pit = x >= 9 && x <= 11 && y >= 9 && y <= 11; if (pit) return 'D'; return arm || stem || (x >= 7 && x <= 13 && y >= 7 && y <= 13) ? (x === 8 || x === 12 || y === 8 || y === 12 ? '~' : '.') : '#'; },
      (x, y) => x >= 7 && x <= 13 && y >= 7 && y <= 13 && (x === 8 || x === 12 || y === 8 || y === 12) ? { type: 'shallow-water', name: 'Shallow runoff' } : (x >= 9 && x <= 11 && y >= 9 && y <= 11 ? { type: 'deep-water', name: 'Deep central pit' } : null),
      () => 1,
      (x, y) => inside(x, y) && x <= 7 && y >= 9 && y <= 11,
      (x, y) => inside(x, y) && x >= 13 && y >= 9 && y <= 11
    ),
    /* Stage 3: square cistern with a contiguous shallow lake. */
    sewer3: mapBase(
      (x, y) => !inside(x, y) ? '#' : (x >= 8 && x <= 13 && y >= 8 && y <= 13 ? '~' : '.'),
      (x, y) => x >= 8 && x <= 13 && y >= 8 && y <= 13 ? { type: 'shallow-water', name: 'Cistern shallows' } : null,
      (x, y) => x >= 4 && x <= 7 && y <= 6 ? 1 : (x >= 14 && x <= 17 && y >= 14 ? 1 : 0)
    )
  };

  function mapId(run, b) { const dungeon = run?.dungeon?.id; return dungeon === 'sewer' ? `sewer${Math.max(1, Math.min(3, Number(b?.sewerStage) || 1))}` : SCENE[dungeon] || 'mosslight'; }
  function terrainClass(type) { return `stage-${String(type || 'floor').replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`; }
  function passable(b, x, y) { if (!b || x < 0 || y < 0 || x >= (b.width || WIDTH) || y >= (b.height || HEIGHT)) return false; if (b.roomTiles && !b.roomTiles[y * (b.width || WIDTH) + x]) return false; return !(typeof fieldObstacleAt === 'function' && fieldObstacleAt(b, x, y)); }
  function largest(points) {
    const left = new Set(points.map(p => key(p.x, p.y))), parts = [];
    while (left.size) { const seed = left.values().next().value, [sx, sy] = seed.split(',').map(Number), queue = [{ x: sx, y: sy }], part = []; left.delete(seed); for (let i = 0; i < queue.length; i++) { const p = queue[i]; part.push(p); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = key(p.x + dx, p.y + dy); if (left.delete(k)) queue.push({ x: p.x + dx, y: p.y + dy }); } } parts.push(part); }
    return parts.sort((a, b) => b.length - a.length)[0] || [];
  }
  function nearest(points, used, xBias) { return points.filter(p => !used.has(key(p.x, p.y))).sort((a, b) => Math.abs(a.x - xBias) - Math.abs(b.x - xBias) || a.y - b.y)[0]; }

  function applyStage(run, b) {
    const id = mapId(run, b), map = MAPS[id]; if (!map || !b) return;
    const raw = [];
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) { const tile = map.tile(x, y); if (tile !== '#' && tile !== 'D') raw.push({ x, y, tile, height: Number(map.height(x, y) || 0), terrain: map.terrain(x, y) }); }
    const component = largest(raw), allowed = new Set(component.map(p => key(p.x, p.y))), points = raw.filter(p => allowed.has(key(p.x, p.y)));
    b.width = WIDTH; b.height = HEIGHT; b.viewRotation = 0; b.authoredRoom = true; b.expandedBattlefield = true; b.stageGeometry = id; b.blockBoardVersion = '4.0.0'; b.cameraNeedsCenter = true; delete b.cameraScrollLeft; delete b.cameraScrollTop;
    b.roomTiles = Array.from({ length: WIDTH * HEIGHT }, (_, i) => allowed.has(key(i % WIDTH, Math.floor(i / WIDTH))));
    b.elevations = Array.from({ length: WIDTH * HEIGHT }, (_, i) => { const p = points.find(q => q.x === i % WIDTH && q.y === Math.floor(i / WIDTH)); return p?.height || 0; });
    b.tileTerrain = {}; b.tileKinds = {}; points.forEach(p => { b.tileKinds[key(p.x, p.y)] = p.tile; if (p.terrain) b.tileTerrain[key(p.x, p.y)] = { ...p.terrain }; });
    b.obstacles = id === 'sewer2' ? [{ x: 6, y: 10, kind: 'sewer-rubble', icon: '▣', name: 'West tunnel blockage', destructible: true, optionalObjective: true, hp: 18, maxHp: 18 }, { x: 14, y: 10, kind: 'sewer-rubble', icon: '▣', name: 'East tunnel blockage', destructible: true, optionalObjective: true, hp: 18, maxHp: 18 }] : [];
    const occupied = new Set(b.obstacles.map(o => key(o.x, o.y))), heroSpots = points.filter(p => map.deploy(p.x, p.y) && !occupied.has(key(p.x, p.y))).sort((a, c) => a.y - c.y || a.x - c.x), enemySpots = points.filter(p => map.enemy(p.x, p.y) && !occupied.has(key(p.x, p.y))).sort((a, c) => c.y - a.y || c.x - a.x), fallbackHeroes = points.filter(p => p.x <= 7 && !occupied.has(key(p.x, p.y))), fallbackEnemies = points.filter(p => p.x >= 13 && !occupied.has(key(p.x, p.y))), used = new Set();
    (b.heroes || []).forEach((unit, i) => { const p = nearest(heroSpots, used, 2) || nearest(fallbackHeroes, used, 2) || nearest(points, used, 2) || points[i]; if (p) { Object.assign(unit, { x: p.x, y: p.y, facing: 'E' }); used.add(key(p.x, p.y)); } });
    (b.foes || []).filter(f => f.hp > 0).forEach((unit, i) => { const p = nearest(enemySpots, used, 18) || nearest(fallbackEnemies, used, 18) || nearest(points, used, 18) || points[points.length - 1 - i]; if (p) { Object.assign(unit, { x: p.x, y: p.y, facing: 'W' }); used.add(key(p.x, p.y)); } });
    b.deploymentTiles = heroSpots.filter(p => !occupied.has(key(p.x, p.y))).slice(0, Math.max(8, (b.heroes || []).length + 3)).map(p => key(p.x, p.y)); b.roomTileCount = points.length; b.stageCells = points.map(p => ({ x: p.x, y: p.y, tile: p.tile, height: p.height, terrain: p.terrain?.type || null }));
    if (typeof recordBattleLog === 'function') recordBattleLog(`Block board ${id}: ${points.length} connected floor cells · ${b.obstacles.length} authored obstacles.`);
  }

  const oldBegin = window.beginBattle;
  window.beginBattle = function (...args) { const result = typeof oldBegin === 'function' ? oldBegin.apply(this, args) : undefined; const r = window.runState, b = r?.battle; if (b) { applyStage(r, b); if (typeof renderRun === 'function') renderRun(); } return result; };
  const oldClick = window.battleClick;
  window.battleClick = function (x, y) { const b = window.runState?.battle; if (b?.roomTiles && !b.roomTiles[y * (b.width || WIDTH) + x]) return typeof toast === 'function' ? toast('That part of the board is not traversable.') : undefined; return typeof oldClick === 'function' ? oldClick(x, y) : undefined; };

  const oldReachable = window.reachableTiles;
  window.reachableTiles = function (actor) {
    const b = window.runState?.battle; if (!b || !actor) return typeof oldReachable === 'function' ? oldReachable(actor) : [];
    const hero = heroes.find(h => h.id === actor.id), max = Math.max(1, Number(moveRange(hero) || 1)), queue = [{ x: actor.x, y: actor.y, d: 0 }], seen = new Set([key(actor.x, actor.y)]), out = [];
    while (queue.length) { const p = queue.shift(); if (p.d >= max) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = p.x + dx, y = p.y + dy, k = key(x, y); if (!passable(b, x, y) || seen.has(k) || b.heroes.some(u => u.id !== actor.id && u.x === x && u.y === y && heroes.find(h => h.id === u.id)?.hp > 0) || b.foes.some(f => f.hp > 0 && f.x === x && f.y === y)) continue; seen.add(k); out.push({ x, y }); queue.push({ x, y, d: p.d + 1 }); } }
    return out;
  };
  const oldRoute = window.enemyRouteToAdjacent;
  window.enemyRouteToAdjacent = function (foe, target, b) {
    if (!b) return typeof oldRoute === 'function' ? oldRoute(foe, target, b) : [];
    const blocked = (x, y) => !passable(b, x, y) || b.heroes.some(u => u.x === x && u.y === y && heroes.find(h => h.id === u.id)?.hp > 0) || b.foes.some(f => f !== foe && f.hp > 0 && f.x === x && f.y === y), queue = [{ x: foe.x, y: foe.y, path: [] }], seen = new Set([key(foe.x, foe.y)]);
    for (let i = 0; i < queue.length; i++) { const cur = queue[i]; if (distance(cur, target) <= 1 && cur.path.length) return cur.path; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = cur.x + dx, y = cur.y + dy, k = key(x, y); if (seen.has(k) || blocked(x, y)) continue; seen.add(k); queue.push({ x, y, path: [...cur.path, { x, y }] }); } }
    return [];
  };
  const oldLos = window.fieldLineOfSight;
  window.fieldLineOfSight = function (a, z, b) { if (!b) return typeof oldLos === 'function' ? oldLos(a, z, b) : true; const steps = Math.max(Math.abs(z.x - a.x), Math.abs(z.y - a.y)) * 2; for (let i = 1; i < steps; i++) { const t = i / steps, x = Math.round(a.x + (z.x - a.x) * t), y = Math.round(a.y + (z.y - a.y) * t); if ((!passable(b, x, y) || (typeof fieldObstacleAt === 'function' && fieldObstacleAt(b, x, y))) && !(x === z.x && y === z.y)) return false; } return true; };

  const oldRender = window.renderBattle;
  window.renderBattle = function (...args) {
    const result = typeof oldRender === 'function' ? oldRender.apply(this, args) : undefined, b = window.runState?.battle, panel = document.getElementById('battlePanel'), grid = panel?.querySelector('.battlegrid');
    if (!b?.stageGeometry || !grid) return result;
    panel.classList.add('stage-geometry-v3', 'block-board-v4', 'authored-room'); panel.dataset.stageGeometry = b.stageGeometry; grid.classList.add('stage-geometry-grid'); grid.style.width = '1200px'; grid.style.height = '675px'; grid.style.setProperty('--bv2-scene-scale', '100% 100%'); grid.style.setProperty('--bv2-scene-position', '50% 50%');
    for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) { const cell = grid.children[y * WIDTH + x]; if (!cell) continue; const i = y * WIDTH + x, h = b.elevations?.[i] || 0, p = projected(x, y, h), open = !!b.roomTiles?.[i], terrain = b.tileTerrain?.[key(x, y)]?.type, tile = b.tileKinds?.[key(x, y)] || '.'; cell.style.left = `${p.sx}%`; cell.style.top = `${p.sy}%`; cell.style.transform = 'translate(-50%,-50%)'; cell.style.zIndex = String(Math.round(p.sy * 10) + h); cell.classList.toggle('void-cell', !open); cell.classList.remove('stage-floor', 'stage-raised', 'stage-water', 'stage-shallow-water', 'stage-deep-water', 'stage-bridge', 'stage-hazard', 'stage-tall-grass'); cell.classList.add(terrainClass(terrain || (tile === '^' ? 'raised' : tile === '=' ? 'bridge' : tile === '!' ? 'hazard' : tile === '~' ? 'shallow-water' : 'floor'))); if (!open) { cell.disabled = true; cell.setAttribute('aria-hidden', 'true'); } else { cell.disabled = false; cell.removeAttribute('aria-hidden'); } }
    const vitals = grid.querySelector('.overhead-vitals-layer'); if (vitals) { const pxW = grid.clientWidth || 1200, pxH = grid.clientHeight || 675, place = (nodes, units) => nodes.forEach((node, i) => { const unit = units[i]; if (!unit) return; const p = projected(unit.x, unit.y, b.elevations?.[unit.y * WIDTH + unit.x] || 0); node.style.left = `${p.sx / 100 * pxW - 28}px`; node.style.top = `${p.sy / 100 * pxH - 48}px`; node.style.width = '56px'; }); place([...vitals.querySelectorAll('.party-vitals')], b.heroes.filter(u => (heroes.find(h => h.id === u.id)?.hp || 0) > 0)); place([...vitals.querySelectorAll('.enemy-vitals')], b.foes.filter(u => u.hp > 0)); }
    panel.querySelectorAll('.rotate-left,.rotate-right,.camera-angle').forEach(button => { button.disabled = true; button.hidden = true; }); return result;
  };
  window.WayfarerStageEngine = Object.freeze({ version: '4.0.0', maps: Object.keys(MAPS), audit() { const b = window.runState?.battle; return b ? { map: b.stageGeometry, width: b.width, height: b.height, walkable: b.roomTiles?.filter(Boolean).length || 0, heroes: b.heroes.map(u => [u.x, u.y]), foes: b.foes.filter(f => f.hp > 0).map(u => [u.x, u.y]) } : { state: 'idle' }; } });
})();
