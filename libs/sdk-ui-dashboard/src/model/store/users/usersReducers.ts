// (C) 2024 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Users } from "../../types/commonTypes.js";
import { UsersState } from "./usersState.js";

type UsersReducer<A extends Action> = CaseReducer<UsersState, A>;

const setUsers: UsersReducer<PayloadAction<Users>> = (state, action) => {
    state.users = action.payload;
};

export const usersReducers = {
    setUsers,
};
