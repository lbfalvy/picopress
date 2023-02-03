import { PicopressConfig, validate } from "picopress-core";

/** Load a file and call its `process` function on the input, handling all errors */
export async function processWithFile(
  entry: readonly [string, () => Promise<any>], input: PicopressConfig
): Promise<PicopressConfig> {
  const [name, loader] = entry;
  let imports: any;
  try { imports = await loader(); } catch(err: any) {
    console.error(`Failed to load ${name}: ${err.message}`);
    return input;
  }
  if (!imports.process) {
    console.error(`No export called "process" in ${name}`);
    return input;
  }
  if (typeof imports.process !== "function") {
    console.error(`Export "process" is not a function in ${name}`);
    return input;
  }
  let output: any;
  try { output = imports.process(input); } catch(err: any) {
    console.error(`Error while running ${name}: ${err.message}`);
    return input;
  }
  if (!output) { // maybe mutates?
    console.warn([
      `"process" in ${name} didn't return a value.`,
      "If the function mutates the config, please update it to return a copy instead.",
    ].join("\n"));
    if (validate(input)) return input;
    throw new Error("A mutating hook corruped the config");
  }
  return output;
}
