// (C) 2019-2026 GoodData Corporation

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, METRIC } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { type IRawBuckets } from "../typings/buckets.js";

export const bucketsForPivotTableWithTotals: IRawBuckets = [
    {
        localIdentifier: "measures",
        items: [
            {
                attribute: "m1",
                localIdentifier: "m1",
                filters: [],
                aggregation: "sum",
                type: METRIC,
            },
            {
                aggregation: "sum",
                showInPercent: undefined,
                showOnSecondaryAxis: undefined,
                alias: undefined,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                localIdentifier: "m1_pop",
                type: METRIC,
                filters: [],
                attribute: "m1",
            },
            {
                localIdentifier: "am1",
                operandLocalIdentifiers: ["m1", "m1_pop"],
            },
        ],
    },
    {
        localIdentifier: "attribute",
        items: [
            {
                attribute: DATE_DATASET_ATTRIBUTE,
            },
            {
                localIdentifier: "a1",
                filters: [],
                type: ATTRIBUTE,
            },
            {
                localIdentifier: "a2",
                filters: [],
                type: ATTRIBUTE,
            },
        ],
        totals: [
            {
                measureIdentifier: "m1",
                type: "sum",
                attributeIdentifier: "a1",
                alias: "total sum 1",
            },
            {
                measureIdentifier: "m1_pop",
                type: "sum",
                attributeIdentifier: "a1",
                alias: "total sum 2",
            },
            {
                measureIdentifier: "am1",
                type: "sum",
                attributeIdentifier: "a1",
                alias: "total sum 3",
            },
            {
                measureIdentifier: "m1",
                type: "max",
                attributeIdentifier: "a2",
                alias: "subtotal 1",
            },
            {
                measureIdentifier: "m1_pop",
                type: "max",
                attributeIdentifier: "a2",
                alias: "subtotal 2",
            },
            {
                measureIdentifier: "am1",
                type: "max",
                attributeIdentifier: "a2",
                alias: "subtotal 3",
            },
        ],
    },
    {
        localIdentifier: "columns",
        items: [],
    },
];
