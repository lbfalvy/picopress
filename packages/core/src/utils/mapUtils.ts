export function getOrAdd<K, V>(map: Map<K, V>, key: K, make_v: () => V): V {
  if (map.has(key)) return map.get(key)!;
  const value = make_v();
  map.set(key, value);
  return value;
}

export const enum RaceStrategy {
  overwrite = "overwrite",
  discard = "discard",
  nosave = "nosave",
  swap = "swap",
}

/**
 * Either return the value of the given key from the map, or return and save the return value of
 * the callback. A strategy may be specified to decide what happens if the key has been filled
 * while the function was running.
 * @param map The map to operate on
 * @param key The index to operate on
 * @param make_v Async function to be called if the key wasn't found
 * @param race What to do if another entry has been inserted by the time make_v returns
 * @returns The return value of `make_v` unless race handling says otherwise.
 */
export async function getOrAddAsync<K, V>(
  map: Map<K, V>, key: K, make_v: () => Promise<V>,
  race = RaceStrategy.discard
): Promise<V> {
  if (map.has(key)) return map.get(key)!;
  const value = await make_v();
  if (!map.has(key)) {
    map.set(key, value);
    return value;
  }
  const racer = map.get(key)!;
  if (race === RaceStrategy.overwrite || race === RaceStrategy.swap) map.set(key, value);
  if (race === RaceStrategy.overwrite || race === RaceStrategy.nosave) return value;
  else return racer;
}

export function getAndDelete<K, V>(map: Map<K, V>, key: K): V | undefined {
  const value = map.get(key);
  if (value || map.has(key)) map.delete(key);
  return value;
}
