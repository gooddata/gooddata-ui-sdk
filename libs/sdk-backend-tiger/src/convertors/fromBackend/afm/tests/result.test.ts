// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    mockDimensions,
    mockDimensionsWithDateFormat,
    mockDimensionsWithTotals,
    mockResult,
    mockResultWithTotals,
} from "./result.fixture.js";
import { defaultDateFormatter } from "../../dateFormatting/defaultDateFormatter.js";
import { getTransformDimensionHeaders } from "../DimensionHeaderConverter.js";
import { transformExecutionResult } from "../result.js";

describe("transformExecutionResult", () => {
    it("should format date dimensions values", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensions,
            defaultDateFormatter,
            mockResult.grandTotals,
        );
        const actual = transformExecutionResult(mockResult, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });

    it("should format date dimensions values with date format information", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensionsWithDateFormat,
            defaultDateFormatter,
            mockResult.grandTotals,
        );
        const actual = transformExecutionResult(mockResult, transformDimensionHeaders);
        expect(actual).toEqual({
            count: [1, 2],
            data: [["20.0", "40.2"]],
            headerItems: [
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "Sum of duration",
                                order: 0,
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            attributeHeaderItem: {
                                formattedName: "Q4 1906",
                                name: "1906-4",
                                normalizedValue: expect.anything(),
                                uri: "1906-4",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                formattedName: "Q1 1910",
                                name: "1910-1",
                                normalizedValue: expect.anything(),
                                uri: "1910-1",
                            },
                        },
                    ],
                ],
            ],
            offset: [0, 0],
            total: [1, 2],
        });
    });

    it("should correctly link total items with measure items with order property", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensionsWithTotals,
            defaultDateFormatter,
            mockResult.grandTotals,
        );
        const actual = transformExecutionResult(mockResultWithTotals, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });
});
