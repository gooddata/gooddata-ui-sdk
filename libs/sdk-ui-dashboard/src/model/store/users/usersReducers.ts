// (C) 2024-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IWorkspaceUser } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { UsersState } from "./usersState.js";

type UsersReducer<A extends Action> = CaseReducer<UsersState, A>;

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
