// (C) 2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { isDimension, MeasureGroupIdentifier, newDimension } from "../dimension";
import { Won } from "../../../__mocks__/model";

describe("dimension type guard", () => {
    describe("isDimension", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dimension", newDimension([MeasureGroupIdentifier])],
            [false, "measure", Won],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDimension(input)).toBe(expectedResult);
        });
    });
});
