// (C) 2007-2021 GoodData Corporation
import groupBy from "lodash/groupBy.js";
import takeWhile from "lodash/takeWhile.js";
import first from "lodash/first.js";

import { IDateDataset, IDateDatasetHeader } from "./typings.js";

/**
 * @internal
 */
export const isDateDatasetHeader = (obj: unknown): obj is IDateDatasetHeader => {
    return obj && (obj as IDateDatasetHeader).type === "header";
};

function hasSameRelevance<T extends IDateDataset>(dateDatasets: ReadonlyArray<T | IDateDatasetHeader>) {
    const relevanceCount = Object.keys(groupBy(dateDatasets, "relevance")).length;
    return relevanceCount === 1;
}

const relevanceComparator = <T extends IDateDataset>(a: T, b: T) => b.relevance - a.relevance; // descending sort

const titleComparator = <T extends IDateDataset>(a: T, b: T) => {
    return a.title.localeCompare(b.title);
};

function sortByTitle<T extends IDateDataset>(dateDatasets: T[]) {
    return dateDatasets.slice().sort(titleComparator);
}

function sortByRelevanceAndTitle<T extends IDateDataset>(dateDatasets: T[]) {
    return dateDatasets.slice().sort((a, b) => {
        if (a.relevance === b.relevance) {
            return titleComparator(a, b);
        }
        return relevanceComparator(a, b);
    });
}

const MAX_RECOMMENDED_ITEMS = 3;

/**
 * @internal
 */
export const recommendedHeader: IDateDatasetHeader = {
    title: "gs.date.date-dataset.recommended",
    type: "header",
};

/**
 * @internal
 */
export const otherHeader: IDateDatasetHeader = {
    title: "gs.date.date-dataset.other",
    type: "header",
};

/**
 * @internal
 */
export const relatedHeader: IDateDatasetHeader = {
    title: "gs.date.date-dataset.related",
    type: "header",
};

/**
 * @internal
 */
export const unrelatedHeader: IDateDatasetHeader = {
    title: "gs.date.date-dataset.unrelated",
    type: "header",
};

function addUnrelatedDateDataset<T extends IDateDataset>(
    dateDatasets: ReadonlyArray<T | IDateDatasetHeader>,
    unrelatedDateDataset: T,
) {
    if (hasSameRelevance(dateDatasets)) {
        return [unrelatedHeader, unrelatedDateDataset, relatedHeader, ...dateDatasets];
    }

    return [unrelatedHeader, unrelatedDateDataset, ...dateDatasets];
}

/**
 * @internal
 */
export function getRecommendedDateDataset<T extends IDateDataset>(items: T[]): T {
    if (hasSameRelevance(items)) {
        return null;
    }

    return first(sortByRelevanceAndTitle(items));
}

/**
 * @internal
 */
export function transform2Dropdown<T extends IDateDataset>(dateDatasets: T[]): Array<T | IDateDatasetHeader> {
    if (!dateDatasets.length) {
        return [];
    }

    const items = sortByRelevanceAndTitle(dateDatasets);

    if (!hasSameRelevance(items)) {
        const nonZeroRelevanceItemsCount = takeWhile(items, (i) => i.relevance > 0).length;
        const othersIndex = Math.min(MAX_RECOMMENDED_ITEMS, nonZeroRelevanceItemsCount);
        const recommendedItems = [recommendedHeader, ...items.slice(0, othersIndex)];

        if (othersIndex < items.length) {
            return [...recommendedItems, otherHeader, ...sortByTitle(items.slice(othersIndex))];
        }

        return recommendedItems;
    }

    return sortByTitle(items);
}

function getRecommendedItems<T extends IDateDataset>(
    recommendedDate: T,
    others: T[],
): Array<T | IDateDatasetHeader> {
    return [recommendedHeader, recommendedDate, otherHeader, ...sortByTitle(others)];
}

/**
 * @internal
 */
export function preselectDateDataset<T extends IDateDataset>(
    dateDatasets: T[],
    recommendedDate: T,
): Array<T | IDateDatasetHeader> {
    const others = dateDatasets.filter((d) => d.id !== recommendedDate.id);

    if (others.length > 0) {
        return getRecommendedItems(recommendedDate, others);
    }

    return [recommendedDate];
}

/**
 * @internal
 */
export function sortDateDatasets<T extends IDateDataset>(
    dateDatasets: T[],
    recommendedDate: T = null,
    unrelatedDate: T = null,
): Array<T | IDateDatasetHeader> {
    let items = recommendedDate
        ? preselectDateDataset(dateDatasets, recommendedDate)
        : transform2Dropdown(dateDatasets);

    if (unrelatedDate) {
        items = addUnrelatedDateDataset(items, unrelatedDate);
    }
    return items;
}
