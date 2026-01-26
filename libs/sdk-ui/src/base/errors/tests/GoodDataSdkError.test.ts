// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { InvalidInputTestCases } from "../../../../testUtils/typeGuards.js";
import { isGoodDataSdkError } from "../GoodDataSdkError.js";

describe("sdk error type guard", () => {
    const Scenarios: Array<[boolean, string, any]> = [...InvalidInputTestCases];

    it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
        expect(isGoodDataSdkError(input)).toBe(expectedResult);
    });
});
