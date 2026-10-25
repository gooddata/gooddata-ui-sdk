// (C) 2026 GoodData Corporation

import { type Action } from "redux";

import { openReportFinished, openReportStarted } from "../../actions/open_actions.js";
import { openAsReportToggled, visualizationPropertiesInitialized } from "../../actions/properties_actions.js";
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
import { visualizationPropertiesChanged } from "../properties/properties_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    initializeVisualizationProperties,
    toggleOpenAsReport,
} from "../reference_point/extended_reference_point_helpers.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
    shortcutPostponed,
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
    visualizationTypeSelected,
} from "./buckets_operation_events.js";
import {
    type IPluggableVisualizationState,
    pluggableVisualizationInitialState,
} from "./pluggable_visualization_state.js";

/**
 * THE THREE LEAVES the buckets operations commit into: `data.extendedReferencePoint`,
 * `data.isVisualizationMdObjectValid` and `data.pluggableVisualization` — an explicit case per
 * event, which is the same shape a slice gets, written out.
 *
 * WHY HAND-WRITTEN RATHER THAN `createSlice`, unlike `bucketsMeta` next door. `createSlice` runs its case
 * reducers inside immer, which DEEP-FREEZES what they return in development builds. The extended
 * reference point is the value AD hands straight back to a pluggable visualization on the next round
 * trip, and the queue holds items the plug viz places — freezing either would turn a pre-existing
 * in-place write somewhere in that contract into a hard throw. A plain reducer function has the
 * identity short-circuit and none of the freeze exposure. `bucketsMeta` is a slice because it is
 * AD's own marker maps and nothing outside AD ever holds them.
 *
 * Every case is `(_state, action) => action.payload.<domain>`. That looks trivial and is the point: the
 * operation already decided the value, and it answers the ORIGINAL reference when it decided nothing,
 * so an unchanged value returns the same state and the root combiner stays quiet.
 */

/**
 * `data.extendedReferencePoint` — `undefined` until a pluggable visualization answers, which several
 * readers distinguish from present-and-empty. The combined root mounts the leaf through
 * `nullableLeaf` (the store holds `null` at rest; `getExtendedReferencePoint` converts back), so a
 * case returning `undefined` and one writing an absent payload field land the same.
 *
 * `visualizationTypeSelected` CLEARS it, which is indistinguishable to every reader from an absent
 * key: `getExtendedReferencePoint` answers `undefined` either way, and the one `Object.keys` reader
 * tests emptiness.
 */
export function extendedReferencePointLeafReducer(
    state: IExtendedReferencePointState | undefined,
    action: Action,
): IExtendedReferencePointState | undefined {
    if (visualizationTypeSelected.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (extendedReferencePointApplied.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (bucketItemAdded.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (bucketItemsRemoved.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (bucketItemReplaced.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (derivedBucketItemsPlaced.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (filterRemovalApplied.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    // the properties family's one cascade mirrors the push into `properties` here
    if (visualizationPropertiesChanged.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    // the arithmetic operand change can run the removal chain, which re-validates the sort items
    if (arithmeticMeasureOperandSelected.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    // a recommendation can add an item (the removal chain inside the add rewrites sort items) or
    // switch the chart type, which CLEARS the answer
    if (recommendationApplied.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    // the shortcut applies compose the add; the postpone switches the type and CLEARS it
    if (metricShortcutApplied.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (metricOverTimeShortcutApplied.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (shortcutPostponed.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    // the bucket-filters operations that can run the removal chain, which re-validates
    // the sort items; the other two carry the value by reference
    if (dateFilterUpdated.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (filterItemsUpdatedFromCommand.match(action)) {
        return action.payload.extendedReferencePoint;
    }
    if (measureFilterUpdated.match(action)) {
        return action.payload.extendedReferencePoint;
    }

    // The two properties triggers that are NOT cascades: each writes this subtree and nothing
    // foreign, so each is a leaf case on the TRIGGER — no saga, no event. The value rules live in
    // extended_reference_point_helpers.ts.
    if (visualizationPropertiesInitialized.match(action)) {
        return initializeVisualizationProperties(state, action.payload.supportedProperties);
    }
    if (openAsReportToggled.match(action)) {
        return toggleOpenAsReport(state, action.payload);
    }

    // opening a report drops the previous insight's answer until the plug viz answers
    // again, and the application resets clear it the same
    // way — `undefined` and an absent key are indistinguishable to every reader (see above)
    if (openReportStarted.match(action) || isInsightContentResetEvent(action)) {
        return undefined;
    }

    // a finished open mirrors the insight's normalized properties into the answer,
    // preserving whatever a plug viz reported since OPEN_REPORT_STARTED cleared it (the
    // `setIn(ERP_PROPERTIES, …)` materialized the container the same way when it was absent)
    if (openReportFinished.match(action)) {
        return { ...state, properties: action.payload.result.visualizationProperties };
    }

    return state;
}

/**
 * `data.isVisualizationMdObjectValid` — the flag every buckets operation produces. It is an
 * OUTPUT of the mutating gesture rather than reference-point state, which is why it is named separately
 * in every payload and owned by a leaf of its own.
 *
 * It seeds TRUE: a freshly built state has nothing to validate yet.
 */
export function isVisualizationMdObjectValidLeafReducer(state: boolean = true, action: Action): boolean {
    if (bucketItemAdded.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (bucketItemsRemoved.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (bucketItemReplaced.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (bucketItemsSwapped.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (bucketItemReordered.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (bucketItemEdited.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (bucketsDateDatasetChanged.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (dualAxisToggled.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (visualizationTypeSelected.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (extendedReferencePointApplied.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (derivedBucketItemsPlaced.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (filterRemovalApplied.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    // conditional on the properties side: false only when the push's totals rider landed,
    // the flag it read otherwise (see properties_operation.ts) — an unchanged primitive here
    if (visualizationPropertiesChanged.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    // the arithmetic-measure operations
    if (arithmeticMeasureAdded.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (arithmeticMeasureOperandSelected.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (arithmeticMeasureOperatorSelected.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (recommendationApplied.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    // the shortcut operations
    if (metricShortcutApplied.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (metricOverTimeShortcutApplied.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (shortcutPostponed.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    // the bucket-filters operations — every one produces the flag; the two no-op-capable
    // ones (`dateFilterDateDatasetChanged`, `measureFilterUpdated`) carry the flag they read, an
    // unchanged primitive here
    if (attributeFilterUpdated.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (dateFilterUpdated.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (dateFilterDateDatasetChanged.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (filterItemsUpdatedFromCommand.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (measureValueFilterUpdated.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (rankingFilterUpdated.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (measureFilterAdded.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (measureFilterRemoved.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (measureFilterUpdated.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (measureDateFilterApplied.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }
    if (measureDateFilterDateDatasetSelected.match(action)) {
        return action.payload.isVisualizationMdObjectValid;
    }

    return state;
}

/**
 * `data.pluggableVisualization` — the queue of derived measures AD wants placed. Only two operations
 * touch it: the add (a measure joining an over-time comparison queues one) and the plug viz's own
 * placement answer (which empties it).
 */
export function pluggableVisualizationLeafReducer(
    state: IPluggableVisualizationState = pluggableVisualizationInitialState,
    action: Action,
): IPluggableVisualizationState {
    if (bucketItemAdded.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    if (derivedBucketItemsPlaced.match(action)) {
        return action.payload.pluggableVisualization;
    }
    // an arithmetic measure whose operand pair just completed can queue a derived measure of its
    // own
    if (arithmeticMeasureOperandSelected.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    // a recommendation composing the over-time comparison can queue one too
    if (recommendationApplied.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    // the shortcut applies compose the add operation
    if (metricShortcutApplied.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    if (metricOverTimeShortcutApplied.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    // the bucket-filters operations that drive the over-time comparison: enabling a
    // comparison with no derived measure yet QUEUES one for the plug viz to place
    if (dateFilterUpdated.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    if (filterItemsUpdatedFromCommand.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }
    if (measureFilterUpdated.match(action)) {
        return action.payload.pluggableVisualization ?? state;
    }

    return state;
}
