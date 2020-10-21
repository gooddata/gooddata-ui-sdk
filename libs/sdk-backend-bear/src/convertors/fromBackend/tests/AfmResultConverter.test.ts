// (C) 2020 GoodData Corporation
import { transformResultHeaders } from "@gooddata/sdk-backend-base";
import { transformResultHeader } from "../afm/result";
import {
    dimensionHeaders,
    transformedDimensionHeaders_DDMMYYYY_DashSeparated,
    transformedDimensionHeaders_DDMMYYYY_DotSeparated,
    transformedDimensionHeaders_DDMMYYYY_SlashSeparated,
    transformedDimensionHeaders_MDYY,
    transformedDimensionHeaders_YYYYMMDD,
} from "./AfmResultConverter.fixtures";

describe("AfmResultConverter", () => {
    const Scenarios: Array<[string, any]> = [
        ["MM/dd/yyyy", dimensionHeaders],
        ["dd/MM/yyyy", transformedDimensionHeaders_DDMMYYYY_SlashSeparated],
        ["dd-MM-yyyy", transformedDimensionHeaders_DDMMYYYY_DashSeparated],
        ["dd.MM.yyyy", transformedDimensionHeaders_DDMMYYYY_DotSeparated],
        ["yyyy-MM-dd", transformedDimensionHeaders_YYYYMMDD],
        ["M/d/yy", transformedDimensionHeaders_MDYY],
    ];

    it.each(Scenarios)(
        "should apply format %s to all dates in an AFM execution result",
        (dateFormat, expectedResult) => {
            expect(transformResultHeaders(dimensionHeaders, transformResultHeader, { dateFormat })).toEqual(
                expectedResult,
            );
        },
    );
});
