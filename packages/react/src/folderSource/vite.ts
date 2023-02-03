import { Entity, map, notNull, Source, Trait, urn } from "picopress-core";
import { FolderSourceOptions, names, parser, root } from "./options.js";

async function loadFromParts<T, Name extends string>(
  urn: urn.URN, trait: Trait<T>, source: Source<T>,
  partLoaders: [Name, () => Promise<any>][],
  options: FolderSourceOptions<T, Name> | undefined
): Promise<Entity<T>> {
  const parts = await Promise.all(
    partLoaders.map(async ([part, loader]) => [part, await loader()] as const)
  );
  const partRecord = Object.fromEntries(parts) as Record<Name, any>;
  const parsed = parser(options)(partRecord, urn);
  const data = trait.type.check(parsed);
  return { urn, data, source, trait };
}

export function folderSourceVite<
  T, Name extends string,
>(
  files: Record<string, () => Promise<unknown>>,
  trait: Trait<T>,
  options?: FolderSourceOptions<T, Name>,
): Source<T> {
  const rootPath = root(options);
  const entityUrnPrefix = urn.extend(urn.base, "react:folderSourceVite:entity", rootPath);
  const partNames = names(options);
  const modules = Object.entries(files)
    .filter(([name]) => name.startsWith(rootPath))
    .map(([name, loader]) => {
      name = name.slice(rootPath.length);
      return [name, loader] as const;
    });
  const loadersByEntity = new Map<string, [Name, () => Promise<any>][]>();
  // const errtables = {} as Record<string, Error[]>;
  for (const [filename, loader] of modules) {
    const part = partNames.find(n => filename.endsWith(n));
    if (!part) {
      console.warn(`File ${filename} doesn't match any known part name`);
      continue;
    }
    const name = filename.slice(0, filename.length - part.length);
    map.getOrAdd(loadersByEntity, name, () => []).push([part, loader]);
  }
  const entityLoadersByUrn = new Map<urn.URN, () => Promise<Entity<T>>>();
  for (const [name, loaders] of loadersByEntity) {
    if (loaders.length < partNames.length) {
      console.error("Not all parts of entry were found");
      continue;
    }
    const entityUrn = urn.extend(entityUrnPrefix, name);
    entityLoadersByUrn.set(entityUrn, () => loadFromParts(
      entityUrn, trait, source, loaders, options
    ));
  }
  const loadedEntities = new Map<urn.URN, Entity<T> | undefined>();
  const source: Source<T> = {
    trait,
    isBatched: true,
    urn: urn.extend(urn.base, "react:folderSourceVite:source", rootPath),
    owns: urn => urn.startsWith(entityUrnPrefix),
    get: async urn => map.getOrAddAsync(loadedEntities, urn, () => {
      return map.getAndDelete(entityLoadersByUrn, urn)?.() ?? Promise.resolve(undefined);
    }, map.RaceStrategy.overwrite),
    getAll: async () => {
      for (const [urn, loader] of entityLoadersByUrn) {
        try {
          const ent = await loader();
          loadedEntities.set(urn, ent);
        } catch(e: any) {
          console.error(`Error while loading entity: ${e.message}`);
        }
      }
      entityLoadersByUrn.clear();
      return [...loadedEntities.values()].filter(notNull);
    },
  };
  return source;
}
