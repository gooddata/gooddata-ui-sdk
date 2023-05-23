// (C) 2019 GoodData Corporation

import { isColorFromPalette, isRgbColor } from "../index.js";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";

describe("color type guards", () => {
    describe("isColorFromPalette", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "rgb color", { type: "rgb", value: { r: 127, g: 127, b: 127 } }],
            [true, "guid color", { type: "guid", value: "myGuid" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isColorFromPalette(input)).toBe(expectedResult);
        });
    });

    describe("isRgbColor", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "rgb color", { type: "rgb", value: { r: 127, g: 127, b: 127 } }],
            [false, "guid color", { type: "guid", value: "myGuid" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRgbColor(input)).toBe(expectedResult);
        });
    });
});
