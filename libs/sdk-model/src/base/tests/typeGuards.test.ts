// (C) 2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { isDimension, MeasureGroupIdentifier, newDimension } from "../dimension";
import { Won } from "../../../__mocks__/model";
import { isIdentifierRef, isLocalIdRef, isUriRef } from "../index";
import { isAttributeLocator, isAttributeSort, isMeasureLocator, isMeasureSort } from "../sort";

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

    describe("isUriRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "uri ref", { uri: "/" }],
            [false, "identifier ref", { identifier: "id" }],
            [false, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isUriRef(input)).toBe(expectedResult);
        });
    });

    describe("isIdentifierRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "uri ref", { uri: "/" }],
            [true, "identifier ref", { identifier: "id" }],
            [false, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isIdentifierRef(input)).toBe(expectedResult);
        });
    });

    describe("isLocalIdRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "uri ref", { uri: "/" }],
            [false, "identifier ref", { identifier: "id" }],
            [true, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isLocalIdRef(input)).toBe(expectedResult);
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
});
