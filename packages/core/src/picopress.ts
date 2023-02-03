import { TraitDatabase, traitDatabase } from "./trait.js";
import { entityDatabase, EntityDatabase } from "./entity.js";
import { PicopressConfig, validate } from "./config.js";
import { sourceDatabase, SourceDatabase } from "./source.js";
import { storeDatabase, StoreDatabase } from "./store.js";

export interface Picopress {
  traits: TraitDatabase;
  sources: SourceDatabase;
  stores: StoreDatabase;
  entities: EntityDatabase;
}

export function picopress(cfg: PicopressConfig): Picopress {
  if (!validate(cfg)) throw new Error("Invalid config");
  const traits = traitDatabase(cfg.traits, cfg.impls);
  const sources = sourceDatabase(cfg.sources);
  const stores = storeDatabase(cfg.stores);
  const entities = entityDatabase(traits, sources);
  return {
    traits,
    sources,
    stores,
    entities,
  };
}
