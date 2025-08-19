// (C) 2023-2025 GoodData Corporation
import { produce } from "immer";
import cloneDeep from "lodash/cloneDeep.js";
import { describe, expect, it } from "vitest";

import {
    DashboardDateFilterConfigModeValues,
    IDashboardDateFilterConfigItem,
    idRef,
} from "@gooddata/sdk-model";

import { dateFilterConfigsReducers } from "../dateFilterConfigsReducers.js";
import { DateFilterConfigsState } from "../dateFilterConfigsState.js";
import { dateFilterConfigsActions } from "../index.js";

describe("dateFilterConfigsReducers", () => {
    const createDateFilterConfigSliceInitialState = (
        dateFilterConfigs?: IDashboardDateFilterConfigItem[],
    ): DateFilterConfigsState => {
        return {
            dateFilterConfigs: dateFilterConfigs ? cloneDeep(dateFilterConfigs) : [],
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
                const action = dateFilterConfigsActions.setDateFilterConfigs({
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

            expect(newState.dateFilterConfigs).toEqual([
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

            const newState = produce(initialState, (draft) => {
                const action = dateFilterConfigsActions.setDateFilterConfigs({
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

            expect(newState.dateFilterConfigs).toEqual([
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
            const newState: any = produce(initialState, (draft: any) => {
                const action = dateFilterConfigsActions.changeMode({
                    dataSet: idRef("id1"),
                    mode: newMode,
                });
                return dateFilterConfigsReducers.changeMode(draft, action);
            });

            expect(newState.dateFilterConfigs).toEqual([
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
                const action = dateFilterConfigsActions.changeMode({
                    dataSet: idRef("id2"),
                    mode: DashboardDateFilterConfigModeValues.ACTIVE,
                });
                return dateFilterConfigsReducers.changeMode(draft, action);
            });

            expect(newState.dateFilterConfigs).toEqual([
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
