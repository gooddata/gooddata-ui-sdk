// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { workspacePermissionsSuccess } from "../../actions/permissions_actions.js";

import { type IWorkspacePermissionsState, workspacePermissionsInitialState } from "./permissions_state.js";

const permissionsSlice = createSlice({
    name: "workspacePermissions",
    initialState: workspacePermissionsInitialState as IWorkspacePermissionsState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            workspacePermissionsSuccess,
            (_state, action): IWorkspacePermissionsState => action.payload.permissions,
        );
    },
});

/** The root workspacePermissions slice reducer, mounted via permissions_reducer.ts. */
export const permissionsSliceReducer: Reducer<IWorkspacePermissionsState> = permissionsSlice.reducer;
