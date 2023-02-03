import { urn } from "picopress-core";

export type FolderSourceOptions<T, Name extends string> = {
  root?: string; // defaults to "."
  multipart?: {
    names: Name[];
    parse: (parts: Record<Name, any>, urn: urn.URN) => T;
  };
};

export type FolderStoreOptions<T, Name extends string> =
& FolderSourceOptions<T, Name>
& {
  default: () => T;
}
& (
  | {
    multipart: {
      encode: (data: T, urn: urn.URN) => Record<Name, string>;
    };
    encode: never;
  }
  | {
    multipart: never;
    encode: (data: T, urn: urn.URN) => string;
  }
);

export function root<T, Name extends string>(options?: FolderSourceOptions<T, Name>): string {
  if (!options?.root) return "./";
  if (options.root.endsWith("/")) return options.root;
  return `${options.root}/`;
}

export function names<T, Name extends string>(options?: FolderSourceOptions<T, Name>): Name[] {
  return options?.multipart?.names.sort((a, b) => b.length - a.length) ?? ["" as Name];
}

export function parser<T, Name extends string>(
  options?: FolderSourceOptions<T, Name>
): (parts: Record<Name, any>, urn: urn.URN) => T {
  return options?.multipart?.parse ?? (({ ["" as Name]: data }) => data.default as T);
}

export function encoder<T, Name extends string>(
  options: FolderStoreOptions<T, Name>
): (data: T, urn: urn.URN) => Record<Name, string> {
  if (options?.multipart) return options.multipart.encode;
  else return (data: T, urn: urn.URN) => ({
    ["" as Name]: options.encode(data, urn),
  } as Record<Name, string>);
}
