import { writable, type Writable } from 'svelte/store';

/**
 * Creates a Svelte writable store backed by localStorage under `key`.
 * Falls back to `defaultValue` when nothing is stored yet or the stored
 * value fails to parse.
 *
 * `migrate`, if given, is applied to whatever is read (parsed value or
 * `defaultValue`) before it becomes the store's initial value. Without it,
 * a value stored before a new field was added to `T` would come back
 * missing that field entirely — pass e.g. `(stored) => ({ ...defaultValue,
 * ...stored })` for an object-shaped `T` to backfill new fields with their
 * default instead.
 */
export function persisted<T>(
  key: string,
  defaultValue: T,
  migrate: (stored: T) => T = (stored) => stored
): Writable<T> {
  const initial = migrate(readFromStorage(key, defaultValue));
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
