import * as rt from "runtypes";

export const URN = rt.String.withBrand("URN")
  .withConstraint(s => s.startsWith("urn:") && !s.includes(" "));
export type URN = rt.Static<typeof URN>;

export const base = URN.check("urn:picopress");

export function extend(...segments: [URN, ...string[]]): URN {
  return URN.check([...segments].join(":"));
}
