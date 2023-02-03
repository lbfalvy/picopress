import { TraitDatabase } from "./trait.js";
import { SourceDatabase } from "./source.js";
import { Trait, View, Entity } from "./types.js";
import { notNull } from "./utils/notNull.js";
import { view } from "./impl.js";
import { URN } from "./utils/urn.js";

export interface EntityDatabase {
  get(urn: URN): Promise<Entity<unknown> | undefined>;
  getOne<T>(trait: Trait<T>): Promise<View<T> | undefined>;
  getAll<T>(trait: Trait<T>): Promise<readonly View<T>[]>;
}

export function entityDatabase(
  traits: TraitDatabase, sources: SourceDatabase
): EntityDatabase {
  return {
    get: async urn => {
      for (const src of sources.all()) {
        const entity = await src.get(urn);
        if (entity) return entity;
      }
      return undefined;
    },
    getOne: async trait => {
      for (const [comp, conv] of traits.alternatives(trait)) {
        const entries = await sources.combinedByTrait(comp)?.getAll() ?? [];
        if (entries[0]) return view(conv, entries[0]);
      }
      return undefined;
    },
    getAll: async trait => {
      const data = await Promise.all(
        traits.alternatives(trait).map(async ([comp, conv]) => {
          const entries = await sources.combinedByTrait(comp)?.getAll() ?? [];
          return entries.map(e => view(conv, e));
        })
      );
      return data.flat().filter(notNull);
    },
  };
}

export function asView<T>(entity: Entity<T>): View<T> {
  return {
    data: entity.data,
    entity,
    trait: entity.trait,
  };
}
