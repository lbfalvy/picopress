import { FS } from "./types.js";
import fs from "node:fs/promises";
import ev from "@lbfalvy/mini-events";

let nocache = Math.floor(Math.random() * 100_000);

export const node: FS = {
  import: path => import(`${path}?nocache=${nocache++}`),
  rm: (path, { force }) => fs.rm(path, { force }),
  watch: path => ev.fromAsyncIterable(fs.watch(path)),
  write: (path, data) => fs.writeFile(path, data),
  async ls(path) {
    const entries = await fs.readdir(path, { withFileTypes: true });
    return entries.map(ent => ({
      name: ent.name,
      entryType: ent.isBlockDevice() && "blockdev"
        || ent.isCharacterDevice() && "chardev"
        || ent.isDirectory() && "dir"
        || ent.isFIFO() && "fifo"
        || ent.isFile() && "file"
        || ent.isSocket() && "socket"
        || ent.isSymbolicLink() && "symlink"
        || (() => { throw new Error("Unrecognized directory entry"); })(),
    }));
  },
};

