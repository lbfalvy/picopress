import { URN } from "./utils/urn.js";
import { Source, Store } from "./types.js";

export interface StoreDatabase {
  get<T>(src: Source<T>): Store<T> | undefined;
  all(): readonly Store<any>[];
}

export function storeDatabase(stores: Store<any>[]): StoreDatabase {
  const bySrc = new Map<URN, Store<any>>(stores.map(s => [s.source.urn, s]));
  return {
    get: src => bySrc.get(src.urn),
    all: () => stores,
  };
}
