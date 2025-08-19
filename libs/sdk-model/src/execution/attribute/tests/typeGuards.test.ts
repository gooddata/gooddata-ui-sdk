// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { Account, Won } from "../../../../__mocks__/model.js";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards.js";
import { isAttribute } from "../index.js";

describe("attribute type guard", () => {
    describe("isAttribute", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute", Account.Name],
            [false, "measure", Won],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttribute(input)).toBe(expectedResult);
        });
    });
});
