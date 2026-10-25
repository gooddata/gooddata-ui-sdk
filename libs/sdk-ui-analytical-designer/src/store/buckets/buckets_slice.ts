// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { openReportFinished } from "../../actions/open_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import {
    arithmeticMeasureAdded,
    arithmeticMeasureOperandSelected,
    arithmeticMeasureOperatorSelected,
} from "../arithmetic_measures/arithmetic_measures_operation_events.js";
import {
    dateFilterUpdated,
    filterItemsUpdatedFromCommand,
    measureDateFilterApplied,
    measureDateFilterDateDatasetSelected,
    measureFilterAdded,
    measureFilterRemoved,
    measureFilterUpdated,
} from "../bucket_filters/bucket_filters_operation_events.js";
import { visualizationPropertiesChanged } from "../properties/properties_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
} from "../shortcuts/shortcuts_operation_events.js";

import {
    bucketItemAdded,
    bucketItemEdited,
    bucketItemReordered,
    bucketItemReplaced,
    bucketItemsRemoved,
    bucketItemsSwapped,
    bucketsDateDatasetChanged,
    derivedBucketItemsPlaced,
    dualAxisToggled,
    extendedReferencePointApplied,
    filterRemovalApplied,
} from "./buckets_operation_events.js";
import { type IBucketsState, bucketsInitialState } from "./buckets_state.js";

/**
 * `data.buckets` — every case consumes a SEMANTIC EVENT and no case consumes a trigger.
 *
 * A trigger writes nothing at all: a saga computes the whole gesture and commits it with one event,
 * and the buckets value in that event's payload is what this slice takes. So a gesture is never TWO
 * writes with an observable intermediate state — buckets changed, reference point not yet. The write
 * RULES live in `buckets_write_helpers.ts`, called by
 * `buckets_edit_operations.ts#editBucketsForItem`.
 *
 * Every case is `(_state, action) => action.payload.buckets`. The operation answers the ORIGINAL
 * reference when it changed nothing, so an unchanged value returns the same state and `combineBranch`
 * short-circuits — no subscriber is notified and no render happens. That is why the events carry
 * their values unconditionally and there is no diff, no presence map and no change set.
 *
 * NO external writer remains: the open-report case takes the loaded insight's buckets out of the
 * operation result, and the application resets are the matcher at the bottom.
 */
const bucketsSlice = createSlice({
    name: "buckets",
    initialState: bucketsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(bucketItemAdded, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(bucketItemsRemoved, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(bucketItemReplaced, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(bucketItemsSwapped, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(bucketItemReordered, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(bucketItemEdited, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(dualAxisToggled, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(bucketsDateDatasetChanged, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(extendedReferencePointApplied, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(derivedBucketItemsPlaced, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(filterRemovalApplied, (_state, action): IBucketsState => action.payload.buckets)
            // the properties family's one cascade: the push's `totals`/`bucketType`
            // riders land in the buckets, so its event carries a buckets value too
            .addCase(
                visualizationPropertiesChanged,
                (_state, action): IBucketsState => action.payload.buckets,
            )
            // the arithmetic-measure operations — the domain has no subtree of its own,
            // so every one of its events carries a buckets value
            .addCase(arithmeticMeasureAdded, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(
                arithmeticMeasureOperandSelected,
                (_state, action): IBucketsState => action.payload.buckets,
            )
            .addCase(
                arithmeticMeasureOperatorSelected,
                (_state, action): IBucketsState => action.payload.buckets,
            )
            // one recommendation event for five parameterizations
            .addCase(recommendationApplied, (_state, action): IBucketsState => action.payload.buckets)
            // the shortcut applies — both land the metric, over-time re-plants the dates
            .addCase(metricShortcutApplied, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(metricOverTimeShortcutApplied, (_state, action): IBucketsState => action.payload.buckets)
            // the bucket-filters operations that reach the buckets: the first date
            // filter drives every master's over-time comparison, the metric-filter gestures write
            // the item's own filters collection
            .addCase(dateFilterUpdated, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(filterItemsUpdatedFromCommand, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(measureFilterAdded, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(measureFilterRemoved, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(measureFilterUpdated, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(measureDateFilterApplied, (_state, action): IBucketsState => action.payload.buckets)
            .addCase(
                measureDateFilterDateDatasetSelected,
                (_state, action): IBucketsState => action.payload.buckets,
            )
            // opening a report lands the loaded insight's buckets — the open-report
            // operation's result (store/report/open_report_operation.ts)
            .addCase(openReportFinished, (_state, action): IBucketsState => action.payload.result.buckets)
            // the application resets — the reset scopes and their triggers are one
            // module, store/app_context/application_reset_events.ts
            .addMatcher(isInsightContentResetEvent, (): IBucketsState => bucketsInitialState);
    },
});

export const bucketsSliceReducer: Reducer<IBucketsState> = bucketsSlice.reducer;
