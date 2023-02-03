import { Subscribe } from "@lbfalvy/mini-events";

export interface FileEvent {
  eventType: "rename" | "change";
  filename: string;
}

export interface Dirent {
  entryType: "blockdev" | "chardev" | "fifo" | "file" | "socket" | "symlink" | "dir";
  name: string;
}

export interface FS {
  import(path: string): Promise<any>;
  watch(path: string): Subscribe<[FileEvent]>;
  write(path: string, data: string): Promise<void>;
  rm(path: string, opts: { force: boolean }): Promise<void>;
  ls(path: string): Promise<Dirent[]>;
}
