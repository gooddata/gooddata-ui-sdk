// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IFilter, newAllTimeFilter, newRelativeDateFilter } from "@gooddata/sdk-model";

import { isAllTimeDateFilterFixed, isNoopAllTimeDateFilterFixed } from "../utils.js";

describe("automationFilters/utils", () => {
    describe("isAllTimeDateFilterFixed", () => {
        it("should return true for standard all-time date filter", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df");

            expect(isAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should return true for standard all-time date filter with emptyValueHandling", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df", "exclude");

            expect(isAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should treat AD-style relative filter without from/to as all-time", () => {
            const adAllTimeShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                },
            };
            const adAllTimeShapeWithConfig = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                    emptyValueHandling: "include",
                },
            };

            expect(isAllTimeDateFilterFixed(adAllTimeShape as IFilter)).toBe(true);
            expect(isAllTimeDateFilterFixed(adAllTimeShapeWithConfig as IFilter)).toBe(true);
        });

        it("should return false for non-all-time relative date filter", () => {
            const filter = newRelativeDateFilter({ identifier: "ds" }, "GDC.time.date", -1, 0, "df");

            expect(isAllTimeDateFilterFixed(filter)).toBe(false);
        });
    });

    describe("isNoopAllTimeDateFilterFixed", () => {
        it("should return true for standard noop all-time date filter", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df");

            expect(isNoopAllTimeDateFilterFixed(filter)).toBe(true);
        });

        it("should return false for all-time date filter with emptyValueHandling", () => {
            const filter = newAllTimeFilter({ identifier: "ds" }, "df", "exclude");

            expect(isNoopAllTimeDateFilterFixed(filter)).toBe(false);
        });

        it("should treat AD-style relative filter without from/to as noop only when emptyValueHandling is missing", () => {
            const noopAdShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                },
            };
            const configuredAdShape = {
                relativeDateFilter: {
                    dataSet: { identifier: "ds" },
                    granularity: "GDC.time.date",
                    localIdentifier: "df",
                    emptyValueHandling: "include",
                },
            };

            expect(isNoopAllTimeDateFilterFixed(noopAdShape as IFilter)).toBe(true);
            expect(isNoopAllTimeDateFilterFixed(configuredAdShape as IFilter)).toBe(false);
        });
    });
});
