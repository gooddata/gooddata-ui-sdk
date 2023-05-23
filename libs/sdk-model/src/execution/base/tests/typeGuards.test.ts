// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards.js";
import { isDimension, MeasureGroupIdentifier, newDimension } from "../dimension.js";
import { Won } from "../../../../__mocks__/model.js";
import { isAttributeLocator, isAttributeSort, isMeasureLocator, isMeasureSort } from "../sort.js";
import { isTotal } from "../totals.js";

describe("dimension type guard", () => {
    describe("isDimension", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dimension", newDimension([MeasureGroupIdentifier])],
            [false, "measure", Won],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDimension(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeSort", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [
                true,
                "attribute sort",
                { attributeSortItem: { direction: "asc", attributeIdentifier: "localId1" } },
            ],
            [false, "measure sort", { measureSortItem: { direction: "asc", locators: [] } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeSort(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureSort", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [
                false,
                "attribute sort",
                { attributeSortItem: { direction: "asc", attributeIdentifier: "localId1" } },
            ],
            [true, "measure sort", { measureSortItem: { direction: "asc", locators: [] } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureSort(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeLocator", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [
                true,
                "attribute locator",
                { attributeLocatorItem: { attributeIdentifier: "localId", element: "value" } },
            ],
            [false, "measure locator", { measureLocatorItem: { measureIdentifier: "localId" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeLocator(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureLocator", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [
                false,
                "attribute locator",
                { attributeLocatorItem: { attributeIdentifier: "localId", element: "value" } },
            ],
            [true, "measure locator", { measureLocatorItem: { measureIdentifier: "localId" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureLocator(input)).toBe(expectedResult);
        });
    });

    describe("isTotal", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "measure", Won],
            [true, "total", { type: "sum", measureIdentifier: "localId1", attributeIdentifier: "localId2" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isTotal(input)).toBe(expectedResult);
        });
    });
});
