// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    type PeriodLiteralGranularity,
    type WireAbsoluteGranularity,
    fromPeriodLiteral,
    hasPeriodLiteral,
    isWireAbsoluteGranularity,
    toPeriodLiteral,
    toWholePeriodLiterals,
} from "./absoluteGranularityLiterals.js";

// The literal formats the execution API accepts for each granularity.
const WIRE_PATTERNS: Record<WireAbsoluteGranularity, RegExp> = {
    "GDC.time.date": /^\d{4}-\d{2}-\d{2}$/,
    "GDC.time.month": /^\d{4}-(0[1-9]|1[0-2])$/,
    "GDC.time.quarter": /^\d{4}-[1-4]$/,
    "GDC.time.year": /^\d{4}$/,
};

describe("isWireAbsoluteGranularity", () => {
    it.each([
        ["GDC.time.date", true],
        ["GDC.time.month", true],
        ["GDC.time.quarter", true],
        ["GDC.time.year", true],
        ["GDC.time.week_us", false],
        ["GDC.time.week", false],
        ["GDC.time.fiscal_month", false],
        ["GDC.time.month_in_year", false],
        [undefined, false],
    ] as const)("tells that %s has a wire literal: %s", (granularity, expected) => {
        expect(isWireAbsoluteGranularity(granularity)).toBe(expected);
    });
});

describe("hasPeriodLiteral", () => {
    it.each([
        ["GDC.time.month", true],
        ["GDC.time.quarter", true],
        ["GDC.time.year", true],
        ["GDC.time.date", false],
        ["GDC.time.week_us", false],
        ["GDC.time.week", false],
        ["GDC.time.hour", false],
        ["GDC.time.fiscal_month", false],
        [undefined, false],
    ] as const)("tells that %s has a period literal: %s", (granularity, expected) => {
        expect(hasPeriodLiteral(granularity)).toBe(expected);
    });
});

describe("toPeriodLiteral", () => {
    it.each([
        ["GDC.time.date", "2026-03-15", "2026-03-15"],
        ["GDC.time.month", "2026-03-15", "2026-03"],
        ["GDC.time.month", "2026-12-31", "2026-12"],
        ["GDC.time.quarter", "2026-01-01", "2026-1"],
        ["GDC.time.quarter", "2026-03-31", "2026-1"],
        ["GDC.time.quarter", "2026-04-01", "2026-2"],
        ["GDC.time.quarter", "2026-10-31", "2026-4"],
        ["GDC.time.year", "2026-07-04", "2026"],
    ] as [WireAbsoluteGranularity, string, string][])(
        "converts %s %s to %s",
        (granularity, day, expected) => {
            const literal = toPeriodLiteral(granularity, day);

            expect(literal).toBe(expected);
            expect(literal).toMatch(WIRE_PATTERNS[granularity]);
        },
    );
});

describe("fromPeriodLiteral", () => {
    it.each([
        ["GDC.time.date", "2026-03-15", "2026-03-15", "2026-03-15"],
        ["GDC.time.month", "2026-03", "2026-03-01", "2026-03-31"],
        ["GDC.time.month", "2026-04", "2026-04-01", "2026-04-30"],
        ["GDC.time.month", "2026-12", "2026-12-01", "2026-12-31"],
        ["GDC.time.month", "2026-02", "2026-02-01", "2026-02-28"],
        ["GDC.time.month", "2028-02", "2028-02-01", "2028-02-29"],
        ["GDC.time.quarter", "2026-1", "2026-01-01", "2026-03-31"],
        ["GDC.time.quarter", "2026-2", "2026-04-01", "2026-06-30"],
        ["GDC.time.quarter", "2026-4", "2026-10-01", "2026-12-31"],
        ["GDC.time.year", "2026", "2026-01-01", "2026-12-31"],
    ] as [WireAbsoluteGranularity, string, string, string][])(
        "expands %s %s to %s - %s",
        (granularity, literal, first, last) => {
            expect(fromPeriodLiteral(granularity, literal)).toEqual({ first, last });
        },
    );

    it.each([
        ["GDC.time.month", "abc"],
        ["GDC.time.month", "2026-13"],
        ["GDC.time.quarter", "2026-5"],
        ["GDC.time.quarter", "2026-01"],
        ["GDC.time.year", "2026-01"],
        ["GDC.time.date", "2026-01"],
    ] as [WireAbsoluteGranularity, string][])("throws for %s literal %s", (granularity, literal) => {
        expect(() => fromPeriodLiteral(granularity, literal)).toThrow();
    });
});

describe("round trip", () => {
    it.each([
        ["GDC.time.date", "2026-03-15", "2026-03-15"],
        ["GDC.time.month", "2026-03-01", "2026-04-30"],
        ["GDC.time.quarter", "2026-01-01", "2026-12-31"],
        ["GDC.time.year", "2024-01-01", "2026-12-31"],
    ] as [WireAbsoluteGranularity, string, string][])(
        "keeps the %s range %s - %s",
        (granularity, from, to) => {
            expect(fromPeriodLiteral(granularity, toPeriodLiteral(granularity, from)).first).toBe(from);
            expect(fromPeriodLiteral(granularity, toPeriodLiteral(granularity, to)).last).toBe(to);
        },
    );
});

describe("time zones", () => {
    it.each(["America/Santiago", "Pacific/Kiritimati"])("computes the same literals under %s", (timezone) => {
        vi.stubEnv("TZ", timezone);

        expect(fromPeriodLiteral("GDC.time.month", "2026-09")).toEqual({
            first: "2026-09-01",
            last: "2026-09-30",
        });
    });
});

describe("toWholePeriodLiterals", () => {
    it.each([
        ["GDC.time.month", "2026-03-01", "2026-04-30", "2026-03", "2026-04"],
        ["GDC.time.quarter", "2026-04-01", "2026-06-30", "2026-2", "2026-2"],
        ["GDC.time.quarter", "2026-01-01", "2026-06-30", "2026-1", "2026-2"],
        ["GDC.time.year", "2025-01-01", "2025-12-31", "2025", "2025"],
    ] as [PeriodLiteralGranularity, string, string, string, string][])(
        "encodes %s %s - %s as %s - %s",
        (granularity, from, to, fromLiteral, toLiteral) => {
            expect(toWholePeriodLiterals(granularity, from, to)).toEqual({
                from: fromLiteral,
                to: toLiteral,
            });
        },
    );

    it.each([
        ["GDC.time.month", "2026-03-10", "2026-04-20"],
        ["GDC.time.month", "2026-03-01", "2026-04-10"],
        ["GDC.time.month", "2026-03-15", "2026-04-30"],
        ["GDC.time.month", "2026-05-01", "2026-04-30"],
        ["GDC.time.quarter", "2026-01-01", "2026-05-31"],
        ["GDC.time.year", "2026-01-01", "2026-11-30"],
    ] as [PeriodLiteralGranularity, string, string][])(
        "returns no literals for %s %s - %s that is not whole periods",
        (granularity, from, to) => {
            expect(toWholePeriodLiterals(granularity, from, to)).toBeUndefined();
        },
    );

    it.each([
        ["abc", "2026-04-30"],
        ["2026-3-1", "2026-4-30"],
        ["2026-03-01 08:00", "2026-04-30 12:00"],
        ["2026-03-01 00:00", "2026-04-30 23:59"],
        ["2026-03-01T00:00:00.000Z", "2026-04-30T23:59:59.999Z"],
    ])("returns no literals for %s - %s that are not days in the YYYY-MM-DD format", (from, to) => {
        expect(toWholePeriodLiterals("GDC.time.month", from, to)).toBeUndefined();
    });
});
