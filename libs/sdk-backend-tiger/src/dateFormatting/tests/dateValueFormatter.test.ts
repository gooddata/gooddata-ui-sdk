// (C) 2020 GoodData Corporation
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";
import { defaultValueDateFormatter, createDateValueFormatter } from "../dateValueFormatter";

describe("defaultDateFormatter", () => {
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
        const actual = defaultValueDateFormatter(value, granularity);
        expect(actual).toBe(expected);
    });
});

describe("createDateFormatter localization", () => {
    it("should support different locales", () => {
        const formatter = createDateValueFormatter("es-ES");
        const actual = formatter("11", "GDC.time.month_in_year");
        expect(actual).toBe("nov");
    });

    it("should throw on invalid locale", () => {
        expect(() => createDateValueFormatter("surely this is not a locale")).toThrow();
    });
});
