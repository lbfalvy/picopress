export interface ProjectTreeOptions {
  root?: string;
  configFolder?: string;
}

export function root(options?: ProjectTreeOptions): string {
  if (!options?.root) return "./";
  if (options.root.endsWith("/")) return options.root;
  return `${options.root}/`;
}

export function config(options?: ProjectTreeOptions): string {
  if (!options?.configFolder) return `${root(options)}conf.d/`;
  const withRoot = options.configFolder.startsWith("/")
    ? options.configFolder
    : `${root(options)}${options.configFolder}`;
  if (withRoot.endsWith("/")) return withRoot;
  return `${withRoot}/`;
}
