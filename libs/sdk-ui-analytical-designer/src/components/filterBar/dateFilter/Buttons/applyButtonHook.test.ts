// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

import { useApplyButtonEnabled } from "./applyButtonHook.js";

const dateDataset = { identifier: "created", title: "Created", ref: idRef("created", "dataSet") };
const allTime: IDateFilterOption = {
    filterOption: { type: "allTime", localIdentifier: "ALL_TIME", name: "", visible: true },
    excludeCurrentPeriod: false,
};
const lastYear: IDateFilterOption = {
    filterOption: {
        type: "relativePreset",
        localIdentifier: "LAST_YEAR",
        name: "",
        visible: true,
        granularity: "GDC.time.year",
        from: -1,
        to: -1,
    },
    excludeCurrentPeriod: false,
};
// a period (DATE_RANGE parameter) sits on an All time option, but it is a period for the empty values mode
const namedPeriod: IDateFilterOption = {
    ...allTime,
    period: {
        config: { type: "parameterized", parameterRef: idRef("lastQuarter", "parameter") },
        title: "Most recent quarter",
    },
};

const isApplyEnabled = (
    filter: IDateFilterOption,
    selectedMode: EmptyDateValuesFilterMode | undefined,
    originalMode: EmptyDateValuesFilterMode | undefined,
) =>
    renderHook(() =>
        useApplyButtonEnabled(
            filter,
            filter,
            dateDataset,
            dateDataset,
            "nothing",
            "nothing",
            [],
            [],
            [],
            [],
            true,
            selectedMode,
            originalMode,
            true,
        ),
    ).result.current;

describe("useApplyButtonEnabled empty date values mode", () => {
    it("treats include on All time as no mode, since it is not stored", () => {
        expect(isApplyEnabled(allTime, "include", undefined)).toBe(false);
        expect(isApplyEnabled(allTime, undefined, "include")).toBe(false);
    });

    it.each<EmptyDateValuesFilterMode>(["include", "exclude", "only"])(
        "sees %s added to a period without a mode as a change",
        (mode) => {
            expect(isApplyEnabled(lastYear, mode, undefined)).toBe(true);
        },
    );

    it("sees exclude added to All time as a change", () => {
        expect(isApplyEnabled(allTime, "exclude", undefined)).toBe(true);
    });

    it.each<EmptyDateValuesFilterMode>(["include", "exclude", "only"])(
        "sees %s added to a named period without a mode as a change, like for any period",
        (mode) => {
            expect(isApplyEnabled(namedPeriod, mode, undefined)).toBe(true);
        },
    );

    it("sees the same mode as no change", () => {
        expect(isApplyEnabled(lastYear, "include", "include")).toBe(false);
    });
});
