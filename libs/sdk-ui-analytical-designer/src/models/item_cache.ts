// (C) 2007-2026 GoodData Corporation

import invariant from "invariant";

import { getItemCacheState } from "../store/item_cache/item_cache_selectors.js";
import { type IAppState } from "../store/types.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type ICatalogEntries, type ICatalogEntry } from "../typings/state_objects.js";

/**
 * Whole-subtree seed / key reads for the itemCache. TEST-ONLY: production writes go through the
 * slice and production reads through `selectors/item_cache_selector.ts`.
 */
export function save(state: IAppState, items: ICatalogEntries) {
    return withData(state, { itemCache: items });
}

export function load(state: IAppState, key: string): ICatalogEntry {
    const item = getItemCacheState(state)?.[key];

    invariant(item, `Item '${key}' not found.`);

    return item;
}

export function loadWithDefault<T>(state: IAppState, key: string, defaultValue: T) {
    return getItemCacheState(state)?.[key] ?? defaultValue;
}
