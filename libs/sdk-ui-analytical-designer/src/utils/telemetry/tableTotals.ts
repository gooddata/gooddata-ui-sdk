// (C) 2023-2026 GoodData Corporation

import { type TotalType } from "@gooddata/sdk-model";
import { _isEqual } from "@gooddata/util";

import { getBucketByLocalIdentifier } from "../../services/buckets_service.js";
import { type IAppState } from "../../store/types.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import type { ITotal } from "../../typings/state_objects.js";

export function findDifferentTotal(bigTotalList: ITotal[], smallTotalList: ITotal[]) {
    return bigTotalList.find((bigTotal) => {
        return !smallTotalList.find((smallTotal) => _isEqual(bigTotal, smallTotal));
    });
}

// names consistent with metric aggregation names
export function getTotalName(newTotalType: TotalType) {
    switch (newTotalType) {
        case "med":
            return "median";
        case "nat":
            return "rollup";
        default:
            return newTotalType;
    }
}

export function isSubtotalAttribute(
    state: IAppState,
    attributeIdentifier: string,
    bucketLocalIdentifier: string,
) {
    const attributeBucket = getBucketByLocalIdentifier(state, bucketLocalIdentifier);
    const index = [...(attributeBucket?.items ?? [])].findIndex(
        (item: IRawBucketItem) => item?.localIdentifier === attributeIdentifier,
    );
    return index > 0;
}
