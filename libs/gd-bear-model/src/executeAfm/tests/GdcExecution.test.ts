// (C) 2007-2018 GoodData Corporation
import { GdcExecution } from "../GdcExecution";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import isAttributeHeaderItem = GdcExecution.isAttributeHeaderItem;
import IResultHeaderItem = GdcExecution.IResultHeaderItem;
import isMeasureHeaderItem = GdcExecution.isMeasureHeaderItem;
import isTotalHeaderItem = GdcExecution.isTotalHeaderItem;
import IHeader = GdcExecution.IHeader;
import isMeasureGroupHeader = GdcExecution.isMeasureGroupHeader;
import isAttributeHeader = GdcExecution.isAttributeHeader;

describe("GdcExecution type guards", () => {
    const attributeHeaderItem: IResultHeaderItem = {
        attributeHeaderItem: {
            uri: "/uri",
            name: "Name",
        },
    };

    const measureHeaderItem: IResultHeaderItem = {
        measureHeaderItem: {
            name: "Name",
            order: 1,
        },
    };

    const totalHeaderItem: IResultHeaderItem = {
        totalHeaderItem: {
            name: "Name",
            type: "asdf",
        },
    };

    const measureGroupGroup: IHeader = {
        measureGroupHeader: {
            items: [
                {
                    measureHeaderItem: {
                        localIdentifier: "m1",
                        name: "Senseilevel",
                        format: "###",
                    },
                },
            ],
        },
    };

    const attributeHeader: IHeader = {
        attributeHeader: {
            uri: "/uri",
            identifier: "id",
            localIdentifier: "a1",
            name: "Year over year",
            formOf: {
                uri: "/uri2",
                identifier: "id2",
                name: "Date of birth",
            },
        },
    };

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
