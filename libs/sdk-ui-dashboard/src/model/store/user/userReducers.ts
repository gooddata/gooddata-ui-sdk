// (C) 2021-2025 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IUser } from "@gooddata/sdk-model";

import { type UserState } from "./userState.js";

type UserReducers<A extends Action> = CaseReducer<UserState, A>;

const setUser: UserReducers<PayloadAction<IUser>> = (state, action) => {
    state.user = action.payload;
};

export const userReducers = {
    setUser,
};
