// (C) 2020-2022 GoodData Corporation
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { createDateValueFormatter } from "../dateValueFormatter";
import { defaultDateFormatter, FormattingLocale } from "../defaultDateFormatter";

describe("createDateValueFormatter", () => {
    const defaultDateValueFormatter = createDateValueFormatter(defaultDateFormatter);

    type Scenario = [string, DateAttributeGranularity, string];
    const scenarios: Scenario[] = [
        ["2020-01-31 20:31", "GDC.time.minute", "1/31/2020, 8:31 PM"],
        ["55", "GDC.time.minute_in_hour", "55"],
        ["2020-01-31 19", "GDC.time.hour", "1/31/2020, 7 PM"],
        ["13", "GDC.time.hour_in_day", "1 PM"],
        ["2020-01-31", "GDC.time.date", "1/31/2020"],
        ["00", "GDC.time.day_in_week", "Sun"],
        ["01", "GDC.time.day_in_week", "Mon"],
        ["01", "GDC.time.day_in_month", "1"],
        ["005", "GDC.time.day_in_year", "5"],
        ["2020-05", "GDC.time.week_us", "5/2020"],
        ["05", "GDC.time.week_in_year", "5"],
        ["2020-06", "GDC.time.month", "Jun 2020"],
        ["06", "GDC.time.month_in_year", "Jun"],
        ["2020-2", "GDC.time.quarter", "Q2 2020"],
        ["02", "GDC.time.quarter_in_year", "Q2"],
        ["2020", "GDC.time.year", "2020"],
    ];

    it.each(scenarios)("should format (%s, %s) as %s", (value, granularity, expected) => {
        const actual = defaultDateValueFormatter(value, granularity);
        expect(actual).toBe(expected);
    });

    type LocalizedScenario = [string, DateAttributeGranularity, FormattingLocale, string];
    const localizedScenarios: LocalizedScenario[] = [
        ["1", "GDC.time.day_in_week", "de-DE", "Mo."],
        ["0", "GDC.time.day_in_week", "de-DE", "So."],
        ["5", "GDC.time.day_in_year", "de-DE", "5"],
        ["2020-06", "GDC.time.month", "de-DE", "Juni 2020"],
        ["6", "GDC.time.month_in_year", "de-DE", "Jun"],
        ["2", "GDC.time.quarter_in_year", "de-DE", "Q2"],
        ["2020-05", "GDC.time.week_us", "de-DE", "5/2020"],
        ["5", "GDC.time.week_in_year", "de-DE", "5"],
    ];
    it.each(localizedScenarios)(
        `should format (%s, %s, %s) as %s`,
        (value, granularity, locale, expected) => {
            const actual = defaultDateValueFormatter(value, granularity, locale);
            expect(actual).toBe(expected);
        },
    );
});
