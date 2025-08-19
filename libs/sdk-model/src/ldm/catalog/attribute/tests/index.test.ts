// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    catalogAttribute,
    catalogDateDataset,
    catalogFact,
    catalogMeasure,
} from "../../../../../__mocks__/catalog.js";
import { InvalidInputTestCases } from "../../../../../__mocks__/typeGuards.js";
import { isCatalogAttribute } from "../index.js";

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
