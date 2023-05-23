// (C) 2019-2020 GoodData Corporation

import {
    catalogAttribute,
    catalogMeasure,
    catalogFact,
    catalogDateDataset,
} from "../../../../../__mocks__/catalog.js";
import { InvalidInputTestCases } from "../../../../../__mocks__/typeGuards.js";
import { isCatalogFact } from "../index.js";

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
