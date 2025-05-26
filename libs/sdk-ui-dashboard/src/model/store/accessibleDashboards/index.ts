// (C) 2021-2025 GoodData Corporation
import { IListedDashboard } from "@gooddata/sdk-model";
import { createSlice } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { EntityState, PayloadAction } from "@reduxjs/toolkit";
import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter.js";

/**
 * @alpha
 */
export interface AccessibleDashboardsState extends EntityState<IListedDashboard> {
    isLoaded: boolean;
}

const accessibleDashboardsSlice = createSlice({
    name: "accessibleDashboards",
    initialState: accessibleDashboardsEntityAdapter.getInitialState({
        isLoaded: false,
    }),
    reducers: {
        setAccessibleDashboards: (
            state: AccessibleDashboardsState,
            action: PayloadAction<IListedDashboard[]>,
        ) => {
            accessibleDashboardsEntityAdapter.setAll(state, action.payload);
            state.isLoaded = true;
        },
        addAccessibleDashboard: (
            state: AccessibleDashboardsState,
            action: PayloadAction<IListedDashboard>,
        ) => {
            accessibleDashboardsEntityAdapter.upsertOne(state, action.payload);
            state.isLoaded = true;
        },
    },
});

export const accessibleDashboardsSliceReducer = accessibleDashboardsSlice.reducer;
export const accessibleDashboardsActions = accessibleDashboardsSlice.actions;
