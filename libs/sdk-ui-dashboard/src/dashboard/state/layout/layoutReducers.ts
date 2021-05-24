// (C) 2021 GoodData Corporation
import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LayoutState } from "./layoutState";

type LayoutReducer<A extends Action> = CaseReducer<LayoutState, A>;

const setLayout: LayoutReducer<PayloadAction<any>> = (state, action) => {
    state.layout = action.payload;
};

export const layoutReducers = {
    setLayout,
};
