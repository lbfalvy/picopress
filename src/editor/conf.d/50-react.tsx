import { pipe } from "fp-ts/lib/function";
import { addTrait, PicopressConfig } from "../../../packages/core";

export function process(cfg: PicopressConfig): PicopressConfig {
  return pipe(cfg,
    addTrait()
  );
}
