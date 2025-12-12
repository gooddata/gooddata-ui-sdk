// (C) 2021-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IExecutionDefinition,
    MeasureGroupIdentifier,
    bucketSetTotals,
    defSetDimensions,
    defWithDimensions,
    emptyDef,
    newBucket,
    newDefForBuckets,
    newDimension,
    newTotal,
    newTwoDimensional,
} from "@gooddata/sdk-model";

import { convertTotals } from "../TotalsConverter.js";

const TotalSum1 = newTotal("sum", "m1", "localAttr1");
const TotalSum2 = newTotal("sum", "m2", "localAttr1");
const TotalSum3 = newTotal("sum", "m3", "localAttr1");
const TotalMin1 = newTotal("min", "m1", "localAttr1");
const TotalMax2 = newTotal("max", "m2", "localAttr1");
const TotalNat1 = newTotal("nat", "m1", "localAttr1");
const TotalOtherDim = { ...TotalSum1, attributeIdentifier: "localAttr2" };

const Test0 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], []),
    newDimension([MeasureGroupIdentifier]),
);
const Test1 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1]),
    newDimension([MeasureGroupIdentifier]),
);
const Test2 = defWithDimensions(
    emptyDef("test"),
    newDimension([MeasureGroupIdentifier, "localAttr2"]),
    newDimension(["localAttr1"], [TotalSum1]),
);
const Test3 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1, TotalMin1]),
    newDimension(["localAttr3", MeasureGroupIdentifier]),
);
const Test4 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1, TotalSum2, TotalSum3]),
    newDimension(["localAttr3", MeasureGroupIdentifier]),
);
const Test5 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1, TotalSum2, TotalMin1, TotalMax2]),
    newDimension([MeasureGroupIdentifier]),
);
const Test6 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1]),
    newDimension([MeasureGroupIdentifier]),
    newDimension(["localAttr2"], [TotalOtherDim]),
);
const Test7 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalSum1, TotalOtherDim]),
    newDimension(["localAttr3", MeasureGroupIdentifier]),
);
const Test8 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", MeasureGroupIdentifier], [TotalSum1]),
    newDimension(["localAttr3"]),
);
const Test9 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1"], [TotalSum1]),
    newDimension(["localAttr3"]),
);
const Test10 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2", MeasureGroupIdentifier], [TotalSum1]),
);
// Grand totals
const total = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.Account.Name);
const columnTotal = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.Department.Default);
const Test11 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate),
        bucketSetTotals(newBucket("attribute", ReferenceMd.Account.Name), [total]),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department.Default), [columnTotal]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, total],
        [ReferenceMd.Department.Default, MeasureGroupIdentifier, columnTotal],
    ),
);
// Marginal totals
const subtotal = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.ForecastCategory);
const columnSubTotal = newTotal("sum", ReferenceMd.WinRate, ReferenceMd.IsActive);
const Test12 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate),
        bucketSetTotals(newBucket("attribute", ReferenceMd.Account.Name, ReferenceMd.ForecastCategory), [
            subtotal,
        ]),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department.Default, ReferenceMd.IsActive), [
            columnSubTotal,
        ]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, ReferenceMd.ForecastCategory, subtotal],
        [ReferenceMd.Department.Default, ReferenceMd.IsActive, MeasureGroupIdentifier, columnSubTotal],
    ),
);
// Row total + column subtotal
const Test13 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate),
        bucketSetTotals(newBucket("attribute", ReferenceMd.Account.Name, ReferenceMd.ForecastCategory), [
            total,
        ]),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department.Default, ReferenceMd.IsActive), [
            columnSubTotal,
        ]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, ReferenceMd.ForecastCategory, subtotal],
        [ReferenceMd.Department.Default, ReferenceMd.IsActive, MeasureGroupIdentifier, columnSubTotal],
    ),
);
// Column total + row subtotal
const Test14 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate),
        bucketSetTotals(newBucket("attribute", ReferenceMd.Account.Name, ReferenceMd.ForecastCategory), [
            subtotal,
        ]),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department.Default, ReferenceMd.IsActive), [
            columnTotal,
        ]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, ReferenceMd.ForecastCategory, subtotal],
        [ReferenceMd.Department.Default, ReferenceMd.IsActive, MeasureGroupIdentifier, columnSubTotal],
    ),
);

const Test15 = defWithDimensions(
    emptyDef("test"),
    newDimension(["localAttr1", "localAttr2"], [TotalNat1]),
    newDimension([MeasureGroupIdentifier]),
);

// subtotals, with unsorted totals
const Test16 = defSetDimensions(
    newDefForBuckets("test", [
        newBucket("measure", ReferenceMd.WinRate, ReferenceMd.Won),
        newBucket("attribute", ReferenceMd.Account.Name, ReferenceMd.ForecastCategory),
        bucketSetTotals(newBucket("columns", ReferenceMd.Department.Default, ReferenceMd.IsActive), [
            newTotal("sum", ReferenceMd.Won, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.WinRate, ReferenceMd.Department.Default),
        ]),
    ]),
    newTwoDimensional(
        [ReferenceMd.Account.Name, ReferenceMd.ForecastCategory],
        [
            ReferenceMd.Department.Default,
            ReferenceMd.IsActive,
            MeasureGroupIdentifier,
            // it should be ordered as WinRate, Won in the snapshot
            newTotal("sum", ReferenceMd.Won, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.WinRate, ReferenceMd.Department.Default),
        ],
    ),
);

describe("convertTotals", () => {
    const Scenarios: Array<[string, IExecutionDefinition]> = [
        ["no totals", Test0],
        ["attributes in first dim and measure group in second dim", Test1],
        ["measure group and attribute in one dimension", Test2],
        ["two totals with different functions", Test3],
        ["three totals with the same function", Test4],
        ["multiple totals with various functions", Test5],
        ["three dimensions", Test6],
        ["subtotal", Test7],
        ["total on dimension with measure group", Test8],
        ["total without any measure group", Test9],
        ["total on single dimension result spec", Test10],
        ["two totals and grand total", Test11],
        ["two subtotals and marginal total", Test12],
        ["row total and column subtotal", Test13],
        ["column total and row subtotal", Test14],
        ["native total", Test15],
        ["subtotals with non-sorted totals", Test16],
    ];
    it.each(Scenarios)("should correctly convert %s", (_desc, def) => {
        expect(convertTotals(def)).toMatchSnapshot();
    });
});
