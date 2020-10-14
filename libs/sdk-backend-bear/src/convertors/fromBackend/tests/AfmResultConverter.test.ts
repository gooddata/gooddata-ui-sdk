// (C) 2019-2020 GoodData Corporation
import { createDefaultDateFormatter } from "../../dateFormatting/defaultDateFormatter";
import { DateFormatter } from "../../dateFormatting/types";
import { transformHeaderItems } from "../afm/result";
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
            const dateFormatter: DateFormatter = createDefaultDateFormatter(dateFormat);
            expect(transformHeaderItems(dateFormatter, dimensionHeaders)).toEqual(expectedResult);
        },
    );
});
