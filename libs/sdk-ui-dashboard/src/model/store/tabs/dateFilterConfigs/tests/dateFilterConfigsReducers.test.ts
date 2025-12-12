// (C) 2023-2025 GoodData Corporation

import { produce } from "immer";
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import {
    DashboardDateFilterConfigModeValues,
    type IDashboardDateFilterConfigItem,
    idRef,
} from "@gooddata/sdk-model";

import { type TabsState, tabsActions } from "../../index.js";
import { dateFilterConfigsReducers } from "../dateFilterConfigsReducers.js";

describe("dateFilterConfigsReducers", () => {
    const createDateFilterConfigSliceInitialState = (
        dateFilterConfigs?: IDashboardDateFilterConfigItem[],
    ): TabsState => {
        return {
            tabs: [
                {
                    localIdentifier: "tab-1",
                    title: "Test Tab",
                    dateFilterConfigs: dateFilterConfigs
                        ? { dateFilterConfigs: cloneDeep(dateFilterConfigs) }
                        : { dateFilterConfigs: [] },
                    dateFilterConfig: undefined,
                    attributeFilterConfigs: { attributeFilterConfigs: [] },
                },
            ],
            activeTabLocalIdentifier: "tab-1",
        };
    };

    describe("setDateFilterConfigs", () => {
        it("should set the date filter with dimension configs", () => {
            const initialDateFilterConfigs: IDashboardDateFilterConfigItem[] = [
                {
                    dateDataSet: idRef("id1"),
                    config: {
                        mode: "hidden",
                        filterName: "",
                    },
                },
            ];
            const initialState = createDateFilterConfigSliceInitialState(initialDateFilterConfigs);
            const newMode = DashboardDateFilterConfigModeValues.READONLY;

            const newState: any = produce(initialState, (draft: any) => {
                const action = tabsActions.setDateFilterConfigs({
                    dateFilterConfigs: [
                        {
                            ...initialDateFilterConfigs[0],
                            config: {
                                ...initialDateFilterConfigs[0].config,
                                mode: newMode,
                            },
                        },
                    ],
                });
                return dateFilterConfigsReducers.setDateFilterConfigs(draft, action);
            });

            expect(newState.tabs?.[0]?.dateFilterConfigs?.dateFilterConfigs).toEqual([
                {
                    ...initialDateFilterConfigs[0],
                    config: {
                        ...initialDateFilterConfigs[0].config,
                        mode: newMode,
                    },
                },
            ]);
        });

        it("should create a new date filter config if it doesn't exist", () => {
            const initialState = createDateFilterConfigSliceInitialState(undefined);

            const newState = produce(initialState, (draft: any) => {
                const action = tabsActions.setDateFilterConfigs({
                    dateFilterConfigs: [
                        {
                            dateDataSet: idRef("id2"),
                            config: {
                                mode: DashboardDateFilterConfigModeValues.HIDDEN,
                                filterName: "",
                            },
                        },
                    ],
                });
                return dateFilterConfigsReducers.setDateFilterConfigs(draft, action);
            });

            expect(newState.tabs?.[0]?.dateFilterConfigs?.dateFilterConfigs).toEqual([
                {
                    dateDataSet: idRef("id2"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        filterName: "",
                    },
                },
            ]);
        });
    });

    describe("changeMode", () => {
        const initialState = createDateFilterConfigSliceInitialState([
            {
                dateDataSet: idRef("id1"),
                config: {
                    mode: DashboardDateFilterConfigModeValues.HIDDEN,
                    filterName: "",
                },
            },
        ]);

        it("should set the date filter configs", () => {
            const newMode = DashboardDateFilterConfigModeValues.READONLY;
            const newState = produce(initialState, (draft: any) => {
                const action = tabsActions.changeDateFilterConfigsMode({
                    dataSet: idRef("id1"),
                    mode: newMode,
                });
                return dateFilterConfigsReducers.changeDateFilterConfigsMode(draft, action);
            });

            expect(newState.tabs?.[0]?.dateFilterConfigs?.dateFilterConfigs).toEqual([
                {
                    dateDataSet: idRef("id1"),
                    config: {
                        mode: newMode,
                        filterName: "",
                    },
                },
            ]);
        });

        it("should create a new date filter config if it doesn't exist", () => {
            const newState = produce(initialState, (draft) => {
                const action = tabsActions.changeDateFilterConfigsMode({
                    dataSet: idRef("id2"),
                    mode: DashboardDateFilterConfigModeValues.ACTIVE,
                });
                return dateFilterConfigsReducers.changeDateFilterConfigsMode(draft, action);
            });

            expect(newState.tabs?.[0]?.dateFilterConfigs?.dateFilterConfigs).toEqual([
                {
                    dateDataSet: idRef("id1"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        filterName: "",
                    },
                },
                {
                    dateDataSet: idRef("id2"),
                    config: {
                        mode: DashboardDateFilterConfigModeValues.ACTIVE,
                        filterName: "",
                    },
                },
            ]);
        });
    });
});
