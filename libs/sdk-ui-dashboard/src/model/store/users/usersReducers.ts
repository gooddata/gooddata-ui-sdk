// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { IWorkspaceUser } from "@gooddata/sdk-model";
import { UsersState } from "./usersState.js";

type UsersReducer<A extends Action> = CaseReducer<UsersState, A>;

const setUsers: UsersReducer<PayloadAction<IWorkspaceUser[]>> = (state, action) => {
    state.users = action.payload;
};

export const usersReducers = {
    setUsers,
};
