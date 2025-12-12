// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    DashboardDateFilterConfigModeValues,
    type IDashboardDateFilterConfigItem,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectDateFilterConfigsModeMap,
    selectDateFilterConfigsOverrides,
    selectEffectiveDateFiltersModeMap,
} from "../dateFilterConfigsSelectors.js";

describe("dateFilterConfigsSelectors", () => {
    const createInitialState = (
        dateFilterConfigs?: IDashboardDateFilterConfigItem[],
        renderMode?: string,
    ): any => {
        return {
            tabs: {
                tabs: dateFilterConfigs
                    ? [
                          {
                              localIdentifier: "tab-1",
                              title: "Test Tab",
                              dateFilterConfigs: { dateFilterConfigs },
                          },
                      ]
                    : [],
                activeTabLocalIdentifier: "tab-1",
            },
            renderMode: {
                renderMode,
            },
        };
    };

    describe("selectDateFilterConfigsOverrides", () => {
        it("should return an empty array when tabs is empty", () => {
            const state = createInitialState(undefined);
            expect(selectDateFilterConfigsOverrides(state)).toEqual([]);
        });

        it("should return an empty array when dateFilterConfigs is undefined", () => {
            const state = createInitialState([]);
            expect(selectDateFilterConfigsOverrides(state)).toEqual([]);
        });

        it("should return dateFilterConfigs when it not empty", () => {
            const configs: IDashboardDateFilterConfigItem[] = [
                {
                    dateDataSet: idRef("id_1"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_2"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.READONLY,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_3"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.ACTIVE,
                        filterName: "",
                    },
                },
            ];

            const state = createInitialState(configs);
            expect(selectDateFilterConfigsOverrides(state)).toEqual(configs);
        });
    });

    describe("selectDateFilterConfigsModeMap", () => {
        it("should return a map of date filter config modes", () => {
            const configs: IDashboardDateFilterConfigItem[] = [
                {
                    dateDataSet: idRef("id_1"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_2"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.READONLY,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_3"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.ACTIVE,
                        filterName: "",
                    },
                },
            ];

            const state = createInitialState(configs);

            const expectedMap = new Map([
                ['{"identifier":"id_1"}', DashboardDateFilterConfigModeValues.HIDDEN],
                ['{"identifier":"id_2"}', DashboardDateFilterConfigModeValues.READONLY],
                ['{"identifier":"id_3"}', DashboardDateFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectDateFilterConfigsModeMap(state)).toEqual(expectedMap);
        });
    });

    describe("selectEffectiveDateFiltersModeMap", () => {
        it("should return a map of effective date filter config modes", () => {
            const configs: IDashboardDateFilterConfigItem[] = [
                {
                    dateDataSet: idRef("id_1"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_2"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.READONLY,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_3"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.ACTIVE,
                        filterName: "",
                    },
                },
            ];

            const state = createInitialState(configs, "view");

            const expectedMap = new Map([
                ['{"identifier":"id_1"}', DashboardDateFilterConfigModeValues.HIDDEN],
                ['{"identifier":"id_2"}', DashboardDateFilterConfigModeValues.READONLY],
                ['{"identifier":"id_3"}', DashboardDateFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectEffectiveDateFiltersModeMap(state)).toEqual(expectedMap);
        });

        it("should return a map of active date filter config modes when isInEditMode is true", () => {
            const configs: IDashboardDateFilterConfigItem[] = [
                {
                    dateDataSet: idRef("id_1"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_2"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.READONLY,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id_3"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.ACTIVE,
                        filterName: "",
                    },
                },
            ];

            const state = createInitialState(configs, "edit");

            const expectedMap = new Map([
                ['{"identifier":"id_1"}', DashboardDateFilterConfigModeValues.ACTIVE],
                ['{"identifier":"id_2"}', DashboardDateFilterConfigModeValues.ACTIVE],
                ['{"identifier":"id_3"}', DashboardDateFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectEffectiveDateFiltersModeMap(state)).toEqual(expectedMap);
        });
    });
});
