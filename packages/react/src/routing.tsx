import { Picopress, urn, View } from "picopress-core";
import { RouteObject } from "react-router-dom";
import { Page, pageTrait } from "./page.js";

export async function genRouter(pp: Picopress): Promise<RouteObject[]> {
  const pages = await pp.entities.getAll(pageTrait);
  return childRoutes(undefined, pages);
}

function childRoutes(parent: urn.URN | undefined, all: readonly View<Page>[]): RouteObject[] {
  return all
    .filter(p => p.data.parent === parent)
    .map(p => toRoute(p, all));
}

function toRoute(page: View<Page>, all: readonly View<Page>[]): RouteObject {
  return {
    path: page.data.path,
    element: page.data.element,
    children: page.data.isTemplate ? childRoutes(page.entity.urn, all) : undefined,
  };
}

/** Find the route that leads to a given entity */
export async function routeFor(page: View<Page>, pp: Picopress): Promise<string> {
  if (!page.data.parent) return page.data.path;
  const parentEntity = await pp.entities.get(page.data.parent);
  if (!parentEntity) throw new Error("Invalid parent");
  const parentPage = pp.traits.as(pageTrait, parentEntity);
  if (!parentPage) throw new Error("Parent is not a page");
  const parentRoute = await routeFor(parentPage, pp);
  return combinePaths(parentRoute, page.data.path);
}

/** Combine paths while resolving any slash inconsistencies */
export function combinePaths(root: string, sub: string): string {
  if (root.endsWith("/") && sub.startsWith("/")) return root + sub.slice(1);
  if (!root.endsWith("/") && !sub.startsWith("/")) return `${root}/${sub}`;
  return root + sub;
}
