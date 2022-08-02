// (C) 2021-2022 GoodData Corporation
import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { IWidgetPlaceholderSpec, PlaceholdersState } from "./placeholdersState";

type PlaceholdersReducer<A extends Action = AnyAction> = CaseReducer<PlaceholdersState, A>;

const setWidgetPlaceholder: PlaceholdersReducer<PayloadAction<IWidgetPlaceholderSpec>> = (state, action) => {
    state.widgetPlaceholder = action.payload;
};

const clearWidgetPlaceholder: PlaceholdersReducer = (state) => {
    state.widgetPlaceholder = undefined;
};

export const placeholdersReducers = {
    setWidgetPlaceholder,
    clearWidgetPlaceholder,
};
