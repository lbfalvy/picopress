import { Trait, Impl, Entity, View } from "./types.js";
import { cachedBfs } from "./utils/cachedBfs.js";
import { add, key, implKey, view } from "./impl.js";

export interface TraitDatabase {
  lens: <T, U>(from: Trait<T>, to: Trait<U>) => Impl<T, U>|undefined;
  alternatives: <T>(to: Trait<T>) => readonly( readonly[Trait<any>, Impl<any, T>] )[];
  as<T>(trait: Trait<T>, entity: Entity<any>): View<T> | undefined;
}

export function traitDatabase(
  traits: readonly Trait<any>[],
  impls: readonly Impl<any, any>[]
): TraitDatabase {
  const implByKey = new Map(impls.map(v => [key(v), v]));
  const traitByName = new Map(traits.map(c => [c.name, c]));
  // NOTICE: Searches are done in reverse to cache better because targets are repeated more
  const bfs = cachedBfs(impls.map(({ source, target }) => [target.name, source.name]));

  function buildConversion<T, U>(steps: string[]): Impl<T, U> {
    const [fst, snd, ...rest] = steps;
    return rest.reduce((impl, next) => {
      const postfix = implByKey.get(implKey(impl.target.name, next))!;
      return add(impl, postfix);
    }, implByKey.get(implKey(fst, snd))!);
  }

  const db: TraitDatabase = {
    lens: (from, to) => {
      const route = bfs.path(to.name, from.name);
      if (route === undefined) return undefined;
      return buildConversion([to.name, ...route, from.name].reverse());
    },
    alternatives: to => {
      return bfs.reachable(to.name).map(([name, path]) => [
        traitByName.get(name)!,
        buildConversion([to.name, ...path, name].reverse()),
      ] as const);
    },
    as: (trait, entity) => {
      const lens = db.lens(entity.trait, trait);
      if (lens === undefined) return undefined;
      return view(lens, entity);
    },
  };
  return db;
}
