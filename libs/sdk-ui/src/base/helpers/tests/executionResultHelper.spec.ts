// (C) 2007-2018 GoodData Corporation

import { STACK_BY_DIMENSION_INDEX, VIEW_BY_DIMENSION_INDEX } from "../../constants/dimensions";
import {
    findAttributeInDimension,
    findMeasureGroupInDimensions,
    findMeasureHeaderByLocalIdentifier,
} from "../executionResultHelper";
import * as fixtures from "../../../../__mocks__/fixtures";
import { IAttributeHeader, IMeasureGroupHeader } from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/gd-bear-model";

describe("findMeasureGroupInDimensions", () => {
    const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.dimensions();

    it("should return the measure group header", () => {
        const returnValue = findMeasureGroupInDimensions(sampleDimensions);
        const expectedValue = (sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers[1] as IMeasureGroupHeader)
            .measureGroupHeader;
        expect(returnValue).toBe(expectedValue);
    });

    it("should throw an error if measureGroup is not the last header on it's dimension", () => {
        const invalidDimensions = [
            {
                ...sampleDimensions[VIEW_BY_DIMENSION_INDEX],
                headers: [
                    ...sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers,
                    ...sampleDimensions[STACK_BY_DIMENSION_INDEX].headers,
                ],
            },
        ];
        expect(findMeasureGroupInDimensions.bind(this, invalidDimensions)).toThrow();
    });
});

describe("findAttributeInDimension", () => {
    const dimensions = fixtures.barChartWithStackByAndViewByAttributes.dimensions();
    const headerItems = fixtures.barChartWithStackByAndViewByAttributes.headerItems();
    it("should return the view by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            headerItems[VIEW_BY_DIMENSION_INDEX],
        );
        const expectedValue = {
            ...(dimensions[VIEW_BY_DIMENSION_INDEX].headers[0] as IAttributeHeader).attributeHeader,
            items: headerItems[VIEW_BY_DIMENSION_INDEX][0],
        };
        expect(returnValue).toEqual(expectedValue);
    });
    it("should return the stack by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            headerItems[STACK_BY_DIMENSION_INDEX],
        );
        const expectedValue = {
            ...(dimensions[STACK_BY_DIMENSION_INDEX].headers[0] as IAttributeHeader).attributeHeader,
            items: headerItems[STACK_BY_DIMENSION_INDEX][0],
        };
        expect(returnValue).toEqual(expectedValue);
    });
});

describe("findMeasureHeaderByLocalIdentifier", () => {
    const measureHeader1 = {
        measureHeaderItem: {
            uri: "m1uri",
            identifier: "m1id",
            localIdentifier: "m1",
            name: "m1name",
            format: "$#,##0.00",
        },
    };
    const measureHeader2 = {
        measureHeaderItem: {
            uri: "m2uri",
            identifier: "m2id",
            localIdentifier: "m2",
            name: "m2name",
            format: "$#,##0.00",
        },
    };
    const executionResponse: Execution.IExecutionResponse = {
        dimensions: [
            {
                headers: [],
            },
            {
                headers: [
                    {
                        measureGroupHeader: {
                            items: [measureHeader1, measureHeader2],
                        },
                    },
                ],
            },
        ],
        links: { executionResult: "" },
    };

    it("should find header by local identifier in execution response", () => {
        expect(findMeasureHeaderByLocalIdentifier(executionResponse, "m1")).toEqual(measureHeader1);
    });

    // tslint:disable-next-line:max-line-length
    it("should not find header by local identifier in execution response when local identifier does not match any measure", () => {
        expect(findMeasureHeaderByLocalIdentifier(executionResponse, "foo")).toBe(null);
    });

    // tslint:disable-next-line:max-line-length
    it("should not find header by local identifier in execution response no measure headers present", () => {
        const emptyExecutionResponse: Execution.IExecutionResponse = {
            dimensions: [
                {
                    headers: [],
                },
            ],
            links: { executionResult: "" },
        };
        expect(findMeasureHeaderByLocalIdentifier(emptyExecutionResponse, "foo")).toBe(null);
    });
});
