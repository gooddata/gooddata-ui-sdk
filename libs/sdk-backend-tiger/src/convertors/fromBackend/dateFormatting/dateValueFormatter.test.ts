// (C) 2020-2026 GoodData Corporation

import { invariant } from "ts-invariant";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { createDateValueFormatter, guardDateValueFormatter } from "./dateValueFormatter.js";
import { type FormattingLocale, defaultDateFormatter } from "./defaultDateFormatter.js";

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

// The browser timezone must not influence the values: the backend computed them in its own timezone.
// Node applies a change of process.env.TZ immediately, so each timezone is stubbed per test.
describe.each([
    ["UTC", 0],
    ["Europe/Prague", -60],
    ["America/New_York", 300],
])("createDateValueFormatter in the %s browser timezone", (browserTimeZone, timeZoneOffset) => {
    beforeEach(() => {
        vi.stubEnv("TZ", browserTimeZone);
    });

    it("should run in the browser timezone", () => {
        // guards that the stubbed TZ takes effect, which is what makes the other tests meaningful
        expect(new Date(2026, 0, 15).getTimezoneOffset()).toBe(timeZoneOffset);
    });

    const formatter = createDateValueFormatter(defaultDateFormatter);

    type Scenario = [string, DateAttributeGranularity, string, string];
    const scenarios: Scenario[] = [
        // 2026-03-29 02:30 does not exist in Europe/Prague (spring-forward gap)
        ["2026-03-29 02:30:00", "GDC.time.second", "dd.MM.yyyy HH:mm:ss", "29.03.2026 02:30:00"],
        ["2026-03-29 02:30", "GDC.time.minute", "dd.MM.yyyy HH:mm", "29.03.2026 02:30"],
        ["2026-03-29 02", "GDC.time.hour", "dd.MM.yyyy HH", "29.03.2026 02"],
        // 2026-03-08 02:30 does not exist in America/New_York
        ["2026-03-08 02:30:00", "GDC.time.second", "dd.MM.yyyy HH:mm:ss", "08.03.2026 02:30:00"],
        // 2026-10-25 02:30 exists twice in Europe/Prague, 2026-11-01 01:30 twice in America/New_York
        ["2026-10-25 02:30:00", "GDC.time.second", "dd.MM.yyyy HH:mm:ss", "25.10.2026 02:30:00"],
        ["2026-11-01 01:30:00", "GDC.time.second", "dd.MM.yyyy HH:mm:ss", "01.11.2026 01:30:00"],
        // the generic granularities are parsed in the context of 2020-01-01
        ["9000", "GDC.time.second_in_day", "HH:mm:ss", "02:30:00"],
        ["150", "GDC.time.minute_in_day", "HH:mm", "02:30"],
        ["2", "GDC.time.hour_in_day", "HH", "02"],
        ["2026-03-29", "GDC.time.date", "dd.MM.yyyy", "29.03.2026"],
    ];

    it.each(scenarios)("should format (%s, %s) by %s as %s", (value, granularity, pattern, expected) => {
        expect(formatter(value, granularity, "en-US", pattern)).toBe(expected);
        expect(formatter(value, granularity, "en-US-x-24h", pattern, "Europe/Prague")).toBe(expected);
        expect(formatter(value, granularity, "de-DE", pattern, "America/New_York")).toBe(expected);
    });

    it("should render the backend timezone in a value falling into the browser timezone gap", () => {
        expect(
            formatter("2026-03-29 02:30", "GDC.time.minute", "en-US-x-24h", "dd.MM.yyyy HH:mm z", "UTC"),
        ).toBe("29.03.2026 02:30 UTC");
        expect(
            formatter("2026-03-08 02:30", "GDC.time.minute", "en-US-x-24h", "HH:mm z", "Europe/Prague"),
        ).toBe("02:30 GMT+1");
        expect(
            formatter("2026-01-15 10:00", "GDC.time.minute", "en-US-x-24h", "HH:mm z", "America/New_York"),
        ).toBe("10:00 EST");
    });
});

describe("guardDateValueFormatter", () => {
    it("should format the values when the format can be applied", () => {
        const formatter = guardDateValueFormatter(createDateValueFormatter(defaultDateFormatter), "date.day");

        expect(formatter("2026-03-15", "GDC.time.date", "en-US", "dd.MM.yyyy")).toBe("15.03.2026");
    });

    it("should show the raw values and warn once when the format cannot be applied", () => {
        const warn = vi.spyOn(invariant, "warn").mockImplementation(() => {});
        const dateFormatter = vi.fn(() => {
            throw new Error("unsupported pattern");
        });
        const formatter = guardDateValueFormatter(createDateValueFormatter(dateFormatter), "date.day");

        expect(formatter("2026-03-15", "GDC.time.date", "en-US", "dd.MM.yyyy Z")).toBe("2026-03-15");
        expect(formatter("2026-03-16", "GDC.time.date", "en-US", "dd.MM.yyyy Z")).toBe("2026-03-16");
        expect(formatter(null, "GDC.time.date", "en-US", "dd.MM.yyyy Z")).toBe("");

        // the format fails the same way for every value, so it is not applied again
        expect(dateFormatter).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });
});
