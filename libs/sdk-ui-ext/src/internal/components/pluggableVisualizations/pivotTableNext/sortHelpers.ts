// (C) 2025 GoodData Corporation

import { includes, isEmpty } from "lodash-es";

import {
    IAttributeSortItem,
    IBucket,
    IInsightDefinition,
    IMeasureSortItem,
    ISortItem,
    areObjRefsEqual,
    attributeLocalId,
    bucketAttribute,
    bucketAttributes,
    bucketsFind,
    bucketsMeasures,
    insightBucket,
    insightBuckets,
    insightProperties,
    insightSorts,
    isAttributeLocator,
    isAttributeSort,
    isMeasureLocator,
    isMeasureSort,
    measureLocalId,
    newAttributeSort,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { MeasureGroupDimension } from "@gooddata/sdk-ui-pivot";

import { IAttributeFilter, IBucketFilter, IBucketItem } from "../../../interfaces/Visualization.js";
import { isAttributeFilter } from "../../../utils/bucketHelper.js";
import { getMeasureGroupDimensionFromProperties } from "../../../utils/propertiesHelper.js";

export const adaptReferencePointSortItemsToPivotTable = (
    originalSortItems: ISortItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
): ISortItem[] => {
    const measureLocalIdentifiers = measures.map((measure) => measure.localIdentifier);
    const rowAttributeLocalIdentifiers = rowAttributes.map((rowAttribute) => rowAttribute.localIdentifier);
    const columnAttributeLocalIdentifiers = columnAttributes.map(
        (columnAttribute) => columnAttribute.localIdentifier,
    );

    return filterInvalidSortItems(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
};

const filterInvalidSortItems = (
    originalSortItems: ISortItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
): ISortItem[] => {
    return originalSortItems.reduce((sortItems: ISortItem[], sortItem: ISortItem) => {
        if (isMeasureSort(sortItem)) {
            // filter out invalid locators
            const filteredSortItem: IMeasureSortItem = {
                measureSortItem: {
                    ...sortItem.measureSortItem,
                    locators: sortItem.measureSortItem.locators.filter((locator) => {
                        // filter out invalid measure locators
                        if (isMeasureLocator(locator)) {
                            return includes(
                                measureLocalIdentifiers,
                                locator.measureLocatorItem.measureIdentifier,
                            );
                        }
                        // filter out invalid column attribute locators
                        if (isAttributeLocator(locator)) {
                            return includes(
                                columnAttributeLocalIdentifiers,
                                locator.attributeLocatorItem.attributeIdentifier,
                            );
                        }

                        return false;
                    }),
                },
            };

            // keep sortItem if measureLocator is present and locators are correct length
            if (
                filteredSortItem.measureSortItem.locators.some((locator) => isMeasureLocator(locator)) &&
                filteredSortItem.measureSortItem.locators.length ===
                    columnAttributeLocalIdentifiers.length + 1
            ) {
                sortItems.push(filteredSortItem);
            }

            // otherwise just carry over previous sortItems
            return sortItems;
        }
        /**
         * Keep only row attribute sorts, column sorts are not supported.
         *
         * This exists to overcome AD weirdness where AD will sometimes send insight with invalid sorts
         * even if the pivot table should NOT be sorted by default by the first row attribute in ascending order since it has no row attributes.
         * Code here fixes this symptom and ensures the default sort is in place only if relevant.
         *
         * Typical case is PivotTable with one measure and one row and then the user moves thee attribute from Row bucket to Column bucket.
         * In that case AD sends insight with the irrelevant sort and then without it.
         *
         * Note: while this may seem small thing, it's actually a messy business. When rendering / switching to the pivot
         * table the AD will call update/render multiple times. Sometimes with sort items, sometimes without sort items. This
         * can seriously mess up the pivot table in return: the column resizing is susceptible to race conditions and timing
         * issues. Because of the flurry of calls, the table may not render or load indefinitely.
         */
        if (includes(rowAttributeLocalIdentifiers, sortItem.attributeSortItem.attributeIdentifier)) {
            return [...sortItems, sortItem];
        }
        return sortItems;
    }, []);
};

export const addDefaultSort = (
    sortItems: ISortItem[],
    filters: IBucketFilter[],
    rowAttributes: IBucketItem[],
    previousRowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[] = [],
): ISortItem[] => {
    // cannot construct default sort without a row
    if (rowAttributes.length < 1) {
        return sortItems;
    }

    // detect custom sort
    const firstRow = rowAttributes[0];
    const previousFirstRow = previousRowAttributes?.[0];
    const hasVisibleCustomSort = sortItems.some((sortItem) => {
        if (!isSortItemVisible(sortItem, filters, columnAttributes)) {
            return false;
        }
        // non attribute sort is definitely custom
        if (!isAttributeSort(sortItem)) {
            return true;
        }
        // asc sort on first row is considered default
        if (
            sortItem.attributeSortItem.attributeIdentifier === firstRow.localIdentifier &&
            sortItem.attributeSortItem.direction === "asc"
        ) {
            return false;
        }
        // asc sort on row that was first until now is considered default as well
        // disabling the eslint rule to maintain readability
        // eslint-disable-next-line sonarjs/prefer-single-boolean-return
        if (
            previousFirstRow &&
            sortItem.attributeSortItem.attributeIdentifier === previousFirstRow.localIdentifier &&
            sortItem.attributeSortItem.direction === "asc"
        ) {
            return false;
        }
        return true;
    });

    return hasVisibleCustomSort ? sortItems : [newAttributeSort(firstRow.localIdentifier, "asc")];
};

const isAttributeSortItemVisible = (_sortItem: IAttributeSortItem, _filters: IBucketFilter[]): boolean =>
    true;

const isMeasureSortItemMatchedByFilter = (sortItem: IMeasureSortItem, filter: IAttributeFilter): boolean => {
    return filter.selectedElements
        ? filter.selectedElements.some((selectedElement) =>
              sortItem.measureSortItem.locators.some(
                  (locator) =>
                      isAttributeLocator(locator) &&
                      locator.attributeLocatorItem.element === selectedElement.uri,
              ),
          )
        : false;
};

const isMeasureSortItemVisible = (
    sortItem: IMeasureSortItem,
    filters: IBucketFilter[],
    columnAttributes: IBucketItem[],
): boolean => {
    return filters
        .filter(isAttributeFilter)
        .filter((filter) =>
            columnAttributes.some((columnBucketItem) =>
                areObjRefsEqual(columnBucketItem.dfRef, filter.displayFormRef),
            ),
        )
        .every((filter) => {
            const shouldBeMatched = !filter.isInverted;
            return shouldBeMatched === isMeasureSortItemMatchedByFilter(sortItem, filter);
        });
};

export const isSortItemVisible = (
    sortItem: ISortItem,
    filters: IBucketFilter[],
    columnAttributes: IBucketItem[],
): boolean =>
    isAttributeSort(sortItem)
        ? isAttributeSortItemVisible(sortItem, filters)
        : isMeasureSortItemVisible(sortItem, filters, columnAttributes);

export const getSanitizedSortItems = (
    sortItems: ISortItem[],
    measureGroupDimension: MeasureGroupDimension,
): ISortItem[] => {
    // Measure sort is not supported on transposed table (metrics in rows).
    if (measureGroupDimension === "rows") {
        return sortItems ? sortItems.filter((sortItem) => !isMeasureSort(sortItem)) : [];
    }

    return sortItems ?? [];
};

/**
 * This function exists to overcome AD weirdness where AD will sometimes send insight without any
 * sorts even if the pivot table should be sorted by default by the first row attribute in ascending order. Code here
 * fixes this symptom and ensures the default sort is in place.
 *
 * Note: while this may seem small thing, it's actually a messy business. When rendering / switching to the pivot
 * table the AD will call update/render multiple times. Sometimes with sort items, sometimes without sort items. This
 * can seriously mess up the pivot table in return: the column resizing is susceptible to race conditions and timing
 * issues. Because of the flurry of calls, the table may not render or may render not resized at all.
 */
export const getPivotTableSortItems = (insight: IInsightDefinition): ISortItem[] => {
    const sorts = insightSorts(insight);
    const mesureGroupDimension = getMeasureGroupDimensionFromProperties(insightProperties(insight));

    if (!isEmpty(sorts)) {
        /*
         * This is here to ensure that when rendering pivot table in KD, all invalid sort items
         * are filtered out. At this moment, core pivot table does not handle invalid sorts so well and
         * they can knock it off balance and it won't show up (interplay with resizing).
         *
         * Fixing core pivot to strip out invalid sorts has to happen one day - however regardless of that,
         * it is still the responsibility of the PluggablePivotTable to call the CorePivot correctly and so this
         * sanitization here also makes sense.
         */
        return sanitizePivotTableSorts(sorts, insightBuckets(insight), mesureGroupDimension);
    }

    const rowBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const rowAttribute = rowBucket && bucketAttribute(rowBucket);

    if (rowAttribute) {
        return [newAttributeSort(rowAttribute, "asc")];
    }

    return undefined;
};

export const sanitizePivotTableSorts = (
    originalSortItems: ISortItem[],
    buckets: IBucket[],
    measureGroupDimension: MeasureGroupDimension,
): ISortItem[] => {
    const sanitizedOriginalSortItems = getSanitizedSortItems(originalSortItems, measureGroupDimension);

    const measureLocalIdentifiers = bucketsMeasures(buckets).map(measureLocalId);

    const rowBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const rowAttributeLocalIdentifiers = rowBucket ? bucketAttributes(rowBucket).map(attributeLocalId) : [];

    const columnBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    const columnAttributeLocalIdentifiers = columnBucket
        ? bucketAttributes(columnBucket).map(attributeLocalId)
        : [];

    return filterInvalidSortItems(
        sanitizedOriginalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
};
