// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type GeoLabelType, getGeoLabelTypeFromVisualization } from "../constants/geo.js";
import { isDerived, isMeasure } from "../models/bucket_item.js";
import { isUnmodifiedAndAutoCreated } from "../store/buckets/buckets_meta_helpers.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import {
    FilterBar,
    type IAttributeFilter,
    type IDateFilter,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    normalizeMeasureValueFilterConditions,
} from "../store/filter_bar/filter_bar_types.js";
import {
    getUiConfigLocationIcon,
    isUiConfigChartFillSupported,
    isUiConfigLocationIconSupported,
} from "../store/reference_point/extended_reference_point_selectors.js";
import {
    getReferencePointBuckets,
    getReferencePointFilters,
} from "../store/reference_point/reference_point_selectors.js";
import {
    type IRefPointFilterItem,
    type IRefPointFiltersBucket,
} from "../store/reference_point/reference_point_state.js";
import { type IAppState } from "../store/types.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../typings/buckets.js";

import { getVisualizationClassTypeFromState } from "./visualization_class_service.js";

export function getRefPointBuckets(state: IAppState): IRawBuckets {
    return getReferencePointBuckets(state);
}

export function getRefPointFilters(state: IAppState): IRefPointFiltersBucket | undefined {
    return getReferencePointFilters(state);
}

export const getActiveGeoLabelType = (state: IAppState): GeoLabelType | undefined => {
    const iconSupported = isUiConfigLocationIconSupported(state);
    if (!iconSupported) {
        return undefined;
    }
    const configuredLabelType = getUiConfigLocationIcon(state)?.type;
    if (configuredLabelType) {
        return configuredLabelType;
    }
    const visualizationType = getVisualizationClassTypeFromState(state);
    return getGeoLabelTypeFromVisualization(visualizationType) ?? "location";
};

export const isLocationIconEnabled = (state: IAppState): boolean => {
    return Boolean(getActiveGeoLabelType(state));
};

export const isChartFillEnabled = (state: IAppState): boolean => {
    return isUiConfigChartFillSupported(state);
};

export function getRefPointFilteredMeasures(
    state: IAppState,
    filterAssert: (bucketItem: IRawBucketItem) => boolean,
): IRawBucketItems {
    // referencePoint.buckets holds the live buckets value BY REFERENCE
    return getRefPointBuckets(state)
        .flatMap((bucket) => bucket.items ?? [])
        .filter((bucketItem) => isMeasure(bucketItem) && filterAssert(bucketItem));
}

export function getRefPointNonDerivedMeasures(state: IAppState): IRawBucketItems {
    return getRefPointFilteredMeasures(state, (bucketItem: IRawBucketItem) => !isDerived(bucketItem));
}

export function getRefPointDerivedMeasures(state: IAppState): IRawBucketItems {
    return getRefPointFilteredMeasures(state, isDerived);
}

function convertDateFilterToRefPointFilter(
    dateFilter: IDateFilter,
    bucketsMeta: IBucketsMetaState,
): IRefPointFilterItem {
    return {
        localIdentifier: dateFilter.localIdentifier,
        autoCreated: isUnmodifiedAndAutoCreated(dateFilter.cacheItemIdentifier, bucketsMeta),
        filters: [
            {
                overTimeComparisonType: dateFilter.overTimeComparisonType,
                emptyDateValuesFilter: dateFilter.emptyDateValuesFilter,
                interval: dateFilter.filterConfig || {
                    name: "all_time",
                },
                attribute: dateFilter.cacheItemIdentifier,
                ...(dateFilter.filterConfig?.boundedFilter
                    ? { boundedFilter: dateFilter.filterConfig.boundedFilter }
                    : {}),
            },
        ],
        attribute: dateFilter.cacheItemIdentifier,
        dateDatasetRef: dateFilter.dateDatasetRef,
    };
}

function convertAttributeFilterToRefPointFilter(
    attributeFilter: IAttributeFilter,
    bucketsMeta: IBucketsMetaState,
): IRefPointFilterItem {
    const { filterConfig, textModeFilter } = attributeFilter;

    return {
        localIdentifier: attributeFilter.localIdentifier,
        autoCreated: isUnmodifiedAndAutoCreated(attributeFilter.cacheItemIdentifier, bucketsMeta),
        filters:
            filterConfig || textModeFilter
                ? [
                      {
                          attribute: attributeFilter.cacheItemIdentifier,
                          displayFormRef: attributeFilter.displayFormRef,
                          allElements: [],
                          selectedElements: filterConfig?.selectedElements ?? [],
                          isInverted: filterConfig?.isInverted ?? false,
                          totalElementsCount: filterConfig?.totalElementsCount ?? 0,
                          ...(textModeFilter ? { textModeFilter } : {}),
                      },
                  ]
                : [],
        attribute: attributeFilter.cacheItemIdentifier,
    };
}

function convertMeasureValueFilterToRefPointFilter(
    measureValueFilter: IMeasureValueFilter,
): IRefPointFilterItem {
    const { measureLocalIdentifier, measureRef, dimensionality, applyOnResult } = measureValueFilter;
    const conditions = normalizeMeasureValueFilterConditions(measureValueFilter);
    const conditionsProps = isEmpty(conditions) ? {} : { conditions };
    const dimensionalityProps = dimensionality?.length ? { dimensionality } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    // Catalog measures use measureRef, bucket measures use measureLocalIdentifier
    const measureProps = FilterBar.isCatalogMeasureValueFilter(measureValueFilter)
        ? { measureRef }
        : { measureLocalIdentifier };
    return {
        localIdentifier: measureValueFilter.localIdentifier,
        autoCreated: false,
        ...applyOnResultProp,
        filters: [
            {
                ...measureProps,
                ...conditionsProps,
                ...dimensionalityProps,
            },
        ],
    };
}

function convertRankingFilterToRefPointFilter(rankingFilter: IRankingFilter): IRefPointFilterItem {
    const {
        measureLocalIdentifier,
        measureRef,
        attributes,
        operator,
        value,
        applyOnResult,
        strictLimitOfRows,
    } = rankingFilter;
    const conditionProps = isEmpty(attributes) ? {} : { attributes: attributes };
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };

    // Catalog measures are referenced by measureRef, bucket measures by their localIdentifier.
    const measureProps = FilterBar.isCatalogRankingFilter(rankingFilter)
        ? { measureRef }
        : { measure: measureLocalIdentifier };

    return {
        localIdentifier: rankingFilter.localIdentifier,
        autoCreated: false,
        ...applyOnResultProp,
        ...strictLimitOfRowsProp,
        filters: [
            {
                ...measureProps,
                ...conditionProps,
                operator,
                value,
            },
        ],
    };
}

function convertFilterToRefPointFilter(filter: IFilter, bucketsMeta: IBucketsMetaState): IRefPointFilterItem {
    if (FilterBar.isDateFilter(filter)) {
        return convertDateFilterToRefPointFilter(filter, bucketsMeta);
    }
    if (FilterBar.isAttributeFilter(filter)) {
        return convertAttributeFilterToRefPointFilter(filter, bucketsMeta);
    }
    if (FilterBar.isMeasureValueFilter(filter)) {
        return convertMeasureValueFilterToRefPointFilter(filter);
    }
    if (FilterBar.isRankingFilter(filter)) {
        return convertRankingFilterToRefPointFilter(filter);
    }
    throw new Error("Unsupported filter type");
}

export function convertFiltersToRefPoint(
    filters: ReadonlyArray<IFilter>,
    bucketsMeta: IBucketsMetaState,
): IRefPointFiltersBucket {
    return {
        localIdentifier: "filters",
        items: filters.map((filter) => convertFilterToRefPointFilter(filter, bucketsMeta)),
    };
}
