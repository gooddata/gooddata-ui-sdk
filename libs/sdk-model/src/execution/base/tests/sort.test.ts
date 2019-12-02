// (C) 2019 GoodData Corporation

import {
    IAttributeSortItem,
    IMeasureSortItem,
    newAttributeLocator,
    newAttributeSort,
    newMeasureSort,
    sortEntityIds,
} from "../sort";
import { Account, Won } from "../../../../__mocks__/model";
import { InvariantError } from "ts-invariant";

const AttributeSort: IAttributeSortItem = newAttributeSort(Account.Default, "asc");
const MeasureSort1: IMeasureSortItem = newMeasureSort(Won, "asc");
const MeasureSort2: IMeasureSortItem = newMeasureSort(Won, "asc", [
    newAttributeLocator(Account.Default, "value"),
]);

describe("sortEntityIds", () => {
    const Scenarios: Array<[string, any]> = [
        ["get local ids from attribute sort", AttributeSort],
        ["get local ids from measure sort with just measure locator", MeasureSort1],
        ["get local ids from measure sort with measure locator and attribute locators", MeasureSort2],
    ];

    it.each(Scenarios)("should %s", (_desc, input) => {
        expect(sortEntityIds(input)).toMatchSnapshot();
    });

    const InvalidScenarios: Array<[string, any]> = [
        ["get empty result if input undefined", undefined],
        ["get empty result if input null", null],
    ];

    it.each(InvalidScenarios)("should %s", (_desc, input) => {
        expect(() => sortEntityIds(input)).toThrow();
    });
});

describe("newAttributeSort", () => {
    const Scenarios: Array<[string, any, any, any]> = [
        ["create asc sort by default", Account.Default, undefined, undefined],
        ["create asc sort for attribute object", Account.Default, "asc", undefined],
        ["create desc sort for attribute object", Account.Default, "desc", undefined],
        ["create asc sort for attribute", "localId1", "asc", undefined],
        ["create desc sort for attribute", "localId1", "desc", undefined],
        ["create sort with aggregation", Account.Default, "asc", true],
    ];

    it.each(Scenarios)("should %s", (_desc, attrArg, sortArg, aggArg) => {
        expect(newAttributeSort(attrArg, sortArg, aggArg)).toMatchSnapshot();
    });

    it("should throw if attribute input is undefined", () => {
        expect(() => newAttributeSort(undefined as any, "asc")).toThrowError(InvariantError);
    });

    it("should throw if attribute input is null", () => {
        expect(() => newAttributeSort(undefined as any, "asc")).toThrowError(InvariantError);
    });
});

describe("newMeasureSort", () => {
    const Scenarios: Array<[string, any, any, any]> = [
        ["create asc sort by default", Won, undefined, undefined],
        ["create asc sort for measure object", Won, "asc", undefined],
        ["create desc sort for measure object", Won, "desc", undefined],
        ["create asc sort for measure", "localId1", "asc", undefined],
        ["create desc sort for measure", "localId1", "desc", undefined],
        [
            "create desc sort for measure and attribute locators",
            "localId1",
            "desc",
            [newAttributeLocator(Account.Default, "value")],
        ],
    ];

    it.each(Scenarios)("should %s", (_desc, measureArg, sortArg, attrArg) => {
        expect(newMeasureSort(measureArg, sortArg, attrArg)).toMatchSnapshot();
    });

    it("should throw if measure input is undefined", () => {
        expect(() => newMeasureSort(undefined as any)).toThrowError(InvariantError);
    });

    it("should throw if measure input is undefined", () => {
        expect(() => newMeasureSort(undefined as any)).toThrowError(InvariantError);
    });
});

describe("newAttributeLocator", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["create locator for attr object", Account.Default, "value"],
        ["create locator for attr", "localId", "value"],
    ];

    it.each(Scenarios)("should %s", (_desc, attrArg, elementArg) => {
        expect(newAttributeLocator(attrArg, elementArg)).toMatchSnapshot();
    });

    const InvalidScenarios: Array<[string, any, any]> = [
        ["attribute undefined", undefined, "value"],
        ["attribute null", null, "value"],
        ["element undefined", Account.Default, undefined],
        ["element null", Account.Default, null],
    ];

    it.each(InvalidScenarios)("should throw InvariantError when %s", (_desc, attrArg, elementArg) => {
        expect(() => newAttributeLocator(attrArg, elementArg)).toThrowError(InvariantError);
    });
});
