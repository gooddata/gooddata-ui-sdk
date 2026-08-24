// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ISettings, resolveWeekStart } from "./index.js";

describe("resolveWeekStart", () => {
    it("defaults to Sunday when settings are missing", () => {
        const empty: ISettings = {};
        expect(resolveWeekStart(undefined)).toBe("Sunday");
        expect(resolveWeekStart(empty)).toBe("Sunday");
    });

    it("honors the weekStart setting when the Monday feature flags are not both set", () => {
        expect(resolveWeekStart({ weekStart: "Monday" })).toBe("Monday");
        expect(resolveWeekStart({ weekStart: "Sunday" })).toBe("Sunday");
    });

    it("forces Monday only when both feature flags are enabled", () => {
        // both flags → Monday, overriding weekStart
        expect(
            resolveWeekStart({
                enableNewUIWeekStartChange: true,
                weekStartOnMondayEnabled: true,
                weekStart: "Sunday",
            }),
        ).toBe("Monday");
        // only one flag → falls back to weekStart
        expect(
            resolveWeekStart({
                enableNewUIWeekStartChange: true,
                weekStartOnMondayEnabled: false,
                weekStart: "Sunday",
            }),
        ).toBe("Sunday");
    });
});
