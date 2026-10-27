// (C) 2022-2026 GoodData Corporation

import {
    type IAttributeSortItem,
    type ISortDirection,
    type ISortItem,
    isAttributeAreaSort,
    isAttributeSort,
    isMeasureSort,
    sortDirection,
} from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

import {
    GRANULARITY_OPTIONS,
    isChronologicalDateGranularity,
    isGenericDateGranularity,
} from "../../models/granularity.js";
import { type IDecoratedBucketItem, type IDecoratedBucketItems } from "../../typings/buckets.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";

import { type CurrentSortType } from "./types.js";

type SortDirection = ISortDirection["direction"];

interface ICurrentSortParams {
    currentSort: ISortItem[];
    bucketItems: IDecoratedBucketItems;
    itemCache: ICatalogEntries;
}

interface ISortItemParams {
    sortItem: ISortItem;
    bucketItems: IDecoratedBucketItems;
    itemCache: ICatalogEntries;
}

const isAllSortedInSameDirection = (sortItems: ISortItem[], direction: SortDirection) =>
    sortItems.every((sortItem) => sortDirection(sortItem) === direction);

const isNotAreaSort = (sortItem: ISortItem) => !isAttributeAreaSort(sortItem);

const isAllSortedByAttributes = (sortItems: ISortItem[], direction: SortDirection) =>
    sortItems.every(isAttributeSort) &&
    sortItems.every(isNotAreaSort) &&
    isAllSortedInSameDirection(sortItems, direction);

const isNumericSort = (sortItem: ISortItem) => isMeasureSort(sortItem) || isAttributeAreaSort(sortItem);

const isAllSortedByNumericSort = (sortItems: ISortItem[], direction: SortDirection) =>
    sortItems.every(isNumericSort) && isAllSortedInSameDirection(sortItems, direction);

const getBucketItemByLocalIdentifier = (bucketItems: IDecoratedBucketItems, localIdentifier: string) =>
    bucketItems.find((item: IDecoratedBucketItem) => item.localIdentifier === localIdentifier);

const isSortedByDate = ({ sortItem, bucketItems }: ISortItemParams, isChronological: boolean) => {
    if (!isAttributeSort(sortItem) || isAttributeAreaSort(sortItem)) {
        return false;
    }
    const attributeSortItem: IAttributeSortItem = sortItem;
    const bucketItem = getBucketItemByLocalIdentifier(
        bucketItems,
        attributeSortItem.attributeSortItem.attributeIdentifier,
    );
    if (!bucketItem) {
        return false;
    }
    const granularity = bucketItem.granularity?.dateType;
    const granularityOption = GRANULARITY_OPTIONS.find((option) => option.dateType === granularity);
    if (!granularityOption) {
        return false;
    }
    return isChronological
        ? isChronologicalDateGranularity(granularityOption)
        : isGenericDateGranularity(granularityOption);
};

const isSortedByChronologicalDate = (params: ISortItemParams) => isSortedByDate(params, true);
const isSortedByGenericDate = (params: ISortItemParams) => isSortedByDate(params, false);

const isAllSortedByChronologicalDate = (
    { currentSort, bucketItems, itemCache }: ICurrentSortParams,
    direction: SortDirection,
) =>
    currentSort.every(
        (sortItem) =>
            isSortedByChronologicalDate({ sortItem, bucketItems, itemCache }) &&
            sortDirection(sortItem) === direction,
    );

const isAllSortedByGenericDate = ({ currentSort, bucketItems, itemCache }: ICurrentSortParams) =>
    currentSort.every((sortItem) => isSortedByGenericDate({ sortItem, bucketItems, itemCache }));

const isSomeSortedByChronologicalDate = ({ currentSort, bucketItems, itemCache }: ICurrentSortParams) =>
    currentSort.some((sortItem) => isSortedByChronologicalDate({ sortItem, bucketItems, itemCache }));

const isSomeSortedByGenericDate = ({ currentSort, bucketItems, itemCache }: ICurrentSortParams) =>
    currentSort.some((sortItem) => isSortedByGenericDate({ sortItem, bucketItems, itemCache }));

const isSomeSortedByDate = (params: ICurrentSortParams) =>
    isSomeSortedByChronologicalDate(params) || isSomeSortedByGenericDate(params);

const isSomeSortedByAttributes = ({ currentSort, bucketItems, itemCache }: ICurrentSortParams) =>
    currentSort.some((sortItem) => {
        const sortItemParams: ISortItemParams = { sortItem, bucketItems, itemCache };
        return (
            isAttributeSort(sortItem) &&
            !isAttributeAreaSort(sortItem) &&
            !isSortedByChronologicalDate(sortItemParams) &&
            !isSortedByGenericDate(sortItemParams)
        );
    });

export const sortButtonCurrentSortTypeCombiner = (
    sortConfig: ISortConfig,
    appliedSort: ISortItem[],
    bucketItems: IDecoratedBucketItems,
    itemCache: ICatalogEntries,
): CurrentSortType => {
    const { disabled, defaultSort } = sortConfig;

    const currentSort = appliedSort?.length ? appliedSort : defaultSort;

    if (disabled || currentSort.length === 0) {
        return "DISABLED";
    }

    const currentSortParams = { currentSort, bucketItems, itemCache };

    if (isAllSortedByChronologicalDate(currentSortParams, "asc")) {
        return "DATE_ASC";
    }
    if (isAllSortedByChronologicalDate(currentSortParams, "desc")) {
        return "DATE_DESC";
    }
    // TODO: check itemCache for other attr's DFs if they contain sort label (requires SDK enhancement)
    //  add something like "|| isAllSortedBySortLabel(currentSort, bucketItems, itemCache)" to the condition
    if (isAllSortedByGenericDate(currentSortParams)) {
        return "DEFAULT";
    }
    if (isAllSortedByNumericSort(currentSort, "asc")) {
        return "NUMERICAL_ASC";
    }
    if (isAllSortedByNumericSort(currentSort, "desc")) {
        return "NUMERICAL_DESC";
    }
    if (isSomeSortedByAttributes(currentSortParams) && isSomeSortedByDate(currentSortParams)) {
        return "MIXED";
    }
    if (isSomeSortedByChronologicalDate(currentSortParams) && isSomeSortedByGenericDate(currentSortParams)) {
        return "MIXED";
    }
    if (isAllSortedByAttributes(currentSort, "asc")) {
        return "ALPHABETICAL_ASC";
    }
    if (isAllSortedByAttributes(currentSort, "desc")) {
        return "ALPHABETICAL_DESC";
    }
    return "MIXED";
};
