/** A bounded cache that shares in-flight work and never retains rejected loads. */
export function createAsyncCache<T>(maxEntries: number, ttlMs: number, now = Date.now) {
  const entries = new Map<string, { promise: Promise<T>; expires: number }>();
  return {
    get(key: string, load: () => Promise<T>): Promise<T> {
      const cached = entries.get(key);
      if (cached && cached.expires > now()) {
        entries.delete(key);
        entries.set(key, cached);
        return cached.promise;
      }
      entries.delete(key);
      if (entries.size >= maxEntries) entries.delete(entries.keys().next().value!);
      const entry = { promise: null as unknown as Promise<T>, expires: Infinity };
      entry.promise = Promise.resolve().then(load).then(value => {
        entry.expires = now() + ttlMs;
        return value;
      }, error => {
        if (entries.get(key) === entry) entries.delete(key);
        throw error;
      });
      entries.set(key, entry);
      return entry.promise;
    },
  };
}
