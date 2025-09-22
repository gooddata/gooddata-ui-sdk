// (C) 2019-2025 GoodData Corporation
import { cloneDeep, includes, isEmpty, isEqual, set } from "lodash-es";

import { OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import {
    filterOutArithmeticMeasuresFromDerived,
    filterOutDerivedMeasures,
    filterOutIncompatibleArithmeticMeasures,
    getComparisonTypeFromFilters,
    isComparisonAvailable,
    keepOnlyMasterAndDerivedMeasuresOfType,
    removeAllDerivedMeasures,
} from "./bucketHelper.js";
import { isComparisonOverTimeAllowed, isShowInPercentAllowed } from "./bucketRules.js";
import { METRIC, SHOW_IN_PERCENT } from "../constants/bucket.js";
import { IBucketItem, IBucketUiConfig, IExtendedReferencePoint } from "../interfaces/Visualization.js";

function getTypeOfDerivedToKeep(
    supportedTypes: OverTimeComparisonType[],
    appliedType: OverTimeComparisonType,
) {
    return isEmpty(supportedTypes) || isEqual(supportedTypes, [OverTimeComparisonTypes.NOTHING])
        ? OverTimeComparisonTypes.NOTHING
        : appliedType;
}

export function configureOverTimeComparison(
    extendedReferencePoint: IExtendedReferencePoint,
    weekFiltersEnabled: boolean,
): IExtendedReferencePoint {
    let newExtendedReferencePoint = cloneDeep(extendedReferencePoint);

    const { buckets, filters, uiConfig } = newExtendedReferencePoint;
    const { supportedOverTimeComparisonTypes } = uiConfig;

    const appliedComparisonType = getComparisonTypeFromFilters(filters);
    const isSelectedComparisonSupportedByVis = includes(
        supportedOverTimeComparisonTypes,
        appliedComparisonType,
    );
    const derivedOfTypeToKeep = getTypeOfDerivedToKeep(
        supportedOverTimeComparisonTypes,
        appliedComparisonType,
    );
    const comparisonOverTimeAllowed = isComparisonOverTimeAllowed(buckets, filters, weekFiltersEnabled);
    const originalBuckets = cloneDeep(buckets);

    buckets.forEach((bucket) => {
        let newItems = bucket.items;

        if (!comparisonOverTimeAllowed) {
            newItems = filterOutArithmeticMeasuresFromDerived(newItems, originalBuckets);
            newItems = filterOutDerivedMeasures(newItems);
        }

        if (!isSelectedComparisonSupportedByVis) {
            newItems = filterOutIncompatibleArithmeticMeasures(
                newItems,
                originalBuckets,
                derivedOfTypeToKeep,
            );
            newItems = keepOnlyMasterAndDerivedMeasuresOfType(newItems, derivedOfTypeToKeep);
        }

        bucket.items = newItems;
    });

    if (!isComparisonAvailable(buckets, filters)) {
        newExtendedReferencePoint = removeAllDerivedMeasures(newExtendedReferencePoint);
    }

    return newExtendedReferencePoint;
}

function removeShowInPercent(measure: IBucketItem) {
    return set(measure, SHOW_IN_PERCENT, null);
}

export function configurePercent(
    extendedReferencePoint: IExtendedReferencePoint,
    percentDisabled: boolean = false,
): IExtendedReferencePoint {
    extendedReferencePoint.buckets.forEach((bucket) => {
        const showInPercentEnabled =
            !percentDisabled &&
            isShowInPercentAllowed(
                extendedReferencePoint.buckets,
                extendedReferencePoint.filters,
                bucket.localIdentifier,
            );

        if (!showInPercentEnabled) {
            bucket.items.forEach((measure) => {
                if (measure.type === METRIC) {
                    removeShowInPercent(measure);
                }
            });
        }

        const bucketUiConfig: IBucketUiConfig =
            extendedReferencePoint.uiConfig.buckets[bucket.localIdentifier];
        if (bucketUiConfig.accepts.indexOf(METRIC) >= 0) {
            bucketUiConfig.isShowInPercentEnabled = showInPercentEnabled;
        }
    });

    return extendedReferencePoint;
}
