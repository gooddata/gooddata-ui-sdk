// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "./userState";
import { IUser } from "@gooddata/sdk-backend-spi";

type UserReducers<A extends Action> = CaseReducer<UserState, A>;

const setUser: UserReducers<PayloadAction<IUser>> = (state, action) => {
    state.user = action.payload;
};

export const userReducers = {
    setUser,
};
