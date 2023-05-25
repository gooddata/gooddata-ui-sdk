// (C) 2020-2022 GoodData Corporation
import { transformExecutionResult } from "../result";
import { defaultDateFormatter } from "../../dateFormatting/defaultDateFormatter";
import {
    mockResult,
    mockDimensions,
    mockDimensionsWithDateFormat,
    mockResultWithTotals,
    mockDimensionsWithTotals,
} from "./result.fixture";
import { getTransformDimensionHeaders } from "../DimensionHeaderConverter";

describe("transformExecutionResult", () => {
    it("should format date dimensions values", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(mockDimensions, defaultDateFormatter);
        const actual = transformExecutionResult(mockResult, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });

    it("should format date dimensions values with date format information", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensionsWithDateFormat,
            defaultDateFormatter,
        );
        const actual = transformExecutionResult(mockResult, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });

    it("should correctly link total items with measure items with order property", () => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            mockDimensionsWithTotals,
            defaultDateFormatter,
        );
        const actual = transformExecutionResult(mockResultWithTotals, transformDimensionHeaders);
        expect(actual).toMatchSnapshot();
    });
});
