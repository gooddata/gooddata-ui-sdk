// (C) 2023-2026 GoodData Corporation

import { produce } from "immer";
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { DashboardDateFilterConfigModeValues, type IDashboardDateFilterConfig } from "@gooddata/sdk-model";

import { tabsActions } from "../../index.js";
import { type ITabsState, tabsInitialState } from "../../tabsState.js";
import { dateFilterConfigReducers } from "../dateFilterConfigReducers.js";

describe("dateFilterConfigReducers", () => {
    const createTabsInitialState = (
        dateFilterConfig?: IDashboardDateFilterConfig,
        activeTabLocalIdentifier: string = "tab1",
    ): ITabsState => {
        return {
            ...tabsInitialState,
            tabs: [
                {
                    localIdentifier: activeTabLocalIdentifier,
                    title: "Tab 1",
                    dateFilterConfig: dateFilterConfig
                        ? {
                              dateFilterConfig: cloneDeep(dateFilterConfig),
                              effectiveDateFilterConfig: undefined,
                              isUsingDashboardOverrides: undefined,
                              dateFilterConfigValidationWarnings: undefined,
                          }
                        : undefined,
                },
            ],
            activeTabLocalIdentifier,
        };
    };

    describe("setDateFilterConfigMode", () => {
        it("should set the date filter config mode", () => {
            const initialDateFilterConfig: IDashboardDateFilterConfig = {
                mode: "hidden",
                filterName: "Date Filter",
                hideOptions: ["true"],
                hideGranularities: ["GDC.time.minute"],
                addPresets: {},
            };
            const initialState = createTabsInitialState(initialDateFilterConfig);
            const newMode = DashboardDateFilterConfigModeValues.READONLY;

            const newState = produce(initialState, (draft) => {
                const action = tabsActions.setDateFilterConfigMode(newMode);
                return dateFilterConfigReducers.setDateFilterConfigMode(draft, action);
            });

            expect(newState.tabs?.[0].dateFilterConfig?.dateFilterConfig).toEqual({
                ...initialDateFilterConfig,
                mode: newMode,
            });
        });

        it("should create a new date filter config if it doesn't exist", () => {
            const initialState = createTabsInitialState(undefined);

            const newState = produce(initialState, (draft) => {
                const action = tabsActions.setDateFilterConfigMode(
                    DashboardDateFilterConfigModeValues.READONLY,
                );
                return dateFilterConfigReducers.setDateFilterConfigMode(draft, action);
            });

            expect(newState.tabs?.[0].dateFilterConfig?.dateFilterConfig).toEqual({
                mode: DashboardDateFilterConfigModeValues.READONLY,
                filterName: "",
            });
        });
    });
});
