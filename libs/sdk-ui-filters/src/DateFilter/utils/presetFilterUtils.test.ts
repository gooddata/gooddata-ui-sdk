// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import {
    type IUiAbsoluteDateFilterForm,
    type IUiAbsoluteGranularityDateFilterForm,
} from "../interfaces/index.js";

import { ensureCompatibleAbsoluteGranularity } from "./presetFilterUtils.js";

describe("ensureCompatibleAbsoluteGranularity", () => {
    const availableGranularities: DateFilterGranularity[] = [
        "GDC.time.date",
        "GDC.time.week_us",
        "GDC.time.month",
    ];

    const dayOption: IUiAbsoluteDateFilterForm = {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteForm",
        name: "",
        visible: true,
        from: "2026-01-01",
        to: "2026-01-31",
    };

    const monthOption: IUiAbsoluteGranularityDateFilterForm = {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteGranularityForm",
        name: "",
        visible: true,
        granularity: "GDC.time.month",
        from: "2026-01",
        to: "2026-03",
    };

    it("is a no-op when availableGranularities is empty", () => {
        expect(ensureCompatibleAbsoluteGranularity(dayOption, [])).toBe(dayOption);
    });

    it("is a no-op for whole periods whose tab is available", () => {
        expect(ensureCompatibleAbsoluteGranularity(monthOption, availableGranularities)).toBe(monthOption);
    });

    it("keeps whole periods whose tab is not available", () => {
        const quarterOption: IUiAbsoluteGranularityDateFilterForm = {
            ...monthOption,
            granularity: "GDC.time.quarter",
            from: "2026-1",
            to: "2026-2",
        };
        expect(ensureCompatibleAbsoluteGranularity(quarterOption, ["GDC.time.date", "GDC.time.year"])).toBe(
            quarterOption,
        );
    });

    it("preserves days when Day is available", () => {
        expect(ensureCompatibleAbsoluteGranularity(dayOption, availableGranularities)).toBe(dayOption);
    });

    it("resets days to the empty option of the first available tab when Day is not available", () => {
        const result = ensureCompatibleAbsoluteGranularity({ ...dayOption, emptyValueHandling: "include" }, [
            "GDC.time.month",
            "GDC.time.year",
        ]);
        expect(result).toEqual({
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteGranularityForm",
            name: "",
            visible: true,
            granularity: "GDC.time.month",
            emptyValueHandling: "include",
        });
    });

    it("resets days to the empty week option when the week is the first available tab", () => {
        const result = ensureCompatibleAbsoluteGranularity(dayOption, ["GDC.time.week_us", "GDC.time.year"]);
        expect(result).toMatchObject({ type: "absoluteGranularityForm", granularity: "GDC.time.week" });
        expect(result.from).toBeUndefined();
        expect(result.to).toBeUndefined();
    });
});
