(function () {
  'use strict';

  if (window.Wayfarer?.ready) return;

  const listeners = new Map();
  const release = Object.freeze({
    name: 'Wayfarer Guild',
  version: '0.11.0-recovery',
    saveFormat: 1,
    build: 'engine-v3-recovery'
  });

  function read(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn(`Could not read ${key}.`, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      emit('save:changed', { key, value });
      return true;
    } catch (error) {
      console.error(`Could not save ${key}.`, error);
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
      emit('save:changed', { key, removed: true });
      return true;
    } catch (error) {
      console.error(`Could not remove ${key}.`, error);
      return false;
    }
  }

  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event)?.delete(handler);
  }

  function emit(event, detail) {
    for (const handler of listeners.get(event) || []) {
      try { handler(detail); } catch (error) { console.error(error); }
    }
    window.dispatchEvent(new CustomEvent(`wayfarer:${event}`, { detail }));
  }

  function call(name, fn, fallback) {
    try { return fn(); }
    catch (error) {
      console.error(`[Wayfarer:${name}]`, error);
      emit('runtime:error', { name, error });
      return fallback;
    }
  }

  function once(key, fn) {
    const marker = `data-wayfarer-${key}`;
    if (document.documentElement.hasAttribute(marker)) return false;
    document.documentElement.setAttribute(marker, '');
    call(key, fn);
    return true;
  }

  window.Wayfarer = Object.freeze({
    ready: true,
    release,
    storage: Object.freeze({ read, write, remove }),
    on,
    emit,
    call,
    once
  });
  window.WAYFARER_RELEASE = release;
})();


