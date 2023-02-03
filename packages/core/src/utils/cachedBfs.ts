import { getOrAdd } from "./mapUtils.js";

class PathCache<T> {
  // False means we know there isn't a path
  private paths = new Map<T, Map<T, readonly T[] | false>>();
  private neighbourStore = new Map<T, T[]>();

  public constructor(edges: readonly [T, T][]) {
    for (const edge of edges) {
      this.set(edge, edge);
      const neighborv = getOrAdd(this.neighbourStore, edge[0], () => []);
      neighborv.push(edge[1]);
    }
  }

  public set([fst, snd]: [T, T], path: readonly T[] | false) {
    const entries = getOrAdd(this.paths, fst, () => new Map());
    if (!entries.has(snd)) entries.set(snd, path);
  }
  public get([fst, snd]: [T, T]): readonly T[] | false | undefined {
    return this.paths.get(fst)?.get(snd);
  }
  public neighbours(t: T): readonly T[] {
    return this.neighbourStore.get(t) ?? [];
  }
}

interface CachedBfs<T> {
  path: (from: T, to: T) => readonly T[] | undefined;
  reachable: (from: T) => readonly [T, T[]][];
}

export function* walk<T>(from: T, neighbours: (t: T) => readonly T[]): Generator<[T, T[]]> {
  // Nodes we have discovered
  const known = new Set<T>();
  // Nodes whose neighbors we haven't yet discovered and their paths
  // This path will include the final node in all future entries,
  // this is how we can omit just the starting node from it.
  const queue = [] as [T, T[]][];
  let entry: [T, T[]]|undefined = [from, []];
  while (entry) {
    // Enqueue its neighbors
    const [root, path] = entry;
    for (const neighbour of neighbours(root)) {
      if (known.has(neighbour)) break;
      yield [neighbour, path];
      known.add(neighbour);
      // schedule it for neighbor discovery
      queue.push([neighbour, [...path, neighbour]]);
    }
    // Move to a new node
    entry = queue.shift();
  }
}

/** Cached breadth-first search. The returned path excludes both the start and end */
export function cachedBfs<T>(edges: [T, T][]): CachedBfs<T> {
  const cache = new PathCache(edges);
  return {
    path(from, to) {
      const cached = cache.get([from, to]);
      if (cached === false) return undefined;
      if (cached !== undefined) return cached;
      for (const [node, path] of walk(from, cache.neighbours)) {
        cache.set([from, node], path);
        if (node === to) return path;
      }
      cache.set([from, to], false);
      return undefined;
    },
    reachable: from => {
      const paths = [...walk(from, cache.neighbours)];
      for (const [node, path] of paths) cache.set([from, node], path);
      return paths;
    },
  };
}
