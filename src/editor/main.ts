import { picopress } from "../../packages/core";
import { projectTree } from "../../packages/react/src";

const config = await projectTree(import.meta.glob("./**"));
const pp = picopress(config);
