// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IWorkspacePermissions } from "@gooddata/sdk-model";

import { PermissionsState } from "./permissionsState.js";

type PermissionsReducers<A extends Action> = CaseReducer<PermissionsState, A>;

const setPermissions: PermissionsReducers<PayloadAction<IWorkspacePermissions>> = (state, action) => {
    state.permissions = action.payload;
};

export const permissionsReducers = {
    setPermissions,
};
