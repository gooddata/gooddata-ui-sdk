// (C) 2019-2022 GoodData Corporation
import { idRef, IDateFilterConfig, IDashboardDateFilterConfig } from "@gooddata/sdk-model";

import { mergeDateFilterConfigs } from "../merge";

import { relativeForm, lastMonth, lastYear, allTime, absoluteForm, year2019 } from "./fixtures";

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
            absoluteForm,
            absolutePresets: [year2019],
            relativeForm,
            relativePresets: [lastMonth],
            selectedOption: allTime.localIdentifier,
        };

        const dashboardConfig: IDashboardDateFilterConfig = {
            hideOptions: [allTime.localIdentifier, absoluteForm.localIdentifier, year2019.localIdentifier],
            mode: "active",
            filterName: "",
        };

        const expected: IDateFilterConfig = {
            ref: idRef("shouldProperlyHideOptions"),
            allTime: {
                ...allTime,
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
