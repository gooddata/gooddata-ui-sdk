// (C) 2019-2026 GoodData Corporation

import { createSelector, createStructuredSelector } from "reselect";

import { STACK } from "../constants/bucket.js";
import {
    getBucketByLocalIdentifier,
    getPrimaryMeasuresFromMeasureBucket,
    isOptionalStackingSupported,
} from "../services/buckets_service.js";
import {
    getVisualizationPropertiesControl,
    isStackToPercentDisabledByNegativeValues,
} from "../store/properties/properties_selectors.js";
import {
    canUiConfigStackInPercent,
    getUiConfigOptionalStackingStackMeasures,
    getUiConfigOptionalStackingStackMeasuresToPercent,
    getUiConfigOptionalStackingStackToPercentVisible,
    isExtendedReferencePointStackToPercent,
    isUiConfigOptionalStackingDisabled,
} from "../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../store/types.js";

function getStackAttributes(state: IAppState) {
    const bucket = getBucketByLocalIdentifier(state, STACK) || {};
    return bucket?.items ?? [];
}

export function isStackingMeasures(state: IAppState) {
    const defaultStackMeaures = getUiConfigOptionalStackingStackMeasures(state, false);
    return getVisualizationPropertiesControl(state, "stackMeasures", defaultStackMeaures);
}

export function isStackingToPercent(state: IAppState) {
    // The mekko width-only lock is this uiConfig flag's only writer (PluggableMekko), so when set
    // it dictates the presented state and wins over any persisted user property.
    const lockedStackToPercent = getUiConfigOptionalStackingStackMeasuresToPercent(state, undefined);
    return lockedStackToPercent ?? getVisualizationPropertiesControl(state, "stackMeasuresToPercent", false);
}

export function isExtendedReferencePointStackingToPercent(state: IAppState) {
    return isExtendedReferencePointStackToPercent(state);
}

export function isOptionalStackingDisabled(state: IAppState): boolean {
    return isUiConfigOptionalStackingDisabled(state);
}

const isStackMeasuresVisible = createSelector(
    isOptionalStackingSupported,
    getPrimaryMeasuresFromMeasureBucket,
    (optionalStackingSupported, measures) => {
        return optionalStackingSupported && (measures?.length ?? 0) > 1;
    },
);

const isStackToPercentVisible = createSelector(
    isOptionalStackingSupported,
    getPrimaryMeasuresFromMeasureBucket,
    isStackingMeasures,
    getStackAttributes,
    getUiConfigOptionalStackingStackToPercentVisible,
    (optionalStackingSupported, measures, stackMeasures, stacks, declaredVisible) => {
        return (
            optionalStackingSupported &&
            // a declaring visualization owns the visibility; the bucket heuristic is the fallback
            (declaredVisible ??
                (((measures?.length ?? 0) > 1 && stackMeasures) ||
                    ((stacks?.length ?? 0) > 0 && (measures?.length ?? 0) === 1)))
        );
    },
);

export const isOptionalStackingCheckboxVisible = createSelector(
    isStackMeasuresVisible,
    isStackToPercentVisible,
    (isStackMeasuresVisible, isStackToPercentVisible) => ({
        isOptionalStackingCheckboxVisible: isStackMeasuresVisible || isStackToPercentVisible,
    }),
);

function canStackInPercent(state: IAppState): boolean {
    return canUiConfigStackInPercent(state);
}

export const optionalStackingSelector = createStructuredSelector({
    isStackMeasuresVisible,
    isStackMeasuresChecked: isStackingMeasures,
    isStackToPercentVisible,
    isStackToPercentChecked: isStackingToPercent,
    isOptionalStackingDisabled,
    canStackInPercent,
    // Set by the chart (pushData) when "Stack to 100%" was requested but downgraded to absolute
    // stacking because the Height metric has negative values — shows an info note by the checkbox.
    isStackToPercentDisabledByNegativeValues,
});
