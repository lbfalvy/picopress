import { key } from "./impl.js";
import { Impl, Source, Store, Trait } from "./types.js";

export interface PicopressConfig {
  traits: Trait<any>[];
  sources: Source<any>[];
  stores: Store<any>[];
  impls: Impl<any, any>[];
}

export function createConfig(): PicopressConfig {
  return { traits: [], sources: [], impls: [], stores: [] };
}

export function addTrait(trait: Trait<any>): (cfg: PicopressConfig) => PicopressConfig {
  return cfg => {
    if (cfg.traits.some(t => t.name === trait.name))
      throw new Error("Duplicate trait name");
    return { ...cfg, traits: [...cfg.traits, trait] };
  };
}

export function addSource(src: Source<any>): (cfg: PicopressConfig) => PicopressConfig {
  return cfg => {
    if (cfg.sources.some(t => t.urn === src.urn))
      throw new Error("Duplicate source URN");
    return { ...cfg, sources: [...cfg.sources, src] };
  };
}

export function addImpl(impl: Impl<any, any>): (cfg: PicopressConfig) => PicopressConfig {
  return cfg => {
    if (cfg.impls.some(i =>
      i.source.name === impl.source.name && i.target.name === impl.target.name
    )) throw new Error("Duplicate impl will cause ambiguity");
    return { ...cfg, impls: [...cfg.impls, impl] };
  };
}

export function addStore(store: Store<any>): (cfg: PicopressConfig) => PicopressConfig {
  return cfg => {
    if (cfg.stores.some(i => i.source.urn === store.source.urn))
      throw new Error("Duplicate stores for the same source");
    try { cfg = addSource(store.source)(cfg); } catch(e) {/* Patch store for known source */}
    return { ...cfg, stores: [...cfg.stores, store] };
  };
}

export function validate(cfg: PicopressConfig): boolean {
  const ids = new Set<string>();
  for (const id of [
    ...cfg.impls.map(key),
    ...cfg.sources.map(s => s.urn),
    ...cfg.traits.map(t => t.name),
  ]) if (ids.has(id)) return false;
  else ids.add(id);
  return true;
}
