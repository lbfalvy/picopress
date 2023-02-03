import { Entity, Trait, Impl, View } from "./types.js";

/** Determine if an impl translates from a specified trait */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSource<T, U>(impl: Impl<any, U>, trait: Trait<T>): impl is Impl<T, U> {
  return impl.source.name === trait.name;
}

/** Determine if an impl translates to a specified trait */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTarget<T, U>(impl: Impl<T, any>, trait: Trait<U>): impl is Impl<T, U> {
  return impl.target.name === trait.name;
}

export function add<T, U, V>(fst: Impl<T, U>, snd: Impl<U, V>): Impl<T, V> {
  if (fst.target.name !== snd.source.name)
    throw new Error("Mismatched types on chained impls");
  return {
    source: fst.source,
    target: snd.target,
    transform: t => snd.transform(fst.transform(t)),
  };
}

export const key = (
  { source, target }: Impl<any, any>
): string => `${source.name} -> ${target.name}`;
export const implKey = (source: string, target: string): string => `${source} -> ${target}`;

export function view<T, U>(impl: Impl<T, U>, entity: Entity<T>): View<U> {
  if (entity.trait.name !== impl.source.name) {
    throw new Error(`Incorrect input ${entity.trait.name} to impl ${key(impl)}`);
  }
  return {
    data: impl.transform(entity.data),
    trait: impl.target,
    entity,
  };
}
