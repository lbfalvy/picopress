import { Entity, map, Store, Trait, urn } from "picopress-core";
import { FS } from "../fs/types.js";
import { encoder, FolderStoreOptions, names, parser, root } from "./options.js";
import ev from "@lbfalvy/mini-events";
import fastglob from "fast-glob";

export function folderStoreFS<T, Name extends string>(
  fsv: FS,
  trait: Trait<T>,
  options: FolderStoreOptions<T, Name>,
): Store<T> {
  const rootPath = root(options);
  const entityUrnPrefix = `${urn.base}:react:folderStoreNode:entity:${rootPath}:`;
  const partNames = names(options);
  const encode = encoder(options);
  const parse = parser(options);
  const mainPart = partNames[0];
  const loadedEntities = new Map<urn.URN, Entity<T> | undefined>();
  const store: Store<T> = {
    source: {
      trait,
      isBatched: true,
      urn: urn.extend(urn.base, "react:folderStoreNode:source", rootPath),
      async get(urn) {
        if (!urn.startsWith(entityUrnPrefix)) return undefined;
        return map.getOrAddAsync(loadedEntities, urn, async () => {
          const filename = urn.slice(entityUrnPrefix.length);
          let partEntries: (readonly [string, any])[];
          try {
            partEntries = await Promise.all(partNames.map(
              async name => [name, await fsv.import(`${rootPath}${filename}${name}`)] as const
            ));
          } catch { return undefined; }
          const data = parse(Object.fromEntries(partEntries) as Record<Name, any>, urn);
          return {
            data, trait, urn,
            source: store.source,
          };
        }, map.RaceStrategy.overwrite);
      },
      owns: urn => urn.startsWith(entityUrnPrefix),
      changed(urns) {
        const ownUrns = urns.filter(urn => urn.startsWith(entityUrnPrefix));
        if (ownUrns.length === 0) return undefined;
        return ev.merge(...ownUrns.flatMap(urn => {
          const key = urn.slice(entityUrnPrefix.length);
          return partNames.map(part => ev.map(
            fsv.watch(`${rootPath}${key}${part}`),
            () => [[urn]] as const,
          ));
        }));
      },
      async getAll() {
        const entries = await fastglob([`${rootPath}*${mainPart}`]);
        return await Promise.all(entries.map(async path => {
          const key = path.slice(rootPath.length, path.length - mainPart.length);
          const entityUrn = `${entityUrnPrefix}${key}` as urn.URN;
          const entity = await store.source.get(entityUrn);
          return entity!;
        }));
      },
    },
    async create() {
      const data = options.default();
      const filename = new Date().toISOString();
      const newURN = urn.URN.check(`${entityUrnPrefix}${filename}`);
      return await store.save(newURN, data);
    },
    async delete(urn) {
      if (!urn.startsWith(entityUrnPrefix)) return undefined;
      const filename = urn.slice(entityUrnPrefix.length);
      await Promise.all(partNames.map(
        async ext => await fsv.rm(`${rootPath}${filename}${ext}`, { force: true })
      ));
    },
    async save(urn, data) {
      if (!urn.startsWith(entityUrnPrefix)) throw new Error("Wrong store!");
      const filename = urn.slice(entityUrnPrefix.length);
      const parts = encode(data, urn);
      await Promise.all(Object.entries(parts).map(
        async ([ext, part]) => await fsv.write(
          `${rootPath}${filename}${ext as Name}`,
          part as string
        )
      ));
      const entity: Entity<T> = {
        urn, data, trait,
        source: store.source,
      };
      loadedEntities.set(urn, entity);
      return entity;
    },
  };
  return store;
}
