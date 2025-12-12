// (C) 2021-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { type PermissionsState } from "./permissionsState.js";

type PermissionsReducers<A extends Action> = CaseReducer<PermissionsState, A>;

const setPermissions: PermissionsReducers<PayloadAction<IWorkspacePermissions>> = (state, action) => {
    state.permissions = action.payload;
};

export const permissionsReducers = {
    setPermissions,
};
