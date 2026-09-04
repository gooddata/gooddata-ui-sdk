// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import {
    type IUiAbsoluteDateFilterFormLike,
    ensureCompatibleAbsoluteGranularity,
} from "./presetFilterUtils.js";

describe("ensureCompatibleAbsoluteGranularity", () => {
    const availableGranularities: DateFilterGranularity[] = [
        "GDC.time.date",
        "GDC.time.week_us",
        "GDC.time.month",
    ];

    it("is a no-op when availableGranularities is empty", () => {
        const filterOption: IUiAbsoluteDateFilterFormLike = { from: "2026-01-01", to: "2026-01-31" };
        expect(ensureCompatibleAbsoluteGranularity(filterOption, [])).toBe(filterOption);
    });

    it("is a no-op when the current granularity is already available", () => {
        const filterOption: IUiAbsoluteDateFilterFormLike = {
            granularity: "GDC.time.month",
            from: "2026-01-01",
            to: "2026-01-31",
        };
        expect(ensureCompatibleAbsoluteGranularity(filterOption, availableGranularities)).toBe(filterOption);
    });

    it("preserves from/to when granularity is absent (implicit Day) and Day is available", () => {
        const filterOption: IUiAbsoluteDateFilterFormLike = { from: "2026-01-01", to: "2026-01-31" };
        expect(ensureCompatibleAbsoluteGranularity(filterOption, availableGranularities)).toBe(filterOption);
    });

    it("resets granularity and clears from/to when granularity is absent and Day is not available", () => {
        const filterOption: IUiAbsoluteDateFilterFormLike = { from: "2026-01-01", to: "2026-01-31" };
        const result = ensureCompatibleAbsoluteGranularity(filterOption, ["GDC.time.month", "GDC.time.year"]);
        expect(result).toEqual({ granularity: "GDC.time.month", from: undefined, to: undefined });
    });

    it("resets to the first available granularity and clears from/to when the current one is unavailable", () => {
        const filterOption: IUiAbsoluteDateFilterFormLike = {
            granularity: "GDC.time.quarter",
            from: "2026-01-01",
            to: "2026-03-31",
        };
        const result = ensureCompatibleAbsoluteGranularity(filterOption, availableGranularities);
        expect(result).toEqual({ granularity: "GDC.time.date", from: undefined, to: undefined });
    });
});
