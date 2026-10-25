// (C) 2026 GoodData Corporation

import { type ICatalogEntries } from "../../typings/state_objects.js";

/**
 * `data.itemCache` — the catalog-item cache keyed by `<type>.<identifier>`.
 *
 * Its entries are the currency of the buckets cluster: `getAttribute()` returns one, decorated
 * bucket items keep it in their `attribute` field, and `utils/api.ts#getItemCacheItems` merges the
 * loaded date attributes into the stored container.
 *
 * `mergeItemsIntoCache` is a PURE, identity-preserving function rather than an immer mutation, so a
 * no-op merge does not dirty the subtree.
 */
export type IItemCacheState = ICatalogEntries;

export const itemCacheInitialState: IItemCacheState = {};
