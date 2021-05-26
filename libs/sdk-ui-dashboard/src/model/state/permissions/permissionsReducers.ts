// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { PermissionsState } from "./permissionsState";
import { IWorkspacePermissions } from "@gooddata/sdk-backend-spi";

type PermissionsReducers<A extends Action> = CaseReducer<PermissionsState, A>;

const setPermissions: PermissionsReducers<PayloadAction<IWorkspacePermissions>> = (state, action) => {
    state.permissions = action.payload;
};

export const permissionsReducers = {
    setPermissions,
};
