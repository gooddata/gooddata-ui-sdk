// (C) 2021-2022 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { PermissionsState } from "./permissionsState.js";
import { IWorkspacePermissions } from "@gooddata/sdk-model";

type PermissionsReducers<A extends Action> = CaseReducer<PermissionsState, A>;

const setPermissions: PermissionsReducers<PayloadAction<IWorkspacePermissions>> = (state, action) => {
    state.permissions = action.payload;
};

export const permissionsReducers = {
    setPermissions,
};
