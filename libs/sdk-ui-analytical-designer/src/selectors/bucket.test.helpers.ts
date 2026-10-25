// (C) 2007-2026 GoodData Corporation

import { type IBucketItem } from "@gooddata/sdk-ui-ext/internal";

import { MEASURES, STACK, VIEW } from "../constants/bucket.js";

export const masterMeasureItems: IBucketItem[] = [
    {
        localIdentifier: "m1",
        type: "metric",
        aggregation: null,
        attribute: "aazb6kroa3iC",
        showInPercent: null,
        showOnSecondaryAxis: null,
    },
    {
        localIdentifier: "m2",
        type: "metric",
        aggregation: null,
        attribute: "af2Ewj9Re2vK",
        showInPercent: null,
        showOnSecondaryAxis: null,
    },
    {
        localIdentifier: "m3",
        type: "metric",
        aggregation: null,
        attribute: "dt.opportunitysnapshot.snapshotdate",
        showInPercent: null,
        showOnSecondaryAxis: true,
    },
    {
        localIdentifier: "m4",
        type: "metric",
        aggregation: null,
        attribute: "acfWntEMcom0",
        showInPercent: null,
        showOnSecondaryAxis: true,
    },
];

export const attributeItems: IBucketItem[] = [
    {
        localIdentifier: "a1",
        type: "attribute",
        aggregation: null,
        attribute: "attr.owner.department",
    },
    {
        localIdentifier: "a2",
        type: "attribute",
        aggregation: null,
        attribute: "attr.stage.iswon",
    },
    {
        localIdentifier: "a3",
        type: "attribute",
        attribute: "attr.owner.region",
    },
];

export const oneMeasureOneCategoryOneStack = [
    {
        localIdentifier: MEASURES,
        items: masterMeasureItems.slice(0, 1),
    },
    {
        localIdentifier: VIEW,
        items: attributeItems.slice(0, 1),
    },
    {
        localIdentifier: STACK,
        items: attributeItems.slice(1, 2),
    },
];

export const manyMeasuresTwoCategoriesNoStack = [
    {
        localIdentifier: MEASURES,
        items: masterMeasureItems,
    },
    {
        localIdentifier: VIEW,
        items: attributeItems.slice(0, 2),
    },
    {
        localIdentifier: STACK,
        items: [],
    },
];
