// (C) 2019-2020 GoodData Corporation

import {
    catalogAttribute,
    catalogMeasure,
    catalogFact,
    catalogDateDataset,
} from "../../../../../__mocks__/catalog";
import { InvalidInputTestCases } from "../../../../../__mocks__/typeGuards";
import { isCatalogDateDataset } from "../index";

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
