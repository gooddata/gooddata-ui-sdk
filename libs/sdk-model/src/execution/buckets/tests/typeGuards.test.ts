// (C) 2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards.js";
import { isBucket } from "../index.js";

describe("bucket type guard", () => {
    describe("isBucket", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "bucket", { localIdentifier: "myBucket", items: [] }],
            [false, "object with items", { items: [] }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isBucket(input)).toBe(expectedResult);
        });
    });
});
