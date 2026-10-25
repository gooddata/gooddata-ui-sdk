// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { getLocalizedIcuDateFormatPattern } from "@gooddata/sdk-ui-filters";

import { getLocalIdentifier } from "../models/bucket_item.js";
import { DecoratedDateDatasets, type IDecoratedDateDatasets } from "../models/decorated_date_datasets.js";
import { DateDatasetsService } from "../services/date_datasets_service.js";
import { getCompatibleMeasures } from "../services/over_time_comparison_service.js";
import { getRefPointBuckets } from "../services/reference_point_service.js";
import { isLoadingAvailability } from "../store/catalog/catalog_selector.js";
import { getFirstDateFilter } from "../store/filter_bar/filter_bar_selector.js";
import { type IDateFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../store/types.js";
import { type IRawBucketItems } from "../typings/buckets.js";
import { type IDateDatasets } from "../typings/datasets.js";
import { getDerivedBucketItems } from "../utils/buckets.js";

import { getFormatLocale } from "./bootstrap_selector.js";
import { getDateBucketItemDateDatasetRefs } from "./buckets_selector.js";
import { enableUnavailableItemsVisibility, getDateFormatConfig } from "./feature_flag_selector.js";
import { getDataSet } from "./route_selector.js";

function getMeasuresIdentifiers(measures: IRawBucketItems | undefined) {
    return [...(measures ?? [])].map((item) => getLocalIdentifier(item));
}

function measureHasDerivedItem(masterMeasureIdentifier: string, derivedBucketItems: IRawBucketItems) {
    return derivedBucketItems.some(
        (decoratedBucketItem) => decoratedBucketItem?.masterLocalIdentifier === masterMeasureIdentifier,
    );
}

export const selectedOverTimeComparisonMeasures = createSelector(
    getRefPointBuckets,
    getCompatibleMeasures,
    (referencePointBuckets, compatibleMeasures): string[] => {
        const derivedBucketItems = getDerivedBucketItems(referencePointBuckets);
        const compatibleMeasureIdentifiers = getMeasuresIdentifiers(compatibleMeasures);

        if ((derivedBucketItems?.length ?? 0) > 0) {
            const compatibleMeasureIdentifiersWithDerivedItem = compatibleMeasureIdentifiers.filter(
                (masterMeasureIdentifier: string) =>
                    measureHasDerivedItem(masterMeasureIdentifier, derivedBucketItems),
            );

            if (compatibleMeasureIdentifiersWithDerivedItem.length > 0) {
                return compatibleMeasureIdentifiersWithDerivedItem;
            }
        }

        return compatibleMeasureIdentifiers;
    },
);

export const getDecoratedDateDatasets = createSelector(
    DateDatasetsService.getPlainDateDatasets,
    enableUnavailableItemsVisibility,
    (dateDatasets: IDateDatasets, enableUnavailableItemsVisibility): IDecoratedDateDatasets => {
        return DecoratedDateDatasets.createFromDateDatasets(dateDatasets, !!enableUnavailableItemsVisibility);
    },
);

export const isActiveDateDatasetAvailable = (state: IAppState, dateDatasetRef: ObjRef) => {
    const dateDatasets = getDecoratedDateDatasets(state);
    return (
        dateDatasetRef && dateDatasets.items.some((dataset) => areObjRefsEqual(dataset.ref, dateDatasetRef))
    );
};

export const isUsedByInsight = createSelector(
    (state: IAppState, dateDatasetRef: ObjRef) => isActiveDateDatasetAvailable(state, dateDatasetRef),
    getDataSet,
    isLoadingAvailability,
    (activeDateDatasetAvailable, dataSet, loadingAvailability) =>
        activeDateDatasetAvailable || !!dataSet || loadingAvailability,
);

export const isPoPAvailable = createSelector(
    getDateBucketItemDateDatasetRefs,
    getFirstDateFilter,
    (dateBucketItemDateDatasetRefs: ObjRef[], dateFilter: IDateFilter): boolean => {
        return dateBucketItemDateDatasetRefs.some((dateBucketItemDateDatasetRef: ObjRef) =>
            areObjRefsEqual(dateBucketItemDateDatasetRef, dateFilter?.dateDatasetRef),
        );
    },
);

export const isPoPSetup = createSelector(
    getDateBucketItemDateDatasetRefs,
    getFirstDateFilter,
    (dateBucketItemDateDatasetRefs: ObjRef[], dateFilter: IDateFilter): boolean => {
        return (
            dateFilter?.overTimeComparisonType !== OverTimeComparisonTypes.NOTHING &&
            dateBucketItemDateDatasetRefs.some((dateBucketItemDateDatasetRef: ObjRef) =>
                areObjRefsEqual(dateBucketItemDateDatasetRef, dateFilter?.dateDatasetRef),
            )
        );
    },
);

export const getLocalizedDateFormat = createSelector(
    [getDateFormatConfig, getFormatLocale],
    (nonLocalizedDateFormat, formatLocale) =>
        formatLocale ? getLocalizedIcuDateFormatPattern(formatLocale) : nonLocalizedDateFormat,
);
