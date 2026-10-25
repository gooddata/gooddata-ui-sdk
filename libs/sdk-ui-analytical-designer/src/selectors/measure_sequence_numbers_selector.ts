// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IRawBucketItem, type IRawBucketItems } from "../typings/buckets.js";

import { getAllMeasures } from "./buckets_selector.js";

export interface IBucketSequenceNumbers {
    [localIdentifier: string]: number;
}

function mapBucketItemsToMeasureSequenceNumber(measures: IRawBucketItems): IBucketSequenceNumbers {
    return measures.reduce(
        (sequenceNumbersMap: IBucketSequenceNumbers, measure: IRawBucketItem, index: number) => {
            sequenceNumbersMap[measure?.localIdentifier] = index + 1;
            return sequenceNumbersMap;
        },
        {},
    );
}

export const getMeasureSequenceNumbers = createSelector(getAllMeasures, (measures) =>
    mapBucketItemsToMeasureSequenceNumber(measures),
);
