// (C) 2019-2022 GoodData Corporation

import { newInsight } from "../../../__mocks__/insights";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { isInsight, isColorMappingItem, IColorMappingItem } from "../index";

describe("insight type guards", () => {
    describe("isInsight", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "insight", newInsight("something")],
            [false, "random object", { i: { num: 10 } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isInsight(input)).toBe(expectedResult);
        });
    });

    describe("isColorMappingItem", () => {
        const colorMappingItem: IColorMappingItem = {
            color: { type: "guid", value: "123" },
            id: "foo",
        };
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "IColorMappingItem", colorMappingItem],
            [false, "random object", { i: { num: 10 } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isColorMappingItem(input)).toBe(expectedResult);
        });
    });
});
