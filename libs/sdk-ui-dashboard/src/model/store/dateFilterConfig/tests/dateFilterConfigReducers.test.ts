// (C) 2023 GoodData Corporation
import { produce } from "immer";
import { describe, it, expect } from "vitest";
import cloneDeep from "lodash/cloneDeep.js";

import { DashboardDateFilterConfigModeValues, IDashboardDateFilterConfig } from "@gooddata/sdk-model";

import { DateFilterConfigState } from "../dateFilterConfigState.js";
import { dateFilterConfigActions } from "../index.js";
import { dateFilterConfigReducers } from "../dateFilterConfigReducers.js";

describe("dateFilterConfigReducers", () => {
    const createDateFilterConfigSliceInitialState = (
        dateFilterConfig?: IDashboardDateFilterConfig,
    ): DateFilterConfigState => {
        return {
            dateFilterConfig: dateFilterConfig ? cloneDeep(dateFilterConfig) : undefined,
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
            const initialState = createDateFilterConfigSliceInitialState(initialDateFilterConfig);
            const newMode = DashboardDateFilterConfigModeValues.READONLY;

            const newState = produce(initialState, (draft) => {
                const action = dateFilterConfigActions.setDateFilterConfigMode(newMode);
                return dateFilterConfigReducers.setDateFilterConfigMode(draft, action);
            });

            expect(newState.dateFilterConfig).toEqual({
                ...initialDateFilterConfig,
                mode: newMode,
            });
        });

        it("should create a new date filter config if it doesn't exist", () => {
            const initialState = createDateFilterConfigSliceInitialState(undefined);

            const newState = produce(initialState, (draft) => {
                const action = dateFilterConfigActions.setDateFilterConfigMode(
                    DashboardDateFilterConfigModeValues.READONLY,
                );
                return dateFilterConfigReducers.setDateFilterConfigMode(draft, action);
            });

            expect(newState.dateFilterConfig).toEqual({
                mode: DashboardDateFilterConfigModeValues.READONLY,
                filterName: "",
            });
        });
    });
});
