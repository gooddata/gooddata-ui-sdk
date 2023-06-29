// (C) 2019-2022 GoodData Corporation

// removes attribute sortItems with invalid identifiers
// removes measure sortItems with invalid identifiers and invalid number of locators
import {
    areObjRefsEqual,
    attributeLocalId,
    bucketAttributes,
    bucketsFind,
    bucketsMeasures,
    IAttributeSortItem,
    IBucket,
    IMeasureSortItem,
    isAttributeSort,
    isMeasureLocator,
    isAttributeLocator,
    isMeasureSort,
    ISortItem,
    measureLocalId,
    newAttributeSort,
} from "@gooddata/sdk-model";
import includes from "lodash/includes.js";
import { IAttributeFilter, IBucketFilter, IBucketItem } from "../../../interfaces/Visualization.js";
import { BucketNames } from "@gooddata/sdk-ui";
import { isAttributeFilter } from "../../../utils/bucketHelper.js";

function filterInvalidSortItems(
    originalSortItems: ISortItem[],
    measureLocalIdentifiers: string[],
    rowAttributeLocalIdentifiers: string[],
    columnAttributeLocalIdentifiers: string[],
): ISortItem[] {
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
}

export function adaptReferencePointSortItemsToPivotTable(
    originalSortItems: ISortItem[],
    measures: IBucketItem[],
    rowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[],
): ISortItem[] {
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
}

export function sanitizePivotTableSorts(originalSortItems: ISortItem[], buckets: IBucket[]): ISortItem[] {
    const measureLocalIdentifiers = bucketsMeasures(buckets).map(measureLocalId);

    const rowBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const rowAttributeLocalIdentifiers = rowBucket ? bucketAttributes(rowBucket).map(attributeLocalId) : [];

    const columnBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    const columnAttributeLocalIdentifiers = columnBucket
        ? bucketAttributes(columnBucket).map(attributeLocalId)
        : [];

    return filterInvalidSortItems(
        originalSortItems,
        measureLocalIdentifiers,
        rowAttributeLocalIdentifiers,
        columnAttributeLocalIdentifiers,
    );
}

export function addDefaultSort(
    sortItems: ISortItem[],
    filters: IBucketFilter[],
    rowAttributes: IBucketItem[],
    previousRowAttributes: IBucketItem[],
    columnAttributes: IBucketItem[] = [],
    tableSortingCheckDisabled?: boolean,
): ISortItem[] {
    // cannot construct default sort without a row
    if (rowAttributes.length < 1) {
        return sortItems;
    }

    // detect custom sort
    const firstRow = rowAttributes[0];
    const previousFirstRow = previousRowAttributes?.[0];
    const hasVisibleCustomSort = sortItems.some((sortItem) => {
        if (!isSortItemVisible(sortItem, filters, columnAttributes, tableSortingCheckDisabled)) {
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
}

const isAttributeSortItemVisible = (_sortItem: IAttributeSortItem, _filters: IBucketFilter[]): boolean =>
    true;

function isMeasureSortItemMatchedByFilter(sortItem: IMeasureSortItem, filter: IAttributeFilter): boolean {
    return filter.selectedElements
        ? filter.selectedElements.some((selectedElement) =>
              sortItem.measureSortItem.locators.some(
                  (locator) =>
                      isAttributeLocator(locator) &&
                      locator.attributeLocatorItem.element === selectedElement.uri,
              ),
          )
        : false;
}

function isMeasureSortItemVisible(
    sortItem: IMeasureSortItem,
    filters: IBucketFilter[],
    columnAttributes: IBucketItem[],
    tableSortingCheckDisabled?: boolean,
): boolean {
    let appliedFilters = filters.filter(isAttributeFilter);
    if (tableSortingCheckDisabled) {
        appliedFilters = appliedFilters.filter((filter) =>
            columnAttributes.some((columnBucketItem) =>
                areObjRefsEqual(columnBucketItem.dfRef, filter.displayFormRef),
            ),
        );
    }
    return appliedFilters.every((filter) => {
        const shouldBeMatched = !filter.isInverted;
        return shouldBeMatched === isMeasureSortItemMatchedByFilter(sortItem, filter);
    });
}

export function isSortItemVisible(
    sortItem: ISortItem,
    filters: IBucketFilter[],
    columnAttributes: IBucketItem[],
    tableSortingCheckDisabled?: boolean,
): boolean {
    return isAttributeSort(sortItem)
        ? isAttributeSortItemVisible(sortItem, filters)
        : isMeasureSortItemVisible(sortItem, filters, columnAttributes, tableSortingCheckDisabled);
}
