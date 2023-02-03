import { createConfig, PicopressConfig } from "picopress-core";
import { Dirent, FS } from "../fs/types.js";
import { config, ProjectTreeOptions, root } from "./options.js";
import { processWithFile } from "./processWithFile.js";

const indexRegex = /^\+index\.[a-zA-Z0-9]*$/;

export async function projectTreeFS(
  fs: FS,
  options?: ProjectTreeOptions
): Promise<PicopressConfig> {
  const rootPath = root(options);
  const configPath = config(options);
  const configDir = await fs.ls(configPath);
  const configFiles = configDir.flatMap(ent => ent.entryType === "file" ? [ent.name] : []);
  const configEntries = configFiles.map(name =>
    [name, () => fs.import(`${configDir}${name}`)] as const
  );
  let configObj = createConfig();
  for (const entry of configEntries) configObj = await processWithFile(entry, configObj);
  const traitEntries = await Promise.all(configObj.traits.map(async trait => {
    let dir: Dirent[];
    try {
      dir = await fs.ls(`${rootPath}${trait}`);
    } catch(ex) { return [] as const; }
    const index = dir.find(ent => ent.entryType === "file" && indexRegex.test(ent.name))?.name;
    const fullIndexPath = `${rootPath}${trait}/${index}`;
    if (!index) return [] as const;
    return [[index, () => fs.import(fullIndexPath)]] as const;
  }));
  for (const entry of traitEntries.flat()) configObj = await processWithFile(entry, configObj);
  return configObj;
}
