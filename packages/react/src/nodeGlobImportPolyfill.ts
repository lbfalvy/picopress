import fastglob from "fast-glob";

/** A Node alternative to Vite's glob import */
function nodeGlobImport(
  pattern: string, options: any
): Record<string, () => Promise<unknown>> {
  if (options !== undefined) throw new Error("Options aren't implemented in the Node shim!");
  return Object.fromEntries(
    fastglob.sync(pattern)
      .map(s => [s, () => import(s)])
  );
}
import.meta.glob ??= nodeGlobImport as any;
