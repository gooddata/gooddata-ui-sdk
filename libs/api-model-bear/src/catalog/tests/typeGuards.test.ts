// (C) 2019 GoodData Corporation
import { describe, it, expect } from "vitest";
import { catalogAttribute, catalogMetric, catalogFact } from "../../../__mocks__/catalog.js";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isCatalogAttribute, isCatalogFact, isCatalogMetric } from "../GdcCatalog.js";

describe("catalog attribute type guard", () => {
    describe("isCatalogAttribute", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "catalogAttribute", catalogAttribute],
            [false, "catalogMetric", catalogMetric],
            [false, "catalogFact", catalogFact],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogAttribute(input)).toBe(expectedResult);
        });
    });

    describe("isCatalogMetric", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "catalogAttribute", catalogAttribute],
            [true, "catalogMetric", catalogMetric],
            [false, "catalogFact", catalogFact],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogMetric(input)).toBe(expectedResult);
        });
    });

    describe("isCatalogFact", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "catalogAttribute", catalogAttribute],
            [false, "catalogMetric", catalogMetric],
            [true, "catalogFact", catalogFact],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogFact(input)).toBe(expectedResult);
        });
    });
});
