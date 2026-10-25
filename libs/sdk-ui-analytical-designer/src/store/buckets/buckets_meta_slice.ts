// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { type ISetBucketItemExpandedAction } from "../../actions/buckets_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import {
    arithmeticMeasureAdded,
    arithmeticMeasureOperandSelected,
} from "../arithmetic_measures/arithmetic_measures_operation_events.js";
import {
    attributeFilterUpdated,
    dateFilterUpdated,
    filterItemsUpdatedFromCommand,
    measureFilterUpdated,
} from "../bucket_filters/bucket_filters_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
} from "../shortcuts/shortcuts_operation_events.js";

import { toggleBucketItemExpandedInMeta } from "./buckets_edit_operations.js";
import { type IBucketsMetaState, bucketsMetaInitialState } from "./buckets_meta_state.js";
import {
    bucketItemAdded,
    bucketItemReplaced,
    bucketItemsRemoved,
    filterRemovalApplied,
} from "./buckets_operation_events.js";

/**
 * `data.bucketsMeta`.
 *
 * It owns ONE action outright: `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED`, which writes this subtree and
 * nothing else — no saga, no event, no reference-point sync.
 *
 * The four operation events below are the cross-domain half: each carries the `bucketsMeta` its
 * operation decided, and the case simply takes it. An UNCHANGED value arrives by reference, so
 * `combineBranch` short-circuits and no subscriber is notified — which is why the events carry their
 * values unconditionally and there is no change set.
 *
 * Writers OUTSIDE this domain address the whole root, and this reducer returns unknown-action state
 * unchanged; see the note on {@link IBucketsMetaState}.
 */
const bucketsMetaSlice = createSlice({
    name: "bucketsMeta",
    initialState: bucketsMetaInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            /**
             * Expanding a different item collapses the previous one; expanding the one that is already
             * expanded collapses it. The rule is value-level in `buckets_edit_operations.ts`.
             */
            .addCase(
                ActionTypeKeys.BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED,
                (state, action: ISetBucketItemExpandedAction): IBucketsMetaState =>
                    toggleBucketItemExpandedInMeta(state, action.payload.item),
            )
            .addCase(bucketItemAdded, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            .addCase(bucketItemsRemoved, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            .addCase(bucketItemReplaced, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            .addCase(filterRemovalApplied, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            // the arithmetic-measure operations: the add expands the new measure's slot,
            // the operand change can run the removal chain, which rewrites the markers
            .addCase(
                arithmeticMeasureAdded,
                (_state, action): IBucketsMetaState => action.payload.bucketsMeta,
            )
            .addCase(
                arithmeticMeasureOperandSelected,
                (_state, action): IBucketsMetaState => action.payload.bucketsMeta,
            )
            // the recommendation composes the add operation, which sets the expansion markers
            .addCase(recommendationApplied, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            // the shortcut applies compose the same add operation
            .addCase(metricShortcutApplied, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            .addCase(
                metricOverTimeShortcutApplied,
                (_state, action): IBucketsMetaState => action.payload.bucketsMeta,
            )
            // the bucket-filters operations that write the `modified` markers; the two
            // that can run the removal chain rewrite the whole marker set
            .addCase(
                attributeFilterUpdated,
                (_state, action): IBucketsMetaState => action.payload.bucketsMeta,
            )
            .addCase(dateFilterUpdated, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            .addCase(
                filterItemsUpdatedFromCommand,
                (_state, action): IBucketsMetaState => action.payload.bucketsMeta,
            )
            .addCase(measureFilterUpdated, (_state, action): IBucketsMetaState => action.payload.bucketsMeta)
            // opening a report rebuilds the `modified` markers from the loaded filters
            // and leaves the expansion markers present-undefined (open_report_operation.ts)
            .addCase(
                openReportFinished,
                (_state, action): IBucketsMetaState => action.payload.result.bucketsMeta,
            )
            // the application resets (store/app_context/application_reset_events.ts)
            .addMatcher(isInsightContentResetEvent, (): IBucketsMetaState => bucketsMetaInitialState);
    },
});

export const bucketsMetaSliceReducer: Reducer<IBucketsMetaState> = bucketsMetaSlice.reducer;
