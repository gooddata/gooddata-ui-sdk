// (C) 2019 GoodData Corporation

import { Account, Won } from "../../../../__mocks__/model";
import { isAttribute } from "../index";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";

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
