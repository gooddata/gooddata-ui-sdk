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
