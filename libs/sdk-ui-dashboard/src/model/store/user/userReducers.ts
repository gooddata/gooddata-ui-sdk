// (C) 2021-2025 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import { IUser } from "@gooddata/sdk-model";

import { UserState } from "./userState.js";

type UserReducers<A extends Action> = CaseReducer<UserState, A>;

const setUser: UserReducers<PayloadAction<IUser>> = (state, action) => {
    state.user = action.payload;
};

export const userReducers = {
    setUser,
};
