// (C) 2019-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";

import { type IRawBucketItem } from "../typings/buckets.js";

const bucketItemBase: IRawBucketItem = {
    attribute: "",
    aggregation: null,
    showInPercent: false,
    displayForm: null,
    dimensionUri: "",
    summary: "",
    identifier: "",
    dfRef: {
        identifier: "",
    },
    dfUri: "",
    dfIdentifier: "",
    uri: "",
    granularity: "",
    alias: "",
    localIdentifier: "",
    elementsUri: "",
    title: "",
    showOnSecondaryAxis: false,
    type: "",
    id: "",
    filters: [],
    isAvailable: false,
    dateDatasetRef: {
        uri: "",
    },
    ref: idRef("id"),
};

export function buildBucketItemMock(props: Partial<IRawBucketItem>): IRawBucketItem {
    return {
        ...bucketItemBase,
        ...props,
    };
}
