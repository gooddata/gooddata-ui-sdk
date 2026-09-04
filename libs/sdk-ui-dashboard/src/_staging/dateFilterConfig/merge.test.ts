// (C) 2019-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES,
    type IDashboardDateFilterConfig,
    type IDateFilterConfig,
    idRef,
} from "@gooddata/sdk-model";

import {
    absoluteForm,
    allTime,
    emptyValues,
    lastMonth,
    lastYear,
    relativeForm,
    year2019,
} from "./dateFilterConfig.test.helpers.js";
import { deriveAbsoluteFormGranularitiesFromRelativeForm, mergeDateFilterConfigs } from "./merge.js";

describe("deriveAbsoluteFormGranularitiesFromRelativeForm", () => {
    it("should leave the config unchanged when disabled", () => {
        const config: IDateFilterConfig = {
            ref: idRef("shouldNotSeedWhenDisabled"),
            absoluteForm,
            relativeForm,
            selectedOption: absoluteForm.localIdentifier,
        };

        expect(deriveAbsoluteFormGranularitiesFromRelativeForm(config, false)).toEqual(config);
    });

    it("should leave the config unchanged when there is no absoluteForm at all, regardless of the flag", () => {
        const config: IDateFilterConfig = {
            ref: idRef("shouldNotSeedWithoutAbsoluteForm"),
            allTime,
            selectedOption: allTime.localIdentifier,
        };

        expect(deriveAbsoluteFormGranularitiesFromRelativeForm(config, true)).toEqual(config);
    });

    it("should seed the standard-calendar-period subset of relativeForm's granularities, in fixed order, excluding non-standard ones", () => {
        const config: IDateFilterConfig = {
            ref: idRef("shouldSeedFromRelativeForm"),
            absoluteForm,
            relativeForm: {
                ...relativeForm,
                // Deliberately scrambled and mixed with non-standard granularities to prove the output is
                // always in fixed Day/Week/Month/Quarter/Year order and excludes minute/hour/fiscal, rather
                // than merely preserving whatever order/subset relativeForm happens to already be in.
                availableGranularities: [
                    "GDC.time.year",
                    "GDC.time.minute",
                    "GDC.time.month",
                    "GDC.time.fiscal_year",
                    "GDC.time.date",
                    "GDC.time.hour",
                    "GDC.time.week_us",
                    "GDC.time.quarter",
                ],
            },
            selectedOption: absoluteForm.localIdentifier,
        };

        const expected: IDateFilterConfig = {
            ...config,
            absoluteForm: {
                ...absoluteForm,
                availableGranularities: [...DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES],
            },
        };

        expect(deriveAbsoluteFormGranularitiesFromRelativeForm(config, true)).toEqual(expected);
    });

    it("should seed an empty list when relativeForm is absent", () => {
        const config: IDateFilterConfig = {
            ref: idRef("shouldSeedEmptyWithoutRelativeForm"),
            absoluteForm,
            selectedOption: absoluteForm.localIdentifier,
        };

        const expected: IDateFilterConfig = {
            ...config,
            absoluteForm: {
                ...absoluteForm,
                availableGranularities: [],
            },
        };

        expect(deriveAbsoluteFormGranularitiesFromRelativeForm(config, true)).toEqual(expected);
    });
});

describe("mergeProjectConfigWithDashboardConfig", () => {
    it("should properly hide granularities", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideGranularities"),
            relativeForm,
            relativePresets: [lastMonth, lastYear],
            selectedOption: relativeForm.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideGranularities: ["GDC.time.month"],
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideGranularities"),
            relativeForm: {
                ...relativeForm,
                availableGranularities: ["GDC.time.year"],
            },
            relativePresets: [
                {
                    ...lastMonth,
                    visible: false,
                },
                lastYear,
            ],
            selectedOption: relativeForm.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });

    it("should properly hide options", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideOptions"),
            allTime,
            emptyValues,
            absoluteForm,
            absolutePresets: [year2019],
            relativeForm,
            relativePresets: [lastMonth],
            selectedOption: allTime.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideOptions: [
                allTime.localIdentifier,
                emptyValues.localIdentifier,
                absoluteForm.localIdentifier,
                year2019.localIdentifier,
            ],
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideOptions"),
            allTime: {
                ...allTime,
                visible: false,
            },
            emptyValues: {
                ...emptyValues,
                visible: false,
            },
            absoluteForm: {
                ...absoluteForm,
                visible: false,
            },
            absolutePresets: [
                {
                    ...year2019,
                    visible: false,
                },
            ],
            relativeForm,
            relativePresets: [lastMonth],
            selectedOption: allTime.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });

    it("should properly add presets", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldProperlyAddPresets"),
            allTime,
            selectedOption: allTime.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            addPresets: {
                absolutePresets: [year2019],
                relativePresets: [lastMonth],
            },
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldProperlyAddPresets"),
            allTime,
            absolutePresets: [year2019],
            relativePresets: [lastMonth],
            selectedOption: allTime.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });

    it("should properly add presets with duplicities", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldProperlyAddPresetsWithDuplicities"),
            allTime,
            selectedOption: allTime.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            addPresets: {
                absolutePresets: [year2019, year2019],
                relativePresets: [lastMonth],
            },
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldProperlyAddPresetsWithDuplicities"),
            allTime,
            absolutePresets: [year2019],
            relativePresets: [lastMonth],
            selectedOption: allTime.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });

    it("should properly hide a subset of absolute form granularities", () => {
        const seededAbsoluteForm = {
            ...absoluteForm,
            availableGranularities: [...DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES],
        };

        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideAbsoluteFormGranularities"),
            absoluteForm: seededAbsoluteForm,
            selectedOption: absoluteForm.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideGranularities: ["GDC.time.month", "GDC.time.quarter"],
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideAbsoluteFormGranularities"),
            absoluteForm: {
                ...seededAbsoluteForm,
                availableGranularities: ["GDC.time.date", "GDC.time.week_us", "GDC.time.year"],
            },
            selectedOption: absoluteForm.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });

    it("should strip the absolute form entirely when every granularity is hidden, including Day", () => {
        const seededAbsoluteForm = {
            ...absoluteForm,
            availableGranularities: [...DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES],
        };

        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldStripAbsoluteFormWhenAllHidden"),
            absoluteForm: seededAbsoluteForm,
            selectedOption: absoluteForm.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideGranularities: [...DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES],
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldStripAbsoluteFormWhenAllHidden"),
            selectedOption: absoluteForm.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });

    it("should not hide absolute form granularities when availableGranularities is absent", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotHideUnseededAbsoluteFormGranularities"),
            absoluteForm,
            selectedOption: absoluteForm.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideGranularities: ["GDC.time.month"],
            mode: "active",
            filterName: "",
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(projectConfig);
    });

    it("should not strip the absolute form when availableGranularities is seeded empty", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldNotStripSeededEmptyAbsoluteFormGranularities"),
            absoluteForm: { ...absoluteForm, availableGranularities: [] },
            selectedOption: absoluteForm.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideGranularities: ["GDC.time.month"],
            mode: "active",
            filterName: "",
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(projectConfig);
    });

    it("should hide added presets for granularities (RAIL-1599)", () => {
        const projectConfig: IDateFilterConfig = {
            ref: idRef("shouldHideAddedPresetsForGranularities"),
            allTime,
            selectedOption: allTime.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            addPresets: {
                relativePresets: [lastMonth, lastYear],
            },
            hideGranularities: ["GDC.time.month"],
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldHideAddedPresetsForGranularities"),
            allTime,
            relativePresets: [{ ...lastMonth, visible: false }, lastYear],
            selectedOption: allTime.localIdentifier,
        };

        const actual = mergeDateFilterConfigs(projectConfig, dashboardConfig);
        expect(actual).toEqual(expected);
    });
});
