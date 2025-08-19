// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { CatalogExportError, isAttribute, isCatalogExportError, isFact, isMetric } from "../types.js";

describe("catalog type guards", () => {
    const STD_INVALID: Array<[boolean, string, any]> = [
        [false, "null", null],
        [false, "undefined", undefined],
        [false, "empty object", {}],
        [false, "array", []],
        [false, "string", "bleh"],
    ];

    describe("isAttribute", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...STD_INVALID,
            [false, "fact", { fact: { xyz: true } }],
            [true, "attribute", { attribute: { xyz: true } }],
            [false, "metric", { metric: { xyz: true } }],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttribute(input)).toBe(expectedResult);
        });
    });

    describe("isFact", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...STD_INVALID,
            [true, "fact", { fact: { xyz: true } }],
            [false, "metric", { metric: { xyz: true } }],
            [false, "attribute", { attribute: { xyz: true } }],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFact(input)).toBe(expectedResult);
        });
    });

    describe("isMetric", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...STD_INVALID,
            [false, "fact", { fact: { xyz: true } }],
            [true, "metric", { metric: { xyz: true } }],
            [false, "attribute", { attribute: { xyz: true } }],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMetric(input)).toBe(expectedResult);
        });
    });

    describe("isCatalogExportError", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...STD_INVALID,
            [false, "generic error", new Error()],
            [true, "catalog export error", new CatalogExportError("meh", -1)],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isCatalogExportError(input)).toBe(expectedResult);
        });
    });
});
