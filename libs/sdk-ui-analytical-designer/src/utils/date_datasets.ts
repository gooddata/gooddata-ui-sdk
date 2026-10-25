// (C) 2007-2026 GoodData Corporation

import { cloneDeep, isEmpty } from "lodash-es";

import { type IDateDataset } from "../typings/datasets.js";

// `findDateBucketItems` (the state form)
// died with its callers, the shortcuts/recommendations wrappers — the value level is
// store/buckets/buckets_read_helpers.ts#getDateBucketItemsInBucket
export const DateDatasetUtils = {
    getDateDatasetUri,
    getMostRelevantDateDatasetUri,
};

function getDateDatasetUri(dateDataset: IDateDataset): string {
    return isEmpty(dateDataset) ? undefined : dateDataset.uri;
}

function dateDatasetRelevanceComparator(item1: IDateDataset, item2: IDateDataset): number {
    if (item1.relevance > item2.relevance) {
        return -1;
    } else if (item1.relevance === item2.relevance) {
        return 0;
    } else {
        return 1;
    }
}

function getMostRelevantDateDatasetUri(dateDatasets: IDateDataset[]): string {
    if (isEmpty(dateDatasets)) {
        return undefined;
    }

    const sortedDateDatasets = cloneDeep(dateDatasets).sort(dateDatasetRelevanceComparator);
    const firstDateDataset = sortedDateDatasets[0];
    return firstDateDataset.uri;
}
