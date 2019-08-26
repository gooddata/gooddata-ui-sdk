// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";
import * as fixtures from "../../../stories/test_data/fixtures";
import {
    STACK_BY_DIMENSION_INDEX,
    VIEW_BY_DIMENSION_INDEX,
} from "../../components/visualizations/chart/constants";
import { EXECUTION_RESPONSE_1A_2M } from "../../components/visualizations/table/fixtures/1attribute2measures";
import {
    findAttributeInDimension,
    findInDimensionHeaders,
    findMeasureGroupInDimensions,
    findMeasureHeaderByLocalIdentifier,
    getNthAttributeHeader,
    getNthAttributeLocalIdentifier,
    getNthAttributeName,
    getNthDimensionHeaders,
} from "../executionResultHelper";

describe("findInDimensionHeaders", () => {
    it("should call supplied callback for all headers in all dimensions until it returns a non null value", () => {
        const mockCallback = jest.fn();
        mockCallback.mockReturnValue(null);
        const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;
        const headerCount =
            sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers.length +
            sampleDimensions[STACK_BY_DIMENSION_INDEX].headers.length;
        const returnValue = findInDimensionHeaders(sampleDimensions, mockCallback);
        expect(returnValue).toBeNull();
        expect(mockCallback).toHaveBeenCalledTimes(headerCount);
    });
    it("should return the first non-null value of it`s callback value", () => {
        const mockCallback = jest.fn();
        mockCallback.mockReturnValue(42);
        const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;
        const returnValue = findInDimensionHeaders(sampleDimensions, mockCallback);
        expect(returnValue).toBe(42);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});

describe("findMeasureGroupInDimensions", () => {
    const sampleDimensions = fixtures.barChartWithStackByAndViewByAttributes.executionResponse.dimensions;

    it("should return the measure group header", () => {
        const returnValue = findMeasureGroupInDimensions(sampleDimensions);
        const expectedValue = sampleDimensions[VIEW_BY_DIMENSION_INDEX].headers[1].measureGroupHeader;
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
    const { dimensions } = fixtures.barChartWithStackByAndViewByAttributes.executionResponse;
    const { headerItems } = fixtures.barChartWithStackByAndViewByAttributes.executionResult;
    it("should return the view by attribute header with header items", () => {
        const returnValue = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            headerItems[VIEW_BY_DIMENSION_INDEX],
        );
        const expectedValue = {
            ...dimensions[VIEW_BY_DIMENSION_INDEX].headers[0].attributeHeader,
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
            ...dimensions[STACK_BY_DIMENSION_INDEX].headers[0].attributeHeader,
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

describe("getNthAttributeHeader", () => {
    it("should return first header", () => {
        const attributeHeaders = EXECUTION_RESPONSE_1A_2M.dimensions[0]
            .headers as Execution.IAttributeHeader[];

        expect(getNthAttributeHeader(attributeHeaders, 0)).toBe(attributeHeaders[0].attributeHeader);
    });

    it("should return null if attribute header not found", () => {
        const attributeHeaders = EXECUTION_RESPONSE_1A_2M.dimensions[0]
            .headers as Execution.IAttributeHeader[];

        expect(getNthAttributeHeader(attributeHeaders, 1)).toBe(null);
    });
});

describe("getNthAttributeLocalIdentifier", () => {
    it("should return local identifier of first header", () => {
        const attributeHeaders = EXECUTION_RESPONSE_1A_2M.dimensions[0]
            .headers as Execution.IAttributeHeader[];

        expect(getNthAttributeLocalIdentifier(attributeHeaders, 0)).toBe(
            attributeHeaders[0].attributeHeader.localIdentifier,
        );
    });

    it("should return null if attribute header not found", () => {
        const attributeHeaders = EXECUTION_RESPONSE_1A_2M.dimensions[0]
            .headers as Execution.IAttributeHeader[];

        expect(getNthAttributeLocalIdentifier(attributeHeaders, 1)).toBe(null);
    });
});

describe("getNthAttributeName", () => {
    it("should return name of first header", () => {
        const attributeHeaders = EXECUTION_RESPONSE_1A_2M.dimensions[0]
            .headers as Execution.IAttributeHeader[];

        expect(getNthAttributeName(attributeHeaders, 0)).toBe(
            attributeHeaders[0].attributeHeader.formOf.name,
        );
    });

    it("should return null if attribute header not found", () => {
        const attributeHeaders = EXECUTION_RESPONSE_1A_2M.dimensions[0]
            .headers as Execution.IAttributeHeader[];

        expect(getNthAttributeName(attributeHeaders, 1)).toBe(null);
    });
});

describe("getNthDimensionHeaders", () => {
    it("should return first header", () => {
        const executionResponse = EXECUTION_RESPONSE_1A_2M;

        expect(getNthDimensionHeaders(executionResponse, 0)).toBe(executionResponse.dimensions[0].headers);
    });

    it("should return null if dimension not found", () => {
        const executionResponse = EXECUTION_RESPONSE_1A_2M;

        expect(getNthDimensionHeaders(executionResponse, 3)).toBe(null);
    });
});
