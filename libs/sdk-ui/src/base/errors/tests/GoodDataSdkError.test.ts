// (C) 2007-2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import { isGoodDataSdkError } from "../GoodDataSdkError";

describe("sdk error type guard", () => {
    const Scenarios: Array<[boolean, string, any]> = [...InvalidInputTestCases];

    it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
        expect(isGoodDataSdkError(input)).toBe(expectedResult);
    });
});
