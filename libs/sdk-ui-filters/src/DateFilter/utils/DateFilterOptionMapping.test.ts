// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    type IDashboardDateFilter,
    type IRelativeDateFilterPresetOfGranularity,
    idRef,
    newDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { type IDateFilterOptionsByType, type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";

import {
    findDateFilterOptionByValue,
    flattenDateFilterOptions,
    matchDateFilterToDateFilterOption,
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
        expect(dateFilterOption).toMatchObject({ from: "2026-07-01", to: "2026-09-30" });
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

describe("matching the absolute date filter with granularity", () => {
    const storedPeriods = (
        filter: Partial<
            IDashboardAbsoluteGranularityDateFilter["dashboardAbsoluteGranularityDateFilter"]
        > = {},
    ): IDashboardAbsoluteGranularityDateFilter => ({
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.quarter",
            from: "2026-1",
            to: "2026-3",
            ...filter,
        },
    });

    it("maps whole periods to the visible absolute form", () => {
        expect(matchDateFilterToDateFilterOption(storedPeriods(), staticOnlyOptions)).toEqual({
            dateFilterOption: {
                localIdentifier: "ABSOLUTE_FORM",
                name: "",
                visible: true,
                type: "absoluteGranularityForm",
                granularity: "GDC.time.quarter",
                from: "2026-1",
                to: "2026-3",
            },
            excludeCurrentPeriod: false,
        });
    });

    it.each([
        ["GDC.time.week", "2026-53", "2027-01"],
        ["GDC.time.month", "2026-03", "2026-03"],
        ["GDC.time.quarter", "2025-4", "2026-1"],
        ["GDC.time.year", "2025", "2026"],
    ] as const)("keeps %s from %s to %s", (granularity, from, to) => {
        const { dateFilterOption } = matchDateFilterToDateFilterOption(
            storedPeriods({ granularity, from, to }),
            staticOnlyOptions,
        );
        expect(dateFilterOption).toMatchObject({ type: "absoluteGranularityForm", granularity, from, to });
    });

    it("keeps a range open at either end", () => {
        expect(
            matchDateFilterToDateFilterOption(storedPeriods({ to: undefined }), staticOnlyOptions)
                .dateFilterOption,
        ).toEqual(expect.objectContaining({ from: "2026-1", to: undefined }));
        expect(
            matchDateFilterToDateFilterOption(storedPeriods({ from: undefined }), staticOnlyOptions)
                .dateFilterOption,
        ).toEqual(expect.objectContaining({ from: undefined, to: "2026-3" }));
    });

    it("keeps the empty value handling", () => {
        const { dateFilterOption } = matchDateFilterToDateFilterOption(
            storedPeriods({ emptyValueHandling: "include" }),
            staticOnlyOptions,
        );
        expect(dateFilterOption).toMatchObject({ emptyValueHandling: "include" });
    });

    it("leaves out the empty value handling the filter does not have", () => {
        const { dateFilterOption } = matchDateFilterToDateFilterOption(storedPeriods(), staticOnlyOptions);
        expect(dateFilterOption).not.toHaveProperty("emptyValueHandling");
    });

    it.each([
        ["hidden", { absoluteForm: { ...absoluteForm, visible: false } }],
        ["missing", {}],
    ] as const)("maps whole periods to a hidden option when the absolute form is %s", (_, options) => {
        const { dateFilterOption } = matchDateFilterToDateFilterOption(storedPeriods(), options);
        expect(dateFilterOption).toMatchObject({
            type: "absoluteGranularityForm",
            visible: false,
            granularity: "GDC.time.quarter",
        });
        expect(dateFilterOption.localIdentifier).not.toBe("ABSOLUTE_FORM");
    });

    it("does not match whole periods to an absolute preset of the same days", () => {
        const options: IDateFilterOptionsByType = {
            absoluteForm,
            absolutePreset: [
                {
                    localIdentifier: "Q1_TO_Q3",
                    type: "absolutePreset",
                    name: "Q1 to Q3",
                    visible: true,
                    from: "2026-01-01",
                    to: "2026-09-30",
                },
            ],
        };
        expect(matchDateFilterToDateFilterOption(storedPeriods(), options).dateFilterOption.type).toBe(
            "absoluteGranularityForm",
        );
        expect(findDateFilterOptionByValue(storedPeriods(), options)).toBeUndefined();
    });

    it.each(["ABSOLUTE_FORM", "RELATIVE_FORM", undefined])(
        "maps whole periods to the absolute form whatever the preferred option %s",
        (preferredOptionId) => {
            const options: IDateFilterOptionsByType = {
                absoluteForm,
                relativeForm: {
                    localIdentifier: "RELATIVE_FORM",
                    type: "relativeForm",
                    name: "",
                    visible: true,
                },
            };
            const { dateFilterOption } = matchDateFilterToDateFilterOptionWithPreference(
                storedPeriods(),
                options,
                preferredOptionId,
            );
            expect(dateFilterOption).toMatchObject({
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteGranularityForm",
                from: "2026-1",
                to: "2026-3",
            });
        },
    );

    it("maps days of the deprecated absolute filter with granularity to days of the absolute form", () => {
        const stored: IDashboardDateFilter = {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.month",
                from: "2026-07-01",
                to: "2026-09-30",
            },
        };
        const { dateFilterOption } = matchDateFilterToDateFilterOption(stored, staticOnlyOptions);
        expect(dateFilterOption).toEqual({ ...absoluteForm, from: "2026-07-01", to: "2026-09-30" });
    });
});

describe("matching the parameterized date filter", () => {
    const period = newDashboardParameterizedDateFilter(idRef("last_13_months", "parameter"));

    it("throws, because date filters do not offer periods yet", () => {
        expect(() => matchDateFilterToDateFilterOption(period, staticOnlyOptions)).toThrow();
        expect(() =>
            matchDateFilterToDateFilterOptionWithPreference(period, staticOnlyOptions, "ABSOLUTE_FORM"),
        ).toThrow();
    });

    it("finds no option by value", () => {
        expect(findDateFilterOptionByValue(period, staticOnlyOptions)).toBeUndefined();
    });
});
