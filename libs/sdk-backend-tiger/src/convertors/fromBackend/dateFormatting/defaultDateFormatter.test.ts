// (C) 2020-2026 GoodData Corporation

import { tz } from "@date-fns/tz";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultDateFormatter } from "./defaultDateFormatter.js";

describe("createDefaultDateFormatter localization", () => {
    // the formatted dates are floating: their UTC fields are formatted
    const DATE = new Date(Date.UTC(2020, 10, 15));

    it("should support different locales", () => {
        const actual = defaultDateFormatter(DATE, "GDC.time.month_in_year", "es-ES");
        expect(actual).toBe("nov");
    });

    it("should use provided format pattern", () => {
        const actual = defaultDateFormatter(DATE, "GDC.time.month_in_year", "en-US", "LLLLLL");
        expect(actual).toBe("November");
    });

    it("should fallback to 'en-US' when invalid locale is provided and preserve the formatting pattern", () => {
        const actual = defaultDateFormatter(
            DATE,
            "GDC.time.month_in_year",
            "surely this is not a locale" as any,
            "LLLLLL",
        );
        expect(actual).toBe("November");
    });

    it("should throw when invalid granularity is provided and no pattern is present", () => {
        expect(() => defaultDateFormatter(DATE, "surely this is not a granularity" as any)).toThrow();
    });

    it("should throw when invalid pattern is provided", () => {
        expect(() =>
            defaultDateFormatter(
                DATE,
                "GDC.time.date",
                "en-US",
                "surely this is not a valid formatting pattern",
            ),
        ).toThrow();
    });

    it("should use default locale and pattern", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.month_in_year");
        expect(formatter).toBe("Nov");
    });

    it("should use default format pattern for given locale", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.quarter_in_year", "fr-FR");
        expect(formatter).toBe("4ème trim.");
    });

    it("should render the timezone tokens of backend patterns with the backend timezone", () => {
        // The backend computed the wall-clock 14:30 in US/Pacific already, so the fields are kept and only
        // the timezone token renders the (named) timezone, not a GMT offset.
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));

        const minuteResult = defaultDateFormatter(
            testDate,
            "GDC.time.minute",
            "en-US-x-24h",
            "MM/dd/y, HH:mm z",
            "US/Pacific",
        );
        expect(minuteResult).toBe("01/05/2025, 14:30 PST");

        const hourResult = defaultDateFormatter(
            testDate,
            "GDC.time.hour",
            "en-US-x-24h",
            "MM/dd/y, HH z",
            "US/Pacific",
        );
        expect(hourResult).toBe("01/05/2025, 14 PST");
    });

    it("should render the timezone tokens for every locale", () => {
        const testDate = new Date(Date.UTC(2025, 7, 5, 14, 30, 0));

        expect(
            defaultDateFormatter(testDate, "GDC.time.minute", "en-US", "MM/dd/y, HH:mm zzzz", "US/Pacific"),
        ).toBe("08/05/2025, 14:30 Pacific Daylight Time");
        expect(
            defaultDateFormatter(testDate, "GDC.time.minute", "de-DE", "dd.MM.y, HH:mm O", "US/Pacific"),
        ).toBe("05.08.2025, 14:30 GMT-7");
    });

    it("should render the timezone of the long localized time patterns", () => {
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));

        expect(defaultDateFormatter(testDate, "GDC.time.second", "en-US", "ppp", "US/Pacific")).toBe(
            defaultDateFormatter(testDate, "GDC.time.second", "en-US", "h:mm:ss a z", "US/Pacific"),
        );
        expect(defaultDateFormatter(testDate, "GDC.time.second", "en-US", "pppp", "US/Pacific")).toBe(
            defaultDateFormatter(testDate, "GDC.time.second", "en-US", "h:mm:ss a zzzz", "US/Pacific"),
        );
        expect(defaultDateFormatter(testDate, "GDC.time.second", "en-US", "ppp", "US/Pacific")).toBe(
            "2:30:00 PM PST",
        );
        expect(defaultDateFormatter(testDate, "GDC.time.second", "de-DE", "PPPPpppp", "US/Pacific")).toBe(
            "Sonntag, 5. Januar 2025 um 14:30:00 Nordamerikanische Westküsten-Normalzeit",
        );
        // the short localized patterns have no timezone and render the fields as they are
        expect(defaultDateFormatter(testDate, "GDC.time.minute", "en-US", "Pp", "US/Pacific")).toBe(
            "01/05/2025, 2:30 PM",
        );
        expect(defaultDateFormatter(testDate, "GDC.time.minute", "en-US", "'ppp' p", "US/Pacific")).toBe(
            "ppp 2:30 PM",
        );
    });

    it("should expand the localized patterns the same way date-fns does", () => {
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));
        const formatOptions = { in: tz("UTC"), locale: enUS };

        // widths beyond 4 fall back to the full width
        for (const pattern of ["PPPPP", "PPPPPpp", "P pp", "'P' PP"]) {
            expect(defaultDateFormatter(testDate, "GDC.time.minute", "en-US", pattern)).toBe(
                format(testDate, pattern, formatOptions),
            );
        }
    });

    it("should show no timezone when the value has none", () => {
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));

        // the value is a wall-clock of a timezone that is not known, naming any (UTC, browser) would be wrong
        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "h a z")).toBe("2 PM");
        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "h a (zzzz)")).toBe("2 PM ()");
        expect(defaultDateFormatter(testDate, "GDC.time.second", "en-US", "ppp")).toBe("2:30:00 PM");
        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "h a 'z'")).toBe("2 PM z");
        // the quoted literals stay whole, only the tokens outside of them are stripped
        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "'zone' h a z")).toBe("zone 2 PM");
        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "h a 'GMT' O")).toBe("2 PM GMT");
    });

    it("should show no timezone when the browser does not know the timezone of the value", () => {
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));

        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "h a z", "Not/AZone")).toBe("2 PM");
        expect(defaultDateFormatter(testDate, "GDC.time.hour", "en-US", "h a O", "Not/AZone")).toBe("2 PM");
    });

    it("should not treat quoted timezone letters as timezone tokens", () => {
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));

        expect(
            defaultDateFormatter(testDate, "GDC.time.minute", "en-US", "HH:mm 'z' 'o''clock'", "US/Pacific"),
        ).toBe("14:30 z o'clock");
    });

    it("should support week year and day of year tokens with a timezone", () => {
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0));

        const actual = defaultDateFormatter(
            testDate,
            "GDC.time.minute",
            "en-US-x-24h",
            "dd.MM.YYYY (D) HH:mm z",
            "US/Pacific",
        );

        expect(actual).toBe("05.01.2025 (5) 14:30 PST");
    });

    it("should use provided format pattern for given locale", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.quarter_in_year", "fr-FR", "'T'Q y");
        expect(formatter).toBe("T4 2020");
    });
});

// The browser timezone must not influence the fields nor the rendered backend timezone. Node applies a change
// of process.env.TZ immediately, so each timezone is stubbed per test.
describe.each([
    ["UTC", 0],
    ["Europe/Prague", -60],
    ["America/New_York", 300],
])("defaultDateFormatter in the %s browser timezone", (browserTimeZone, timeZoneOffset) => {
    beforeEach(() => {
        vi.stubEnv("TZ", browserTimeZone);
    });

    it("should run in the browser timezone", () => {
        // guards that the stubbed TZ takes effect, which is what makes the other tests meaningful
        expect(new Date(2026, 0, 15).getTimezoneOffset()).toBe(timeZoneOffset);
    });

    it("should format the UTC fields of a native Date and render the backend timezone", () => {
        // 2026-03-29 02:30 does not exist in Europe/Prague and 2026-03-08 02:30 not in America/New_York
        const pragueGap = new Date(Date.UTC(2026, 2, 29, 2, 30));
        const newYorkGap = new Date(Date.UTC(2026, 2, 8, 2, 30));

        expect(defaultDateFormatter(pragueGap, "GDC.time.minute", "en-US", "dd.MM.yyyy HH:mm")).toBe(
            "29.03.2026 02:30",
        );
        expect(
            defaultDateFormatter(
                pragueGap,
                "GDC.time.minute",
                "en-US",
                "dd.MM.yyyy HH:mm z",
                "America/New_York",
            ),
        ).toBe("29.03.2026 02:30 EDT");
        expect(
            defaultDateFormatter(
                newYorkGap,
                "GDC.time.minute",
                "en-US",
                "dd.MM.yyyy HH:mm z",
                "Europe/Prague",
            ),
        ).toBe("08.03.2026 02:30 GMT+1"); // the en-US short name of CET
        // the value in the gap of the backend timezone itself keeps its fields, the offset name may be either
        expect(
            defaultDateFormatter(
                newYorkGap,
                "GDC.time.minute",
                "en-US",
                "dd.MM.yyyy HH:mm z",
                "America/New_York",
            ),
        ).toMatch(/^08\.03\.2026 02:30 E[SD]T$/);
    });
});
