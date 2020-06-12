// (C) 2020 GoodData Corporation
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";
import { createDateValueFormatter } from "../dateValueFormatter";

describe("createDateValueFormatter", () => {
    const defaultDateValueFormatter = createDateValueFormatter();

    type Scenario = [string, CatalogDateAttributeGranularity, string];
    const scenarios: Scenario[] = [
        ["2020-01-31", "GDC.time.date", "01/31/2020"],
        ["1", "GDC.time.day_in_month", "01"],
        ["1", "GDC.time.day_in_week", "Monday"],
        ["0", "GDC.time.day_in_week", "Sunday"],
        ["5", "GDC.time.day_in_year", "5"],
        ["2020-06", "GDC.time.month", "Jun 2020"],
        ["6", "GDC.time.month_in_year", "Jun"],
        ["2020-2", "GDC.time.quarter", "Q2/2020"],
        ["2", "GDC.time.quarter_in_year", "Q2"],
        ["2020-05", "GDC.time.week_us", "W5/2020"],
        ["5", "GDC.time.week_in_year", "W5"],
        ["2020", "GDC.time.year", "2020"],
    ];

    it.each(scenarios)("should format (%s, %s) as %s", (value, granularity, expected) => {
        const actual = defaultDateValueFormatter(value, granularity);
        expect(actual).toBe(expected);
    });
});
