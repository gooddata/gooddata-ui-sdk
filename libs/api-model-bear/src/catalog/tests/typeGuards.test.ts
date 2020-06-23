// (C) 2019 GoodData Corporation

import { catalogAttribute, catalogMetric, catalogFact } from "../../../__mocks__/catalog";
import { GdcCatalog } from "../GdcCatalog";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";

describe("catalog attribute type guard", () => {
    describe("isCatalogAttribute", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "catalogAttribute", catalogAttribute],
            [false, "catalogMetric", catalogMetric],
            [false, "catalogFact", catalogFact],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcCatalog.isCatalogAttribute(input)).toBe(expectedResult);
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
            expect(GdcCatalog.isCatalogMetric(input)).toBe(expectedResult);
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
            expect(GdcCatalog.isCatalogFact(input)).toBe(expectedResult);
        });
    });
});
