// (C) 2026 GoodData Corporation

// @vitest-environment node

import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import { type IDateRangeParameterPeriod, type WeekStart } from "@gooddata/sdk-model";

import { formatDateRangeParameterPeriod } from "./DateRangeParameterPeriod.js";

const messages = {
    "filters.staticPeriod.openEnd.title": "From {from}",
    "filters.staticPeriod.openStart.title": "To {to}",
};
const translator = createIntl({ locale: "en-US", messages });

describe("formatDateRangeParameterPeriod", () => {
    it.each<[string, IDateRangeParameterPeriod, string]>([
        ["years", { granularity: "GDC.time.year", from: "2025", to: "2026" }, "2025 – 2026"],
        ["quarters", { granularity: "GDC.time.quarter", from: "2025-3", to: "2026-2" }, "Q3 2025 – Q2 2026"],
        [
            "months",
            { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" },
            "August 2025 – August 2026",
        ],
        [
            "days",
            { granularity: "GDC.time.date", from: "2025-08-04", to: "2025-08-10" },
            "08/04/2025 – 08/10/2025",
        ],
        [
            "hours",
            { granularity: "GDC.time.hour", from: "2025-08-14 09", to: "2025-08-15 17" },
            "08/14/2025, 09:00 – 08/15/2025, 17:59",
        ],
        [
            "minutes",
            { granularity: "GDC.time.minute", from: "2025-08-14 09:30", to: "2025-08-15 17:45" },
            "08/14/2025, 09:30 – 08/15/2025, 17:45",
        ],
        [
            "seconds",
            { granularity: "GDC.time.second", from: "2025-08-14 09:00:00", to: "2025-08-15 09:00:30" },
            "08/14/2025, 09:00:00 – 08/15/2025, 09:00:30",
        ],
    ])("names a range of %s", (_name, period, expected) => {
        expect(formatDateRangeParameterPeriod(period, translator)).toBe(expected);
    });

    it.each<[WeekStart, string]>([
        ["Sunday", "08/10/2025 – 08/30/2025"],
        ["Monday", "08/11/2025 – 08/31/2025"],
    ])("names weeks by their days when a week starts on %s", (weekStart, expected) => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.week",
            from: "2025-33",
            to: "2025-35",
        };
        expect(formatDateRangeParameterPeriod(period, translator, undefined, weekStart)).toBe(expected);
    });

    it("starts weeks on Sunday by default", () => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.week",
            from: "2025-33",
            to: "2025-33",
        };
        expect(formatDateRangeParameterPeriod(period, translator)).toBe("08/10/2025 – 08/16/2025");
    });

    it.each<[string, IDateRangeParameterPeriod, string]>([
        [
            "hours",
            { granularity: "GDC.time.hour", from: "2025-08-14 09", to: "2025-08-14 17" },
            "08/14/2025, 09:00 – 17:59",
        ],
        [
            "minutes",
            { granularity: "GDC.time.minute", from: "2025-08-14 09:30", to: "2025-08-14 17:45" },
            "08/14/2025, 09:30 – 17:45",
        ],
        [
            "seconds",
            { granularity: "GDC.time.second", from: "2025-08-14 09:00:00", to: "2025-08-14 09:00:30" },
            "08/14/2025, 09:00:00 – 09:00:30",
        ],
    ])("writes the day once for a range of %s within one day", (_name, period, expected) => {
        expect(formatDateRangeParameterPeriod(period, translator)).toBe(expected);
    });

    it("writes only the day for minutes that cover the whole day", () => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.minute",
            from: "2025-08-14 00:00",
            to: "2025-08-14 23:59",
        };
        expect(formatDateRangeParameterPeriod(period, translator)).toBe("08/14/2025");
    });

    it.each<[string, IDateRangeParameterPeriod]>([
        ["hours", { granularity: "GDC.time.hour", from: "2025-08-14 00", to: "2025-08-14 23" }],
        [
            "seconds",
            { granularity: "GDC.time.second", from: "2025-08-14 00:00:00", to: "2025-08-14 23:59:59" },
        ],
    ])("writes only the day for %s that cover the whole day", (_name, period) => {
        expect(formatDateRangeParameterPeriod(period, translator)).toBe("08/14/2025");
    });

    it("writes the times of seconds that end before the last second of the day", () => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.second",
            from: "2025-08-14 00:00:00",
            to: "2025-08-14 23:59:00",
        };
        expect(formatDateRangeParameterPeriod(period, translator)).toBe("08/14/2025, 00:00:00 – 23:59:00");
    });

    it.each<[string, IDateRangeParameterPeriod, string]>([
        ["year", { granularity: "GDC.time.year", from: "2025", to: "2025" }, "2025"],
        ["quarter", { granularity: "GDC.time.quarter", from: "2025-3", to: "2025-3" }, "Q3 2025"],
        ["month", { granularity: "GDC.time.month", from: "2026-08", to: "2026-08" }, "August 2026"],
        ["day", { granularity: "GDC.time.date", from: "2025-08-14", to: "2025-08-14" }, "08/14/2025"],
        [
            "hour",
            { granularity: "GDC.time.hour", from: "2025-08-14 09", to: "2025-08-14 09" },
            "08/14/2025, 09:00",
        ],
    ])("names a period that starts and ends in the same %s once", (_name, period, expected) => {
        expect(formatDateRangeParameterPeriod(period, translator)).toBe(expected);
    });

    it.each<[string, IDateRangeParameterPeriod, string]>([
        ["month", { granularity: "GDC.time.month", from: "2025-08" }, "From August 2025"],
        ["quarter", { granularity: "GDC.time.quarter", from: "2025-3" }, "From Q3 2025"],
        ["hour", { granularity: "GDC.time.hour", from: "2025-08-14 09" }, "From 08/14/2025, 09:00"],
        ["week", { granularity: "GDC.time.week", from: "2025-33" }, "From 08/10/2025"],
    ])("names a %s period with no end by its start", (_name, period, expected) => {
        expect(formatDateRangeParameterPeriod(period, translator)).toBe(expected);
    });

    it.each<[string, IDateRangeParameterPeriod, string]>([
        ["month", { granularity: "GDC.time.month", to: "2026-08" }, "To August 2026"],
        ["year", { granularity: "GDC.time.year", to: "2026" }, "To 2026"],
        ["day", { granularity: "GDC.time.date", to: "2026-08-14" }, "To 08/14/2026"],
        ["hour", { granularity: "GDC.time.hour", to: "2025-08-14 17" }, "To 08/14/2025, 17:59"],
        ["week", { granularity: "GDC.time.week", to: "2025-35" }, "To 08/30/2025"],
    ])("names a %s period with no start by its end", (_name, period, expected) => {
        expect(formatDateRangeParameterPeriod(period, translator)).toBe(expected);
    });

    it("gives no name to a period with neither end", () => {
        expect(formatDateRangeParameterPeriod({ granularity: "GDC.time.month" }, translator)).toBeUndefined();
    });

    it("writes an end that is not a literal of the granularity as it is", () => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.month",
            from: "2025-8",
            to: "2026-08",
        };
        expect(formatDateRangeParameterPeriod(period, translator)).toBe("2025-8 – August 2026");
    });

    it("writes days in the given date format", () => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.hour",
            from: "2025-08-04 09",
            to: "2025-08-10 17",
        };
        expect(formatDateRangeParameterPeriod(period, translator, "dd.MM.yyyy")).toBe(
            "04.08.2025, 09:00 – 10.08.2025, 17:59",
        );
    });

    it("names months and quarters in the translator's locale", () => {
        const germanTranslator = createIntl({ locale: "de-DE", messages });
        expect(
            formatDateRangeParameterPeriod(
                { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" },
                germanTranslator,
            ),
        ).toBe("August 2025 – August 2026");
        expect(
            formatDateRangeParameterPeriod(
                { granularity: "GDC.time.quarter", from: "2025-3", to: "2026-2" },
                germanTranslator,
            ),
        ).toBe("Q3 2025 – Q2 2026");
    });

    it("names months in a day format in the translator's locale", () => {
        const germanTranslator = createIntl({ locale: "de-DE", messages });
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.date",
            from: "2025-03-14",
            to: "2025-03-14",
        };
        expect(formatDateRangeParameterPeriod(period, germanTranslator, "dd. MMMM yyyy")).toBe(
            "14. März 2025",
        );
    });

    // Meaningful where the local time zone skips 02:30 on that day, such as Europe/Prague.
    it("keeps the times of a range across the change to summer time", () => {
        const period: IDateRangeParameterPeriod = {
            granularity: "GDC.time.minute",
            from: "2026-03-29 02:30",
            to: "2026-03-29 03:30",
        };
        expect(formatDateRangeParameterPeriod(period, translator)).toBe("03/29/2026, 02:30 – 03:30");
    });
});
