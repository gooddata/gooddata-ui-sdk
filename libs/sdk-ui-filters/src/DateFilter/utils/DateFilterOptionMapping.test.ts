// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IDashboardDateFilter, type IRelativeDateFilterPresetOfGranularity } from "@gooddata/sdk-model";

import { type IDateFilterOptionsByType, type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";

import {
    flattenDateFilterOptions,
    matchDateFilterToDateFilterOptionWithPreference,
} from "./DateFilterOptionMapping.js";

// A static-only option set — what an embedding host (e.g. conditional formatting's date condition
// picker) passes before/without the workspace preset catalog.
const absoluteForm: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    name: "",
    visible: true,
    from: "2026-07-01",
    to: "2026-09-30",
};
const staticOnlyOptions: IDateFilterOptionsByType = { absoluteForm };

describe("flattenDateFilterOptions", () => {
    it("tolerates option sets without relativePreset (regression: crashed on Object.values(undefined))", () => {
        expect(flattenDateFilterOptions(staticOnlyOptions)).toEqual([absoluteForm]);
        expect(flattenDateFilterOptions({})).toEqual([]);
    });
});

describe("matchDateFilterToDateFilterOptionWithPreference", () => {
    it("matches a stored absolute filter against a static-only option set without throwing", () => {
        const stored: IDashboardDateFilter = {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.month",
                from: "2026-07-01",
                to: "2026-09-30",
            },
        };
        const { dateFilterOption, excludeCurrentPeriod } = matchDateFilterToDateFilterOptionWithPreference(
            stored,
            staticOnlyOptions,
            undefined,
        );
        expect(excludeCurrentPeriod).toBe(false);
        expect(dateFilterOption.type).toBe("absoluteForm");
        if (dateFilterOption.type === "absoluteForm") {
            expect(dateFilterOption.from).toBe("2026-07-01");
            expect(dateFilterOption.to).toBe("2026-09-30");
        }
    });
});

describe("matchDateFilterToDateFilterOption — exclude-current-period reverse matching", () => {
    const monthPreset = (
        localIdentifier: string,
        from: number,
        to: number,
    ): IRelativeDateFilterPresetOfGranularity<"GDC.time.month"> => ({
        from,
        to,
        granularity: "GDC.time.month",
        type: "relativePreset",
        name: `preset.${localIdentifier}`,
        localIdentifier,
        visible: true,
    });
    // "This month" ends in the current period; "Last 12 months" is a genuine exclude-current-period base.
    const optionsWithPresets: IDateFilterOptionsByType = {
        absoluteForm,
        relativePreset: {
            "GDC.time.month": [monthPreset("THIS_MONTH", 0, 0), monthPreset("LAST_12_MONTHS", -11, 0)],
        },
    };

    const storedRelative = (from: number, to: number): IDashboardDateFilter => ({
        dateFilter: { type: "relative", granularity: "GDC.time.month", from, to },
    });

    it("reconstructs a preset + excludeCurrentPeriod for a genuinely-excluded range", () => {
        // (-11, 0) excluding the current period persists as (-12, -1); it must match back to the preset.
        const { dateFilterOption, excludeCurrentPeriod } = matchDateFilterToDateFilterOptionWithPreference(
            storedRelative(-12, -1),
            optionsWithPresets,
            undefined,
        );
        expect(excludeCurrentPeriod).toBe(true);
        expect(dateFilterOption.localIdentifier).toBe("LAST_12_MONTHS");
    });

    it("does NOT force-match a plain 'previous period' range as current+exclude (regression)", () => {
        // (-1, -1) is "the previous month". The old reverse-match shifted ANY `to === -1` by +1 and
        // matched (0, 0), wrongly reporting THIS_MONTH + excludeCurrentPeriod. It is not an exclusion
        // output (forward exclusion never yields from === to), so it must not match that way now.
        const { dateFilterOption, excludeCurrentPeriod } = matchDateFilterToDateFilterOptionWithPreference(
            storedRelative(-1, -1),
            optionsWithPresets,
            undefined,
        );
        expect(excludeCurrentPeriod).toBe(false);
        expect(dateFilterOption.localIdentifier).not.toBe("THIS_MONTH");
    });
});
