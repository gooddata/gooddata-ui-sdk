// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";

import { openReportFailed, openReportFinished, openReportStarted } from "../../actions/open_actions.js";
import { INITIAL_MODEL } from "../../models/bucket_item.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import {
    arithmeticMeasureAdded,
    arithmeticMeasureOperandSelected,
    arithmeticMeasureOperatorSelected,
} from "../arithmetic_measures/arithmetic_measures_operation_events.js";
import {
    attributeFilterUpdated,
    dateFilterDateDatasetChanged,
    dateFilterUpdated,
    filterItemsUpdatedFromCommand,
    measureDateFilterApplied,
    measureDateFilterDateDatasetSelected,
    measureFilterAdded,
    measureFilterRemoved,
    measureFilterUpdated,
    measureValueFilterUpdated,
    rankingFilterUpdated,
} from "../bucket_filters/bucket_filters_operation_events.js";
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
} from "../buckets/buckets_operation_events.js";
import { visualizationPropertiesChanged } from "../properties/properties_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
} from "../shortcuts/shortcuts_operation_events.js";

import { type IReferencePointState, referencePointInitialState } from "./reference_point_state.js";

/**
 * `data.referencePoint`.
 *
 * Each buckets operation calls the pure `syncReferencePoint` helper and names the result in its own
 * event; the cases below just take it. So the reference point is written by its own reducer for every
 * gesture in the buckets family, in the SAME dispatch as the buckets — a saga-dispatched sync would
 * let components render fresh buckets against a stale reference point.
 *
 * `isVisualizationMdObjectValid` is deliberately NOT here: it is an OUTPUT of the operation and it
 * has its own leaf.
 *
 * NO external writer remains: OPEN_REPORT_FINISHED carries the open-report operation's fused result
 * and the case below takes the reference point out of it, and the application resets are matcher
 * cases at the bottom — the open-failure flag COMPOSES with the reset in its own case.
 */
/** The open-failure reset value — hoisted so repeated failures share one reference. */
const reportNotFoundResetState: IReferencePointState = {
    ...referencePointInitialState,
    reportNotFound: true,
};

export const referencePointSlice = createSlice({
    name: "referencePoint",
    initialState: referencePointInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            /**
             * Opening a report drops everything the previous insight put here and keeps ONLY an
             * empty buckets model. `INITIAL_MODEL` is the same frozen identity the buckets slice
             * self-initializes with.
             */
            .addCase(openReportStarted, (): IReferencePointState => ({ buckets: INITIAL_MODEL }))
            /**
             * A finished open REPLACES the reference point wholesale with the loaded insight's —
             * buckets, converted filters, properties, `firstRender: true` and the cleared not-found
             * flag, all in ONE value (open_report_operation.ts).
             */
            .addCase(
                openReportFinished,
                (_state, action): IReferencePointState => action.payload.result.referencePoint,
            )
            // OPEN_REPORT_FAILED is one of the application resets and is handled by the reset
            // matcher at the bottom — the not-found flag composes with the reset there
            /**
             * THE SYNC, once per buckets operation. `syncReferencePoint` is identity-guarded, so an
             * operation that changed no buckets, no filters and no sort items answers the reference point
             * it was given and this case returns the same state.
             *
             * `extendedReferencePointApplied` is the odd one out and its payload says so: that operation
             * does not SYNC the reference point, it SEEDS it on the first plug-viz answer (consuming
             * `firstRender`) and leaves it alone afterwards — so its payload's `referencePoint` is
             * `undefined` when there is nothing to write, and the case has to keep the current state
             * rather than write `undefined` over it.
             */
            .addCase(bucketItemAdded, (_state, action): IReferencePointState => action.payload.referencePoint)
            .addCase(
                bucketItemsRemoved,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                bucketItemReplaced,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                bucketItemsSwapped,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                bucketItemReordered,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                bucketItemEdited,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(dualAxisToggled, (_state, action): IReferencePointState => action.payload.referencePoint)
            .addCase(
                bucketsDateDatasetChanged,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                derivedBucketItemsPlaced,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                filterRemovalApplied,
                (_state, action): IReferencePointState => action.payload.referencePoint,
            )
            .addCase(
                extendedReferencePointApplied,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            /**
             * The properties family's one cascade. Its sync is CONDITIONAL like the ERP-applied
             * one: it re-syncs only when the push's totals rider actually landed in the buckets, so a
             * push without one carries the reference point it read — same reference, same state, no
             * notification.
             */
            .addCase(
                visualizationPropertiesChanged,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            // the arithmetic-measure operations — each ends with the sync
            .addCase(
                arithmeticMeasureAdded,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                arithmeticMeasureOperandSelected,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                arithmeticMeasureOperatorSelected,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                recommendationApplied,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            // the shortcut applies; the postpone touches no buckets and has no sync
            .addCase(
                metricShortcutApplied,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                metricOverTimeShortcutApplied,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            // the bucket-filters operations — every one of them ends with the sync;
            // the two no-op-capable ones carry the value they read, same reference, no notification
            .addCase(
                attributeFilterUpdated,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                dateFilterUpdated,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                dateFilterDateDatasetChanged,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                filterItemsUpdatedFromCommand,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                measureValueFilterUpdated,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                rankingFilterUpdated,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                measureFilterAdded,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                measureFilterRemoved,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                measureFilterUpdated,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                measureDateFilterDateDatasetSelected,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            .addCase(
                measureDateFilterApplied,
                (state, action): IReferencePointState => action.payload.referencePoint ?? state,
            )
            /**
             * The application resets (store/app_context/application_reset_events.ts).
             * OPEN_REPORT_FAILED is one of them, and its not-found flag COMPOSES with the reset
             * here: reset to initial, then the `reportNotFound` write on top. A failure WITHOUT a
             * reason is the report-not-found case, and the flag is what the pluggable visualization
             * renders the "not found" state from. The composed value is a hoisted module constant,
             * so a repeated failure returns the SAME reference.
             */
            .addMatcher(isInsightContentResetEvent, (_state, action): IReferencePointState => {
                if (openReportFailed.match(action) && action.payload.reason === undefined) {
                    return reportNotFoundResetState;
                }
                return referencePointInitialState;
            });
    },
});

export const referencePointSliceReducer = referencePointSlice.reducer;
