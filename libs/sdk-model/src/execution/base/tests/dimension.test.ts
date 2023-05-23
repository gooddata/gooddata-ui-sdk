// (C) 2019-2020 GoodData Corporation

import {
    dimensionSetTotals,
    dimensionsFindItem,
    dimensionTotals,
    IDimension,
    MeasureGroupIdentifier,
    newDimension,
    newTwoDimensional,
} from "../dimension.js";
import { ITotal } from "../totals.js";
import { Account, Activity } from "../../../../__mocks__/model.js";

const Total1: ITotal = {
    type: "avg",
    measureIdentifier: "measureId",
    attributeIdentifier: "localId1",
};
const Total2: ITotal = {
    type: "avg",
    measureIdentifier: "measureId",
    attributeIdentifier: "localId2",
};
const DimensionWithTotals = newDimension(["localId1", Total1]);
const DimensionWithoutTotals = newDimension(["localId1"]);

describe("newDimension", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["create empty dimension if no input provided", undefined, undefined],
        [
            "create a valid dimension without totals when totals arg undef",
            ["localId1", "localId2"],
            undefined,
        ],
        ["create a valid dimension without totals when totals arg empty", ["localId1", "localId2"], []],
        [
            "create a valid dimension when using attribute objects and localIds",
            [Account.Name, "explicitLocalId1"],
            [],
        ],
        [
            "create a valid dimension when input arg is mix of identifiers and totals",
            ["localId1", Total1],
            [],
        ],
        ["create a valid dimension when totals are in second arg ", ["localId1"], [Total1]],
        ["create a valid dimension when totals are in both args ", ["localId1", Total1], [Total2]],
    ];

    it.each(Scenarios)("should %s", (_desc, itemsArg, totalsArg) => {
        expect(newDimension(itemsArg, totalsArg)).toMatchSnapshot();
    });
});

describe("newTwoDimensional", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["create two empty dimensions", [], []],
        ["create first dimension empty", [], ["localId1"]],
        ["create second dimension empty", ["localId1"], []],
        ["create both dimensions with correct ids", ["localId1"], ["localId2"]],
        [
            "create both dimensions with correct ids when mixing attribute and localId",
            ["localId1", Account.Name],
            [Activity.Subject, "localId2"],
        ],
        ["create first dimension with totals", ["localId1", Total1], ["localId2"]],
        ["create second dimension with totals", ["localId1"], ["localId2", Total1]],
        ["create both dimension with totals", ["localId1", Total1], ["localId2", Total2]],
        ["create first dimension with measuregroup", [MeasureGroupIdentifier], []],
        ["create second dimension with measuregroup", [], [MeasureGroupIdentifier]],
    ];

    it.each(Scenarios)("should %s", (_desc, dim1, dim2) => {
        expect(newTwoDimensional(dim1, dim2)).toMatchSnapshot();
    });

    it("should throw when measure group in both dimensions", () => {
        expect(() => newTwoDimensional([MeasureGroupIdentifier], [MeasureGroupIdentifier])).toThrow();
    });
});

describe("dimensionSetTotals", () => {
    const Scenarios: Array<[string, IDimension, any]> = [
        ["replace non-empty totals", DimensionWithTotals, Total2],
        ["set totals ", DimensionWithoutTotals, Total1],
        ["clear totals", DimensionWithTotals, []],
        ["clear totals when no second arg", DimensionWithTotals, undefined],
    ];

    it.each(Scenarios)("should %s", (_desc, dimArg, totalsArg) => {
        expect(dimensionSetTotals(dimArg, totalsArg)).toMatchSnapshot();
    });
});

describe("dimensionTotals", () => {
    const Scenarios: Array<[string, any, ITotal[]]> = [
        ["return empty totals if not in dim", DimensionWithoutTotals, []],
        ["return totals from dim", DimensionWithTotals, [Total1]],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expected) => {
        expect(dimensionTotals(input)).toEqual(expected);
    });

    const InvalidScenarios: Array<[string, any]> = [
        ["dim undefined", undefined],
        ["dim null", null],
    ];

    it.each(InvalidScenarios)("should thrown when %s", (_desc, input) => {
        expect(() => dimensionTotals(input)).toThrow();
    });
});

describe("dimensionsFindItem", () => {
    const TestDimensions = newTwoDimensional(["localId1", "localId2"], ["localId3", "localId4", "localId2"]);

    const Scenarios: Array<[string, IDimension[], string]> = [
        ["find one item in first dimension", TestDimensions, "localId1"],
        ["find one item in second dimension", TestDimensions, "localId4"],
        ["find one item in both dimensions", TestDimensions, "localId2"],
        ["find no item", TestDimensions, "localId0"],
    ];

    it.each(Scenarios)("should %s", (_desc, dims, id) => {
        expect(dimensionsFindItem(dims, id)).toMatchSnapshot();
    });
});
