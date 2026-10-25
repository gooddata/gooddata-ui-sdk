// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import {
    type IAttributeOrMeasure,
    type IInsightDefinition,
    attributeLocalId,
    insightFilters,
    insightReduceItems,
    isAttribute,
    isLocalIdRef,
    isMeasure,
    isMeasureValueFilter,
} from "@gooddata/sdk-model";

import { type IRawBucketItems } from "../typings/buckets.js";

import { getDateBucketItems, getExpandedDateLocalId } from "./buckets_selector.js";
import { getInsightWithBucketsViaMd } from "./insight_selectors.js";

/**
 * Gets local identifiers of dates referenced by measure value filter dimensionality.
 * These dates must be kept in the insight even when reducing dates for date dataset loading,
 * otherwise the AFM will have invalid references.
 */
const getDatesReferencedByMvfDimensionality = createSelector(
    getInsightWithBucketsViaMd,
    getDateBucketItems,
    (insight: IInsightDefinition, dateBucketItems: IRawBucketItems): string[] => {
        const dateBucketItemsLocalIds = new Set(dateBucketItems.map((item) => item.localIdentifier));

        const filters = insightFilters(insight);
        const referencedDateLocalIds: string[] = [];

        for (const filter of filters) {
            if (isMeasureValueFilter(filter)) {
                const dimensionality = filter.measureValueFilter.dimensionality ?? [];
                for (const item of dimensionality) {
                    // Only consider localIdRef items that reference date bucket items
                    if (isLocalIdRef(item) && dateBucketItemsLocalIds.has(item.localIdentifier)) {
                        referencedDateLocalIds.push(item.localIdentifier);
                    }
                }
            }
        }

        return referencedDateLocalIds;
    },
);

/**
 * Function is exported just because of test purposes
 */
export const reduceInsightWithoutAllDates = (
    acc: IAttributeOrMeasure[],
    cur: IAttributeOrMeasure,
    dateBucketItemsLocalIds: string[],
    datesReferencedByMvf: string[],
) => {
    const localId = isAttribute(cur) ? attributeLocalId(cur) : undefined;
    const isDateAttr = localId && dateBucketItemsLocalIds.includes(localId);

    // Keep non-date attributes
    if (isAttribute(cur) && !isDateAttr) {
        return [...acc, cur];
    }
    // Keep dates that are referenced by MVF dimensionality
    if (isAttribute(cur) && isDateAttr && datesReferencedByMvf.includes(localId)) {
        return [...acc, cur];
    }
    // Keep measures
    if (isMeasure(cur)) {
        return [...acc, cur];
    }
    return acc;
};

export const getInsightWithoutDates = createSelector(
    getInsightWithBucketsViaMd,
    getDateBucketItems,
    getDatesReferencedByMvfDimensionality,
    (
        insight: IInsightDefinition,
        dateBucketItems: IRawBucketItems,
        datesReferencedByMvf: string[],
    ): IInsightDefinition => {
        const dateBucketItemsLocalIds = dateBucketItems.map(
            (dateBucketItem) => dateBucketItem.localIdentifier,
        );
        return insightReduceItems(insight, (acc: IAttributeOrMeasure[], cur: IAttributeOrMeasure) =>
            reduceInsightWithoutAllDates(acc, cur, dateBucketItemsLocalIds, datesReferencedByMvf),
        );
    },
);

/**
 * Function is exported just because of test purposes
 */
export const reduceInsightWithoutExpandedDate = (
    acc: IAttributeOrMeasure[],
    cur: IAttributeOrMeasure,
    dateBucketItemsLocalIds: string[],
    filteredDateBucketItemsLocalIds: string[],
    datesReferencedByMvf: string[],
) => {
    const localId = isAttribute(cur) ? attributeLocalId(cur) : undefined;
    const isDateAttr = localId && dateBucketItemsLocalIds.includes(localId);

    // Keep non-date attributes
    if (isAttribute(cur) && !isDateAttr) {
        return [...acc, cur];
    }
    // Keep dates that are not the expanded date (normal behavior)
    if (isAttribute(cur) && localId && filteredDateBucketItemsLocalIds.includes(localId)) {
        return [...acc, cur];
    }
    // Keep dates that are referenced by MVF dimensionality (even if it's the expanded date)
    if (isAttribute(cur) && isDateAttr && datesReferencedByMvf.includes(localId)) {
        return [...acc, cur];
    }
    // Keep measures
    if (isMeasure(cur)) {
        return [...acc, cur];
    }
    return acc;
};

export const getInsightWithFilteredExpandedDate = createSelector(
    getInsightWithBucketsViaMd,
    getDateBucketItems,
    getExpandedDateLocalId,
    getDatesReferencedByMvfDimensionality,
    (
        insight: IInsightDefinition,
        dateBucketItems: IRawBucketItems,
        expandedDateLocalId: string,
        datesReferencedByMvf: string[],
    ): IInsightDefinition => {
        const dateBucketItemsLocalIds = dateBucketItems.map(
            (dateBucketItem) => dateBucketItem.localIdentifier,
        );
        const filteredDateBucketItemsLocalIds = dateBucketItemsLocalIds.filter(
            (localIdentifier: string) => localIdentifier !== expandedDateLocalId,
        );
        return insightReduceItems(insight, (acc: IAttributeOrMeasure[], cur: IAttributeOrMeasure) =>
            reduceInsightWithoutExpandedDate(
                acc,
                cur,
                dateBucketItemsLocalIds,
                filteredDateBucketItemsLocalIds,
                datesReferencedByMvf,
            ),
        );
    },
);
