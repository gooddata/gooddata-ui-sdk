// (C) 2022-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { omit } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import {
    type DateFilterGranularity,
    type IRelativeDateFilterPresetOfGranularity,
    idRef,
} from "@gooddata/sdk-model";
import { type DateFilterOption } from "@gooddata/sdk-ui-filters";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import {
    dateDataset1,
    dateDataset3,
    dateDatasetRefsWithGranularities,
} from "../../../../tests/DateDatasetWithGranularities.test.helpers.js";
import { type IDateDatasetRefWithGranularities } from "../../../../typings/datasets.js";
import {
    ALL_TIME_FILTER_OPTION,
    RELATIVE_PERIOD_FILTER_OPTION,
    STATIC_PERIOD_FILTER_OPTION,
} from "../defaultFilterOptions.js";
import { RELATIVE_DATE_FILTER_PRESETS } from "../presets.js";

import {
    useResetPresetWhenUnsupportedOneIsSelected,
    useResetRelativeRangeWhenUnsupportedOneIsSelected,
    useSupportedDateFilterPresets,
} from "./supportedPresetsHook.js";

// Helper function to remove filters with bounded filter from results
// walks an arbitrary result tree, so the input is whatever the hook produced
function removeFiltersWithBoundedFilter(result: unknown): unknown {
    if (Array.isArray(result)) {
        return result
            .filter((item) => {
                // Remove entire objects that contain boundedFilter
                return !(item && typeof item === "object" && "boundedFilter" in item);
            })
            .map(removeFiltersWithBoundedFilter);
    }

    if (result && typeof result === "object") {
        const sanitized: Record<string, unknown> = { ...(result as Record<string, unknown>) };

        // Recursively sanitize nested objects and arrays
        Object.keys(sanitized).forEach((key) => {
            if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
                sanitized[key] = removeFiltersWithBoundedFilter(sanitized[key]);
            }
        });

        return sanitized;
    }

    return result;
}

describe("supportedPresetHook", () => {
    describe("useSupportedDateFilterPresets", () => {
        it("should omit unsupported presets and granularities for unsupported granularities of the dataset", () => {
            const { result } = renderHook(() =>
                useSupportedDateFilterPresets(
                    RELATIVE_DATE_FILTER_PRESETS,
                    dateDataset3,
                    dateDatasetRefsWithGranularities,
                    true,
                ),
            );
            expect(removeFiltersWithBoundedFilter(result.current)).toMatchSnapshot();
        });

        it("should return empty presets and granularities when information for selected dataset is missing", () => {
            const selectedDateDataset: IDecoratedDateDataset = {
                identifier: "DATE4",
                ref: idRef("DATE4"),
                title: "Dataset that does not exist",
            };
            const { result } = renderHook(() =>
                useSupportedDateFilterPresets(
                    RELATIVE_DATE_FILTER_PRESETS,
                    selectedDateDataset,
                    dateDatasetRefsWithGranularities,
                    true,
                ),
            );
            expect(removeFiltersWithBoundedFilter(result.current)).toMatchSnapshot();
        });

        it("should return untouched presets and granularities when every preset is supported", () => {
            const { result } = renderHook(() =>
                useSupportedDateFilterPresets(
                    RELATIVE_DATE_FILTER_PRESETS,
                    dateDataset1,
                    dateDatasetRefsWithGranularities,
                    true,
                ),
            );
            expect(removeFiltersWithBoundedFilter(result.current)).toMatchSnapshot();
        });

        it("should drop GDC.time.second when the enableSecondGranularities flag is off, keep it when on", () => {
            const datasetWithSeconds: IDecoratedDateDataset = {
                identifier: "DATE_SEC",
                ref: idRef("DATE_SEC"),
                title: "Dataset with seconds",
            };
            const refsWithSeconds: IDateDatasetRefWithGranularities[] = [
                {
                    ref: { identifier: "DATE_SEC", type: "dataSet" },
                    attributes: [
                        {
                            ref: { identifier: "DATE_SEC.second", type: "attribute" },
                            dfRef: { identifier: "DATE_SEC.second", type: "displayForm" },
                            cacheIdentifier: "DATE_SEC.second",
                            dateType: "GDC.time.second",
                            label: "second",
                        },
                    ],
                },
            ];
            const presetsWithSeconds = {
                ...RELATIVE_DATE_FILTER_PRESETS,
                "GDC.time.second": [] as IRelativeDateFilterPresetOfGranularity<"GDC.time.second">[],
            };

            const gatedOff = renderHook(() =>
                useSupportedDateFilterPresets(presetsWithSeconds, datasetWithSeconds, refsWithSeconds, false),
            );
            expect(gatedOff.result.current.supportedChronologicalGranularities).not.toContain(
                "GDC.time.second",
            );
            expect(Object.keys(gatedOff.result.current.supportedDateFilterPresets)).not.toContain(
                "GDC.time.second",
            );

            const gatedOn = renderHook(() =>
                useSupportedDateFilterPresets(presetsWithSeconds, datasetWithSeconds, refsWithSeconds, true),
            );
            expect(gatedOn.result.current.supportedChronologicalGranularities).toContain("GDC.time.second");
            expect(Object.keys(gatedOn.result.current.supportedDateFilterPresets)).toContain(
                "GDC.time.second",
            );
        });
    });

    describe("useResetPresetWhenUnsupportedOneIsSelected", () => {
        const thisYearFilter = RELATIVE_DATE_FILTER_PRESETS["GDC.time.year"].find(
            (preset) => preset.localIdentifier === "THIS_YEAR",
        );

        it.each([
            ["supported relative preset", thisYearFilter],
            ["all time", ALL_TIME_FILTER_OPTION],
            ["static period", STATIC_PERIOD_FILTER_OPTION],
            ["relative period", RELATIVE_PERIOD_FILTER_OPTION],
        ])(
            "should not call reset callback when %s is selected",
            (_presetType: string, preset: DateFilterOption) => {
                const resetCallback = vi.fn();
                renderHook(() =>
                    useResetPresetWhenUnsupportedOneIsSelected(
                        preset,
                        RELATIVE_DATE_FILTER_PRESETS,
                        resetCallback,
                    ),
                );
                expect(resetCallback).not.toBeCalled();
            },
        );

        it("should call reset callback with default preset when selected preset is not supported", () => {
            const resetCallback = vi.fn();
            const dateFilterPresets = omit(RELATIVE_DATE_FILTER_PRESETS, "GDC.time.year");
            renderHook(() =>
                useResetPresetWhenUnsupportedOneIsSelected(thisYearFilter, dateFilterPresets, resetCallback),
            );
            expect(resetCallback).toBeCalledWith({
                filterOption: ALL_TIME_FILTER_OPTION,
                excludeCurrentPeriod: false,
            });
        });
    });

    describe("useResetRelativeRangeWhenUnsupportedOneIsSelected", () => {
        const availableGranularities: DateFilterGranularity[] = [
            "GDC.time.date",
            "GDC.time.month",
            "GDC.time.quarter",
            "GDC.time.year",
        ];
        const relativeYearRange: DateFilterOption = {
            localIdentifier: "RELATIVE_FORM",
            type: "relativeForm",
            granularity: "GDC.time.year",
            from: 1,
            to: -1,
            name: "",
            visible: true,
        };
        const relativeHourRange: DateFilterOption = {
            localIdentifier: "RELATIVE_FORM",
            type: "relativeForm",
            granularity: "GDC.time.hour",
            from: 1,
            to: -1,
            name: "",
            visible: true,
        };

        it.each([
            ["all time", ALL_TIME_FILTER_OPTION],
            ["static period", STATIC_PERIOD_FILTER_OPTION],
            ["supported relative date range", relativeYearRange],
        ])(
            "should not call reset callback when %s is selected",
            (_presetType: string, preset: DateFilterOption) => {
                const resetCallback = vi.fn();
                renderHook(() =>
                    useResetRelativeRangeWhenUnsupportedOneIsSelected(
                        preset,
                        availableGranularities,
                        resetCallback,
                    ),
                );
                expect(resetCallback).not.toBeCalled();
            },
        );

        it("should call reset callback with default relative range when selected granularity is not supported", () => {
            const resetCallback = vi.fn();
            renderHook(() =>
                useResetRelativeRangeWhenUnsupportedOneIsSelected(
                    relativeHourRange,
                    availableGranularities,
                    resetCallback,
                ),
            );
            expect(resetCallback).toBeCalledWith({
                filterOption: RELATIVE_PERIOD_FILTER_OPTION,
                excludeCurrentPeriod: false,
            });
        });
    });
});
