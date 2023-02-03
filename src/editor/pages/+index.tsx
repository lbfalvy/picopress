import { pipe } from "fp-ts/lib/function";
import { addSource, PicopressConfig } from "../../../packages/core";

export function process(cfg: PicopressConfig): PicopressConfig {
  return addSource({
    get: urn => import(`./${urn}.tsx`).then(m => m.default),
    getAll: () => import.meta.glob
  })(cfg)
}