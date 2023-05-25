// (C) 2021-2022 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "./userState.js";
import { IUser } from "@gooddata/sdk-model";

type UserReducers<A extends Action> = CaseReducer<UserState, A>;

const setUser: UserReducers<PayloadAction<IUser>> = (state, action) => {
    state.user = action.payload;
};

export const userReducers = {
    setUser,
};
