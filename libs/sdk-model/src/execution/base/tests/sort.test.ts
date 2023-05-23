// (C) 2019-2021 GoodData Corporation

import {
    ISortItem,
    newAttributeAreaSort,
    newAttributeLocator,
    newAttributeSort,
    newMeasureSort,
    sortEntityIds,
} from "../sort.js";
import { Account, Won } from "../../../../__mocks__/model.js";
import { InvariantError } from "ts-invariant";

const AttributeSort = newAttributeSort(Account.Default, "asc");
const MeasureSort1 = newMeasureSort(Won, "asc");
const MeasureSort2 = newMeasureSort(Won, "asc", [newAttributeLocator(Account.Default, "value")]);

describe("sortEntityIds", () => {
    const Scenarios: Array<[string, ISortItem]> = [
        ["attribute sort", AttributeSort],
        ["measure sort with just measure locator", MeasureSort1],
        ["measure sort with measure locator and attribute locators", MeasureSort2],
    ];

    it.each(Scenarios)("should get local ids from %s", (_desc, input) => {
        expect(sortEntityIds(input)).toMatchSnapshot();
    });

    const InvalidScenarios: any[] = [undefined, null];

    it.each(InvalidScenarios)("should get empty result if input %s", (input) => {
        expect(() => sortEntityIds(input)).toThrow();
    });
});

describe("newAttributeSort", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["create asc sort by default", Account.Default, undefined],
        ["create asc sort for attribute object", Account.Default, "asc"],
        ["create desc sort for attribute object", Account.Default, "desc"],
        ["create asc sort for attribute", "localId1", "asc"],
        ["create desc sort for attribute", "localId1", "desc"],
    ];

    it.each(Scenarios)("should %s", (_desc, attrArg, sortArg) => {
        expect(newAttributeSort(attrArg, sortArg)).toMatchSnapshot();
    });

    it("should throw if attribute input is undefined", () => {
        expect(() => newAttributeSort(undefined as any, "asc")).toThrowError(InvariantError);
    });

    it("should throw if attribute input is null", () => {
        expect(() => newAttributeSort(undefined as any, "asc")).toThrowError(InvariantError);
    });
});

describe("newAttributeAreaSort", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["create asc area sort by default", Account.Default, undefined],
        ["create asc area sort for attribute object", Account.Default, "asc"],
        ["create desc area sort for attribute object", Account.Default, "desc"],
        ["create asc area sort for attribute", "localId1", "asc"],
        ["create desc area sort for attribute", "localId1", "desc"],
    ];

    it.each(Scenarios)("should %s", (_desc, attrArg, sortArg) => {
        expect(newAttributeAreaSort(attrArg, sortArg)).toMatchSnapshot();
    });

    it("should throw if attribute input is undefined", () => {
        expect(() => newAttributeAreaSort(undefined as any, "asc")).toThrowError(InvariantError);
    });

    it("should throw if attribute input is null", () => {
        expect(() => newAttributeAreaSort(undefined as any, "asc")).toThrowError(InvariantError);
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

    it("should throw if measure input is null", () => {
        expect(() => newMeasureSort(null as any)).toThrowError(InvariantError);
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
