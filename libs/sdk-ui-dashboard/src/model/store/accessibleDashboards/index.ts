// (C) 2021-2025 GoodData Corporation
import { IListedDashboard } from "@gooddata/sdk-model";
import { createSlice, PayloadAction, EntityState, Reducer, EntityId } from "@reduxjs/toolkit";
import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter.js";

/**
 * @alpha
 */
export interface AccessibleDashboardsState extends EntityState<IListedDashboard, EntityId> {
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

export const accessibleDashboardsSliceReducer: Reducer<AccessibleDashboardsState> =
    accessibleDashboardsSlice.reducer;

// Spread "fixes" TS2742 error
export const accessibleDashboardsActions = { ...accessibleDashboardsSlice.actions };
