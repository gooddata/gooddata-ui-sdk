// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DateAttributeGranularity } from "@gooddata/sdk-model";

import { createDateValueStringifier } from "./dateValueFormatter.js";
import { createDateValueNormalizer } from "./dateValueNormalizer.js";

// The normalized value carries the fields of the backend value in UTC and the stringifier turns it back
// into the backend value, whatever the browser timezone is. Node applies a change of process.env.TZ
// immediately, so each timezone is stubbed per test.
describe.each([
    ["UTC", 0],
    ["Europe/Prague", -60],
    ["America/New_York", 300],
])("date value normalization in the %s browser timezone", (browserTimeZone, timeZoneOffset) => {
    beforeEach(() => {
        vi.stubEnv("TZ", browserTimeZone);
    });

    it("should run in the browser timezone", () => {
        // guards that the stubbed TZ takes effect, which is what makes the other tests meaningful
        expect(new Date(2026, 0, 15).getTimezoneOffset()).toBe(timeZoneOffset);
    });

    const normalizer = createDateValueNormalizer();
    const stringifier = createDateValueStringifier();

    type Scenario = [string, DateAttributeGranularity, string];
    const scenarios: Scenario[] = [
        ["2026-01-15 10:00:00", "GDC.time.second", "2026-01-15T10:00:00.000Z"],
        // 2026-03-29 02:30 does not exist in Europe/Prague (spring-forward gap)
        ["2026-03-29 02:30:00", "GDC.time.second", "2026-03-29T02:30:00.000Z"],
        ["2026-03-29 02:30", "GDC.time.minute", "2026-03-29T02:30:00.000Z"],
        ["2026-03-29 02", "GDC.time.hour", "2026-03-29T02:00:00.000Z"],
        // 2026-03-08 02:30 does not exist in America/New_York
        ["2026-03-08 02:30:00", "GDC.time.second", "2026-03-08T02:30:00.000Z"],
        // 2026-10-25 02:30 exists twice in Europe/Prague, 2026-11-01 01:30 twice in America/New_York
        ["2026-10-25 02:30:00", "GDC.time.second", "2026-10-25T02:30:00.000Z"],
        ["2026-11-01 01:30:00", "GDC.time.second", "2026-11-01T01:30:00.000Z"],
        ["2026-03-29", "GDC.time.date", "2026-03-29T00:00:00.000Z"],
        ["2026-03", "GDC.time.month", "2026-03-01T00:00:00.000Z"],
        ["2026-1", "GDC.time.quarter", "2026-01-01T00:00:00.000Z"],
        ["2026", "GDC.time.year", "2026-01-01T00:00:00.000Z"],
    ];

    it.each(scenarios)("should normalize (%s, %s) to %s", (value, granularity, expected) => {
        expect(normalizer(value, granularity, "en-US")).toBe(expected);
        expect(normalizer(value, granularity, "en-US-x-24h", "Europe/Prague")).toBe(expected);
        expect(normalizer(value, granularity, "de-DE", "America/New_York")).toBe(expected);
    });

    it.each(scenarios)("should stringify the normalized (%s, %s) back", (value, granularity, normalized) => {
        expect(stringifier(new Date(normalized), granularity)).toBe(value);
        expect(stringifier(new Date(normalized), granularity, "en-US-x-24h", "Europe/Prague")).toBe(value);
    });

    it("should normalize the generic granularities in the context of 2020-01-01", () => {
        expect(normalizer("9000", "GDC.time.second_in_day")).toBe("2020-01-01T02:30:00.000Z");
        expect(normalizer("150", "GDC.time.minute_in_day")).toBe("2020-01-01T02:30:00.000Z");
    });

    it("should keep the values that are not representable as a date", () => {
        expect(normalizer("86400", "GDC.time.second_in_day")).toBe("86400");
        expect(normalizer(null, "GDC.time.second_in_day")).toBe("");
    });
});
