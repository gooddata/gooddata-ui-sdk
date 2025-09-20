// (C) 2023-2025 GoodData Corporation
import { produce } from "immer";
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { DashboardDateFilterConfigModeValues, IDashboardDateFilterConfig } from "@gooddata/sdk-model";

import { dateFilterConfigReducers } from "../dateFilterConfigReducers.js";
import { DateFilterConfigState } from "../dateFilterConfigState.js";
import { dateFilterConfigActions } from "../index.js";

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
