// (C) 2019-2020 GoodData Corporation
import forEach from "lodash/forEach";
import set from "lodash/set";
import isEmpty from "lodash/isEmpty";
import includes from "lodash/includes";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";

import { OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { METRIC, SHOW_IN_PERCENT } from "../constants/bucket";
import { IBucketItem, IBucketUiConfig, IExtendedReferencePoint } from "../interfaces/Visualization";
import {
    filterOutDerivedMeasures,
    filterOutArithmeticMeasuresFromDerived,
    getComparisonTypeFromFilters,
    keepOnlyMasterAndDerivedMeasuresOfType,
    filterOutIncompatibleArithmeticMeasures,
} from "./bucketHelper";
import { isShowInPercentAllowed, isComparisonOverTimeAllowed } from "./bucketRules";

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
    const { buckets, filters, uiConfig } = extendedReferencePoint;
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

    forEach(buckets, (bucket) => {
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

    return extendedReferencePoint;
}

function removeShowInPercent(measure: IBucketItem) {
    return set(measure, SHOW_IN_PERCENT, null);
}

export function configurePercent(
    extendedReferencePoint: IExtendedReferencePoint,
    percentDisabled: boolean = false,
): IExtendedReferencePoint {
    forEach(extendedReferencePoint.buckets, (bucket) => {
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
