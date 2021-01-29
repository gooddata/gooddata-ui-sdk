// (C) 2007-2021 GoodData Corporation
import { isMetricFormatInPercent } from "../format";

describe("isMetricFormatInPercent", () => {
    type Scenario = [string, boolean, string];

    const scenarios: Scenario[] = [
        ["empty format", false, ""],
        ["default format", false, "#,##0"],
        ["default format with semicolon", false, "#,##0;"],
        ["currency format", false, "$#,##0.00"],
        ["currency format with semicolon", false, "$#,##0.00;"],
        ["currency format with percent", true, "$#,##0.00%"],
        ["currency format with percent with semicolon", true, "$#,##0.00%;"],
        [
            "conditional format",
            false,
            `[=null]--;
             [<.3][red]#,##0.0%;
             [>.8][green]#,##0.0%;
             #,##0.0%'`,
        ],
    ];

    it.each(scenarios)("should recognize %s as %p", (_, expected, format) => {
        expect(isMetricFormatInPercent(format)).toBe(expected);
    });
});
