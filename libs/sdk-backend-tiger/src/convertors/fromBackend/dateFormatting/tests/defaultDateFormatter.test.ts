// (C) 2020-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { defaultDateFormatter } from "../defaultDateFormatter.js";

describe("createDefaultDateFormatter localization", () => {
    const DATE = new Date(2020, 10, 15);

    it("should support different locales", () => {
        const actual = defaultDateFormatter(DATE, "GDC.time.month_in_year", "es-ES");
        expect(actual).toBe("nov");
    });

    it("should use provided format pattern", () => {
        const actual = defaultDateFormatter(DATE, "GDC.time.month_in_year", "en-US", "LLLLLL");
        expect(actual).toBe("November");
    });

    it("should fallback to 'en-US' when invalid locale is provided and not respect the formatting pattern", () => {
        const actual = defaultDateFormatter(
            DATE,
            "GDC.time.month_in_year",
            "surely this is not a locale" as any,
            "LLLLLL",
        );
        expect(actual).toBe("Nov");
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

    it("should support en-US-x-24h locale with backend-provided custom date patterns", () => {
        // Test with a specific date/time that validates all formatting requirements:
        // - Leading zeros for month/day (MM/dd not M/d)
        // - 24-hour format (HH not h)
        // - Timezone display (z)
        // - Afternoon time to distinguish from 12-hour format
        // Use UTC date to make test universal (not dependent on local timezone)
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0)); // January 5, 2025, 2:30 PM UTC

        // Test MINUTE granularity with timezone pattern (using hardcoded timezone for universal test)
        const minuteResult = defaultDateFormatter(
            testDate,
            "GDC.time.minute",
            "en-US-x-24h",
            "MM/dd/y, HH:mm z",
            "US/Pacific",
        );
        expect(minuteResult).toMatch(/^01\/05\/2025, 06:30 PST$/);

        // Test HOUR granularity with timezone pattern (using hardcoded timezone for universal test)
        const hourResult = defaultDateFormatter(
            testDate,
            "GDC.time.hour",
            "en-US-x-24h",
            "MM/dd/y, HH z",
            "US/Pacific",
        );
        expect(hourResult).toMatch(/^01\/05\/2025, 06 PST$/);
    });

    it("should use formatInTimeZone for en-US-x-24h locale with timezone parameter", () => {
        // Use UTC date to make test universal (not dependent on local timezone)
        const testDate = new Date(Date.UTC(2025, 0, 5, 14, 30, 0)); // January 5, 2025, 2:30 PM UTC

        // Test with timezone parameter to get proper timezone names
        const actual = defaultDateFormatter(
            testDate,
            "GDC.time.minute",
            "en-US-x-24h",
            "MM/dd/y, HH:mm z",
            "US/Pacific",
        );

        // Should show PST (Pacific Standard Time) instead of GMT offset
        // Note: The time will be converted to PST (UTC-8), so 14:30 becomes 06:30
        expect(actual).toMatch(/^01\/05\/2025, 06:30 PST$/);
    });

    it("should use provided format pattern for given locale", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.quarter_in_year", "fr-FR", "'T'Q y");
        expect(formatter).toBe("T4 2020");
    });
});
