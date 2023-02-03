import ev, { merge } from "@lbfalvy/mini-events";
import { Trait, Entity, Source } from "./types.js";
import { randomDigits } from "./utils/randomDigits.js";
import { base, extend, URN } from "./utils/urn.js";
import { notNull } from "./utils/notNull.js";

const sourceUrn = extend(base, "core:source");

export type FreeEntity<T> = Omit<Entity<T>, "source">;

export function singleSource<T>(freeEntity: FreeEntity<T>): Source<T> {
  const source: Source<T> = {
    urn: extend(sourceUrn, "singleSource", freeEntity.urn),
    trait: freeEntity.trait,
    isBatched: false,
    get: urn => Promise.resolve(urn === entity.urn ? entity : undefined),
    owns: urn => freeEntity.urn === urn,
    getAll: () => Promise.resolve([entity]),
  };
  const entity = { ...freeEntity, source };
  return source;
}

export function arraySource<T>(
  freeEntities: readonly FreeEntity<T>[], trait?: Trait<T>, unchecked = false
): Source<T> {
  trait ??= freeEntities[0]?.trait;
  if (!unchecked) {
    if (!trait) throw new Error("Cannot infer trait for empty entity array");
    if (freeEntities.length && freeEntities[0].trait.name !== trait.name)
      throw new Error("Entities are not of the specified trait");
    for(let i = 0; i < freeEntities.length - 1; i++)
      if (freeEntities[i].trait.name !== freeEntities[i+1].trait.name)
        throw new Error("Entities are not all of the same trait");
  }
  const source: Source<T> = {
    urn: extend(sourceUrn, "arraySource", freeEntities[0]?.urn ?? randomDigits(24)),
    trait: trait,
    isBatched: false,
    owns: urn => entities.some(e => e.urn === urn),
    get: urn => Promise.resolve(urnMap.get(urn)),
    getAll: () => Promise.resolve(entities),
  };
  const entities = freeEntities.map(ent => ({ ...ent, source }));
  const urnMap = new Map<string, Entity<T>>(entities.map(e => [e.urn, e]));
  return source;
}

export function combineSources<T>(
  sources: readonly Source<T>[], trait?: Trait<T>, unchecked = false
): Source<T> {
  trait ??= sources[0]?.trait;
  if (!unchecked) {
    if (!trait) throw new Error("Cannot infer trait for empty source array");
    if (sources.length && sources[0].trait.name !== trait.name)
      throw new Error("Sources are not of the specified trait");
    for(let i = 0; i < sources.length - 1; i++)
      if (sources[i].trait.name !== sources[i+1].trait.name)
        throw new Error("Sources are not all of the same trait");
  }
  const changedFns = sources.map(s => s.changed).filter(notNull);
  return {
    urn: extend(sourceUrn, "combine", sources[0]?.urn ?? randomDigits(24)),
    trait: trait,
    isBatched: sources.some(s => s.isBatched),
    get: async urn => {
      for (const source of sources) {
        const result = await source.get(urn);
        if (result) return result;
      }
      return undefined;
    },
    getAll: async () => {
      const result = await Promise.all(sources.map(src => src.getAll()));
      return result.flat();
    },
    owns: urn => sources.some(s => s.owns(urn)),
    changed: changedFns.length > 0
      ? urns => merge(...changedFns.map(f => f(urns)).filter(notNull))
      : undefined,
  };
}

export interface SourceDatabase {
  byTrait<T>(trait: Trait<T>): readonly Source<T>[];
  combinedByTrait<T>(trait: Trait<T>): Source<T>;
  isBatched<T>(trait: Trait<T>): boolean;
  all(): readonly Source<any>[];
  get(urn: URN): Source<any>|undefined;
  changed(urns: readonly URN[]): ev.Subscribe<[readonly URN[]]>;
}

export function sourceDatabase(sources: Source<any>[]): SourceDatabase {
  const byTrait = new Map<string, Source<any>[]>();
  const changedFns = sources.map(s => s.changed).filter(notNull);
  const db: SourceDatabase = {
    byTrait: trait => byTrait.get(trait.name) ?? [],
    combinedByTrait: trait => combineSources(db.byTrait(trait), trait, true),
    all: () => sources,
    isBatched: trait => db.byTrait(trait).some(b => b.isBatched),
    get: urn => sources.find(s => s.urn === urn),
    changed: changedFns.length > 0
      ? urns => merge(...changedFns.map(f => f(urns)).filter(notNull))
      : () => () => () => undefined,
  };
  return db;
}
