import { Subscribe } from "@lbfalvy/mini-events";
import rt from "runtypes";
import { URN } from "./utils/urn.js";

/** A capability provided by any number of [Entity] and [View] objects */
export interface Trait<T> {
  /** The unique name of the trait */
  readonly name: string;
  /** The shape of values that fit the interface, for runtime reflection */
  readonly type: rt.Runtype<T>;
}

/** An element that provides a [Trait] to expose its data and capabilities */
export interface Entity<T> {
  readonly urn: URN;
  readonly data: T;
  readonly trait: Trait<T>;
  readonly source: Source<T>;
}

/** An is-a relationship between [Trait] objects;
 * a cast from an [Entity] that provides the source to a [View] of the target
 */
export interface Impl<T, U> {
  readonly source: Trait<T>;
  readonly target: Trait<U>;
  readonly transform: (this: unknown, data: T) => U | never;
}

/** An object implementing a [Trait] for an [Entity] */
export interface View<T> {
  readonly entity: Entity<any>;
  readonly trait: Trait<T>;
  readonly data: T;
}

/** An [Entity] collection */
export interface Source<T> {
  readonly urn: URN;
  readonly trait: Trait<T>;
  /** Whether the source can collect entities individually. */
  readonly isBatched: boolean;
  readonly getAll: (this: unknown) => Promise<readonly Entity<T>[]>;
  readonly get: (this: unknown, urn: URN) => Promise<Entity<T> | undefined>;
  /** Whether the source can ever contain an entity with this URN */
  readonly owns: (this: unknown, urn: URN) => boolean;
  readonly changed?: ((urn: readonly URN[]) => Subscribe<[readonly URN[]]> | undefined) | undefined;
}

/** An editable [Entity] collection */
export interface Store<T> {
  readonly source: Source<T>;
  readonly create: () => Promise<Entity<T>>;
  readonly save: (urn: URN, data: T) => Promise<Entity<T>>;
  readonly delete: (urn: URN) => Promise<void>;
}
