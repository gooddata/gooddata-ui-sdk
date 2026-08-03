// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { createDateValueFormatter } from "../dateValueFormatter.js";
import { type FormattingLocale, defaultDateFormatter } from "../defaultDateFormatter.js";

describe("createDateValueFormatter", () => {
    const defaultDateValueFormatter = createDateValueFormatter(defaultDateFormatter);

    type Scenario = [string, DateAttributeGranularity, string];
    const scenarios: Scenario[] = [
        ["2020-01-31 20:31:59", "GDC.time.second", "1/31/2020, 8:31:59 PM"],
        // minute-of-day / second-of-day: elapsed time since midnight, rendered as a clock time (the running
        // index is decomposed into HH:mm[:ss] before formatting)
        ["45000", "GDC.time.second_in_day", "12:30:00 PM"],
        ["0", "GDC.time.second_in_day", "12:00:00 AM"],
        ["1439", "GDC.time.minute_in_day", "11:59 PM"],
        ["0075", "GDC.time.minute_in_day", "1:15 AM"],
        ["2020-01-31 20:31", "GDC.time.minute", "1/31/2020, 8:31 PM"],
        ["55", "GDC.time.minute_in_hour", "55"],
        // second_in_minute mirrors minute_in_hour: date-fns `s` token, leading zeros stripped
        ["45", "GDC.time.second_in_minute", "45"],
        ["05", "GDC.time.second_in_minute", "5"],
        // Inclusive upper-bound / leap values the backend can send exceed the date field range and cannot be
        // represented as a Date — they must fall back to the raw value instead of throwing.
        ["60", "GDC.time.second_in_minute", "60"],
        ["1440", "GDC.time.minute_in_day", "1440"],
        ["86400", "GDC.time.second_in_day", "86400"],
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
