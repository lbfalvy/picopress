import { createConfig, PicopressConfig } from "picopress-core";
import { config, ProjectTreeOptions, root } from "./options.js";
import { processWithFile } from "./processWithFile.js";

/**
 * Reads config and entities out of a dict of files to import functions
 *
 * # Usage
 *
 * In Vite, you can use the bundler's builtin glob import support. In this case, remember that
 * you MUST NOT use wildcards or any other computations, or alias the function. It must be
 * called directly on a string literal, like so:
 * ```
 * projectTree(import.meta.glob("./**"))
 * ```
 *
 * If you need to load a path other than ".", or if you want to modify other parts of the
 * loading process, you should use the second argument to projectTree.
 *
 * @param files The output of your glob import
 * @param options Options to customize how the tree is interpreted
 */
export async function projectTreeVite(
  files: Record<string, () => Promise<unknown>>, options?: ProjectTreeOptions
): Promise<PicopressConfig> {
  const rootPath = root(options);
  const configPath = config(options);
  const entries = Object.entries(files);
  let configObj = createConfig();
  const configEntries = entries.filter(([name]) => name.startsWith(configPath));
  for (const entry of configEntries) configObj = await processWithFile(entry, configObj);
  for (const trait of configObj.traits) {
    const traitIndexPathPrefix = `${rootPath}${trait.name}/+index`;
    const index = entries.find(([name]) => name.startsWith(traitIndexPathPrefix));
    if (index) configObj = await processWithFile(index, configObj);
  }
  return configObj;
}
