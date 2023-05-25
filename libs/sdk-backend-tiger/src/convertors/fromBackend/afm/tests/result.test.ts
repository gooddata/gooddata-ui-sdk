// (C) 2020-2022 GoodData Corporation
import { transformExecutionResult } from "../result.js";
import { defaultDateFormatter } from "../../dateFormatting/defaultDateFormatter.js";
import {
    mockResult,
    mockDimensions,
    mockDimensionsWithDateFormat,
    mockResultWithTotals,
    mockDimensionsWithTotals,
} from "./result.fixture.js";
import { getTransformDimensionHeaders } from "../DimensionHeaderConverter.js";
import { describe, expect, it } from "vitest";

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
        expect(actual).toMatchSnapshot();
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
