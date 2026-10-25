// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { setDateDatasetsMeta, updateItemCache } from "../../actions/data_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { measureFilterAdded } from "../bucket_filters/bucket_filters_operation_events.js";

import { granularityCacheItems, mergeItemsIntoCache } from "./item_cache_helpers.js";
import { type IItemCacheState, itemCacheInitialState } from "./item_cache_state.js";

const itemCacheSlice = createSlice({
    name: "itemCache",
    initialState: itemCacheInitialState,
    reducers: {},
    // Both cases RETURN the merge result instead of mutating the draft: `mergeItemsIntoCache` is
    // identity-preserving, so a no-op merge hands immer back the draft it was given and the root
    // reference survives. Returning the draft unchanged is immer's own no-change signal.
    extraReducers: (builder) => {
        builder
            .addCase(updateItemCache, (state, action): IItemCacheState =>
                mergeItemsIntoCache(state, action.payload.itemCache),
            )
            // SET_DATE_DATASETS_META fans out to two slices: the meta leaf goes to
            // store/date_datasets_meta, the derived granularity entries land here
            .addCase(setDateDatasetsMeta, (state, action): IItemCacheState =>
                mergeItemsIntoCache(state, granularityCacheItems(action.payload.dateDatasetsMeta)),
            )
            // adding an attribute metric filter caches the attribute's catalog entry — the
            // operation already ran the same merge, so the payload's value lands as-is (an
            // unchanged cache arrives by reference and immer sees no change)
            .addCase(measureFilterAdded, (_state, action): IItemCacheState => action.payload.itemCache)
            // opening a report SHALLOW-merges the loaded items over the cache — the
            // open-report operation ran the merge (open_report_operation.ts)
            .addCase(
                openReportFinished,
                (_state, action): IItemCacheState => action.payload.result.itemCache,
            );
    },
});

export const itemCacheSliceReducer: Reducer<IItemCacheState> = itemCacheSlice.reducer;
