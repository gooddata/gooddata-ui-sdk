// (C) 2024-2026 GoodData Corporation

import { invariant } from "ts-invariant";
import { describe, expect, it, vi } from "vitest";

import { type JsonApiAttributeOutAttributesGranularityEnum } from "@gooddata/api-client-tiger";

import { isSupportedTigerGranularity, toSdkGranularity } from "./dateGranularityConversions.js";

describe("dateGranularityConversions", () => {
    describe("toSdkGranularity", () => {
        it.each([
            ["YEAR", "GDC.time.year"],
            ["MINUTE", "GDC.time.minute"],
            ["SECOND", "GDC.time.second"],
            ["SECOND_OF_MINUTE", "GDC.time.second_in_minute"],
            ["MINUTE_OF_DAY", "GDC.time.minute_in_day"],
            ["FISCAL_MONTH", "GDC.time.fiscal_month"],
        ] as [JsonApiAttributeOutAttributesGranularityEnum, string][])(
            "maps supported tiger granularity %s to %s",
            (tiger, sdk) => {
                expect(toSdkGranularity(tiger)).toBe(sdk);
            },
        );

        // An unmapped granularity never throws — it degrades to the neutral fallback and warns. Covers an
        // explicitly-unsupported one (extended fiscal calendar) and a value absent from the generated enum.
        // The warning is spied so it does not print to stderr during the run.
        it.each(["FISCAL_WEEK", "SOME_FUTURE_BE_GRANULARITY"])(
            "falls back to GDC.time.date (and warns) for unsupported granularity %s",
            (g) => {
                const warnSpy = vi.spyOn(invariant, "warn").mockImplementation(() => undefined);
                expect(toSdkGranularity(g as JsonApiAttributeOutAttributesGranularityEnum)).toBe(
                    "GDC.time.date",
                );
                expect(warnSpy).toHaveBeenCalledTimes(1);
                warnSpy.mockRestore();
            },
        );
    });

    describe("isSupportedTigerGranularity", () => {
        it.each(["YEAR", "SECOND", "SECOND_OF_MINUTE", "MINUTE_OF_DAY"])("is true for %s", (g) => {
            expect(isSupportedTigerGranularity(g as JsonApiAttributeOutAttributesGranularityEnum)).toBe(true);
        });

        it.each(["FISCAL_WEEK", "FISCAL_SEMESTER_OF_FISCAL_YEAR", "SOME_FUTURE_BE_GRANULARITY"])(
            "is false for %s",
            (g) => {
                expect(isSupportedTigerGranularity(g as JsonApiAttributeOutAttributesGranularityEnum)).toBe(
                    false,
                );
            },
        );
    });
});
