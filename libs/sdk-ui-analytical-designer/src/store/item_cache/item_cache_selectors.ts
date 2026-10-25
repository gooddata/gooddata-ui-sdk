// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";
// (C) 2026 GoodData Corporation

/**
 * The domain's single input selector. The derived readers stay in
 * selectors/item_cache_selector.ts and hang off it.
 */
export const getItemCacheState = (state: IAppState) => state.data.itemCache;
