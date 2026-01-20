// (C) 2021-2026 GoodData Corporation

import {
    type EntityId,
    type EntityState,
    type PayloadAction,
    type Reducer,
    createSlice,
} from "@reduxjs/toolkit";

import { type IListedDashboard } from "@gooddata/sdk-model";

import { accessibleDashboardsEntityAdapter } from "./accessibleDashboardsEntityAdapter.js";

/**
 * @alpha
 */
export interface IAccessibleDashboardsState extends EntityState<IListedDashboard, EntityId> {
    isLoaded: boolean;
}

const accessibleDashboardsSlice = createSlice({
    name: "accessibleDashboards",
    initialState: accessibleDashboardsEntityAdapter.getInitialState({
        isLoaded: false,
    }),
    reducers: {
        setAccessibleDashboards: (
            state: IAccessibleDashboardsState,
            action: PayloadAction<IListedDashboard[]>,
        ) => {
            accessibleDashboardsEntityAdapter.setAll(state, action.payload);
            state.isLoaded = true;
        },
        addAccessibleDashboard: (
            state: IAccessibleDashboardsState,
            action: PayloadAction<IListedDashboard>,
        ) => {
            accessibleDashboardsEntityAdapter.upsertOne(state, action.payload);
            state.isLoaded = true;
        },
    },
});

export const accessibleDashboardsSliceReducer: Reducer<IAccessibleDashboardsState> =
    accessibleDashboardsSlice.reducer;

// Spread "fixes" TS2742 error
export const accessibleDashboardsActions = { ...accessibleDashboardsSlice.actions };
