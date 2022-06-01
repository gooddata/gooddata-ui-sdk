// (C) 2022 GoodData Corporation
import { getTransformDimensionHeaders } from "../DimensionHeaderConverter";
import {
    mockDefinition1,
    mockDimensions1,
    mockResult1,
    mockDefinition2,
    mockDimensions2,
    mockResult2,
} from "./GrandTotalsConverter.fixture";
import { createDefaultDateFormatter } from "../../dateFormatting/defaultDateFormatter";
import { transformGrandTotalData } from "../GrandTotalsConverter";
import { ExecutionResult } from "@gooddata/api-client-tiger";
import { IDimensionDescriptor, IExecutionDefinition } from "@gooddata/sdk-model";

describe("transformGrandTotalData", () => {
    const Scenarios: Array<[string, IExecutionDefinition, ExecutionResult, IDimensionDescriptor[]]> = [
        ["grand total data", mockDefinition1, mockResult1, mockDimensions1],
        ["grand total data with two header groups", mockDefinition2, mockResult2, mockDimensions2],
    ];
    it.each(Scenarios)("should correctly transform %s", (_desc, def, result, dims) => {
        const transformDimensionHeaders = getTransformDimensionHeaders(dims, createDefaultDateFormatter());
        const dataHeaderItems = transformDimensionHeaders(mockResult1.dimensionHeaders);
        expect(
            transformGrandTotalData(result.grandTotals, def, dataHeaderItems, transformDimensionHeaders),
        ).toMatchSnapshot();
    });
});
