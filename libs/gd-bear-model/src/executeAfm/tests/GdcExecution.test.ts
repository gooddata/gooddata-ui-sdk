// (C) 2007-2018 GoodData Corporation
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { GdcExecution } from "../GdcExecution";
import {
    attributeHeaderItem,
    measureHeaderItem,
    totalHeaderItem,
    attributeHeader,
    measureGroupGroup,
} from "./GdcExecution.fixtures";
import isAttributeHeaderItem = GdcExecution.isAttributeHeaderItem;
import isMeasureHeaderItem = GdcExecution.isMeasureHeaderItem;
import isTotalHeaderItem = GdcExecution.isTotalHeaderItem;
import isMeasureGroupHeader = GdcExecution.isMeasureGroupHeader;
import isAttributeHeader = GdcExecution.isAttributeHeader;

describe("GdcExecution type guards", () => {
    describe("isAttributeHeaderItem", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute header item", attributeHeaderItem],
            [false, "measure header item", measureHeaderItem],
            [false, "total header item", totalHeaderItem],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeHeaderItem(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureHeaderItem", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute header item", attributeHeaderItem],
            [true, "measure header item", measureHeaderItem],
            [false, "total header item", totalHeaderItem],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureHeaderItem(input)).toBe(expectedResult);
        });
    });

    describe("isTotalHeaderItem", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute header item", attributeHeaderItem],
            [false, "measure header item", measureHeaderItem],
            [true, "total header item", totalHeaderItem],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isTotalHeaderItem(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureGroupHeader", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute header", attributeHeader],
            [true, "measure group header", measureGroupGroup],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureGroupHeader(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeHeader", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute header", attributeHeader],
            [false, "measure group header", measureGroupGroup],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeHeader(input)).toBe(expectedResult);
        });
    });
});
