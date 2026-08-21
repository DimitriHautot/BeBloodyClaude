import { writable, type Writable } from 'svelte/store';

/**
 * Creates a Svelte writable store backed by localStorage under `key`.
 * Falls back to `defaultValue` when nothing is stored yet or the stored
 * value fails to parse.
 */
export function persisted<T>(key: string, defaultValue: T): Writable<T> {
  const initial = readFromStorage(key, defaultValue);
  const store = writable<T>(initial);

  store.subscribe((value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — ignore.
    }
  });

  return store;
}

function readFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}
