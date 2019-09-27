// (C) 2019 GoodData Corporation

import { isGuidColorItem, isRgbColorItem } from "../index";

describe("color type guards", () => {
    const STD_INVALID: Array<[boolean, string, any]> = [
        [false, "null", null],
        [false, "undefined", undefined],
        [false, "empty object", {}],
        [false, "array", []],
        [false, "string", "bleh"],
    ];

    describe("isGuidColorItem", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...STD_INVALID,
            [false, "rgb color", { type: "rgb", value: { r: 127, g: 127, b: 127 } }],
            [true, "guid color", { type: "guid", value: "myGuid" }],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isGuidColorItem(input)).toBe(expectedResult);
        });
    });

    describe("isRgbColorItem", () => {
        const TEST_DATA: Array<[boolean, string, any]> = [
            ...STD_INVALID,
            [true, "rgb color", { type: "rgb", value: { r: 127, g: 127, b: 127 } }],
            [false, "guid color", { type: "guid", value: "myGuid" }],
        ];

        it.each(TEST_DATA)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRgbColorItem(input)).toBe(expectedResult);
        });
    });
});
