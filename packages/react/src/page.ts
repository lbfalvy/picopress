import * as rt from "runtypes";
import React from "react";
import { Trait, urn } from "picopress-core";

export const Page = rt.Record({
  path: rt.String,
  isTemplate: rt.Boolean,
  parent: urn.URN.optional(),
  element: rt.Unknown as rt.Runtype<React.ReactElement>,
});

export type Page = rt.Static<typeof Page>;

export const pageTrait: Trait<Page> = {
  name: "page",
  type: Page,
};
