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

  document.addEventListener('click', function (event) {
    const element = event.target?.closest?.('#battlePanel [data-select], #battlePanel .rebuild-cell');
    if (!element) return;
    const battle = battleState();
    if (!battle || battle.phase !== 'deployment') return;
    event.preventDefault();
    event.stopPropagation();

    if (element.matches('[data-select]')) {
      battle.selectedId = String(element.dataset.select);
      refreshBoard();
      return;
    }

    const x = Number(element.dataset.x), y = Number(element.dataset.y);
    if (typeof window.battleClick === 'function') window.battleClick(x, y);
  }, true);
})();
