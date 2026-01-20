// (C) 2024-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IWorkspaceUser } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type IUsersState } from "./usersState.js";

type UsersReducer<A extends Action> = CaseReducer<IUsersState, A>;

const setUsers: UsersReducer<PayloadAction<IWorkspaceUser[]>> = (state, action) => {
    state.users = action.payload;
};

const setUsersLoadingStatus: UsersReducer<PayloadAction<"pending" | "loading" | "success" | "error">> = (
    state,
    action,
) => {
    state.status = action.payload;
};

const setErrorUsers: UsersReducer<PayloadAction<GoodDataSdkError>> = (state, action) => {
    state.error = action.payload;
};

export const usersReducers = {
    setUsers,
    setUsersLoadingStatus,
    setErrorUsers,
};
