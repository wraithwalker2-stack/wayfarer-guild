(function () {
  'use strict';

  const RELEASE = window.Wayfarer?.release || Object.freeze({
    name: 'Wayfarer Guild',
  version: '0.8.0-alpha',
    saveFormat: 1
  });
  const SAVE_PREFIXES = ['wayfarer-', 'guild-sfx'];
  const BACKUP_KEY = 'wayfarer-save-backup-v1';

  function isGameKey(key) {
    return key !== BACKUP_KEY && SAVE_PREFIXES.some(prefix => key.startsWith(prefix));
  }

  function collectSave() {
    const storage = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && isGameKey(key)) storage[key] = localStorage.getItem(key);
    }
    return {
      game: RELEASE.name,
      version: RELEASE.version,
      saveFormat: RELEASE.saveFormat,
      exportedAt: new Date().toISOString(),
      storage
    };
  }

  function download(name, contents) {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  window.exportWayfarerSave = function () {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`wayfarer-guild-save-${stamp}.json`, JSON.stringify(collectSave(), null, 2));
    if (typeof toast === 'function') toast('Save exported. Keep this file as a backup.');
  };

  window.chooseWayfarerSave = function () {
    document.getElementById('wayfarerSaveInput')?.click();
  };

  async function importSave(file) {
    const parsed = JSON.parse(await file.text());
    if (parsed?.game !== RELEASE.name || !parsed.storage || typeof parsed.storage !== 'object') {
      throw new Error('This is not a Wayfarer Guild save file.');
    }
    const entries = Object.entries(parsed.storage).filter(([key, value]) => isGameKey(key) && typeof value === 'string');
    if (!entries.length) throw new Error('The save file does not contain game progress.');
    localStorage.setItem(BACKUP_KEY, JSON.stringify(collectSave()));
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && isGameKey(key)) localStorage.removeItem(key);
    }
    for (const [key, value] of entries) localStorage.setItem(key, value);
    window.location.reload();
  }

  window.restoreWayfarerBackup = function () {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return typeof toast === 'function' && toast('No import backup is available.');
    const parsed = JSON.parse(backup);
    for (const [key, value] of Object.entries(parsed.storage || {})) {
      if (isGameKey(key) && typeof value === 'string') localStorage.setItem(key, value);
    }
    window.location.reload();
  };

  function installReleaseTools() {
    document.title = `${RELEASE.name} — Public Alpha`;
    const versionText = document.querySelector('.side-bottom');
    if (versionText) {
      versionText.innerHTML = `AUTUMN, YEAR 01<br><strong>“Fortune favors the prepared.”</strong><br><br><span class="release-version">Public Alpha · v${RELEASE.version}</span>`;
      const tools = document.createElement('section');
      tools.className = 'release-tools';
      tools.innerHTML = `
        <b>YOUR SAVE</b>
        <button onclick="exportWayfarerSave()">⇩ Export backup</button>
        <button onclick="chooseWayfarerSave()">⇧ Import save</button>
        <button class="restore-save" onclick="restoreWayfarerBackup()">↶ Restore last import backup</button>
        <input id="wayfarerSaveInput" type="file" accept="application/json,.json" hidden>
        <button class="reset-game" type="button" onclick="resetGame()">↻ Reset game</button>
      `;
      versionText.append(tools);
      document.getElementById('wayfarerSaveInput').addEventListener('change', async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          await importSave(file);
        } catch (error) {
          if (typeof toast === 'function') toast(error.message || 'That save could not be imported.');
          event.target.value = '';
        }
      });
    }
    const loader = document.getElementById('appLoader');
    if (loader) {
      loader.classList.add('complete');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  }

  window.addEventListener('error', event => {
    try {
      sessionStorage.setItem('wayfarer-last-error', JSON.stringify({
        time: new Date().toISOString(),
        message: event.message,
        source: event.filename?.split('/').pop() || '',
        line: event.lineno || 0
      }));
    } catch (_) {}
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  window.WAYFARER_RELEASE = RELEASE;
  installReleaseTools();
})();

