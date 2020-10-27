// (C) 2020 GoodData Corporation
import { transformResultHeaders } from "@gooddata/sdk-backend-base";
import { findDateAttributeUri } from "../../dateFormatting/dateFormatter";
import { createResultHeaderTransformer } from "../afm/result";
import {
    dimensionHeaders,
    dimensions,
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

    it("should get the date attribute uri if it exists", () => {
        expect(findDateAttributeUri(dimensions)).toEqual("/gdc/md/projectId/obj/272");
    });

    it.each(Scenarios)(
        "should apply format %s to all dates in an AFM execution result",
        (dateFormat, expectedResult) => {
            expect(
                transformResultHeaders(
                    dimensionHeaders,
                    createResultHeaderTransformer(findDateAttributeUri(dimensions)),
                    {
                        dateFormat,
                    },
                ),
            ).toEqual(expectedResult);
        },
    );
});
