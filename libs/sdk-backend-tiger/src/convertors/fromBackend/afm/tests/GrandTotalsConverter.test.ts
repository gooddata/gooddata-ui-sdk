// (C) 2022-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { ExecutionResult } from "@gooddata/api-client-tiger";
import { IDimensionDescriptor, IExecutionDefinition } from "@gooddata/sdk-model";

import {
    mockDefinition1,
    mockDefinition2,
    mockDefinition3,
    mockDimensions1,
    mockDimensions2,
    mockDimensions3,
    mockResult1,
    mockResult2,
    mockResult3,
} from "./GrandTotalsConverter.fixture.js";
import { defaultDateFormatter } from "../../dateFormatting/defaultDateFormatter.js";
import { getTransformDimensionHeaders } from "../DimensionHeaderConverter.js";
import { transformGrandTotalData } from "../GrandTotalsConverter.js";

describe("transformGrandTotalData", () => {
    const Scenarios: Array<[string, IExecutionDefinition, ExecutionResult, IDimensionDescriptor[]]> = [
        ["grand total data", mockDefinition1, mockResult1, mockDimensions1],
        ["grand total data with two header groups", mockDefinition2, mockResult2, mockDimensions2],
        ["grand total data with row and column grand totals", mockDefinition3, mockResult3, mockDimensions3],
    ];
    it.each(Scenarios)("should correctly transform %s", (_desc, def, result, dims) => {
        const transformDimensionHeaders = getTransformDimensionHeaders(
            dims,
            defaultDateFormatter,
            result.grandTotals,
        );
        const dataHeaderItems = transformDimensionHeaders(result.dimensionHeaders);
        expect(
            transformGrandTotalData(result.grandTotals, def, dataHeaderItems, transformDimensionHeaders),
        ).toMatchSnapshot();
    });
});
