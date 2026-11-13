/* Deployment interaction bridge.
   The authored combat board can be re-rendered by the legacy expedition shell,
   so placement controls are handled at document capture level rather than on
   a transient battlePanel element. */
(function () {
  'use strict';

  function battleState() {
    try { return typeof runState !== 'undefined' ? runState?.battle : window.runState?.battle; } catch (_) { return window.runState?.battle; }
  }

  function refreshBoard() {
    try {
      if (typeof window.renderBattle === 'function') return window.renderBattle();
      if (typeof window.renderRun === 'function') return window.renderRun();
    } catch (_) {}
  }

  window.wayfarerRebuildSelect = function (id) {
    const battle = battleState();
    if (!battle) return;
    const selected = (battle.heroes || []).find(hero => String(hero.id) === String(id));
    battle.selectedId = selected ? selected.id : id;
    refreshBoard();
  };
  window.wayfarerRebuildCell = function (x, y) {
    if (typeof window.battleClick === 'function') window.battleClick(Number(x), Number(y));
  };
  window.wayfarerRebuildAction = function (action) {
    if (typeof window.handleRebuiltAction === 'function') return window.handleRebuiltAction(action);
  };

  function bindControls() {
    const panel = document.getElementById('battlePanel');
    if (!panel) return;
    panel.querySelectorAll('.rebuild-cell').forEach(cell => {
      cell.onclick = function () { window.wayfarerRebuildCell(this.dataset.x, this.dataset.y); };
    });
    panel.querySelectorAll('[data-select]').forEach(card => {
      card.onclick = function () { window.wayfarerRebuildSelect(this.dataset.select); };
    });
    panel.querySelectorAll('[data-action]').forEach(button => {
      button.onclick = function () { window.wayfarerRebuildAction(this.dataset.action); };
    });
  }

  if (typeof window.renderBattle === 'function') {
    const renderBattle = window.renderBattle;
    window.renderBattle = function () {
      const result = renderBattle.apply(this, arguments);
      bindControls();
      return result;
    };
  }
  bindControls();

  document.addEventListener('click', function (event) {
    const element = event.target?.closest?.('#battlePanel [data-select], #battlePanel .rebuild-cell');
    if (!element) return;
    const battle = battleState();
    if (!battle || battle.phase !== 'deployment') return;
    event.preventDefault();
    event.stopPropagation();

    if (element.matches('[data-select]')) {
      window.wayfarerRebuildSelect(element.dataset.select);
      return;
    }

    const x = Number(element.dataset.x), y = Number(element.dataset.y);
    if (typeof window.battleClick === 'function') window.battleClick(x, y);
  }, true);
})();
