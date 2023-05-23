// (C) 2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards.js";
import {
    IDimensionItemDescriptor,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isTotalDescriptor,
    isResultTotalHeader,
    IResultHeader,
} from "../index.js";

describe("result type guards", () => {
    describe("isAttributeDescriptor", () => {
        const Scenarios: Array<[boolean, string, IDimensionItemDescriptor | any]> = [
            ...InvalidInputTestCases,
            [true, "attribute descriptor", { attributeHeader: { name: "my attribute" } }],
            [false, "measure group descriptor", { measureGroupHeader: { items: [] } }],
            [false, "measure descriptor", { measureHeaderItem: { name: "my measure" } }],
            [false, "total descriptor", { totalHeaderItem: { name: "my total" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeDescriptor(input)).toBe(expectedResult);
        });
    });
    describe("isMeasureGroupDescriptor", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute descriptor", { attributeHeader: { name: "my attribute" } }],
            [true, "measure group descriptor", { measureGroupHeader: { items: [] } }],
            [false, "measure descriptor", { measureHeaderItem: { name: "my measure" } }],
            [false, "total descriptor", { totalHeaderItem: { name: "my total" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureGroupDescriptor(input)).toBe(expectedResult);
        });
    });
    describe("isMeasureDescriptor", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute descriptor", { attributeHeader: { name: "my attribute" } }],
            [false, "measure group descriptor", { measureGroupHeader: { items: [] } }],
            [true, "measure descriptor", { measureHeaderItem: { name: "my measure" } }],
            [false, "total descriptor", { totalHeaderItem: { name: "my total" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureDescriptor(input)).toBe(expectedResult);
        });
    });
    describe("isTotalDescriptor", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute descriptor", { attributeHeader: { name: "my attribute" } }],
            [false, "measure group descriptor", { measureGroupHeader: { items: [] } }],
            [false, "measure descriptor", { measureHeaderItem: { name: "my measure" } }],
            [true, "total descriptor", { totalHeaderItem: { name: "my total" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isTotalDescriptor(input)).toBe(expectedResult);
        });
    });
    describe("isResultAttributeHeader", () => {
        const Scenarios: Array<[boolean, string, IResultHeader | any]> = [
            ...InvalidInputTestCases,
            [
                true,
                "attribute header",
                { attributeHeaderItem: { uri: "/uri", name: "my attribute element" } },
            ],
            [false, "measure header", { measureHeaderItem: { name: "my measure", order: 0 } }],
            [false, "total header", { totalHeaderItem: { name: "my total" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isResultAttributeHeader(input)).toBe(expectedResult);
        });
    });
    describe("isResultMeasureHeader", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [
                false,
                "attribute header",
                { attributeHeaderItem: { uri: "/uri", name: "my attribute element" } },
            ],
            [false, "invalid measure header", { measureHeaderItem: { name: "my measure" } }],
            [true, "measure header", { measureHeaderItem: { name: "my measure", order: 0 } }],
            [false, "total header", { totalHeaderItem: { name: "my total", type: "sum" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isResultMeasureHeader(input)).toBe(expectedResult);
        });
    });
    describe("isResultTotalHeader", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [
                false,
                "attribute header",
                { attributeHeaderItem: { uri: "/uri", name: "my attribute element" } },
            ],
            [false, "measure header", { measureHeaderItem: { name: "my measure", order: 0 } }],
            [false, "invalid total header", { totalHeaderItem: { name: "my total" } }],
            [true, "total header", { totalHeaderItem: { name: "my total", type: "sum" } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isResultTotalHeader(input)).toBe(expectedResult);
        });
    });
});
