// (C) 2023-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    DashboardDateFilterConfigModeValues,
    IDashboardDateFilterConfigItem,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectDateFilterConfigsModeMap,
    selectDateFilterConfigsOverrides,
    selectEffectiveDateFiltersModeMap,
} from "../dateFilterConfigsSelectors.js";
import { DateFilterConfigsState } from "../dateFilterConfigsState.js";

describe("dateFilterConfigsSelectors", () => {
    const createInitialState = (dateFilterConfigs?: DateFilterConfigsState, renderMode?: string): any => {
        return {
            dateFilterConfigs,
            renderMode: {
                renderMode,
            },
        };
    };

    describe("selectDateFilterConfigsOverrides", () => {
        it("should return an empty array when dateFilterConfigs state is undefined", () => {
            const state = createInitialState(undefined);
            expect(selectDateFilterConfigsOverrides(state)).toEqual([]);
        });

        it("should return an empty array when dateFilterConfigs is undefined", () => {
            const state = createInitialState({});
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

            const state = createInitialState({
                dateFilterConfigs: configs,
            });
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

            const state = createInitialState({
                dateFilterConfigs: configs,
            });

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

            const state = createInitialState(
                {
                    dateFilterConfigs: configs,
                },
                "view",
            );

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

            const state = createInitialState(
                {
                    dateFilterConfigs: configs,
                },
                "edit",
            );

            const expectedMap = new Map([
                ['{"identifier":"id_1"}', DashboardDateFilterConfigModeValues.ACTIVE],
                ['{"identifier":"id_2"}', DashboardDateFilterConfigModeValues.ACTIVE],
                ['{"identifier":"id_3"}', DashboardDateFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectEffectiveDateFiltersModeMap(state)).toEqual(expectedMap);
        });
    });
});
