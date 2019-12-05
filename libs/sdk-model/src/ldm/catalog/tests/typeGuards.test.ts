// (C) 2019 GoodData Corporation

import {
    catalogAttribute,
    catalogMeasure,
    catalogFact,
    catalogDateDataset,
} from "../../../../__mocks__/catalog";
import { isCatalogAttribute, isCatalogMeasure, isCatalogFact, isCatalogDateDataset } from "../index";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";

describe("catalog attribute type guard", () => {
    describe("isCatalogAttribute", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "catalogAttribute", catalogAttribute],
            [false, "catalogMeasure", catalogMeasure],
            [false, "catalogFact", catalogFact],
            [false, "catalogDateDataset", catalogDateDataset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogAttribute(input)).toBe(expectedResult);
        });
    });

    describe("isCatalogMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "catalogAttribute", catalogAttribute],
            [true, "catalogMeasure", catalogMeasure],
            [false, "catalogFact", catalogFact],
            [false, "catalogDateDataset", catalogDateDataset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isCatalogFact", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "catalogAttribute", catalogAttribute],
            [false, "catalogMeasure", catalogMeasure],
            [true, "catalogFact", catalogFact],
            [false, "catalogDateDataset", catalogDateDataset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogFact(input)).toBe(expectedResult);
        });
    });

    describe("isCatalogDateDataset", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "catalogAttribute", catalogAttribute],
            [false, "catalogMeasure", catalogMeasure],
            [false, "catalogFact", catalogFact],
            [true, "catalogDateDataset", catalogDateDataset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogDateDataset(input)).toBe(expectedResult);
        });
    });
});
