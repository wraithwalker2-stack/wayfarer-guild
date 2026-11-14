/* Wayfarer combat cutover v1.
   The published game has one active battle presentation. The older expedition
   renderer remains available only to migration code; it is never used for a
   live run or battle. */
(function (global) {
  'use strict';

  const VERSION = '1.1.0-combat-cutover';
  const getRun = () => {
    try { return runState; } catch (_) { return global.runState; }
  };
  const getHeroes = () => {
    try { return heroes || []; } catch (_) { return global.heroes || []; }
  };
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const sceneName = run => String(run?.battle?.board?.scene || run?.dungeon?.name || 'expedition').replace(/-/g, ' ');

  function setBattleChrome(active) {
    // These panels belong to the pre-battle expedition shell. Keeping them in
    // the DOM is useful for migration, but they must not compete with the
    // authored board while a battle is active (or pull the page scroll down).
    ['#expeditionPrep', '.dungeonhero', '.dungeonchoices', '#dungeon > .layout'].forEach(selector => {
      document.querySelectorAll(selector).forEach(node => node.classList.toggle('cutover-hidden', !!active));
    });
  }

  function routeNodes(run) {
    const rooms = Array.isArray(run?.rooms) ? run.rooms : [];
    return rooms.map((room, index) => `<span class="cutover-route-node ${index < run.step ? 'done' : index === run.step ? 'current' : ''}" title="Room ${index + 1}">${index < run.step ? '✓' : safe(room.type || '·')}</span>`).join('');
  }

  function routeAction(run) {
    if (run.step >= (run.rooms?.length || 0)) {
      return `<button class="button green" type="button" onclick="finishRun()">Complete expedition →</button>`;
    }
    const room = run.rooms[run.step] || {};
    if (run.mode === 'manual' && room.branch) {
      return `<button class="button green" type="button" onclick="resolveRoom('safe')">Take the safer path →</button><button class="button secondary" type="button" onclick="resolveRoom('deep')">Follow the deeper path →</button>`;
    }
    return `<button class="button green" type="button" onclick="resolveRoom('forward')">${run.mode === 'ai' ? 'Continue expedition' : 'Explore next room'} →</button>`;
  }

  function renderRun() {
    const run = getRun();
    const root = document.getElementById('run');
    if (!root) return;
    if (!run) {
      setBattleChrome(false);
      root.className = 'run cutover-run';
      root.innerHTML = '';
      root.classList.remove('show');
      return;
    }
    root.className = 'run cutover-run show';
    if (run.battle) {
      setBattleChrome(true);
      root.innerHTML = `<section class="cutover-battle-shell"><header class="cutover-battle-head"><strong>${safe(run.dungeon?.name || 'Tactical encounter')}</strong><span class="cutover-scene">${safe(sceneName(run))} · room ${Math.min((run.step || 0) + 1, run.rooms?.length || 1)} / ${run.rooms?.length || 1}</span></header><div id="battlePanel" aria-live="polite"></div></section>`;
      if (typeof global.renderBattle === 'function') global.renderBattle();
      return;
    }
    setBattleChrome(false);
    const complete = run.step >= (run.rooms?.length || 0);
    const title = complete ? 'Expedition complete' : (run.dungeon?.name || 'Expedition');
    root.innerHTML = `<section class="${complete ? 'cutover-result' : 'cutover-route'}"><header class="cutover-route-head"><strong>${safe(title)}</strong><small>${complete ? 'READY TO RETURN' : `ROOM ${Math.min((run.step || 0) + 1, run.rooms?.length || 1)} / ${run.rooms?.length || 1} · ${run.mode === 'ai' ? 'AI PILOT' : 'MANUAL CONTROL'}`}</small></header>${complete ? `<p>${safe(run.log || 'The party has cleared the route.')}</p><p>Finds: ${Number(run.loot) || 0} · Rooms cleared: ${Number(run.cleared) || 0}</p>` : `<div class="cutover-route-grid">${routeNodes(run)}</div><p class="cutover-route-copy">${safe(run.log || run.dungeon?.intro || 'The party is ready to advance.')}</p><div class="cutover-route-actions">${routeAction(run)}</div>`}</section>`;
  }

  const previousStartRun = global.startRun;
  global.startRun = function () {
    const root = document.getElementById('run');
    const originalScroll = root?.scrollIntoView;
    if (root) root.scrollIntoView = () => {};
    try { return typeof previousStartRun === 'function' ? previousStartRun.apply(this, arguments) : undefined; }
    finally { if (root && originalScroll) root.scrollIntoView = originalScroll; }
  };

  global.renderRun = renderRun;
  global.WayfarerCombatCutover = Object.freeze({ version: VERSION, renderRun, get active() { return !!getRun()?.battle; } });
  global.WayfarerEngine?.modules?.register?.('combat-cutover', VERSION, global.WayfarerCombatCutover);
  if (getRun()) renderRun();
})(window);
